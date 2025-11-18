# LangChain Integration

Use Connectors with LangChain to build AI agents with semantic tool selection.

## Overview

The `@connectors/langchain` package provides seamless integration with LangChain, allowing you to:

- Use semantic tool selection instead of manually defining all tools
- Reduce token usage by 99% (1-3K vs 250K)
- Access 368 tools across 15 integrations
- Deploy custom MCP servers dynamically

## Installation

```bash
npm install @connectors/langchain
# or
yarn add @connectors/langchain
# or
pnpm add @connectors/langchain
```

**Dependencies:**
- `@connectors/sdk` - Connectors SDK
- `langchain` - LangChain framework

## Quick Start

```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsToolkit } from '@connectors/langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
const toolkit = new ConnectorsToolkit(connectors);

// Get tools semantically
const tools = await toolkit.getSemanticTools('manage GitHub repositories');

// Create agent
const model = new ChatOpenAI({ modelName: 'gpt-4', temperature: 0 });

const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: 'openai-functions',
  verbose: true
});

// Run agent
const result = await executor.call({
  input: 'Create a pull request from feature-branch to main'
});

console.log(result.output);
```

## API Reference

### `ConnectorsToolkit`

Main class for integrating Connectors with LangChain.

```typescript
class ConnectorsToolkit {
  constructor(connectors: Connectors);

  async getSemanticTools(
    query: string,
    options?: SemanticToolsOptions
  ): Promise<StructuredTool[]>;

  async getAllTools(
    options?: GetAllToolsOptions
  ): Promise<StructuredTool[]>;

  async getToolsByCategory(
    category: string,
    options?: GetToolsOptions
  ): Promise<StructuredTool[]>;
}
```

### `getSemanticTools(query, options?)`

Selects tools using semantic search and converts them to LangChain StructuredTools.

#### Parameters

```typescript
interface SemanticToolsOptions {
  maxTools?: number;            // Max tools to return (default: 10)
  category?: string;            // Filter by category
  tokenBudget?: number;         // Max token cost
  includeRelated?: boolean;     // Include GraphRAG suggestions (default: true)
}
```

#### Returns

```typescript
StructuredTool[] // LangChain tools
```

#### Examples

**Basic usage:**
```typescript
const toolkit = new ConnectorsToolkit(connectors);

const tools = await toolkit.getSemanticTools('manage GitHub repositories');

const executor = await initializeAgentExecutorWithOptions(
  tools,
  new ChatOpenAI({ modelName: 'gpt-4' }),
  { agentType: 'openai-functions' }
);
```

**With options:**
```typescript
const tools = await toolkit.getSemanticTools(
  'create PRs and notify team',
  {
    maxTools: 15,
    tokenBudget: 3000,
    includeRelated: true
  }
);
```

**Category filtering:**
```typescript
const codeTools = await toolkit.getSemanticTools(
  'manage repositories',
  { category: 'code', maxTools: 10 }
);
```

### `getAllTools(options?)`

Gets all available tools (alternative to semantic selection).

#### Parameters

```typescript
interface GetAllToolsOptions {
  category?: string;
  server?: string;
  limit?: number;
}
```

#### Examples

```typescript
// Get all GitHub tools
const githubTools = await toolkit.getAllTools({ server: 'github' });

// Get all code tools
const codeTools = await toolkit.getAllTools({ category: 'code', limit: 50 });
```

### `getToolsByCategory(category, options?)`

Gets all tools in a specific category.

#### Parameters

```typescript
interface GetToolsOptions {
  maxTools?: number;
  server?: string;
}
```

#### Examples

```typescript
const codeTools = await toolkit.getToolsByCategory('code', { maxTools: 20 });
const commTools = await toolkit.getToolsByCategory('communication');
```

## Complete Examples

### GitHub Agent

```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsToolkit } from '@connectors/langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

async function createGitHubAgent() {
  const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
  const toolkit = new ConnectorsToolkit(connectors);

  // Select GitHub tools
  const tools = await toolkit.getSemanticTools(
    'manage GitHub repositories, PRs, and issues',
    { maxTools: 15, category: 'code' }
  );

  console.log(`Selected ${tools.length} tools`);

  // Create agent
  const model = new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0
  });

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'openai-functions',
    verbose: true,
    maxIterations: 5
  });

  return executor;
}

async function runGitHubAgent(input: string) {
  const executor = await createGitHubAgent();

  const result = await executor.call({ input });

  console.log('Agent output:', result.output);
  return result.output;
}

// Usage
runGitHubAgent('Create a pull request from feature-branch to main with title "Add new feature"');
```

### Multi-Tool Agent

```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsToolkit } from '@connectors/langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

async function createMultiToolAgent() {
  const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
  const toolkit = new ConnectorsToolkit(connectors);

  // Select tools from multiple categories
  const tools = await toolkit.getSemanticTools(
    'manage code, send emails, schedule meetings, create documents',
    { maxTools: 20, tokenBudget: 5000 }
  );

  console.log(`Selected ${tools.length} tools across multiple categories`);

  const model = new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0
  });

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'openai-functions',
    verbose: true,
    maxIterations: 10
  });

  return executor;
}

// Usage
const agent = await createMultiToolAgent();

const result = await agent.call({
  input: 'Create a GitHub PR, email my team about it, and schedule a code review meeting'
});
```

### Conversational Agent with Memory

```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsToolkit } from '@connectors/langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { BufferMemory } from 'langchain/memory';

async function createConversationalAgent() {
  const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
  const toolkit = new ConnectorsToolkit(connectors);

  const tools = await toolkit.getSemanticTools('manage GitHub repositories');

  const model = new ChatOpenAI({ modelName: 'gpt-4', temperature: 0 });

  const memory = new BufferMemory({
    memoryKey: 'chat_history',
    returnMessages: true
  });

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'openai-functions',
    memory: memory,
    verbose: true
  });

  return executor;
}

// Multi-turn conversation
const agent = await createConversationalAgent();

await agent.call({ input: 'Create a PR from feature-branch to main' });
// Agent remembers: "I created PR #123"

await agent.call({ input: 'Add reviewer john to that PR' });
// Agent knows "that PR" refers to #123
```

### Chain with Multiple Agents

```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsToolkit } from '@connectors/langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { SequentialChain } from 'langchain/chains';

async function createAgentChain() {
  const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
  const toolkit = new ConnectorsToolkit(connectors);

  // Agent 1: Code agent
  const codeTools = await toolkit.getSemanticTools(
    'manage GitHub',
    { category: 'code' }
  );

  const codeAgent = await initializeAgentExecutorWithOptions(
    codeTools,
    new ChatOpenAI({ modelName: 'gpt-4' }),
    { agentType: 'openai-functions' }
  );

  // Agent 2: Communication agent
  const commTools = await toolkit.getSemanticTools(
    'send notifications',
    { category: 'communication' }
  );

  const commAgent = await initializeAgentExecutorWithOptions(
    commTools,
    new ChatOpenAI({ modelName: 'gpt-4' }),
    { agentType: 'openai-functions' }
  );

  // Chain agents together
  const chain = new SequentialChain({
    chains: [
      { chain: codeAgent, inputKey: 'code_task', outputKey: 'code_result' },
      { chain: commAgent, inputKey: 'comm_task', outputKey: 'comm_result' }
    ]
  });

  return chain;
}

// Usage
const chain = await createAgentChain();

const result = await chain.call({
  code_task: 'Create a PR',
  comm_task: 'Email team about the PR'
});
```

### Custom Tool Creation

```typescript
import { Connectors } from '@connectors/sdk';
import { Tool } from 'langchain/tools';
import { z } from 'zod';

class CustomConnectorTool extends Tool {
  name = 'custom_github_tool';
  description = 'Custom GitHub tool with specific logic';

  constructor(private connectors: Connectors) {
    super();
  }

  async _call(input: string): Promise<string> {
    // Custom logic before calling Connectors
    const params = this.parseInput(input);

    // Call Connectors
    const result = await this.connectors.tools.invoke(
      'github.createPullRequest',
      params
    );

    // Custom logic after calling Connectors
    return this.formatOutput(result);
  }

  private parseInput(input: string): Record<string, any> {
    // Custom parsing logic
    return JSON.parse(input);
  }

  private formatOutput(result: any): string {
    // Custom formatting logic
    return `PR created: ${result.data.url}`;
  }
}

// Usage
const tool = new CustomConnectorTool(connectors);
const tools = [tool];

const executor = await initializeAgentExecutorWithOptions(
  tools,
  new ChatOpenAI({ modelName: 'gpt-4' }),
  { agentType: 'openai-functions' }
);
```

## Best Practices

### 1. Use Semantic Selection

```typescript
// ✅ Good: Semantic selection (1-3K tokens)
const tools = await toolkit.getSemanticTools('manage GitHub repositories');

// ❌ Bad: All tools (250K tokens)
const allTools = await toolkit.getAllTools();
```

### 2. Set Appropriate Token Budgets

```typescript
// For GPT-4 (128K context)
const tools = await toolkit.getSemanticTools('query', {
  tokenBudget: 5000,
  maxTools: 20
});

// For GPT-3.5 (16K context)
const tools = await toolkit.getSemanticTools('query', {
  tokenBudget: 2000,
  maxTools: 10
});
```

### 3. Handle Errors Gracefully

```typescript
try {
  const result = await executor.call({ input: 'Create a PR' });
  console.log(result.output);
} catch (error) {
  console.error('Agent failed:', error.message);

  // Retry with fewer tools
  const tools = await toolkit.getSemanticTools('manage GitHub', { maxTools: 5 });
  const newExecutor = await initializeAgentExecutorWithOptions(
    tools,
    model,
    { agentType: 'openai-functions' }
  );

  const result = await newExecutor.call({ input: 'Create a PR' });
}
```

### 4. Monitor Token Usage

```typescript
const tools = await toolkit.getSemanticTools('query');

console.log(`Using ${tools.length} tools`);

// Estimate token cost
const estimatedTokens = tools.length * 200; // ~200 tokens per tool
console.log(`Estimated token cost: ${estimatedTokens}`);
```

### 5. Use Streaming for Better UX

```typescript
import { ChatOpenAI } from 'langchain/chat_models/openai';

const model = new ChatOpenAI({
  modelName: 'gpt-4',
  streaming: true,
  callbacks: [{
    handleLLMNewToken(token: string) {
      process.stdout.write(token);
    }
  }]
});

const executor = await initializeAgentExecutorWithOptions(
  tools,
  model,
  { agentType: 'openai-functions' }
);
```

## Comparison: Traditional vs Connectors

### Traditional Approach (250K tokens)

```typescript
import { GitHubTool1, GitHubTool2, ... } from 'langchain/tools/github';
import { GmailTool1, GmailTool2, ... } from 'langchain/tools/gmail';
// ... import 366 more tools

const tools = [
  new GitHubTool1(),
  new GitHubTool2(),
  // ... 366 more tools (250K tokens)
];

const executor = await initializeAgentExecutorWithOptions(
  tools,
  model,
  { agentType: 'openai-functions' }
);
```

### Connectors Approach (1-3K tokens)

```typescript
const toolkit = new ConnectorsToolkit(connectors);

const tools = await toolkit.getSemanticTools('manage GitHub repositories');
// Only 5-10 relevant tools selected (1-3K tokens)

const executor = await initializeAgentExecutorWithOptions(
  tools,
  model,
  { agentType: 'openai-functions' }
);
```

## Advanced Usage

### Dynamic Tool Loading

```typescript
async function dynamicAgent(userInput: string) {
  // Analyze user input to select tools
  const tools = await toolkit.getSemanticTools(userInput);

  const executor = await initializeAgentExecutorWithOptions(
    tools,
    new ChatOpenAI({ modelName: 'gpt-4' }),
    { agentType: 'openai-functions' }
  );

  return await executor.call({ input: userInput });
}

// Each query loads different tools
await dynamicAgent('Create a GitHub PR');
await dynamicAgent('Send an email to my team');
await dynamicAgent('Schedule a meeting');
```

### Tool Caching

```typescript
import { LRUCache } from 'lru-cache';

const toolCache = new LRUCache<string, StructuredTool[]>({
  max: 100,
  ttl: 1000 * 60 * 60 // 1 hour
});

async function getCachedTools(query: string): Promise<StructuredTool[]> {
  const cached = toolCache.get(query);
  if (cached) {
    console.log('Using cached tools');
    return cached;
  }

  const tools = await toolkit.getSemanticTools(query);
  toolCache.set(query, tools);

  return tools;
}
```

## Next Steps

- **[OpenAI Agents Integration](openai-agents.md)** - Use with OpenAI Agents
- **[Creating Integrations](creating-integrations.md)** - Build custom MCP servers
- **[SDK Documentation](../sdk/)** - Complete SDK reference

---

**[← Back to Integrations](./)**
