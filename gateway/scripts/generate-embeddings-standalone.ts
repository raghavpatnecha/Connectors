/**
 * Standalone Embedding Generation Script
 * Generates FAISS embeddings for categories and tools without requiring Neo4j
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { EmbeddingService } from '../src/routing/embedding-service';
import { FAISSIndex } from '../src/routing/faiss-index';
import { CategoryEmbedding, ToolEmbedding } from '../src/types/routing.types';

// Category definition interface
interface CategoryDefinition {
  name: string;
  displayName: string;
  description: string;
  examples: string[];
}

// Tool interface
interface ToolData {
  id: string;
  name: string;
  category: string;
  description: string;
  usageCount: number;
}

// Configuration
const CONFIG = {
  categoryIndexPath: process.env.CATEGORY_INDEX_PATH || './data/indices/categories.faiss',
  toolIndexPath: process.env.TOOL_INDEX_PATH || './data/indices/tools.faiss',
  categoryDefinitionsPath: './data/category-definitions.json',
  seedToolsPath: './data/seed-tools.json',
  embeddingDimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10),
  openaiModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
};

/**
 * Main embedding generation function
 */
async function generateEmbeddings(): Promise<void> {
  console.log('🚀 Starting standalone embedding generation...\n');

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required');
    console.error('   Please set your OpenAI API key:');
    console.error('   export OPENAI_API_KEY="sk-..."');
    process.exit(1);
  }

  // Initialize embedding service
  const embeddingService = new EmbeddingService({
    model: 'openai',
    openaiModel: CONFIG.openaiModel,
    dimensions: CONFIG.embeddingDimensions,
    batchSize: 100
  });

  try {
    // Step 1: Load category definitions
    console.log('📂 Step 1: Loading category definitions...');
    const categoryDefinitions = await loadCategoryDefinitions();
    console.log(`   ✓ Loaded ${categoryDefinitions.length} categories\n`);

    // Step 2: Load seed tools
    console.log('📊 Step 2: Loading seed tools...');
    const tools = await loadSeedTools();
    console.log(`   ✓ Loaded ${tools.length} tools from seed data`);

    // Count tools per category
    const categoryCounts = tools.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('   Tool distribution by category:');
    for (const [category, count] of Object.entries(categoryCounts)) {
      console.log(`     • ${category}: ${count} tools`);
    }
    console.log('');

    // Step 3: Generate category embeddings
    console.log('🔧 Step 3: Generating category embeddings...');
    const categoryEmbeddings = await generateCategoryEmbeddings(
      embeddingService,
      categoryDefinitions
    );
    console.log(`   ✓ Generated ${categoryEmbeddings.length} category embeddings (${CONFIG.embeddingDimensions}-dim)\n`);

    // Step 4: Generate tool embeddings
    console.log('🔧 Step 4: Generating tool embeddings...');
    const toolEmbeddings = await generateToolEmbeddings(
      embeddingService,
      tools
    );
    console.log(`   ✓ Generated ${toolEmbeddings.length} tool embeddings (${CONFIG.embeddingDimensions}-dim)\n`);

    // Step 5: Build and save category FAISS index
    console.log('💾 Step 5: Building category FAISS index...');
    await buildCategoryIndex(categoryEmbeddings, CONFIG.categoryIndexPath);
    console.log(`   ✓ Category index saved to ${CONFIG.categoryIndexPath}\n`);

    // Step 6: Build and save tool FAISS index
    console.log('💾 Step 6: Building tool FAISS index...');
    await buildToolIndex(toolEmbeddings, CONFIG.toolIndexPath);
    console.log(`   ✓ Tool index saved to ${CONFIG.toolIndexPath}\n`);

    // Step 7: Verify indices
    console.log('✅ Step 7: Verifying indices...');
    await verifyIndices(CONFIG.categoryIndexPath, CONFIG.toolIndexPath);
    console.log('   ✓ Indices verified successfully\n');

    // Step 8: Test semantic search
    console.log('🔍 Step 8: Testing semantic search...');
    await testSemanticSearch(
      embeddingService,
      CONFIG.categoryIndexPath,
      CONFIG.toolIndexPath
    );

    console.log('\n✨ Embedding generation completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log(`   │ Categories: ${categoryEmbeddings.length.toString().padEnd(27)} │`);
    console.log(`   │ Tools: ${toolEmbeddings.length.toString().padEnd(32)} │`);
    console.log(`   │ Embedding dimension: ${CONFIG.embeddingDimensions.toString().padEnd(18)} │`);
    console.log(`   │ Model: ${CONFIG.openaiModel.padEnd(32)} │`);
    console.log('   └─────────────────────────────────────────┘');
    console.log('\n📁 Generated files:');
    console.log(`   • ${CONFIG.categoryIndexPath}`);
    console.log(`   • ${CONFIG.categoryIndexPath}.map`);
    console.log(`   • ${CONFIG.toolIndexPath}`);
    console.log(`   • ${CONFIG.toolIndexPath}.map`);

  } catch (error) {
    console.error('\n❌ Error during embedding generation:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error('\n   Stack trace:');
        console.error(error.stack.split('\n').slice(1, 4).join('\n'));
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Load category definitions from JSON file
 */
async function loadCategoryDefinitions(): Promise<CategoryDefinition[]> {
  const filePath = path.resolve(CONFIG.categoryDefinitionsPath);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load seed tools from JSON file
 */
async function loadSeedTools(): Promise<ToolData[]> {
  const filePath = path.resolve(CONFIG.seedToolsPath);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Generate embeddings for all categories
 */
async function generateCategoryEmbeddings(
  embeddingService: EmbeddingService,
  categories: CategoryDefinition[]
): Promise<CategoryEmbedding[]> {
  const categoryTexts = categories.map(cat =>
    embeddingService.createCategoryEmbeddingText({
      name: cat.name,
      description: cat.description,
      examples: cat.examples
    })
  );

  console.log('   → Calling OpenAI API for embeddings...');
  const startTime = Date.now();
  const embeddings = await embeddingService.generateEmbeddings(categoryTexts);
  const duration = Date.now() - startTime;
  console.log(`   → Completed in ${duration}ms (${(duration / categoryTexts.length).toFixed(0)}ms per category)`);

  return categories.map((cat, idx) => ({
    category: cat.name,
    embedding: embeddings[idx],
    toolCount: 0, // Will be updated later
    description: cat.description
  }));
}

/**
 * Generate embeddings for all tools
 */
async function generateToolEmbeddings(
  embeddingService: EmbeddingService,
  tools: ToolData[]
): Promise<ToolEmbedding[]> {
  const toolTexts = tools.map(tool =>
    embeddingService.createToolEmbeddingText({
      name: tool.name,
      description: tool.description,
      category: tool.category
    })
  );

  console.log('   → Calling OpenAI API for embeddings...');
  const startTime = Date.now();
  const embeddings = await embeddingService.generateEmbeddings(toolTexts);
  const duration = Date.now() - startTime;
  console.log(`   → Completed in ${duration}ms (${(duration / toolTexts.length).toFixed(0)}ms per tool)`);

  return tools.map((tool, idx) => ({
    toolId: tool.id,
    embedding: embeddings[idx],
    category: tool.category,
    metadata: {
      name: tool.name,
      description: tool.description,
      usageCount: tool.usageCount || 0
    }
  }));
}

/**
 * Build and save category FAISS index
 */
async function buildCategoryIndex(
  categoryEmbeddings: CategoryEmbedding[],
  indexPath: string
): Promise<void> {
  const index = new FAISSIndex({
    indexPath,
    dimension: CONFIG.embeddingDimensions,
    indexType: 'Flat'
  });

  await index.initialize();

  const embeddings = categoryEmbeddings.map(c => c.embedding);
  const ids = categoryEmbeddings.map(c => c.category);

  await index.add(embeddings, ids);
  await index.save();

  console.log(`   → Index size: ${index.size} vectors`);
  console.log(`   → Dimension: ${index.dimension}`);
}

/**
 * Build and save tool FAISS index
 */
async function buildToolIndex(
  toolEmbeddings: ToolEmbedding[],
  indexPath: string
): Promise<void> {
  const index = new FAISSIndex({
    indexPath,
    dimension: CONFIG.embeddingDimensions,
    indexType: 'Flat'
  });

  await index.initialize();

  const embeddings = toolEmbeddings.map(t => t.embedding);
  const ids = toolEmbeddings.map(t => t.toolId);

  await index.add(embeddings, ids);
  await index.save();

  console.log(`   → Index size: ${index.size} vectors`);
  console.log(`   → Dimension: ${index.dimension}`);
}

/**
 * Verify that indices were created correctly
 */
async function verifyIndices(categoryIndexPath: string, toolIndexPath: string): Promise<void> {
  // Check file existence
  await fs.access(categoryIndexPath);
  await fs.access(toolIndexPath);
  await fs.access(`${categoryIndexPath}.map`);
  await fs.access(`${toolIndexPath}.map`);

  // Check file sizes
  const categoryStats = await fs.stat(categoryIndexPath);
  const toolStats = await fs.stat(toolIndexPath);

  console.log(`   → Category index: ${(categoryStats.size / 1024).toFixed(2)} KB`);
  console.log(`   → Tool index: ${(toolStats.size / 1024).toFixed(2)} KB`);

  // Verify indices can be loaded
  const categoryIndex = new FAISSIndex({
    indexPath: categoryIndexPath,
    dimension: CONFIG.embeddingDimensions,
    indexType: 'Flat'
  });

  const toolIndex = new FAISSIndex({
    indexPath: toolIndexPath,
    dimension: CONFIG.embeddingDimensions,
    indexType: 'Flat'
  });

  await categoryIndex.initialize();
  await toolIndex.initialize();

  console.log(`   → Category index loaded: ${categoryIndex.size} vectors`);
  console.log(`   → Tool index loaded: ${toolIndex.size} vectors`);
}

/**
 * Test semantic search with sample queries
 */
async function testSemanticSearch(
  embeddingService: EmbeddingService,
  categoryIndexPath: string,
  toolIndexPath: string
): Promise<void> {
  const testQueries = [
    'create a pull request on GitHub',
    'send a message to the team',
    'update the Jira ticket status',
    'deploy the application to AWS',
    'query the customer database'
  ];

  // Load indices
  const categoryIndex = new FAISSIndex({
    indexPath: categoryIndexPath,
    dimension: CONFIG.embeddingDimensions,
    indexType: 'Flat'
  });

  const toolIndex = new FAISSIndex({
    indexPath: toolIndexPath,
    dimension: CONFIG.embeddingDimensions,
    indexType: 'Flat'
  });

  await categoryIndex.initialize();
  await toolIndex.initialize();

  console.log('');
  console.log('   Sample Queries & Results:');
  console.log('   ─────────────────────────────────────────────────────────');

  for (const query of testQueries) {
    console.log(`\n   📝 "${query}"`);

    // Search categories
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    const categoryResults = await categoryIndex.search(queryEmbedding, 2, 0.5);

    if (categoryResults.length > 0) {
      console.log(`      Categories: ${categoryResults.map(r => `${r.id} (${r.score.toFixed(3)})`).join(', ')}`);
    } else {
      console.log('      Categories: No matches above threshold');
    }

    // Search tools
    const toolResults = await toolIndex.search(queryEmbedding, 3, 0.5);
    if (toolResults.length > 0) {
      console.log(`      Tools: ${toolResults.map(r => `${r.id} (${r.score.toFixed(3)})`).join(', ')}`);
    } else {
      console.log('      Tools: No matches above threshold');
    }
  }

  console.log('\n   ─────────────────────────────────────────────────────────');
}

/**
 * Entry point
 */
if (require.main === module) {
  generateEmbeddings().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateEmbeddings };
