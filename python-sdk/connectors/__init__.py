"""Connectors SDK - Semantic MCP routing with 99% token reduction."""

from .client import Connectors
from .tools import ToolsAPI
from .mcp import MCPRegistry, MCPServer, MCPDeploymentClass
from .types import (
    ConnectorsConfig,
    Tool,
    ToolSelectionOptions,
    ToolListFilters,
    InvokeOptions,
    ToolInvocationResponse,
    MCPDeploymentConfig,
    MCPSourceType,
    MCPIntegration,
    DeploymentStatus,
    HealthStatus,
    WaitOptions,
)
from .errors import (
    ConnectorsError,
    HTTPError,
    TimeoutError,
    RetryableError,
    ValidationError,
    DeploymentTimeoutError,
    DeploymentFailedError,
)

__version__ = "0.1.0"

__all__ = [
    # Client
    "Connectors",
    "ToolsAPI",
    "MCPRegistry",
    "MCPServer",
    "MCPDeploymentClass",
    # Types
    "ConnectorsConfig",
    "Tool",
    "ToolSelectionOptions",
    "ToolListFilters",
    "InvokeOptions",
    "ToolInvocationResponse",
    "MCPDeploymentConfig",
    "MCPSourceType",
    "MCPIntegration",
    "DeploymentStatus",
    "HealthStatus",
    "WaitOptions",
    # Errors
    "ConnectorsError",
    "HTTPError",
    "TimeoutError",
    "RetryableError",
    "ValidationError",
    "DeploymentTimeoutError",
    "DeploymentFailedError",
]
