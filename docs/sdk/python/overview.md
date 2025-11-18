# Python SDK - Overview

The Connectors Python SDK provides a simple, type-safe interface for AI agents to interact with the Connectors platform, with 100% feature parity with the TypeScript SDK.

## Architecture

```
┌─────────────────────────────────────┐
│       Connectors Client             │
│  (Main entry point)                 │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌─────────────┐
│ Tools  │   │ MCP Registry│
│  API   │   │             │
└────────┘   └─────────────┘
    │              │
    │              │
    ▼              ▼
┌─────────────────────────────────────┐
│        Gateway REST API             │
│  (Semantic routing + GraphRAG)      │
└─────────────────────────────────────┘
```

## Core Concepts

### Connectors Client

The main entry point for all SDK operations. Manages configuration, authentication, and provides access to Tools API and MCP Registry.

```python
from connectors import Connectors

connectors = Connectors(
    base_url="http://localhost:3000",
    tenant_id="my-company",
    api_key="your-api-key"  # Optional
)
```

### Tools API

Provides semantic tool selection and invocation:

- **`tools.select(query, options)`** - Select tools using natural language
- **`tools.list(filters)`** - List all available tools
- **`tools.invoke(tool_id, params)`** - Invoke a specific tool

```python
# Semantic selection
tools = await connectors.tools.select(
    "create a GitHub pull request",
    max_tools=5,
    category="code"
)

# List all tools
all_tools = await connectors.tools.list(category="code")

# Invoke tool
result = await connectors.tools.invoke("github.createPullRequest", {
    "repo": "owner/repo",
    "title": "New feature",
    "head": "feature",
    "base": "main"
})
```

### MCP Registry

Manages MCP server deployments:

- **`mcp.get(name)`** - Get bound server instance
- **`mcp.list()`** - List all registered servers
- **`mcp.add(config)`** - Deploy custom MCP server
- **`mcp.remove(name)`** - Remove deployed server

```python
# Get server instance
github = connectors.mcp.get("github")
pr = await github.call("createPullRequest", {...})

# Deploy custom server
deployment = await connectors.mcp.add(
    name="my-server",
    source={"type": "github", "url": "https://github.com/user/mcp-server"},
    category="custom"
)
```

## Type Definitions

### Tool

```python
from typing import TypedDict, List
from datetime import datetime

class Tool(TypedDict):
    id: str                # e.g., 'github.createPullRequest'
    name: str              # Human-readable name
    description: str       # What the tool does
    category: str          # e.g., 'code', 'communication'
    server: str            # MCP server name
    parameters: List[ToolParameter]
    token_cost: int        # Estimated token usage
```

### ToolParameter

```python
class ToolParameter(TypedDict):
    name: str
    type: str              # 'string', 'number', 'boolean', 'object', 'array'
    description: str
    required: bool
    default: Any           # Optional default value
```

### ToolSelection

```python
class ToolSelection(TypedDict):
    tool: Tool
    score: float           # Relevance score (0-1)
    reason: str            # Why this tool was selected
    related_tools: List[Tool]  # Suggested related tools from GraphRAG
```

### MCPServer

```python
class MCPServer(TypedDict):
    name: str
    category: str
    status: str            # 'active', 'inactive', 'error'
    tool_count: int
    url: str
```

### MCPDeployment

```python
class MCPDeployment:
    id: str
    name: str
    status: str            # 'pending', 'building', 'deploying', 'ready', 'failed'
    source: dict
    created_at: datetime

    # Methods
    async def wait_until_ready(self, timeout: int = 300000) -> None: ...
    async def get_status(self) -> DeploymentStatus: ...
    async def get_logs(self) -> List[str]: ...
```

## Error Handling

The SDK raises typed exceptions for different failure scenarios:

```python
from connectors.exceptions import (
    ConnectorsError,
    ToolSelectionError,
    ToolInvocationError,
    DeploymentError,
    AuthenticationError
)

try:
    tools = await connectors.tools.select("invalid query")
except ToolSelectionError as e:
    print(f"Tool selection failed: {e.message}")
    print(f"Query: {e.query}")
    print(f"Available categories: {e.available_categories}")
except AuthenticationError as e:
    print(f"Authentication failed: {e.message}")
```

## Configuration Options

### Connectors Constructor

```python
class ConnectorsConfig(TypedDict):
    base_url: str              # Gateway URL (required)
    tenant_id: str             # Multi-tenant identifier (optional)
    api_key: str               # API authentication key (optional)
    timeout: int               # Request timeout in seconds (optional)
    retries: int               # Number of retries on failure (optional)
    log_level: str             # 'DEBUG', 'INFO', 'WARN', 'ERROR' (optional)
```

### Tool Selection Options

```python
class ToolSelectOptions(TypedDict, total=False):
    max_tools: int             # Max tools to return (default: 5)
    category: str              # Filter by category
    exclude_servers: List[str] # Exclude specific servers
    token_budget: int          # Max token cost
    include_related: bool      # Include GraphRAG suggestions (default: True)
```

### Tool List Options

```python
class ToolListOptions(TypedDict, total=False):
    category: str              # Filter by category
    server: str                # Filter by server
    search: str                # Full-text search
    limit: int                 # Max results
    offset: int                # Pagination offset
```

## Async/Await Support

The Python SDK is fully async and uses `asyncio`:

```python
import asyncio
from connectors import Connectors

async def main():
    connectors = Connectors(base_url="http://localhost:3000")

    # All operations are async
    tools = await connectors.tools.select("create PR")
    result = await connectors.tools.invoke("github.createPR", {...})

# Run async code
asyncio.run(main())
```

## Type Hints

The SDK provides full type hints for IDE autocomplete and type checking:

```python
from connectors import Connectors
from connectors.types import Tool, ToolSelection
from typing import List

async def select_tools(query: str) -> List[ToolSelection]:
    connectors = Connectors(base_url="http://localhost:3000")
    selections: List[ToolSelection] = await connectors.tools.select(query)

    # Type hints provide autocomplete
    for selection in selections:
        print(f"Tool: {selection['tool']['name']}, Score: {selection['score']}")

    return selections
```

## Best Practices

### 1. Reuse Client Instances

Create one client instance and reuse it:

```python
# ✅ Good: Module-level singleton
# lib/connectors.py
from connectors import Connectors

connectors = Connectors(
    base_url="http://localhost:3000",
    api_key=os.environ.get("CONNECTORS_API_KEY")
)

# services/github.py
from lib.connectors import connectors

async def select_tools():
    return await connectors.tools.select("GitHub")
```

```python
# ❌ Bad: New instance per function
async def select_tools():
    connectors = Connectors(base_url="...")
    return await connectors.tools.select("query")
```

### 2. Use Context Managers

Use async context managers for proper cleanup:

```python
from connectors import Connectors

async def main():
    async with Connectors(base_url="http://localhost:3000") as connectors:
        tools = await connectors.tools.select("query")
        # Cleanup happens automatically
```

### 3. Handle Errors Gracefully

Always catch and handle SDK errors:

```python
from connectors.exceptions import ToolInvocationError

try:
    result = await connectors.tools.invoke("github.createPR", params)
    print(f"PR created: {result['data']['url']}")
except ToolInvocationError as e:
    print(f"Tool invocation failed: {e.message}")
    print(f"Tool: {e.tool_id}")
    print(f"Params: {e.params}")
    # Fallback logic
except Exception as e:
    raise  # Re-throw unexpected errors
```

### 4. Use Type Checking

Enable type checking with mypy:

```python
# mypy.ini
[mypy]
python_version = 3.10
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True

# Your code
from connectors import Connectors
from connectors.types import ToolSelection
from typing import List

async def select_tools(query: str) -> List[ToolSelection]:
    connectors = Connectors(base_url="http://localhost:3000")
    return await connectors.tools.select(query)

# Run: mypy your_code.py
```

### 5. Monitor Token Usage

Track token consumption to optimize costs:

```python
tools = await connectors.tools.select("query", max_tools=5)

total_tokens = sum(t["tool"]["token_cost"] for t in tools)
print(f"Total token cost: {total_tokens}")

# Stay within budget
if total_tokens > 2000:
    print("Token budget exceeded, reducing tool count")
    tools = tools[:3]
```

## Next Steps

- **[Installation](installation.md)** - Install and configure the SDK
- **[Client API](client.md)** - Detailed client API reference
- **[Tools API](tools.md)** - Complete Tools API documentation
- **[MCP API](mcp.md)** - Deploy and manage MCP servers
- **[Examples](../examples.md)** - Common usage patterns

## Installation

```bash
pip install connectors-sdk
# or
poetry add connectors-sdk
# or
uv pip install connectors-sdk
```

## Requirements

- Python 3.10+
- asyncio support
- Gateway running at base_url

---

**[← Back to SDK Documentation](../)**
