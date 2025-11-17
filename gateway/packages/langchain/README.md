# @connectors/langchain

LangChain integration for Connectors platform - Semantic tool routing for AI agents with 95% token reduction.

## Overview

`@connectors/langchain` provides seamless integration between the Connectors platform and LangChain's agent framework. It enables:

- **Semantic Tool Selection**: Use natural language queries to select relevant tools from 368+ available tools
- **Token Optimization**: 95% token reduction (1-3K vs 250K) through progressive loading
- **Multi-Integration Support**: Access GitHub, Slack, Jira, and 12+ other integrations
- **Type-Safe Tools**: Automatic Zod schema generation from tool parameters
- **LangChain Native**: Extends `StructuredTool` and `Toolkit` for native integration

## Installation

```bash
npm install @connectors/langchain langchain @langchain/core @langchain/openai
```

## Quick Start

```typescript
import { ConnectorsToolkit } from '@connectors/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

// Create toolkit with semantic query
const toolkit = new ConnectorsToolkit({
  connectors: {
    baseURL: 'http://localhost:3000',
    tenantId: 'my-company'
  },
  toolQuery: 'GitHub repository management'
});

// Get tools (semantic selection)
const tools = await toolkit.getTools();

// Create LLM and agent
const llm = new ChatOpenAI({ modelName: 'gpt-4-turbo-preview' });
const executor = await initializeAgentExecutorWithOptions(tools, llm, {
  agentType: 'openai-functions',
  verbose: true
});

// Execute task
const result = await executor.invoke({
  input: 'Create a pull request on myrepo/project'
});

console.log(result.output);
```

## Features

### 1. Semantic Tool Selection

Use natural language to select relevant tools:

```typescript
const toolkit = new ConnectorsToolkit({
  connectors: { baseURL: 'http://localhost:3000' },
  toolQuery: 'code review and pull request management'
});

const tools = await toolkit.getToolsFromQuery('GitHub PR operations', {
  maxTools: 5,
  categories: ['code'],
  minScore: 0.8
});
```

### 2. Multi-Integration Support

Load tools from multiple integrations:

```typescript
const toolkit = new ConnectorsToolkit({
  connectors: { baseURL: 'http://localhost:3000' },
  integrations: ['github', 'slack', 'jira']
});

const tools = await toolkit.getTools();
// Returns tools from all specified integrations
```

### 3. Category Filtering

Filter tools by category:

```typescript
const codeTools = await toolkit.getToolsByCategory('code');
const commTools = await toolkit.getToolsByCategory('communication');
const pmTools = await toolkit.getToolsByCategory('pm');
```

### 4. Type-Safe Tool Execution

Tools are automatically validated with Zod schemas:

```typescript
// Tool with parameters
{
  name: 'github.createPullRequest',
  parameters: [
    { name: 'repo', type: 'string', required: true },
    { name: 'title', type: 'string', required: true },
    { name: 'base', type: 'string', required: true },
    { name: 'head', type: 'string', required: true }
  ]
}

// Automatic validation on execution
await tool._call({
  repo: 'owner/repo',
  title: 'My PR',
  base: 'main',
  head: 'feature'
});
// ✅ Validated and executed

await tool._call({ repo: 'owner/repo' });
// ❌ Throws validation error (missing required fields)
```

## API Reference

### ConnectorsToolkit

Main toolkit class for LangChain integration.

#### Constructor

```typescript
new ConnectorsToolkit(config: ConnectorsToolkitConfig)
```

**Configuration:**

```typescript
interface ConnectorsToolkitConfig {
  connectors: {
    baseURL: string;          // Connectors gateway URL
    apiKey?: string;          // API key (optional)
    tenantId?: string;        // Tenant ID (optional)
  };
  integrations?: string[];    // Specific integrations to load
  toolQuery?: string;         // Semantic query for tool selection
}
```

#### Methods

##### `getTools(): Promise<ConnectorsTool[]>`

Get all tools (implements Toolkit interface). Initializes based on configuration.

```typescript
const tools = await toolkit.getTools();
```

##### `getToolsFromQuery(query: string, options?: ToolSelectionOptions): Promise<ConnectorsTool[]>`

Select tools using semantic query.

```typescript
const tools = await toolkit.getToolsFromQuery('GitHub PR management', {
  maxTools: 10,
  categories: ['code'],
  minScore: 0.7
});
```

##### `getToolsFromIntegration(integration: string): Promise<ConnectorsTool[]>`

Get all tools from a specific integration.

```typescript
const githubTools = await toolkit.getToolsFromIntegration('github');
const slackTools = await toolkit.getToolsFromIntegration('slack');
```

##### `getToolsByCategory(category: string): Promise<ConnectorsTool[]>`

Get tools by category.

```typescript
const codeTools = await toolkit.getToolsByCategory('code');
```

##### `refresh(): Promise<void>`

Refresh tools (re-initialize).

```typescript
await toolkit.refresh();
```

##### `getMetadata()`

Get toolkit metadata.

```typescript
const metadata = toolkit.getMetadata();
// Returns: { toolCount, integrations, toolQuery, initialized, tools }
```

### ConnectorsTool

LangChain StructuredTool implementation.

#### Properties

- `name: string` - Tool name (sanitized for LangChain)
- `description: string` - Tool description
- `schema: z.ZodObject` - Zod validation schema

#### Methods

##### `_call(arg: z.infer<this['schema']>): Promise<string>`

Execute tool (implements StructuredTool interface).

##### `static fromConnectorsTool(tool: Tool, connectors: Connectors): ConnectorsTool`

Create ConnectorsTool from Connectors Tool definition.

##### `getMetadata()`

Get tool metadata.

### Utility Functions

##### `convertToZodSchema(parameters: ToolParameter[]): z.ZodObject`

Convert Connectors Tool parameters to Zod schema.

```typescript
import { convertToZodSchema } from '@connectors/langchain';

const schema = convertToZodSchema([
  { name: 'message', type: 'string', required: true },
  { name: 'channel', type: 'string', required: false }
]);
```

##### `validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T`

Validate input against Zod schema.

```typescript
import { validateInput } from '@connectors/langchain';

const validated = validateInput(schema, input);
```

## Examples

### Basic Chain

See [examples/basic-chain.ts](./examples/basic-chain.ts)

```typescript
import { ConnectorsToolkit } from '@connectors/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const toolkit = new ConnectorsToolkit({
  connectors: { baseURL: 'http://localhost:3000' },
  toolQuery: 'GitHub repository management'
});

const tools = await toolkit.getTools();
const llm = new ChatOpenAI({ modelName: 'gpt-4-turbo-preview' });

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant.'],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}']
]);

const agent = await createOpenAIFunctionsAgent({ llm, tools, prompt });
const executor = new AgentExecutor({ agent, tools });

const result = await executor.invoke({
  input: 'Create a pull request'
});
```

### Agent Executor with Multiple Integrations

See [examples/agent-executor.ts](./examples/agent-executor.ts)

```typescript
const toolkit = new ConnectorsToolkit({
  connectors: { baseURL: 'http://localhost:3000' },
  integrations: ['github', 'slack', 'jira']
});

const tools = await toolkit.getTools();
const llm = new ChatOpenAI({ modelName: 'gpt-4-turbo-preview' });

const executor = await initializeAgentExecutorWithOptions(tools, llm, {
  agentType: 'openai-functions',
  verbose: true
});

const result = await executor.invoke({
  input: 'Create a PR and notify the team on Slack'
});
```

## Architecture

```
┌─────────────────────────────────────┐
│   LangChain Agent / Executor        │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   ConnectorsToolkit                 │
│   - Semantic tool selection         │
│   - Multi-integration support       │
│   - Category filtering              │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   ConnectorsTool (StructuredTool)   │
│   - Zod schema validation           │
│   - Type-safe execution             │
│   - Error handling                  │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   Connectors SDK                    │
│   - Gateway communication           │
│   - OAuth proxy                     │
│   - GraphRAG enhancement            │
└─────────────────────────────────────┘
```

## Benefits

### Token Optimization

Traditional approach (loading all tools):
```
250K tokens for 368 tools = High cost + Context limits
```

Connectors + LangChain:
```
1-3K tokens with semantic selection = 95% reduction
```

### Semantic Routing

Instead of loading all tools upfront:
1. User provides natural language query
2. Connectors uses FAISS + GraphRAG for semantic matching
3. Only relevant tools loaded (5-10 tools)
4. Context stays within limits

### Progressive Loading

```typescript
// Tier 1: Minimal schema (name, description) - 200 tokens
// Tier 2: Medium schema (+ parameters) - 800 tokens
// Tier 3: Full schema (lazy loaded) - On-demand
```

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
npm run test:coverage
```

### Run Examples

```bash
# Set environment variables
export CONNECTORS_URL=http://localhost:3000
export TENANT_ID=my-company
export OPENAI_API_KEY=sk-...

# Run basic example
npx ts-node examples/basic-chain.ts

# Run advanced example
npx ts-node examples/agent-executor.ts
```

## Requirements

- Node.js 18+
- TypeScript 5.4+
- LangChain 0.2+
- Connectors Gateway running

## License

MIT

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Support

- Documentation: https://docs.connectors.ai
- Issues: https://github.com/connectors/connectors/issues
- Discord: https://discord.gg/connectors
