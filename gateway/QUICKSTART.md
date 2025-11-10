# Semantic Routing - Quick Start Guide

## Installation

```bash
cd /home/user/Connectors/gateway
npm install
```

## Configuration

```bash
cp .env.example .env
# Edit .env with your settings:
# - OPENAI_API_KEY (required for embeddings)
# - REDIS_URL (default: redis://localhost:6379)
```

## Basic Usage

### 1. Initialize Router

```typescript
import { SemanticRouter, EmbeddingService, RedisCache } from './src';

const embeddings = new EmbeddingService({
  model: 'openai',
  dimensions: 1536
});

const cache = new RedisCache();
const router = new SemanticRouter(
  './data/indices/categories.faiss',
  './data/indices/tools.faiss',
  embeddings,
  cache
);

await router.initialize();
```

### 2. Index Your Data

```typescript
// Index categories (10 categories)
await router.indexCategories([
  {
    category: 'code',
    embedding: await embeddings.generateEmbedding('Code tools'),
    toolCount: 50,
    description: 'Code management tools'
  }
  // ... more categories
]);

// Index tools (500 tools)
await router.indexTools([
  {
    toolId: 'github.createPR',
    embedding: await embeddings.generateEmbedding('Create GitHub PR'),
    category: 'code',
    metadata: {
      name: 'Create Pull Request',
      description: 'Create a new PR',
      usageCount: 1000
    }
  }
  // ... more tools
]);
```

### 3. Query Tools

```typescript
// Simple query
const tools = await router.selectTools('create a pull request');

// With constraints
const tools = await router.selectTools('deploy app', {
  tokenBudget: 2000,
  allowedCategories: ['cloud', 'devops']
});

// With progressive loading
const tiered = await router.selectToolsWithTiers('send message', {
  tokenBudget: 1500
});
console.log('Tier 1:', tiered.tier1.length);
console.log('Tier 2:', tiered.tier2.length);
console.log('Tier 3:', tiered.tier3.length);
console.log('Tokens:', tiered.totalTokens);
console.log('Reduction:', tiered.reductionPercentage.toFixed(1) + '%');
```

## Development

```bash
# Run tests
npm test

# Watch tests
npm run test:watch

# Build
npm run build

# Lint
npm run lint
```

## Performance Tuning

### Adjust Token Budget

```typescript
const tools = await router.selectTools(query, {
  tokenBudget: 3000  // Increase for more tools
});
```

### Adjust Similarity Thresholds

Edit `src/routing/semantic-router.ts`:

```typescript
const CATEGORY_THRESHOLD = 0.7;  // Lower = more categories
const TOOL_THRESHOLD = 0.5;      // Lower = more tools
```

### Adjust Progressive Loading

Edit `src/optimization/progressive-loader.ts`:

```typescript
const TIER1_MAX_TOOLS = 3;  // Essential tools
const TIER2_MAX_TOOLS = 5;  // Contextual tools
```

## Monitoring

Check logs for performance:

```bash
tail -f logs/combined.log | grep tool_selection_performance
```

Key metrics:
- `faiss_latency_ms`: FAISS search time
- `total_latency_ms`: End-to-end time
- `token_cost`: Tokens used
- `token_reduction_pct`: Reduction vs full load

## Troubleshooting

### Slow queries (>100ms)

1. Check Redis connection
2. Rebuild FAISS indices
3. Use IVFFlat for >1000 tools

### High token usage

1. Reduce `MAX_TOOLS_PER_QUERY`
2. Lower `TIER2_MAX_TOOLS`
3. Increase `CATEGORY_THRESHOLD`

### Low accuracy

1. Improve embedding quality
2. Add more training data
3. Tune similarity thresholds

## Architecture

```
Query → Embedding → [Category FAISS] → Categories
                          ↓
                   [Tool FAISS] → Tools
                          ↓
                   Token Optimizer
                          ↓
              Progressive Loader → Tiered Results
```

## Expected Performance

- Latency: 80ms (500 tools)
- Token reduction: 99%+
- Cache hit rate: 80%+
- Accuracy: +19.4% vs flat search

## Next Steps

1. Integrate with GraphRAG (Neo4j)
2. Add OAuth proxy (Vault)
3. Deploy to Kubernetes
4. Monitor with Prometheus

For detailed documentation, see:
- `/home/user/Connectors/docs/semantic-routing-implementation.md`
- `/home/user/Connectors/docs/SEMANTIC_ROUTING_SUMMARY.md`
