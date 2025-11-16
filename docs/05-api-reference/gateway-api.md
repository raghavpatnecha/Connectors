# Gateway HTTP API

REST API endpoints for tool selection, invocation, and OAuth management.

**Base URL:** `http://localhost:3000/api/v1`

---

## Tool Selection

### Select Tools via Semantic Routing

**Endpoint:** `POST /api/v1/tools/select`

**Request:**
```json
{
  "query": "create a pull request on GitHub",
  "context": {
    "allowedCategories": ["code"],
    "tokenBudget": 2000,
    "maxTools": 5
  }
}
```

**Parameters:**
- `query` (string, required) - Natural language query
- `context.allowedCategories` (string[]) - Filter categories
- `context.tokenBudget` (number) - Max tokens (default: 3000)
- `context.maxTools` (number) - Max tools (default: 5)

**Response:**
```json
{
  "success": true,
  "tools": [{
    "toolId": "github.createPullRequest",
    "name": "Create Pull Request",
    "category": "code",
    "parameters": {...},
    "tokenCost": 450,
    "relevanceScore": 0.95
  }],
  "metadata": {"totalTokens": 1250, "selectionLatency": 45}
}
```

**Status:** `200` Success | `400` Invalid | `500` Failed | `503` Indices not loaded

---

## Tool Invocation

### Invoke MCP Tool

**Endpoint:** `POST /api/v1/tools/invoke`

**Request:**
```json
{
  "toolId": "github.createPullRequest",
  "integration": "github",
  "tenantId": "my-tenant",
  "parameters": {
    "repo": "owner/repo",
    "title": "Add feature X",
    "head": "feature-x",
    "base": "main"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "number": 123,
    "url": "https://github.com/owner/repo/pull/123"
  }
}
```

**Status:** `200` Success | `401` No OAuth | `429` Rate limited | `502` MCP unavailable

---

## OAuth Configuration

### Create/Update OAuth Config

**Endpoint:** `POST /api/v1/tenants/:tenantId/integrations/:integration/oauth-config`

**Request:**
```json
{
  "clientId": "github_client_id",
  "clientSecret": "github_client_secret",
  "redirectUri": "https://myapp.com/oauth/callback",
  "scopes": ["repo", "user"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "OAuth configuration stored successfully"
}
```

---

### Get OAuth Config

**Endpoint:** `GET /api/v1/tenants/:tenantId/integrations/:integration/oauth-config`

Returns config excluding client secret.

---

### Delete OAuth Config

**Endpoint:** `DELETE /api/v1/tenants/:tenantId/integrations/:integration/oauth-config`

---

### List Tenant Integrations

**Endpoint:** `GET /api/v1/tenants/:tenantId/integrations`

**Response:**
```json
{
  "success": true,
  "integrations": ["github", "notion", "linkedin"],
  "count": 3
}
```

---

## Tool Catalog

### List All Tools

**Endpoint:** `GET /api/v1/tools/list`

**Query Parameters:**
- `category` - Filter by category
- `integration` - Filter by integration
- `limit` - Max tools (default: 50)
- `offset` - Pagination offset

**Example:**
```bash
curl "http://localhost:3000/api/v1/tools/list?category=code&limit=10"
```

---

### Get Tool Details

**Endpoint:** `GET /api/v1/tools/:toolId`

Returns detailed tool information.

---

## Categories

### List Categories

**Endpoint:** `GET /api/v1/categories`

**Response:**
```json
{
  "success": true,
  "categories": [{
    "id": "code",
    "name": "Code & Development",
    "toolCount": 50
  }]
}
```

---

## Health & Monitoring

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "services": {
    "vault": "connected",
    "redis": "connected",
    "neo4j": "connected"
  }
}
```

---

### Readiness Probe

**Endpoint:** `GET /ready`

**Response:**
```json
{
  "ready": true,
  "checks": {
    "vault": true,
    "faiss_indices": true
  }
}
```

---

### Performance Metrics

**Endpoint:** `GET /api/v1/metrics`

**Response:**
```json
{
  "metrics": {
    "tool_selection": {
      "total_requests": 1250,
      "avg_latency_ms": 45
    }
  }
}
```

---

## Example Workflows

### Complete Workflow

```bash
# 1. Select tools
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{"query": "create a PR on GitHub"}'

# 2. Invoke tool
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "github.createPullRequest",
    "integration": "github",
    "tenantId": "my-tenant",
    "parameters": {...}
  }'
```

### Configure OAuth

```bash
# Create config
curl -X POST http://localhost:3000/api/v1/tenants/acme/integrations/github/oauth-config \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "...",
    "clientSecret": "...",
    "scopes": ["repo"]
  }'

# Verify
curl http://localhost:3000/api/v1/tenants/acme/integrations/github/oauth-config
```

---

## Next Steps

- **[MCP Protocol](./mcp-protocol.md)** - MCP specification
- **[Troubleshooting](../06-troubleshooting/index.md)** - Common issues
