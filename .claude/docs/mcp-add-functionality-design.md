# MCP.add() Functionality Design

**Date:** 2025-11-17
**Feature:** Allow users to bring their own MCP servers to Connectors
**Goal:** Make Connectors extensible like mcp-use while maintaining token optimization

---

## 🎯 Overview

Allow developers to add custom MCP servers to Connectors in three ways:

1. **GitHub URL** → Auto-deploy from repository
2. **Standard MCP Config** → STDIO/SSE/HTTP server definition
3. **Docker Image** → Pre-built container

**Result:** Users get semantic routing + token optimization for ANY MCP server, not just pre-built integrations.

---

## 📋 MCP Server Configuration Formats

### **Standard MCP Configuration Schema**

Based on MCP specification (2025-06-18):

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "env": {
        "API_KEY": "optional-value"
      }
    }
  }
}
```

### **Transport Types**

| Transport | Use Case | Configuration |
|-----------|----------|---------------|
| **STDIO** | Local CLI tools | `command` + `args` + `env` |
| **SSE** | Remote HTTP (legacy) | `url` + `headers` |
| **Streamable HTTP** | Remote (modern) | `url` + `headers` |

---

## 🚀 Proposed SDK API

### **1. Add from GitHub URL**

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({ apiKey: '...' });

// Add MCP server from GitHub
const server = await connectors.mcp.add({
  name: 'my-custom-server',
  source: {
    type: 'github',
    url: 'https://github.com/username/my-mcp-server'
    // or: url: 'https://gitmcp.io/username/my-mcp-server'
  },
  category: 'productivity',
  description: 'My custom integration'
});

console.log(`Deployed: ${server.name}`);
// Gateway automatically:
// 1. Clones repo
// 2. Detects MCP server type (stdio/SSE/HTTP)
// 3. Builds Docker container
// 4. Deploys to cluster
// 5. Generates embeddings for semantic routing
// 6. Adds to tool catalog

// Use immediately
const myServer = connectors.mcp.get('my-custom-server');
const result = await myServer.call('someTool', { ... });
```

---

### **2. Add from MCP Config (STDIO)**

```typescript
// Add local STDIO server
const server = await connectors.mcp.add({
  name: 'filesystem',
  source: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    env: {
      ALLOWED_DIRS: '/home/user/projects'
    }
  },
  category: 'storage',
  description: 'Local filesystem access'
});

// Gateway:
// 1. Containerizes the STDIO server
// 2. Deploys as sidecar container
// 3. Proxies stdin/stdout over HTTP
// 4. Adds to semantic routing
```

---

### **3. Add from Remote URL (SSE/HTTP)**

```typescript
// Add remote MCP server
const server = await connectors.mcp.add({
  name: 'github-remote',
  source: {
    type: 'http',
    url: 'https://api.githubcopilot.com/mcp/',
    headers: {
      'Authorization': 'Bearer YOUR_GITHUB_TOKEN'
    }
  },
  category: 'code',
  description: 'GitHub official remote MCP server'
});

// Gateway:
// 1. Registers remote endpoint
// 2. Proxies requests with OAuth
// 3. Discovers tools from server
// 4. Generates embeddings
// 5. Adds to semantic routing
```

---

### **4. Add from Docker Image**

```typescript
// Add pre-built Docker container
const server = await connectors.mcp.add({
  name: 'custom-integration',
  source: {
    type: 'docker',
    image: 'username/my-mcp-server:latest',
    env: {
      API_KEY: 'secret-key'
    },
    port: 3000
  },
  category: 'custom',
  description: 'Pre-built MCP server'
});

// Gateway:
// 1. Pulls Docker image
// 2. Deploys to cluster
// 3. Registers service endpoint
// 4. Discovers tools
// 5. Adds to semantic routing
```

---

### **5. Bulk Add from Config File**

```typescript
// Load multiple servers from JSON config
const servers = await connectors.mcp.addFromConfig({
  mcpServers: {
    'filesystem': {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem'],
      category: 'storage'
    },
    'github-remote': {
      url: 'https://api.githubcopilot.com/mcp/',
      headers: { 'Authorization': 'Bearer ...' },
      category: 'code'
    },
    'my-github-server': {
      github: 'https://github.com/username/my-server',
      category: 'productivity'
    }
  }
});

console.log(`Deployed ${servers.length} servers`);
```

---

## 🏗️ Architecture

### **Deployment Flow**

```
┌─────────────────────────────────────────────────────┐
│ User calls connectors.mcp.add()                     │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Gateway API: POST /api/v1/mcp/add                   │
│ - Validates config                                   │
│ - Determines source type (GitHub/STDIO/HTTP/Docker) │
└───────────────┬─────────────────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│ GitHub       │  │ STDIO/HTTP   │
│ - Clone repo │  │ - Containerize│
│ - Detect MCP │  │ - Deploy     │
│ - Build img  │  │              │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Deploy to Kubernetes                                 │
│ - Create Deployment + Service                        │
│ - Configure OAuth proxy                              │
│ - Health checks                                      │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Tool Discovery                                       │
│ - Connect to MCP server                              │
│ - Call tools/list                                    │
│ - Extract tool schemas                               │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Semantic Routing Integration                         │
│ - Generate embeddings for each tool                  │
│ - Update FAISS indices                               │
│ - Add to GraphRAG (tool relationships)               │
│ - Update token optimizer                             │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ Ready to Use!                                        │
│ - Available via connectors.mcp.get()                │
│ - Included in semantic tool selection                │
│ - Token optimization enabled                         │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Gateway API Endpoints

### **Add MCP Server**

```bash
POST /api/v1/mcp/add
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "name": "my-server",
  "source": {
    "type": "github",
    "url": "https://github.com/username/my-mcp-server"
  },
  "category": "productivity",
  "description": "My custom integration",
  "tenantId": "my-company"  // Optional: tenant-specific
}
```

**Response:**
```json
{
  "success": true,
  "server": {
    "name": "my-server",
    "category": "productivity",
    "status": "deploying",
    "deploymentId": "dep-abc123",
    "estimatedTime": "2-5 minutes"
  }
}
```

---

### **Check Deployment Status**

```bash
GET /api/v1/mcp/deployments/dep-abc123

{
  "deploymentId": "dep-abc123",
  "status": "running",  // deploying | running | failed
  "progress": {
    "clone": "completed",
    "build": "completed",
    "deploy": "completed",
    "discovery": "completed",
    "embeddings": "in_progress"
  },
  "toolsDiscovered": 15,
  "endpoint": "http://my-server.mcp.svc.cluster.local:3000"
}
```

---

### **List Custom Servers**

```bash
GET /api/v1/mcp/custom

{
  "servers": [
    {
      "name": "my-server",
      "category": "productivity",
      "toolCount": 15,
      "status": "running",
      "source": "github.com/username/my-mcp-server",
      "deployedAt": "2025-11-17T10:30:00Z"
    }
  ]
}
```

---

### **Remove Custom Server**

```bash
DELETE /api/v1/mcp/custom/my-server

{
  "success": true,
  "message": "Server my-server removed"
}
```

---

## 💻 Complete SDK Examples

### **Example 1: Add from GitHub (GitMCP Pattern)**

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({ apiKey: '...' });

// Add any GitHub repo as MCP server
const server = await connectors.mcp.add({
  name: 'awesome-integration',
  source: {
    type: 'github',
    url: 'https://github.com/awesome/mcp-server',
    branch: 'main',  // Optional
    auth: {          // Optional for private repos
      type: 'token',
      token: process.env.GITHUB_TOKEN
    }
  },
  category: 'productivity'
});

// Wait for deployment
await connectors.mcp.waitForDeployment(server.deploymentId);

// Use immediately with semantic routing!
const tools = await connectors.tools.select('use awesome integration', {
  integrations: ['awesome-integration']
});

// Or direct access
const awesome = connectors.mcp.get('awesome-integration');
const result = await awesome.call('someTool', { ... });
```

---

### **Example 2: Add Standard MCP Config**

```typescript
// Add filesystem MCP server
const filesystem = await connectors.mcp.add({
  name: 'filesystem',
  source: {
    type: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    env: {
      ALLOWED_DIRECTORIES: '/home/user/projects,/home/user/documents'
    }
  },
  category: 'storage'
});

// Gateway containerizes and deploys automatically
await filesystem.waitUntilReady();

// Use with semantic routing
const tools = await connectors.tools.select('list files in my projects');
// Returns filesystem tools automatically!
```

---

### **Example 3: Import Existing MCP Config**

```typescript
// Import from Claude Desktop config
import fs from 'fs';

const claudeConfig = JSON.parse(
  fs.readFileSync('~/.config/claude/mcp.json', 'utf-8')
);

// Bulk import all servers
const servers = await connectors.mcp.addFromConfig(claudeConfig);

console.log(`Imported ${servers.length} servers from Claude Desktop`);

// All servers now available with semantic routing + token optimization!
const tools = await connectors.tools.select('search my filesystem and github');
// Returns tools from filesystem + github servers
```

---

### **Example 4: Add Remote GitHub Official Server**

```typescript
// Add GitHub's official remote MCP server
const github = await connectors.mcp.add({
  name: 'github-official',
  source: {
    type: 'http',
    url: 'https://api.githubcopilot.com/mcp/',
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
    }
  },
  category: 'code',
  description: 'GitHub official remote MCP server'
});

// No deployment needed - just proxies to remote
await github.waitUntilReady();  // Just validates connection

// Use immediately
const tools = await connectors.tools.select('create a GitHub issue');
```

---

### **Example 5: CLI Tool**

```bash
# Add from GitHub
$ connectors mcp add \
  --name my-server \
  --github https://github.com/username/my-mcp-server \
  --category productivity

Deploying my-server...
✓ Cloned repository
✓ Built Docker image
✓ Deployed to cluster
✓ Discovered 12 tools
✓ Generated embeddings
✓ Added to semantic routing

Server my-server is ready! 🎉

# Add from MCP config
$ connectors mcp add \
  --name filesystem \
  --stdio "npx -y @modelcontextprotocol/server-filesystem" \
  --env "ALLOWED_DIRS=/home/user/projects"

# Import from config file
$ connectors mcp import ~/.config/claude/mcp.json

Importing 5 servers...
✓ filesystem (stdio)
✓ github (http)
✓ memory (stdio)
✓ brave-search (http)
✓ postgres (stdio)

All servers deployed and ready!

# List custom servers
$ connectors mcp list

Custom MCP Servers:
- my-server (productivity) - 12 tools - github.com/username/my-mcp-server
- filesystem (storage) - 8 tools - stdio
- github-official (code) - 45 tools - api.githubcopilot.com
```

---

## 🎨 Python SDK

```python
from connectors import Connectors

connectors = Connectors(api_key='...')

# Add from GitHub
server = await connectors.mcp.add({
    'name': 'my-server',
    'source': {
        'type': 'github',
        'url': 'https://github.com/username/my-mcp-server'
    },
    'category': 'productivity'
})

await connectors.mcp.wait_for_deployment(server.deployment_id)

# Use with semantic routing
tools = await connectors.tools.select('use my custom server')

# Direct access
my_server = connectors.mcp.get('my-server')
result = await my_server.call('someTool', {...})
```

---

## 🏗️ Backend Implementation

### **Gateway Service: MCP Deployer**

```typescript
// gateway/src/services/mcp-deployer.ts

export class MCPDeployer {
  async deployFromGitHub(config: GitHubMCPConfig): Promise<Deployment> {
    // 1. Clone repository
    const repo = await this.cloneRepo(config.url, config.auth);

    // 2. Detect MCP server type
    const mcpType = await this.detectMCPType(repo);
    // Checks for: package.json (Node), requirements.txt (Python), etc.

    // 3. Build Docker image
    const dockerfile = this.generateDockerfile(mcpType, repo);
    const image = await this.buildDockerImage(dockerfile);

    // 4. Deploy to Kubernetes
    const deployment = await this.deployToK8s({
      name: config.name,
      image,
      env: config.env || {},
      port: mcpType.port || 3000
    });

    // 5. Wait for health check
    await this.waitForHealthy(deployment);

    // 6. Discover tools
    const tools = await this.discoverTools(deployment.endpoint);

    // 7. Generate embeddings
    await this.generateEmbeddings(tools);

    // 8. Update semantic router
    await this.updateSemanticRouter(config.name, tools);

    return deployment;
  }

  async deployFromSTDIO(config: STDIOMCPConfig): Promise<Deployment> {
    // 1. Create wrapper server that runs STDIO command
    const wrapper = this.generateSTDIOWrapper(config);

    // 2. Build Docker image with wrapper
    const image = await this.buildSTDIOImage(wrapper, config);

    // 3. Deploy to K8s
    const deployment = await this.deployToK8s({
      name: config.name,
      image,
      env: config.env || {}
    });

    // 4-8. Same discovery/embedding steps
    // ...

    return deployment;
  }

  async deployRemoteHTTP(config: HTTPMCPConfig): Promise<Deployment> {
    // 1. Validate remote endpoint
    await this.validateEndpoint(config.url);

    // 2. Register in service registry (no K8s deployment needed)
    const registration = await this.registerRemoteService({
      name: config.name,
      url: config.url,
      headers: config.headers
    });

    // 3. Discover tools from remote
    const tools = await this.discoverTools(config.url, config.headers);

    // 4. Generate embeddings
    await this.generateEmbeddings(tools);

    // 5. Update semantic router
    await this.updateSemanticRouter(config.name, tools);

    return { type: 'remote', ...registration };
  }
}
```

---

### **STDIO Wrapper (Containerization)**

```typescript
// Wrapper that converts STDIO MCP server to HTTP
// gateway/src/wrappers/stdio-to-http.ts

import { spawn } from 'child_process';
import express from 'express';

class STDIOToHTTPWrapper {
  private process: ChildProcess;

  constructor(command: string, args: string[], env: Record<string, string>) {
    this.process = spawn(command, args, {
      env: { ...process.env, ...env }
    });
  }

  async callTool(toolName: string, params: any): Promise<any> {
    // Send JSON-RPC over stdin
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name: toolName, arguments: params }
    };

    this.process.stdin.write(JSON.stringify(request) + '\n');

    // Read response from stdout
    return new Promise((resolve, reject) => {
      this.process.stdout.once('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.error) reject(response.error);
        else resolve(response.result);
      });
    });
  }

  async listTools(): Promise<Tool[]> {
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/list'
    };

    this.process.stdin.write(JSON.stringify(request) + '\n');

    return new Promise((resolve) => {
      this.process.stdout.once('data', (data) => {
        const response = JSON.parse(data.toString());
        resolve(response.result.tools);
      });
    });
  }

  // Expose as HTTP API
  createHTTPServer(): express.Application {
    const app = express();
    app.use(express.json());

    app.post('/tools/:toolName', async (req, res) => {
      try {
        const result = await this.callTool(req.params.toolName, req.body);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.get('/tools', async (req, res) => {
      const tools = await this.listTools();
      res.json({ tools });
    });

    return app;
  }
}

// Start wrapper
const wrapper = new STDIOToHTTPWrapper(
  process.env.MCP_COMMAND!,
  JSON.parse(process.env.MCP_ARGS || '[]'),
  JSON.parse(process.env.MCP_ENV || '{}')
);

const app = wrapper.createHTTPServer();
app.listen(3000, () => console.log('STDIO wrapper listening on :3000'));
```

---

### **Dockerfile Generator**

```typescript
// gateway/src/generators/dockerfile-generator.ts

export function generateDockerfile(mcpType: MCPServerType, repo: RepoInfo): string {
  if (mcpType.runtime === 'node') {
    return `
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "${mcpType.entrypoint}"]
    `;
  } else if (mcpType.runtime === 'python') {
    return `
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 3000
CMD ["python", "${mcpType.entrypoint}"]
    `;
  }

  // Generic MCP wrapper
  return `
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g ${mcpType.package}
COPY stdio-wrapper.js .
EXPOSE 3000
CMD ["node", "stdio-wrapper.js"]
  `;
}

export function generateSTDIODockerfile(config: STDIOMCPConfig): string {
  return `
FROM node:20-alpine
WORKDIR /app

# Install stdio-to-http wrapper
COPY stdio-wrapper.js .
RUN npm install express

# Set MCP command as env vars
ENV MCP_COMMAND="${config.command}"
ENV MCP_ARGS='${JSON.stringify(config.args)}'
ENV MCP_ENV='${JSON.stringify(config.env)}'

EXPOSE 3000
CMD ["node", "stdio-wrapper.js"]
  `;
}
```

---

## 🔐 Security Considerations

### **Sandboxing**

```typescript
// Deploy with strict resource limits
const deployment = await deployToK8s({
  name: config.name,
  image,
  resources: {
    limits: {
      cpu: '500m',
      memory: '512Mi'
    },
    requests: {
      cpu: '100m',
      memory: '128Mi'
    }
  },
  securityContext: {
    runAsNonRoot: true,
    readOnlyRootFilesystem: true,
    allowPrivilegeEscalation: false
  },
  networkPolicy: {
    // Only allow egress to approved APIs
    egress: [
      { to: [{ podSelector: {} }] },  // Internal cluster
      { to: [{ cidr: '0.0.0.0/0' }], ports: [443] }  // HTTPS only
    ]
  }
});
```

### **Validation**

```typescript
// Validate MCP server before deployment
async function validateMCPServer(source: MCPSource): Promise<ValidationResult> {
  if (source.type === 'github') {
    // Check repo exists and is public/accessible
    await validateGitHubRepo(source.url, source.auth);

    // Scan for malicious code (basic)
    const repo = await cloneRepo(source.url);
    await scanForMalware(repo);
  }

  if (source.type === 'docker') {
    // Scan Docker image for vulnerabilities
    await scanDockerImage(source.image);
  }

  return { valid: true };
}
```

---

## 📊 Unique Value Proposition

### **Connectors vs mcp-use**

| Feature | mcp-use | Connectors with mcp.add() |
|---------|---------|---------------------------|
| **Add custom servers** | ✅ Config file | ✅ SDK + Config + GitHub URL |
| **STDIO support** | ✅ Yes | ✅ Yes (containerized) |
| **Remote HTTP/SSE** | ✅ Yes | ✅ Yes |
| **GitHub auto-deploy** | ❌ No | ✅ **Yes** (unique!) |
| **Semantic routing** | ❌ No | ✅ **Yes** (unique!) |
| **Token optimization** | ❌ No | ✅ **99% reduction** |
| **GraphRAG discovery** | ❌ No | ✅ **Yes** (unique!) |
| **Multi-tenant** | ❌ No | ✅ Yes |
| **Managed deployment** | ❌ Manual | ✅ **Auto-deploy to K8s** |

**Result:** Bring ANY MCP server to Connectors and automatically get:
- 🚀 Auto-deployment (from GitHub URL)
- 🧠 Semantic tool discovery
- 📉 99% token reduction
- 🔗 GraphRAG relationships
- 🔐 Enterprise OAuth
- 📊 Monitoring & health checks

---

## 🎯 Use Cases

### **1. Import Entire Claude Desktop Config**

```bash
# Import all your Claude Desktop MCP servers
$ connectors mcp import ~/.config/claude/mcp.json

✓ Imported 10 servers with semantic routing + token optimization
```

### **2. Use Community MCP Servers**

```typescript
// Add popular community server
await connectors.mcp.add({
  name: 'brave-search',
  source: {
    type: 'github',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search'
  },
  category: 'search'
});

// Semantic routing now includes Brave Search!
const tools = await connectors.tools.select('search the web for AI news');
// Returns brave-search tools automatically
```

### **3. Internal Company Tools**

```typescript
// Add private company MCP server
await connectors.mcp.add({
  name: 'internal-crm',
  source: {
    type: 'github',
    url: 'https://github.com/mycompany/crm-mcp-server',
    auth: {
      type: 'token',
      token: process.env.GITHUB_TOKEN
    }
  },
  category: 'productivity',
  tenantId: 'mycompany'  // Tenant-specific
});

// Only available to 'mycompany' tenant
```

---

## 📈 Rollout Plan

### **Phase 1: Core Infrastructure (2 weeks)**
- [ ] MCP Deployer service
- [ ] GitHub clone + build
- [ ] Kubernetes deployment automation
- [ ] STDIO wrapper (stdio → HTTP)
- [ ] Tool discovery from deployed servers

### **Phase 2: SDK Integration (1 week)**
- [ ] `connectors.mcp.add()` API
- [ ] Deployment status polling
- [ ] Error handling
- [ ] TypeScript + Python SDKs

### **Phase 3: Semantic Integration (1 week)**
- [ ] Auto-generate embeddings for custom tools
- [ ] Update FAISS indices dynamically
- [ ] Add to GraphRAG
- [ ] Include in semantic tool selection

### **Phase 4: CLI & DX (1 week)**
- [ ] `connectors mcp add` command
- [ ] `connectors mcp import` (bulk)
- [ ] Interactive deployment wizard
- [ ] Web UI for managing custom servers

---

## 🎉 Summary

**What:** `mcp.add()` allows users to bring ANY MCP server to Connectors

**How:**
- GitHub URL → auto-deploy
- MCP config (STDIO/HTTP) → containerize & deploy
- Docker image → deploy to K8s

**Why:**
- Makes Connectors **extensible** (not limited to pre-built integrations)
- Users get **semantic routing + token optimization** for free
- **Best of both worlds:** mcp-use flexibility + Connectors' power

**Result:** Connectors becomes the **ultimate MCP platform**:
- ✅ 15 pre-built integrations (GitHub, Notion, etc.)
- ✅ Bring your own MCP servers (from GitHub, config, Docker)
- ✅ Semantic routing for ALL tools (built-in + custom)
- ✅ 99% token reduction across everything
- ✅ Enterprise OAuth & multi-tenancy
- ✅ Self-hosted + open source

---

**End of MCP.add() Design**
