/**
 * Advanced LangChain agent executor example with multiple integrations
 *
 * This example demonstrates:
 * 1. Loading tools from multiple integrations
 * 2. Using initializeAgentExecutorWithOptions for quick setup
 * 3. Complex multi-step tasks across integrations
 * 4. Error handling and retries
 */

import { ConnectorsToolkit } from '@connectors/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

async function main() {
  console.log('🚀 Starting Advanced Agent Executor example...\n');

  // Step 1: Create ConnectorsToolkit with multiple integrations
  console.log('📦 Creating ConnectorsToolkit with multiple integrations...');
  const toolkit = new ConnectorsToolkit({
    connectors: {
      baseURL: process.env.CONNECTORS_URL || 'http://localhost:3000',
      tenantId: process.env.TENANT_ID || 'my-company',
      apiKey: process.env.CONNECTORS_API_KEY
    },
    // Load tools from multiple integrations
    integrations: ['github', 'slack', 'jira']
  });

  // Step 2: Get all tools from specified integrations
  console.log('🔍 Loading tools from integrations...');
  const tools = await toolkit.getTools();
  console.log(`✅ Loaded ${tools.length} tools from GitHub, Slack, and Jira`);

  // Display tool breakdown
  const toolsByIntegration = tools.reduce((acc, tool) => {
    const integration = tool.name.split('_')[0];
    acc[integration] = (acc[integration] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Tool breakdown:');
  Object.entries(toolsByIntegration).forEach(([integration, count]) => {
    console.log(`   - ${integration}: ${count} tools`);
  });
  console.log();

  // Step 3: Create LLM
  console.log('🤖 Creating ChatOpenAI model...');
  const llm = new ChatOpenAI({
    modelName: 'gpt-4-turbo-preview',
    temperature: 0,
    apiKey: process.env.OPENAI_API_KEY
  });

  // Step 4: Initialize agent executor with options
  console.log('🔧 Initializing agent executor...');
  const executor = await initializeAgentExecutorWithOptions(tools, llm, {
    agentType: 'openai-functions',
    verbose: true,
    maxIterations: 15,
    returnIntermediateSteps: true
  });

  // Example 1: Complex multi-step task
  console.log('\n📝 Executing complex multi-step task...\n');
  console.log('Task: Create a PR and notify the team on Slack\n');

  try {
    const result = await executor.invoke({
      input: `
        Please do the following:
        1. Create a pull request on myrepo/project from branch feature/authentication to main
           Title: "Add authentication system"
           Description: "This PR implements JWT-based authentication with role-based access control"
        2. Post a message to #engineering channel on Slack announcing the PR
           Message: "🎉 New PR ready for review: Add authentication system - [PR link]"
      `
    });

    console.log('\n✅ Multi-step task completed!');
    console.log('Final output:', result.output);

    if (result.intermediateSteps) {
      console.log('\n📋 Intermediate steps:');
      result.intermediateSteps.forEach((step: any, index: number) => {
        console.log(`   ${index + 1}. ${step.action.tool}: ${step.action.toolInput}`);
        console.log(`      Result: ${JSON.stringify(step.observation).substring(0, 100)}...`);
      });
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }

  // Example 2: Cross-integration workflow
  console.log('\n\n📝 Executing cross-integration workflow...\n');
  console.log('Task: Create Jira ticket and link to GitHub issue\n');

  try {
    const result2 = await executor.invoke({
      input: `
        Create a coordinated workflow:
        1. Create a GitHub issue in myrepo/project:
           Title: "Implement user profile page"
           Body: "We need a user profile page with avatar, bio, and activity feed"
           Labels: ["feature", "frontend"]
        2. Create a Jira ticket in PROJECT-123:
           Summary: "Frontend: User profile page"
           Description: "Implement user profile page (linked to GitHub issue)"
           Type: "Story"
           Priority: "Medium"
        3. Post to #product-updates on Slack about the new feature
      `
    });

    console.log('\n✅ Cross-integration workflow completed!');
    console.log('Result:', result2.output);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }

  // Example 3: Using semantic filtering
  console.log('\n\n📝 Demonstrating semantic tool filtering...\n');

  // Create a new toolkit with semantic query
  const semanticToolkit = new ConnectorsToolkit({
    connectors: {
      baseURL: process.env.CONNECTORS_URL || 'http://localhost:3000',
      tenantId: process.env.TENANT_ID || 'my-company',
      apiKey: process.env.CONNECTORS_API_KEY
    },
    toolQuery: 'code review and pull request management'
  });

  const semanticTools = await semanticToolkit.getTools();
  console.log(`🔍 Semantic query selected ${semanticTools.length} relevant tools:`);
  semanticTools.forEach(tool => {
    console.log(`   - ${tool.name}: ${tool.description}`);
  });

  // Use semantic tools for focused task
  const semanticExecutor = await initializeAgentExecutorWithOptions(semanticTools, llm, {
    agentType: 'openai-functions',
    verbose: false
  });

  try {
    const result3 = await semanticExecutor.invoke({
      input: 'Review the open pull requests in myrepo/project and summarize their status'
    });

    console.log('\n✅ Semantic task completed!');
    console.log('Summary:', result3.output);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }

  // Display toolkit metadata
  console.log('\n\n📊 Toolkit Metadata:');
  const metadata = toolkit.getMetadata();
  console.log(JSON.stringify(metadata, null, 2));

  console.log('\n\n🎉 Advanced example completed!');
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
