# TypeScript SDK - Tools API

The Tools API provides semantic tool selection and invocation using natural language queries.

## Overview

The Tools API is accessed via the `tools` property of the Connectors client:

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });

// Semantic tool selection
const tools = await connectors.tools.select('create a GitHub pull request');

// List all tools
const allTools = await connectors.tools.list({ category: 'code' });

// Invoke a tool
const result = await connectors.tools.invoke('github.createPullRequest', {
  repo: 'owner/repo',
  title: 'New feature'
});
```

## Methods

### `select(query: string, options?: ToolSelectOptions): Promise<ToolSelection[]>`

Selects the most relevant tools using semantic search and GraphRAG.

#### Parameters

```typescript
interface ToolSelectOptions {
  maxTools?: number;            // Max tools to return (default: 5)
  category?: string;            // Filter by category
  excludeServers?: string[];    // Exclude specific servers
  tokenBudget?: number;         // Max token cost
  includeRelated?: boolean;     // Include GraphRAG suggestions (default: true)
  threshold?: number;           // Minimum relevance score 0-1 (default: 0.7)
}
```

#### Returns

```typescript
interface ToolSelection {
  tool: Tool;                   // Selected tool
  score: number;                // Relevance score (0-1)
  reason: string;               // Why this tool was selected
  relatedTools: Tool[];         // GraphRAG suggestions
}
```

#### Examples

**Basic usage:**
```typescript
const selections = await connectors.tools.select('create a pull request on GitHub');

selections.forEach(selection => {
  console.log(`Tool: ${selection.tool.name}`);
  console.log(`Score: ${selection.score}`);
  console.log(`Reason: ${selection.reason}`);
});
```

**With options:**
```typescript
const selections = await connectors.tools.select(
  'I need to manage GitHub repositories and notify team',
  {
    maxTools: 10,
    category: 'code',
    tokenBudget: 3000,
    includeRelated: true
  }
);
```

**Multi-step workflow:**
```typescript
const githubTools = await connectors.tools.select(
  'create PR and add reviewers',
  { maxTools: 5, category: 'code' }
);

const communicationTools = await connectors.tools.select(
  'notify team on Slack',
  { maxTools: 3, category: 'communication' }
);
```

**Excluding servers:**
```typescript
const tools = await connectors.tools.select(
  'manage documents',
  {
    excludeServers: ['google-docs'], // Use other document tools
    maxTools: 5
  }
);
```

### `list(options?: ToolListOptions): Promise<Tool[]>`

Lists available tools with optional filtering.

#### Parameters

```typescript
interface ToolListOptions {
  category?: string;            // Filter by category
  server?: string;              // Filter by server
  search?: string;              // Full-text search in name/description
  limit?: number;               // Max results (default: 100)
  offset?: number;              // Pagination offset (default: 0)
}
```

#### Returns

```typescript
interface Tool {
  id: string;                   // e.g., 'github.createPullRequest'
  name: string;                 // Human-readable name
  description: string;          // What the tool does
  category: string;             // e.g., 'code', 'communication'
  server: string;               // MCP server name
  parameters: ToolParameter[];
  tokenCost: number;            // Estimated token usage
}
```

#### Examples

**List all tools:**
```typescript
const allTools = await connectors.tools.list();
console.log(`Total tools: ${allTools.length}`);
```

**Filter by category:**
```typescript
const codeTools = await connectors.tools.list({ category: 'code' });
const commTools = await connectors.tools.list({ category: 'communication' });
```

**Filter by server:**
```typescript
const githubTools = await connectors.tools.list({ server: 'github' });
console.log(`GitHub has ${githubTools.length} tools`);
```

**Search tools:**
```typescript
const prTools = await connectors.tools.list({
  search: 'pull request',
  category: 'code'
});
```

**Pagination:**
```typescript
const page1 = await connectors.tools.list({ limit: 50, offset: 0 });
const page2 = await connectors.tools.list({ limit: 50, offset: 50 });
```

### `invoke(toolId: string, params: Record<string, any>, options?: InvokeOptions): Promise<ToolResult>`

Invokes a specific tool with parameters.

#### Parameters

```typescript
interface InvokeOptions {
  autoFill?: boolean;           // Auto-fill optional parameters (default: false)
  timeout?: number;             // Override default timeout
  dryRun?: boolean;             // Validate parameters only (default: false)
}
```

#### Returns

```typescript
interface ToolResult {
  success: boolean;
  data?: any;                   // Tool response data
  error?: string;               // Error message if failed
  executionTime: number;        // Execution time in ms
  tokenCost: number;            // Actual token cost
}
```

#### Examples

**Basic invocation:**
```typescript
const result = await connectors.tools.invoke('github.createPullRequest', {
  repo: 'owner/repo',
  title: 'Add new feature',
  head: 'feature-branch',
  base: 'main',
  body: 'This PR adds...'
});

if (result.success) {
  console.log('PR created:', result.data.url);
  console.log('PR number:', result.data.number);
} else {
  console.error('Failed:', result.error);
}
```

**With auto-fill:**
```typescript
const result = await connectors.tools.invoke(
  'github.createPullRequest',
  {
    repo: 'owner/repo',
    title: 'Add feature',
    head: 'feature',
    base: 'main'
    // body is optional and will be auto-filled
  },
  { autoFill: true }
);
```

**Dry run (validation only):**
```typescript
const result = await connectors.tools.invoke(
  'github.createPullRequest',
  { repo: 'owner/repo', title: 'Test' },
  { dryRun: true }
);

if (result.success) {
  console.log('Parameters are valid');
} else {
  console.error('Invalid parameters:', result.error);
}
```

**With timeout:**
```typescript
const result = await connectors.tools.invoke(
  'github.getRepositoryContents',
  { repo: 'large-repo', path: '/' },
  { timeout: 60000 } // 60 seconds
);
```

### `get(toolId: string): Promise<Tool>`

Gets details for a specific tool.

#### Parameters

- `toolId: string` - Tool identifier (e.g., 'github.createPullRequest')

#### Returns

- `Promise<Tool>` - Tool details

#### Examples

```typescript
const tool = await connectors.tools.get('github.createPullRequest');

console.log(`Name: ${tool.name}`);
console.log(`Description: ${tool.description}`);
console.log(`Parameters: ${tool.parameters.length}`);
console.log(`Token cost: ${tool.tokenCost}`);

// Inspect parameters
tool.parameters.forEach(param => {
  console.log(`- ${param.name}: ${param.type} (${param.required ? 'required' : 'optional'})`);
  console.log(`  ${param.description}`);
});
```

### `getCategories(): Promise<CategoryInfo[]>`

Lists all available tool categories.

#### Returns

```typescript
interface CategoryInfo {
  name: string;                 // Category name
  description: string;          // Category description
  toolCount: number;            // Number of tools
  servers: string[];            // Servers in this category
}
```

#### Examples

```typescript
const categories = await connectors.tools.getCategories();

categories.forEach(category => {
  console.log(`${category.name}: ${category.toolCount} tools`);
  console.log(`  Servers: ${category.servers.join(', ')}`);
});
```

## Type Definitions

### Tool

```typescript
interface Tool {
  id: string;                   // Unique identifier
  name: string;                 // Human-readable name
  description: string;          // Detailed description
  category: string;             // Category (code, communication, etc.)
  server: string;               // MCP server name
  parameters: ToolParameter[];  // Input parameters
  tokenCost: number;            // Estimated token usage
  examples?: ToolExample[];     // Usage examples
}
```

### ToolParameter

```typescript
interface ToolParameter {
  name: string;                 // Parameter name
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;          // What this parameter does
  required: boolean;            // Is this parameter required?
  default?: any;                // Default value if optional
  schema?: JSONSchema;          // JSON schema for complex types
}
```

### ToolExample

```typescript
interface ToolExample {
  description: string;          // What this example demonstrates
  parameters: Record<string, any>;
  expectedResult?: any;
}
```

### ToolSelection

```typescript
interface ToolSelection {
  tool: Tool;                   // The selected tool
  score: number;                // Relevance score (0-1)
  reason: string;               // Explanation of selection
  relatedTools: Tool[];         // Suggested related tools from GraphRAG
}
```

## Semantic Selection Deep Dive

### How It Works

The semantic selection process uses a two-level retrieval system:

1. **Category Selection** (Coarse-grained)
   - Query embedding via FAISS
   - Find top 3 relevant categories
   - Score threshold: 0.7

2. **Tool Selection** (Fine-grained)
   - Search within selected categories
   - Find top N relevant tools
   - Score threshold: 0.7

3. **GraphRAG Enhancement**
   - Discover related tools via Neo4j
   - Include tools often used together
   - Add tools with dependencies

4. **Token Optimization**
   - Respect token budget
   - Progressive schema loading
   - Minimal tool representations

### Query Examples

**Single action:**
```typescript
await connectors.tools.select('create a GitHub pull request');
// Returns: github.createPullRequest, github.updatePullRequest
```

**Multi-action:**
```typescript
await connectors.tools.select('create PR and notify team on Slack');
// Returns: github.createPullRequest, slack.postMessage, slack.sendDirectMessage
```

**Complex workflow:**
```typescript
await connectors.tools.select(
  'search code, create issue, assign to user, and add to project board'
);
// Returns: github.searchCode, github.createIssue, github.addAssignees, github.addProjectCard
```

**Implicit requirements:**
```typescript
await connectors.tools.select('merge pull request');
// Returns: github.mergePullRequest, github.checkPullRequestStatus (related)
```

### Score Interpretation

- **0.9-1.0**: Exact match - Tool directly implements the query
- **0.8-0.9**: Strong match - Tool is highly relevant
- **0.7-0.8**: Good match - Tool is relevant but may need clarification
- **< 0.7**: Weak match - Tool is loosely related (filtered out by default)

### Token Budget Management

```typescript
// No budget constraint (default)
const tools = await connectors.tools.select('query');

// Strict budget
const tools = await connectors.tools.select('query', { tokenBudget: 1000 });

// Check actual cost
const totalCost = tools.reduce((sum, t) => sum + t.tool.tokenCost, 0);
console.log(`Token cost: ${totalCost}`);
```

## Error Handling

```typescript
import {
  ToolSelectionError,
  ToolInvocationError,
  ToolNotFoundError
} from '@connectors/sdk';

// Tool selection errors
try {
  const tools = await connectors.tools.select('invalid query');
} catch (error) {
  if (error instanceof ToolSelectionError) {
    console.error('Selection failed:', error.message);
    console.error('Query:', error.query);
    console.error('Available categories:', error.availableCategories);
  }
}

// Tool invocation errors
try {
  const result = await connectors.tools.invoke('github.createPR', { ... });
} catch (error) {
  if (error instanceof ToolInvocationError) {
    console.error('Invocation failed:', error.message);
    console.error('Tool:', error.toolId);
    console.error('Parameters:', error.params);
    console.error('Validation errors:', error.validationErrors);
  }
}

// Tool not found
try {
  const tool = await connectors.tools.get('nonexistent.tool');
} catch (error) {
  if (error instanceof ToolNotFoundError) {
    console.error('Tool not found:', error.toolId);
    console.error('Did you mean:', error.suggestions);
  }
}
```

## Best Practices

### 1. Use Specific Queries

```typescript
// ✅ Good: Specific query
const tools = await connectors.tools.select('create a pull request on GitHub');

// ❌ Bad: Vague query
const tools = await connectors.tools.select('do something with code');
```

### 2. Set Appropriate Token Budgets

```typescript
// For LLMs with large context (Claude, GPT-4)
const tools = await connectors.tools.select('query', { tokenBudget: 5000 });

// For LLMs with smaller context (GPT-3.5)
const tools = await connectors.tools.select('query', { tokenBudget: 2000 });
```

### 3. Validate Before Invoking

```typescript
// Dry run to validate parameters
const validation = await connectors.tools.invoke(
  'github.createPullRequest',
  params,
  { dryRun: true }
);

if (validation.success) {
  // Parameters valid, proceed with actual invocation
  const result = await connectors.tools.invoke('github.createPullRequest', params);
}
```

### 4. Handle Related Tools

```typescript
const selections = await connectors.tools.select('merge PR');

selections.forEach(selection => {
  console.log(`Primary tool: ${selection.tool.name}`);

  if (selection.relatedTools.length > 0) {
    console.log('Consider also using:');
    selection.relatedTools.forEach(related => {
      console.log(`  - ${related.name}: ${related.description}`);
    });
  }
});
```

### 5. Cache Tool Listings

```typescript
// Cache category listings
let toolCache: Map<string, Tool[]> = new Map();

async function getToolsByCategory(category: string): Promise<Tool[]> {
  if (toolCache.has(category)) {
    return toolCache.get(category)!;
  }

  const tools = await connectors.tools.list({ category });
  toolCache.set(category, tools);

  return tools;
}

// Invalidate cache every 5 minutes
setInterval(() => toolCache.clear(), 300000);
```

## Examples

### AI Agent Tool Selection

```typescript
async function selectToolsForAgent(userRequest: string) {
  const selections = await connectors.tools.select(userRequest, {
    maxTools: 10,
    includeRelated: true
  });

  // Convert to OpenAI function format
  const functions = selections.map(s => ({
    name: s.tool.id.replace('.', '_'),
    description: s.tool.description,
    parameters: {
      type: 'object',
      properties: Object.fromEntries(
        s.tool.parameters.map(p => [
          p.name,
          { type: p.type, description: p.description }
        ])
      ),
      required: s.tool.parameters.filter(p => p.required).map(p => p.name)
    }
  }));

  return functions;
}
```

### Workflow Automation

```typescript
async function automateWorkflow() {
  // Step 1: Select tools
  const tools = await connectors.tools.select('create PR, request reviews, merge');

  // Step 2: Execute in sequence
  const createPR = tools.find(t => t.tool.id === 'github.createPullRequest');
  const requestReviews = tools.find(t => t.tool.id === 'github.requestReviewers');
  const mergePR = tools.find(t => t.tool.id === 'github.mergePullRequest');

  // Create PR
  const prResult = await connectors.tools.invoke('github.createPullRequest', {
    repo: 'owner/repo',
    title: 'Automated update',
    head: 'feature',
    base: 'main'
  });

  // Request reviews
  await connectors.tools.invoke('github.requestReviewers', {
    repo: 'owner/repo',
    pull_number: prResult.data.number,
    reviewers: ['reviewer1', 'reviewer2']
  });

  // Merge (after approval)
  await connectors.tools.invoke('github.mergePullRequest', {
    repo: 'owner/repo',
    pull_number: prResult.data.number,
    merge_method: 'squash'
  });
}
```

## Next Steps

- **[MCP Registry](mcp-registry.md)** - Deploy and manage MCP servers
- **[Error Handling](error-handling.md)** - Error types and recovery
- **[Examples](../examples.md)** - More usage patterns

---

**[← Back to TypeScript SDK](./)**
