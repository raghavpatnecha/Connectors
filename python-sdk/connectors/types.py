"""Type definitions for Connectors SDK."""

from typing import Optional, List, Dict, Any, Callable, Literal
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict


class ConnectorsConfig(BaseModel):
    """Configuration for Connectors client."""

    base_url: str
    tenant_id: Optional[str] = None
    api_key: Optional[str] = None
    timeout: int = 120000
    max_retries: int = 3
    headers: Dict[str, str] = Field(default_factory=dict)

    model_config = ConfigDict(arbitrary_types_allowed=True)


class ToolParameter(BaseModel):
    """Tool parameter definition."""

    name: str
    type: str
    description: Optional[str] = None
    required: bool = False
    default: Optional[Any] = None


class Tool(BaseModel):
    """Tool definition."""

    tool_id: str = Field(alias="toolId")
    name: str
    description: str
    integration: str
    category: str
    parameters: Optional[List[ToolParameter]] = None
    token_cost: Optional[int] = Field(None, alias="tokenCost")

    model_config = ConfigDict(populate_by_name=True)


class ToolSelectionOptions(BaseModel):
    """Options for tool selection."""

    max_tools: Optional[int] = Field(None, alias="maxTools")
    categories: Optional[List[str]] = None
    token_budget: Optional[int] = Field(None, alias="tokenBudget")

    model_config = ConfigDict(populate_by_name=True)


class ToolListFilters(BaseModel):
    """Filters for listing tools."""

    category: Optional[str] = None
    integration: Optional[str] = None
    search: Optional[str] = None
    page: Optional[int] = None
    limit: Optional[int] = None


class InvokeOptions(BaseModel):
    """Options for tool invocation."""

    tenant_id: Optional[str] = Field(None, alias="tenantId")
    integration: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class ToolInvocationResponse(BaseModel):
    """Response from tool invocation."""

    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    execution_time_ms: Optional[int] = Field(None, alias="executionTimeMs")

    model_config = ConfigDict(populate_by_name=True)


class MCPSourceType(str, Enum):
    """MCP source type."""

    OPENAPI = "openapi"
    DOCKER = "docker"
    NPM = "npm"
    GITHUB = "github"


class MCPSource(BaseModel):
    """MCP deployment source."""

    type: MCPSourceType
    url: Optional[str] = None
    image: Optional[str] = None
    package: Optional[str] = None
    repository: Optional[str] = None
    path: Optional[str] = None


class MCPDeploymentConfig(BaseModel):
    """Configuration for MCP deployment."""

    name: str
    source: MCPSource
    category: str
    description: Optional[str] = None
    oauth_config: Optional[Dict[str, Any]] = Field(None, alias="oauthConfig")

    model_config = ConfigDict(populate_by_name=True)


class DeploymentStatusType(str, Enum):
    """Deployment status types."""

    PENDING = "pending"
    BUILDING = "building"
    DEPLOYING = "deploying"
    RUNNING = "running"
    FAILED = "failed"


class DeploymentStatus(BaseModel):
    """MCP deployment status."""

    deployment_id: str = Field(alias="deploymentId")
    name: str
    status: DeploymentStatusType
    progress: Optional[int] = None
    message: Optional[str] = None
    error: Optional[str] = None
    estimated_time: Optional[int] = Field(None, alias="estimatedTime")
    started_at: Optional[str] = Field(None, alias="startedAt")
    completed_at: Optional[str] = Field(None, alias="completedAt")

    model_config = ConfigDict(populate_by_name=True)


class MCPIntegration(BaseModel):
    """MCP integration info."""

    name: str
    category: str
    description: Optional[str] = None
    tool_count: int = Field(alias="toolCount")
    version: Optional[str] = None
    custom: bool = False

    model_config = ConfigDict(populate_by_name=True)


class HealthStatus(BaseModel):
    """Gateway health status."""

    status: Literal["healthy", "unhealthy", "degraded"]
    version: Optional[str] = None
    uptime: Optional[int] = None
    components: Optional[Dict[str, str]] = None


class WaitOptions(BaseModel):
    """Options for waiting on deployment."""

    timeout: Optional[int] = None
    poll_interval: Optional[int] = Field(None, alias="pollInterval")
    on_progress: Optional[Callable[[DeploymentStatus], None]] = Field(
        None, alias="onProgress"
    )

    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)
