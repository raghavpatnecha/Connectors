# @connectors/openai-agents

OpenAI Agents SDK integration for the Connectors platform. Seamlessly integrate Connectors' semantic tool selection with OpenAI's function calling and Assistants API.

## Features

- **Semantic Tool Selection**: Automatically select the most relevant tools using Connectors' FAISS semantic router
- **99% Token Reduction**: Reduce context size from 250K to 1-3K tokens through intelligent tool selection
- **OpenAI Function Calling**: Convert Connectors tools to OpenAI function definitions automatically
- **Assistants API Support**: Create AI agents with auto-selected tools
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Easy Integration**: Drop-in solution for OpenAI SDK users

## Installation

```bash
npm install @connectors/openai-agents openai
```

## Quick Start

### Basic Function Calling

```typescript
import { ConnectorsProvider } from '@connectors/openai-agents';

const provider = new ConnectorsProvider({
  connectors: {
    baseURL: 'http://localhost:3000',
    tenantId: 'my-company'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!
  }
});

// Select tools semantically
const tools = await provider.selectTools('GitHub and Slack operations', {
  maxTools: 5,
  categories: ['code', 'communication']
});

// Use with OpenAI chat completion
const response = await provider.openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'user', content: 'Create a PR and notify the team on Slack' }
  ],
  tools: tools,
  tool_choice: 'auto'
});

// Execute tool calls
if (response.choices[0].message.tool_calls) {
  for (const toolCall of response.choices[0].message.tool_calls) {
    const result = await provider.executeToolCall(toolCall);
    console.log('Result:', result);
  }
}
```

### Create an AI Agent

```typescript
// Create agent with semantic tool selection
const assistant = await provider.createAgent({
  name: 'DevOps Assistant',
  instructions: 'You help manage GitHub repos and cloud deployments',
  toolQuery: 'GitHub repository management and cloud deployment',
  model: 'gpt-4-turbo-preview'
});

// Create thread and run
const thread = await provider.openai.beta.threads.create();
await provider.openai.beta.threads.messages.create(thread.id, {
  role: 'user',
  content: 'Create a PR to merge feature-branch into main'
});

const run = await provider.openai.beta.threads.runs.create(thread.id, {
  assistant_id: assistant.id
});
```

### Use Specific Integrations

```typescript
// Get all tools from specific integrations
const assistant = await provider.createAgent({
  name: 'Communication Assistant',
  instructions: 'You help with team communication',
  integrations: ['slack', 'email', 'teams'],
  model: 'gpt-4-turbo-preview'
});
```

## API Reference

### `ConnectorsProvider`

Main integration class that bridges Connectors and OpenAI.

#### Constructor

```typescript
new ConnectorsProvider(config: ConnectorsProviderConfig)
```

**Config:**
```typescript
interface ConnectorsProviderConfig {
  connectors: {
    baseURL: string;
    tenantId?: string;
    apiKey?: string;
    timeout?: number;
    maxRetries?: number;
  };
  openai: {
    apiKey: string;
    organization?: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
  };
}
```

#### Methods

##### `selectTools(query, options?)`

Select tools using semantic search and convert to OpenAI format.

```typescript
async selectTools(
  query: string,
  options?: {
    maxTools?: number;      // Default: 10
    categories?: string[];
    tokenBudget?: number;   // Default: 3000
    context?: Record<string, unknown>;
  }
): Promise<OpenAI.ChatCompletionTool[]>
```

**Example:**
```typescript
const tools = await provider.selectTools(
  'create pull requests and manage issues',
  {
    maxTools: 5,
    categories: ['code']
  }
);
```

##### `getIntegrationTools(integration)`

Get all tools from a specific integration.

```typescript
async getIntegrationTools(
  integration: string
): Promise<OpenAI.ChatCompletionTool[]>
```

**Example:**
```typescript
const githubTools = await provider.getIntegrationTools('github');
const slackTools = await provider.getIntegrationTools('slack');
```

##### `executeToolCall(toolCall)`

Execute a tool call from OpenAI response.

```typescript
async executeToolCall(
  toolCall: OpenAI.ChatCompletionMessageToolCall
): Promise<unknown>
```

**Example:**
```typescript
const result = await provider.executeToolCall(toolCall);
```

##### `createAgent(config)`

Create an OpenAI assistant with auto-selected tools.

```typescript
async createAgent(config: {
  name: string;
  instructions: string;
  model?: string;
  toolQuery?: string;
  integrations?: string[];
  toolSelectionOptions?: ToolSelectionOptions;
  assistantConfig?: {
    file_ids?: string[];
    metadata?: Record<string, string>;
    temperature?: number;
    top_p?: number;
  };
}): Promise<OpenAI.Beta.Assistants.Assistant>
```

**Example:**
```typescript
const assistant = await provider.createAgent({
  name: 'DevOps Assistant',
  instructions: 'Help with DevOps tasks',
  toolQuery: 'GitHub and cloud deployment',
  model: 'gpt-4-turbo-preview'
});
```

##### `updateAgentTools(assistantId, toolQuery, options?)`

Update an existing assistant's tools.

```typescript
async updateAgentTools(
  assistantId: string,
  toolQuery: string,
  options?: ToolSelectionOptions
): Promise<OpenAI.Beta.Assistants.Assistant>
```

##### `testConnection()`

Test connection to both Connectors and OpenAI.

```typescript
async testConnection(): Promise<{
  connectors: boolean;
  openai: boolean;
}>
```

#### Properties

- `connectors: Connectors` - Access Connectors SDK instance
- `openai: OpenAI` - Access OpenAI client instance
- `config: ConnectorsProviderConfig` - Get configuration (readonly)

## Utility Functions

### `convertToOpenAITool(tool)`

Convert a single Connectors tool to OpenAI format.

```typescript
import { convertToOpenAITool } from '@connectors/openai-agents';

const openaiTool = convertToOpenAITool(connectorsTool);
```

### `convertToolsToOpenAI(tools)`

Convert multiple Connectors tools to OpenAI format.

```typescript
import { convertToolsToOpenAI } from '@connectors/openai-agents';

const openaiTools = convertToolsToOpenAI(connectorsTools);
```

## Examples

See the `examples/` directory for complete examples:

- **basic-usage.ts**: Function calling with semantic tool selection
- **agent-with-connectors.ts**: Create and run an AI agent with Connectors tools

## How It Works

1. **Semantic Selection**: When you call `selectTools()`, the provider queries Connectors' semantic router which uses FAISS vector search and GraphRAG to find the most relevant tools.

2. **Token Optimization**: Instead of sending 250K+ tokens (all tool definitions), Connectors returns only 1-3K tokens (5-10 most relevant tools).

3. **Auto-Conversion**: Tools are automatically converted from Connectors format to OpenAI's function calling schema.

4. **Transparent Execution**: When OpenAI makes a tool call, `executeToolCall()` routes it through Connectors, which handles OAuth, rate limiting, and API calls.

## Architecture

```
┌─────────────────────┐
│   Your Application  │
└──────────┬──────────┘
           │
┌──────────▼────────────────┐
│  ConnectorsProvider       │
│  - selectTools()          │
│  - executeToolCall()      │
│  - createAgent()          │
└──────┬───────────┬────────┘
       │           │
       │           │
┌──────▼──────┐ ┌─▼────────────┐
│  Connectors │ │   OpenAI     │
│  Gateway    │ │   API        │
│  (Semantic  │ │  (Function   │
│   Routing)  │ │   Calling)   │
└─────────────┘ └──────────────┘
```

## Benefits

- **99% Token Reduction**: From 250K to 1-3K tokens through semantic selection
- **No Manual Tool Management**: Tools are selected automatically based on natural language queries
- **Integrated OAuth**: Connectors handles all authentication and credential management
- **Rate Limiting**: Built-in rate limiting and retry logic
- **GraphRAG Enhancement**: Tool selection enhanced with relationship graphs
- **Multi-Integration**: Access 15+ integrations with 368+ tools seamlessly

## Requirements

- Node.js >= 18.0.0
- OpenAI SDK >= 4.0.0
- Access to a Connectors Gateway instance

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint
```

## License

MIT

## Support

- **Documentation**: [Connectors Documentation](https://github.com/raghavpatnecha/Connectors)
- **Issues**: [GitHub Issues](https://github.com/raghavpatnecha/Connectors/issues)
- **Examples**: See `examples/` directory in this package

## Related Packages

- **@connectors/sdk**: Core TypeScript SDK for Connectors platform
- **openai**: Official OpenAI Node.js SDK
