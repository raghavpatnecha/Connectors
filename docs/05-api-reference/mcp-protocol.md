# MCP Protocol Reference

Model Context Protocol (MCP) specification for AI agent integration.

---

## Overview

MCP enables AI agents to discover and invoke tools. The gateway extends MCP with:
- **Semantic Tool Discovery** - FAISS vector search
- **OAuth Proxy** - Transparent credential injection
- **GraphRAG** - Tool relationships
- **Progressive Loading** - Token optimization

---

## Connection

### Standard MCP (stdio)

```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {"tools": {}},
    "clientInfo": {"name": "claude-desktop", "version": "1.0.0"}
  },
  "id": 1
}
```

### Gateway HTTP Transport

**Configuration (claude_desktop_config.json):**
```json
{
  "mcpServers": {
    "connectors-gateway": {
      "transport": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {"X-Tenant-ID": "my-tenant"}
    }
  }
}
```

---

## Tool Discovery

### List Tools

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {},
  "id": 2
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [{
      "name": "github_createPullRequest",
      "description": "Creates a new pull request",
      "inputSchema": {
        "type": "object",
        "properties": {
          "repo": {"type": "string"},
          "title": {"type": "string"}
        },
        "required": ["repo", "title"]
      }
    }]
  }
}
```

### Semantic Discovery (Gateway Extension)

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/discover",
  "params": {
    "query": "create a pull request on GitHub",
    "context": {"maxTools": 5, "tokenBudget": 2000}
  },
  "id": 3
}
```

---

## Tool Invocation

### Call Tool

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "github_createPullRequest",
    "arguments": {
      "repo": "owner/repo",
      "title": "Add feature X",
      "head": "feature-x",
      "base": "main"
    }
  },
  "id": 4
}
```

**Response (Success):**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{
      "type": "text",
      "text": "Pull request created successfully"
    }],
    "isError": false
  }
}
```

**Response (Error):**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [{"type": "text", "text": "Failed: OAuth token expired"}],
    "isError": true
  }
}
```

---

## Error Handling

### Error Format

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid Request",
    "data": {"details": "Missing required parameter"}
  },
  "id": 5
}
```

### Error Codes

| Code | Name | Description |
|------|------|-------------|
| `-32700` | Parse Error | Invalid JSON |
| `-32600` | Invalid Request | Invalid method/params |
| `-32601` | Method Not Found | Method doesn't exist |
| `-32602` | Invalid Params | Invalid parameters |
| `-32603` | Internal Error | Server error |
| `-32000` | OAuth Error | OAuth failed |
| `-32001` | Rate Limited | Rate limit exceeded |
| `-32002` | Integration Error | MCP unavailable |

---

## Progressive Loading

### Tier 1: Minimal (Immediate)

```json
{
  "tools": [{
    "name": "github_createPullRequest",
    "description": "Creates a new pull request"
  }]
}
```

**Token Cost:** ~200 tokens (vs 15,000 for full)

### Tier 2: Medium (On-Demand)

```json
{
  "jsonrpc": "2.0",
  "method": "tools/getSchema",
  "params": {"name": "github_createPullRequest"},
  "id": 6
}
```

Returns full schema with parameters.

### Tier 3: Full (Lazy)

```json
{
  "jsonrpc": "2.0",
  "method": "tools/getFullSchema",
  "params": {"name": "github_createPullRequest"},
  "id": 7
}
```

Includes examples, docs, edge cases.

---

## Authentication

### OAuth (Gateway-Managed)

OAuth is transparent. Gateway injects credentials automatically.

**Client (No Auth):**
```json
{
  "method": "tools/call",
  "params": {"name": "github_createPullRequest", "arguments": {...}}
}
```

**Gateway (Injected):**
```http
POST https://api.github.com/repos/owner/repo/pulls
Authorization: Bearer ghp_autoInjectedToken
```

### Tenant Context

```http
POST /mcp
X-Tenant-ID: acme-corp
```

---

## Streaming

### Server-Sent Events

```json
{
  "method": "tools/call",
  "params": {"name": "notion_exportWorkspace", "streaming": true}
}
```

**SSE Stream:**
```
data: {"type":"progress","status":"Exporting","progress":0.5}
data: {"type":"complete","result":{...}}
```

---

## Tool Metadata

```json
{
  "name": "github_createPullRequest",
  "metadata": {
    "category": "code",
    "rateLimits": {"requests": 5000, "window": "hour"},
    "oauthScopes": ["repo"],
    "relationshipHints": ["github_mergePullRequest"]
  }
}
```

---

## Best Practices

1. Use `tools/discover` for semantic discovery
2. Request schemas on-demand only
3. Support streaming for long operations
4. Implement exponential backoff retries
5. Cache tool lists to reduce latency

---

## Next Steps

- **[Gateway API](./gateway-api.md)** - REST API
- **[Troubleshooting](../06-troubleshooting/index.md)** - Common issues
