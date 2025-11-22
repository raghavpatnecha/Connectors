# Connectors Platform - Complete Request Flow Diagrams

**Date:** November 22, 2024  
**Purpose:** Visual documentation of all request flows through the system  
**Status:** Complete Reference Guide

---

## 1. MAIN REQUEST FLOWS

### 1.1 Tool Selection Flow (High Detail)

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION                          │
│  TypeScript SDK:                Python SDK:                         │
│  connectors.tools.select()      await connectors.tools.select()    │
│  (connectors-client.ts)         (tools.py)                         │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
                    POST /api/v1/tools/select
                    Content-Type: application/json
                    {
                      "query": "create a GitHub pull request",
                      "context": {
                        "allowedCategories": ["code"],
                        "tokenBudget": 2000,
                        "maxTools": 5
                      }
                    }
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                     MCP GATEWAY (Express.js)                       │
│                    (gateway/src/server.ts:328)                     │
│                                                                    │
│  handleSelectTools()                                              │
│  1. Validate query (required, string)                            │
│  2. Build QueryContext from request.body.context                │
│  3. Call semanticRouter.selectTools(query, context)             │
│  4. Call tokenOptimizer.optimize(tools, budget)                 │
│  5. Call progressiveLoader.loadTiered(tools, budget)            │
│  6. Format response with tiered tools                           │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
                    semanticRouter.selectTools()
                    (routing/semantic-router.ts:86)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                       REDIS CACHE LAYER                           │
│                    (caching/redis-cache.ts)                       │
│                                                                    │
│  Key: "tool-selection:{query_hash}:{context_hash}"               │
│  TTL: 3600 seconds (1 hour)                                      │
│  Hit Rate Target: 50-60%                                         │
│                                                                    │
│  [CACHE HIT] ──────────────────────────────────────┐             │
│                                                    │             │
│  [CACHE MISS] ──► Continue to embedding service   │             │
└─────────────────────────────────┬─────────────────┼─────────────┘
                                  │                 │
                    Embed query with OpenAI        │
                    (routing/embedding-service.ts)  │
                                  │                 │
                                  ▼                 │
┌────────────────────────────────────────────────────────────────────┐
│                      OPENAI EMBEDDING API                         │
│                                                                    │
│  Model: text-embedding-3-small                                  │
│  Dimensions: 1536                                               │
│  Cost: $0.02 per 1M tokens                                      │
│  Latency: 20-30ms p95                                           │
│                                                                    │
│  Input: "create a GitHub pull request"                          │
│  Output: [0.0125, -0.0089, ..., 0.0254] (1536 floats)          │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              FAISS Category Index Search
              (routing/faiss-index.ts)
              IndexFlatL2 distance metric
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    FAISS INDEX (Memory-Mapped)                    │
│                                                                    │
│  Categories Index:                                              │
│  - Dimension: 1536 (OpenAI embedding dimension)                │
│  - Vectors: ~15 (one per category)                             │
│  - Size: ~200KB (on disk)                                      │
│  - Latency: 5-10ms                                             │
│                                                                    │
│  Search Results:                                                │
│  1. "code" - distance: 0.08 (relevance: 0.92)  ✓               │
│  2. "comms" - distance: 0.13 (relevance: 0.87) ✓               │
│  3. "pm" - distance: 0.28 (relevance: 0.72)    ✓               │
│  4. "cloud" - distance: 0.45 (relevance: 0.55) ✗ (< 0.7)      │
│                                                                    │
│  Threshold: CATEGORY_THRESHOLD = 0.7                           │
│  Filtered Results: ["code", "comms", "pm"]                     │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
          FAISS Tool Index Search (within categories)
          (routing/semantic-router.ts:150)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    FAISS TOOL INDEX (Memory-Mapped)               │
│                                                                    │
│  Tools Index:                                                    │
│  - Dimension: 1536                                              │
│  - Vectors: ~368 (one per tool)                                │
│  - Size: ~4.7MB (on disk)                                      │
│  - Latency: 10-15ms                                            │
│                                                                    │
│  Filter by categories: ["code", "comms", "pm"]                 │
│                                                                    │
│  Search Results (top 5):                                        │
│  1. "github.createPullRequest" - relevance: 0.95  ✓            │
│  2. "slack.postMessage" - relevance: 0.93        ✓            │
│  3. "github.mergePullRequest" - relevance: 0.78  ✓            │
│  4. "slack.uploadFile" - relevance: 0.68         ✓            │
│  5. "jira.createIssue" - relevance: 0.62         ✓            │
│  ...more results below threshold                              │
│                                                                    │
│  Threshold: TOOL_THRESHOLD = 0.5                               │
│  Final Results: 5 tools above threshold                        │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              GraphRAG Enhancement (if enabled)
              (graph/graphrag-service.ts)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                       NEO4J GRAPH DATABASE                         │
│                                                                    │
│  Query: Find related tools                                       │
│  MATCH (t:Tool)-[:OFTEN_USED_WITH*1..2]-(related:Tool)         │
│  WHERE t.id IN ['github.createPR', 'slack.postMessage', ...]   │
│  RETURN DISTINCT related                                        │
│                                                                    │
│  Latency: 20-40ms                                              │
│                                                                    │
│  Relationships Found:                                           │
│  - github.createPR ──[OFTEN_USED_WITH]──> github.mergePR       │
│  - github.createPR ──[DEPENDS_ON]──> github.authenticate       │
│  - slack.postMessage ──[OFTEN_USED_WITH]──> slack.uploadFile   │
│                                                                    │
│  Final Tools: Merge with original results                      │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
                Token Optimization
                (optimization/token-optimizer.ts)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                      TOKEN OPTIMIZATION LAYER                     │
│                                                                    │
│  Input Tools: 7 tools (after GraphRAG)                          │
│  Token Budget: 2000 tokens                                      │
│                                                                    │
│  1. Sort by relevance score (descending)                        │
│     Tools ordered: [0.95, 0.93, 0.78, 0.68, 0.62, ...]         │
│                                                                    │
│  2. Estimate tokens per tool:                                   │
│     - Full schema: ~450 tokens per tool                         │
│     - Medium (no examples): ~300 tokens                         │
│     - Minimal (name + desc): ~150 tokens                        │
│                                                                    │
│  3. Assign tiers within budget:                                │
│     Tier 1 (Minimal): github.createPR (150) + slack.postMsg (150) = 300 tokens
│     Tier 2 (Medium): github.mergePR (300) + slack.uploadFile (300) = 600 tokens
│     Tier 3 (Lazy): github.authenticate (URL only, 0 tokens)    │
│     Remaining Budget: 2000 - 900 = 1100 tokens                 │
│                                                                    │
│  Output: Tools with tier assignments and estimated costs       │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              Progressive Schema Loading
              (optimization/progressive-loader.ts)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                   PROGRESSIVE LOADER (3-TIER SYSTEM)              │
│                                                                    │
│  TIER 1 - MINIMAL SCHEMA (~150 tokens per tool)                 │
│  Includes:                                                       │
│  {                                                              │
│    "toolId": "github.createPullRequest",                        │
│    "name": "Create Pull Request",                               │
│    "description": "Create a new pull request in a repository",  │
│    "category": "code",                                          │
│    "relevanceScore": 0.95                                       │
│  }                                                              │
│                                                                    │
│  TIER 2 - MEDIUM SCHEMA (~300 tokens per tool)                  │
│  Includes above + parameters (no examples):                     │
│  {                                                              │
│    "parameters": [                                              │
│      {                                                           │
│        "name": "repo",                                          │
│        "type": "string",                                        │
│        "required": true,                                        │
│        "description": "Repository in format owner/repo"         │
│      },                                                          │
│      ...more parameters                                         │
│    ]                                                            │
│  }                                                              │
│                                                                    │
│  TIER 3 - FULL SCHEMA (Lazy loaded, 0 initial tokens)           │
│  {                                                              │
│    "toolId": "github.authenticate",                             │
│    "lazyLoadUrl": "/api/v1/tools/github.authenticate/schema"    │
│  }                                                              │
│                                                                    │
│  Total Tokens: Tier1 + Tier2 = 300 + 600 = 900 tokens          │
│  Remaining Budget: 2000 - 900 = 1100 tokens                    │
│  Token Reduction: (2000 - 900) / 2000 = 55% (from full schema) │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
                        Cache Result
                        (Redis Cache)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                     HTTP RESPONSE (200 OK)                        │
│                                                                    │
│  {                                                              │
│    "success": true,                                             │
│    "tools": {                                                   │
│      "tier1": [                                                 │
│        {                                                         │
│          "toolId": "github.createPullRequest",                  │
│          "name": "Create Pull Request",                         │
│          "description": "Create a new pull request...",         │
│          "category": "code",                                    │
│          "relevanceScore": 0.95                                 │
│        },                                                        │
│        {                                                         │
│          "toolId": "slack.postMessage",                         │
│          "name": "Post Message",                                │
│          "description": "Post a message to a channel...",       │
│          "category": "comms",                                   │
│          "relevanceScore": 0.93                                 │
│        }                                                         │
│      ],                                                          │
│      "tier2": [                                                 │
│        {                                                         │
│          "toolId": "github.mergePullRequest",                   │
│          "name": "Merge Pull Request",                          │
│          "description": "Merge a pull request...",              │
│          "parameters": [                                        │
│            {                                                     │
│              "name": "pullNumber",                              │
│              "type": "number",                                  │
│              "description": "Pull request number"               │
│            },                                                    │
│            ...                                                  │
│          ],                                                      │
│          "relevanceScore": 0.78                                 │
│        }                                                         │
│        ...                                                      │
│      ],                                                          │
│      "tier3": [                                                 │
│        {                                                         │
│          "toolId": "github.authenticate",                       │
│          "lazyLoadUrl": "/api/v1/tools/github.authenticate/schema",
│          "relevanceScore": 0.55                                 │
│        }                                                         │
│      ]                                                           │
│    },                                                            │
│    "performance": {                                             │
│      "totalTools": 7,                                           │
│      "toolsSelected": 7,                                        │
│      "tokenBudget": 2000,                                       │
│      "tokenUsage": 900,                                         │
│      "tokenReduction": "55%",                                   │
│      "latency_ms": 87                                           │
│    }                                                             │
│  }                                                              │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
                        SDK receives response
                        (tools.py:72)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                            │
│                                                                    │
│  tools = [                                                      │
│    Tool(toolId="github.createPullRequest", ...),               │
│    Tool(toolId="slack.postMessage", ...),                      │
│    ...                                                          │
│  ]                                                              │
│                                                                    │
│  Now agent has only relevant tools with minimal tokens!        │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2 Tool Invocation Flow (High Detail)

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION                          │
│  TypeScript SDK:                    Python SDK:                     │
│  connectors.tools.invoke(            await connectors.tools.invoke( │
│    toolId, parameters)                 toolId, parameters)         │
│  (tools.ts)                          (tools.py:112)               │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
                    POST /api/v1/tools/invoke
                    {
                      "toolId": "github.createPullRequest",
                      "integration": "github",
                      "tenantId": "acme-corp",
                      "parameters": {
                        "repo": "acme-corp/product",
                        "title": "Add feature X",
                        "head": "feature/x",
                        "base": "main",
                        "body": "Feature description"
                      }
                    }
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    MCP GATEWAY (Express.js)                        │
│                  (gateway/src/server.ts:404)                       │
│                                                                    │
│  handleInvokeTool()                                              │
│  1. Validate required fields: toolId, integration, tenantId      │
│  2. Apply authorizeTenant middleware (verify tenant match)       │
│  3. Call oauthProxy.proxyRequest()                              │
│  4. Catch OAuthError → return 401                               │
│  5. Log performance metrics                                      │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              oauthProxy.proxyRequest()
              (auth/oauth-proxy.ts:82)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    OAUTH PROXY REQUEST HANDLER                     │
│                                                                    │
│  Input:                                                          │
│  {                                                              │
│    tenantId: "acme-corp",                                       │
│    integration: "github",                                       │
│    method: "POST",                                              │
│    path: "/tools/github.createPullRequest/invoke",             │
│    parameters: {...}                                            │
│  }                                                              │
│                                                                    │
│  Step 1: Retrieve OAuth Config                                 │
│  - Look up github OAuth config for acme-corp                   │
│  - Use cached config if available (<5s old)                    │
│  - Config includes: clientId, clientSecret, redirectUri        │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              Retrieve Credentials from Vault
              (auth/vault-client.ts)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                   HASHICORP VAULT (HashiCorp)                      │
│                                                                    │
│  Request:                                                         │
│  GET /v1/secret/data/acme-corp/github                           │
│  X-Vault-Token: {vault_token}                                   │
│                                                                    │
│  Latency: 20-50ms (usually 20-30ms with TLS)                    │
│                                                                    │
│  Response:                                                        │
│  {                                                              │
│    "data": {                                                     │
│      "data": {                                                   │
│        "access_token": "ghu_16C7e42...encrypted",               │
│        "refresh_token": "ghr_1B4a2e...encrypted",               │
│        "expires_at": 1700000000,                                │
│        "scopes": ["repo", "workflow"]                           │
│      },                                                          │
│      "metadata": {                                              │
│        "created_time": "2024-11-20T10:30:00Z",                  │
│        "custom_metadata": {                                     │
│          "tenant": "acme-corp",                                 │
│          "auto_refresh": true,                                  │
│          "created_by": "api"                                    │
│        }                                                         │
│      }                                                           │
│    }                                                             │
│  }                                                              │
│                                                                    │
│  Security: Credentials encrypted with per-tenant key           │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              Decrypt Credentials (Transit Engine)
              (auth/vault-client.ts:decrypt)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                      OAUTH PROXY (CONTINUED)                      │
│                                                                    │
│  Step 2: Check Token Expiry                                     │
│  - Current time: 1700000050                                     │
│  - Token expires: 1700000000                                    │
│  - Status: ❌ EXPIRED                                            │
│                                                                    │
│  Action: Refresh Token                                         │
│  Call: oauth2.refreshToken({                                   │
│    grant_type: "refresh_token",                                │
│    refresh_token: "{decrypted_refresh_token}",                 │
│    client_id: "{github_oauth_client_id}",                      │
│    client_secret: "{github_oauth_client_secret}"              │
│  })                                                             │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              OAuth2 Token Refresh
              (e.g., GitHub OAuth Endpoint)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│               GITHUB OAUTH 2.0 TOKEN ENDPOINT                     │
│            https://github.com/login/oauth/access_token           │
│                                                                    │
│  Request:                                                         │
│  POST /login/oauth/access_token                                 │
│  Content-Type: application/x-www-form-urlencoded                │
│                                                                    │
│  client_id=acme_oauth_id                                        │
│  &client_secret=acme_oauth_secret                               │
│  &grant_type=refresh_token                                      │
│  &refresh_token=ghr_1B4a2e42...                                 │
│                                                                    │
│  Response (200 OK):                                              │
│  {                                                              │
│    "access_token": "ghu_16C7e42...new",                         │
│    "token_type": "bearer",                                      │
│    "expires_in": 3600                                           │
│  }                                                              │
│                                                                    │
│  Latency: 200-500ms (depends on GitHub API)                     │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              Update Vault with New Token
              (auth/vault-client.ts:update)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                   HASHICORP VAULT (UPDATE)                         │
│                                                                    │
│  Request:                                                         │
│  POST /v1/secret/data/acme-corp/github                          │
│  X-Vault-Token: {vault_token}                                   │
│                                                                    │
│  {                                                              │
│    "data": {                                                     │
│      "access_token": "ghu_16C7e42...new",                       │
│      "refresh_token": "ghr_1B4a2e...",                          │
│      "expires_at": {current_time + 3600}                        │
│    }                                                             │
│  }                                                              │
│                                                                    │
│  Response: Success, version incremented                         │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              Schedule Auto-Refresh (5 min before expiry)
              (auth/refresh-scheduler.ts)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                  OAUTH PROXY (TOKEN READY)                        │
│                                                                    │
│  Step 3: Build Authorization Header                            │
│  Authorization: "Bearer ghu_16C7e42...new"                      │
│                                                                    │
│  Step 4: Forward Request to MCP Server                          │
│  URL: http://localhost:4000/tools/github.createPullRequest/invoke
│  Headers:                                                        │
│  {                                                              │
│    "Authorization": "Bearer ghu_16C7e42...",                    │
│    "Content-Type": "application/json",                          │
│    "X-Request-ID": "req_12345abc",                              │
│    "X-Tenant-ID": "acme-corp"                                   │
│  }                                                              │
│  Body:                                                           │
│  {                                                              │
│    "repo": "acme-corp/product",                                 │
│    "title": "Add feature X",                                    │
│    "head": "feature/x",                                         │
│    "base": "main",                                              │
│    "body": "Feature description"                                │
│  }                                                              │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              MCP Server HTTP Call
              (MCP_BASE_URL/tools/...)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                   GITHUB MCP SERVER (Node.js)                      │
│            (integrations/github-integration.ts)                    │
│                                                                    │
│  Receive Request:                                               │
│  1. Validate authorization header                              │
│  2. Parse parameters                                            │
│  3. Call github.createPullRequest() tool                       │
│                                                                    │
│  Tool Implementation:                                           │
│  POST https://api.github.com/repos/acme-corp/product/pulls     │
│  Authorization: Bearer ghu_16C7e42...                           │
│  {                                                              │
│    "title": "Add feature X",                                    │
│    "head": "feature/x",                                         │
│    "base": "main",                                              │
│    "body": "Feature description"                                │
│  }                                                              │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              GitHub API Call
              (https://api.github.com/)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                       GITHUB API (GitHub)                          │
│                                                                    │
│  Endpoint: POST /repos/{owner}/{repo}/pulls                     │
│  Latency: 300-500ms (includes authentication check)             │
│                                                                    │
│  Response (201 Created):                                        │
│  {                                                              │
│    "id": 1296269,                                               │
│    "number": 1347,                                              │
│    "state": "open",                                             │
│    "title": "Add feature X",                                    │
│    "body": "Feature description",                               │
│    "user": {                                                     │
│      "login": "acme-corp[bot]",                                 │
│      "id": 123456                                               │
│    },                                                            │
│    "html_url": "https://github.com/acme-corp/product/pull/1347",
│    "created_at": "2024-11-22T10:35:00Z",                        │
│    "updated_at": "2024-11-22T10:35:00Z",                        │
│    "head": {                                                     │
│      "ref": "feature/x",                                        │
│      "sha": "abcd1234..."                                       │
│    },                                                            │
│    "base": {                                                     │
│      "ref": "main",                                             │
│      "sha": "5678efgh..."                                       │
│    }                                                             │
│  }                                                              │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              MCP Server Returns Response
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                   GITHUB MCP SERVER (RESPONSE)                     │
│                                                                    │
│  HTTP 200 OK                                                    │
│  {                                                              │
│    "success": true,                                             │
│    "data": {                                                     │
│      "number": 1347,                                            │
│      "html_url": "https://github.com/acme-corp/product/pull/1347",
│      "state": "open",                                           │
│      "title": "Add feature X"                                   │
│    }                                                            │
│  }                                                              │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              OAuth Proxy Receives Response
              (auth/oauth-proxy.ts:response handler)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    OAUTH PROXY (RESPONSE)                         │
│                                                                    │
│  Step 5: Handle Response                                       │
│  Status Code: 200 (Success)                                    │
│  Response Body: {success: true, data: {...}}                   │
│                                                                    │
│  Check: If 401 (Unauthorized)                                  │
│  - Force refresh would occur here                              │
│  - Retry request with new token                                │
│                                                                    │
│  Log Performance Metrics:                                       │
│  {                                                              │
│    "toolId": "github.createPullRequest",                        │
│    "integration": "github",                                     │
│    "tenantId": "acme-corp",                                     │
│    "status": "success",                                         │
│    "latency_ms": 420,                                           │
│    "components": {                                              │
│      "vault_fetch_ms": 25,                                      │
│      "token_refresh_ms": 350,  // had to refresh                │
│      "mcp_call_ms": 350,                                        │
│      "oauth_proxy_overhead_ms": 10                              │
│    }                                                             │
│  }                                                              │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              Gateway Returns Response
              (server.ts:436)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                    MCP GATEWAY (RESPONSE)                         │
│                                                                    │
│  HTTP 200 OK                                                    │
│  Content-Type: application/json                                 │
│  {                                                              │
│    "success": true,                                             │
│    "toolId": "github.createPullRequest",                        │
│    "result": {                                                  │
│      "number": 1347,                                            │
│      "html_url": "https://github.com/acme-corp/product/pull/1347",
│      "state": "open",                                           │
│      "title": "Add feature X"                                   │
│    },                                                            │
│    "performance": {                                             │
│      "latency_ms": 420,                                         │
│      "components": {                                            │
│        "vault_ms": 25,                                          │
│        "refresh_ms": 350,                                       │
│        "mcp_ms": 350,                                           │
│        "gateway_ms": 10                                         │
│      }                                                           │
│    }                                                             │
│  }                                                              │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
              SDK Receives Response
              (tools.py:166)
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                            │
│                                                                    │
│  response = ToolInvocationResponse(                             │
│    success=True,                                                │
│    data={                                                       │
│      'number': 1347,                                            │
│      'html_url': 'https://github.com/acme-corp/product/pull/1347',
│      'state': 'open',                                           │
│      'title': 'Add feature X'                                   │
│    }                                                             │
│  )                                                              │
│                                                                    │
│  Agent can now process PR creation result!                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. ERROR HANDLING FLOWS

### 2.1 OAuth Token Refresh Failure Flow

```
OAuth Token Expired During Invocation
        │
        ▼
[Vault GET] ──retrieve token──> Token.expiresAt < now
        │                               │
        │                               ▼
        │                    [Call OAuth Provider]
        │                    ↓
        │                GitHub OAuth Token Endpoint
        │                    │
        │                    ├─ Success (200) ────► Update Vault ──► Retry Request
        │                    │
        │                    └─ Error:
        │                        │
        │                        ├─ 400 (Invalid Request)
        │                        │   → RefreshTokenExpiredError
        │                        │   → Return 401 to SDK
        │                        │   → SDK should reconfigure OAuth
        │                        │
        │                        ├─ 401 (Invalid Client)
        │                        │   → OAuthClientError
        │                        │   → Return 500 (server config issue)
        │                        │
        │                        └─ Network Timeout
        │                            → TokenRefreshError
        │                            → Return 504 (Gateway Timeout)
        │
        └─> [Vault SET] Fails
            │
            ├─ 403 Forbidden ────► Vault Token Expired
            │                      Circuit Breaker: Disable Vault requests
            │                      Cached tokens used (if available)
            │
            └─ 500 Error ────────► Vault Down
                                   Return 503 Service Unavailable
```

### 2.2 Tool Invocation with Invalid OAuth Config

```
SDK: invoke(toolId, parameters)
        │
        ▼
Gateway: handleInvokeTool()
        │
        ├─ Validate toolId, integration, tenantId ──► OK
        │
        ▼
OAuthProxy: proxyRequest()
        │
        ├─ [Vault GET] secret/data/{tenantId}/{integration}
        │
        ├─ 404 Not Found
        │   └─> CredentialNotFoundError
        │       │
        │       ▼
        │       Gateway returns 401
        │       Message: "OAuth credentials not configured for {integration}"
        │
        │       SDK catches HTTPError(401)
        │       └─> Application should call:
        │           connectors.mcp.configure_oauth(tenantId, integration, credentials)
        │
        └─ 200 OK but no access_token in response
            └─> ValidationError
                │
                ▼
                Gateway returns 500
                Message: "Invalid OAuth config structure"
```

---

## 3. CONCURRENT REQUEST HANDLING

### 3.1 Tool Selection Cache Hit with Concurrent Requests

```
Request 1: Select tools for "create PR"
Request 2: Select tools for "create PR"    (concurrent, same query)
Request 3: Select tools for "create PR"    (concurrent, same query)
        │              │                    │
        ▼              ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│        Check Redis Cache (key: tool-sel:{hash})             │
│                                                              │
│ Request 1: MISS ───► Compute + Cache ───► Return           │
│ Request 2: MISS ───► Compute (parallel) ──► Return (faster) │
│ Request 3: MISS ───► Compute (parallel) ──► Return (fastest)│
└──────────────────────────────────────────────────────────────┘

Result: All 3 requests compute in parallel
        (no cache contention if using async I/O)
        
Optimization opportunity: Use cache-aside pattern with locks
        to avoid thundering herd for popular queries
```

### 3.2 OAuth Token Refresh with Concurrent Requests

```
Request 1: Invoke tool with expired token
Request 2: Invoke same tool (concurrent, same expired token)
        │              │
        ▼              ▼
┌──────────────────────────────────────────────────────────────┐
│        Check Token Expiry                                   │
│                                                              │
│ Request 1: expiresAt < now ──► [Vault GET] ──► Refresh    │
│ Request 2: expiresAt < now ──► [Vault GET] ──► WAIT       │
│                                                              │
│ Problem: Both could attempt refresh simultaneously!        │
│ This causes:                                               │
│ - 2x OAuth provider calls (quota issues)                   │
│ - Potential race condition on token storage                │
│ - 2x Vault writes for same refresh                         │
└──────────────────────────────────────────────────────────────┘

CURRENT BUG: No distributed lock mechanism
SOLUTION NEEDED: Implement Redis-based lock
        
        Request 1: [Redis SET lock:acme:github NX EX 5]
                   ✓ Lock acquired
                   └─► Refresh token
                       └─► [Vault SET] new tokens
                           └─► [Redis DEL] lock
                               └─► Retry request
        
        Request 2: [Redis SET lock:acme:github NX EX 5]
                   ✗ Lock failed (already held)
                   └─► Wait for lock release
                       └─► Check Vault for updated token
                           └─► Use new token
                               └─► Retry request
```

---

## 4. PERFORMANCE TIMING DIAGRAMS

### 4.1 Tool Selection Total Latency Breakdown

```
Timeline (0-110ms):

0ms  ├─ Request arrives at Gateway
     │
1ms  ├─ Query validation
     │
2ms  ├─ Cache lookup (Redis)
     │
3ms  ├─ MISS: Call OpenAI embedding API (async start)
     │
     │
25ms ├─ OpenAI response received (embedding ready)
     │
26ms ├─ FAISS category search (IndexFlatL2)
     │
36ms ├─ FAISS tool search (IndexFlatL2)
     │
     │
65ms ├─ Call Neo4j for GraphRAG (if enabled)
     │
     │
95ms ├─ GraphRAG response received
     │
96ms ├─ Token optimization
     │
97ms ├─ Progressive schema loading
     │
98ms ├─ Format response JSON
     │
     │
103ms ├─ Redis cache write (TTL 3600s)
      │
105ms ├─ HTTP response sent
      │
      └─► Total: ~105ms (P95 with GraphRAG)

Without GraphRAG:
0ms  ├─ Request ──► 1ms validation ──► 2ms cache check
     │
3ms  ├─ Embedding API (async)
     │
25ms ├─ Category FAISS search
     │
35ms ├─ Tool FAISS search
     │
38ms ├─ Token optimization ──► 39ms cache write ──► 40ms response sent
     │
     └─► Total: ~40ms (P95 without GraphRAG)
```

### 4.2 Tool Invocation Latency Breakdown (With Token Refresh)

```
Timeline (0-550ms):

0ms   ├─ Request arrives at Gateway
      │
2ms   ├─ Validation + authorization
      │
3ms   ├─ OAuth proxy receives request
      │
4ms   ├─ [Vault GET] acme-corp/github (async)
      │
25ms  ├─ Vault response: token expired
      │
26ms  ├─ [OAuth Provider] token refresh (async)
      │
300ms ├─ OAuth provider response
      │
301ms ├─ Decrypt new token
      │
302ms ├─ [Vault SET] new tokens (async)
      │
327ms ├─ Vault response: stored
      │
328ms ├─ Build Authorization header
      │
329ms ├─ [MCP Server Call] github.createPR (async)
      │
      │
520ms ├─ MCP response: PR created
      │
521ms ├─ Format response
      │
530ms ├─ Cache credentials
      │
535ms ├─ Log metrics
      │
540ms ├─ HTTP response sent
      │
      └─► Total: ~540ms (P95 with token refresh)

WITHOUT token refresh (cached/valid):
0ms   ├─ Request ──► 2ms validation ──► 3ms proxy
      │
25ms  ├─ [Vault GET] (cached in memory, <1ms)
      │
26ms  ├─ [MCP Server Call]
      │
      │
320ms ├─ MCP response
      │
      └─► Total: ~320ms (P95 without refresh)
```

---

## 5. SYSTEM FAILURE SCENARIOS

### 5.1 Redis Unavailable

```
Tool Selection Request
        │
        ▼
Try: [Redis GET] cache
        │
        ├─ Redis down (ECONNREFUSED)
        │
        ▼
Fallback: Skip cache, compute fresh
        │
        ├─ Compute embeddings
        ├─ Search FAISS
        ├─ Query GraphRAG
        │
        └─ Response sent to client
        
Retry: [Redis SET] cache (async)
        │
        ├─ Fails again
        ├─ Log warning
        └─ Continue (no cache, but app works)

Result: ✅ Graceful degradation
Performance: ⚠️ Higher latency without cache
Impact: Moderate (20% slower without cache)
```

### 5.2 Vault Unavailable

```
Tool Invocation Request
        │
        ▼
[Vault GET] secret/data/tenant/integration
        │
        ├─ Connection timeout (10s)
        │
        ▼
Switch to In-Memory Credential Cache
        │
        ├─ Check if token cached from previous call
        │
        ├─ If cached and not expired:
        │   ├─ Use cached token
        │   ├─ Invoke tool
        │   └─ Return success ✅
        │
        └─ If not cached or expired:
            └─ Return 503 Service Unavailable ❌
               Circuit breaker triggered
               Subsequent requests fail fast (no retry)
               
Recovery:
        ├─ Vault comes back online
        ├─ Monitor health (healthcheck interval)
        ├─ Circuit breaker resets
        └─ Normal operation resumed

Impact: ⚠️ If Vault down >5 min: tool invocation fails
        ✅ If Vault down <5 min: cached tokens work
```

---

## 6. SCALING CHARACTERISTICS

### 6.1 Request Per Second (RPS) Capacity

```
Single Gateway Instance (4 CPU, 4GB RAM):

Tool Selection:
  - Per-request overhead: ~2-5ms (gateway)
  - Downstream latency: ~90-100ms (FAISS + Neo4j)
  - P99 latency: ~150ms
  - Single instance capacity: ~10-20 RPS
  - Note: Bottleneck is OpenAI embedding API

Tool Invocation:
  - Per-request overhead: ~5-10ms (gateway)
  - Downstream latency: ~200-500ms (MCP server)
  - P99 latency: ~1000ms
  - Single instance capacity: ~4-10 RPS
  - Note: Bottleneck is integration API (GitHub, etc.)

Horizontal Scaling:
  ├─ Add load balancer (Round-robin, health checks)
  ├─ Scale stateless gateway to N instances
  ├─ Share Redis for cache coherency
  ├─ Share Vault for credential management
  ├─ Share Neo4j for GraphRAG
  │
  └─ Scaling limits:
      ├─ Redis connections: ~1000 connections max
      ├─ Vault throughput: ~10,000 reads/sec
      ├─ Neo4j throughput: ~5,000 queries/sec
      ├─ OpenAI embedding API: Rate-limited per key
      └─ MCP servers: Depends on integration

Example scaling to 100 RPS:
  Gateway instances: 10 × (10 RPS) = 100 RPS
  Redis: 1 cluster (primary + replicas)
  Vault: 1 cluster (HA)
  Neo4j: 1 cluster (HA)
  OpenAI API: Batch requests, rate limit management
```

---

## 7. CACHE INVALIDATION STRATEGY

### 7.1 Query Result Cache (Redis)

```
Key: tool-selection:{query_hash}:{context_hash}
TTL: 1 hour (3600 seconds)

Invalidation Triggers:
  1. TTL expires
  2. Manual clear (admin operation)
  3. New tools added to system
  4. Tool descriptions updated
  5. Category definitions changed

Strategy: Lazy invalidation (no proactive clearing)
  ├─ New tools: Cache continues until TTL expires
  ├─ User impact: None (new tools eventually visible)
  ├─ Trade-off: Simplicity vs. immediate consistency

Alternative: Proactive invalidation
  ├─ Tool added: Clear all caches (Redis FLUSHDB)
  ├─ User impact: Immediate visibility
  ├─ Cost: Cache warming period needed

Current: ✅ Lazy invalidation (better for performance)
```

---

## 8. MONITORING & OBSERVABILITY

### 8.1 Key Metrics Emitted

```
Tool Selection Metrics:
  - tool_selection_completed
    {
      query,
      tools_selected,
      tools_optimized,
      token_budget,
      token_usage,
      latency_ms,
      token_reduction_pct,
      cache_hit,
      embedding_api_latency,
      faiss_latency,
      graphrag_latency
    }

Tool Invocation Metrics:
  - tool_invocation_completed
    {
      toolId,
      integration,
      tenantId,
      latency_ms,
      success,
      oauth_refresh,
      vault_latency,
      mcp_latency
    }

OAuth Metrics:
  - oauth_refresh_completed
    {
      integration,
      tenantId,
      success,
      latency_ms,
      provider
    }
  - oauth_token_expiry_upcoming
    {
      integration,
      tenantId,
      expiry_timestamp,
      minutes_until_expiry
    }

Health Check Metrics:
  - service_health_check
    {
      service,
      status (ok/failed),
      response_time_ms,
      last_check_timestamp
    }
```

---

**End of Request Flow Documentation**
