# Connectors - AI Agent Integration Platform

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![MCP Servers: 16 Operational](https://img.shields.io/badge/MCP%20Servers-16%20Operational-brightgreen.svg)](integrations/)
[![Token Reduction: 99.02%](https://img.shields.io/badge/Token%20Reduction-99.02%25-success.svg)](#-the-problem-we-solve)
[![Tools: 413 Total](https://img.shields.io/badge/Tools-413%20Total-blue.svg)](docs/04-integrations/)

**Open-source integration platform for AI agents that solves the MCP token bloat problem through semantic routing.**

---

## 🚨 The Problem We Solve

**Traditional MCP**: 413 tools across 16 integrations = 82,000+ tokens → Context exhausted
**Connectors**: Semantic routing = 800-1,200 tokens → **99% reduction**, $7.8M saved at 1M queries/month

[Detailed analysis →](docs/03-architecture/)

---

## ✨ Key Features

- **99% Token Reduction** - Semantic routing: 759 tokens vs 77,698 (FAISS vector search + Progressive loading) - [Architecture →](docs/03-architecture/progressive-loading.md)
- **Simple SDK** - 3-line setup, semantic tool selection, TypeScript + Python with 100% feature parity - [SDK docs →](docs/sdk/)
- **16 MCP Servers** - Production-ready connectors across code, communication, productivity, documents, search, and storage - [All integrations →](docs/04-integrations/)
- **413 Tools** - Comprehensive coverage of GitHub, Google Workspace, LinkedIn, Reddit, Twitter, Notion, and Product Hunt APIs
- **Bring Your Own MCP** - Deploy custom servers from GitHub, Docker, STDIO, HTTP - [Deployment →](docs/deployment/mcp-add-overview.md)
- **Framework Support** - OpenAI Agents + LangChain integrations - [Integrations →](docs/integrations/)
- **Enterprise OAuth** - Per-tenant Vault encryption, auto-refresh, multi-tenant isolation - [Multi-tenant →](docs/02-guides/multi-tenant-setup.md)
- **GraphRAG Discovery** - Neo4j-powered tool suggestions, <1ms selection
- **Production Ready** - Docker + K8s, API authentication, rate limiting, comprehensive security

---

## 🚀 Quick Start

### Gateway Setup

```bash
# 1. Start services
git clone https://github.com/your-org/connectors.git && cd connectors
docker compose up -d && ./scripts/init-neo4j.sh

# 2. Initialize gateway
cd gateway && npm run generate-embeddings && npm run dev

# 3. Test tool selection
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "create a GitHub pull request", "context": {"maxTools": 5}}'
```

### SDK Quick Start

**TypeScript:**
```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  tenantId: 'my-company'
});

// Select tools semantically
const tools = await connectors.tools.select('create a GitHub pull request');

// Call tools
const github = connectors.mcp.get('github');
const pr = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'New feature',
  head: 'feature',
  base: 'main'
});
```

**Python:**
```python
from connectors import Connectors

connectors = Connectors(
    base_url="http://localhost:3000",
    tenant_id="my-company"
)

# Select tools semantically
tools = await connectors.tools.select("create a GitHub pull request")

# Call tools
github = connectors.mcp.get("github")
pr = await github.call("createPullRequest", {
    "repo": "owner/repo",
    "title": "New feature",
    "head": "feature",
    "base": "main"
})
```

**Prerequisites**: Node.js 18+, Docker 20+, Python 3.10+ | [Full setup guide →](docs/01-getting-started/installation.md) • [SDK docs →](docs/sdk/) • [Examples →](examples/)

---

## 📊 MCP Servers (Connectors)

| Category | Servers | Description |
|----------|---------|-------------|
| **Code** | GitHub | Repository management, issues, pull requests, actions |
| **Communication** | Gmail, LinkedIn, Reddit, Twitter, Google Chat | Email, social media, messaging |
| **Documents** | Google Docs, Google Sheets, Google Slides | Document creation and editing |
| **Productivity** | Google Calendar, Google Tasks, Google Forms, Notion, Product Hunt | Scheduling, task management, workspace collaboration, product discovery |
| **Search** | Google Search | Web search and information retrieval |
| **Storage** | Google Drive | File storage and management |

**Total: 16 MCP Servers, 413 Tools** - [Detailed tool breakdown →](docs/04-integrations/)

### Integration Architecture Types

**Custom-Built MCP Servers** (15 servers)
- Built using TypeScript + FastMCP
- Auto-generated from OpenAPI specs
- Source: `integrations/*/` directories
- Examples: GitHub, Google Workspace (10 services), LinkedIn, Reddit, Twitter

**Official Remote MCP Server** (1 server)
- Notion: Using official `notionhq/notion-mcp-server:latest`
- Maintained by Notion team
- Connected via Docker container

**Note:** Product Hunt uses direct API integration pattern for lightweight access.

## 📊 Performance & Security

| Component | Status | Details |
|-----------|--------|---------|
| **Token Reduction** | 99.02% | 759 tokens vs 77,698 (33% better than target) |
| **Tool Selection** | <1ms avg | 99x faster than 100ms target |
| **API Authentication** | ✅ Production | Bearer token auth, API key validation, tenant isolation |
| **Rate Limiting** | ✅ Production | Multi-layer (global, tenant, endpoint) with Redis |
| **OAuth System** | ✅ Production | Multi-tenant Vault encryption, auto-refresh |
| **Security** | ✅ Hardened | Cypher injection prevention, type safety, no credentials in code |
| **Deployment** | Docker + K8s | [Deployment guide →](docs/02-guides/deployment/) |

---

## 📚 Documentation

**📖 [Complete Documentation →](docs/)**

**Getting Started**: [Quick Start](docs/01-getting-started/quick-start.md) • [Installation](docs/01-getting-started/installation.md) • [First Integration](docs/01-getting-started/your-first-integration.md)

**SDK**: [TypeScript SDK](docs/sdk/typescript/) • [Python SDK](docs/sdk/python/) • [Examples](docs/sdk/examples.md)

**Framework Integrations**: [OpenAI Agents](docs/integrations/openai-agents.md) • [LangChain](docs/integrations/langchain.md)

**Deployment**: [mcp.add() Overview](docs/deployment/mcp-add-overview.md) • [GitHub Source](docs/deployment/github-source.md) • [Docker Source](docs/deployment/docker-source.md) • [Kubernetes](docs/deployment/kubernetes.md)

**Architecture**: [Overview](docs/03-architecture/) • [Semantic Routing](docs/03-architecture/semantic-routing.md) • [GraphRAG](docs/03-architecture/graphrag.md) • [Progressive Loading](docs/03-architecture/progressive-loading.md)

**Guides**: [Multi-Tenant Setup](docs/02-guides/multi-tenant-setup.md) • [Migration from Composio](docs/02-guides/migration-from-composio.md) • [OAuth Setup](docs/02-guides/oauth/setup.md)

**Integrations**: [All Integrations](docs/04-integrations/) • [GitHub](docs/04-integrations/code/github.md) • [Google Workspace](docs/04-integrations/productivity/)

---

## 🏗️ Architecture

```
AI Agent → Gateway (FAISS + GraphRAG + OAuth) → MCP Servers → External APIs
```

**Stack**: Express.js gateway • FAISS vector search (<1ms) • Neo4j relationships • Vault credentials • Redis cache • TypeScript MCP servers

[Full architecture →](docs/ARCHITECTURE.md)

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and PR process.

**Quick links**: [Code of Conduct](CODE_OF_CONDUCT.md) • [Development Guide](CLAUDE.md) • [Bounty Program](BOUNTY.md) (coming soon)

---

## 📈 Roadmap

✅ **Phase 1** (Complete): Gateway, OAuth, 15 MCP servers, 99% token reduction, production security
✅ **Phase 2** (Complete): TypeScript + Python SDKs, OpenAI Agents + LangChain integrations, mcp.add() deployment
🚧 **Phase 3**: Additional integrations (Slack, Dropbox, Salesforce), enhanced monitoring
📋 **Phase 4+**: Enterprise features, public marketplace, community contributions

[Complete documentation →](docs/) • [SDK documentation →](docs/sdk/)

---

## 📜 License

**Apache License 2.0** - 100% open source, free to use, modify, and distribute. [Full license →](LICENSE)

---

## 🌟 Why Connectors?

**AI Agents**: 99% token reduction • Semantic discovery • GraphRAG suggestions • Framework support (OpenAI + LangChain)
**Simple SDK**: 3-line setup • TypeScript + Python • Semantic tool selection • Deploy custom MCP servers
**MCP Standard**: 15 production servers • 368 tools • Bring Your Own MCP (GitHub/Docker/STDIO/HTTP)
**Enterprise Ready**: Self-hosted • Multi-tenant OAuth • Kubernetes-native • Production security

**Migrate from Composio?** See our [migration guide →](docs/02-guides/migration-from-composio.md)

---

<div align="center">

**[Documentation](docs/) • [SDK](docs/sdk/) • [Examples](examples/) • [API Reference](docs/05-api-reference/) • [Contributing](CONTRIBUTING.md)**

**[OpenAI Agents](docs/integrations/openai-agents.md) • [LangChain](docs/integrations/langchain.md) • [Multi-Tenant](docs/02-guides/multi-tenant-setup.md) • [Migration Guide](docs/02-guides/migration-from-composio.md)**

**⭐ Star us on GitHub — it helps!**

Made with ❤️ by the Connectors team

</div>
