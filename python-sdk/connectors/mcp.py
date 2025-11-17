"""MCPRegistry for MCP server management and deployment."""

from typing import List, Optional, Dict, Any, TYPE_CHECKING
import asyncio
import time
import random

from .http_client import HTTPClient
from .types import (
    ConnectorsConfig,
    MCPDeploymentConfig,
    MCPIntegration,
    DeploymentStatus,
    DeploymentStatusType,
    WaitOptions,
    Tool,
)
from .errors import DeploymentTimeoutError, DeploymentFailedError

if TYPE_CHECKING:
    from .mcp import MCPRegistry


class MCPServer:
    """
    Bound MCP server instance for direct tool calls.

    Example:
        >>> github = connectors.mcp.get("github")
        >>> result = await github.call("createPullRequest", {"repo": "owner/repo", ...})
    """

    def __init__(
        self, integration: str, http: HTTPClient, config: ConnectorsConfig
    ) -> None:
        """Initialize MCPServer."""
        self.integration = integration
        self._http = http
        self._config = config

    async def call(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call a tool on this MCP server.

        Args:
            tool_name: Tool name (without integration prefix)
            parameters: Tool parameters

        Returns:
            Tool execution result

        Raises:
            HTTPError: If call fails
        """
        tool_id = f"{self.integration}.{tool_name}"
        response = await self._http.post(
            "/api/v1/tools/invoke",
            {
                "toolId": tool_id,
                "integration": self.integration,
                "tenantId": self._config.tenant_id,
                "parameters": parameters,
            },
            dict,
        )
        return response  # type: ignore

    async def list_tools(self) -> List[Tool]:
        """
        List all tools for this integration.

        Returns:
            List of tools for this MCP server

        Raises:
            HTTPError: If request fails
        """
        response = await self._http.get(
            f"/api/v1/tools/list?integration={self.integration}", dict
        )
        return [Tool.model_validate(tool) for tool in response.get("tools", [])]


class MCPDeploymentClass:
    """
    Deployment object with status tracking and wait methods.

    Example:
        >>> deployment = await connectors.mcp.add(config)
        >>> await deployment.wait_until_ready()
        >>> print(f"Status: {deployment.status}")
    """

    def __init__(self, data: Dict[str, Any], registry: "MCPRegistry") -> None:
        """Initialize MCPDeploymentClass."""
        self.deployment_id: str = data["deploymentId"]
        self.name: str = data["name"]
        self.status: DeploymentStatusType = DeploymentStatusType(data["status"])
        self.estimated_time: Optional[int] = data.get("estimatedTime")
        self._registry = registry

    async def wait_until_ready(self, options: Optional[WaitOptions] = None) -> None:
        """
        Wait until deployment is ready.

        Args:
            options: Wait options (timeout, poll_interval, on_progress)

        Raises:
            DeploymentTimeoutError: If deployment times out
            DeploymentFailedError: If deployment fails
        """
        await self._registry.wait_for_deployment(self.deployment_id, options)
        await self.refresh()

    async def refresh(self) -> None:
        """
        Refresh deployment status from server.

        Raises:
            HTTPError: If request fails
        """
        status = await self._registry.get_deployment_status(self.deployment_id)
        self.status = status.status


class MCPRegistry:
    """
    Registry for managing MCP servers and deployments.

    Supports listing integrations, deploying custom MCP servers, and
    monitoring deployment status.
    """

    def __init__(self, http: HTTPClient, config: ConnectorsConfig) -> None:
        """Initialize MCPRegistry."""
        self._http = http
        self._config = config

    def get(self, integration: str) -> MCPServer:
        """
        Get bound MCP server instance for direct tool calls.

        Args:
            integration: Integration name (e.g., "github", "slack")

        Returns:
            MCPServer instance

        Example:
            >>> github = connectors.mcp.get("github")
            >>> pr = await github.call("createPullRequest", {...})
        """
        return MCPServer(integration, self._http, self._config)

    async def list(self) -> List[MCPIntegration]:
        """
        List all available MCP integrations.

        Returns:
            List of MCP integrations with metadata

        Raises:
            HTTPError: If request fails

        Example:
            >>> integrations = await connectors.mcp.list()
            >>> for integration in integrations:
            ...     print(f"{integration.name}: {integration.tool_count} tools")
        """
        response = await self._http.get("/api/v1/mcp/integrations", dict)
        return [
            MCPIntegration.model_validate(item)
            for item in response.get("integrations", [])
        ]

    async def add(self, config: MCPDeploymentConfig) -> MCPDeploymentClass:
        """
        Deploy custom MCP server from OpenAPI, Docker, NPM, or GitHub.

        Args:
            config: Deployment configuration

        Returns:
            MCPDeploymentClass for status tracking

        Raises:
            ValidationError: If config is invalid
            HTTPError: If deployment request fails

        Example:
            >>> deployment = await connectors.mcp.add(
            ...     MCPDeploymentConfig(
            ...         name="custom-api",
            ...         source=MCPSource(
            ...             type=MCPSourceType.OPENAPI,
            ...             url="https://api.example.com/openapi.json"
            ...         ),
            ...         category="custom"
            ...     )
            ... )
            >>> await deployment.wait_until_ready()
        """
        request_body: Dict[str, Any] = {
            "name": config.name,
            "source": config.source.model_dump(exclude_none=True),
            "category": config.category,
            "tenantId": self._config.tenant_id,
        }

        if config.description:
            request_body["description"] = config.description
        if config.oauth_config:
            request_body["oauthConfig"] = config.oauth_config

        response = await self._http.post("/api/v1/mcp/add", request_body, dict)
        return MCPDeploymentClass(response, self)

    async def remove(self, name: str) -> None:
        """
        Remove custom MCP server.

        Args:
            name: MCP server name

        Raises:
            HTTPError: If removal fails

        Example:
            >>> await connectors.mcp.remove("custom-api")
        """
        await self._http.delete(
            f"/api/v1/mcp/custom/{name}?tenantId={self._config.tenant_id}", dict
        )

    async def get_deployment_status(self, deployment_id: str) -> DeploymentStatus:
        """
        Get deployment status by ID.

        Args:
            deployment_id: Deployment identifier

        Returns:
            DeploymentStatus with current status and progress

        Raises:
            HTTPError: If request fails
        """
        response = await self._http.get(
            f"/api/v1/mcp/deployments/{deployment_id}", dict
        )
        return DeploymentStatus.model_validate(response)

    async def wait_for_deployment(
        self, deployment_id: str, options: Optional[WaitOptions] = None
    ) -> DeploymentStatus:
        """
        Poll deployment status until ready or failed.

        Uses exponential backoff with jitter for polling.

        Args:
            deployment_id: Deployment identifier
            options: Wait options (timeout, poll_interval, on_progress)

        Returns:
            Final DeploymentStatus

        Raises:
            DeploymentTimeoutError: If deployment times out
            DeploymentFailedError: If deployment fails

        Example:
            >>> status = await connectors.mcp.wait_for_deployment(
            ...     deployment_id="dep-123",
            ...     options=WaitOptions(
            ...         timeout=300000,
            ...         on_progress=lambda s: print(f"Status: {s.status}")
            ...     )
            ... )
        """
        opts = options or WaitOptions()
        timeout = opts.timeout or 300000  # 5 minutes default
        poll_interval = opts.poll_interval or 2000  # 2 seconds default

        start_time = time.time() * 1000
        current_interval = poll_interval

        while True:
            status = await self.get_deployment_status(deployment_id)

            if opts.on_progress:
                opts.on_progress(status)

            if status.status == DeploymentStatusType.RUNNING:
                return status
            elif status.status == DeploymentStatusType.FAILED:
                raise DeploymentFailedError(
                    f"Deployment {deployment_id} failed: {status.error}",
                    deployment_id=deployment_id,
                    reason=status.error,
                )

            elapsed = (time.time() * 1000) - start_time
            if elapsed >= timeout:
                raise DeploymentTimeoutError(
                    f"Deployment {deployment_id} timed out after {timeout}ms",
                    deployment_id=deployment_id,
                    timeout=timeout,
                )

            await asyncio.sleep(current_interval / 1000)
            # Exponential backoff with jitter, capped at 10 seconds
            current_interval = min(
                current_interval * 1.5 + random.uniform(0, 1000), 10000
            )
