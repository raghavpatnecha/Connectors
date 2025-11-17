# Connectors Platform Documentation

Welcome to the Connectors Platform - the AI agent integration platform with 99% token reduction.

## What is Connectors?

Connectors is an MCP (Model Context Protocol) gateway that provides:
- **99% Token Reduction**: 1-3K tokens vs 250K (FAISS + GraphRAG + Progressive Loading)
- **Semantic Tool Selection**: Natural language queries to find relevant tools
- **15 Integrations**: 368 tools across Code, Communication, PM, Cloud, Data
- **Simple SDK**: 3-line setup matching Composio/mcp-use
- **Bring Your Own MCP**: Deploy custom servers from GitHub, STDIO, HTTP, Docker
- **Multi-Language**: TypeScript + Python SDKs with 100% parity
- **Framework Support**: OpenAI Agents + LangChain integrations

## Quick Start

### TypeScript

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

### Python

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

## Documentation Sections

### 📚 [Getting Started](01-getting-started/)
- **[Installation](01-getting-started/installation.md)** - Install SDK and set up gateway
- **[Quick Start](01-getting-started/quick-start.md)** - 5-minute tutorial
- **[Your First Integration](01-getting-started/your-first-integration.md)** - Build your first agent

### 🔧 [SDK Documentation](sdk/)
- **[TypeScript SDK](sdk/typescript/)** - Complete TypeScript API reference
  - [Overview](sdk/typescript/overview.md) - Architecture and concepts
  - [Connectors Client](sdk/typescript/connectors-client.md) - Main client API
  - [Tools API](sdk/typescript/tools-api.md) - Semantic tool selection
  - [MCP Registry](sdk/typescript/mcp-registry.md) - Deploy and manage servers
  - [Error Handling](sdk/typescript/error-handling.md) - Error types and handling
- **[Python SDK](sdk/python/)** - Complete Python API reference
  - [Overview](sdk/python/overview.md) - Architecture and concepts
  - [Installation](sdk/python/installation.md) - Install and configure
  - [Client](sdk/python/client.md) - Main client API
  - [Tools](sdk/python/tools.md) - Semantic tool selection
  - [MCP](sdk/python/mcp.md) - Deploy and manage servers
- **[SDK Examples](sdk/examples.md)** - Common patterns and use cases

### 🔌 [Integrations](integrations/)
- **[OpenAI Agents](integrations/openai-agents.md)** - Use Connectors with OpenAI Agents
- **[LangChain](integrations/langchain.md)** - Use Connectors with LangChain
- **[Creating Integrations](integrations/creating-integrations.md)** - Build custom MCP servers

### 🚀 [Deployment](deployment/)
- **[mcp.add() Overview](deployment/mcp-add-overview.md)** - Deploy custom MCP servers
- **[GitHub Source](deployment/github-source.md)** - Deploy from GitHub repositories
- **[STDIO Source](deployment/stdio-source.md)** - Deploy local STDIO servers
- **[HTTP Source](deployment/http-source.md)** - Deploy remote HTTP servers
- **[Docker Source](deployment/docker-source.md)** - Deploy from Docker images
- **[Kubernetes](deployment/kubernetes.md)** - Production Kubernetes deployment

### 📖 [Guides](02-guides/)
- **[Semantic Tool Selection](02-guides/semantic-tool-selection.md)** - How semantic routing works
- **[Token Optimization](02-guides/token-optimization.md)** - Achieving 99% token reduction
- **[Multi-Tenant Setup](02-guides/multi-tenant-setup.md)** - Configure multi-tenancy
- **[OAuth Configuration](02-guides/oauth/setup.md)** - Set up OAuth for integrations
- **[Migration from Composio](02-guides/migration-from-composio.md)** - Migrate from Composio

### 🏗️ [Architecture](03-architecture/)
- **[Overview](03-architecture/index.md)** - System architecture
- **[Gateway](03-architecture/gateway.md)** - Gateway components
- **[Semantic Routing](03-architecture/semantic-routing.md)** - Two-level retrieval
- **[GraphRAG](03-architecture/graphrag.md)** - Tool relationship discovery
- **[Progressive Loading](03-architecture/progressive-loading.md)** - Three-tier loading

### 📡 [API Reference](05-api-reference/)
- **[Gateway API](05-api-reference/gateway-api.md)** - REST API documentation
- **[MCP Protocol](05-api-reference/mcp-protocol.md)** - MCP protocol details

### 🔧 [Troubleshooting](06-troubleshooting/)
- **[Common Issues](06-troubleshooting/index.md)** - Solutions to common problems
- **[OAuth Debugging](06-troubleshooting/oauth-debugging.md)** - Debug OAuth issues

## Key Features

### Semantic Tool Selection

Natural language queries automatically select the most relevant tools:

```typescript
const tools = await connectors.tools.select(
  'I need to create a PR on GitHub and notify team on Slack',
  { maxTools: 5 }
);
// Returns: [github.createPR, github.mergePR, slack.postMessage, ...]
```

### Token Optimization

**Traditional MCP**: 250,000 tokens (exceeds context limits)
**Connectors**: 1,000-3,000 tokens (99% reduction)

How?
1. **Semantic Routing**: Only load relevant tools (5-10 vs 368)
2. **GraphRAG**: Discover related tools via knowledge graph
3. **Progressive Loading**: Three-tier schema loading

[Learn more →](03-architecture/token-optimization.md)

### Bring Your Own MCP Server

```typescript
const deployment = await connectors.mcp.add({
  name: 'my-custom-server',
  source: {
    type: 'github',
    url: 'https://github.com/user/mcp-server'
  },
  category: 'custom'
});

await deployment.waitUntilReady();
// Server automatically deployed to Kubernetes!
```

[Learn more →](deployment/mcp-add-overview.md)

## Framework Integrations

### OpenAI Agents

```typescript
import { ConnectorsProvider } from '@connectors/openai-agents';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
const tools = await ConnectorsProvider.semanticTools(
  connectors,
  'I need to manage GitHub repositories'
);

const assistant = await openai.beta.assistants.create({
  name: 'GitHub Agent',
  instructions: 'You help manage GitHub repositories',
  tools: tools,
  model: 'gpt-4'
});
```

[Learn more →](integrations/openai-agents.md)

### LangChain

```typescript
import { ConnectorsToolkit } from '@connectors/langchain';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
const toolkit = new ConnectorsToolkit(connectors);

const tools = await toolkit.getSemanticTools('manage GitHub repositories');
const agent = createReactAgent({
  llm: new ChatOpenAI({ modelName: 'gpt-4' }),
  tools: tools,
  prompt: prompt
});
```

[Learn more →](integrations/langchain.md)

## Comparison with Alternatives

| Feature | Connectors | Composio | mcp-use |
|---------|-----------|----------|---------|
| Token Reduction | 99% (FAISS + GraphRAG) | None | None |
| Semantic Selection | ✅ Natural language | ❌ Manual | ❌ Manual |
| Custom MCP Deploy | ✅ GitHub/Docker/K8s | ❌ | ❌ |
| Multi-Language SDK | ✅ TS + Python | ✅ TS + Python | ❌ TS only |
| Framework Support | ✅ OpenAI + LangChain | ✅ Many | ✅ OpenAI |
| Self-Hosted | ✅ Open source | ❌ SaaS only | ✅ Open source |
| Token Cost | 1-3K | 250K | 250K |

[Migration guide →](02-guides/migration-from-composio.md)

## Support

- **GitHub Issues**: [github.com/connectors/platform/issues](https://github.com/connectors/platform/issues)
- **Documentation**: [docs.connectors.dev](https://docs.connectors.dev)
- **Discord**: [discord.gg/connectors](https://discord.gg/connectors)
- **Email**: support@connectors.dev

## Contributing

We welcome contributions! See our [Contributing Guide](../CONTRIBUTING.md) for:
- Development setup
- Coding standards
- PR process
- Community guidelines

## License

MIT License - See [LICENSE](../LICENSE) file for details.

---

**[← Back to Main README](../README.md)**
