# SDK Examples

Common usage patterns and examples for the Connectors SDK in TypeScript and Python.

## Quick Start Examples

### TypeScript

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  tenantId: 'my-company'
});

// Select tools semantically
const tools = await connectors.tools.select('create a GitHub pull request');

// Use selected tool
const github = connectors.mcp.get('github');
const pr = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'New feature',
  head: 'feature',
  base: 'main',
  body: 'This PR adds...'
});

console.log(`PR created: ${pr.url}`);
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

# Use selected tool
github = connectors.mcp.get("github")
pr = await github.call("createPullRequest", {
    "repo": "owner/repo",
    "title": "New feature",
    "head": "feature",
    "base": "main",
    "body": "This PR adds..."
})

print(f"PR created: {pr['url']}")
```

## Semantic Tool Selection

### Multi-Action Queries

**TypeScript:**
```typescript
const tools = await connectors.tools.select(
  'create a PR on GitHub and notify the team on Slack',
  { maxTools: 10 }
);

// Returns: github.createPullRequest, github.requestReviewers, slack.postMessage, etc.
tools.forEach(selection => {
  console.log(`${selection.tool.name} (score: ${selection.score})`);
  console.log(`Reason: ${selection.reason}`);
});
```

**Python:**
```python
tools = await connectors.tools.select(
    "create a PR on GitHub and notify the team on Slack",
    max_tools=10
)

for selection in tools:
    print(f"{selection['tool']['name']} (score: {selection['score']})")
    print(f"Reason: {selection['reason']}")
```

### Category Filtering

**TypeScript:**
```typescript
const codeTools = await connectors.tools.select(
  'manage repositories',
  { category: 'code', maxTools: 5 }
);

const commTools = await connectors.tools.select(
  'send notifications',
  { category: 'communication', maxTools: 3 }
);
```

**Python:**
```python
code_tools = await connectors.tools.select(
    "manage repositories",
    category="code",
    max_tools=5
)

comm_tools = await connectors.tools.select(
    "send notifications",
    category="communication",
    max_tools=3
)
```

### Token Budget Management

**TypeScript:**
```typescript
const tools = await connectors.tools.select(
  'complex workflow query',
  { tokenBudget: 2000, maxTools: 10 }
);

const totalTokens = tools.reduce((sum, t) => sum + t.tool.tokenCost, 0);
console.log(`Token cost: ${totalTokens} / 2000`);
```

**Python:**
```python
tools = await connectors.tools.select(
    "complex workflow query",
    token_budget=2000,
    max_tools=10
)

total_tokens = sum(t["tool"]["token_cost"] for t in tools)
print(f"Token cost: {total_tokens} / 2000")
```

## Workflow Automation

### Sequential Workflow

**TypeScript:**
```typescript
async function createAndMergePR() {
  // Create PR
  const github = connectors.mcp.get('github');
  const pr = await github.call('createPullRequest', {
    repo: 'owner/repo',
    title: 'Automated update',
    head: 'feature',
    base: 'main'
  });

  console.log(`PR #${pr.number} created`);

  // Request reviews
  await github.call('requestReviewers', {
    repo: 'owner/repo',
    pull_number: pr.number,
    reviewers: ['reviewer1', 'reviewer2']
  });

  // Wait for approval (simulate)
  await new Promise(resolve => setTimeout(resolve, 60000));

  // Merge PR
  await github.call('mergePullRequest', {
    repo: 'owner/repo',
    pull_number: pr.number,
    merge_method: 'squash'
  });

  console.log(`PR #${pr.number} merged`);
}
```

**Python:**
```python
async def create_and_merge_pr():
    # Create PR
    github = connectors.mcp.get("github")
    pr = await github.call("createPullRequest", {
        "repo": "owner/repo",
        "title": "Automated update",
        "head": "feature",
        "base": "main"
    })

    print(f"PR #{pr['number']} created")

    # Request reviews
    await github.call("requestReviewers", {
        "repo": "owner/repo",
        "pull_number": pr["number"],
        "reviewers": ["reviewer1", "reviewer2"]
    })

    # Wait for approval (simulate)
    await asyncio.sleep(60)

    # Merge PR
    await github.call("mergePullRequest", {
        "repo": "owner/repo",
        "pull_number": pr["number"],
        "merge_method": "squash"
    })

    print(f"PR #{pr['number']} merged")
```

### Parallel Execution

**TypeScript:**
```typescript
async function notifyMultipleChannels(message: string) {
  const slack = connectors.mcp.get('slack');
  const gmail = connectors.mcp.get('gmail');

  // Execute in parallel
  const results = await Promise.all([
    slack.call('postMessage', { channel: '#general', text: message }),
    slack.call('postMessage', { channel: '#engineering', text: message }),
    gmail.call('sendEmail', {
      to: 'team@company.com',
      subject: 'Update',
      body: message
    })
  ]);

  console.log(`Sent ${results.length} notifications`);
}
```

**Python:**
```python
async def notify_multiple_channels(message: str):
    slack = connectors.mcp.get("slack")
    gmail = connectors.mcp.get("gmail")

    # Execute in parallel
    results = await asyncio.gather(
        slack.call("postMessage", {"channel": "#general", "text": message}),
        slack.call("postMessage", {"channel": "#engineering", "text": message}),
        gmail.call("sendEmail", {
            "to": "team@company.com",
            "subject": "Update",
            "body": message
        })
    )

    print(f"Sent {len(results)} notifications")
```

## Custom MCP Deployment

### Deploy from GitHub

**TypeScript:**
```typescript
async function deployCustomMCP() {
  const deployment = await connectors.mcp.add({
    name: 'my-custom-server',
    source: {
      type: 'github',
      url: 'https://github.com/company/custom-mcp',
      branch: 'main'
    },
    category: 'productivity',
    description: 'Custom productivity tools',
    env: {
      API_KEY: process.env.CUSTOM_API_KEY
    }
  });

  console.log('Deploying...');

  await deployment.waitUntilReady({
    timeout: 300000,
    onProgress: (status) => {
      console.log(`[${status.progress}%] ${status.message}`);
    }
  });

  console.log('Deployment complete!');

  // Use the new server
  const customServer = connectors.mcp.get('my-custom-server');
  const result = await customServer.call('customTool', { param: 'value' });
}
```

**Python:**
```python
async def deploy_custom_mcp():
    deployment = await connectors.mcp.add(
        name="my-custom-server",
        source={
            "type": "github",
            "url": "https://github.com/company/custom-mcp",
            "branch": "main"
        },
        category="productivity",
        description="Custom productivity tools",
        env={
            "API_KEY": os.environ.get("CUSTOM_API_KEY")
        }
    )

    print("Deploying...")

    async def on_progress(status):
        print(f"[{status['progress']}%] {status['message']}")

    await deployment.wait_until_ready(
        timeout=300000,
        on_progress=on_progress
    )

    print("Deployment complete!")

    # Use the new server
    custom_server = connectors.mcp.get("my-custom-server")
    result = await custom_server.call("customTool", {"param": "value"})
```

### Deploy from Docker

**TypeScript:**
```typescript
const deployment = await connectors.mcp.add({
  name: 'docker-mcp',
  source: {
    type: 'docker',
    image: 'company/mcp-server',
    tag: 'v1.2.3',
    registry: 'registry.company.com'
  },
  category: 'data',
  resources: {
    cpu: '500m',
    memory: '512Mi'
  }
});

await deployment.waitUntilReady();
```

**Python:**
```python
deployment = await connectors.mcp.add(
    name="docker-mcp",
    source={
        "type": "docker",
        "image": "company/mcp-server",
        "tag": "v1.2.3",
        "registry": "registry.company.com"
    },
    category="data",
    resources={
        "cpu": "500m",
        "memory": "512Mi"
    }
)

await deployment.wait_until_ready()
```

## Error Handling

### Retry with Exponential Backoff

**TypeScript:**
```typescript
async function selectToolsWithRetry(query: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await connectors.tools.select(query);
    } catch (error) {
      if (error instanceof NetworkError && attempt < maxRetries) {
        const delay = Math.min(1000 * 2 ** attempt, 10000);
        console.warn(`Retry attempt ${attempt} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

**Python:**
```python
async def select_tools_with_retry(query: str, max_retries: int = 3):
    for attempt in range(1, max_retries + 1):
        try:
            return await connectors.tools.select(query)
        except NetworkError as e:
            if attempt < max_retries:
                delay = min(1000 * 2 ** attempt, 10000) / 1000
                print(f"Retry attempt {attempt} after {delay}s")
                await asyncio.sleep(delay)
            else:
                raise
```

### Graceful Degradation

**TypeScript:**
```typescript
async function getToolsWithFallback(query: string) {
  try {
    const selections = await connectors.tools.select(query);
    return selections.map(s => s.tool);
  } catch (error) {
    if (error instanceof ToolSelectionError) {
      console.warn('Semantic selection failed, using default tools');
      return await connectors.tools.list({ category: 'code', limit: 5 });
    }
    throw error;
  }
}
```

**Python:**
```python
async def get_tools_with_fallback(query: str):
    try:
        selections = await connectors.tools.select(query)
        return [s["tool"] for s in selections]
    except ToolSelectionError as e:
        print("Semantic selection failed, using default tools")
        return await connectors.tools.list(category="code", limit=5)
```

## AI Agent Integration

### OpenAI Function Calling

**TypeScript:**
```typescript
import { Configuration, OpenAIApi } from 'openai';

async function createOpenAIAgent() {
  const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

  // Select tools for the agent
  const selections = await connectors.tools.select('manage GitHub repositories');

  // Convert to OpenAI function format
  const functions = selections.map(s => ({
    name: s.tool.id.replace('.', '_'),
    description: s.tool.description,
    parameters: {
      type: 'object',
      properties: Object.fromEntries(
        s.tool.parameters.map(p => [p.name, { type: p.type, description: p.description }])
      ),
      required: s.tool.parameters.filter(p => p.required).map(p => p.name)
    }
  }));

  // Create chat completion
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Create a PR for the bug fix' }],
    functions,
    function_call: 'auto'
  });

  // Execute function if called
  const message = response.data.choices[0].message;
  if (message.function_call) {
    const toolId = message.function_call.name.replace('_', '.');
    const args = JSON.parse(message.function_call.arguments);

    const result = await connectors.tools.invoke(toolId, args);
    console.log('Tool result:', result);
  }
}
```

### LangChain Agent

**Python:**
```python
from langchain.agents import initialize_agent, AgentType
from langchain.chat_models import ChatOpenAI
from langchain.tools import Tool

async def create_langchain_agent():
    # Select tools
    selections = await connectors.tools.select("manage GitHub repositories")

    # Convert to LangChain tools
    tools = []
    for selection in selections:
        tool = selection["tool"]

        async def tool_func(params: str, tool_id=tool["id"]):
            import json
            params_dict = json.loads(params)
            result = await connectors.tools.invoke(tool_id, params_dict)
            return result["data"]

        tools.append(Tool(
            name=tool["id"].replace(".", "_"),
            func=tool_func,
            description=tool["description"]
        ))

    # Create agent
    llm = ChatOpenAI(model="gpt-4")
    agent = initialize_agent(
        tools,
        llm,
        agent=AgentType.OPENAI_FUNCTIONS,
        verbose=True
    )

    # Run agent
    result = await agent.arun("Create a PR for the bug fix")
    print(result)
```

## Multi-Tenant Applications

**TypeScript:**
```typescript
function getConnectorsForTenant(tenantId: string, apiKey: string): Connectors {
  return new Connectors({
    baseURL: 'https://api.connectors.com',
    tenantId,
    apiKey,
    timeout: 60000
  });
}

// API endpoint
app.post('/api/tools/select', async (req, res) => {
  const { tenantId, apiKey } = req.user;
  const { query } = req.body;

  const connectors = getConnectorsForTenant(tenantId, apiKey);
  const tools = await connectors.tools.select(query);

  res.json({ tools });
});
```

**Python:**
```python
def get_connectors_for_tenant(tenant_id: str, api_key: str) -> Connectors:
    return Connectors(
        base_url="https://api.connectors.com",
        tenant_id=tenant_id,
        api_key=api_key,
        timeout=60
    )

# FastAPI endpoint
@app.post("/api/tools/select")
async def select_tools(request: Request):
    user = request.state.user
    body = await request.json()

    connectors = get_connectors_for_tenant(user.tenant_id, user.api_key)
    tools = await connectors.tools.select(body["query"])

    return {"tools": tools}
```

## Monitoring and Metrics

**TypeScript:**
```typescript
async function monitorSDKMetrics() {
  const metrics = await connectors.getMetrics();

  console.log('Gateway Metrics:');
  console.log(`- Total requests: ${metrics.requests.total}`);
  console.log(`- Success rate: ${(metrics.requests.success / metrics.requests.total * 100).toFixed(2)}%`);
  console.log(`- P95 latency: ${metrics.latency.p95}ms`);
  console.log(`- Avg tokens per query: ${metrics.toolSelection.avgTokens}`);
  console.log(`- Cache hit rate: ${(metrics.cache.hitRate * 100).toFixed(2)}%`);
}

// Run every 5 minutes
setInterval(monitorSDKMetrics, 300000);
```

**Python:**
```python
async def monitor_sdk_metrics():
    metrics = await connectors.get_metrics()

    print("Gateway Metrics:")
    print(f"- Total requests: {metrics['requests']['total']}")
    print(f"- Success rate: {metrics['requests']['success'] / metrics['requests']['total'] * 100:.2f}%")
    print(f"- P95 latency: {metrics['latency']['p95']}ms")
    print(f"- Avg tokens per query: {metrics['toolSelection']['avgTokens']}")
    print(f"- Cache hit rate: {metrics['cache']['hitRate'] * 100:.2f}%")

# Run every 5 minutes
import asyncio
while True:
    await monitor_sdk_metrics()
    await asyncio.sleep(300)
```

## Next Steps

- **[TypeScript SDK](typescript/)** - Complete TypeScript documentation
- **[Python SDK](python/)** - Complete Python documentation
- **[Integrations](../integrations/)** - Framework integrations
- **[Deployment](../deployment/)** - Deploy custom servers

---

**[← Back to SDK Documentation](./)**
