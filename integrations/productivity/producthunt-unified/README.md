# Product Hunt Unified MCP Server

**Production-ready Product Hunt integration** with API token authentication, multi-tenant support, and comprehensive tools.

## Features

✅ **API Token Authentication**
- No OAuth complexity - simple API token management
- Multi-tenant credential storage via HashiCorp Vault
- Per-tenant encryption for secure token storage

✅ **11 Product Hunt Tools** (Initial: 2 core tools)
- **Posts**: Get post details, search posts
- **Server**: Health check and status

✅ **Production Ready**
- GraphQL client for Product Hunt API v2
- Rate limiting (6250 complexity points/hour)
- Comprehensive error handling
- Structured logging
- Health check endpoints

## Quick Start

### 1. Environment Variables

```bash
# Required
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token

# Optional
LOG_LEVEL=info
PORT=3000
NODE_ENV=development
```

### 2. Run with Docker Compose

```bash
# Start infrastructure
docker compose up -d vault

# Build and start Product Hunt unified server
docker compose build mcp-producthunt
docker compose --profile producthunt up -d
```

### 3. Configure API Token

```bash
# Set Product Hunt API token for a tenant
curl -X POST http://localhost:3140/token/set \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "apiToken": "your_product_hunt_api_token_here"
  }'
```

**Get your Product Hunt API token:**
1. Go to https://www.producthunt.com/v2/oauth/applications
2. Create a new application
3. Copy the "Developer Token"

### 4. Use Tools

```bash
# Check server status
curl -X POST http://localhost:3140/tools/producthunt_check_status \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"my-tenant"}'

# Get post details
curl -X POST http://localhost:3140/tools/producthunt_get_post_details \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"my-tenant","slug":"claude-desktop"}'
```

## Available Tools

### Post Tools (2)

| Tool | Description |
|------|-------------|
| `producthunt_get_post_details` | Get detailed info about a specific post (by ID or slug) |
| `producthunt_get_posts` | Get posts with filters (topic, featured, date range, etc.) |

### Server Tools (1)

| Tool | Description |
|------|-------------|
| `producthunt_check_status` | Check server status, API connectivity, and rate limits |

## Development

### Local Setup

```bash
cd integrations/productivity/producthunt-unified

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Coverage report
npm run test:coverage

# Linting
npm run lint
```

## API Reference

### Health Check

```bash
GET /health

Response:
{
  "status": "healthy",
  "service": "producthunt-unified-mcp",
  "timestamp": "2025-11-16T19:00:00Z",
  "uptime": 123.45
}
```

### Token Management

**Set API Token:**
```bash
POST /token/set
Content-Type: application/json

{
  "tenantId": "my-tenant",
  "apiToken": "your_product_hunt_token"
}
```

**Revoke API Token:**
```bash
DELETE /token/revoke?tenant_id=my-tenant
```

## Architecture

```
┌─────────────────────────────────────────┐
│   AI Agent (Claude, etc.)               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Gateway (OAuth Proxy)                 │
│   - Token management                    │
│   - Rate limiting                       │
│   - Semantic routing                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Product Hunt Unified MCP Server       │
│   - GraphQL client (Product Hunt v2)   │
│   - Multi-tenant API tokens             │
│   - 11 tools (posts, comments, etc.)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   HashiCorp Vault                       │
│   - Per-tenant token storage            │
│   - Encrypted at rest                   │
└─────────────────────────────────────────┘
```

## Error Handling

### Rate Limiting

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Reset in 900 seconds.",
  "details": {
    "retryAfter": 900
  }
}
```

### Token Errors

```json
{
  "error": "TOKEN_ERROR",
  "message": "No Product Hunt API token found for tenant: my-tenant"
}
```

## Comparison: Python vs TypeScript

| Metric | Python (FastMCP) | TypeScript (Unified) |
|--------|------------------|----------------------|
| **Integration** | Standalone | Unified with platform |
| **Auth** | Env var only | Multi-tenant Vault |
| **SDK** | FastMCP | @modelcontextprotocol/sdk |
| **Architecture** | Independent | Matches GitHub/LinkedIn pattern |

## Contributing

Follow the unified pattern established by other integrations:

- **Directory structure**: `src/{auth,clients,tools,utils}`
- **Tool organization**: Group by domain (posts, comments, collections, etc.)
- **Auth pattern**: Vault-based multi-tenant API tokens
- **Error handling**: Consistent error types and mapping
- **Logging**: Structured logging with Winston

## License

MIT

## Support

- **Documentation**: See Product Hunt API docs at https://www.producthunt.com/v2/docs
- **Issues**: GitHub Issues
- **Integration Guide**: See GitHub/LinkedIn unified servers for reference pattern
