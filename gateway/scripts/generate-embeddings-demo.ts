/**
 * Demo Embedding Generation Script
 * Demonstrates the embedding generation workflow using mock embeddings
 * Use this for testing when OpenAI API key is not available
 */

import { promises as fs } from 'fs';
import * as path from 'path';
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
  categoryIndexPath: './data/indices/categories.faiss',
  toolIndexPath: './data/indices/tools.faiss',
  categoryDefinitionsPath: './data/category-definitions.json',
  seedToolsPath: './data/seed-tools.json',
  embeddingDimensions: 1536
};

/**
 * Generate mock embedding (deterministic based on text)
 */
function generateMockEmbedding(text: string, dimension: number = 1536): number[] {
  const embedding = new Array(dimension);

  // Use text hash as seed for reproducible "embeddings"
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate deterministic random values
  const seed = Math.abs(hash);
  let random = seed;

  for (let i = 0; i < dimension; i++) {
    // Simple linear congruential generator
    random = (random * 1103515245 + 12345) & 0x7fffffff;
    embedding[i] = (random / 0x7fffffff) * 2 - 1; // Normalize to [-1, 1]
  }

  // Normalize to unit vector
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / norm);
}

/**
 * Main demo function
 */
async function generateDemoEmbeddings(): Promise<void> {
  console.log('🎭 Starting DEMO embedding generation (using mock embeddings)...\n');
  console.log('   Note: This demo uses synthetic embeddings for testing.');
  console.log('   For production, use generate-embeddings-standalone.ts with OpenAI API.\n');

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
    console.log('🔧 Step 3: Generating category embeddings (mock)...');
    const categoryEmbeddings = generateCategoryEmbeddings(categoryDefinitions);
    console.log(`   ✓ Generated ${categoryEmbeddings.length} category embeddings (${CONFIG.embeddingDimensions}-dim)\n`);

    // Step 4: Generate tool embeddings
    console.log('🔧 Step 4: Generating tool embeddings (mock)...');
    const toolEmbeddings = generateToolEmbeddings(tools);
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
    console.log('🔍 Step 8: Testing semantic search (with mock queries)...');
    await testSemanticSearch(CONFIG.categoryIndexPath, CONFIG.toolIndexPath);

    console.log('\n✨ Demo embedding generation completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ┌─────────────────────────────────────────┐');
    console.log(`   │ Categories: ${categoryEmbeddings.length.toString().padEnd(27)} │`);
    console.log(`   │ Tools: ${toolEmbeddings.length.toString().padEnd(32)} │`);
    console.log(`   │ Embedding dimension: ${CONFIG.embeddingDimensions.toString().padEnd(18)} │`);
    console.log(`   │ Model: mock (deterministic)${' '.repeat(13)} │`);
    console.log('   └─────────────────────────────────────────┘');
    console.log('\n📁 Generated files:');
    console.log(`   • ${CONFIG.categoryIndexPath}`);
    console.log(`   • ${CONFIG.categoryIndexPath}.map`);
    console.log(`   • ${CONFIG.toolIndexPath}`);
    console.log(`   • ${CONFIG.toolIndexPath}.map`);
    console.log('\n⚠️  Remember: These are DEMO indices with mock embeddings.');
    console.log('   For production use, run generate-embeddings-standalone.ts with OpenAI API key.');

  } catch (error) {
    console.error('\n❌ Error during demo generation:');
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
 * Generate mock embeddings for all categories
 */
function generateCategoryEmbeddings(categories: CategoryDefinition[]): CategoryEmbedding[] {
  return categories.map(cat => {
    const text = `Category: ${cat.name} - ${cat.description}. Examples: ${cat.examples.join(', ')}`;
    const embedding = generateMockEmbedding(text, CONFIG.embeddingDimensions);

    return {
      category: cat.name,
      embedding,
      toolCount: 0,
      description: cat.description
    };
  });
}

/**
 * Generate mock embeddings for all tools
 */
function generateToolEmbeddings(tools: ToolData[]): ToolEmbedding[] {
  return tools.map(tool => {
    const text = `${tool.category}: ${tool.name} - ${tool.description}`;
    const embedding = generateMockEmbedding(text, CONFIG.embeddingDimensions);

    return {
      toolId: tool.id,
      embedding,
      category: tool.category,
      metadata: {
        name: tool.name,
        description: tool.description,
        usageCount: tool.usageCount || 0
      }
    };
  });
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
 * Test semantic search with mock query embeddings
 */
async function testSemanticSearch(
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
  console.log('   Sample Queries & Results (using mock embeddings):');
  console.log('   ─────────────────────────────────────────────────────────');

  for (const query of testQueries) {
    console.log(`\n   📝 "${query}"`);

    // Generate mock embedding for query
    const queryEmbedding = generateMockEmbedding(query, CONFIG.embeddingDimensions);

    // Search categories
    const categoryResults = await categoryIndex.search(queryEmbedding, 2);
    if (categoryResults.length > 0) {
      console.log(`      Categories: ${categoryResults.map(r => `${r.id} (${r.score.toFixed(3)})`).join(', ')}`);
    }

    // Search tools
    const toolResults = await toolIndex.search(queryEmbedding, 3);
    if (toolResults.length > 0) {
      console.log(`      Tools: ${toolResults.map(r => `${r.id} (${r.score.toFixed(3)})`).join(', ')}`);
    }
  }

  console.log('\n   ─────────────────────────────────────────────────────────');
  console.log('   Note: Results are based on mock embeddings (deterministic hashing).');
  console.log('   Real semantic similarity requires OpenAI embeddings.');
}

/**
 * Entry point
 */
if (require.main === module) {
  generateDemoEmbeddings().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateDemoEmbeddings };
