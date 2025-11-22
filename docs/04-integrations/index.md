# Integration Documentation Index

**Connectors Platform** - 413 tools across 16 MCP servers

---

## Integration Architecture Types

The Connectors Platform supports three types of integrations to maximize flexibility:

### 1. **Custom-Built MCP Servers** (15 servers)
Built in-house using TypeScript + FastMCP framework, auto-generated from OpenAPI specifications.

**Location:** `integrations/*/` directories
**Examples:** GitHub, Google Workspace (10 services), LinkedIn, Reddit, Twitter
**Advantages:** Full control, optimized for our gateway, consistent patterns

### 2. **Official Remote MCP Servers** (1 server)
Third-party official MCP implementations maintained by service providers.

**Example:** Notion (using `notionhq/notion-mcp-server:latest`)
**Location:** External Docker image
**Advantages:** Official support, automatic updates, reduced maintenance

### 3. **Direct API Integrations**
Lightweight integrations calling APIs directly without MCP protocol overhead.

**Example:** Product Hunt (GraphQL API)
**Use Case:** Simple APIs with few endpoints

---

## Quick Navigation

### By Category

- [Communication](#communication) - 5 servers (Gmail, LinkedIn, Reddit, Twitter, Google Chat)
- [Code](#code) - 1 server (GitHub)
- [Productivity](#productivity) - 5 servers (Notion, Product Hunt + 3 Google Workspace)
- [Documents](#documents) - 3 servers (Google Docs, Sheets, Slides)
- [Search](#search) - 1 server (Google Search)
- [Storage](#storage) - 1 server (Google Drive)

### By Status

- ✅ **Production Ready:** All 16 servers operational (GitHub, LinkedIn, Reddit, Twitter, Notion, Product Hunt, Google Workspace 10 services)
- 🚧 **In Development:** Slack
- 📋 **Planned:** Dropbox, OneDrive, Salesforce

---

## Communication

### LinkedIn
**Status:** ✅ Complete | **Tools:** 18 | **OAuth:** Required

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
**Status:** ✅ Complete | **Tools:** 27 | **OAuth:** Required

Comprehensive Reddit integration with browsing, searching, posting, and commenting capabilities. Built on official Snoowrap SDK.

**Key Features:**
- 100% coverage of 5 source repositories
- Smart rate limiting (60 req/min)
- Intelligent caching (LRU + TTL)
- Multi-tenant OAuth

**Categories:** Browse(8), Search(2), Posts(4), Comments(2), Subreddits(2), Users(3), Utils(1), Auth(5)

📄 [Read Full Documentation](./communication/reddit.md)

---

### Twitter / X
**Status:** ✅ Complete | **Tools:** 45 | **OAuth:** OAuth 1.0a Required

Comprehensive Twitter/X integration combining 45 tools from 4 community implementations with OAuth 1.0a, session cookies, and SocialData analytics.

**Key Features:**
- OAuth 1.0a + session cookie fallback
- SocialData API integration (20+ analytics tools)
- Multi-tier rate limiting (Free/Basic/Pro)
- Sentiment analysis, influence mapping
- 45 tools across tweets, users, lists, analytics

**Categories:** Tweets(10), Engagement(7), Users(10), Lists(5), Analytics(13)

📄 [Read Full Documentation](./communication/twitter.md)

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

### Product Hunt
**Status:** ✅ Complete | **Tools:** 11 | **Auth:** API Token

Production-ready Product Hunt integration with API token authentication (simpler than OAuth). Provides access to posts, products, and discovery features via GraphQL API v2.

**Key Features:**
- API token authentication (no OAuth complexity)
- 11 complete tools (full feature parity)
- Multi-tenant token isolation
- GraphQL API v2 client
- Complexity-based rate limiting (6250/hour)

**Tool Categories:**
- Posts (2 tools)
- Topics (2 tools)
- Users (2 tools)
- Comments (2 tools)
- Collections (2 tools)
- Server Status (1 tool)

📄 [Read Full Documentation](./productivity/producthunt.md)

---

## Google Workspace

**Status:** ✅ Complete | **Total Tools:** 271 | **Services:** 10 | **OAuth:** Required

Production-ready suite with unified OAuth 2.0, Vault storage, multi-tenant isolation, and auto-refresh tokens (5min before expiry).

| Service | Tools | Port | Key Features |
|---------|-------|------|-------------|
| **Gmail** | 48 | 3130 | Messages, labels, threads, drafts, settings, delegates, filters, S/MIME |
| **Calendar** | 29 | 3131 | Events, calendars, ACL, freebusy queries, push notifications |
| **Drive** | 35 | 3132 | Files, folders, permissions, comments, shared drives, revisions |
| **Docs** | 32 | 3133 | Text editing, find/replace, tables, images, headers/footers, comments |
| **Sheets** | 40 | 3134 | Cell editing, formulas, charts, formatting, protected ranges, comments |
| **Slides** | 28 | 3135 | Slide creation, shapes, images, tables, text formatting, thumbnails |
| **Forms** | 14 | 3136 | Form creation, response management, publish settings, pagination |
| **Tasks** | 16 | 3137 | Task lists, completion tracking, moving, clearing completed tasks |
| **Chat** | 23 | 3138 | Spaces, messages, members, attachments, reactions |
| **Search** | 6 | 3139 | Custom Search Engine (CSE), web searches, site-restricted searches |

---

## Integration Comparison

| Integration | Status | Tools | OAuth | SDK | Memory | Approach |
|-------------|--------|-------|-------|-----|--------|----------|
| **LinkedIn** | ✅ Complete | 18 | Yes | Hybrid | ~200MB | API + Browser |
| **Reddit** | ✅ Complete | 27 | Yes | Snoowrap | ~150MB | Official API |
| **Twitter** | ✅ Complete | 45 | Yes (OAuth 1.0a) | Custom | ~180MB | Official API + SocialData |
| **GitHub** | ✅ Complete | 29 | Yes | @octokit/rest | ~200MB | Official API |
| **Notion** | ✅ Complete | 19 | Yes | @notionhq/client | ~180MB | Official API |
| **Product Hunt** | ✅ Complete | 3 | No (API Token) | axios | ~120MB | GraphQL API |
| **Google Gmail** | ✅ Complete | 48 | Yes | googleapis | ~180MB | Official API |
| **Google Calendar** | ✅ Complete | 29 | Yes | googleapis | ~150MB | Official API |
| **Google Drive** | ✅ Complete | 35 | Yes | googleapis | ~200MB | Official API |
| **Google Docs** | ✅ Complete | 32 | Yes | googleapis | ~170MB | Official API |
| **Google Sheets** | ✅ Complete | 40 | Yes | googleapis | ~180MB | Official API |
| **Google Slides** | ✅ Complete | 28 | Yes | googleapis | ~160MB | Official API |
| **Google Forms** | ✅ Complete | 14 | Yes | googleapis | ~140MB | Official API |
| **Google Tasks** | ✅ Complete | 16 | Yes | googleapis | ~130MB | Official API |
| **Google Chat** | ✅ Complete | 23 | Yes | googleapis | ~150MB | Official API |
| **Google Search** | ✅ Complete | 6 | Yes | googleapis | ~120MB | Official API |
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
| Product Hunt | 465 tokens | ~120 tokens | 74% |
| Google Workspace (271 tools) | 42,000 tokens | ~2,400 tokens | 94% |
| Twitter | 5,500 tokens | ~1,000 tokens | 82% |
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

**Architecture:** AI Agent → Gateway (FAISS + GraphRAG + OAuth Vault) → MCP Servers (LinkedIn 18 | Reddit 27 | GitHub 29 | Notion 19 | Google Workspace 271)

---

## Support

- **Main Documentation:** `/docs/USING_CONNECTORS_PLATFORM.md`
- **Architecture:** `/docs/03-architecture/index.md`
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

**Last Updated:** 2025-11-22
**Platform Version:** 1.0.0
**Total:** 16 MCP servers complete (15 custom-built + 1 official remote) | 413 total tools

**Architecture Breakdown:**
- Custom-Built MCP Servers: GitHub, LinkedIn, Reddit, Twitter, Gmail, Drive, Calendar, Tasks, Docs, Sheets, Slides, Forms, Chat, Google Search, Product Hunt (15)
- Official Remote Server: Notion (1)
