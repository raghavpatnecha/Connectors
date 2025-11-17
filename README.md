# Connectors - AI Agent Integration Platform

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Phase 1: Complete](https://img.shields.io/badge/Phase%201-Complete-brightgreen.svg)](docs/PHASE_1_COMPLETION_REPORT.md)
[![Token Reduction: 99.02%](https://img.shields.io/badge/Token%20Reduction-99.02%25-success.svg)](docs/PHASE_1_COMPLETION_REPORT.md)
[![Integrations: 4 Operational](https://img.shields.io/badge/Integrations-4%20Operational-brightgreen.svg)](integrations/)

**Open-source integration platform for AI agents that solves the MCP token bloat problem through semantic routing.**

---

## 🚨 The Problem We Solve

**Traditional MCP**: 368 tools across 15 integrations = 77,698 tokens → Context exhausted
**Connectors**: Semantic routing = 759 tokens → **99% reduction**, $7.49M saved at 1M queries/month

[Detailed analysis →](docs/ARCHITECTURE.md)

---

## ✨ Key Features

- **99% Token Reduction** - Semantic routing: 759 tokens vs 77,698 (FAISS vector search)
- **4 Integrations** - GitHub, Notion, LinkedIn, Reddit (85 tools total) - [All integrations →](integrations/)
- **Enterprise OAuth** - Per-tenant Vault encryption, auto-refresh - [API docs →](docs/API_TENANT_OAUTH.md)
- **GraphRAG Discovery** - Neo4j-powered tool suggestions, <1ms selection
- **Production Ready** - Docker + K8s, monitoring, 89% test coverage - [Deploy →](docs/DEPLOYMENT_STATUS_2025-11-11.md)

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

## 📊 Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Phase 1** | ✅ Complete | [Completion report →](docs/PHASE_1_COMPLETION_REPORT.md) |
| **Token Reduction** | 99.02% | 759 tokens vs 77,698 (33% better than 95% target) |
| **Tool Selection** | <1ms avg | 99x faster than 100ms target |
| **Integrations** | 4 operational | GitHub, Notion, LinkedIn, Reddit - [Full list →](integrations/) |
| **OAuth System** | Production ready | 2,000+ lines, multi-tenant, auto-refresh |
| **Test Coverage** | 89% | 92 tests across critical paths |
| **Deployment** | Docker + K8s | [Deployment guide →](docs/DEPLOYMENT_STATUS_2025-11-11.md) |

**Known Limitations**: FAISS indices require generation, MCP servers need build - [See details →](docs/LIMITATIONS.md)

---

## 📚 Documentation

**Getting Started**: [Usage Guide](docs/USING_CONNECTORS_PLATFORM.md) • [API Reference](docs/API_REFERENCE.md) • [Examples](examples/)
**Platform**: [Architecture](docs/ARCHITECTURE.md) • [Multi-Tenant Setup](docs/MULTI_TENANT_SETUP.md) • [OAuth API](docs/API_TENANT_OAUTH.md)
**Integrations**: [GitHub](integrations/code/github/) • [Notion](docs/integrations/NOTION_SETUP.md) • [LinkedIn](integrations/communication/linkedin/) • [Reddit](integrations/communication/reddit/)
**Operations**: [Deployment](docs/DEPLOYMENT_STATUS_2025-11-11.md) • [Monitoring](docs/MONITORING.md) • [Troubleshooting](docs/TROUBLESHOOTING.md)

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

✅ **Phase 1** (Complete): Gateway, OAuth, 4 integrations, 99% token reduction | 🚧 **Phase 2-6**: 100+ integrations, enterprise features, public launch

[Detailed roadmap →](docs/ROADMAP.md) • [Phase 1 report →](docs/PHASE_1_COMPLETION_REPORT.md)

---

## 📜 License

**Apache License 2.0** - 100% open source, free to use, modify, and distribute. [Full license →](LICENSE)

---

## 🌟 Why Connectors?

**AI Agents**: 99% token reduction • Semantic discovery • GraphRAG suggestions | **Integrations**: OpenAPI auto-gen • MCP standard | **Enterprise**: Self-hosted • Multi-tenant • K8s-native

[Executive summary →](EXECUTIVE_SUMMARY.md)

---

<div align="center">

**[Documentation](docs/) • [Examples](examples/) • [API Reference](docs/API_REFERENCE.md) • [Contributing](CONTRIBUTING.md)**

**⭐ Star us on GitHub — it helps!**

Made with ❤️ by the Connectors team

</div>
