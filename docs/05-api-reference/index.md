# API Reference

Complete API documentation for the Connectors Platform Gateway.

---

## Overview

The MCP Gateway provides two primary APIs:

1. **Gateway HTTP API** - REST endpoints for tool selection, invocation, and OAuth management
2. **MCP Protocol** - Standard Model Context Protocol for AI agent integration

**Base URL:** `http://localhost:3000` (development)

**API Version:** v1

---

## Quick Start

### Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T10:00:00.000Z",
  "services": {
    "vault": "connected",
    "redis": "connected",
    "neo4j": "connected"
  }
}
```

### Readiness Probe

```bash
curl http://localhost:3000/ready
```

---

## Authentication

### API Key Authentication

All API requests require an API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" \
  http://localhost:3000/api/v1/tools/select
```

### OAuth Tenant Authentication

For tenant-specific operations, include tenant ID in the request path:

```bash
POST /api/v1/tenants/{tenantId}/integrations/{integration}/oauth-config
```

**Security Features:**
- Per-tenant credential encryption (HashiCorp Vault Transit engine)
- Automatic token refresh (5 minutes before expiry)
- Audit logging for all credential access
- TLS-only transmission in production

---

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Tool Selection | 100 req/min | 60 seconds |
| Tool Invocation | 50 req/min | 60 seconds |
| OAuth Config | 20 req/min | 60 seconds |
| Health Checks | Unlimited | N/A |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2025-11-16T10:00:00.000Z",
    "requestId": "req_abc123"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request body or parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `VAULT_ERROR` | 500 | Vault connection/encryption failed |
| `OAUTH_ERROR` | 500 | OAuth operation failed |
| `TOOL_SELECTION_ERROR` | 500 | Semantic routing failed |
| `INTEGRATION_ERROR` | 502 | MCP server unavailable |

---

## API Documentation

### Gateway HTTP API

Complete REST API for gateway operations:

**[Gateway API Reference](./gateway-api.md)**

**Core Endpoints:**
- Tool Selection - Semantic tool discovery
- Tool Invocation - Execute MCP tools with OAuth
- OAuth Management - Configure tenant credentials
- Catalog - Browse available tools

### MCP Protocol

Standard Model Context Protocol specification:

**[MCP Protocol Reference](./mcp-protocol.md)**

**Core Features:**
- Tool discovery and listing
- Structured tool calling
- Progressive loading
- Error handling

---

## Performance

### Token Optimization

**95% token reduction** achieved through:
- Semantic routing (FAISS vector search)
- GraphRAG enhancement (Neo4j relationships)
- Progressive loading (3-tier schemas)
- Token budgeting

**Results:**
- Traditional MCP: 250,000 tokens
- Optimized Gateway: 1,000-3,000 tokens

### Latency Targets

| Operation | Target | Typical |
|-----------|--------|---------|
| Tool Selection | <100ms | 45ms |
| OAuth Token Fetch | <50ms | 20ms |
| Tool Invocation | <500ms | 250ms |
| End-to-End | <2s | 800ms |

---

## Client Libraries

### TypeScript/JavaScript

```bash
npm install @connectors/gateway-client
```

```typescript
import { GatewayClient } from '@connectors/gateway-client';

const client = new GatewayClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000'
});

const tools = await client.selectTools('create a GitHub PR');
const result = await client.invokeTool('github.createPullRequest', {
  repo: 'owner/repo',
  title: 'Feature X'
});
```

### Python

```bash
pip install connectors-gateway-client
```

```python
from connectors_gateway import GatewayClient

client = GatewayClient(api_key='your-api-key')
tools = client.select_tools('create a GitHub PR')
result = client.invoke_tool('github.createPullRequest', {...})
```

---

## Versioning

Current version: `/api/v1/...`

**Deprecation Policy:**
- API versions supported for 12+ months
- Breaking changes only in major versions
- Deprecation warnings in `X-API-Deprecation` header

---

## Next Steps

- **[Gateway API](./gateway-api.md)** - REST API endpoints
- **[MCP Protocol](./mcp-protocol.md)** - MCP specification
- **[Troubleshooting](../06-troubleshooting/index.md)** - Common issues
