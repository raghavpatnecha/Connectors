# Connectors SDK Design Proposal

**Date:** 2025-11-17
**Status:** Proposal
**Goal:** Create developer-friendly SDKs matching Composio/mcp-use simplicity while leveraging Connectors' unique semantic routing

---

## 1. Core Design Principles

### 1.1 Simplicity First
- **3-line initialization** (like Composio)
- **Intuitive method names** (`connectors.tools.select()`, `connectors.mcp.get()`)
- **Sensible defaults** (auto-configure common scenarios)
- **Progressive disclosure** (simple → advanced)

### 1.2 Leverage Unique Strengths
- **Semantic tool selection** as primary interface
- **Token optimization** transparent to developers
- **GraphRAG enhancement** automatic
- **Multi-tenant OAuth** simplified

### 1.3 Framework Agnostic Core + Framework Adapters
- Core SDK works standalone
- Separate packages for OpenAI, LangChain, LlamaIndex
- Consistent API across frameworks

### 1.4 Type Safety
- Full TypeScript definitions
- Python type hints
- Runtime validation
- Auto-generated types from OpenAPI specs

---

## 2. Core SDK API

### 2.1 TypeScript SDK (`@connectors/sdk`)

#### **Installation**
```bash
npm install @connectors/sdk
```

#### **Basic Usage**

```typescript
import { Connectors } from '@connectors/sdk';

// Initialize
const connectors = new Connectors({
  baseURL: 'http://localhost:3000', // or cloud: https://api.connectors.dev
  apiKey: process.env.CONNECTORS_API_KEY,
  tenantId: 'my-company' // Optional for multi-tenant
});

// Semantic tool selection (Connectors' unique feature)
const tools = await connectors.tools.select('create a GitHub pull request', {
  maxTools: 5,
  categories: ['code'],
  tokenBudget: 2000
});

console.log(tools);
// [
//   {
//     id: 'github.createPullRequest',
//     name: 'Create Pull Request',
//     description: '...',
//     parameters: { ... },
//     tier: 1,
//     relevanceScore: 0.95
//   }
// ]

// Direct MCP server access
const github = connectors.mcp.get('github');
const pr = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'Add authentication',
  head: 'feature/auth',
  base: 'main'
});

console.log(`Created PR #${pr.number}: ${pr.url}`);
```

---

### 2.2 Python SDK (`connectors`)

#### **Installation**
```bash
pip install connectors
```

#### **Basic Usage**

```python
from connectors import Connectors
import os

# Initialize
connectors = Connectors(
    base_url='http://localhost:3000',
    api_key=os.getenv('CONNECTORS_API_KEY'),
    tenant_id='my-company'
)

# Semantic tool selection
tools = await connectors.tools.select(
    'create a GitHub pull request',
    max_tools=5,
    categories=['code'],
    token_budget=2000
)

print(f"Selected {len(tools)} tools with {tools.total_tokens} tokens")

# Direct MCP access
github = connectors.mcp.get('github')
pr = await github.call('createPullRequest', {
    'repo': 'owner/repo',
    'title': 'Add authentication',
    'head': 'feature/auth',
    'base': 'main'
})

print(f"Created PR #{pr['number']}: {pr['url']}")
```

---

## 3. Detailed API Design

### 3.1 Connectors Class

```typescript
class Connectors {
  constructor(config: ConnectorsConfig);

  // Tool selection and management
  readonly tools: ToolsAPI;

  // MCP server access
  readonly mcp: MCPRegistry;

  // OAuth configuration
  readonly oauth: OAuthManager;

  // Categories and metadata
  readonly categories: CategoriesAPI;

  // Health and monitoring
  health(): Promise<HealthStatus>;
  metrics(): Promise<Metrics>;
}

interface ConnectorsConfig {
  baseURL: string;              // Gateway URL
  apiKey?: string;              // Optional API key
  tenantId?: string;            // Optional tenant ID
  timeout?: number;             // Request timeout (default: 30s)
  retries?: number;             // Retry count (default: 3)
  logger?: Logger;              // Custom logger
}
```

---

### 3.2 Tools API

```typescript
interface ToolsAPI {
  /**
   * Semantic tool selection (Connectors' unique feature)
   * Uses FAISS + GraphRAG to find relevant tools
   */
  select(
    query: string,
    options?: SelectOptions
  ): Promise<ToolSelection>;

  /**
   * List all available tools (traditional catalog)
   */
  list(filters?: ListFilters): Promise<Tool[]>;

  /**
   * Get specific tool by ID
   */
  get(toolId: string): Promise<Tool>;

  /**
   * Invoke a tool directly
   */
  invoke(toolId: string, parameters: Record<string, any>): Promise<any>;
}

interface SelectOptions {
  maxTools?: number;           // Max tools to return (default: 5)
  categories?: string[];       // Filter by categories
  tokenBudget?: number;        // Max tokens (default: 3000)
  integrations?: string[];     // Filter by integrations
}

interface ToolSelection {
  tools: Tool[];               // Selected tools
  query: string;               // Original query
  totalTokens: number;         // Token usage
  latencyMs: number;           // Selection time
  tier1: Tool[];               // Top tools (full schema)
  tier2: Tool[];               // Medium tools (basic schema)
  tier3: Tool[];               // Remaining tools (minimal schema)
}

interface Tool {
  id: string;                  // e.g., 'github.createPullRequest'
  name: string;                // Human-readable name
  description: string;         // What the tool does
  category: string;            // e.g., 'code'
  integration: string;         // e.g., 'github'
  parameters: ParameterSchema; // JSON Schema
  tier?: 1 | 2 | 3;           // Progressive loading tier
  relevanceScore?: number;     // 0-1 (only for select())
  tokenCost?: number;          // Token cost of this tool
}
```

**Example Usage:**

```typescript
// Simple semantic selection
const tools = await connectors.tools.select('create a PR on GitHub');

// Advanced filtering
const tools = await connectors.tools.select('schedule a meeting', {
  maxTools: 3,
  categories: ['productivity'],
  integrations: ['google-calendar', 'notion'],
  tokenBudget: 1500
});

// Access tiered results
console.log('Tier 1 (full):', tools.tier1.length);
console.log('Tier 2 (medium):', tools.tier2.length);
console.log('Tier 3 (minimal):', tools.tier3.length);
console.log('Token usage:', tools.totalTokens);
```

---

### 3.3 MCP Registry API

```typescript
interface MCPRegistry {
  /**
   * Get MCP server instance
   */
  get(integration: string): MCPServer;

  /**
   * List all available MCP servers
   */
  list(): Promise<MCPServerInfo[]>;

  /**
   * Check if integration is available
   */
  has(integration: string): Promise<boolean>;
}

interface MCPServer {
  readonly name: string;
  readonly category: string;

  /**
   * Call a tool on this MCP server
   */
  call(toolName: string, parameters: Record<string, any>): Promise<any>;

  /**
   * List tools provided by this server
   */
  tools(): Promise<Tool[]>;

  /**
   * Get server health
   */
  health(): Promise<{ status: 'ok' | 'error' }>;
}

interface MCPServerInfo {
  name: string;                // e.g., 'github'
  displayName: string;         // e.g., 'GitHub'
  category: string;            // e.g., 'code'
  toolCount: number;           // Number of tools
  configured: boolean;         // OAuth configured?
  status: 'operational' | 'degraded' | 'down';
}
```

**Example Usage:**

```typescript
// List all MCP servers
const servers = await connectors.mcp.list();
console.log(servers);
// [
//   { name: 'github', displayName: 'GitHub', category: 'code', toolCount: 50, ... },
//   { name: 'notion', displayName: 'Notion', category: 'productivity', toolCount: 40, ... }
// ]

// Get specific server
const github = connectors.mcp.get('github');

// Call tool directly
const pr = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'Add feature',
  head: 'feature',
  base: 'main'
});

// List server's tools
const githubTools = await github.tools();
console.log(`GitHub has ${githubTools.length} tools`);
```

---

### 3.4 OAuth Manager API

```typescript
interface OAuthManager {
  /**
   * Configure OAuth for an integration
   */
  configure(
    integration: string,
    config: OAuthConfig
  ): Promise<void>;

  /**
   * Get OAuth configuration (excluding secrets)
   */
  getConfig(integration: string): Promise<OAuthConfigPublic>;

  /**
   * Delete OAuth configuration
   */
  deleteConfig(integration: string): Promise<void>;

  /**
   * List configured integrations
   */
  listConfigured(): Promise<string[]>;

  /**
   * Get OAuth authorization URL for user flow
   */
  getAuthorizationUrl(
    integration: string,
    state?: string
  ): Promise<string>;

  /**
   * Exchange authorization code for tokens
   */
  exchangeCode(
    integration: string,
    code: string
  ): Promise<void>;
}

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
}

interface OAuthConfigPublic {
  clientId: string;            // Public client ID
  redirectUri: string;
  scopes: string[];
  configured: boolean;
}
```

**Example Usage:**

```typescript
// Configure OAuth (one-time setup)
await connectors.oauth.configure('github', {
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: 'https://myapp.com/oauth/callback',
  scopes: ['repo', 'user']
});

// Get authorization URL (for user OAuth flow)
const authUrl = await connectors.oauth.getAuthorizationUrl('github', 'random-state');
console.log('Authorize at:', authUrl);

// Exchange code (after user authorizes)
await connectors.oauth.exchangeCode('github', code);

// List configured integrations
const configured = await connectors.oauth.listConfigured();
console.log('Configured:', configured); // ['github', 'notion']
```

---

### 3.5 Categories API

```typescript
interface CategoriesAPI {
  /**
   * List all categories
   */
  list(): Promise<Category[]>;

  /**
   * Get category details
   */
  get(categoryId: string): Promise<Category>;
}

interface Category {
  id: string;                  // e.g., 'code'
  name: string;                // e.g., 'Code & Development'
  description: string;
  toolCount: number;
  integrations: string[];      // e.g., ['github']
}
```

**Example Usage:**

```typescript
const categories = await connectors.categories.list();
console.log(categories);
// [
//   { id: 'code', name: 'Code & Development', toolCount: 50, ... },
//   { id: 'communication', name: 'Communication', toolCount: 80, ... }
// ]
```

---

## 4. Framework Integrations

### 4.1 OpenAI Agents SDK (`@connectors/openai-agents`)

```typescript
import { Agent } from '@openai/agents';
import { Connectors } from '@connectors/sdk';
import { ConnectorsProvider } from '@connectors/openai-agents';

const connectors = new Connectors({
  apiKey: process.env.CONNECTORS_API_KEY
});

// Semantic tool selection for agent
const tools = await connectors.tools.select('create PR and notify team', {
  maxTools: 10
});

// Convert to OpenAI format
const openAITools = tools.tools.map(t => ({
  type: 'function',
  function: {
    name: t.id,
    description: t.description,
    parameters: t.parameters
  }
}));

const agent = new Agent({
  model: 'gpt-4o',
  tools: openAITools,
  // ConnectorsProvider handles tool execution
  provider: new ConnectorsProvider(connectors)
});

const result = await agent.run('Create a PR for the authentication refactor');
console.log(result);
```

---

### 4.2 LangChain Integration (`@connectors/langchain`)

#### **TypeScript**

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { Connectors } from '@connectors/sdk';
import { ConnectorsToolkit } from '@connectors/langchain';

const connectors = new Connectors({ apiKey: '...' });
const toolkit = new ConnectorsToolkit(connectors);

// Semantic tool selection
const tools = await toolkit.getTools('create GitHub PR', { maxTools: 5 });

const llm = new ChatOpenAI({ modelName: 'gpt-4o' });
const agent = createOpenAIFunctionsAgent({ llm, tools });
const executor = AgentExecutor.fromAgentAndTools({ agent, tools });

const result = await executor.invoke({
  input: 'Create a PR for the new authentication feature'
});
```

#### **Python**

```python
from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from connectors.langchain import ConnectorsToolkit

# Initialize toolkit
toolkit = ConnectorsToolkit(
    base_url='http://localhost:3000',
    api_key='...'
)

# Semantic tool selection
tools = await toolkit.get_tools(
    query='create GitHub PR',
    max_tools=5,
    categories=['code']
)

# Create agent
llm = ChatOpenAI(model='gpt-4o')
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True
)

# Run agent
result = agent.run('Create a PR for the authentication refactor')
print(result)
```

---

### 4.3 LlamaIndex Integration (`@connectors/llamaindex`)

```python
from llama_index.agent import OpenAIAgent
from connectors.llamaindex import ConnectorsToolSpec

# Initialize Connectors tools
connectors_tools = ConnectorsToolSpec(
    base_url='http://localhost:3000',
    api_key='...'
)

# Semantic tool selection
tools = await connectors_tools.to_tool_list(
    query='create GitHub issues and PRs',
    max_tools=8
)

# Create LlamaIndex agent
agent = OpenAIAgent.from_tools(tools, verbose=True)

# Run agent
response = agent.chat('Create an issue and PR for the bug fix')
print(response)
```

---

## 5. Agent Framework (`@connectors/agents`)

### 5.1 Built-in Agent

```typescript
import { ConnectorsAgent } from '@connectors/agents';
import { Connectors } from '@connectors/sdk';

const agent = new ConnectorsAgent({
  connectors: new Connectors({ apiKey: '...' }),
  model: 'gpt-4o',
  autoSelectTools: true,  // Automatically use semantic routing
  maxTools: 10,
  streaming: true
});

// Agent automatically discovers tools via semantic search
const result = await agent.run(
  'Create a GitHub PR, update the Notion page, and post to LinkedIn',
  {
    onStep: (step) => console.log('Step:', step),
    onToolCall: (tool) => console.log('Calling:', tool.name)
  }
);

console.log(result.output);
console.log('Tools used:', result.toolsUsed);
console.log('Token usage:', result.tokenUsage);
```

---

### 5.2 Streaming Support

```typescript
import { ConnectorsAgent } from '@connectors/agents';

const agent = new ConnectorsAgent({
  connectors: new Connectors({ apiKey: '...' }),
  model: 'gpt-4o',
  streaming: true
});

// Stream results
for await (const chunk of agent.stream('Create a PR on GitHub')) {
  if (chunk.type === 'text') {
    process.stdout.write(chunk.content);
  } else if (chunk.type === 'tool_call') {
    console.log('\n[Tool]:', chunk.tool.name);
  } else if (chunk.type === 'tool_result') {
    console.log('[Result]:', chunk.result);
  }
}
```

---

## 6. CLI Tool (`@connectors/cli`)

### 6.1 Installation

```bash
npm install -g @connectors/cli
# or
npx @connectors/cli
```

---

### 6.2 Commands

```bash
# Initialize new project
connectors init
# > Select language: TypeScript / Python
# > Select framework: OpenAI Agents / LangChain / LlamaIndex / Standalone
# > Enter API key: ***
# > Created connectors.config.json

# List integrations
connectors list

# Search tools
connectors search "create GitHub PR"
# > github.createPullRequest (relevance: 0.95)
# > github.updatePullRequest (relevance: 0.78)

# Configure OAuth
connectors oauth setup github
# > Client ID: ***
# > Client Secret: ***
# > Scopes: repo, user
# > ✅ OAuth configured for GitHub

# Test tool
connectors test github.createPullRequest --params '{"repo":"owner/repo",...}'

# Generate code
connectors generate agent --query "create GitHub PRs" --framework langchain
# > Generated agent.py with semantic tool selection
```

---

## 7. Configuration File

### 7.1 `connectors.config.json`

```json
{
  "baseURL": "http://localhost:3000",
  "apiKey": "${CONNECTORS_API_KEY}",
  "tenantId": "my-company",
  "defaults": {
    "maxTools": 5,
    "tokenBudget": 3000,
    "categories": ["code", "communication"]
  },
  "oauth": {
    "github": {
      "clientId": "${GITHUB_CLIENT_ID}",
      "clientSecret": "${GITHUB_CLIENT_SECRET}",
      "scopes": ["repo", "user"]
    },
    "notion": {
      "clientId": "${NOTION_CLIENT_ID}",
      "clientSecret": "${NOTION_CLIENT_SECRET}"
    }
  },
  "integrations": {
    "enabled": ["github", "notion", "linkedin", "google-calendar"],
    "disabled": []
  }
}
```

---

## 8. Error Handling

### 8.1 Error Types

```typescript
import { ConnectorsError, OAuthError, ToolSelectionError } from '@connectors/sdk';

try {
  const tools = await connectors.tools.select('create PR');
} catch (error) {
  if (error instanceof OAuthError) {
    console.error('OAuth not configured:', error.integration);
    // Prompt user to configure OAuth
  } else if (error instanceof ToolSelectionError) {
    console.error('Tool selection failed:', error.message);
    // Fallback to manual tool selection
  } else if (error instanceof ConnectorsError) {
    console.error('API error:', error.statusCode, error.message);
  }
}
```

---

### 8.2 Retry Logic

```typescript
const connectors = new Connectors({
  apiKey: '...',
  retries: 3,              // Retry failed requests 3 times
  retryDelay: 1000,        // 1 second between retries
  retryOn: [408, 429, 500, 502, 503, 504] // HTTP codes to retry
});
```

---

## 9. Type Safety

### 9.1 TypeScript Definitions

```typescript
// Auto-generated from OpenAPI specs
import type { GitHubTypes } from '@connectors/sdk/integrations/github';

const github = connectors.mcp.get('github');

// Full type safety
const pr = await github.call<GitHubTypes.CreatePullRequest>(
  'createPullRequest',
  {
    repo: 'owner/repo',
    title: 'Add feature',
    head: 'feature',
    base: 'main'
    // TypeScript will error if parameters are wrong
  }
);

// Result is typed
pr.number; // number
pr.url;    // string
```

---

### 9.2 Python Type Hints

```python
from connectors import Connectors
from connectors.integrations.github import GitHubPullRequest

connectors = Connectors(api_key='...')
github = connectors.mcp.get('github')

# Type-checked parameters
pr: GitHubPullRequest = await github.call(
    'createPullRequest',
    repo='owner/repo',
    title='Add feature',
    head='feature',
    base='main'
)

# Type-safe result access
pr_number: int = pr.number
pr_url: str = pr.url
```

---

## 10. Testing & Mocking

### 10.1 Mock Client

```typescript
import { MockConnectors } from '@connectors/sdk/testing';

const mockConnectors = new MockConnectors();

// Mock tool selection
mockConnectors.tools.mockSelect('create PR', [
  { id: 'github.createPullRequest', name: 'Create PR', ... }
]);

// Mock tool invocation
mockConnectors.mcp.mockCall('github', 'createPullRequest', {
  number: 123,
  url: 'https://github.com/...'
});

// Use in tests
const result = await mockConnectors.tools.select('create PR');
expect(result.tools).toHaveLength(1);
```

---

## 11. Comparison: Before vs After

### 11.1 Before (Current: Raw REST API)

```typescript
// Complex, manual REST calls
const response = await fetch('http://localhost:3000/api/v1/tools/select', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    query: 'create a GitHub pull request',
    context: {
      allowedCategories: ['code'],
      tokenBudget: 2000,
      maxTools: 5,
      tenantId: 'my-company'
    }
  })
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error);
}

const tools = data.tools.tier1;

// Invoke tool (another manual call)
const invokeResponse = await fetch('http://localhost:3000/api/v1/tools/invoke', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    toolId: tools[0].toolId,
    integration: 'github',
    tenantId: 'my-company',
    parameters: {
      repo: 'owner/repo',
      title: 'Add feature',
      head: 'feature',
      base: 'main'
    }
  })
});

const pr = await invokeResponse.json();
```

**Issues:**
- 40+ lines of boilerplate
- Manual error handling
- No type safety
- Easy to make mistakes

---

### 11.2 After (With SDK)

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({ apiKey: '...' });

// Semantic tool selection
const tools = await connectors.tools.select('create a GitHub pull request', {
  maxTools: 5,
  categories: ['code']
});

// Invoke tool
const github = connectors.mcp.get('github');
const pr = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'Add feature',
  head: 'feature',
  base: 'main'
});

console.log(`Created PR #${pr.number}`);
```

**Benefits:**
- 10 lines of code (75% reduction)
- Full type safety
- Automatic error handling
- Intuitive API

---

## 12. Documentation Structure

```
docs/
├── README.md                  # Overview + quick start
├── getting-started/
│   ├── installation.md
│   ├── configuration.md
│   └── first-agent.md
├── api-reference/
│   ├── connectors.md          # Main class
│   ├── tools.md               # Tools API
│   ├── mcp.md                 # MCP Registry
│   ├── oauth.md               # OAuth Manager
│   └── categories.md          # Categories API
├── framework-integrations/
│   ├── openai-agents.md
│   ├── langchain.md
│   ├── llamaindex.md
│   └── custom.md
├── agents/
│   ├── built-in-agent.md
│   ├── streaming.md
│   └── custom-agents.md
├── examples/
│   ├── github-automation.md
│   ├── notion-integration.md
│   ├── multi-tool-agent.md
│   └── oauth-flow.md
└── advanced/
    ├── type-safety.md
    ├── error-handling.md
    ├── testing.md
    └── performance.md
```

---

## 13. Implementation Plan

### Phase 1: Core SDK (3 weeks)

**Week 1: TypeScript SDK Core**
- [ ] Project setup (`@connectors/sdk`)
- [ ] `Connectors` class with REST client
- [ ] `ToolsAPI` implementation
- [ ] `MCPRegistry` implementation
- [ ] Error classes
- [ ] Unit tests (80%+ coverage)

**Week 2: Python SDK Core**
- [ ] Project setup (`connectors`)
- [ ] `Connectors` class with REST client
- [ ] `ToolsAPI` implementation
- [ ] `MCPRegistry` implementation
- [ ] Type hints
- [ ] Unit tests (80%+ coverage)

**Week 3: OAuth & Categories**
- [ ] `OAuthManager` (TS + Python)
- [ ] `CategoriesAPI` (TS + Python)
- [ ] Integration tests
- [ ] Documentation
- [ ] Publish to NPM/PyPI (beta)

---

### Phase 2: Framework Integrations (2 weeks)

**Week 4: OpenAI Agents + LangChain (TS)**
- [ ] `@connectors/openai-agents`
- [ ] `@connectors/langchain`
- [ ] Example projects
- [ ] Documentation

**Week 5: LangChain + LlamaIndex (Python)**
- [ ] `connectors-langchain`
- [ ] `connectors-llamaindex`
- [ ] Example projects
- [ ] Documentation

---

### Phase 3: Agent Framework (2 weeks)

**Week 6: Built-in Agent**
- [ ] `@connectors/agents` (TypeScript)
- [ ] `ConnectorsAgent` class
- [ ] Multi-step orchestration
- [ ] Streaming support
- [ ] Examples

**Week 7: Python Agent + CLI**
- [ ] `connectors.agents` (Python)
- [ ] `@connectors/cli` tool
- [ ] Interactive setup wizard
- [ ] Code generation

---

### Phase 4: Polish & Launch (1 week)

**Week 8: Documentation & Examples**
- [ ] Complete API documentation
- [ ] Tutorial videos
- [ ] Example projects (GitHub repos)
- [ ] Migration guide (REST → SDK)
- [ ] Blog post
- [ ] **Public launch** 🚀

---

## 14. Success Metrics

### Developer Experience
- **Time to first API call:** <5 minutes (vs 30+ minutes with REST)
- **Lines of code:** 10 lines (vs 40+ with REST)
- **NPM downloads:** 1000+/week (month 3)
- **GitHub stars:** 500+ (month 3)

### Technical
- **Type safety:** 100% (TypeScript + Python hints)
- **Test coverage:** 85%+
- **API latency overhead:** <50ms
- **Bundle size:** <100KB (TypeScript, minified)

### Adoption
- **Framework integrations:** 3+ (OpenAI, LangChain, LlamaIndex)
- **Community contributions:** 10+ PRs
- **Production users:** 50+ (month 6)

---

## 15. Conclusion

### Current State
Connectors has world-class infrastructure (99% token reduction, semantic routing, GraphRAG, enterprise OAuth) but **poor developer accessibility** (raw REST API only).

### Proposed State
**Composio-style SDK on Connectors infrastructure:**
- **3-line initialization** → `const connectors = new Connectors({ apiKey: '...' })`
- **Semantic tool selection** → `await connectors.tools.select('create PR')`
- **Direct MCP access** → `connectors.mcp.get('github').call('createPR', ...)`
- **Framework integrations** → `@connectors/openai-agents`, `@connectors/langchain`
- **Built-in agents** → `new ConnectorsAgent({ ... })`

### Result
**Best of all worlds:**
- **Composio's simplicity** (3-line setup, framework support)
- **mcp-use's flexibility** (direct MCP access, built-in agents)
- **Connectors' power** (99% token reduction, semantic routing, enterprise OAuth)

**Timeline:** 8 weeks to full SDK + framework integrations + agent support

**Priority:** **Critical** - SDK is blocking adoption despite superior infrastructure

---

**End of SDK Design Proposal**
