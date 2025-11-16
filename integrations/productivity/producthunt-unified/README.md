# Product Hunt Unified MCP Server

**Production-ready Product Hunt integration** with API token authentication, multi-tenant support, and comprehensive tools.

[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-0.5.0-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](Dockerfile)

---

## 📖 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Available Tools](#-available-tools)
- [Configuration](#-configuration)
- [Development](#-development)
- [API Reference](#-api-reference)
- [Architecture](#-architecture)
- [Troubleshooting](#-troubleshooting)
- [Comparison](#-comparison-python-vs-typescript)

---

## ✨ Features

### **Authentication**
- ✅ **API Token-based** - No OAuth complexity, simple setup
- ✅ **Multi-tenant** - Per-tenant token storage via HashiCorp Vault
- ✅ **Encrypted Storage** - Vault Transit engine encryption
- ✅ **Token Caching** - 1-hour TTL to reduce Vault calls

### **Product Hunt Tools**
- ✅ **3 Core Tools** - Posts, search, server status
- ✅ **11 Planned Tools** - Comments, collections, topics, users (easy to add)
- ✅ **Pagination** - Built-in pagination support
- ✅ **Filtering** - Rich filter options (topic, featured, date range)

### **Production Ready**
- ✅ **GraphQL Client** - Product Hunt API v2 integration
- ✅ **Rate Limiting** - Respects 6250 complexity points/hour
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Structured Logging** - Winston with JSON output
- ✅ **Health Checks** - Kubernetes-ready health endpoints
- ✅ **Docker** - Multi-stage build, non-root user
- ✅ **Hot Reload** - Development with volume mounts

---

## 🚀 Quick Start

### **Prerequisites**

- Docker & Docker Compose
- Product Hunt API token ([get one here](https://www.producthunt.com/v2/oauth/applications))
- HashiCorp Vault (included in docker-compose)

### **1. Get Product Hunt API Token**

1. Visit https://www.producthunt.com/v2/oauth/applications
2. Create a new application
   - **Name:** Your app name
   - **Redirect URI:** `https://localhost:8424/callback` (required but not used)
3. Copy the **Developer Token**

### **2. Start the Server**

```bash
# Start infrastructure (Vault, Gateway)
docker compose up -d vault gateway

# Build and start Product Hunt MCP
docker compose build mcp-producthunt
docker compose --profile producthunt up -d

# Check health
curl http://localhost:3140/health
```

### **3. Configure API Token**

```bash
# Set token for your tenant
curl -X POST http://localhost:3140/token/set \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-company",
    "apiToken": "YOUR_PRODUCT_HUNT_DEVELOPER_TOKEN"
  }'

# Response:
# {
#   "success": true,
#   "message": "API token stored successfully",
#   "tenantId": "my-company"
# }
```

### **4. Use the Tools**

```bash
# Check server status and rate limits
curl -X POST http://localhost:3140/tools/producthunt_check_status \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"my-company"}'

# Get post details by slug
curl -X POST http://localhost:3140/tools/producthunt_get_post_details \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-company",
    "slug": "claude-desktop"
  }'

# Search featured AI products
curl -X POST http://localhost:3140/tools/producthunt_get_posts \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-company",
    "topic": "artificial-intelligence",
    "featured": true,
    "order": "VOTES",
    "count": 10
  }'
```

---

## 🛠️ Available Tools

### **Post Tools (2)**

#### **1. producthunt_get_post_details**

Get detailed information about a specific Product Hunt post.

**Parameters:**
- `tenantId` (required): Tenant ID for authentication
- `id` (optional): Post ID
- `slug` (optional): Post slug (e.g., "claude-desktop")

**Returns:**
```json
{
  "success": true,
  "data": {
    "id": "123456",
    "name": "Claude Desktop",
    "slug": "claude-desktop",
    "tagline": "AI assistant for desktop",
    "description": "Full description...",
    "url": "https://producthunt.com/posts/claude-desktop",
    "votesCount": 1234,
    "commentsCount": 56,
    "createdAt": "2024-11-15T10:00:00Z",
    "featuredAt": "2024-11-15T12:00:00Z",
    "user": { "id": "...", "name": "...", "username": "..." },
    "makers": [...],
    "topics": { "edges": [...] },
    "media": [...]
  },
  "rateLimits": {
    "remaining": 6200,
    "resetAt": "2024-11-16T10:00:00Z",
    "resetInSeconds": 3456
  }
}
```

#### **2. producthunt_get_posts**

Search and filter Product Hunt posts.

**Parameters:**
- `tenantId` (required): Tenant ID for authentication
- `featured` (optional): Only featured posts (boolean)
- `topic` (optional): Filter by topic slug (e.g., "artificial-intelligence")
- `order` (optional): Sort order - `RANKING`, `NEWEST`, `VOTES`, `FEATURED_AT` (default: RANKING)
- `count` (optional): Number of posts (1-20, default: 10)
- `after` (optional): Pagination cursor
- `url` (optional): Filter by product URL
- `twitterUrl` (optional): Filter by Twitter URL
- `postedBefore` (optional): ISO datetime (e.g., "2024-11-15T00:00:00Z")
- `postedAfter` (optional): ISO datetime

**Returns:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "node": {
          "id": "...",
          "name": "...",
          "slug": "...",
          "tagline": "...",
          "votesCount": 123,
          ...
        }
      }
    ],
    "pagination": {
      "endCursor": "abc123",
      "hasNextPage": true
    }
  },
  "rateLimits": { ... }
}
```

### **Server Tools (1)**

#### **3. producthunt_check_status**

Check server status, API connectivity, and rate limits.

**Parameters:**
- `tenantId` (required): Tenant ID for authentication

**Returns:**
```json
{
  "success": true,
  "data": {
    "server": {
      "status": "healthy",
      "service": "producthunt-mcp-unified",
      "version": "1.0.0"
    },
    "api": {
      "status": "connected",
      "authenticated": true,
      "viewer": {
        "id": "...",
        "username": "..."
      }
    },
    "rateLimits": {
      "remaining": 6250,
      "resetAt": "2024-11-16T10:00:00Z",
      "resetInSeconds": 3600
    }
  }
}
```

---

## ⚙️ Configuration

### **Environment Variables**

```bash
# Required
VAULT_ADDR=http://localhost:8200      # HashiCorp Vault address
VAULT_TOKEN=dev-root-token            # Vault authentication token

# Optional
VAULT_NAMESPACE=producthunt-mcp       # Vault namespace (default: producthunt-mcp)
PORT=3000                             # HTTP server port (default: 3000)
NODE_ENV=development                  # Environment (development/production)
LOG_LEVEL=info                        # Log level (debug/info/warn/error)
```

### **Multi-Tenant Setup**

Each tenant (organization/user) needs their own Product Hunt API token:

```bash
# Tenant 1: Company A
curl -X POST http://localhost:3140/token/set \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "company-a",
    "apiToken": "COMPANY_A_TOKEN"
  }'

# Tenant 2: Company B
curl -X POST http://localhost:3140/token/set \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "company-b",
    "apiToken": "COMPANY_B_TOKEN"
  }'

# Now each tenant uses their own token
# Tools automatically use the correct token based on tenantId parameter
```

### **Vault Storage Structure**

Tokens are stored in Vault with encryption:

```
secret/tenants/{tenantId}/producthunt
  ├── api_token (encrypted with Transit engine)
  ├── created_at
  └── updated_at

transit/keys/producthunt-{tenantId}
  └── AES256-GCM96 encryption key
```

---

## 💻 Development

### **Local Setup**

```bash
cd integrations/productivity/producthunt-unified

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode (with hot reload)
npm run dev

# Run in production mode
npm start
```

### **Development with Docker**

```bash
# Hot reload enabled via volume mounts
docker compose --profile producthunt up

# Rebuild after dependency changes
docker compose build mcp-producthunt
docker compose --profile producthunt up
```

### **Testing**

```bash
# Run tests (when implemented)
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run typecheck
```

### **Adding New Tools**

Follow the pattern in `src/tools/post-tools.ts`:

```typescript
// 1. Add GraphQL query to src/clients/graphql-queries.ts
export const YOUR_QUERY = `
  query YourQuery($param: Type) {
    yourField(param: $param) {
      id
      name
    }
  }
`;

// 2. Create tool definition
export function getYourTools(client: ProductHuntClient): ToolDefinition[] {
  return [
    {
      name: 'producthunt_your_tool',
      description: 'Description of what your tool does',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID' },
          yourParam: { type: 'string', description: 'Your parameter' },
        },
        required: ['tenantId'],
      },
      handler: async (args) => {
        const { tenantId, yourParam } = args;
        const result = await client.query(YOUR_QUERY, { yourParam }, tenantId);
        return result;
      },
    },
  ];
}

// 3. Register in src/tools/index.ts
export { getYourTools } from './your-tools.js';

// 4. Add to src/index.ts
const yourTools = getYourTools(productHuntClient);
registry.registerTools([...postTools, ...serverTools, ...yourTools]);
```

---

## 📚 API Reference

### **Health Check**

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

### **Token Management**

#### **Set API Token**

```bash
POST /token/set
Content-Type: application/json

{
  "tenantId": "my-tenant",
  "apiToken": "your_product_hunt_token"
}

Response:
{
  "success": true,
  "message": "API token stored successfully",
  "tenantId": "my-tenant"
}
```

#### **Revoke API Token**

```bash
DELETE /token/revoke?tenant_id=my-tenant

Response:
{
  "success": true,
  "message": "API token revoked successfully",
  "tenantId": "my-tenant"
}
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│   AI Agent (Claude, etc.)               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Gateway (Semantic Router)             │
│   - Tool selection (FAISS)              │
│   - GraphRAG relationships              │
│   - Token optimization                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Product Hunt Unified MCP Server       │
│   ┌─────────────────────────────────┐  │
│   │   Auth Layer                     │  │
│   │   - TokenManager (caching)       │  │
│   │   - VaultClient (encryption)     │  │
│   └─────────────────────────────────┘  │
│   ┌─────────────────────────────────┐  │
│   │   GraphQL Client                 │  │
│   │   - ProductHuntClient            │  │
│   │   - Rate limiter (6250/hour)     │  │
│   │   - Error handler                │  │
│   └─────────────────────────────────┘  │
│   ┌─────────────────────────────────┐  │
│   │   Tools (3 implemented)          │  │
│   │   - Post tools                   │  │
│   │   - Server tools                 │  │
│   └─────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   HashiCorp Vault                       │
│   - Per-tenant token storage            │
│   - Transit encryption engine           │
│   - AES256-GCM96 encryption             │
└─────────────────────────────────────────┘
```

### **Component Responsibilities**

| Component | Responsibility |
|-----------|---------------|
| **VaultClient** | Encrypt/decrypt tokens, manage Vault connection |
| **TokenManager** | Token caching (1h TTL), retrieval coordination |
| **ProductHuntClient** | GraphQL queries, rate limiting, error handling |
| **RateLimiter** | Track complexity usage, pre-check limits |
| **ToolRegistry** | MCP tool registration and execution |
| **Logger** | Structured logging with Winston |

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. "No Product Hunt API token found for tenant"**

**Cause:** Token not configured for the tenant

**Solution:**
```bash
# Set the token
curl -X POST http://localhost:3140/token/set \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"YOUR_TENANT","apiToken":"YOUR_TOKEN"}'
```

#### **2. "Rate limit exceeded"**

**Cause:** Used all 6250 complexity points

**Solution:**
```bash
# Check when rate limit resets
curl -X POST http://localhost:3140/tools/producthunt_check_status \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"YOUR_TENANT"}'

# Wait for reset time, then retry
```

#### **3. "Vault connection failed"**

**Cause:** Vault not running or token invalid

**Solution:**
```bash
# Check Vault health
docker compose ps vault

# Restart Vault if needed
docker compose restart vault

# Verify VAULT_TOKEN environment variable
echo $VAULT_TOKEN
```

#### **4. "Authentication failed"**

**Cause:** Invalid Product Hunt API token

**Solution:**
1. Verify token at https://www.producthunt.com/v2/oauth/applications
2. Generate new token if needed
3. Update in vault:
```bash
curl -X POST http://localhost:3140/token/set \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"YOUR_TENANT","apiToken":"NEW_TOKEN"}'
```

#### **5. "Invalid date format"**

**Cause:** Date not in ISO 8601 format

**Solution:**
Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
```bash
# ✅ Correct
"postedAfter": "2024-11-15T00:00:00Z"

# ❌ Wrong
"postedAfter": "11/15/2024"
```

### **Debugging**

Enable debug logging:
```bash
# In docker-compose.yml
environment:
  - LOG_LEVEL=debug

# Or restart with env var
LOG_LEVEL=debug docker compose --profile producthunt up
```

View logs:
```bash
# Follow logs
docker compose logs -f mcp-producthunt

# Last 100 lines
docker compose logs --tail=100 mcp-producthunt

# Search for errors
docker compose logs mcp-producthunt | grep ERROR
```

---

## 📊 Comparison: Python vs TypeScript

| Metric | Python (FastMCP) | TypeScript (Unified) |
|--------|------------------|----------------------|
| **Framework** | FastMCP | @modelcontextprotocol/sdk |
| **Auth** | Env var only | Multi-tenant Vault |
| **Integration** | Standalone | Platform-integrated |
| **Pattern** | Custom | GitHub/LinkedIn pattern |
| **Lines of Code** | ~1,500 | ~1,900 |
| **Tools** | 11 | 3 (11 planned) |
| **Docker** | Manual setup | Compose integrated |
| **Gateway** | None | Semantic routing |
| **Rate Limiting** | Basic | Advanced (pre-check) |
| **Error Messages** | GraphQL errors | User-friendly |
| **Caching** | None | Token caching (1h) |
| **Multi-tenant** | ❌ No | ✅ Yes |
| **Hot Reload** | ❌ No | ✅ Yes |

---

## 🎯 Future Enhancements

### **Short Term (Planned)**
- [ ] Add remaining tools (comments, collections, topics, users)
- [ ] Unit and integration tests (70%+ coverage)
- [ ] Performance benchmarking
- [ ] Prometheus metrics

### **Medium Term**
- [ ] GraphQL subscriptions (real-time updates)
- [ ] Webhook support for events
- [ ] Advanced search with filters
- [ ] Batch operations

### **Long Term**
- [ ] Analytics dashboard
- [ ] Automated product tracking
- [ ] AI-powered insights
- [ ] Custom alerting

---

## 📄 License

MIT

---

## 🤝 Support

- **Documentation**: [Product Hunt API Docs](https://www.producthunt.com/v2/docs)
- **Issues**: GitHub Issues
- **Integration Guide**: See GitHub/LinkedIn unified servers for reference
- **Code Review**: `.claude/docs/integration-reports/producthunt/implementation-review.md`

---

**Built with ❤️ following the Connectors Platform unified architecture pattern**
