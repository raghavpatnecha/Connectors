# Integration Documentation Index

**Connectors Platform** - 500+ tools across multiple categories

---

## Quick Navigation

### By Category

- [Communication](#communication) - 2 integrations
- [Code](#code) - 1 integration
- [Productivity](#productivity) - 1 integration
- [Storage](#storage) - Coming soon

### By Status

- ✅ **Production Ready:** LinkedIn, Reddit, GitHub, Notion
- 🚧 **In Development:** Google Workspace, Slack
- 📋 **Planned:** Dropbox, OneDrive, Salesforce

---

## Communication

### LinkedIn
**Status:** ✅ Complete | **Tools:** 13 | **OAuth:** Required

LinkedIn integration using hybrid approach (OAuth API + browser automation). Provides access to profiles, feed, posts, and company data.

**Key Features:**
- OAuth API (3 endpoints)
- Browser automation (Playwright)
- Multi-tenant credential isolation
- Auto-cookie generation from OAuth

**⚠️ Warning:** Browser automation may violate LinkedIn ToS. Use for personal/educational purposes only.

📄 [Read Full Documentation](./communication/linkedin.md)

---

### Reddit
**Status:** ✅ Complete | **Tools:** 25 | **OAuth:** Required

Comprehensive Reddit integration with browsing, searching, posting, and commenting capabilities. Built on official Snoowrap SDK.

**Key Features:**
- 100% coverage of 5 source repositories
- Smart rate limiting (60 req/min)
- Intelligent caching (LRU + TTL)
- Multi-tenant OAuth

**Categories:** Browse(8), Search(2), Posts(4), Comments(2), Subreddits(2), Users(3), Utils(1), Auth(5)

📄 [Read Full Documentation](./communication/reddit.md)

---

## Code

### GitHub
**Status:** ✅ Complete | **Tools:** 29 | **OAuth:** Required

Production-ready GitHub integration with official @octokit/rest SDK. Replaces 44 fragmented servers with single unified implementation.

**Key Features:**
- Official @octokit/rest SDK
- 29 tools across 4 domains
- 91% memory reduction (200MB vs 2.2GB)
- Multi-tenant OAuth via Vault

**Tool Categories:**
- Repositories (7 tools)
- Issues (6 tools)
- Pull Requests (8 tools)
- Actions (8 tools)

📄 [Read Full Documentation](./code/github.md)

---

## Productivity

### Notion
**Status:** ✅ Complete | **Tools:** 19 | **OAuth:** Required

Official Notion integration using @notionhq/client SDK. Provides comprehensive access to pages, databases, blocks, and search.

**Key Features:**
- OAuth 2.0 with Vault storage
- 19 tools across pages, databases, blocks
- 74% token reduction
- Semantic routing + GraphRAG

**Tool Categories:**
- Pages (5 tools)
- Databases (3 tools)
- Blocks (5 tools)
- Search & Users (4 tools)
- Comments (2 tools)

📄 [Read Full Documentation](./productivity/notion.md)

---

## Integration Comparison

| Integration | Status | Tools | OAuth | SDK | Memory | Approach |
|-------------|--------|-------|-------|-----|--------|----------|
| **LinkedIn** | ✅ Complete | 13 | Yes | Hybrid | ~200MB | API + Browser |
| **Reddit** | ✅ Complete | 25 | Yes | Snoowrap | ~150MB | Official API |
| **GitHub** | ✅ Complete | 29 | Yes | @octokit/rest | ~200MB | Official API |
| **Notion** | ✅ Complete | 19 | Yes | @notionhq/client | ~180MB | Official API |
| **Google Workspace** | 🚧 Dev | ~50 | Yes | googleapis | ~250MB | Official API |
| **Slack** | 📋 Planned | ~30 | Yes | @slack/web-api | ~150MB | Official API |

---

## Common Patterns

**OAuth 2.0:** Gateway → Provider auth → Token exchange → Vault storage (encrypted per-tenant) → Auto-refresh

**Multi-Tenant:** Each tenant has isolated credentials, encryption keys, and rate limits

**Semantic Routing:** "create PR on GitHub" → `github_create_pull_request` | "search Reddit" → `reddit_search_posts`

---

## Performance Metrics

### Token Optimization

| Metric | Traditional (All Tools) | Connectors (Selected) | Reduction |
|--------|------------------------|----------------------|-----------|
| LinkedIn | 2,015 tokens | ~400 tokens | 80% |
| Reddit | 3,875 tokens | ~760 tokens | 80% |
| GitHub | 4,495 tokens | ~900 tokens | 80% |
| Notion | 2,945 tokens | ~760 tokens | 74% |
| **Platform Total** | **250,000+ tokens** | **1,000-3,000 tokens** | **95%+** |

### Latency Targets

| Operation | Target | Typical |
|-----------|--------|---------|
| Semantic tool selection | <100ms | ~45ms |
| OAuth token fetch (cached) | <50ms | ~10ms |
| Tool invocation | <2s | 100-500ms |
| **Total end-to-end** | **<3s** | **<1s** |

---

## Getting Started

### 1. Choose Integration

Review documentation above and select integration(s) needed.

### 2. Setup Prerequisites

All integrations require:
- Node.js 18+
- HashiCorp Vault (running)
- Docker & Docker Compose

### 3. Create OAuth App

Follow provider-specific instructions:
- [LinkedIn OAuth App](./communication/linkedin.md#setup-instructions)
- [Reddit OAuth App](./communication/reddit.md#setup-instructions)
- [GitHub OAuth App](./code/github.md#setup-instructions)
- [Notion OAuth App](./productivity/notion.md#setup-instructions)

### 4. Configure & Deploy

```bash
# Clone repository
git clone <repo-url>
cd Connectors

# Start infrastructure
docker compose up -d vault redis neo4j

# Configure integration (example: Notion)
vault kv put secret/oauth/notion \
  client_id="your_client_id" \
  client_secret="your_client_secret"

# Start gateway
cd gateway
npm install
npm run build
npm run dev

# Start MCP server (example: Notion)
npx @modelcontextprotocol/server-notion
```

### 5. Test Integration

```bash
# Test OAuth flow
curl "http://localhost:3000/oauth/authorize/notion?tenant_id=test-user"

# Test tool discovery
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "create a page in Notion"}'

# Test tool invocation
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{"toolId": "notion.createPage", "tenantId": "test-user", "parameters": {...}}'
```

---

## Architecture

**Architecture:** AI Agent → Gateway (FAISS + GraphRAG + OAuth Vault) → MCP Servers (LinkedIn 13 | Reddit 25 | GitHub 29 | Notion 19)

---

## Support

- **Main Documentation:** `/docs/USING_CONNECTORS_PLATFORM.md`
- **Architecture:** `/docs/ARCHITECTURE.md`
- **Development Guidelines:** `/CLAUDE.md`
- **Issues:** GitHub Issues

---

## Contributing

Follow the unified pattern established by existing integrations:

1. **Directory Structure:** `integrations/{category}/{name}-unified/`
2. **Authentication:** OAuth 2.0 with Vault
3. **Error Handling:** Consistent error types
4. **Logging:** Structured logging with Winston
5. **Testing:** 85%+ coverage target
6. **Documentation:** Under 250 lines per integration

See [Development Guidelines](/CLAUDE.md) for details.

---

**Last Updated:** 2025-11-16
**Platform Version:** 1.0.0
**Total Integrations:** 4 (complete) + 2 (in development)
