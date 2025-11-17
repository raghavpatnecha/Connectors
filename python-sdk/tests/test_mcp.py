"""Tests for MCPRegistry."""

import pytest
import respx
import httpx
from connectors import Connectors
from connectors.types import (
    MCPDeploymentConfig,
    MCPSource,
    MCPSourceType,
    WaitOptions,
    DeploymentStatusType,
)
from connectors.errors import DeploymentTimeoutError, DeploymentFailedError


@pytest.fixture
def connectors() -> Connectors:
    return Connectors(base_url="http://localhost:3000", tenant_id="test-tenant")


class TestMCPServer:
    """Test MCPServer functionality."""

    @pytest.mark.asyncio
    @respx.mock
    async def test_call_tool(self, connectors: Connectors) -> None:
        """Test calling a tool on MCP server."""
        route = respx.post("http://localhost:3000/api/v1/tools/invoke").mock(
            return_value=httpx.Response(
                200, json={"success": True, "data": {"message_id": "msg-123"}}
            )
        )

        github = connectors.mcp.get("github")
        result = await github.call(
            "createPullRequest",
            {"repo": "owner/repo", "title": "Test", "head": "feature", "base": "main"},
        )

        assert route.called
        assert result["success"] is True
        assert result["data"]["message_id"] == "msg-123"

    @pytest.mark.asyncio
    @respx.mock
    async def test_list_tools(self, connectors: Connectors) -> None:
        """Test listing tools for MCP server."""
        route = respx.get("http://localhost:3000/api/v1/tools/list").mock(
            return_value=httpx.Response(
                200,
                json={
                    "tools": [
                        {
                            "toolId": "github.createPullRequest",
                            "name": "Create Pull Request",
                            "description": "Create a PR",
                            "integration": "github",
                            "category": "code",
                        }
                    ]
                },
            )
        )

        github = connectors.mcp.get("github")
        tools = await github.list_tools()

        assert route.called
        assert len(tools) == 1
        assert tools[0].tool_id == "github.createPullRequest"


class TestMCPRegistry:
    """Test MCPRegistry functionality."""

    @pytest.mark.asyncio
    @respx.mock
    async def test_list_integrations(self, connectors: Connectors) -> None:
        """Test listing MCP integrations."""
        route = respx.get("http://localhost:3000/api/v1/mcp/integrations").mock(
            return_value=httpx.Response(
                200,
                json={
                    "integrations": [
                        {
                            "name": "github",
                            "category": "code",
                            "description": "GitHub integration",
                            "toolCount": 50,
                            "version": "1.0.0",
                            "custom": False,
                        },
                        {
                            "name": "slack",
                            "category": "communication",
                            "description": "Slack integration",
                            "toolCount": 30,
                            "custom": False,
                        },
                    ]
                },
            )
        )

        integrations = await connectors.mcp.list()

        assert route.called
        assert len(integrations) == 2
        assert integrations[0].name == "github"
        assert integrations[0].tool_count == 50
        assert integrations[1].name == "slack"

    @pytest.mark.asyncio
    @respx.mock
    async def test_add_deployment_openapi(self, connectors: Connectors) -> None:
        """Test deploying custom MCP server from OpenAPI."""
        route = respx.post("http://localhost:3000/api/v1/mcp/add").mock(
            return_value=httpx.Response(
                200,
                json={
                    "deploymentId": "dep-123",
                    "name": "custom-api",
                    "status": "pending",
                    "estimatedTime": 60000,
                },
            )
        )

        config = MCPDeploymentConfig(
            name="custom-api",
            source=MCPSource(
                type=MCPSourceType.OPENAPI,
                url="https://api.example.com/openapi.json",
            ),
            category="custom",
            description="Custom API integration",
        )

        deployment = await connectors.mcp.add(config)

        assert route.called
        assert deployment.deployment_id == "dep-123"
        assert deployment.name == "custom-api"
        assert deployment.status == DeploymentStatusType.PENDING

    @pytest.mark.asyncio
    @respx.mock
    async def test_add_deployment_docker(self, connectors: Connectors) -> None:
        """Test deploying custom MCP server from Docker."""
        route = respx.post("http://localhost:3000/api/v1/mcp/add").mock(
            return_value=httpx.Response(
                200,
                json={
                    "deploymentId": "dep-456",
                    "name": "custom-docker",
                    "status": "building",
                },
            )
        )

        config = MCPDeploymentConfig(
            name="custom-docker",
            source=MCPSource(
                type=MCPSourceType.DOCKER, image="myregistry/mcp-server:latest"
            ),
            category="custom",
        )

        deployment = await connectors.mcp.add(config)

        assert route.called
        assert deployment.deployment_id == "dep-456"

    @pytest.mark.asyncio
    @respx.mock
    async def test_remove_deployment(self, connectors: Connectors) -> None:
        """Test removing custom MCP server."""
        route = respx.delete(
            "http://localhost:3000/api/v1/mcp/custom/custom-api"
        ).mock(return_value=httpx.Response(200, json={"deleted": True}))

        await connectors.mcp.remove("custom-api")

        assert route.called

    @pytest.mark.asyncio
    @respx.mock
    async def test_get_deployment_status(self, connectors: Connectors) -> None:
        """Test getting deployment status."""
        route = respx.get(
            "http://localhost:3000/api/v1/mcp/deployments/dep-123"
        ).mock(
            return_value=httpx.Response(
                200,
                json={
                    "deploymentId": "dep-123",
                    "name": "custom-api",
                    "status": "deploying",
                    "progress": 75,
                    "message": "Deploying to Kubernetes",
                },
            )
        )

        status = await connectors.mcp.get_deployment_status("dep-123")

        assert route.called
        assert status.deployment_id == "dep-123"
        assert status.status == DeploymentStatusType.DEPLOYING
        assert status.progress == 75

    @pytest.mark.asyncio
    @respx.mock
    async def test_wait_for_deployment_success(self, connectors: Connectors) -> None:
        """Test waiting for deployment to complete successfully."""
        # First call: deploying, second call: running
        route = respx.get(
            "http://localhost:3000/api/v1/mcp/deployments/dep-123"
        ).mock(
            side_effect=[
                httpx.Response(
                    200,
                    json={
                        "deploymentId": "dep-123",
                        "name": "custom-api",
                        "status": "deploying",
                        "progress": 50,
                    },
                ),
                httpx.Response(
                    200,
                    json={
                        "deploymentId": "dep-123",
                        "name": "custom-api",
                        "status": "running",
                        "progress": 100,
                    },
                ),
            ]
        )

        status = await connectors.mcp.wait_for_deployment(
            "dep-123", options=WaitOptions(timeout=10000, poll_interval=100)
        )

        assert route.call_count == 2
        assert status.status == DeploymentStatusType.RUNNING

    @pytest.mark.asyncio
    @respx.mock
    async def test_wait_for_deployment_failure(self, connectors: Connectors) -> None:
        """Test waiting for deployment that fails."""
        route = respx.get(
            "http://localhost:3000/api/v1/mcp/deployments/dep-123"
        ).mock(
            return_value=httpx.Response(
                200,
                json={
                    "deploymentId": "dep-123",
                    "name": "custom-api",
                    "status": "failed",
                    "error": "Build failed: Invalid OpenAPI spec",
                },
            )
        )

        with pytest.raises(DeploymentFailedError) as exc_info:
            await connectors.mcp.wait_for_deployment("dep-123")

        assert route.called
        assert exc_info.value.deployment_id == "dep-123"
        assert "Build failed" in str(exc_info.value)

    @pytest.mark.asyncio
    @respx.mock
    async def test_wait_for_deployment_timeout(self, connectors: Connectors) -> None:
        """Test waiting for deployment times out."""
        route = respx.get(
            "http://localhost:3000/api/v1/mcp/deployments/dep-123"
        ).mock(
            return_value=httpx.Response(
                200,
                json={
                    "deploymentId": "dep-123",
                    "name": "custom-api",
                    "status": "building",
                    "progress": 25,
                },
            )
        )

        with pytest.raises(DeploymentTimeoutError) as exc_info:
            await connectors.mcp.wait_for_deployment(
                "dep-123", options=WaitOptions(timeout=500, poll_interval=100)
            )

        assert route.called
        assert exc_info.value.deployment_id == "dep-123"
        assert exc_info.value.timeout == 500

    @pytest.mark.asyncio
    @respx.mock
    async def test_deployment_wait_until_ready(self, connectors: Connectors) -> None:
        """Test MCPDeploymentClass.wait_until_ready()."""
        # Mock deployment creation
        respx.post("http://localhost:3000/api/v1/mcp/add").mock(
            return_value=httpx.Response(
                200,
                json={
                    "deploymentId": "dep-123",
                    "name": "custom-api",
                    "status": "pending",
                },
            )
        )

        # Mock status checks (need 3 calls: wait_for_deployment polling + final refresh)
        respx.get("http://localhost:3000/api/v1/mcp/deployments/dep-123").mock(
            side_effect=[
                httpx.Response(
                    200,
                    json={
                        "deploymentId": "dep-123",
                        "name": "custom-api",
                        "status": "building",
                    },
                ),
                httpx.Response(
                    200,
                    json={
                        "deploymentId": "dep-123",
                        "name": "custom-api",
                        "status": "running",
                    },
                ),
                httpx.Response(
                    200,
                    json={
                        "deploymentId": "dep-123",
                        "name": "custom-api",
                        "status": "running",
                    },
                ),
            ]
        )

        config = MCPDeploymentConfig(
            name="custom-api",
            source=MCPSource(
                type=MCPSourceType.OPENAPI,
                url="https://api.example.com/openapi.json",
            ),
            category="custom",
        )

        deployment = await connectors.mcp.add(config)
        await deployment.wait_until_ready(
            options=WaitOptions(timeout=10000, poll_interval=100)
        )

        assert deployment.status == DeploymentStatusType.RUNNING

    @pytest.mark.asyncio
    @respx.mock
    async def test_wait_for_deployment_with_progress_callback(
        self, connectors: Connectors
    ) -> None:
        """Test deployment wait with progress callback."""
        progress_updates = []

        def on_progress(status):  # type: ignore
            progress_updates.append(status.progress)

        respx.get("http://localhost:3000/api/v1/mcp/deployments/dep-123").mock(
            side_effect=[
                httpx.Response(
                    200,
                    json={
                        "deploymentId": "dep-123",
                        "name": "custom-api",
                        "status": "building",
                        "progress": 30,
                    },
                ),
                httpx.Response(
                    200,
                    json={
                        "deploymentId": "dep-123",
                        "name": "custom-api",
                        "status": "deploying",
                        "progress": 70,
                    },
                ),
                httpx.Response(
                    200,
                    json={
                        "deploymentId": "dep-123",
                        "name": "custom-api",
                        "status": "running",
                        "progress": 100,
                    },
                ),
            ]
        )

        await connectors.mcp.wait_for_deployment(
            "dep-123",
            options=WaitOptions(
                timeout=10000, poll_interval=100, on_progress=on_progress
            ),
        )

        assert progress_updates == [30, 70, 100]
