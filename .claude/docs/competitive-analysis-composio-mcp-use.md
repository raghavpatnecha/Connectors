# Competitive Analysis: Connectors vs Composio vs mcp-use

**Date:** 2025-11-17
**Author:** Claude (Competitive Analysis Agent)
**Purpose:** Analyze Connectors platform against leading MCP solutions to identify gaps and SDK design opportunities

---

## Executive Summary

### Platform Positioning

| Platform | Type | Target User | Core Value Proposition |
|----------|------|-------------|----------------------|
| **Composio** | Managed SDK + Gateway | Enterprise developers | 500+ managed integrations, plug-and-play with 10+ AI frameworks |
| **mcp-use** | Framework/SDK | MCP developers | Full-stack MCP framework in 6 lines, build agents/clients/servers |
| **Connectors** | Self-hosted Gateway | Infrastructure teams | 99% token reduction, self-hosted, semantic routing, enterprise OAuth |

### Key Finding

**Connectors is powerful but lacks developer accessibility.** Composio and mcp-use excel at developer experience through simple SDKs, while Connectors requires manual REST API integration with complex JSON structures.

**Recommendation:** Build a TypeScript/Python SDK for Connectors that matches the simplicity of competitors while leveraging our unique semantic routing capabilities.

---

## 1. Developer Experience Comparison

### 1.1 Initialization & Setup

#### **Composio** (⭐⭐⭐⭐⭐)
```typescript
import { Composio } from '@composio/core';
import { OpenAIAgentsProvider } from '@composio/openai-agents';

const composio = new Composio({
  provider: new OpenAIAgentsProvider()
});
```
- **Lines of code:** 3
- **Configuration:** Optional API key
- **Complexity:** Very low

#### **mcp-use** (⭐⭐⭐⭐⭐)
```python
from mcp_use import MCPAgent, MCPClient
from langchain_openai import ChatOpenAI

config = {"mcpServers": {"filesystem": {...}}}
client = MCPClient.from_dict(config)
llm = ChatOpenAI(model="gpt-4o")
agent = MCPAgent(llm=llm, client=client)
```
- **Lines of code:** 6
- **Configuration:** Dictionary-based
- **Complexity:** Very low

#### **Connectors (Current)** (⭐⭐)
```bash
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "query": "create a GitHub pull request",
    "context": {
      "allowedCategories": ["code"],
      "tokenBudget": 2000,
      "maxTools": 5,
      "tenantId": "my-tenant"
    }
  }'
```
- **Lines of code:** 10+ (raw REST)
- **Configuration:** Manual JSON construction
- **Complexity:** High (requires REST client, JSON formatting, error handling)

**Gap:** No SDK, manual REST API integration required

---

### 1.2 Tool Access & Discovery

#### **Composio** (⭐⭐⭐⭐⭐)
```typescript
const tools = await composio.tools.get(userId, {
  toolkits: ['HACKERNEWS', 'GITHUB']
});
```
- User-scoped access
- Toolkit-based filtering
- Framework-ready output

#### **mcp-use** (⭐⭐⭐⭐⭐)
```python
# Agent approach (automatic tool discovery)
result = await agent.run("List all files")

# Direct approach (manual tool calls)
session = client.get_session("calculator")
result = await session.call_tool(name="add", arguments={"a": 5, "b": 3})
```
- Agent-based (automatic)
- Session-based (manual)
- Multi-server support

#### **Connectors (Current)** (⭐⭐⭐)
```bash
# List tools
curl "http://localhost:3000/api/v1/tools/list?category=code"

# Select tools semantically
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "create a PR"}'

# Invoke tool
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{"toolId": "github.createPullRequest", "integration": "github", ...}'
```
- Semantic selection (unique advantage!)
- Manual REST calls
- Complex request structure

**Gap:** No simplified SDK for tool access, despite having best-in-class semantic routing

---

### 1.3 Authentication & OAuth

#### **Composio** (⭐⭐⭐⭐⭐)
```typescript
const composio = new Composio({ apiKey: 'your-api-key' });
// OAuth handled automatically per user
```
- Single API key for platform
- OAuth abstracted away
- Per-user credential management

#### **mcp-use** (⭐⭐⭐⭐)
```typescript
// OAuth handled in Inspector UI
// Or via server configuration
const server = createMCPServer("my-server", {...});
```
- Inspector has built-in OAuth flows
- Configuration-based

#### **Connectors (Current)** (⭐⭐⭐)
```bash
# Step 1: Configure OAuth per tenant per integration
curl -X POST http://localhost:3000/api/v1/tenants/acme/integrations/github/oauth-config \
  -d '{
    "clientId": "...",
    "clientSecret": "...",
    "redirectUri": "...",
    "scopes": ["repo"]
  }'

# Step 2: Use tools with tenant ID
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{"toolId": "...", "tenantId": "acme", ...}'
```
- Enterprise multi-tenant OAuth (unique advantage!)
- Vault-backed security
- Manual REST API configuration required

**Gap:** OAuth configuration requires separate API calls; no SDK abstraction

---

### 1.4 Framework Integration

#### **Composio** (⭐⭐⭐⭐⭐)
Supports **10+ AI frameworks** out-of-the-box:
- OpenAI (native + Agents SDK)
- Anthropic Claude
- LangChain/LangGraph
- LlamaIndex
- Google Gemini/ADK
- CrewAI, AutoGen
- Vercel AI SDK, Mastra, Cloudflare Workers

```typescript
// OpenAI Agents SDK
import { Agent } from '@openai/agents';
const tools = await composio.tools.get(userId, { toolkits: ['GITHUB'] });
const agent = new Agent({ model: 'gpt-4o', tools });
```

#### **mcp-use** (⭐⭐⭐⭐⭐)
Supports **LangChain** natively, extensible to others:
```python
from langchain_openai import ChatOpenAI
agent = MCPAgent(llm=ChatOpenAI(model="gpt-4o"), client=client)
```

#### **Connectors (Current)** (⭐⭐)
- Framework-agnostic REST API
- No native integrations
- Developers must build their own adapters

**Gap:** Zero framework integrations; REST-only limits adoption

---

### 1.5 Deployment & Hosting

#### **Composio** (⭐⭐⭐⭐⭐)
- **Managed cloud** (primary)
- Self-hosted via Universal MCP Gateway (August 2025 launch)
- Zero infrastructure management

#### **mcp-use** (⭐⭐⭐⭐)
- **Bring Your Own MCP servers**
  - Third-party MCP servers (stdio)
  - External remote services (SSE, HTTP)
  - Cloud-hosted servers
  - Self-hosted (managed or self-hosted mcp-use hosting)
  - Stdio MCP servers
- Supports **SSE, stdio, streamable HTTP**
- Works with any model

#### **Connectors (Current)** (⭐⭐⭐⭐)
- **Self-hosted only** (Docker + Kubernetes)
- Full control over infrastructure
- Multi-tenant Vault setup required
- Complex initial setup

**Gap:** No managed/cloud option; high deployment barrier for small teams

---

## 2. Feature Comparison Matrix

| Feature | Composio | mcp-use | Connectors |
|---------|----------|---------|------------|
| **SDK (TypeScript)** | ✅ Yes | ✅ Yes | ❌ No (REST only) |
| **SDK (Python)** | ✅ Yes | ✅ Yes | ❌ No (REST only) |
| **Semantic Tool Selection** | ❌ No | ❌ No | ✅ **Yes** (unique) |
| **Token Reduction** | Partial | ❌ No | ✅ **99%** (unique) |
| **GraphRAG Relationships** | ❌ No | ❌ No | ✅ Yes (unique) |
| **Multi-Tenant OAuth** | ✅ Yes | ❌ No | ✅ **Yes** (Vault-backed) |
| **Managed Integrations** | ✅ 500+ | ❌ No | ✅ 15 (self-hosted) |
| **Framework Integrations** | ✅ 10+ | ✅ LangChain | ❌ None |
| **Agent Support** | ✅ Yes | ✅ **Yes** | ❌ No |
| **MCP Server Creation** | ❌ No | ✅ **Yes** | ❌ No (manual) |
| **Built-in Inspector** | ❌ No | ✅ **Yes** (web UI) | ❌ No |
| **Self-Hosted** | ✅ Yes (new) | ✅ Yes | ✅ **Yes** (only) |
| **Managed Cloud** | ✅ **Primary** | ❌ No | ❌ No |
| **Progressive Loading** | ❌ No | ❌ No | ✅ Yes (unique) |
| **Rate Limiting** | ✅ Yes | ❌ No | ✅ Yes |
| **API Authentication** | ✅ API Key | Config-based | ✅ API Key + Tenant |

---

## 3. Unique Differentiators

### **Composio's Strengths**
1. **500+ pre-built managed integrations** - Largest ecosystem
2. **10+ AI framework integrations** - Plug-and-play with any LLM framework
3. **Managed cloud service** - Zero infrastructure
4. **Universal MCP Gateway** - Single endpoint for all integrations
5. **Developer-first SDK** - Extremely simple API

**Target:** Developers who want managed integrations with zero setup

---

### **mcp-use's Strengths**
1. **6-line agent creation** - Simplest MCP framework
2. **Full-stack MCP** - Build agents, clients, AND servers
3. **Built-in web inspector** - Interactive debugging
4. **Multi-server support** - Manage multiple MCP servers in one client
5. **Bring Your Own Servers** - SSE, stdio, HTTP support
6. **Type safety** - Zod schema validation

**Target:** MCP developers building custom agents/servers

---

### **Connectors' Strengths**
1. **99% token reduction** - Semantic routing solves MCP's biggest problem
2. **GraphRAG enhancement** - AI-powered tool discovery
3. **Enterprise multi-tenant OAuth** - Vault-backed, auto-refresh
4. **Self-hosted + open source** - Full control, no vendor lock-in
5. **Progressive loading** - Three-tier schema optimization
6. **Production-ready** - Docker, Kubernetes, rate limiting, security

**Target:** Infrastructure teams building enterprise AI platforms

---

## 4. Critical Gaps in Connectors

### 4.1 No SDK (Critical)

**Current State:**
```bash
# Developers must do this manually
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{"query": "...", "context": {...}}'
```

**Competitor State (Composio):**
```typescript
const composio = new Composio();
const tools = await composio.tools.get(userId, { toolkits: ['GITHUB'] });
```

**Impact:** High barrier to entry, limited adoption

---

### 4.2 No Framework Integrations (Critical)

**Current State:**
Zero integration with OpenAI, LangChain, LlamaIndex, etc.

**Competitor State:**
Composio has `@composio/openai`, `@composio/langchain`, etc.

**Impact:** Developers must build custom adapters

---

### 4.3 No Agent Support (High Priority)

**Current State:**
Gateway provides tools, but no agent orchestration

**Competitor State:**
mcp-use: `agent = MCPAgent(llm=llm, client=client)`

**Impact:** Missing key use case (agents)

---

### 4.4 Complex OAuth Setup (Medium Priority)

**Current State:**
```bash
# Separate API call for OAuth config
POST /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
```

**Competitor State:**
```typescript
// OAuth handled automatically
const composio = new Composio({ apiKey: '...' });
```

**Impact:** Complex onboarding for OAuth-based integrations

---

### 4.5 No Managed/Cloud Option (Medium Priority)

**Current State:**
Self-hosted only (Docker + K8s setup)

**Competitor State:**
Composio offers managed cloud

**Impact:** High barrier for small teams/individuals

---

## 5. SDK Design Proposal

### 5.1 Proposed API

#### **TypeScript SDK**

```typescript
import { Connectors } from '@connectors/sdk';

// 1. Initialize (simple)
const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  apiKey: process.env.CONNECTORS_API_KEY,
  tenantId: 'my-company' // optional, for multi-tenant
});

// 2. Semantic tool selection (unique to Connectors)
const tools = await connectors.tools.select('create a GitHub pull request', {
  maxTools: 5,
  categories: ['code'],
  tokenBudget: 2000
});

// 3. List tools (traditional)
const allTools = await connectors.tools.list({ category: 'code' });

// 4. Get specific MCP server
const github = connectors.mcp.get('github');
const pr = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'Add feature',
  head: 'feature',
  base: 'main'
});

// 5. Configure OAuth (simplified)
await connectors.oauth.configure('github', {
  clientId: '...',
  clientSecret: '...',
  scopes: ['repo', 'user']
});

// 6. List integrations
const integrations = await connectors.mcp.list();
// => ['github', 'notion', 'linkedin', ...]
```

#### **Python SDK**

```python
from connectors import Connectors

# 1. Initialize
connectors = Connectors(
    base_url='http://localhost:3000',
    api_key=os.getenv('CONNECTORS_API_KEY'),
    tenant_id='my-company'
)

# 2. Semantic selection
tools = await connectors.tools.select(
    'create a GitHub pull request',
    max_tools=5,
    categories=['code']
)

# 3. MCP server access
github = connectors.mcp.get('github')
pr = await github.call('createPullRequest', {
    'repo': 'owner/repo',
    'title': 'Add feature'
})

# 4. List MCP servers
servers = await connectors.mcp.list()
```

---

### 5.2 Framework Integration Examples

#### **OpenAI Agents SDK**

```typescript
import { Agent } from '@openai/agents';
import { Connectors, ConnectorsProvider } from '@connectors/openai-agents';

const connectors = new Connectors({
  provider: new ConnectorsProvider()
});

// Semantic tool selection for agent
const tools = await connectors.tools.select('create PR and notify team', {
  maxTools: 10
});

const agent = new Agent({
  model: 'gpt-4o',
  tools: tools.map(t => t.toOpenAITool())
});

const result = await agent.run('Create a PR for the authentication refactor');
```

#### **LangChain**

```python
from langchain_openai import ChatOpenAI
from connectors.langchain import ConnectorsToolkit

connectors = ConnectorsToolkit(
    base_url='http://localhost:3000',
    api_key='...'
)

# Semantic tool selection
tools = await connectors.get_tools(query='create PR on GitHub', max_tools=5)

llm = ChatOpenAI(model='gpt-4o')
agent = initialize_agent(tools, llm, agent=AgentType.OPENAI_FUNCTIONS)

result = agent.run('Create a PR for the new feature')
```

---

### 5.3 Agent Support

```typescript
import { ConnectorsAgent } from '@connectors/agents';

// Create agent with semantic tool selection
const agent = new ConnectorsAgent({
  connectors: new Connectors({ apiKey: '...' }),
  model: 'gpt-4o',
  autoSelectTools: true, // Automatically use semantic routing
  maxTools: 10
});

// Agent automatically discovers and uses tools
const result = await agent.run(
  'Create a GitHub PR, update Notion, and post to LinkedIn'
);
```

---

### 5.4 Proposed Package Structure

```
@connectors/sdk              # Core SDK (TypeScript)
connectors                   # Core SDK (Python)
@connectors/openai-agents    # OpenAI Agents integration
@connectors/langchain        # LangChain integration
connectors-langchain         # Python LangChain
@connectors/llamaindex       # LlamaIndex integration
@connectors/agents           # Built-in agent framework
@connectors/cli              # CLI tool
```

---

## 6. Competitive Positioning Strategy

### **Current: Infrastructure Product**
- Target: DevOps/Platform teams
- Value: Self-hosted, secure, token optimization
- Use case: Build internal AI platforms

### **Proposed: Developer Product + Infrastructure**
- **Layer 1 (SDK):** Simple SDK like Composio/mcp-use
  - Target: All developers
  - Value: 3-line setup, semantic tool selection

- **Layer 2 (Framework):** Framework integrations
  - Target: LLM framework users
  - Value: Drop-in replacement for tool calling

- **Layer 3 (Infrastructure):** Self-hosted gateway
  - Target: Enterprise teams
  - Value: Multi-tenant, Vault, GraphRAG, token optimization

### **Unique Selling Points**
1. **Only platform with semantic tool selection** → Automatic tool discovery
2. **99% token reduction** → Solve MCP's biggest problem
3. **Open source + self-hosted** → No vendor lock-in
4. **Enterprise OAuth** → Multi-tenant ready
5. **Simple SDK + Powerful Infrastructure** → Best of both worlds

---

## 7. Implementation Roadmap

### **Phase 1: Core SDK** (2-3 weeks)
- [ ] TypeScript SDK (`@connectors/sdk`)
- [ ] Python SDK (`connectors`)
- [ ] Core features:
  - [ ] `connectors.tools.select()` (semantic)
  - [ ] `connectors.tools.list()`
  - [ ] `connectors.mcp.get()` / `connectors.mcp.list()`
  - [ ] `connectors.oauth.configure()`
- [ ] Documentation + examples
- [ ] NPM/PyPI publishing

### **Phase 2: Framework Integrations** (2-3 weeks)
- [ ] OpenAI Agents SDK integration
- [ ] LangChain integration (Python + TypeScript)
- [ ] LlamaIndex integration
- [ ] Example agents for each framework

### **Phase 3: Agent Framework** (3-4 weeks)
- [ ] `@connectors/agents` package
- [ ] Multi-step agent orchestration
- [ ] Automatic tool selection
- [ ] Streaming support
- [ ] Inspector UI (similar to mcp-use)

### **Phase 4: Developer Experience** (2 weeks)
- [ ] CLI tool (`npx connectors init`)
- [ ] Interactive setup wizard
- [ ] Code generation templates
- [ ] VS Code extension (optional)

---

## 8. Success Metrics

### **Adoption Metrics**
- NPM downloads per week
- PyPI downloads per week
- GitHub stars/forks
- Community contributions

### **Developer Experience Metrics**
- Time to first successful API call
- Lines of code for basic setup
- Framework integration usage
- Documentation search queries

### **Technical Metrics**
- Token reduction maintained (99%+)
- Selection latency (<100ms)
- SDK overhead (<50ms)
- Error rates

---

## 9. Conclusion

### **Key Findings**

1. **Composio** wins on **managed integrations** and **framework support**
2. **mcp-use** wins on **simplicity** and **full-stack MCP development**
3. **Connectors** wins on **token optimization** and **enterprise infrastructure**

### **Critical Gap**

**Connectors has world-class infrastructure but poor developer accessibility.**

Without an SDK, developers must:
- Manually craft REST API calls
- Handle JSON serialization
- Manage OAuth configuration separately
- Build their own framework integrations

This creates a massive adoption barrier despite having unique technical advantages (99% token reduction, semantic routing, GraphRAG).

### **Recommendation**

**Build a Composio-style SDK on top of Connectors' infrastructure:**

1. **Simple SDK** → `const connectors = new Connectors({ apiKey: '...' })`
2. **Semantic selection** → `await connectors.tools.select('create PR')`
3. **MCP access** → `connectors.mcp.get('github')`
4. **Framework integrations** → `@connectors/openai-agents`, `@connectors/langchain`
5. **Agent support** → `new ConnectorsAgent({ ... })`

**Result:** Best of all worlds
- **Composio's simplicity** → 3-line setup
- **mcp-use's flexibility** → Full MCP control
- **Connectors' power** → 99% token reduction, GraphRAG, enterprise OAuth

---

## 10. Next Steps

1. **Validate SDK API** with target developers
2. **Prototype TypeScript SDK** (core features)
3. **Build 1-2 framework integrations** (OpenAI Agents, LangChain)
4. **Create comparison demos** (show Connectors vs Composio side-by-side)
5. **Launch beta** with early adopters
6. **Iterate based on feedback**

**Timeline:** 8-10 weeks for full SDK + framework integrations + agent support

**Priority:** **Critical** - SDK is blocking adoption despite superior infrastructure

---

**End of Competitive Analysis**
