# Connectors Platform - Documentation Hub

Welcome to the Connectors Platform documentation! This guide will help you navigate our comprehensive docs.

---

## 🚀 Quick Navigation

### New Users - Start Here!
1. **[Getting Started](01-getting-started/)** - Installation and first steps
   - [Installation Guide](01-getting-started/installation.md) - Set up in 10 minutes
   - [Quick Start](01-getting-started/quick-start.md) - Try semantic routing in 5 minutes
   - [Your First Integration](01-getting-started/your-first-integration.md) - Add Notion

### Developers - Build & Deploy
2. **[How-To Guides](02-guides/)** - Practical guides for common tasks
   - **[Adding Integrations](02-guides/adding-integrations/)** - 3 methods: OpenAPI, Custom, Existing
   - **[OAuth Setup](02-guides/oauth/)** - Single & multi-tenant authentication
   - **[Deployment](02-guides/deployment/)** - Docker Compose & Kubernetes

### Architects - Understand the System
3. **[Architecture](03-architecture/)** - System design and internals
   - [System Overview](03-architecture/index.md) - High-level architecture
   - [Gateway](03-architecture/gateway.md) - Request routing & MCP orchestration
   - [Semantic Routing](03-architecture/semantic-routing.md) - FAISS-powered tool selection
   - [GraphRAG](03-architecture/graphrag.md) - Neo4j relationship discovery
   - [Token Optimization](03-architecture/token-optimization.md) - 99% reduction strategy

### Reference - Look Up Details
4. **[Integrations](04-integrations/)** - Individual integration documentation
   - [GitHub](04-integrations/code/github.md) - 29 tools for repos, PRs, actions
   - [LinkedIn](04-integrations/communication/linkedin.md) - Browser automation + API hybrid
   - [Reddit](04-integrations/communication/reddit.md) - 25 tools for browsing, posting
   - [Notion](04-integrations/productivity/notion.md) - Pages, databases, blocks
   - [All Integrations →](04-integrations/index.md)

5. **[API Reference](05-api-reference/)** - HTTP & MCP protocol specs
   - [Gateway API](05-api-reference/gateway-api.md) - REST endpoints
   - [MCP Protocol](05-api-reference/mcp-protocol.md) - Tool calling protocol

### Support - Troubleshooting
6. **[Troubleshooting](06-troubleshooting/)** - Solutions to common issues
   - [Common Issues](06-troubleshooting/common-issues.md) - Docker, FAISS, connections
   - [OAuth Debugging](06-troubleshooting/oauth-debugging.md) - Token & Vault issues

---

## 📚 Documentation Framework

Our docs follow the **[Diataxis framework](https://diataxis.fr/)**:

| Type | Purpose | Examples |
|------|---------|----------|
| **Tutorials** | Learning-oriented | Getting Started, Your First Integration |
| **How-To Guides** | Problem-oriented | Adding MCPs, OAuth Setup, Deployment |
| **Explanation** | Understanding-oriented | Architecture, Semantic Routing, GraphRAG |
| **Reference** | Information-oriented | API Docs, Integration Specs |

---

## 🎯 Common Tasks

| I Want To... | Go To... |
|--------------|----------|
| **Install the platform** | [Installation Guide](01-getting-started/installation.md) |
| **Add a new integration from OpenAPI** | [OpenAPI Guide](02-guides/adding-integrations/from-openapi.md) |
| **Build a custom MCP server** | [Custom MCP Guide](02-guides/adding-integrations/custom-mcp.md) |
| **Set up OAuth for tenants** | [OAuth Setup](02-guides/oauth/setup.md) |
| **Deploy to Kubernetes** | [K8s Deployment](02-guides/deployment/kubernetes.md) |
| **Understand semantic routing** | [Semantic Routing](03-architecture/semantic-routing.md) |
| **Debug OAuth issues** | [OAuth Debugging](06-troubleshooting/oauth-debugging.md) |
| **See all available integrations** | [Integrations Index](04-integrations/index.md) |
| **Use the Gateway API** | [Gateway API Reference](05-api-reference/gateway-api.md) |

---

## 🔍 By Role

### **Frontend Developer**
→ [Quick Start](01-getting-started/quick-start.md) → [Gateway API](05-api-reference/gateway-api.md) → [Integrations](04-integrations/)

### **Backend Developer**
→ [Installation](01-getting-started/installation.md) → [Custom MCP](02-guides/adding-integrations/custom-mcp.md) → [OAuth Setup](02-guides/oauth/setup.md)

### **Platform Engineer**
→ [Architecture](03-architecture/) → [Docker Deployment](02-guides/deployment/docker.md) → [K8s Deployment](02-guides/deployment/kubernetes.md)

### **Integration Developer**
→ [Adding Integrations](02-guides/adding-integrations/) → [Existing MCP](02-guides/adding-integrations/existing-mcp.md) → [OAuth](02-guides/oauth/)

### **AI/ML Engineer**
→ [Semantic Routing](03-architecture/semantic-routing.md) → [GraphRAG](03-architecture/graphrag.md) → [Token Optimization](03-architecture/token-optimization.md)

---

## 📖 Reading Paths

### **🚀 Quick Start (30 minutes)**
1. [Installation](01-getting-started/installation.md) - 10 min
2. [Quick Start](01-getting-started/quick-start.md) - 5 min
3. [Your First Integration](01-getting-started/your-first-integration.md) - 15 min

### **🏗️ Production Setup (2 hours)**
1. [Installation](01-getting-started/installation.md)
2. [OAuth Multi-Tenant](02-guides/oauth/multi-tenant.md)
3. [Docker Deployment](02-guides/deployment/docker.md)
4. [K8s Deployment](02-guides/deployment/kubernetes.md)

### **🔧 Integration Development (4 hours)**
1. [Adding Integrations Overview](02-guides/adding-integrations/)
2. Choose: [OpenAPI](02-guides/adding-integrations/from-openapi.md) OR [Custom](02-guides/adding-integrations/custom-mcp.md)
3. [OAuth Setup](02-guides/oauth/setup.md)
4. [Testing & Validation](02-guides/adding-integrations/custom-mcp.md#testing)

### **🧠 Architecture Deep Dive (3 hours)**
1. [System Overview](03-architecture/index.md)
2. [Gateway](03-architecture/gateway.md)
3. [Semantic Routing](03-architecture/semantic-routing.md)
4. [GraphRAG](03-architecture/graphrag.md)
5. [Token Optimization](03-architecture/token-optimization.md)

---

## 🌟 Key Achievements

- **99.02% Token Reduction** - 759 tokens vs 77,698 traditional
- **4 Integrations Operational** - GitHub, Notion, LinkedIn, Reddit (85 tools)
- **<1ms Tool Selection** - FAISS semantic search
- **Enterprise Multi-Tenant** - Per-tenant Vault encryption
- **Production Ready** - Docker + K8s, 89% test coverage

---

## 📊 Documentation Statistics

- **Total Docs**: ~35 focused guides (down from 102+)
- **Avg Length**: ~230 lines per doc
- **Max Length**: <500 lines (most <300)
- **Coverage**: 100% of platform features
- **Last Updated**: 2025-11-16

---

## 💡 Documentation Principles

1. **Single Source of Truth** - One canonical location per topic
2. **Under 300 Lines** - Every doc scannable and focused
3. **Diataxis Framework** - Clear separation: tutorial, guide, reference, explanation
4. **Actionable** - Code examples and step-by-step instructions
5. **Cross-Referenced** - Links between related topics
6. **Beginner-Friendly** - Assumes minimal prior knowledge

---

## 🆘 Need Help?

- **Can't find something?** Check the [Common Tasks](#-common-tasks) table above
- **Something broken?** See [Troubleshooting](06-troubleshooting/)
- **Want to contribute?** Read [Adding Integrations](02-guides/adding-integrations/)
- **Questions?** Open an issue on GitHub

---

## 📂 Full Documentation Tree

```
docs/
├── index.md (you are here)
│
├── 01-getting-started/
│   ├── index.md
│   ├── installation.md
│   ├── quick-start.md
│   └── your-first-integration.md
│
├── 02-guides/
│   ├── adding-integrations/
│   │   ├── index.md
│   │   ├── from-openapi.md
│   │   ├── custom-mcp.md
│   │   └── existing-mcp.md
│   ├── oauth/
│   │   ├── index.md
│   │   ├── setup.md
│   │   └── multi-tenant.md
│   └── deployment/
│       ├── index.md
│       ├── docker.md
│       └── kubernetes.md
│
├── 03-architecture/
│   ├── index.md
│   ├── gateway.md
│   ├── semantic-routing.md
│   ├── graphrag.md
│   └── token-optimization.md
│
├── 04-integrations/
│   ├── index.md
│   ├── code/
│   │   └── github.md
│   ├── communication/
│   │   ├── linkedin.md
│   │   └── reddit.md
│   └── productivity/
│       └── notion.md
│
├── 05-api-reference/
│   ├── index.md
│   ├── gateway-api.md
│   └── mcp-protocol.md
│
├── 06-troubleshooting/
│   ├── index.md
│   ├── common-issues.md
│   └── oauth-debugging.md
│
└── archive/
    ├── research/
    ├── deployment/
    └── reports/
```

---

**Happy building! 🚀**
