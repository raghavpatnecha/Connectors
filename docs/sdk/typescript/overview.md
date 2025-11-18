# TypeScript SDK - Overview

The Connectors TypeScript SDK provides a simple, type-safe interface for AI agents to interact with the Connectors platform.

## Architecture

```
┌─────────────────────────────────────┐
│         Connectors Client           │
│  (Main entry point)                 │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌─────────────┐
│ Tools  │   │ MCP Registry│
│  API   │   │             │
└────────┘   └─────────────┘
    │              │
    │              │
    ▼              ▼
┌─────────────────────────────────────┐
│        Gateway REST API             │
│  (Semantic routing + GraphRAG)      │
└─────────────────────────────────────┘
```

## Core Concepts

### Connectors Client

The main entry point for all SDK operations. Manages configuration, authentication, and provides access to Tools API and MCP Registry.

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  tenantId: 'my-company',
  apiKey: 'your-api-key' // Optional
});
```

### Tools API

Provides semantic tool selection and invocation:

- **`tools.select(query, options)`** - Select tools using natural language
- **`tools.list(filters)`** - List all available tools
- **`tools.invoke(toolId, params)`** - Invoke a specific tool

```typescript
// Semantic selection
const tools = await connectors.tools.select(
  'create a GitHub pull request',
  { maxTools: 5, category: 'code' }
);

// List all tools
const allTools = await connectors.tools.list({ category: 'code' });

// Invoke tool
const result = await connectors.tools.invoke('github.createPullRequest', {
  repo: 'owner/repo',
  title: 'New feature',
  head: 'feature',
  base: 'main'
});
```

### MCP Registry

Manages MCP server deployments:

- **`mcp.get(name)`** - Get bound server instance
- **`mcp.list()`** - List all registered servers
- **`mcp.add(config)`** - Deploy custom MCP server
- **`mcp.remove(name)`** - Remove deployed server

```typescript
// Get server instance
const github = connectors.mcp.get('github');
const pr = await github.call('createPullRequest', { ... });

// Deploy custom server
const deployment = await connectors.mcp.add({
  name: 'my-server',
  source: { type: 'github', url: 'https://github.com/user/mcp-server' },
  category: 'custom'
});
```

## Type Definitions

### Tool

```typescript
interface Tool {
  id: string;              // e.g., 'github.createPullRequest'
  name: string;            // Human-readable name
  description: string;     // What the tool does
  category: string;        // e.g., 'code', 'communication'
  server: string;          // MCP server name
  parameters: ToolParameter[];
  tokenCost: number;       // Estimated token usage
}
```

### ToolParameter

```typescript
interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}
```

### ToolSelection

```typescript
interface ToolSelection {
  tool: Tool;
  score: number;           // Relevance score (0-1)
  reason: string;          // Why this tool was selected
  relatedTools: Tool[];    // Suggested related tools from GraphRAG
}
```

### MCPServer

```typescript
interface MCPServer {
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'error';
  toolCount: number;
  url: string;
}
```

### MCPDeployment

```typescript
interface MCPDeployment {
  id: string;
  name: string;
  status: 'pending' | 'building' | 'deploying' | 'ready' | 'failed';
  source: DeploymentSource;
  createdAt: Date;

  // Methods
  waitUntilReady(options?: WaitOptions): Promise<void>;
  getStatus(): Promise<DeploymentStatus>;
  getLogs(): Promise<string[]>;
}
```

## Error Handling

The SDK throws typed errors for different failure scenarios:

```typescript
import {
  ConnectorsError,
  ToolSelectionError,
  ToolInvocationError,
  DeploymentError,
  AuthenticationError
} from '@connectors/sdk';

try {
  const tools = await connectors.tools.select('invalid query');
} catch (error) {
  if (error instanceof ToolSelectionError) {
    console.error('Tool selection failed:', error.message);
    console.error('Query:', error.query);
    console.error('Available categories:', error.availableCategories);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  }
}
```

[Learn more about error handling →](error-handling.md)

## Configuration Options

### Connectors Constructor

```typescript
interface ConnectorsConfig {
  baseURL: string;              // Gateway URL (required)
  tenantId?: string;            // Multi-tenant identifier
  apiKey?: string;              // API authentication key
  timeout?: number;             // Request timeout (ms)
  retries?: number;             // Number of retries on failure
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

### Tool Selection Options

```typescript
interface ToolSelectOptions {
  maxTools?: number;            // Max tools to return (default: 5)
  category?: string;            // Filter by category
  excludeServers?: string[];    // Exclude specific servers
  tokenBudget?: number;         // Max token cost
  includeRelated?: boolean;     // Include GraphRAG suggestions (default: true)
}
```

### Tool List Options

```typescript
interface ToolListOptions {
  category?: string;            // Filter by category
  server?: string;              // Filter by server
  search?: string;              // Full-text search
  limit?: number;               // Max results
  offset?: number;              // Pagination offset
}
```

## Best Practices

### 1. Reuse Client Instances

Create one client instance and reuse it:

```typescript
// ✅ Good: Single instance
const connectors = new Connectors({ baseURL: '...' });

async function task1() {
  const tools = await connectors.tools.select('...');
}

async function task2() {
  const tools = await connectors.tools.select('...');
}

// ❌ Bad: Multiple instances
async function task1() {
  const connectors = new Connectors({ baseURL: '...' });
  const tools = await connectors.tools.select('...');
}
```

### 2. Use Semantic Selection

Prefer semantic selection over manual tool lookup:

```typescript
// ✅ Good: Semantic selection
const tools = await connectors.tools.select('create a GitHub pull request');

// ❌ Bad: Manual lookup
const allTools = await connectors.tools.list();
const githubTools = allTools.filter(t => t.server === 'github');
const createPRTool = githubTools.find(t => t.name.includes('createPull'));
```

### 3. Handle Errors Gracefully

Always catch and handle SDK errors:

```typescript
try {
  const result = await connectors.tools.invoke('github.createPullRequest', params);
  console.log('PR created:', result.url);
} catch (error) {
  if (error instanceof ToolInvocationError) {
    console.error('Tool invocation failed:', error.message);
    console.error('Tool:', error.toolId);
    console.error('Params:', error.params);
    // Fallback logic
  } else {
    throw error; // Re-throw unexpected errors
  }
}
```

### 4. Use Type Safety

Take advantage of TypeScript types:

```typescript
import type { Tool, ToolSelection } from '@connectors/sdk';

async function selectTools(query: string): Promise<ToolSelection[]> {
  const selections = await connectors.tools.select(query);

  // TypeScript knows the shape of selections
  selections.forEach(selection => {
    console.log(`Tool: ${selection.tool.name}, Score: ${selection.score}`);
  });

  return selections;
}
```

### 5. Monitor Token Usage

Track token consumption to optimize costs:

```typescript
const tools = await connectors.tools.select('query', { maxTools: 5 });

const totalTokens = tools.reduce((sum, t) => sum + t.tool.tokenCost, 0);
console.log(`Total token cost: ${totalTokens}`);

// Stay within budget
if (totalTokens > 2000) {
  console.warn('Token budget exceeded, reducing tool count');
  tools = tools.slice(0, 3);
}
```

## Next Steps

- **[Connectors Client API](connectors-client.md)** - Detailed client API reference
- **[Tools API](tools-api.md)** - Complete Tools API documentation
- **[MCP Registry](mcp-registry.md)** - Deploy and manage MCP servers
- **[Error Handling](error-handling.md)** - Error types and recovery strategies
- **[Examples](../examples.md)** - Common usage patterns

## Installation

```bash
npm install @connectors/sdk
# or
yarn add @connectors/sdk
# or
pnpm add @connectors/sdk
```

## Requirements

- Node.js 18+
- TypeScript 5.0+
- Gateway running at baseURL

---

**[← Back to SDK Documentation](../)**
