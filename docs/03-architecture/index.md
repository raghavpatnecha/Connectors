# Architecture Overview

## System Overview

The Connectors Platform is an AI Agent Integration Platform providing 15 integrations with 368 tools, achieving **95% token reduction** (1-3K tokens vs 250K traditional) through semantic routing, GraphRAG, and progressive loading.

## Core Problem

**MCP Token Bloat:** Traditional approaches load all 368 tools with full schemas (250K tokens), exhausting AI agent context windows and causing slow response times.

**Our Solution:** Intelligent tool selection that loads only relevant tools (5-10) with tiered schemas (1-3K tokens), enabling agents to work efficiently with hundreds of tools simultaneously.

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────┐
│                   AI Agent (Claude, etc.)                  │
│                     Query: "Create GitHub PR"              │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                      MCP Gateway                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Semantic Router (FAISS Vector Search)           │  │
│  │     • Embed query → [0.12, 0.45, ..., 0.89]        │  │
│  │     • Category selection: "code" (2-level)          │  │
│  │     • Tool selection: github.createPR (top 5)       │  │
│  │     Latency: <100ms                                 │  │
│  └─────────────────┬────────────────────────────────────┘  │
│  ┌─────────────────▼────────────────────────────────────┐  │
│  │  2. GraphRAG Enhancement (Neo4j)                    │  │
│  │     • Find related tools: mergePR, authenticate     │  │
│  │     • Relationship types: OFTEN_USED_WITH           │  │
│  │     • 2-hop traversal with confidence scoring       │  │
│  │     Latency: <50ms                                  │  │
│  └─────────────────┬────────────────────────────────────┘  │
│  ┌─────────────────▼────────────────────────────────────┐  │
│  │  3. Token Optimizer (Budget Management)             │  │
│  │     • Budget: 2000 tokens                           │  │
│  │     • Prioritize by relevance score                 │  │
│  │     • Tier assignment: T1(3), T2(2), T3(lazy)       │  │
│  └─────────────────┬────────────────────────────────────┘  │
│  ┌─────────────────▼────────────────────────────────────┐  │
│  │  4. Progressive Loader (3-Tier Schema)              │  │
│  │     • Tier 1: Minimal (name + desc) - 150 tokens    │  │
│  │     • Tier 2: Medium (+ params) - 300 tokens        │  │
│  │     • Tier 3: Lazy loaded - 0 immediate tokens      │  │
│  │     Total: 450 tokens (99.8% reduction)             │  │
│  └─────────────────┬────────────────────────────────────┘  │
│  ┌─────────────────▼────────────────────────────────────┐  │
│  │  5. OAuth Proxy (HashiCorp Vault)                   │  │
│  │     • Per-tenant credential injection               │  │
│  │     • Auto-refresh before expiry                    │  │
│  │     • Transparent authentication                    │  │
│  └─────────────────┬────────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┬──────────────┬────────┐
      ▼              ▼              ▼              ▼        ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────┐  ┌──────┐
│   Code   │   │  Comms   │   │    PM    │   │Cloud │  │ Data │
│  MCP (50)│   │ MCP (30) │   │ MCP (40) │   │MCP(80)  │MCP(50)│
├──────────┤   ├──────────┤   ├──────────┤   ├──────┤  ├──────┤
│ GitHub   │   │  Slack   │   │   Jira   │   │ AWS  │  │Notion│
│ GitLab   │   │  Teams   │   │  Linear  │   │ GCP  │  │Airtbl│
│Bitbucket │   │  Email   │   │ Asana    │   │Azure │  │Sheets│
└──────────┘   └──────────┘   └──────────┘   └──────┘  └──────┘
```

## Data Flow

### Query Processing Pipeline

```
User Query
    │
    ├─> 1. Query Embedding (OpenAI API, 1536-dim)
    │       └─> Cache check (Redis)
    │
    ├─> 2. Category Selection (FAISS L2 search)
    │       └─> Top 3 categories with confidence > 0.7
    │
    ├─> 3. Tool Selection (FAISS within categories)
    │       └─> Top 5 tools with confidence > 0.5
    │
    ├─> 4. GraphRAG Enhancement (Neo4j 2-hop)
    │       └─> Add 2-3 related tools (OFTEN_USED_WITH)
    │
    ├─> 5. Token Optimization (Budget enforcement)
    │       └─> Prioritize and assign tiers
    │
    ├─> 6. Progressive Loading (3-tier schemas)
    │       └─> T1: 3 tools, T2: 2 tools, T3: rest lazy
    │
    ├─> 7. OAuth Injection (Vault credentials)
    │       └─> Per-tenant token injection
    │
    └─> 8. MCP Tool Invocation
            └─> Return results to agent
```

## Key Components

### 1. Semantic Router
- **Purpose:** Intelligent tool selection using vector similarity
- **Technology:** FAISS IndexFlatL2, OpenAI embeddings
- **Performance:** <100ms for 500 tools
- **Details:** [semantic-routing.md](./semantic-routing.md)

### 2. GraphRAG Service
- **Purpose:** Enhance tool selection with relationship knowledge
- **Technology:** Neo4j graph database
- **Performance:** <50ms for 2-hop traversal
- **Details:** [graphrag.md](./graphrag.md)

### 3. Token Optimizer
- **Purpose:** Enforce token budgets and maximize relevance
- **Strategy:** Score-based prioritization with tier downgrading
- **Achievement:** 95-99% token reduction
- **Details:** [token-optimization.md](./token-optimization.md)

### 4. Progressive Loader
- **Purpose:** Load minimal schemas initially, lazy load details
- **Pattern:** Less-is-More three-tier loading
- **Tiers:** Minimal (T1) → Medium (T2) → Full/Lazy (T3)
- **Details:** [token-optimization.md](./token-optimization.md)

### 5. OAuth Proxy
- **Purpose:** Transparent multi-tenant authentication
- **Technology:** HashiCorp Vault with per-tenant encryption
- **Features:** Auto-refresh, credential isolation
- **Details:** [gateway.md](./gateway.md)

### 6. MCP Servers
- **Purpose:** Integration with 15 integrations, 368 tools
- **Categories:** Code, Communication, Productivity, Storage
- **Generation:** Auto-generated from OpenAPI specs
- **Details:** [../04-integrations/](../04-integrations/)

## Technology Stack

### Gateway (TypeScript)
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Vector Search:** FAISS (faiss-node)
- **Graph Database:** Neo4j (neo4j-driver)
- **Cache:** Redis (ioredis)
- **Secrets:** HashiCorp Vault (node-vault)
- **Embeddings:** OpenAI API (text-embedding-3-small)
- **Logging:** Winston (structured JSON)

### Infrastructure
- **Development:** Docker Compose
- **Production:** Kubernetes (EKS/GKE)
- **Monitoring:** Prometheus, Grafana
- **Tracing:** OpenTelemetry
- **CI/CD:** GitHub Actions

### MCP Servers (TypeScript)
- **Generation:** openapi-mcp-generator, FastMCP
- **Runtime:** Node.js 20+
- **Authentication:** OAuth 2.0 (via gateway proxy)
- **Transport:** HTTP, WebSocket (MCP protocol)

## Performance Targets

| Metric | Target | Achieved |
|--------|--------|----------|
| Token Reduction | 95% | 95-99.5% |
| Tool Selection Latency | <100ms | <80ms avg |
| GraphRAG Latency | <50ms | <50ms |
| Total Request Latency | <2s | <1.5s avg |
| Cache Hit Rate | >80% | 85%+ |
| Uptime | 99.9% | - |

## Scalability

### Current Capacity
- **Tools:** 368 (15 integrations)
- **Categories:** 4 (Code, Communication, Productivity, Storage)
- **Concurrent Requests:** 1000 req/s
- **Tool Relationships:** 500+

### Scaling Strategies
1. **Horizontal Scaling:** Gateway pods auto-scale based on CPU/memory
2. **FAISS Optimization:** Switch to IndexIVFFlat for >1000 tools
3. **Neo4j Clustering:** Multi-node cluster for high availability
4. **Redis Sharding:** Distributed cache for large deployments
5. **MCP Server Pooling:** Dynamic server spawning per category

## Security

### Multi-Tenancy
- **Isolation:** Per-tenant Vault encryption keys
- **Credentials:** Encrypted at rest, TLS in transit
- **Rate Limiting:** Per-tenant quotas (Redis-backed)

### Authentication Flow
```
Agent Request → Gateway (validate tenant)
    → Vault (fetch encrypted credentials)
    → Decrypt (tenant-specific key)
    → Inject (Authorization header)
    → MCP Server (transparent auth)
```

### Compliance
- **Secrets:** Never logged or persisted in plaintext
- **Audit:** All credential access logged to audit trail
- **Rotation:** Auto-refresh 5 minutes before expiry
- **Encryption:** AES-256-GCM (Vault transit engine)

## Monitoring & Observability

### Metrics (Prometheus)
- `tool_selection_latency_ms` - Semantic routing time
- `graphrag_enhancement_latency_ms` - Neo4j query time
- `token_reduction_percentage` - Optimization effectiveness
- `cache_hit_rate` - Redis cache performance
- `oauth_refresh_count` - Credential refresh rate
- `mcp_tool_invocation_count` - Tool usage tracking

### Logs (Winston → ELK)
- Structured JSON logs with request tracing
- Performance metrics per query
- Error stack traces with context
- OAuth refresh events

### Tracing (OpenTelemetry)
- End-to-end request tracing
- Distributed trace across services
- Latency breakdown by component

## Next Steps

### Implementation Guide
1. **Setup:** [../01-getting-started/](../01-getting-started/)
2. **Gateway Details:** [gateway.md](./gateway.md)
3. **Semantic Routing:** [semantic-routing.md](./semantic-routing.md)
4. **GraphRAG:** [graphrag.md](./graphrag.md)
5. **Token Optimization:** [token-optimization.md](./token-optimization.md)

### Development Guides
- [Multi-Tenant OAuth Setup](../02-guides/oauth/setup.md)
- [Adding New Integrations](../04-integrations/)
- [Deployment Runbook](../DEPLOYMENT_RUNBOOK.md)

### API Reference
- [Gateway API](../05-api-reference/)
- [MCP Protocol](../05-api-reference/)
- [Tenant OAuth API](../API_TENANT_OAUTH.md)
