/**
 * Basic usage example - OpenAI function calling with Connectors
 */

import { ConnectorsProvider } from '@connectors/openai-agents';
import OpenAI from 'openai';

async function main() {
  // Initialize provider
  const provider = new ConnectorsProvider({
    connectors: {
      baseURL: process.env.CONNECTORS_URL || 'http://localhost:3000',
      tenantId: process.env.TENANT_ID || 'demo-tenant',
      apiKey: process.env.CONNECTORS_API_KEY,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
    },
  });

  console.log('🔌 Connectors OpenAI Integration - Basic Usage Example\n');

  // Test connection
  console.log('Testing connection...');
  const connectionStatus = await provider.testConnection();
  console.log(`✓ Connectors: ${connectionStatus.connectors ? 'connected' : 'failed'}`);
  console.log(`✓ OpenAI: ${connectionStatus.openai ? 'connected' : 'failed'}\n`);

  if (!connectionStatus.connectors || !connectionStatus.openai) {
    console.error('❌ Connection failed. Please check your configuration.');
    return;
  }

  // Step 1: Select tools semantically
  console.log('Step 1: Selecting tools semantically...');
  const tools = await provider.selectTools(
    'I need to create a GitHub pull request and send a Slack notification',
    {
      maxTools: 5,
      categories: ['code', 'communication'],
      tokenBudget: 2000,
    }
  );

  console.log(`✓ Selected ${tools.length} tools:`);
  tools.forEach((tool) => {
    console.log(`  - ${tool.function.name}: ${tool.function.description}`);
  });
  console.log('');

  // Step 2: Use tools with OpenAI Chat Completion
  console.log('Step 2: Using tools with OpenAI Chat Completion...');

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content:
        'Create a pull request on myrepo/project with title "Add feature" from branch "feature" to "main", then send a message to #engineering on Slack saying "PR created!"',
    },
  ];

  const response = await provider.openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: messages,
    tools: tools,
    tool_choice: 'auto',
  });

  console.log('✓ OpenAI Response received');
  const message = response.choices[0].message;
  console.log(`  Assistant message: ${message.content || '(none)'}`);

  // Step 3: Execute tool calls if present
  if (message.tool_calls && message.tool_calls.length > 0) {
    console.log(`\nStep 3: Executing ${message.tool_calls.length} tool calls...`);

    for (const toolCall of message.tool_calls) {
      console.log(`\n  Executing: ${toolCall.function.name}`);
      console.log(`  Arguments: ${toolCall.function.arguments}`);

      try {
        const result = await provider.executeToolCall(toolCall);
        console.log(`  ✓ Success:`, JSON.stringify(result, null, 2));

        // Add tool result to messages for continuation
        messages.push(message);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      } catch (error) {
        console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
      }
    }

    // Step 4: Get final response with tool results
    console.log('\nStep 4: Getting final response...');
    const finalResponse = await provider.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
    });

    console.log('✓ Final response:');
    console.log(`  ${finalResponse.choices[0].message.content}`);
  } else {
    console.log('\nNo tool calls were made.');
  }

  console.log('\n✅ Example completed successfully!');
}

// Run example
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
