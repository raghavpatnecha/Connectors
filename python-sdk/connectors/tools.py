"""ToolsAPI for semantic tool selection and invocation."""

from typing import List, Optional, Dict, Any
from .http_client import HTTPClient
from .types import (
    ConnectorsConfig,
    Tool,
    ToolSelectionOptions,
    ToolListFilters,
    InvokeOptions,
    ToolInvocationResponse,
)
from .validators import validate_non_empty_string, validate_positive_number


class ToolsAPI:
    """
    API for semantic tool selection and invocation.

    Uses FAISS semantic search + GraphRAG for intelligent tool discovery.
    """

    def __init__(self, http_client: HTTPClient, config: ConnectorsConfig) -> None:
        """Initialize ToolsAPI."""
        self._http = http_client
        self._config = config

    async def select(
        self, query: str, options: Optional[ToolSelectionOptions] = None
    ) -> List[Tool]:
        """
        Semantically select tools using FAISS + GraphRAG.

        Implements two-level retrieval (category → tools) for 95% token reduction.

        Args:
            query: Natural language query (e.g., "create a GitHub PR")
            options: Selection options (maxTools, categories, tokenBudget)

        Returns:
            List of selected tools ranked by relevance

        Raises:
            ValidationError: If query is empty or options are invalid
            HTTPError: If request fails

        Example:
            >>> tools = await connectors.tools.select(
            ...     "create a pull request",
            ...     options=ToolSelectionOptions(max_tools=3, categories=["code"])
            ... )
        """
        validate_non_empty_string(query, "query")
        opts = options or ToolSelectionOptions()

        if opts.max_tools is not None:
            validate_positive_number(opts.max_tools, "maxTools")
        if opts.token_budget is not None:
            validate_positive_number(opts.token_budget, "tokenBudget")

        request_body: Dict[str, Any] = {
            "query": query.strip(),
        }

        if opts.max_tools is not None:
            request_body["maxTools"] = opts.max_tools
        if opts.categories is not None:
            request_body["categories"] = opts.categories
        if opts.token_budget is not None:
            request_body["tokenBudget"] = opts.token_budget

        response = await self._http.post("/api/v1/tools/select", request_body, dict)
        return [Tool.model_validate(tool) for tool in response.get("tools", [])]

    async def list(self, filters: Optional[ToolListFilters] = None) -> List[Tool]:
        """
        List available tools with optional filters.

        Args:
            filters: Filters for category, integration, search, pagination

        Returns:
            List of tools matching filters

        Raises:
            HTTPError: If request fails

        Example:
            >>> tools = await connectors.tools.list(
            ...     filters=ToolListFilters(category="code", integration="github")
            ... )
        """
        filters = filters or ToolListFilters()

        params: Dict[str, Any] = {}
        if filters.category:
            params["category"] = filters.category
        if filters.integration:
            params["integration"] = filters.integration
        if filters.search:
            params["search"] = filters.search
        if filters.page is not None:
            params["page"] = filters.page
        if filters.limit is not None:
            params["limit"] = filters.limit

        # Build path with query params
        path = "/api/v1/tools/list"
        response = await self._http.request("GET", path, dict, params=params)
        return [Tool.model_validate(tool) for tool in response.get("tools", [])]

    async def invoke(
        self,
        tool_id: str,
        parameters: Dict[str, Any],
        options: Optional[InvokeOptions] = None,
    ) -> ToolInvocationResponse:
        """
        Execute a tool with given parameters.

        OAuth credentials are automatically injected by the gateway.

        Args:
            tool_id: Tool identifier (e.g., "github.createPullRequest")
            parameters: Tool-specific parameters
            options: Invocation options (tenant_id, integration)

        Returns:
            ToolInvocationResponse with success status and data/error

        Raises:
            ValidationError: If tool_id is invalid
            HTTPError: If invocation fails

        Example:
            >>> result = await connectors.tools.invoke(
            ...     tool_id="github.createPullRequest",
            ...     parameters={
            ...         "repo": "owner/repo",
            ...         "title": "New feature",
            ...         "head": "feature",
            ...         "base": "main"
            ...     }
            ... )
            >>> if result.success:
            ...     print(f"PR created: {result.data}")
        """
        validate_non_empty_string(tool_id, "toolId")

        # Extract integration from toolId (e.g., "github.createPR" -> "github")
        if "." not in tool_id:
            raise ValueError(
                f"toolId must contain integration prefix (e.g., 'github.createPR'), got: {tool_id}"
            )

        integration = tool_id.split(".")[0]
        opts = options or InvokeOptions()

        request_body: Dict[str, Any] = {
            "toolId": tool_id.strip(),
            "integration": opts.integration or integration,
            "tenantId": opts.tenant_id or self._config.tenant_id,
            "parameters": parameters,
        }

        response = await self._http.post("/api/v1/tools/invoke", request_body, dict)
        return ToolInvocationResponse.model_validate(response)
