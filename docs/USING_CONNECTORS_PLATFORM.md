# Using the Connectors Platform in Your Project

**Date:** 2025-11-11
**Audience:** Developers integrating Connectors into their applications
**Time to Integrate:** 10-30 minutes

---

## Overview

The Connectors Platform provides a **REST API** and **MCP-native interface** that makes it trivially easy to integrate 500+ tools/APIs into your AI agent, chatbot, or application.

**Key Benefits:**
- ✅ **One API** → Access to 500+ integrations (GitHub, Slack, Jira, AWS, etc.)
- ✅ **99% Token Reduction** → AI agents can use 500 tools without exhausting context
- ✅ **Automatic OAuth** → No credential management headaches
- ✅ **Semantic Routing** → Natural language → Right tool automatically
- ✅ **Ready in 10 minutes** → Simple REST API or MCP client

---

## Quick Start (30 Seconds)

**1. Start the Gateway:**
```bash
cd gateway
npm install
npm run dev
```

**2. Use it from any language:**
```bash
# Ask for tools
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{"query": "create a GitHub pull request"}'

# Use a tool
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "github.createPullRequest",
    "integration": "github",
    "tenantId": "your-user-id",
    "parameters": {
      "owner": "facebook",
      "repo": "react",
      "title": "Fix bug",
      "head": "feature-branch",
      "base": "main"
    }
  }'
```

**That's it!** 🎉

---

## Integration Methods

### Method 1: REST API (Universal) ⭐ RECOMMENDED

Works with **any language/framework**. The gateway exposes a standard REST API.

**Available Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/tools/select` | POST | Get relevant tools for a query |
| `/api/v1/tools/invoke` | POST | Execute a tool |
| `/api/v1/tools/list` | GET | List all available tools |
| `/api/v1/categories` | GET | List integration categories |
| `/api/v1/metrics` | GET | Get usage metrics |
| `/health` | GET | Health check |
| `/ready` | GET | Readiness probe |

---

### Method 2: MCP Native Client

If you're building an MCP-native application (like Claude Desktop):

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "connectors": {
      "command": "node",
      "args": ["/path/to/connectors/gateway/dist/server.js"]
    }
  }
}
```

Claude (or your MCP client) now has access to all 500+ integrations through one connection!

---

### Method 3: JavaScript/TypeScript SDK

For Node.js/TypeScript applications, use the client directly:

```typescript
import { ConnectorsClient } from '@connectors/client';

const client = new ConnectorsClient({
  baseUrl: 'http://localhost:3000',
  tenantId: 'your-user-id'
});

// Natural language tool selection
const tools = await client.selectTools('create a GitHub PR');

// Invoke tool
const result = await client.invokeTool('github.createPullRequest', {
  owner: 'facebook',
  repo: 'react',
  title: 'Fix bug',
  head: 'feature-branch',
  base: 'main'
});
```

---

## Complete Examples by Language

### Python Example

```python
import requests
import json

class ConnectorsClient:
    def __init__(self, base_url='http://localhost:3000', tenant_id='default'):
        self.base_url = base_url
        self.tenant_id = tenant_id

    def select_tools(self, query, max_tools=5):
        """Get relevant tools for a natural language query."""
        response = requests.post(
            f'{self.base_url}/api/v1/tools/select',
            json={
                'query': query,
                'context': {
                    'tenantId': self.tenant_id,
                    'maxTools': max_tools
                }
            }
        )
        return response.json()

    def invoke_tool(self, tool_id, integration, parameters):
        """Execute a tool."""
        response = requests.post(
            f'{self.base_url}/api/v1/tools/invoke',
            json={
                'toolId': tool_id,
                'integration': integration,
                'tenantId': self.tenant_id,
                'parameters': parameters
            }
        )
        return response.json()

# Usage
client = ConnectorsClient(tenant_id='user-123')

# AI agent query
tools = client.select_tools('send a message to slack #general')
print(f"Found tools: {[t['tool']['name'] for t in tools['tools']]}")

# Execute tool
result = client.invoke_tool(
    tool_id='slack.sendMessage',
    integration='slack',
    parameters={
        'channel': 'C1234567',
        'text': 'Hello from AI agent!'
    }
)
print(f"Message sent: {result}")
```

---

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

class ConnectorsClient {
  constructor(baseUrl = 'http://localhost:3000', tenantId = 'default') {
    this.baseUrl = baseUrl;
    this.tenantId = tenantId;
    this.client = axios.create({ baseURL: baseUrl });
  }

  async selectTools(query, maxTools = 5) {
    const response = await this.client.post('/api/v1/tools/select', {
      query,
      context: {
        tenantId: this.tenantId,
        maxTools
      }
    });
    return response.data;
  }

  async invokeTool(toolId, integration, parameters) {
    const response = await this.client.post('/api/v1/tools/invoke', {
      toolId,
      integration,
      tenantId: this.tenantId,
      parameters
    });
    return response.data;
  }

  async listCategories() {
    const response = await this.client.get('/api/v1/categories');
    return response.data;
  }
}

// Usage in AI agent
async function main() {
  const client = new ConnectorsClient('http://localhost:3000', 'user-123');

  // Semantic tool discovery
  const tools = await client.selectTools('create a jira ticket for this bug');
  console.log('Selected tools:', tools.tools.map(t => t.tool.name));

  // Execute tool
  const result = await client.invokeTool(
    'jira.createIssue',
    'jira',
    {
      project: 'PROJ',
      summary: 'Bug found in login flow',
      description: 'Users cannot login with SSO',
      issueType: 'Bug'
    }
  );
  console.log('Created issue:', result.data);
}

main();
```

---

### TypeScript Example (Full Type Safety)

```typescript
import axios, { AxiosInstance } from 'axios';

interface ToolSelection {
  tool: {
    id: string;
    name: string;
    description: string;
    category: string;
    integration: string;
  };
  relevanceScore: number;
  tier: 1 | 2 | 3;
}

interface SelectToolsResponse {
  tools: ToolSelection[];
  totalTokens: number;
  latencyMs: number;
}

interface InvokeToolResponse {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    executionTime: number;
    integration: string;
  };
}

class ConnectorsClient {
  private client: AxiosInstance;
  private tenantId: string;

  constructor(baseUrl: string = 'http://localhost:3000', tenantId: string = 'default') {
    this.tenantId = tenantId;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async selectTools(
    query: string,
    options?: {
      maxTools?: number;
      allowedCategories?: string[];
      tokenBudget?: number;
    }
  ): Promise<SelectToolsResponse> {
    const response = await this.client.post<SelectToolsResponse>('/api/v1/tools/select', {
      query,
      context: {
        tenantId: this.tenantId,
        ...options,
      },
    });
    return response.data;
  }

  async invokeTool<T = unknown>(
    toolId: string,
    integration: string,
    parameters: Record<string, unknown>
  ): Promise<InvokeToolResponse> {
    const response = await this.client.post<InvokeToolResponse>('/api/v1/tools/invoke', {
      toolId,
      integration,
      tenantId: this.tenantId,
      parameters,
    });
    return response.data;
  }

  async listCategories(): Promise<string[]> {
    const response = await this.client.get<{ categories: string[] }>('/api/v1/categories');
    return response.data.categories;
  }
}

// Usage in AI Agent
async function aiAgentWorkflow() {
  const client = new ConnectorsClient('http://localhost:3000', 'agent-456');

  // Step 1: User asks a question
  const userQuery = 'What are the open issues in the react repository?';

  // Step 2: Get relevant tools
  const { tools } = await client.selectTools(userQuery, {
    maxTools: 3,
    allowedCategories: ['code'],
  });

  console.log(`Found ${tools.length} relevant tools`);

  // Step 3: Execute tool
  const result = await client.invokeTool<{ issues: Array<any> }>(
    'github.listIssues',
    'github',
    {
      owner: 'facebook',
      repo: 'react',
      state: 'open',
      per_page: 10,
    }
  );

  if (result.success) {
    console.log(`Found ${result.data?.issues.length} open issues`);
    return result.data;
  } else {
    console.error('Error:', result.error?.message);
  }
}

aiAgentWorkflow();
```

---

### Go Example

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type ConnectorsClient struct {
    BaseURL  string
    TenantID string
    Client   *http.Client
}

type SelectToolsRequest struct {
    Query   string                 `json:"query"`
    Context map[string]interface{} `json:"context"`
}

type Tool struct {
    ID          string `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
    Category    string `json:"category"`
}

type ToolSelection struct {
    Tool           Tool    `json:"tool"`
    RelevanceScore float64 `json:"relevanceScore"`
}

type SelectToolsResponse struct {
    Tools       []ToolSelection `json:"tools"`
    TotalTokens int             `json:"totalTokens"`
    LatencyMs   int             `json:"latencyMs"`
}

func NewConnectorsClient(baseURL, tenantID string) *ConnectorsClient {
    return &ConnectorsClient{
        BaseURL:  baseURL,
        TenantID: tenantID,
        Client:   &http.Client{},
    }
}

func (c *ConnectorsClient) SelectTools(query string, maxTools int) (*SelectToolsResponse, error) {
    reqBody := SelectToolsRequest{
        Query: query,
        Context: map[string]interface{}{
            "tenantId": c.TenantID,
            "maxTools": maxTools,
        },
    }

    body, _ := json.Marshal(reqBody)
    req, _ := http.NewRequest("POST", c.BaseURL+"/api/v1/tools/select", bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")

    resp, err := c.Client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result SelectToolsResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}

func main() {
    client := NewConnectorsClient("http://localhost:3000", "user-789")

    // Get tools for query
    tools, err := client.SelectTools("list GitHub repositories", 5)
    if err != nil {
        panic(err)
    }

    fmt.Printf("Found %d tools:\n", len(tools.Tools))
    for _, t := range tools.Tools {
        fmt.Printf("  - %s (score: %.2f)\n", t.Tool.Name, t.RelevanceScore)
    }
}
```

---

### Ruby Example

```ruby
require 'net/http'
require 'json'
require 'uri'

class ConnectorsClient
  def initialize(base_url: 'http://localhost:3000', tenant_id: 'default')
    @base_url = base_url
    @tenant_id = tenant_id
  end

  def select_tools(query, max_tools: 5)
    uri = URI("#{@base_url}/api/v1/tools/select")
    request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
    request.body = {
      query: query,
      context: {
        tenantId: @tenant_id,
        maxTools: max_tools
      }
    }.to_json

    response = Net::HTTP.start(uri.hostname, uri.port) do |http|
      http.request(request)
    end

    JSON.parse(response.body)
  end

  def invoke_tool(tool_id, integration, parameters)
    uri = URI("#{@base_url}/api/v1/tools/invoke")
    request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
    request.body = {
      toolId: tool_id,
      integration: integration,
      tenantId: @tenant_id,
      parameters: parameters
    }.to_json

    response = Net::HTTP.start(uri.hostname, uri.port) do |http|
      http.request(request)
    end

    JSON.parse(response.body)
  end
end

# Usage
client = ConnectorsClient.new(tenant_id: 'user-999')

# Select tools
tools = client.select_tools('deploy to AWS')
puts "Found #{tools['tools'].length} tools"

# Invoke tool
result = client.invoke_tool(
  'aws.deployLambda',
  'aws',
  {
    functionName: 'my-function',
    runtime: 'nodejs18.x',
    code: { zipFile: 'base64...' }
  }
)
puts "Deployment: #{result['success'] ? 'success' : 'failed'}"
```

---

## Framework-Specific Integrations

### React/Next.js (Frontend)

```typescript
// hooks/useConnectors.ts
import { useState, useCallback } from 'react';

interface Tool {
  id: string;
  name: string;
  description: string;
}

export function useConnectors(baseUrl = 'http://localhost:3000') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectTools = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/api/v1/tools/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          context: { tenantId: 'user-id' }
        }),
      });

      const data = await response.json();
      return data.tools;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const invokeTool = useCallback(async (
    toolId: string,
    integration: string,
    parameters: Record<string, unknown>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/api/v1/tools/invoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          integration,
          tenantId: 'user-id',
          parameters,
        }),
      });

      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  return { selectTools, invokeTool, loading, error };
}

// Component usage
function AIAssistant() {
  const { selectTools, invokeTool, loading } = useConnectors();
  const [query, setQuery] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);

  const handleSearch = async () => {
    const result = await selectTools(query);
    setTools(result);
  };

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={handleSearch} disabled={loading}>
        Find Tools
      </button>

      <ul>
        {tools.map(tool => (
          <li key={tool.id}>{tool.name}: {tool.description}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Flask (Python Backend)

```python
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

class ConnectorsService:
    def __init__(self):
        self.base_url = 'http://localhost:3000'

    def select_tools(self, query, tenant_id):
        response = requests.post(
            f'{self.base_url}/api/v1/tools/select',
            json={'query': query, 'context': {'tenantId': tenant_id}}
        )
        return response.json()

    def invoke_tool(self, tool_id, integration, parameters, tenant_id):
        response = requests.post(
            f'{self.base_url}/api/v1/tools/invoke',
            json={
                'toolId': tool_id,
                'integration': integration,
                'tenantId': tenant_id,
                'parameters': parameters
            }
        )
        return response.json()

connectors = ConnectorsService()

@app.route('/api/ai-assist', methods=['POST'])
def ai_assist():
    data = request.json
    user_id = data['userId']
    query = data['query']

    # Get relevant tools
    tools = connectors.select_tools(query, user_id)

    # Execute first tool (or let AI choose)
    if tools['tools']:
        tool = tools['tools'][0]['tool']
        result = connectors.invoke_tool(
            tool['id'],
            tool['integration'],
            data.get('parameters', {}),
            user_id
        )
        return jsonify(result)

    return jsonify({'error': 'No tools found'}), 404

if __name__ == '__main__':
    app.run(port=5000)
```

---

### Express.js (Node.js Backend)

```javascript
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const connectorsClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1'
});

// AI chatbot endpoint
app.post('/api/chat', async (req, res) => {
  const { userId, message } = req.body;

  try {
    // 1. Get relevant tools for user's message
    const { data: toolsData } = await connectorsClient.post('/tools/select', {
      query: message,
      context: { tenantId: userId, maxTools: 3 }
    });

    // 2. Let AI (Claude, GPT, etc.) decide which tool to use
    // (You'd integrate with your LLM here)
    const selectedTool = toolsData.tools[0]?.tool;

    if (!selectedTool) {
      return res.json({ reply: 'I don\'t have tools for that task.' });
    }

    // 3. AI extracts parameters from message (you'd do NLP here)
    const parameters = extractParameters(message, selectedTool);

    // 4. Execute tool
    const { data: result } = await connectorsClient.post('/tools/invoke', {
      toolId: selectedTool.id,
      integration: selectedTool.integration,
      tenantId: userId,
      parameters
    });

    res.json({
      reply: `I used ${selectedTool.name} to help you.`,
      result: result.data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Chat API running on :3001'));
```

---

## Multi-Tenant Configuration

For SaaS applications with multiple users/tenants:

```typescript
// Each tenant has their own OAuth credentials in Vault
class MultiTenantConnectors {
  private client: ConnectorsClient;

  constructor(baseUrl: string) {
    this.client = new ConnectorsClient(baseUrl);
  }

  // Per-tenant tool invocation
  async executeForTenant(
    tenantId: string,
    toolId: string,
    integration: string,
    parameters: Record<string, unknown>
  ) {
    // Gateway automatically:
    // 1. Loads tenant's OAuth credentials from Vault
    // 2. Injects auth tokens
    // 3. Routes to correct integration
    return this.client.invokeTool(toolId, integration, parameters, tenantId);
  }

  // Configure tenant OAuth (one-time setup)
  async configureTenantAuth(
    tenantId: string,
    integration: string,
    oauthCredentials: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
    }
  ) {
    // Store in Vault via gateway
    await fetch('http://localhost:3000/api/v1/tenants/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId,
        integration,
        credentials: oauthCredentials
      })
    });
  }
}

// Usage
const connectors = new MultiTenantConnectors('http://localhost:3000');

// Tenant A uses their GitHub
await connectors.executeForTenant('tenant-a', 'github.createPR', 'github', {...});

// Tenant B uses their GitHub
await connectors.executeForTenant('tenant-b', 'github.createPR', 'github', {...});

// Different OAuth tokens used automatically!
```

---

## Environment Configuration

```bash
# .env file for your application
CONNECTORS_GATEWAY_URL=http://localhost:3000
CONNECTORS_TENANT_ID=your-app-tenant-id

# Optional: If you're running gateway yourself
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=your-vault-token
NEO4J_URI=bolt://localhost:7687
NEO4J_PASSWORD=your-neo4j-password
REDIS_URL=redis://localhost:6379
```

---

## Error Handling

```typescript
try {
  const result = await client.invokeTool('github.createPR', 'github', params);

  if (!result.success) {
    // Handle tool execution error
    switch (result.error?.code) {
      case 'OAUTH_ERROR':
        console.error('Authentication failed - refresh OAuth token');
        break;
      case 'RATE_LIMIT':
        console.error('Rate limit hit - retry later');
        break;
      case 'TOOL_NOT_FOUND':
        console.error('Tool doesn't exist');
        break;
      default:
        console.error('Unknown error:', result.error?.message);
    }
  }
} catch (error) {
  // Handle network/gateway error
  console.error('Gateway unreachable:', error.message);
}
```

---

## Performance Optimization

### Caching Tool Selections

```typescript
class CachedConnectorsClient {
  private cache = new Map<string, ToolSelection[]>();

  async selectTools(query: string) {
    // Check cache first
    if (this.cache.has(query)) {
      return this.cache.get(query)!;
    }

    // Fetch from gateway
    const tools = await this.client.selectTools(query);

    // Cache for 5 minutes
    this.cache.set(query, tools);
    setTimeout(() => this.cache.delete(query), 5 * 60 * 1000);

    return tools;
  }
}
```

### Batch Operations

```typescript
// Execute multiple tools in parallel
async function batchExecute(operations: Array<{
  toolId: string;
  integration: string;
  parameters: Record<string, unknown>;
}>) {
  const results = await Promise.all(
    operations.map(op =>
      client.invokeTool(op.toolId, op.integration, op.parameters)
    )
  );
  return results;
}

// Usage
const results = await batchExecute([
  { toolId: 'github.createPR', integration: 'github', parameters: {...} },
  { toolId: 'slack.sendMessage', integration: 'slack', parameters: {...} },
  { toolId: 'jira.createIssue', integration: 'jira', parameters: {...} }
]);
```

---

## Monitoring & Observability

```typescript
// Track usage metrics
async function trackToolUsage() {
  const metrics = await fetch('http://localhost:3000/api/v1/metrics')
    .then(r => r.json());

  console.log('Tool usage:', {
    totalCalls: metrics.total,
    byIntegration: metrics.byIntegration,
    tokensSaved: metrics.tokenReduction,
    avgLatency: metrics.avgLatencyMs
  });
}

// Health monitoring
async function checkGatewayHealth() {
  const health = await fetch('http://localhost:3000/health')
    .then(r => r.json());

  if (health.status !== 'healthy') {
    // Alert/failover logic
    console.error('Gateway unhealthy!', health);
  }
}
```

---

## Deployment Options

### Option 1: Hosted Gateway (Easiest)
```bash
# Use hosted version (coming soon)
CONNECTORS_GATEWAY_URL=https://api.connectors.cloud
```

### Option 2: Self-Hosted Docker
```bash
# Run gateway with Docker
docker run -d \
  -p 3000:3000 \
  -e VAULT_ADDR=http://vault:8200 \
  -e NEO4J_URI=bolt://neo4j:7687 \
  -e REDIS_URL=redis://redis:6379 \
  connectors/gateway:latest
```

### Option 3: Kubernetes
```bash
# Deploy with helm
helm install connectors ./k8s/helm-chart
```

---

## Summary

**Integration is designed to be trivial:**

1. ✅ **10 minutes** to integrate (any language)
2. ✅ **One REST API** → 500+ integrations
3. ✅ **Standard HTTP/JSON** → works everywhere
4. ✅ **Automatic OAuth** → no credential management
5. ✅ **99% token reduction** → AI agents can use 500 tools
6. ✅ **Production-ready** → monitoring, rate limiting, error handling

**Pick your integration method:**
- **REST API** → Universal (Python, Node, Go, Ruby, etc.)
- **MCP Native** → Claude Desktop, MCP clients
- **Client SDK** → TypeScript/JavaScript (npm package)

**Next Steps:**
1. Start the gateway: `npm run dev`
2. Try example code in your language
3. Configure OAuth for integrations you need
4. Deploy to production

---

**Full Documentation:**
- API Reference: `/docs/API_REFERENCE.md` (coming soon)
- Integration Examples: `/examples/`
- Deployment Guide: `/docs/DEPLOYMENT_ARCHITECTURE.md`

**Need Help?**
- GitHub Issues: https://github.com/your-org/connectors/issues
- Discord: Coming soon

---

**Last Updated:** 2025-11-11
**Version:** 1.0.0
