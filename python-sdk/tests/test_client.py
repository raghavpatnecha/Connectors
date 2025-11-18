"""Tests for Connectors client."""

import pytest
import respx
import httpx
from connectors import Connectors
from connectors.errors import ValidationError, HTTPError


@pytest.fixture
def base_url() -> str:
    return "http://localhost:3000"


@pytest.fixture
def connectors(base_url: str) -> Connectors:
    return Connectors(base_url=base_url, tenant_id="test-tenant", api_key="test-key")


class TestConnectorsClient:
    """Test Connectors client initialization and configuration."""

    def test_initialization(self, base_url: str) -> None:
        """Test successful client initialization."""
        client = Connectors(
            base_url=base_url,
            tenant_id="test-tenant",
            api_key="test-key",
            timeout=60000,
            max_retries=5,
        )

        assert client._config.base_url == base_url
        assert client._config.tenant_id == "test-tenant"
        assert client._config.api_key == "test-key"
        assert client._config.timeout == 60000
        assert client._config.max_retries == 5

    def test_initialization_with_defaults(self, base_url: str) -> None:
        """Test initialization with default values."""
        client = Connectors(base_url=base_url)

        assert client._config.base_url == base_url
        assert client._config.tenant_id is None
        assert client._config.api_key is None
        assert client._config.timeout == 120000
        assert client._config.max_retries == 3

    def test_initialization_empty_base_url(self) -> None:
        """Test initialization fails with empty base URL."""
        with pytest.raises(ValidationError) as exc_info:
            Connectors(base_url="")

        assert "base_url cannot be empty" in str(exc_info.value)

    def test_initialization_invalid_timeout(self, base_url: str) -> None:
        """Test initialization fails with invalid timeout."""
        with pytest.raises(ValidationError) as exc_info:
            Connectors(base_url=base_url, timeout=-1)

        assert "timeout must be positive" in str(exc_info.value)

    def test_initialization_invalid_max_retries(self, base_url: str) -> None:
        """Test initialization fails with invalid max_retries."""
        with pytest.raises(ValidationError) as exc_info:
            Connectors(base_url=base_url, max_retries=-1)

        assert "max_retries must be a non-negative integer" in str(exc_info.value)

    def test_tools_property(self, connectors: Connectors) -> None:
        """Test tools property returns ToolsAPI instance."""
        tools = connectors.tools
        assert tools is not None
        # Subsequent calls should return same instance
        assert connectors.tools is tools

    def test_mcp_property(self, connectors: Connectors) -> None:
        """Test mcp property returns MCPRegistry instance."""
        mcp = connectors.mcp
        assert mcp is not None
        # Subsequent calls should return same instance
        assert connectors.mcp is mcp

    @pytest.mark.asyncio
    @respx.mock
    async def test_health_check_success(self, connectors: Connectors) -> None:
        """Test successful health check."""
        route = respx.get("http://localhost:3000/health").mock(
            return_value=httpx.Response(
                200,
                json={
                    "status": "healthy",
                    "version": "1.0.0",
                    "uptime": 123456,
                    "components": {"database": "healthy", "vault": "healthy"},
                },
            )
        )

        health = await connectors.health()

        assert route.called
        assert health.status == "healthy"
        assert health.version == "1.0.0"
        assert health.uptime == 123456

    @pytest.mark.asyncio
    @respx.mock
    async def test_health_check_failure(self, connectors: Connectors) -> None:
        """Test health check with server error."""
        respx.get("http://localhost:3000/health").mock(
            return_value=httpx.Response(500, text="Internal Server Error")
        )

        with pytest.raises(HTTPError) as exc_info:
            await connectors.health()

        assert exc_info.value.status_code == 500

    @pytest.mark.asyncio
    @respx.mock
    async def test_test_connection_success(self, connectors: Connectors) -> None:
        """Test successful connection test."""
        respx.get("http://localhost:3000/health").mock(
            return_value=httpx.Response(200, json={"status": "healthy"})
        )

        result = await connectors.test_connection()

        assert result is True

    @pytest.mark.asyncio
    @respx.mock
    async def test_test_connection_failure(self, connectors: Connectors) -> None:
        """Test connection test with failure."""
        respx.get("http://localhost:3000/health").mock(
            return_value=httpx.Response(500, text="Error")
        )

        result = await connectors.test_connection()

        assert result is False

    @pytest.mark.asyncio
    @respx.mock
    async def test_test_connection_timeout(self, connectors: Connectors) -> None:
        """Test connection test with timeout."""
        respx.get("http://localhost:3000/health").mock(side_effect=httpx.TimeoutException)

        result = await connectors.test_connection()

        assert result is False

    def test_custom_headers(self, base_url: str) -> None:
        """Test custom headers are set correctly."""
        client = Connectors(
            base_url=base_url, headers={"X-Custom-Header": "custom-value"}
        )

        assert "X-Custom-Header" in client._http_client.headers
        assert client._http_client.headers["X-Custom-Header"] == "custom-value"

    def test_api_key_header(self, base_url: str) -> None:
        """Test API key is set in Authorization header."""
        client = Connectors(base_url=base_url, api_key="test-api-key")

        assert "Authorization" in client._http_client.headers
        assert client._http_client.headers["Authorization"] == "Bearer test-api-key"

    def test_tenant_id_header(self, base_url: str) -> None:
        """Test tenant ID is set in header."""
        client = Connectors(base_url=base_url, tenant_id="tenant-123")

        assert "X-Tenant-ID" in client._http_client.headers
        assert client._http_client.headers["X-Tenant-ID"] == "tenant-123"
