# Connectors SDK & MCP.add() - Final Implementation Plan

**Date:** 2025-11-17
**Based on:** Competitive analysis + SDK design + MCP.add() design + Existing codebase analysis
**Execution:** Claude Flow Swarm Orchestration (parallel agents)

---

## 🎯 Executive Summary

### **Goals**
1. **Build TypeScript SDK** (`@connectors/sdk`) - Make Connectors easy to use like Composio/mcp-use
2. **Implement mcp.add()** - Allow users to deploy custom MCP servers from GitHub/STDIO/HTTP/Docker
3. **Framework Integrations** - OpenAI Agents, LangChain adapters
4. **Maintain unique advantages** - Semantic routing, 99% token reduction, GraphRAG

### **Timeline**
- **Phase 1-2 (Weeks 1-5):** Core SDK + Backend deployer
- **Phase 3 (Weeks 6-7):** Framework integrations
- **Phase 4 (Week 8):** Polish, docs, launch

### **Success Metrics**
- SDK reduces code from 40 lines → 10 lines (75% reduction)
- Time to first API call: <5 minutes (vs 30+ minutes)
- Deploy custom MCP server in 1 command
- Maintain 99% token reduction

---

## 📂 Project Structure (Integration with Existing Codebase)

```
Connectors/
├── gateway/                           # Existing gateway (KEEP)
│   ├── src/
│   │   ├── server.ts                 # ✅ Existing - ADD new routes
│   │   ├── routing/                  # ✅ Existing - semantic router
│   │   ├── optimization/             # ✅ Existing - token optimizer
│   │   ├── auth/                     # ✅ Existing - OAuth, Vault
│   │   ├── graph/                    # ✅ Existing - GraphRAG
│   │   ├── integrations/             # ✅ Existing - 15 integrations
│   │   ├── routes/
│   │   │   ├── tenant-oauth.ts       # ✅ Existing
│   │   │   └── mcp-management.ts     # 🆕 NEW - mcp.add() routes
│   │   ├── services/
│   │   │   ├── mcp-deployer.ts       # 🆕 NEW - Deploy custom servers
│   │   │   ├── github-service.ts     # 🆕 NEW - Clone repos
│   │   │   ├── docker-builder.ts     # 🆕 NEW - Build images
│   │   │   └── k8s-deployer.ts       # 🆕 NEW - Deploy to K8s
│   │   └── wrappers/
│   │       └── stdio-to-http.ts      # 🆕 NEW - STDIO wrapper
│   ├── packages/                     # 🆕 NEW - Monorepo packages
│   │   ├── sdk/                      # 🆕 TypeScript SDK
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Connectors.ts
│   │   │   │   ├── ToolsAPI.ts
│   │   │   │   ├── MCPRegistry.ts
│   │   │   │   ├── OAuthManager.ts
│   │   │   │   └── types/
│   │   │   ├── tests/
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   ├── openai-agents/            # 🆕 OpenAI integration
│   │   ├── langchain/                # 🆕 LangChain integration
│   │   └── cli/                      # 🆕 CLI tool
│   └── package.json                  # ✅ Update with workspaces
├── python-sdk/                       # 🆕 NEW - Python SDK
│   ├── connectors/
│   │   ├── __init__.py
│   │   ├── client.py
│   │   ├── tools.py
│   │   ├── mcp.py
│   │   └── types.py
│   ├── tests/
│   ├── setup.py
│   └── pyproject.toml
├── k8s/
│   └── mcp-deployer/                 # 🆕 NEW - K8s for deployer
│       ├── deployment.yaml
│       ├── service.yaml
│       └── rbac.yaml
└── .claude/docs/                     # ✅ Existing - analysis docs
    ├── competitive-analysis-composio-mcp-use.md
    ├── sdk-design-proposal.md
    ├── mcp-add-functionality-design.md
    └── implementation-plan-final.md  # This file
```

---

## 🔧 Phase 1: Core TypeScript SDK (Weeks 1-3)

### **Work Package 1.1: SDK Foundation**

**Owner:** SDK-Core Agent
**Files to Create:**
```
gateway/packages/sdk/
├── src/
│   ├── index.ts                      # Main exports
│   ├── Connectors.ts                 # Core class
│   ├── types/
│   │   ├── config.ts                 # ConnectorsConfig
│   │   ├── tools.ts                  # Tool types
│   │   ├── mcp.ts                    # MCP types
│   │   └── index.ts
│   └── utils/
│       ├── http-client.ts            # Fetch wrapper
│       └── validation.ts             # Runtime validation
├── tests/
│   ├── Connectors.test.ts
│   └── setup.ts
├── package.json
├── tsconfig.json
└── README.md
```

**Tasks:**
1. Setup monorepo workspace in `gateway/package.json`
2. Create SDK package structure
3. Implement `Connectors` class with config
4. Implement HTTP client with retry logic
5. Add runtime validation
6. Write unit tests (85%+ coverage)
7. Build system (TypeScript → dist/)

**Integration Points:**
- Uses existing gateway REST API at `http://localhost:3000/api/v1`
- No gateway changes needed for basic SDK

**Acceptance Criteria:**
```typescript
// This should work
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  apiKey: 'test-key',
  tenantId: 'test-tenant'
});

expect(connectors).toBeDefined();
expect(connectors.tools).toBeDefined();
expect(connectors.mcp).toBeDefined();
```

---

### **Work Package 1.2: ToolsAPI Implementation**

**Owner:** SDK-Tools Agent
**Files to Create:**
```
gateway/packages/sdk/src/
├── ToolsAPI.ts                       # Tools interface
├── types/tools.ts                    # Tool selection types
└── tests/ToolsAPI.test.ts
```

**Tasks:**
1. Implement `ToolsAPI` class
2. `select()` method → POST /api/v1/tools/select
3. `list()` method → GET /api/v1/tools/list
4. `invoke()` method → POST /api/v1/tools/invoke
5. Handle tiered responses (tier1, tier2, tier3)
6. Error handling and retries
7. Write integration tests

**Integration Points:**
- Maps to existing gateway endpoints (no changes)
- `gateway/src/routes/` already has these endpoints

**Acceptance Criteria:**
```typescript
const tools = await connectors.tools.select('create a GitHub PR', {
  maxTools: 5,
  categories: ['code']
});

expect(tools.tools).toBeArray();
expect(tools.totalTokens).toBeLessThan(3000);
expect(tools.tier1).toBeDefined();
```

---

### **Work Package 1.3: MCPRegistry Implementation**

**Owner:** SDK-MCP Agent
**Files to Create:**
```
gateway/packages/sdk/src/
├── MCPRegistry.ts                    # MCP server access
├── MCPServer.ts                      # Individual server
├── types/mcp.ts                      # MCP types
└── tests/MCPRegistry.test.ts
```

**Tasks:**
1. Implement `MCPRegistry` class
2. `get()` method - returns `MCPServer` instance
3. `list()` method - lists all integrations
4. `MCPServer.call()` - invoke tools
5. Auto-fill `integration` and `tenantId` from context
6. Error handling for missing servers
7. Write unit + integration tests

**Integration Points:**
- Uses `POST /api/v1/tools/invoke` (existing)
- Uses `GET /api/v1/tools/list?integration=X` (existing)

**Acceptance Criteria:**
```typescript
const github = connectors.mcp.get('github');
const pr = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'Test',
  head: 'feature',
  base: 'main'
});

expect(pr.number).toBeDefined();
// SDK auto-fills: toolId='github.createPullRequest', integration='github', tenantId from config
```

---

## 🚀 Phase 2: MCP.add() Backend (Weeks 3-5)

### **Work Package 2.1: MCP Deployer Service**

**Owner:** Backend-Deployer Agent
**Files to Create:**
```
gateway/src/services/
├── mcp-deployer/
│   ├── index.ts                      # Main deployer
│   ├── types.ts                      # Deployment types
│   ├── github-deployer.ts            # GitHub → Docker → K8s
│   ├── stdio-deployer.ts             # STDIO → HTTP wrapper
│   ├── http-deployer.ts              # Remote registration
│   └── docker-deployer.ts            # Docker image deploy
gateway/src/routes/
└── mcp-management.ts                 # API routes
```

**Tasks:**
1. Create `MCPDeployer` service
2. Implement GitHub deployment pipeline
3. Implement STDIO containerization
4. Implement remote HTTP registration
5. Add deployment status tracking (Redis)
6. Tool discovery after deployment
7. Semantic router integration
8. Write integration tests

**Integration Points:**
- **Extends:** `gateway/src/config/integrations.ts` (add custom servers)
- **Uses:** `gateway/src/routing/semantic-router.ts` (add tools to FAISS)
- **Uses:** `gateway/src/graph/graphrag-service.ts` (add relationships)
- **Stores:** Deployment status in Redis

**New API Endpoints:**
```typescript
POST /api/v1/mcp/add
GET /api/v1/mcp/deployments/:deploymentId
GET /api/v1/mcp/custom
DELETE /api/v1/mcp/custom/:name
```

**Acceptance Criteria:**
```bash
curl -X POST http://localhost:3000/api/v1/mcp/add \
  -d '{
    "name": "test-server",
    "source": { "type": "github", "url": "https://github.com/user/repo" },
    "category": "productivity"
  }'

# Returns: { deploymentId: "dep-123", status: "deploying" }

# Wait for deployment
curl http://localhost:3000/api/v1/mcp/deployments/dep-123
# Returns: { status: "running", toolsDiscovered: 12 }

# Tools now available via semantic routing!
```

---

### **Work Package 2.2: GitHub Service**

**Owner:** Backend-GitHub Agent
**Files to Create:**
```
gateway/src/services/
├── github-service.ts                 # Clone, detect type
└── tests/github-service.test.ts
```

**Tasks:**
1. Implement repo cloning (use `simple-git`)
2. Detect MCP server type (Node/Python/etc.)
3. Parse `package.json` or `requirements.txt`
4. Detect entrypoint (main file)
5. Handle private repos (GitHub tokens)
6. Error handling (invalid repos)
7. Write unit tests

**Dependencies to Add:**
```json
{
  "dependencies": {
    "simple-git": "^3.19.0",
    "dockerode": "^3.3.5"
  }
}
```

**Acceptance Criteria:**
```typescript
const repo = await githubService.clone('https://github.com/user/mcp-server');
expect(repo.type).toBe('node'); // or 'python'
expect(repo.entrypoint).toBe('dist/index.js');
expect(repo.dependencies).toContain('@modelcontextprotocol/sdk');
```

---

### **Work Package 2.3: Docker Builder**

**Owner:** Backend-Docker Agent
**Files to Create:**
```
gateway/src/services/
├── docker-builder.ts                 # Build images
├── dockerfile-generator.ts           # Generate Dockerfiles
└── tests/docker-builder.test.ts
```

**Tasks:**
1. Generate Dockerfiles (Node, Python templates)
2. Build Docker images (use `dockerode`)
3. Tag images properly
4. Push to registry (optional for self-hosted)
5. Handle build errors
6. Write unit tests

**Acceptance Criteria:**
```typescript
const dockerfile = dockerfileGenerator.generate('node', repo);
const image = await dockerBuilder.build(dockerfile, 'custom-server:latest');
expect(image.id).toBeDefined();
```

---

### **Work Package 2.4: Kubernetes Deployer**

**Owner:** Backend-K8s Agent
**Files to Create:**
```
gateway/src/services/
├── k8s-deployer.ts                   # Deploy to K8s
├── k8s-templates/
│   ├── deployment.yaml.ts            # Template
│   ├── service.yaml.ts               # Template
│   └── rbac.yaml.ts                  # Template (if needed)
└── tests/k8s-deployer.test.ts
```

**Tasks:**
1. Generate K8s manifests from templates
2. Deploy to K8s cluster (use `@kubernetes/client-node`)
3. Create Service for HTTP access
4. Health checks
5. Resource limits (CPU, memory)
6. Handle deployment failures
7. Rollback on errors
8. Write integration tests

**Dependencies to Add:**
```json
{
  "dependencies": {
    "@kubernetes/client-node": "^0.20.0"
  }
}
```

**Acceptance Criteria:**
```typescript
const deployment = await k8sDeployer.deploy({
  name: 'custom-server',
  image: 'custom-server:latest',
  port: 3000,
  env: { API_KEY: 'secret' }
});

expect(deployment.status).toBe('running');
expect(deployment.endpoint).toMatch(/http:\/\/custom-server\.mcp\.svc/);
```

---

### **Work Package 2.5: STDIO Wrapper**

**Owner:** Backend-STDIO Agent
**Files to Create:**
```
gateway/src/wrappers/
├── stdio-to-http.ts                  # Wrapper server
├── stdio-process-manager.ts          # Process lifecycle
└── tests/stdio-wrapper.test.ts
```

**Tasks:**
1. Create HTTP→STDIO bridge
2. Spawn child processes (stdio commands)
3. JSON-RPC over stdin/stdout
4. Convert to HTTP REST API
5. Process lifecycle management
6. Error handling (process crashes)
7. Write integration tests

**Acceptance Criteria:**
```typescript
// Wrapper runs: npx -y @modelcontextprotocol/server-filesystem
// Exposes HTTP API:
POST /tools/readFile → sends to stdin → returns stdout response
GET /tools → lists available tools
```

---

### **Work Package 2.6: SDK mcp.add() Integration**

**Owner:** SDK-MCP-Add Agent
**Files to Create:**
```
gateway/packages/sdk/src/
├── MCPRegistry.ts                    # UPDATE with add() methods
├── types/deployment.ts               # Deployment types
└── tests/mcp-add.test.ts
```

**Tasks:**
1. Add `add()` method to `MCPRegistry`
2. Add `addFromConfig()` method
3. Add `waitForDeployment()` helper
4. Add `remove()` method
5. Handle deployment status polling
6. Error handling
7. Write integration tests

**Acceptance Criteria:**
```typescript
const deployment = await connectors.mcp.add({
  name: 'my-server',
  source: { type: 'github', url: 'https://github.com/user/server' },
  category: 'productivity'
});

await deployment.waitUntilReady();

const myServer = connectors.mcp.get('my-server');
const result = await myServer.call('customTool', {});
expect(result).toBeDefined();
```

---

## 🔌 Phase 3: Framework Integrations (Weeks 6-7)

### **Work Package 3.1: OpenAI Agents Integration**

**Owner:** Framework-OpenAI Agent
**Files to Create:**
```
gateway/packages/openai-agents/
├── src/
│   ├── index.ts
│   ├── ConnectorsProvider.ts         # Tool execution
│   ├── tool-converter.ts             # Connectors → OpenAI format
│   └── types.ts
├── tests/
├── package.json
└── README.md
```

**Tasks:**
1. Create package structure
2. Implement `ConnectorsProvider` for OpenAI Agents
3. Convert Connectors tools → OpenAI function format
4. Handle tool execution
5. Write examples
6. Write tests
7. Publish to NPM

**Acceptance Criteria:**
```typescript
import { Agent } from '@openai/agents';
import { ConnectorsProvider } from '@connectors/openai-agents';

const tools = await connectors.tools.select('create PR');
const agent = new Agent({
  model: 'gpt-4o',
  tools,
  provider: new ConnectorsProvider(connectors)
});

const result = await agent.run('Create a PR on GitHub');
expect(result).toContain('Created PR #');
```

---

### **Work Package 3.2: LangChain Integration**

**Owner:** Framework-LangChain Agent
**Files to Create:**
```
gateway/packages/langchain/
├── src/
│   ├── index.ts
│   ├── ConnectorsToolkit.ts          # LangChain toolkit
│   ├── tool-converter.ts             # Connectors → LangChain
│   └── types.ts
├── tests/
├── package.json
└── README.md
```

**Tasks:**
1. Create package structure
2. Implement `ConnectorsToolkit`
3. Convert tools → LangChain `StructuredTool`
4. Semantic tool selection integration
5. Write examples (TypeScript)
6. Write tests
7. Publish to NPM

**Acceptance Criteria:**
```typescript
import { ConnectorsToolkit } from '@connectors/langchain';

const toolkit = new ConnectorsToolkit(connectors);
const tools = await toolkit.getTools('create GitHub PR', { maxTools: 5 });

const agent = createOpenAIFunctionsAgent({ llm, tools });
const result = await executor.invoke({ input: 'Create a PR' });
```

---

## 🐍 Phase 4: Python SDK (Parallel with Phase 3)

### **Work Package 4.1: Python SDK Core**

**Owner:** Python-SDK Agent
**Files to Create:**
```
python-sdk/
├── connectors/
│   ├── __init__.py
│   ├── client.py                     # Connectors class
│   ├── tools.py                      # ToolsAPI
│   ├── mcp.py                        # MCPRegistry
│   ├── oauth.py                      # OAuthManager
│   ├── types.py                      # Type definitions
│   └── http_client.py                # HTTP wrapper
├── tests/
│   ├── test_client.py
│   ├── test_tools.py
│   └── test_mcp.py
├── setup.py
├── pyproject.toml
└── README.md
```

**Tasks:**
1. Create Python package structure
2. Implement `Connectors` class
3. Implement `ToolsAPI` class
4. Implement `MCPRegistry` class
5. HTTP client with retries
6. Type hints throughout
7. Write unit + integration tests
8. Publish to PyPI

**Dependencies:**
```python
[tool.poetry.dependencies]
python = "^3.9"
httpx = "^0.24.0"
pydantic = "^2.0.0"
typing-extensions = "^4.5.0"
```

**Acceptance Criteria:**
```python
from connectors import Connectors

connectors = Connectors(
    base_url='http://localhost:3000',
    api_key='test-key',
    tenant_id='test-tenant'
)

tools = await connectors.tools.select('create a GitHub PR')
assert len(tools.tools) > 0
assert tools.total_tokens < 3000
```

---

## 📚 Phase 5: Documentation & Launch (Week 8)

### **Work Package 5.1: Documentation**

**Owner:** Docs Agent
**Files to Create:**
```
docs/
├── sdk/
│   ├── getting-started.md
│   ├── typescript-sdk.md
│   ├── python-sdk.md
│   ├── api-reference.md
│   └── examples/
│       ├── basic-usage.md
│       ├── semantic-selection.md
│       ├── custom-mcp-servers.md
│       └── framework-integrations.md
├── guides/
│   ├── mcp-add-guide.md
│   ├── migration-rest-to-sdk.md
│   └── best-practices.md
└── tutorials/
    ├── first-agent.md
    └── deploy-custom-server.md
```

**Tasks:**
1. Write getting started guide
2. API reference documentation
3. Code examples for all features
4. Migration guide (REST → SDK)
5. Tutorial videos (optional)
6. Update main README.md
7. Create changelog

---

### **Work Package 5.2: CLI Tool**

**Owner:** CLI Agent
**Files to Create:**
```
gateway/packages/cli/
├── src/
│   ├── index.ts
│   ├── commands/
│   │   ├── init.ts                   # connectors init
│   │   ├── mcp-add.ts                # connectors mcp add
│   │   ├── mcp-list.ts               # connectors mcp list
│   │   └── mcp-import.ts             # connectors mcp import
│   └── utils/
│       ├── interactive.ts            # Prompts
│       └── spinner.ts                # Loading spinners
├── tests/
├── package.json
└── README.md
```

**Tasks:**
1. Setup CLI with Commander.js
2. `connectors init` - interactive setup
3. `connectors mcp add` - deploy server
4. `connectors mcp list` - list servers
5. `connectors mcp import` - bulk import
6. Interactive prompts (Inquirer.js)
7. Write tests
8. Publish to NPM

**Acceptance Criteria:**
```bash
$ npx connectors init
? Language: TypeScript
? Framework: OpenAI Agents
? API Key: ***
✓ Created connectors.config.json

$ connectors mcp add --github https://github.com/user/server
Deploying server...
✓ Deployed with 12 tools
```

---

## 🔄 Integration with Existing Codebase

### **Files to Modify**

#### **1. gateway/package.json**
```json
{
  "name": "@connectors/gateway",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "sdk:build": "npm run build --workspace=@connectors/sdk",
    "sdk:test": "npm run test --workspace=@connectors/sdk",
    "sdk:publish": "npm publish --workspace=@connectors/sdk"
  }
}
```

#### **2. gateway/src/server.ts**
```typescript
// ADD new route
import { createMCPManagementRouter } from './routes/mcp-management';

// In setupRoutes()
const mcpRouter = createMCPManagementRouter(this.mcpDeployer);
apiV1.use('/mcp', mcpRouter);
```

#### **3. gateway/src/config/integrations.ts**
```typescript
// ADD support for custom integrations
interface Integration {
  name: string;
  category: string;
  source: 'built-in' | 'github' | 'stdio' | 'http' | 'docker';
  endpoint?: string;  // For custom integrations
}

// ADD method to register custom integrations
registerCustomIntegration(config: CustomIntegrationConfig): void;
```

#### **4. gateway/src/routing/semantic-router.ts**
```typescript
// ADD method to dynamically add tools
async addCustomTools(
  integration: string,
  tools: Tool[]
): Promise<void> {
  // Generate embeddings
  // Update FAISS indices
  // Add to GraphRAG
}
```

---

## 🤖 Swarm Orchestration Plan

### **Agent Roles**

| Agent | Work Packages | Duration | Dependencies |
|-------|--------------|----------|--------------|
| **SDK-Core** | 1.1 | 3 days | None |
| **SDK-Tools** | 1.2 | 2 days | SDK-Core |
| **SDK-MCP** | 1.3 | 2 days | SDK-Core |
| **Backend-Deployer** | 2.1 | 5 days | None (parallel) |
| **Backend-GitHub** | 2.2 | 3 days | Backend-Deployer |
| **Backend-Docker** | 2.3 | 3 days | Backend-GitHub |
| **Backend-K8s** | 2.4 | 4 days | Backend-Docker |
| **Backend-STDIO** | 2.5 | 3 days | Backend-Deployer |
| **SDK-MCP-Add** | 2.6 | 2 days | Backend-Deployer, SDK-MCP |
| **Framework-OpenAI** | 3.1 | 4 days | SDK-Tools |
| **Framework-LangChain** | 3.2 | 4 days | SDK-Tools |
| **Python-SDK** | 4.1 | 5 days | SDK-Core (reference) |
| **Docs** | 5.1 | 3 days | All above |
| **CLI** | 5.2 | 3 days | SDK-MCP-Add |

### **Execution Waves**

**Wave 1 (Parallel):**
- SDK-Core
- Backend-Deployer

**Wave 2 (Parallel):**
- SDK-Tools
- SDK-MCP
- Backend-GitHub
- Backend-STDIO

**Wave 3 (Parallel):**
- Backend-Docker
- Backend-K8s
- SDK-MCP-Add

**Wave 4 (Parallel):**
- Framework-OpenAI
- Framework-LangChain
- Python-SDK

**Wave 5 (Parallel):**
- Docs
- CLI

---

## 📋 Memory Store Summary

**For Claude Flow Memory:**

```yaml
project: Connectors SDK Implementation
phase: Planning Complete
next_action: Execute with swarm orchestration

key_decisions:
  - SDK location: gateway/packages/sdk (monorepo)
  - Backend services: gateway/src/services/mcp-deployer
  - Deployment: Kubernetes with Docker
  - Framework integrations: OpenAI Agents, LangChain
  - Timeline: 8 weeks, 5 parallel waves

existing_codebase:
  - gateway: Express TypeScript server
  - semantic_router: FAISS + GraphRAG working
  - auth: Vault + OAuth working
  - integrations: 15 servers operational

new_features:
  - TypeScript SDK (@connectors/sdk)
  - Python SDK (connectors)
  - mcp.add() - Deploy custom servers (GitHub/STDIO/HTTP/Docker)
  - Framework integrations (OpenAI, LangChain)
  - CLI tool

integration_points:
  - gateway/src/server.ts - Add mcp management routes
  - gateway/src/routing/semantic-router.ts - Add custom tools dynamically
  - gateway/src/config/integrations.ts - Register custom integrations

agents_needed:
  - SDK development: 3 agents (Core, Tools, MCP)
  - Backend: 5 agents (Deployer, GitHub, Docker, K8s, STDIO)
  - Integration: 3 agents (OpenAI, LangChain, Python)
  - Polish: 2 agents (Docs, CLI)

success_metrics:
  - Code reduction: 40 lines → 10 lines (75%)
  - Time to first call: <5 minutes
  - Custom server deploy: 1 command
  - Token reduction: 99% maintained
```

---

## ✅ Ready for Execution

**Next Steps:**
1. ✅ Store this plan in Claude Flow memory
2. ✅ Initialize swarm with 14 agents
3. ✅ Execute Wave 1 (SDK-Core + Backend-Deployer) in parallel
4. ✅ Continue through Waves 2-5
5. ✅ Integrate, test, deploy

**Estimated Timeline:**
- **Weeks 1-2:** SDK Core + Backend foundation
- **Weeks 3-4:** MCP.add() backend complete
- **Weeks 5-6:** SDK mcp.add() + Framework integrations
- **Week 7:** Python SDK + Testing
- **Week 8:** Docs + CLI + Launch

**End State:**
- Developers use `@connectors/sdk` like Composio/mcp-use
- Custom MCP servers deployed with `connectors.mcp.add()`
- Semantic routing + 99% token reduction for ALL servers
- Framework integrations for OpenAI Agents, LangChain
- Best-in-class developer experience

---

**Implementation Plan Complete. Ready for Swarm Orchestration.**
