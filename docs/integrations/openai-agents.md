# OpenAI Agents Integration

Use Connectors with OpenAI's Agents SDK to build AI agents with semantic tool selection.

## Overview

The `@connectors/openai-agents` package provides seamless integration with OpenAI Agents, allowing you to:

- Use semantic tool selection instead of manually defining all tools
- Reduce token usage by 99% (1-3K vs 250K)
- Access 368 tools across 15 integrations
- Deploy custom MCP servers dynamically

## Installation

```bash
npm install @connectors/openai-agents
# or
yarn add @connectors/openai-agents
# or
pnpm add @connectors/openai-agents
```

**Dependencies:**
- `@connectors/sdk` - Connectors SDK
- `openai` - OpenAI SDK

## Quick Start

```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsProvider } from '@connectors/openai-agents';
import OpenAI from 'openai';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Select tools semantically
const tools = await ConnectorsProvider.semanticTools(
  connectors,
  'I need to manage GitHub repositories'
);

// Create assistant with selected tools
const assistant = await openai.beta.assistants.create({
  name: 'GitHub Agent',
  instructions: 'You help manage GitHub repositories',
  tools: tools,
  model: 'gpt-4-turbo-preview'
});

// Create thread and run
const thread = await openai.beta.threads.create();

await openai.beta.threads.messages.create(thread.id, {
  role: 'user',
  content: 'Create a pull request for the bug fix'
});

const run = await openai.beta.threads.runs.create(thread.id, {
  assistant_id: assistant.id
});

// Handle tool calls
while (run.status === 'requires_action') {
  const toolCalls = run.required_action.submit_tool_outputs.tool_calls;

  const toolOutputs = await Promise.all(
    toolCalls.map(async (toolCall) => {
      const result = await ConnectorsProvider.executeToolCall(
        connectors,
        toolCall
      );

      return {
        tool_call_id: toolCall.id,
        output: JSON.stringify(result)
      };
    })
  );

  run = await openai.beta.threads.runs.submitToolOutputs(
    thread.id,
    run.id,
    { tool_outputs: toolOutputs }
  );
}
```

## API Reference

### `ConnectorsProvider.semanticTools(connectors, query, options?)`

Selects tools using semantic search and converts them to OpenAI function format.

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
interface OpenAIFunction {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}
```

#### Examples

**Basic usage:**
```typescript
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

**With options:**
```typescript
const tools = await ConnectorsProvider.semanticTools(
  connectors,
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
const codeTools = await ConnectorsProvider.semanticTools(
  connectors,
  'manage repositories',
  { category: 'code', maxTools: 10 }
);

const commTools = await ConnectorsProvider.semanticTools(
  connectors,
  'send notifications',
  { category: 'communication', maxTools: 5 }
);
```

### `ConnectorsProvider.executeToolCall(connectors, toolCall)`

Executes an OpenAI tool call using Connectors.

#### Parameters

```typescript
interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}
```

#### Returns

```typescript
interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}
```

#### Examples

```typescript
const run = await openai.beta.threads.runs.retrieve(thread.id, run.id);

if (run.status === 'requires_action') {
  const toolCalls = run.required_action.submit_tool_outputs.tool_calls;

  for (const toolCall of toolCalls) {
    const result = await ConnectorsProvider.executeToolCall(
      connectors,
      toolCall
    );

    if (result.success) {
      console.log('Tool succeeded:', result.data);
    } else {
      console.error('Tool failed:', result.error);
    }
  }
}
```

### `ConnectorsProvider.allTools(connectors, options?)`

Gets all available tools (alternative to semantic selection).

#### Parameters

```typescript
interface AllToolsOptions {
  category?: string;
  server?: string;
  limit?: number;
}
```

#### Examples

```typescript
// Get all GitHub tools
const githubTools = await ConnectorsProvider.allTools(connectors, {
  server: 'github'
});

// Get all code tools
const codeTools = await ConnectorsProvider.allTools(connectors, {
  category: 'code',
  limit: 50
});
```

## Complete Examples

### GitHub Agent

```typescript
import { Connectors } from '@connectors/sdk';
import { ConnectorsProvider } from '@connectors/openai-agents';
import OpenAI from 'openai';

async function createGitHubAgent() {
  const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Select GitHub tools
  const tools = await ConnectorsProvider.semanticTools(
    connectors,
    'manage GitHub repositories, PRs, and issues',
    { maxTools: 15, category: 'code' }
  );

  console.log(`Selected ${tools.length} tools`);

  // Create assistant
  const assistant = await openai.beta.assistants.create({
    name: 'GitHub Agent',
    instructions: `You are a GitHub automation assistant. You help users:
    - Create and manage pull requests
    - Create and manage issues
    - Review code and add comments
    - Merge pull requests
    Always confirm actions before executing them.`,
    tools: tools,
    model: 'gpt-4-turbo-preview'
  });

  return { assistant, connectors, openai };
}

async function runGitHubAgent(userMessage: string) {
  const { assistant, connectors, openai } = await createGitHubAgent();

  // Create thread
  const thread = await openai.beta.threads.create();

  // Add user message
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: userMessage
  });

  // Run assistant
  let run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id
  });

  // Poll for completion
  while (run.status !== 'completed' && run.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    // Handle tool calls
    if (run.status === 'requires_action') {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;

      const toolOutputs = await Promise.all(
        toolCalls.map(async (toolCall) => {
          console.log(`Executing: ${toolCall.function.name}`);

          const result = await ConnectorsProvider.executeToolCall(
            connectors,
            toolCall
          );

          return {
            tool_call_id: toolCall.id,
            output: JSON.stringify(result)
          };
        })
      );

      run = await openai.beta.threads.runs.submitToolOutputs(
        thread.id,
        run.id,
        { tool_outputs: toolOutputs }
      );
    }
  }

  // Get response
  const messages = await openai.beta.threads.messages.list(thread.id);
  const response = messages.data[0].content[0].text.value;

  console.log('Assistant:', response);
  return response;
}

// Usage
runGitHubAgent('Create a pull request from feature-branch to main');
```

### Multi-Tool Agent

```typescript
async function createMultiToolAgent() {
  const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Select tools from multiple categories
  const tools = await ConnectorsProvider.semanticTools(
    connectors,
    'manage code, send emails, schedule meetings, create documents',
    { maxTools: 20, tokenBudget: 5000 }
  );

  const assistant = await openai.beta.assistants.create({
    name: 'Multi-Tool Agent',
    instructions: `You are a general-purpose assistant with access to:
    - Code management (GitHub)
    - Email (Gmail)
    - Calendar (Google Calendar)
    - Documents (Google Docs)
    Help users accomplish complex workflows across these tools.`,
    tools: tools,
    model: 'gpt-4-turbo-preview'
  });

  return { assistant, connectors, openai };
}
```

### Dynamic Tool Loading

```typescript
async function dynamicAgent(userQuery: string) {
  const connectors = new Connectors({ baseURL: 'http://localhost:3000' });
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Select tools based on user query
  const tools = await ConnectorsProvider.semanticTools(
    connectors,
    userQuery,
    { maxTools: 10 }
  );

  console.log(`Selected ${tools.length} tools for: "${userQuery}"`);

  // Create assistant with dynamically selected tools
  const assistant = await openai.beta.assistants.create({
    name: 'Dynamic Agent',
    instructions: 'You help users accomplish their goals',
    tools: tools,
    model: 'gpt-4-turbo-preview'
  });

  // ... run assistant
}

// Usage
dynamicAgent('I need to create a GitHub PR and email my team');
dynamicAgent('Schedule a meeting and create meeting notes document');
```

## Best Practices

### 1. Use Semantic Selection

Prefer semantic selection over loading all tools:

```typescript
// ✅ Good: Semantic selection (1-3K tokens)
const tools = await ConnectorsProvider.semanticTools(
  connectors,
  'manage GitHub repositories'
);

// ❌ Bad: All tools (250K tokens)
const allTools = await ConnectorsProvider.allTools(connectors);
```

### 2. Set Appropriate Token Budgets

```typescript
// For GPT-4 (128K context)
const tools = await ConnectorsProvider.semanticTools(
  connectors,
  'query',
  { tokenBudget: 5000, maxTools: 20 }
);

// For GPT-3.5 (16K context)
const tools = await ConnectorsProvider.semanticTools(
  connectors,
  'query',
  { tokenBudget: 2000, maxTools: 10 }
);
```

### 3. Handle Tool Errors

```typescript
const result = await ConnectorsProvider.executeToolCall(connectors, toolCall);

if (!result.success) {
  console.error('Tool failed:', result.error);

  // Return error to assistant
  return {
    tool_call_id: toolCall.id,
    output: JSON.stringify({ error: result.error })
  };
}
```

### 4. Monitor Token Usage

```typescript
const tools = await ConnectorsProvider.semanticTools(connectors, 'query');

const totalTokens = tools.reduce((sum, tool) => {
  // Estimate tokens from function definition
  const def = JSON.stringify(tool.function);
  return sum + Math.ceil(def.length / 4);
}, 0);

console.log(`Tool definitions cost ~${totalTokens} tokens`);
```

### 5. Reuse Assistants

```typescript
// Create assistant once
const assistant = await openai.beta.assistants.create({ ... });
const assistantId = assistant.id;

// Reuse in multiple threads
async function runQuery(query: string) {
  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: query
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId
  });

  // ... handle run
}
```

## Comparison: Traditional vs Connectors

### Traditional Approach (250K tokens)

```typescript
const assistant = await openai.beta.assistants.create({
  name: 'Agent',
  tools: [
    { type: 'function', function: { name: 'github_createPR', ... } },
    { type: 'function', function: { name: 'github_mergePR', ... } },
    // ... 366 more tools (250K tokens)
  ],
  model: 'gpt-4'
});
```

### Connectors Approach (1-3K tokens)

```typescript
const tools = await ConnectorsProvider.semanticTools(
  connectors,
  'manage GitHub repositories'
);
// Only 5-10 relevant tools selected (1-3K tokens)

const assistant = await openai.beta.assistants.create({
  name: 'Agent',
  tools: tools,
  model: 'gpt-4'
});
```

## Next Steps

- **[LangChain Integration](langchain.md)** - Use Connectors with LangChain
- **[Creating Integrations](creating-integrations.md)** - Build custom MCP servers
- **[SDK Documentation](../sdk/)** - Complete SDK reference

---

**[← Back to Integrations](./)**
