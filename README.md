# Connectors - AI Agent Integration Platform

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![MCP Servers: 14 Operational](https://img.shields.io/badge/MCP%20Servers-14%20Operational-brightgreen.svg)](integrations/)
[![Token Reduction: 99.02%](https://img.shields.io/badge/Token%20Reduction-99.02%25-success.svg)](#-the-problem-we-solve)
[![Tools: 368 Total](https://img.shields.io/badge/Tools-368%20Total-blue.svg)](docs/04-integrations/)

**Open-source integration platform for AI agents that solves the MCP token bloat problem through semantic routing.**

---

## 🚨 The Problem We Solve

**Traditional MCP**: 368 tools across 14 integrations = 77,698 tokens → Context exhausted
**Connectors**: Semantic routing = 759 tokens → **99% reduction**, $7.49M saved at 1M queries/month

[Detailed analysis →](docs/03-architecture/)

---

## ✨ Key Features

- **99% Token Reduction** - Semantic routing: 759 tokens vs 77,698 (FAISS vector search)
- **14 MCP Servers** - Production-ready connectors across code, communication, productivity, documents, search, and storage - [All integrations →](docs/04-integrations/)
- **368 Tools** - Comprehensive coverage of GitHub, Google Workspace, LinkedIn, Reddit, and Product Hunt APIs
- **Enterprise OAuth** - Per-tenant Vault encryption, auto-refresh, multi-tenant isolation
- **GraphRAG Discovery** - Neo4j-powered tool suggestions, <1ms selection
- **Production Ready** - Docker + K8s, API authentication, rate limiting, comprehensive security

---

## 🚀 Quick Start

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

**Prerequisites**: Node.js 18+, Docker 20+ | [Full setup guide →](docs/USING_CONNECTORS_PLATFORM.md) • [API docs →](docs/API_REFERENCE.md) • [Examples →](examples/)

---

## 📊 MCP Servers (Connectors)

| Category | Servers | Description |
|----------|---------|-------------|
| **Code** | GitHub | Repository management, issues, pull requests, actions |
| **Communication** | Gmail, LinkedIn, Reddit, Google Chat | Email, social media, messaging |
| **Documents** | Google Docs, Google Sheets, Google Slides | Document creation and editing |
| **Productivity** | Google Calendar, Google Tasks, Google Forms, Product Hunt | Scheduling, task management, product discovery |
| **Search** | Google Search | Web search and information retrieval |
| **Storage** | Google Drive | File storage and management |

**Total: 14 MCP Servers, 368 Tools** - [Detailed tool breakdown →](docs/04-integrations/)

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

**Getting Started**: [Quick Start](docs/01-getting-started/quick-start.md) • [Installation](docs/01-getting-started/installation.md) • [First Integration](docs/01-getting-started/your-first-integration.md)
**Architecture**: [Overview](docs/03-architecture/) • [Gateway](docs/03-architecture/gateway.md) • [Semantic Routing](docs/03-architecture/semantic-routing.md) • [GraphRAG](docs/03-architecture/graphrag.md)
**Integrations**: [All Integrations](docs/04-integrations/) • [GitHub](docs/04-integrations/code/github.md) • [Google Workspace](docs/04-integrations/productivity/) • [LinkedIn](docs/04-integrations/communication/linkedin.md)
**Guides**: [OAuth Setup](docs/02-guides/oauth/setup.md) • [Adding Integrations](docs/02-guides/adding-integrations/) • [Deployment](docs/02-guides/deployment/)

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

✅ **Phase 1** (Complete): Gateway, OAuth, 14 MCP servers, 99% token reduction, production security
🚧 **Phase 2**: Additional integrations (Slack, Dropbox, Salesforce), enhanced monitoring
📋 **Phase 3+**: Enterprise features, public marketplace, community contributions

[Detailed documentation →](docs/)

---

## 📜 License

**Apache License 2.0** - 100% open source, free to use, modify, and distribute. [Full license →](LICENSE)

---

## 🌟 Why Connectors?

**AI Agents**: 99% token reduction • Semantic discovery • GraphRAG suggestions
**MCP Standard**: 14 production servers • 368 tools • OpenAPI auto-generation
**Enterprise Ready**: Self-hosted • Multi-tenant OAuth • Kubernetes-native • Production security

---

<div align="center">

**[Documentation](docs/) • [Examples](examples/) • [API Reference](docs/API_REFERENCE.md) • [Contributing](CONTRIBUTING.md)**

**⭐ Star us on GitHub — it helps!**

Made with ❤️ by the Connectors team

</div>
