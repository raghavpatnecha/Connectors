"""Tests for ToolsAPI."""

import pytest
import respx
import httpx
from connectors import Connectors
from connectors.types import ToolSelectionOptions, ToolListFilters
from connectors.errors import ValidationError, HTTPError


@pytest.fixture
def connectors() -> Connectors:
    return Connectors(base_url="http://localhost:3000", tenant_id="test-tenant")


class TestToolsAPI:
    """Test ToolsAPI functionality."""

    @pytest.mark.asyncio
    @respx.mock
    async def test_select_tools_success(self, connectors: Connectors) -> None:
        """Test successful tool selection."""
        route = respx.post("http://localhost:3000/api/v1/tools/select").mock(
            return_value=httpx.Response(
                200,
                json={
                    "tools": [
                        {
                            "toolId": "github.createPullRequest",
                            "name": "Create Pull Request",
                            "description": "Create a new pull request",
                            "integration": "github",
                            "category": "code",
                            "tokenCost": 150,
                        },
                        {
                            "toolId": "github.mergePullRequest",
                            "name": "Merge Pull Request",
                            "description": "Merge an existing pull request",
                            "integration": "github",
                            "category": "code",
                            "tokenCost": 120,
                        },
                    ]
                },
            )
        )

        tools = await connectors.tools.select("create a pull request")

        assert route.called
        assert len(tools) == 2
        assert tools[0].tool_id == "github.createPullRequest"
        assert tools[0].name == "Create Pull Request"
        assert tools[0].category == "code"
        assert tools[0].token_cost == 150

    @pytest.mark.asyncio
    @respx.mock
    async def test_select_tools_with_options(self, connectors: Connectors) -> None:
        """Test tool selection with options."""
        route = respx.post("http://localhost:3000/api/v1/tools/select").mock(
            return_value=httpx.Response(200, json={"tools": []})
        )

        options = ToolSelectionOptions(
            max_tools=3, categories=["code", "communication"], token_budget=1000
        )

        await connectors.tools.select("create a PR", options=options)

        assert route.called
        request_json = route.calls[0].request.content
        assert b"maxTools" in request_json
        assert b"categories" in request_json
        assert b"tokenBudget" in request_json

    @pytest.mark.asyncio
    async def test_select_tools_empty_query(self, connectors: Connectors) -> None:
        """Test tool selection fails with empty query."""
        with pytest.raises(ValidationError) as exc_info:
            await connectors.tools.select("")

        assert "query cannot be empty" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_select_tools_invalid_max_tools(
        self, connectors: Connectors
    ) -> None:
        """Test tool selection fails with invalid maxTools."""
        options = ToolSelectionOptions(max_tools=-1)

        with pytest.raises(ValidationError) as exc_info:
            await connectors.tools.select("test query", options=options)

        assert "maxTools must be positive" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_select_tools_invalid_token_budget(
        self, connectors: Connectors
    ) -> None:
        """Test tool selection fails with invalid tokenBudget."""
        options = ToolSelectionOptions(token_budget=-100)

        with pytest.raises(ValidationError) as exc_info:
            await connectors.tools.select("test query", options=options)

        assert "tokenBudget must be positive" in str(exc_info.value)

    @pytest.mark.asyncio
    @respx.mock
    async def test_list_tools_success(self, connectors: Connectors) -> None:
        """Test successful tool listing."""
        route = respx.get("http://localhost:3000/api/v1/tools/list").mock(
            return_value=httpx.Response(
                200,
                json={
                    "tools": [
                        {
                            "toolId": "slack.sendMessage",
                            "name": "Send Message",
                            "description": "Send a message to Slack",
                            "integration": "slack",
                            "category": "communication",
                        }
                    ]
                },
            )
        )

        tools = await connectors.tools.list()

        assert route.called
        assert len(tools) == 1
        assert tools[0].tool_id == "slack.sendMessage"

    @pytest.mark.asyncio
    @respx.mock
    async def test_list_tools_with_filters(self, connectors: Connectors) -> None:
        """Test tool listing with filters."""
        route = respx.get("http://localhost:3000/api/v1/tools/list").mock(
            return_value=httpx.Response(200, json={"tools": []})
        )

        filters = ToolListFilters(
            category="code",
            integration="github",
            search="pull request",
            page=2,
            limit=25,
        )

        await connectors.tools.list(filters=filters)

        assert route.called
        request_url = str(route.calls[0].request.url)
        assert "category=code" in request_url
        assert "integration=github" in request_url
        assert "search=pull+request" in request_url
        assert "page=2" in request_url
        assert "limit=25" in request_url

    @pytest.mark.asyncio
    @respx.mock
    async def test_invoke_tool_success(self, connectors: Connectors) -> None:
        """Test successful tool invocation."""
        route = respx.post("http://localhost:3000/api/v1/tools/invoke").mock(
            return_value=httpx.Response(
                200,
                json={
                    "success": True,
                    "data": {"number": 123, "url": "https://github.com/owner/repo/pull/123"},
                    "executionTimeMs": 450,
                },
            )
        )

        result = await connectors.tools.invoke(
            tool_id="github.createPullRequest",
            parameters={
                "repo": "owner/repo",
                "title": "New feature",
                "head": "feature",
                "base": "main",
            },
        )

        assert route.called
        assert result.success is True
        assert result.data["number"] == 123
        assert result.execution_time_ms == 450

    @pytest.mark.asyncio
    @respx.mock
    async def test_invoke_tool_failure(self, connectors: Connectors) -> None:
        """Test tool invocation failure."""
        route = respx.post("http://localhost:3000/api/v1/tools/invoke").mock(
            return_value=httpx.Response(
                200,
                json={
                    "success": False,
                    "error": "Repository not found",
                    "executionTimeMs": 120,
                },
            )
        )

        result = await connectors.tools.invoke(
            tool_id="github.createPullRequest", parameters={"repo": "nonexistent/repo"}
        )

        assert route.called
        assert result.success is False
        assert result.error == "Repository not found"

    @pytest.mark.asyncio
    async def test_invoke_tool_empty_tool_id(self, connectors: Connectors) -> None:
        """Test tool invocation fails with empty tool ID."""
        with pytest.raises(ValidationError) as exc_info:
            await connectors.tools.invoke(tool_id="", parameters={})

        assert "toolId cannot be empty" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_invoke_tool_invalid_tool_id(self, connectors: Connectors) -> None:
        """Test tool invocation fails with invalid tool ID format."""
        with pytest.raises(ValueError) as exc_info:
            await connectors.tools.invoke(tool_id="invalidformat", parameters={})

        assert "must contain integration prefix" in str(exc_info.value)

    @pytest.mark.asyncio
    @respx.mock
    async def test_invoke_tool_extracts_integration(
        self, connectors: Connectors
    ) -> None:
        """Test tool invocation extracts integration from tool ID."""
        route = respx.post("http://localhost:3000/api/v1/tools/invoke").mock(
            return_value=httpx.Response(200, json={"success": True, "data": {}})
        )

        await connectors.tools.invoke(
            tool_id="github.createPullRequest", parameters={}
        )

        assert route.called
        request_json = route.calls[0].request.content
        assert b'"integration":"github"' in request_json

    @pytest.mark.asyncio
    @respx.mock
    async def test_invoke_tool_includes_tenant_id(
        self, connectors: Connectors
    ) -> None:
        """Test tool invocation includes tenant ID."""
        route = respx.post("http://localhost:3000/api/v1/tools/invoke").mock(
            return_value=httpx.Response(200, json={"success": True, "data": {}})
        )

        await connectors.tools.invoke(
            tool_id="github.createPullRequest", parameters={}
        )

        assert route.called
        request_json = route.calls[0].request.content
        assert b'"tenantId":"test-tenant"' in request_json

    @pytest.mark.asyncio
    @respx.mock
    async def test_select_tools_http_error(self, connectors: Connectors) -> None:
        """Test tool selection handles HTTP errors."""
        respx.post("http://localhost:3000/api/v1/tools/select").mock(
            return_value=httpx.Response(500, text="Internal Server Error")
        )

        with pytest.raises(HTTPError) as exc_info:
            await connectors.tools.select("test query")

        assert exc_info.value.status_code == 500
