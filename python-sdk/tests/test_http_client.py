"""Tests for HTTP client."""

import pytest
import respx
import httpx
from connectors.http_client import HTTPClient
from connectors.types import ConnectorsConfig
from connectors.errors import HTTPError, TimeoutError, RetryableError


@pytest.fixture
def config() -> ConnectorsConfig:
    return ConnectorsConfig(
        base_url="http://localhost:3000",
        tenant_id="test-tenant",
        api_key="test-key",
        timeout=5000,
        max_retries=2,
    )


@pytest.fixture
def http_client(config: ConnectorsConfig) -> HTTPClient:
    return HTTPClient(config)


class TestHTTPClient:
    """Test HTTP client functionality."""

    def test_initialization(self, config: ConnectorsConfig) -> None:
        """Test HTTP client initialization."""
        client = HTTPClient(config)

        assert client.base_url == "http://localhost:3000"
        assert client.timeout == 5.0  # Converted to seconds
        assert client.max_retries == 2
        assert "Authorization" in client.headers
        assert "X-Tenant-ID" in client.headers

    @pytest.mark.asyncio
    @respx.mock
    async def test_get_request(self, http_client: HTTPClient) -> None:
        """Test GET request."""
        route = respx.get("http://localhost:3000/api/test").mock(
            return_value=httpx.Response(200, json={"result": "success"})
        )

        result = await http_client.get("/api/test", dict)

        assert route.called
        assert result == {"result": "success"}

    @pytest.mark.asyncio
    @respx.mock
    async def test_post_request(self, http_client: HTTPClient) -> None:
        """Test POST request."""
        route = respx.post("http://localhost:3000/api/test").mock(
            return_value=httpx.Response(200, json={"id": "123"})
        )

        result = await http_client.post("/api/test", {"data": "value"}, dict)

        assert route.called
        assert result == {"id": "123"}

    @pytest.mark.asyncio
    @respx.mock
    async def test_delete_request(self, http_client: HTTPClient) -> None:
        """Test DELETE request."""
        route = respx.delete("http://localhost:3000/api/test/123").mock(
            return_value=httpx.Response(200, json={"deleted": True})
        )

        result = await http_client.delete("/api/test/123", dict)

        assert route.called
        assert result == {"deleted": True}

    @pytest.mark.asyncio
    @respx.mock
    async def test_http_error_400(self, http_client: HTTPClient) -> None:
        """Test 400 error raises HTTPError immediately."""
        respx.get("http://localhost:3000/api/test").mock(
            return_value=httpx.Response(400, text="Bad Request")
        )

        with pytest.raises(HTTPError) as exc_info:
            await http_client.get("/api/test", dict)

        assert exc_info.value.status_code == 400
        assert "Bad Request" in exc_info.value.message

    @pytest.mark.asyncio
    @respx.mock
    async def test_http_error_404(self, http_client: HTTPClient) -> None:
        """Test 404 error raises HTTPError immediately."""
        respx.get("http://localhost:3000/api/test").mock(
            return_value=httpx.Response(404, text="Not Found")
        )

        with pytest.raises(HTTPError) as exc_info:
            await http_client.get("/api/test", dict)

        assert exc_info.value.status_code == 404

    @pytest.mark.asyncio
    @respx.mock
    async def test_retry_on_500(self, http_client: HTTPClient) -> None:
        """Test retry logic on 500 error."""
        route = respx.get("http://localhost:3000/api/test").mock(
            side_effect=[
                httpx.Response(500, text="Server Error"),
                httpx.Response(500, text="Server Error"),
                httpx.Response(200, json={"result": "success"}),
            ]
        )

        result = await http_client.get("/api/test", dict)

        assert route.call_count == 3
        assert result == {"result": "success"}

    @pytest.mark.asyncio
    @respx.mock
    async def test_retry_exhausted_on_500(self, http_client: HTTPClient) -> None:
        """Test retry exhaustion on persistent 500 errors."""
        route = respx.get("http://localhost:3000/api/test").mock(
            return_value=httpx.Response(500, text="Server Error")
        )

        with pytest.raises(HTTPError) as exc_info:
            await http_client.get("/api/test", dict)

        # max_retries=2 means 3 total attempts
        assert route.call_count == 3
        assert exc_info.value.status_code == 500

    @pytest.mark.asyncio
    @respx.mock
    async def test_retry_on_429_rate_limit(self, http_client: HTTPClient) -> None:
        """Test retry on rate limit error."""
        route = respx.get("http://localhost:3000/api/test").mock(
            side_effect=[
                httpx.Response(429, text="Rate Limited"),
                httpx.Response(200, json={"result": "success"}),
            ]
        )

        result = await http_client.get("/api/test", dict)

        assert route.call_count == 2
        assert result == {"result": "success"}

    @pytest.mark.asyncio
    @respx.mock
    async def test_retry_on_503_service_unavailable(
        self, http_client: HTTPClient
    ) -> None:
        """Test retry on service unavailable."""
        route = respx.get("http://localhost:3000/api/test").mock(
            side_effect=[
                httpx.Response(503, text="Service Unavailable"),
                httpx.Response(200, json={"result": "success"}),
            ]
        )

        result = await http_client.get("/api/test", dict)

        assert route.call_count == 2
        assert result == {"result": "success"}

    @pytest.mark.asyncio
    @respx.mock
    async def test_timeout_error(self, http_client: HTTPClient) -> None:
        """Test timeout raises TimeoutError."""
        route = respx.get("http://localhost:3000/api/test").mock(
            side_effect=httpx.TimeoutException
        )

        with pytest.raises(TimeoutError):
            await http_client.get("/api/test", dict)

        # Should retry on timeout
        assert route.call_count == 3

    @pytest.mark.asyncio
    @respx.mock
    async def test_network_error(self, http_client: HTTPClient) -> None:
        """Test network error raises RetryableError."""
        route = respx.get("http://localhost:3000/api/test").mock(
            side_effect=httpx.ConnectError
        )

        with pytest.raises(RetryableError):
            await http_client.get("/api/test", dict)

        # Should retry on network error
        assert route.call_count == 3

    @pytest.mark.asyncio
    @respx.mock
    async def test_backoff_calculation(self, http_client: HTTPClient) -> None:
        """Test exponential backoff calculation."""
        # Test backoff values are within expected range
        backoff_0 = http_client._calculate_backoff(0)
        backoff_1 = http_client._calculate_backoff(1)
        backoff_2 = http_client._calculate_backoff(2)

        # Attempt 0: 1.0 * 2^0 + jitter = [1.0, 2.0]
        assert 1.0 <= backoff_0 <= 2.0

        # Attempt 1: 1.0 * 2^1 + jitter = [2.0, 3.0]
        assert 2.0 <= backoff_1 <= 3.0

        # Attempt 2: 1.0 * 2^2 + jitter = [4.0, 5.0]
        assert 4.0 <= backoff_2 <= 5.0

    @pytest.mark.asyncio
    @respx.mock
    async def test_backoff_max_cap(self, http_client: HTTPClient) -> None:
        """Test backoff is capped at 30 seconds."""
        backoff_10 = http_client._calculate_backoff(10)

        # Should be capped at 30.0
        assert backoff_10 <= 30.0

    @pytest.mark.asyncio
    @respx.mock
    async def test_headers_included(self, http_client: HTTPClient) -> None:
        """Test custom headers are included in request."""

        def check_headers(request: httpx.Request) -> httpx.Response:
            assert request.headers["Authorization"] == "Bearer test-key"
            assert request.headers["X-Tenant-ID"] == "test-tenant"
            assert request.headers["Content-Type"] == "application/json"
            return httpx.Response(200, json={"result": "success"})

        respx.get("http://localhost:3000/api/test").mock(side_effect=check_headers)

        await http_client.get("/api/test", dict)

    @pytest.mark.asyncio
    @respx.mock
    async def test_query_parameters(self, http_client: HTTPClient) -> None:
        """Test query parameters are sent correctly."""

        def check_params(request: httpx.Request) -> httpx.Response:
            assert "param1" in str(request.url)
            assert "param2" in str(request.url)
            return httpx.Response(200, json={"result": "success"})

        respx.get("http://localhost:3000/api/test").mock(side_effect=check_params)

        await http_client.request(
            "GET", "/api/test", dict, params={"param1": "value1", "param2": "value2"}
        )
