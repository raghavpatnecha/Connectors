# Connectors Python SDK

Python SDK for the Connectors platform - semantic MCP routing with **99% token reduction** (1-3K tokens vs 250K traditional).

## Features

- **Semantic Tool Selection**: FAISS + GraphRAG for intelligent tool discovery
- **MCP Registry**: Deploy and manage custom MCP servers
- **OAuth Integration**: Automatic credential management via HashiCorp Vault
- **Type-Safe**: Full type hints with Pydantic models
- **Async-First**: Built on httpx for high-performance async operations
- **Retry Logic**: Exponential backoff with jitter for resilient API calls

## Installation

```bash
pip install connectors-sdk
```

For development:

```bash
pip install connectors-sdk[dev]
```

## Quick Start

```python
import asyncio
from connectors import Connectors

async def main():
    # Initialize client
    connectors = Connectors(
        base_url="http://localhost:3000",
        tenant_id="my-company",
        api_key="your-api-key"
    )

    # Semantic tool selection
    tools = await connectors.tools.select("create a GitHub pull request")
    print(f"Selected {len(tools)} tools:")
    for tool in tools:
        print(f"  - {tool.name}: {tool.description}")

    # Invoke a tool
    result = await connectors.tools.invoke(
        tool_id="github.createPullRequest",
        parameters={
            "repo": "owner/repo",
            "title": "New feature",
            "head": "feature-branch",
            "base": "main",
            "body": "Feature implementation"
        }
    )
    print(f"Result: {result.data}")

asyncio.run(main())
```

## API Reference

### Connectors Client

```python
from connectors import Connectors

connectors = Connectors(
    base_url="http://localhost:3000",  # Gateway URL
    tenant_id="my-company",             # Optional: Multi-tenancy support
    api_key="your-api-key",             # Optional: API authentication
    timeout=120000,                      # Optional: Request timeout (ms)
    max_retries=3,                       # Optional: Retry attempts
    headers={"Custom-Header": "value"}   # Optional: Custom headers
)
```

### ToolsAPI

#### Select Tools

```python
# Semantic tool selection with FAISS + GraphRAG
tools = await connectors.tools.select(
    query="create a GitHub pull request",
    options={
        "max_tools": 5,                    # Limit results
        "categories": ["code"],            # Filter by category
        "token_budget": 2000               # Token budget constraint
    }
)
```

#### List Tools

```python
# List all available tools with filters
tools = await connectors.tools.list(
    filters={
        "category": "code",               # Filter by category
        "integration": "github",          # Filter by integration
        "search": "pull request",         # Text search
        "page": 1,                        # Pagination
        "limit": 50                       # Results per page
    }
)
```

#### Invoke Tool

```python
# Execute a tool
result = await connectors.tools.invoke(
    tool_id="github.createPullRequest",
    parameters={
        "repo": "owner/repo",
        "title": "Feature",
        "head": "feature",
        "base": "main"
    },
    options={
        "tenant_id": "my-company",        # Override tenant
        "integration": "github"           # Integration name
    }
)

print(result.success)  # True/False
print(result.data)     # Tool response
print(result.error)    # Error details if failed
```

### MCPRegistry

#### Get MCP Server

```python
# Get bound MCP server instance
github = connectors.mcp.get("github")

# Call tools directly
pr = await github.call("createPullRequest", {
    "repo": "owner/repo",
    "title": "New feature",
    "head": "feature",
    "base": "main"
})

# List tools for this integration
tools = await github.list_tools()
```

#### List Integrations

```python
# List all available MCP integrations
integrations = await connectors.mcp.list()

for integration in integrations:
    print(f"{integration.name}: {integration.tool_count} tools")
```

#### Deploy Custom MCP Server

```python
from connectors.types import MCPDeploymentConfig, MCPSourceType

# Deploy from OpenAPI spec
deployment = await connectors.mcp.add(
    config=MCPDeploymentConfig(
        name="custom-api",
        source={
            "type": MCPSourceType.OPENAPI,
            "url": "https://api.example.com/openapi.json"
        },
        category="custom",
        description="Custom API integration"
    )
)

# Wait for deployment to complete
await deployment.wait_until_ready(
    options={
        "timeout": 300000,              # 5 minutes
        "poll_interval": 2000,          # 2 seconds
        "on_progress": lambda status: print(f"Status: {status.status}")
    }
)

print(f"Deployment ready: {deployment.deployment_id}")
```

#### Remove Custom MCP Server

```python
# Remove custom deployment
await connectors.mcp.remove("custom-api")
```

### Health Check

```python
# Check gateway health
health = await connectors.health()
print(f"Status: {health.status}")
print(f"Version: {health.version}")

# Test connection
is_connected = await connectors.test_connection()
```

## Type Definitions

All API methods use strongly-typed Pydantic models:

```python
from connectors.types import (
    Tool,
    ToolSelectionOptions,
    ToolListFilters,
    InvokeOptions,
    ToolInvocationResponse,
    MCPDeploymentConfig,
    MCPSourceType,
    DeploymentStatus,
    HealthStatus
)
```

## Error Handling

The SDK provides specific error types for different failure scenarios:

```python
from connectors.errors import (
    HTTPError,              # HTTP request failed
    TimeoutError,           # Request timed out
    RetryableError,         # Retryable network error
    DeploymentTimeoutError, # Deployment timeout
    DeploymentFailedError,  # Deployment failed
    ValidationError         # Invalid input
)

try:
    tools = await connectors.tools.select("create a PR")
except TimeoutError as e:
    print(f"Request timed out: {e}")
except HTTPError as e:
    print(f"HTTP {e.status_code}: {e.message}")
except ValidationError as e:
    print(f"Invalid input: {e}")
```

## Examples

See the [examples/](examples/) directory for complete examples:

- [basic_usage.py](examples/basic_usage.py) - Basic SDK usage
- [tool_selection.py](examples/tool_selection.py) - Advanced tool selection
- [mcp_deployment.py](examples/mcp_deployment.py) - Custom MCP deployment

## Development

```bash
# Install dependencies
pip install -e .[dev]

# Run tests
pytest

# Run tests with coverage
pytest --cov=connectors --cov-report=html

# Type checking
mypy connectors

# Code formatting
black connectors tests examples
ruff check connectors tests examples
```

## Architecture

The SDK mirrors the TypeScript SDK architecture:

```
┌─────────────────────────────────┐
│   Python Application            │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   Connectors SDK                │
│   - ToolsAPI                    │
│   - MCPRegistry                 │
│   - HTTPClient (httpx)          │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   MCP Gateway                   │
│   - FAISS Semantic Search       │
│   - GraphRAG Relationships      │
│   - OAuth Proxy (Vault)         │
│   - Token Optimization          │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┬────────┐
    ▼                 ▼        ▼
┌────────┐      ┌─────────┐ ┌──────┐
│ GitHub │      │ Slack   │ │ ...  │
│ MCP    │      │ MCP     │ │ MCP  │
└────────┘      └─────────┘ └──────┘
```

## Feature Parity with TypeScript SDK

| Feature | TypeScript | Python | Status |
|---------|-----------|--------|--------|
| Client Initialization | ✅ | ✅ | Complete |
| Health Check | ✅ | ✅ | Complete |
| Semantic Tool Selection | ✅ | ✅ | Complete |
| Tool Listing | ✅ | ✅ | Complete |
| Tool Invocation | ✅ | ✅ | Complete |
| MCP Server Binding | ✅ | ✅ | Complete |
| MCP Listing | ✅ | ✅ | Complete |
| Custom MCP Deployment | ✅ | ✅ | Complete |
| Deployment Polling | ✅ | ✅ | Complete |
| MCP Removal | ✅ | ✅ | Complete |
| Retry Logic | ✅ | ✅ | Complete |
| Type Safety | ✅ | ✅ | Complete |
| Async Support | ✅ | ✅ | Complete |

## License

MIT

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support

- Documentation: https://docs.connectors.dev
- Issues: https://github.com/connectors/python-sdk/issues
- Discussions: https://github.com/connectors/python-sdk/discussions
