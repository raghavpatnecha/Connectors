# Migration Guide: From Composio to Connectors

This guide helps you migrate from Composio to Connectors with minimal code changes.

## Why Migrate?

| Feature | Composio | Connectors |
|---------|----------|-----------|
| **Hosting** | SaaS only | Self-hosted (open source) |
| **Token Usage** | 250K tokens | 1-3K tokens (99% reduction) |
| **Tool Selection** | Manual | Semantic (natural language) |
| **Custom Servers** | Limited | Full support (GitHub/Docker/STDIO/HTTP) |
| **Cost** | Subscription required | Free (self-hosted) |
| **Data Privacy** | Cloud-based | Your infrastructure |
| **Integrations** | 150+ | 15 (368 tools) + custom |

## Quick Comparison

### Composio Code

```typescript
import { Composio } from 'composio-core';

const composio = new Composio({ apiKey: 'your-key' });

// Get all tools (250K tokens)
const tools = await composio.getTools({
  apps: ['github', 'gmail', 'slack']
});

// Call tool
const result = await composio.executeAction(
  'GITHUB_CREATE_PULL_REQUEST',
  {
    repo: 'owner/repo',
    title: 'New feature'
  }
);
```

### Connectors Code

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });

// Semantic selection (1-3K tokens)
const tools = await connectors.tools.select('manage GitHub, Gmail, and Slack');

// Call tool
const github = connectors.mcp.get('github');
const result = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'New feature'
});
```

## Step-by-Step Migration

### Step 1: Install Connectors

**Before (Composio):**
```bash
npm install composio-core
```

**After (Connectors):**
```bash
# Install SDK
npm install @connectors/sdk

# Start gateway (Docker)
git clone https://github.com/connectors/platform.git
cd platform
docker compose up -d
```

### Step 2: Update Initialization

**Before (Composio):**
```typescript
import { Composio } from 'composio-core';

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY
});
```

**After (Connectors):**
```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({
  baseURL: process.env.CONNECTORS_BASE_URL || 'http://localhost:3000',
  tenantId: process.env.TENANT_ID, // Optional
  apiKey: process.env.CONNECTORS_API_KEY // Optional
});
```

### Step 3: Update Tool Selection

**Before (Composio - Manual):**
```typescript
const tools = await composio.getTools({
  apps: ['github', 'gmail', 'slack']
});
```

**After (Connectors - Semantic):**
```typescript
const tools = await connectors.tools.select(
  'manage GitHub repositories, send emails, and post Slack messages'
);
```

**Alternative (Explicit):**
```typescript
const githubTools = await connectors.tools.list({ server: 'github' });
const gmailTools = await connectors.tools.list({ server: 'gmail' });
const slackTools = await connectors.tools.list({ server: 'slack' });
```

### Step 4: Update Tool Invocation

**Before (Composio):**
```typescript
const result = await composio.executeAction(
  'GITHUB_CREATE_PULL_REQUEST',
  {
    repo: 'owner/repo',
    title: 'New feature',
    head: 'feature',
    base: 'main'
  }
);
```

**After (Connectors - Option 1: MCP Server):**
```typescript
const github = connectors.mcp.get('github');
const result = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'New feature',
  head: 'feature',
  base: 'main'
});
```

**After (Connectors - Option 2: Tools API):**
```typescript
const result = await connectors.tools.invoke('github.createPullRequest', {
  repo: 'owner/repo',
  title: 'New feature',
  head: 'feature',
  base: 'main'
});
```

### Step 5: Update OpenAI Integration

**Before (Composio):**
```typescript
import { Composio } from 'composio-core';
import { OpenAIToolSet } from 'composio-core/openai';

const composio = new Composio({ apiKey: 'your-key' });
const toolset = new OpenAIToolSet({ apiKey: 'your-key' });

const tools = await toolset.getTools({ apps: ['github'] });

const assistant = await openai.beta.assistants.create({
  name: 'GitHub Agent',
  tools: tools,
  model: 'gpt-4'
});
```

**After (Connectors):**
```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsProvider } from '@connectors/openai-agents';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });

const tools = await ConnectorsProvider.semanticTools(
  connectors,
  'manage GitHub repositories'
);

const assistant = await openai.beta.assistants.create({
  name: 'GitHub Agent',
  tools: tools,
  model: 'gpt-4'
});
```

### Step 6: Update LangChain Integration

**Before (Composio):**
```typescript
import { Composio } from 'composio-core';
import { LangchainToolSet } from 'composio-core/langchain';

const composio = new Composio({ apiKey: 'your-key' });
const toolset = new LangchainToolSet({ apiKey: 'your-key' });

const tools = await toolset.getTools({ apps: ['github'] });

const agent = await initializeAgentExecutorWithOptions(
  tools,
  llm,
  { agentType: 'openai-functions' }
);
```

**After (Connectors):**
```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsToolkit } from '@connectors/langchain';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
const toolkit = new ConnectorsToolkit(connectors);

const tools = await toolkit.getSemanticTools('manage GitHub repositories');

const agent = await initializeAgentExecutorWithOptions(
  tools,
  llm,
  { agentType: 'openai-functions' }
);
```

## Feature Mapping

### Tool Names

**Composio → Connectors**

```
GITHUB_CREATE_PULL_REQUEST → github.createPullRequest
GITHUB_MERGE_PULL_REQUEST → github.mergePullRequest
GMAIL_SEND_EMAIL → gmail.sendEmail
SLACK_POST_MESSAGE → slack.postMessage
GOOGLE_CALENDAR_CREATE_EVENT → google-calendar.createEvent
```

**Naming Convention:**
- Composio: `APP_ACTION_NAME` (uppercase, underscores)
- Connectors: `server.actionName` (lowercase dot notation, camelCase)

### Authentication

**Before (Composio - Cloud OAuth):**
```typescript
const entity = await composio.getEntity('user-123');
await entity.initiateConnection('github');
// User redirected to OAuth flow
```

**After (Connectors - Vault OAuth):**
```typescript
// OAuth managed by gateway + Vault
// Credentials stored per-tenant, auto-refreshed
// No explicit connection setup in SDK
```

**Note:** Connectors uses HashiCorp Vault for OAuth credentials with per-tenant encryption.

### Error Handling

**Before (Composio):**
```typescript
try {
  await composio.executeAction('GITHUB_CREATE_PR', params);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limit
  }
}
```

**After (Connectors):**
```typescript
import { ToolInvocationError, RateLimitError } from '@connectors/sdk';

try {
  await connectors.tools.invoke('github.createPullRequest', params);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Retry after ${error.retryAfter} seconds`);
  } else if (error instanceof ToolInvocationError) {
    console.error('Invocation failed:', error.message);
  }
}
```

## Complete Migration Example

### Before (Composio)

```typescript
import { Composio } from 'composio-core';
import { OpenAIToolSet } from 'composio-core/openai';
import OpenAI from 'openai';

// Initialize
const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
const toolset = new OpenAIToolSet({ apiKey: process.env.COMPOSIO_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Get tools
const tools = await toolset.getTools({
  apps: ['github', 'gmail', 'slack']
});

// Create assistant
const assistant = await openai.beta.assistants.create({
  name: 'DevOps Agent',
  instructions: 'You help with development operations',
  tools: tools,
  model: 'gpt-4'
});

// Execute action
const result = await composio.executeAction(
  'GITHUB_CREATE_PULL_REQUEST',
  {
    repo: 'owner/repo',
    title: 'Automated update',
    head: 'feature',
    base: 'main'
  }
);

console.log('PR created:', result.data.url);
```

### After (Connectors)

```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsProvider } from '@connectors/openai-agents';
import OpenAI from 'openai';

// Initialize
const connectors = new Connectors({
  baseURL: process.env.CONNECTORS_BASE_URL || 'http://localhost:3000'
});
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Get tools (semantic selection)
const tools = await ConnectorsProvider.semanticTools(
  connectors,
  'manage GitHub, send emails, post Slack messages'
);

// Create assistant
const assistant = await openai.beta.assistants.create({
  name: 'DevOps Agent',
  instructions: 'You help with development operations',
  tools: tools,
  model: 'gpt-4'
});

// Execute action
const github = connectors.mcp.get('github');
const result = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'Automated update',
  head: 'feature',
  base: 'main'
});

console.log('PR created:', result.url);
```

## Migration Checklist

- [ ] **Install Connectors**: `npm install @connectors/sdk`
- [ ] **Start Gateway**: `docker compose up -d`
- [ ] **Update imports**: Replace `composio-core` with `@connectors/sdk`
- [ ] **Update initialization**: Replace Composio config with Connectors config
- [ ] **Update tool selection**: Use semantic selection or explicit listing
- [ ] **Update tool names**: Convert UPPERCASE_SNAKE to dot.camelCase
- [ ] **Update tool invocation**: Use `mcp.get()` or `tools.invoke()`
- [ ] **Update error handling**: Use typed errors
- [ ] **Update OpenAI integration**: Use `@connectors/openai-agents`
- [ ] **Update LangChain integration**: Use `@connectors/langchain`
- [ ] **Test thoroughly**: Verify all tool calls work
- [ ] **Deploy gateway**: Production Kubernetes deployment
- [ ] **Configure OAuth**: Set up Vault credentials
- [ ] **Monitor**: Set up logging and metrics

## Common Migration Issues

### Issue 1: Tool Name Not Found

**Error:**
```
ToolNotFoundError: Tool 'GITHUB_CREATE_PULL_REQUEST' not found
```

**Solution:**
```typescript
// Convert Composio name to Connectors name
const tool = await connectors.tools.get('github.createPullRequest');
```

### Issue 2: Authentication Required

**Error:**
```
AuthenticationError: No credentials found for GitHub
```

**Solution:**
- Configure OAuth credentials in Vault
- See [OAuth Setup Guide](../02-guides/oauth/setup.md)

### Issue 3: Gateway Connection Error

**Error:**
```
NetworkError: Connection refused to http://localhost:3000
```

**Solution:**
```bash
# Start gateway
docker compose up -d gateway

# Verify
curl http://localhost:3000/health
```

### Issue 4: Tool Not Available

**Error:**
```
ServerNotFoundError: Server 'slack' not found
```

**Solution:**
- Check available servers: `await connectors.mcp.list()`
- Deploy missing server: See [Adding Integrations](../02-guides/adding-integrations/)

## Benefits After Migration

### 1. Token Reduction

**Before:** 250,000 tokens per request (all tools loaded)
**After:** 1,000-3,000 tokens per request (semantic selection)

**Savings:** 99% token reduction = Lower costs + Faster responses

### 2. Self-Hosted

**Before:** Cloud-dependent (Composio SaaS)
**After:** Self-hosted (your infrastructure)

**Benefits:** Data privacy, no external dependencies, no subscription fees

### 3. Custom Servers

**Before:** Limited to Composio integrations
**After:** Deploy custom MCP servers from GitHub/Docker/STDIO/HTTP

**Benefits:** Extend with proprietary tools, integrate internal APIs

### 4. Semantic Selection

**Before:** Manually specify apps
**After:** Natural language queries

**Benefits:** Easier to use, more flexible, better tool selection

## Next Steps

- **[Installation](../01-getting-started/installation.md)** - Set up Connectors
- **[SDK Documentation](../sdk/)** - Learn the SDK
- **[Deployment](../deployment/)** - Deploy to production
- **[OAuth Setup](../02-guides/oauth/setup.md)** - Configure authentication

## Support

Need help migrating?

- **GitHub Issues**: [github.com/connectors/platform/issues](https://github.com/connectors/platform/issues)
- **Discord**: [discord.gg/connectors](https://discord.gg/connectors)
- **Email**: support@connectors.dev

---

**[← Back to Guides](./)**
