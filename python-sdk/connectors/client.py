"""Main Connectors SDK client."""

from typing import Optional, Dict
from .http_client import HTTPClient
from .tools import ToolsAPI
from .mcp import MCPRegistry
from .types import ConnectorsConfig, HealthStatus
from .validators import validate_config


class Connectors:
    """
    Main Connectors SDK client.

    Provides access to semantic tool selection and MCP registry management.

    Example:
        >>> connectors = Connectors(
        ...     base_url="http://localhost:3000",
        ...     tenant_id="my-company",
        ...     api_key="your-api-key"
        ... )
        >>> tools = await connectors.tools.select("create a GitHub pull request")
        >>> print(f"Selected {len(tools)} tools")
    """

    def __init__(
        self,
        base_url: str,
        tenant_id: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: int = 120000,
        max_retries: int = 3,
        headers: Optional[Dict[str, str]] = None,
    ) -> None:
        """
        Initialize Connectors client.

        Args:
            base_url: Gateway base URL (e.g., "http://localhost:3000")
            tenant_id: Optional tenant identifier for multi-tenancy
            api_key: Optional API key for authentication
            timeout: Request timeout in milliseconds (default: 120000)
            max_retries: Maximum retry attempts for failed requests (default: 3)
            headers: Optional custom headers

        Raises:
            ValidationError: If configuration is invalid
        """
        config = ConnectorsConfig(
            base_url=base_url,
            tenant_id=tenant_id,
            api_key=api_key,
            timeout=timeout,
            max_retries=max_retries,
            headers=headers or {},
        )
        validate_config(config)

        self._config = config
        self._http_client = HTTPClient(config)
        self._tools_api: Optional[ToolsAPI] = None
        self._mcp_registry: Optional[MCPRegistry] = None

    @property
    def tools(self) -> ToolsAPI:
        """
        Get ToolsAPI instance for semantic tool selection.

        Returns:
            ToolsAPI instance
        """
        if self._tools_api is None:
            self._tools_api = ToolsAPI(self._http_client, self._config)
        return self._tools_api

    @property
    def mcp(self) -> MCPRegistry:
        """
        Get MCPRegistry instance for MCP server management.

        Returns:
            MCPRegistry instance
        """
        if self._mcp_registry is None:
            self._mcp_registry = MCPRegistry(self._http_client, self._config)
        return self._mcp_registry

    async def health(self) -> HealthStatus:
        """
        Check gateway health status.

        Returns:
            HealthStatus with status, version, and component health

        Raises:
            HTTPError: If health check fails
        """
        return await self._http_client.get("/health", HealthStatus)

    async def test_connection(self) -> bool:
        """
        Test connection to gateway.

        Returns:
            True if connection successful, False otherwise
        """
        try:
            await self.health()
            return True
        except Exception:
            return False
