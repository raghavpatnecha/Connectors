/**
 * Embedding Generation Script
 * Generates FAISS embeddings for categories and tools to enable semantic routing
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { EmbeddingService } from '../src/routing/embedding-service';
import { FAISSIndex } from '../src/routing/faiss-index';
import { GraphRAGService } from '../src/graph/graphrag-service';
import { CategoryEmbedding, ToolEmbedding } from '../src/types/routing.types';
import { logger } from '../src/logging/logger';

// Category definition interface
interface CategoryDefinition {
  name: string;
  displayName: string;
  description: string;
  examples: string[];
}

// Configuration
const CONFIG = {
  categoryIndexPath: process.env.CATEGORY_INDEX_PATH || './data/indices/categories.faiss',
  toolIndexPath: process.env.TOOL_INDEX_PATH || './data/indices/tools.faiss',
  categoryDefinitionsPath: './data/category-definitions.json',
  embeddingDimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1536', 10),
  openaiModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
};

/**
 * Main embedding generation function
 */
async function generateEmbeddings(): Promise<void> {
  console.log('🚀 Starting embedding generation...\n');

  // Initialize services
  const embeddingService = new EmbeddingService({
    model: 'openai',
    openaiModel: CONFIG.openaiModel,
    dimensions: CONFIG.embeddingDimensions,
    batchSize: 100
  });

  const graphRAG = new GraphRAGService();

  try {
    // Step 1: Load category definitions
    console.log('📂 Step 1: Loading category definitions...');
    const categoryDefinitions = await loadCategoryDefinitions();
    console.log(`   ✓ Loaded ${categoryDefinitions.length} categories\n`);

    // Step 2: Fetch tools from Neo4j
    console.log('📊 Step 2: Fetching tools from Neo4j...');
    const stats = await graphRAG.getGraphStats();
    const tools = stats.topTools || [];
    console.log(`   ✓ Found ${tools.length} tools in graph database`);
    console.log(`   ✓ Total tools in DB: ${stats.totalTools}`);
    console.log(`   ✓ Total categories: ${stats.totalCategories}\n`);

    // Step 3: Generate category embeddings
    console.log('🔧 Step 3: Generating category embeddings...');
    const categoryEmbeddings = await generateCategoryEmbeddings(
      embeddingService,
      categoryDefinitions
    );
    console.log(`   ✓ Generated ${categoryEmbeddings.length} category embeddings\n`);

    // Step 4: Generate tool embeddings
    console.log('🔧 Step 4: Generating tool embeddings...');
    const toolEmbeddings = await generateToolEmbeddings(
      embeddingService,
      tools
    );
    console.log(`   ✓ Generated ${toolEmbeddings.length} tool embeddings\n`);

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
    console.log(`   • Categories: ${categoryEmbeddings.length} embeddings`);
    console.log(`   • Tools: ${toolEmbeddings.length} embeddings`);
    console.log(`   • Embedding dimension: ${CONFIG.embeddingDimensions}`);
    console.log(`   • Model: ${CONFIG.openaiModel}`);

  } catch (error) {
    console.error('\n❌ Error during embedding generation:');
    console.error(error);
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

  console.log('   → Generating embeddings (this may take a moment)...');
  const embeddings = await embeddingService.generateEmbeddings(categoryTexts);

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
  tools: Array<{ id: string; name: string; description: string; category: string; usageCount: number }>
): Promise<ToolEmbedding[]> {
  const toolTexts = tools.map(tool =>
    embeddingService.createToolEmbeddingText({
      name: tool.name,
      description: tool.description,
      category: tool.category
    })
  );

  console.log('   → Generating embeddings (this may take a moment)...');
  const embeddings = await embeddingService.generateEmbeddings(toolTexts);

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

  console.log(`   → Category index size: ${index.size} vectors`);
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

  console.log(`   → Tool index size: ${index.size} vectors`);
}

/**
 * Verify that indices were created correctly
 */
async function verifyIndices(categoryIndexPath: string, toolIndexPath: string): Promise<void> {
  // Check file existence
  await fs.access(categoryIndexPath);
  await fs.access(toolIndexPath);

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
  for (const query of testQueries) {
    console.log(`   📝 Query: "${query}"`);

    // Search categories
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    const categoryResults = await categoryIndex.search(queryEmbedding, 2, 0.5);

    console.log(`      Categories: ${categoryResults.map(r => `${r.id} (${r.score.toFixed(3)})`).join(', ')}`);

    // Search tools
    const toolResults = await toolIndex.search(queryEmbedding, 3, 0.5);
    console.log(`      Tools: ${toolResults.map(r => `${r.id} (${r.score.toFixed(3)})`).join(', ')}`);
    console.log('');
  }
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
