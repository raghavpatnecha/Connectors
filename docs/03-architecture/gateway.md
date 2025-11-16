# Gateway Architecture

## Overview

The MCP Gateway is the central orchestration layer that sits between AI agents and 500+ integration servers. It implements intelligent tool selection, relationship discovery, token optimization, and transparent OAuth management.

## Core Responsibilities

1. **Semantic Routing:** Select relevant tools from 500+ options using FAISS vector search
2. **GraphRAG Enhancement:** Discover related tools via Neo4j relationship graph
3. **Token Optimization:** Enforce token budgets and progressive schema loading
4. **OAuth Proxy:** Inject per-tenant credentials transparently
5. **Caching:** Cache embeddings, tool selections, and credentials
6. **Monitoring:** Track performance metrics and usage patterns

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Gateway API Layer                        │
│  • Express.js REST API                                      │
│  • MCP protocol support (HTTP/WebSocket)                    │
│  • Request validation and rate limiting                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 Routing & Selection Layer                   │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ SemanticRouter   │  │  GraphRAGService            │    │
│  │ - FAISS search   │  │  - Neo4j relationships      │    │
│  │ - 2-level retrieval  │  - 2-hop traversal         │    │
│  │ - Embedding cache│  │  - Confidence scoring       │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Optimization Layer                         │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ TokenOptimizer   │  │  ProgressiveLoader          │    │
│  │ - Budget enforce │  │  - 3-tier schemas           │    │
│  │ - Prioritization │  │  - Lazy loading             │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Authentication Layer                      │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  OAuthProxy      │  │  VaultClient                │    │
│  │ - Credential     │  │  - Per-tenant encryption    │    │
│  │   injection      │  │  - Auto-refresh scheduling  │    │
│  │ - Auto-retry     │  │  - Audit logging            │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     MCP Client Layer                        │
│  • HTTP/WebSocket clients for MCP servers                  │
│  • Connection pooling and retry logic                      │
│  • Request/response serialization                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              MCP Integration Servers
```

## Request Flow

### 1. Tool Selection Request

```
Agent → Gateway
POST /api/v1/tools/select
{
  "query": "Create a pull request on GitHub",
  "tenantId": "acme-corp",
  "tokenBudget": 2000,
  "allowedCategories": ["code"]
}

Gateway Processing:
1. Validate request and tenant authorization
2. Check Redis cache for query+context hash
3. If cache miss:
   a. Generate query embedding (OpenAI)
   b. FAISS category selection (top 3)
   c. FAISS tool selection within categories (top 5)
   d. GraphRAG enhancement (add 2-3 related)
   e. Token optimization (enforce budget)
   f. Progressive loading (assign tiers)
   g. Cache result (1 hour TTL)
4. Return tiered tool set

Response:
{
  "tier1": [
    {
      "id": "github.createPullRequest",
      "name": "Create Pull Request",
      "description": "Create a new pull request",
      "tier": 1
    }
  ],
  "tier2": [...],
  "tier3": [...],
  "totalTokens": 450,
  "reductionPercentage": 99.8,
  "metrics": {
    "selectionLatencyMs": 67,
    "faissLatencyMs": 42,
    "graphragLatencyMs": 18,
    "cacheHit": false
  }
}
```

### 2. Tool Invocation Request

```
Agent → Gateway
POST /api/v1/tools/invoke
{
  "tenantId": "acme-corp",
  "toolId": "github.createPullRequest",
  "arguments": {
    "repo": "owner/repo",
    "title": "Feature XYZ",
    "head": "feature-branch",
    "base": "main"
  }
}

Gateway Processing:
1. Validate tool exists and tenant has access
2. Fetch OAuth credentials from Vault:
   a. Read encrypted token: secret/data/acme-corp/github
   b. Decrypt with tenant key: transit/decrypt/acme-corp
   c. Check expiry, auto-refresh if < 5 min remaining
3. Inject Authorization header
4. Forward request to MCP server
5. Handle errors (401 → force refresh, 429 → rate limit)
6. Update tool usage count in Neo4j
7. Return response

Response:
{
  "success": true,
  "result": {
    "number": 123,
    "url": "https://github.com/owner/repo/pull/123",
    "state": "open"
  },
  "metrics": {
    "latencyMs": 342,
    "oauthFetchMs": 12,
    "mcpCallMs": 318
  }
}
```

## Multi-Tenant OAuth Management

### Vault Storage Structure

```
secret/data/{tenantId}/oauth-configs/{integration}  # OAuth app config
secret/data/{tenantId}/{integration}                 # Access tokens
transit/keys/{tenantId}                              # Encryption keys
```

### OAuth Flow

**1. Setup:** Store OAuth app credentials per tenant via API
**2. Authorization:** User approves, gateway exchanges code for tokens
**3. Usage:** OAuthProxy transparently injects credentials
**4. Refresh:** Background job auto-refreshes 5 min before expiry

**Key Features:**
- Per-tenant encryption with Vault transit engine
- Transparent credential injection (MCP servers don't handle auth)
- Auto-refresh scheduling
- Audit logging

## Caching Strategy

### Redis Cache Layers

**1. Embedding Cache (24h TTL)**
```
Key: embedding:{sha256(text)}
Value: [0.12, 0.45, ..., 0.89] (1536-dim vector)
Purpose: Avoid redundant OpenAI API calls
```

**2. Tool Selection Cache (1h TTL)**
```
Key: tool-selection:{sha256(query+context)}
Value: {tier1: [...], tier2: [...], tier3: [...], metrics: {...}}
Purpose: Instant response for repeated queries
```

**3. OAuth Token Cache (5min TTL)**
```
Key: oauth-token:{tenantId}:{integration}
Value: {access_token, expires_at, scopes}
Purpose: Reduce Vault round-trips for frequent tool calls
```

### Cache Invalidation

- **Embedding:** Never (immutable for given text)
- **Tool Selection:** Time-based (1h) + manual invalidation on index update
- **OAuth Token:** Time-based (5min) + immediate invalidation on refresh

## Error Handling

**Tool Selection Errors:** Fallback to popular tools or keyword matching
**OAuth Errors (401/403):** Force refresh or request permission grant
**Rate Limiting (429):** Return Retry-After header with reset time
**Graceful Degradation:** Redis/Vault failures don't crash gateway

## Performance Optimization

**Connection Pooling:**
- Redis: Fail-fast, no offline queue
- Neo4j: 50 max connections, 60s timeout
- Vault: HTTP keep-alive, 100 max sockets

**Batch Operations:**
- Embeddings: 100 per OpenAI batch
- Redis: mget for multiple keys
- Neo4j: UNWIND for bulk inserts

## Monitoring

**Prometheus Metrics:**
- `tool_selection_latency_ms` - Routing time
- `token_reduction_percentage` - Optimization effectiveness
- `cache_hit_rate` - Redis performance
- `oauth_refresh_count` - Credential refresh rate

**Structured Logs (Winston → ELK):**
- Request tracing with context
- Performance breakdown per component
- Error stack traces with tenant/integration info

## API Endpoints

**Tool Operations:**
- `POST /api/v1/tools/select` - Select tools
- `POST /api/v1/tools/invoke` - Invoke tool
- `GET /api/v1/tools/:toolId/schema` - Lazy load schema

**OAuth Management:**
- `POST /api/v1/tenants/:tenantId/integrations/:integration/oauth-config`
- `GET /api/v1/oauth/authorize/:integration`

**Admin:** `/health`, `/metrics`, `/cache/invalidate`

## Configuration

**Key Environment Variables:**
- `OPENAI_API_KEY`, `REDIS_URL`, `NEO4J_URI`, `VAULT_ADDR`
- `CATEGORY_INDEX_PATH`, `TOOL_INDEX_PATH`
- `DEFAULT_TOKEN_BUDGET=3000`, `MAX_TOOLS_PER_QUERY=5`

## Next Steps

- **Semantic Routing Details:** [semantic-routing.md](./semantic-routing.md)
- **GraphRAG Implementation:** [graphrag.md](./graphrag.md)
- **Token Optimization:** [token-optimization.md](./token-optimization.md)
- **OAuth Setup Guide:** [../02-guides/oauth-setup.md](../02-guides/oauth-setup.md)
