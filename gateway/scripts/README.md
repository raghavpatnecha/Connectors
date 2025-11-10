# Embedding Generation Scripts

This directory contains scripts for generating FAISS embeddings for semantic routing.

## Scripts

### `generate-embeddings-standalone.ts`

Standalone script that generates FAISS embeddings for categories and tools without requiring Neo4j.

**Features:**
- ✅ No database dependencies (uses JSON seed data)
- ✅ OpenAI API integration for high-quality embeddings
- ✅ FAISS index generation with L2 distance metric
- ✅ Automatic verification and testing
- ✅ Detailed progress logging

**Requirements:**
- Node.js 18+
- OpenAI API key
- `npm install` completed in gateway directory

**Usage:**

```bash
# 1. Set OpenAI API key
export OPENAI_API_KEY="sk-..."

# 2. Run the script from gateway root
cd /home/user/Connectors/gateway
npm run build  # Compile TypeScript first
npx ts-node scripts/generate-embeddings-standalone.ts

# Or run directly with ts-node
npx ts-node scripts/generate-embeddings-standalone.ts
```

**Output:**
- `data/indices/categories.faiss` - Category embeddings index
- `data/indices/categories.faiss.map` - Category ID mapping
- `data/indices/tools.faiss` - Tool embeddings index
- `data/indices/tools.faiss.map` - Tool ID mapping

**Configuration:**

Environment variables (optional):
```bash
CATEGORY_INDEX_PATH=./data/indices/categories.faiss
TOOL_INDEX_PATH=./data/indices/tools.faiss
EMBEDDING_DIMENSIONS=1536
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

## Data Files

### `data/category-definitions.json`

Category metadata with descriptions and examples for embedding generation.

**Structure:**
```json
{
  "name": "category-id",
  "displayName": "Human Readable Name",
  "description": "Detailed description for embedding",
  "examples": ["example 1", "example 2"]
}
```

### `data/seed-tools.json`

Seed tools for initial index generation (18 tools across 5 categories).

**Categories:**
- **code** (8 tools): GitHub, GitLab integrations
- **communication** (3 tools): Slack, Teams
- **project-management** (3 tools): Jira, Linear
- **cloud** (2 tools): AWS Lambda, S3
- **data** (2 tools): PostgreSQL, MongoDB

## Testing

The script automatically runs test queries after generation:

- ✅ "create a pull request on GitHub"
- ✅ "send a message to the team"
- ✅ "update the Jira ticket status"
- ✅ "deploy the application to AWS"
- ✅ "query the customer database"

Expected results:
- Categories matched with similarity scores
- Top 3 tools matched per query
- Scores above 0.5 threshold

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is required"

**Solution:** Set your OpenAI API key:
```bash
export OPENAI_API_KEY="sk-your-key-here"
```

### Error: "Cannot find module 'faiss-node'"

**Solution:** Install dependencies:
```bash
cd /home/user/Connectors/gateway
npm install
```

### Error: "Module build failed" or TypeScript errors

**Solution:** Rebuild TypeScript:
```bash
npm run clean
npm run build
```

### Index file sizes seem wrong

**Expected sizes:**
- Category index: ~30-40 KB (5 categories × 1536 dimensions)
- Tool index: ~100-150 KB (18 tools × 1536 dimensions)

## Next Steps

After generating embeddings:

1. **Load indices in SemanticRouter:**
   ```typescript
   const router = new SemanticRouter({
     categoryIndexPath: './data/indices/categories.faiss',
     toolIndexPath: './data/indices/tools.faiss'
   });
   ```

2. **Test semantic routing:**
   ```bash
   npm test -- src/routing/semantic-router.test.ts
   ```

3. **Start gateway with indices:**
   ```bash
   npm run dev
   ```

## Performance Metrics

**Target performance:**
- Embedding generation: ~2-5 seconds per batch (OpenAI API)
- Index building: <1 second (in-memory operations)
- Search latency: <10ms per query (FAISS L2 search)

**Token reduction:**
- Traditional approach: ~250K tokens (all tool schemas)
- Semantic routing: ~1-3K tokens (selected tools only)
- **Reduction: 95%+**
