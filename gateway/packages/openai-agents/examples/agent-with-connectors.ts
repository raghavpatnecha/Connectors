/**
 * Agent example - OpenAI Assistants API with Connectors
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

  console.log('🤖 Connectors OpenAI Integration - Agent Example\n');

  // Test connection
  console.log('Testing connection...');
  const connectionStatus = await provider.testConnection();
  console.log(`✓ Connectors: ${connectionStatus.connectors ? 'connected' : 'failed'}`);
  console.log(`✓ OpenAI: ${connectionStatus.openai ? 'connected' : 'failed'}\n`);

  if (!connectionStatus.connectors || !connectionStatus.openai) {
    console.error('❌ Connection failed. Please check your configuration.');
    return;
  }

  // Step 1: Create assistant with semantic tool selection
  console.log('Step 1: Creating DevOps Assistant with auto-selected tools...');
  const assistant = await provider.createAgent({
    name: 'DevOps Assistant',
    instructions: `You are a helpful DevOps assistant that can manage GitHub repositories and deploy services.

You can:
- Create and manage pull requests
- Review and merge code
- Deploy applications to cloud platforms
- Send notifications to the team

Be concise and professional in your responses.`,
    toolQuery: 'GitHub repository management and cloud deployment',
    model: 'gpt-4-turbo-preview',
    toolSelectionOptions: {
      maxTools: 10,
      categories: ['code', 'cloud'],
      tokenBudget: 3000,
    },
  });

  console.log(`✓ Created assistant: ${assistant.id}`);
  console.log(`  Name: ${assistant.name}`);
  console.log(`  Model: ${assistant.model}`);
  console.log(`  Tools: ${assistant.tools.length} tools selected\n`);

  // Step 2: Create a thread
  console.log('Step 2: Creating conversation thread...');
  const thread = await provider.openai.beta.threads.create();
  console.log(`✓ Thread created: ${thread.id}\n`);

  // Step 3: Add message to thread
  console.log('Step 3: Sending message to assistant...');
  await provider.openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: 'Create a new pull request to merge feature-branch into main on myorg/myproject repository',
  });
  console.log('✓ Message added to thread\n');

  // Step 4: Run the assistant
  console.log('Step 4: Running assistant...');
  let run = await provider.openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });
  console.log(`✓ Run started: ${run.id}\n`);

  // Step 5: Poll for completion
  console.log('Step 5: Waiting for completion...');
  while (run.status === 'queued' || run.status === 'in_progress') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await provider.openai.beta.threads.runs.retrieve(thread.id, run.id);
    console.log(`  Status: ${run.status}`);
  }
  console.log('');

  // Step 6: Handle requires_action status (tool calls)
  if (run.status === 'requires_action' && run.required_action) {
    console.log('Step 6: Executing required tool calls...');
    const toolCalls =
      run.required_action.submit_tool_outputs.tool_calls;

    const toolOutputs = [];

    for (const toolCall of toolCalls) {
      console.log(`\n  Executing: ${toolCall.function.name}`);
      console.log(`  Arguments: ${toolCall.function.arguments}`);

      try {
        const result = await provider.executeToolCall({
          id: toolCall.id,
          type: 'function',
          function: {
            name: toolCall.function.name,
            arguments: toolCall.function.arguments,
          },
        });

        console.log(`  ✓ Success`);

        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify(result),
        });
      } catch (error) {
        console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        });
      }
    }

    // Submit tool outputs
    console.log('\n  Submitting tool outputs...');
    run = await provider.openai.beta.threads.runs.submitToolOutputs(
      thread.id,
      run.id,
      {
        tool_outputs: toolOutputs,
      }
    );

    // Wait for completion again
    while (run.status === 'queued' || run.status === 'in_progress') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await provider.openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log(`  Status: ${run.status}`);
    }
  }

  // Step 7: Get final messages
  console.log('\nStep 7: Retrieving assistant response...');
  const messages = await provider.openai.beta.threads.messages.list(thread.id);

  console.log('\n📝 Conversation:');
  for (const message of messages.data.reverse()) {
    console.log(`\n${message.role.toUpperCase()}:`);
    for (const content of message.content) {
      if (content.type === 'text') {
        console.log(content.text.value);
      }
    }
  }

  // Cleanup: Delete assistant
  console.log('\n\nCleanup: Deleting assistant...');
  await provider.openai.beta.assistants.del(assistant.id);
  console.log('✓ Assistant deleted');

  console.log('\n✅ Example completed successfully!');
}

// Run example
main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
