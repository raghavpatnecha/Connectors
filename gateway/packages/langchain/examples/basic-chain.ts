/**
 * Basic LangChain chain example with Connectors integration
 *
 * This example demonstrates:
 * 1. Creating a ConnectorsToolkit with semantic query
 * 2. Setting up a ChatOpenAI model
 * 3. Creating an agent with OpenAI functions
 * 4. Executing tasks with automatic tool selection
 */

import { ConnectorsToolkit } from '@connectors/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

async function main() {
  console.log('🚀 Starting LangChain + Connectors example...\n');

  // Step 1: Create ConnectorsToolkit with semantic query
  console.log('📦 Creating ConnectorsToolkit...');
  const toolkit = new ConnectorsToolkit({
    connectors: {
      baseURL: process.env.CONNECTORS_URL || 'http://localhost:3000',
      tenantId: process.env.TENANT_ID || 'my-company',
      apiKey: process.env.CONNECTORS_API_KEY
    },
    // Semantic query for tool selection
    // Connectors will use semantic routing to find relevant tools
    toolQuery: 'GitHub repository management and pull requests'
  });

  // Step 2: Get tools from semantic selection
  console.log('🔍 Selecting tools with semantic routing...');
  const tools = await toolkit.getTools();
  console.log(`✅ Loaded ${tools.length} tools:`, tools.map(t => t.name).join(', '));
  console.log();

  // Step 3: Create LLM (OpenAI GPT-4)
  console.log('🤖 Creating ChatOpenAI model...');
  const llm = new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY
  });

  // Step 4: Create prompt template
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful assistant that can use tools to accomplish tasks. When using tools, always explain what you are doing and provide clear results.'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}']
  ]);

  // Step 5: Create agent with OpenAI functions
  console.log('🔧 Creating OpenAI Functions Agent...');
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt
  });

  // Step 6: Create executor
  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true, // Enable verbose logging
    maxIterations: 10
  });

  // Step 7: Run example tasks
  console.log('📝 Executing task...\n');
  console.log('Task: Create a new pull request on myrepo/project\n');

  try {
    const result = await executor.invoke({
      input: 'Create a pull request on myrepo/project from branch feature/new-feature to main with title "Add new feature" and description "This PR adds the new feature we discussed"'
    });

    console.log('\n✅ Task completed!');
    console.log('Result:', result.output);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }

  // Example 2: Get repository information
  console.log('\n\n📝 Executing second task...\n');
  console.log('Task: Get information about a repository\n');

  try {
    const result2 = await executor.invoke({
      input: 'Get information about the repository myrepo/project including stars, forks, and open issues'
    });

    console.log('\n✅ Task completed!');
    console.log('Result:', result2.output);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }

  console.log('\n\n🎉 Example completed!');
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
