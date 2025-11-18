# Progressive Loading Architecture

Progressive loading is a key optimization technique that enables Connectors to achieve 99% token reduction by loading tool schemas in three tiers.

## Problem

**Traditional MCP Approach:**
- Load all 368 tools with full schemas
- Each tool: ~200-500 tokens (name, description, parameters, examples)
- Total: ~250,000 tokens
- **Result**: Context window exhausted, slow responses, high costs

**Connectors Solution:**
- Load minimal schemas for most tools
- Load full schemas only when needed
- Progressive detail based on relevance
- **Result**: 1,000-3,000 tokens (99% reduction)

## Three-Tier Loading

```
┌─────────────────────────────────────────┐
│  Tier 1: Essential (5-10 tools)        │
│  - Full schema with examples            │
│  - 200-500 tokens per tool              │
│  - Immediately loaded                   │
│  - Most relevant tools                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Tier 2: Contextual (10-20 tools)      │
│  - Medium schema (no examples)          │
│  - 100-200 tokens per tool              │
│  - Loaded on-demand                     │
│  - Related tools                        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Tier 3: Available (remaining tools)    │
│  - Minimal schema (name + description)  │
│  - 20-50 tokens per tool                │
│  - Lazy loaded when requested           │
│  - Full schema fetched just-in-time     │
└─────────────────────────────────────────┘
```

## Tier Definitions

### Tier 1: Essential Tools (Full Schema)

**What it includes:**
- Tool name and ID
- Full description
- All parameters with types and descriptions
- Parameter validation rules
- Usage examples
- Return value schema

**Token cost:** 200-500 tokens per tool

**When to use:**
- Top 5-10 most relevant tools from semantic selection
- Tools agent is likely to use immediately
- Tools with high semantic similarity score (> 0.9)

**Example:**
```json
{
  "id": "github.createPullRequest",
  "name": "Create Pull Request",
  "description": "Creates a new pull request in a GitHub repository. The PR will be created from the head branch into the base branch. You can specify title, body, reviewers, and labels.",
  "parameters": [
    {
      "name": "repo",
      "type": "string",
      "description": "Repository in format 'owner/repo'",
      "required": true,
      "pattern": "^[\\w-]+/[\\w-]+$"
    },
    {
      "name": "title",
      "type": "string",
      "description": "Pull request title",
      "required": true,
      "minLength": 1,
      "maxLength": 256
    },
    {
      "name": "head",
      "type": "string",
      "description": "Name of the branch containing changes",
      "required": true
    },
    {
      "name": "base",
      "type": "string",
      "description": "Name of the branch to merge into",
      "required": true,
      "default": "main"
    },
    {
      "name": "body",
      "type": "string",
      "description": "Pull request description",
      "required": false
    }
  ],
  "returns": {
    "type": "object",
    "properties": {
      "number": { "type": "number" },
      "url": { "type": "string" },
      "state": { "type": "string" }
    }
  },
  "examples": [
    {
      "description": "Create a simple PR",
      "parameters": {
        "repo": "owner/repo",
        "title": "Add new feature",
        "head": "feature-branch",
        "base": "main"
      }
    }
  ]
}
```

### Tier 2: Contextual Tools (Medium Schema)

**What it includes:**
- Tool name and ID
- Description
- Parameters with types (no validation rules)
- No examples
- No return value schema

**Token cost:** 100-200 tokens per tool

**When to use:**
- Tools 11-30 from semantic selection
- Related tools from GraphRAG
- Tools with medium semantic similarity (0.7-0.9)

**Example:**
```json
{
  "id": "github.mergePullRequest",
  "name": "Merge Pull Request",
  "description": "Merges an approved pull request into the base branch",
  "parameters": [
    {
      "name": "repo",
      "type": "string",
      "description": "Repository in format 'owner/repo'",
      "required": true
    },
    {
      "name": "pull_number",
      "type": "number",
      "description": "Pull request number",
      "required": true
    },
    {
      "name": "merge_method",
      "type": "string",
      "description": "Merge method: merge, squash, or rebase",
      "required": false
    }
  ]
}
```

### Tier 3: Available Tools (Minimal Schema)

**What it includes:**
- Tool name and ID
- Brief description
- Load URL for full schema

**Token cost:** 20-50 tokens per tool

**When to use:**
- All remaining tools (300+ tools)
- Tools available but not immediately relevant
- Full schema loaded just-in-time when invoked

**Example:**
```json
{
  "id": "github.addLabels",
  "name": "Add Labels",
  "description": "Adds labels to a GitHub issue or pull request",
  "loadUrl": "/api/v1/tools/github.addLabels/full"
}
```

## Implementation

### Gateway Implementation

```typescript
// gateway/src/tools/progressive-loader.ts

export class ProgressiveToolLoader {
  async loadTiered(
    selections: ToolSelection[],
    options: LoadOptions
  ): Promise<TieredToolSet> {
    // Tier 1: Top 5-10 tools with full schema
    const tier1Tools = selections
      .slice(0, options.tier1Count || 10)
      .map(s => this.loadFullSchema(s.tool));

    // Tier 2: Next 10-20 tools with medium schema
    const tier2Tools = selections
      .slice(options.tier1Count || 10, options.tier2Count || 30)
      .map(s => this.loadMediumSchema(s.tool));

    // Tier 3: Remaining tools with minimal schema
    const tier3Tools = selections
      .slice(options.tier2Count || 30)
      .map(s => this.loadMinimalSchema(s.tool));

    return {
      tier1: await Promise.all(tier1Tools),
      tier2: await Promise.all(tier2Tools),
      tier3: await Promise.all(tier3Tools),
      totalTokens: this.calculateTokens(tier1Tools, tier2Tools, tier3Tools)
    };
  }

  private async loadFullSchema(tool: Tool): Promise<FullTool> {
    return {
      ...tool,
      parameters: tool.parameters.map(p => ({
        ...p,
        validation: await this.getValidationRules(p),
        examples: await this.getExamples(p)
      })),
      returns: await this.getReturnSchema(tool),
      examples: await this.getToolExamples(tool)
    };
  }

  private async loadMediumSchema(tool: Tool): Promise<MediumTool> {
    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters.map(p => ({
        name: p.name,
        type: p.type,
        description: p.description,
        required: p.required
      }))
    };
  }

  private async loadMinimalSchema(tool: Tool): Promise<MinimalTool> {
    return {
      id: tool.id,
      name: tool.name,
      description: tool.description.substring(0, 100),
      loadUrl: `/api/v1/tools/${tool.id}/full`
    };
  }
}
```

### Just-in-Time Loading

When a Tier 3 tool is invoked, load full schema on-demand:

```typescript
// gateway/src/tools/jit-loader.ts

export class JustInTimeLoader {
  async invokeWithJIT(toolId: string, params: any): Promise<ToolResult> {
    // Check if full schema is cached
    let tool = await this.cache.get(toolId);

    if (!tool) {
      // Load full schema just-in-time
      tool = await this.loadFullSchema(toolId);
      await this.cache.set(toolId, tool, { ttl: 3600 }); // Cache 1 hour
    }

    // Validate parameters against full schema
    const validation = await this.validate(params, tool.parameters);

    if (!validation.valid) {
      throw new ValidationError('Invalid parameters', validation.errors);
    }

    // Invoke tool
    return await this.invoke(toolId, params);
  }
}
```

### SDK Usage

The SDK automatically handles progressive loading:

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });

// Semantic selection returns tiered tools
const result = await connectors.tools.select('create GitHub PR');

// Tools already organized by tier
console.log(`Tier 1 tools: ${result.tier1.length}`); // 5-10 tools
console.log(`Tier 2 tools: ${result.tier2.length}`); // 10-20 tools
console.log(`Tier 3 tools: ${result.tier3.length}`); // Remaining tools
console.log(`Total tokens: ${result.totalTokens}`);  // 1,000-3,000

// When invoking a Tier 3 tool, full schema loaded automatically
const github = connectors.mcp.get('github');
const pr = await github.call('addLabels', { ... }); // JIT loading
```

## Token Calculation

### Example Breakdown

**Query:** "manage GitHub repositories"

**Traditional Approach:**
```
368 tools × 300 tokens (avg) = 110,400 tokens
```

**Progressive Loading:**
```
Tier 1: 5 tools × 400 tokens = 2,000 tokens (full schema)
Tier 2: 10 tools × 150 tokens = 1,500 tokens (medium schema)
Tier 3: 20 tools × 30 tokens = 600 tokens (minimal schema)
Total: 4,100 tokens (96% reduction)
```

**With Semantic Filtering:**
```
Tier 1: 5 relevant tools × 400 = 2,000 tokens
Tier 2: 5 related tools × 150 = 750 tokens
Tier 3: 0 tools (not needed)
Total: 2,750 tokens (97.5% reduction)
```

## Performance Optimization

### Caching Strategy

```typescript
// gateway/src/cache/tool-cache.ts

export class ToolSchemaCache {
  private redis: RedisClient;

  async get(toolId: string, tier: 'full' | 'medium' | 'minimal'): Promise<Tool | null> {
    const key = `tool:${toolId}:${tier}`;
    const cached = await this.redis.get(key);

    if (cached) {
      this.metrics.increment('cache.hit', { tier });
      return JSON.parse(cached);
    }

    this.metrics.increment('cache.miss', { tier });
    return null;
  }

  async set(toolId: string, tier: string, tool: Tool, ttl = 3600): Promise<void> {
    const key = `tool:${toolId}:${tier}`;
    await this.redis.setex(key, ttl, JSON.stringify(tool));
  }
}
```

### Pre-warming

Pre-warm cache for popular tools:

```typescript
// gateway/src/cache/prewarmer.ts

export class ToolCachePrewarmer {
  async prewarm(): Promise<void> {
    // Get top 100 most-used tools
    const popularTools = await this.analytics.getPopularTools(100);

    // Pre-load full schemas
    await Promise.all(
      popularTools.map(async (tool) => {
        const fullSchema = await this.loader.loadFullSchema(tool);
        await this.cache.set(tool.id, 'full', fullSchema);
      })
    );

    console.log(`Pre-warmed ${popularTools.length} tool schemas`);
  }
}

// Run on gateway startup and every 6 hours
scheduler.schedule('0 */6 * * *', () => prewarmer.prewarm());
```

## Monitoring

### Token Usage Metrics

```typescript
// Log token usage per query
logger.info('tool_selection_complete', {
  query,
  tier1_count: tier1.length,
  tier2_count: tier2.length,
  tier3_count: tier3.length,
  total_tokens: totalTokens,
  token_reduction: ((250000 - totalTokens) / 250000 * 100).toFixed(2) + '%'
});
```

### Dashboard Metrics

```
┌─────────────────────────────────────────┐
│  Token Optimization Dashboard           │
├─────────────────────────────────────────┤
│  Avg tokens per query: 2,750            │
│  Token reduction: 98.9%                 │
│  Tier 1 avg tools: 5                    │
│  Tier 2 avg tools: 8                    │
│  Tier 3 avg tools: 2                    │
│  JIT loads today: 234                   │
│  Cache hit rate: 87%                    │
└─────────────────────────────────────────┘
```

## Best Practices

### 1. Tune Tier Sizes

```typescript
// Adjust based on use case
const options = {
  tier1Count: 10,   // More tools for complex queries
  tier2Count: 30,   // Wider context
  tokenBudget: 5000 // Higher budget for GPT-4
};

const tools = await connectors.tools.select(query, options);
```

### 2. Monitor Token Usage

```typescript
const tools = await connectors.tools.select(query);

if (tools.totalTokens > TARGET_TOKENS) {
  console.warn(`Token usage ${tools.totalTokens} exceeds target ${TARGET_TOKENS}`);
  // Reduce tier sizes or filter tools
}
```

### 3. Use JIT Loading

```typescript
// Tier 3 tools automatically use JIT loading
const result = await connectors.tools.invoke('github.addLabels', params);
// Full schema loaded only when needed
```

### 4. Cache Aggressively

```typescript
// Gateway configuration
cache:
  tool_schemas:
    ttl: 3600  # 1 hour
    prewarm: true
    prewarm_count: 100  # Top 100 tools
```

## Comparison

| Approach | Tools Loaded | Avg Tokens | Token Reduction |
|----------|--------------|------------|-----------------|
| Traditional MCP | 368 (all) | 250,000 | 0% |
| Semantic Only | 10-20 | 5,000 | 98% |
| Progressive (no filter) | 368 (tiered) | 15,000 | 94% |
| **Progressive + Semantic** | **35 (tiered)** | **2,750** | **98.9%** |

## Next Steps

- **[Semantic Routing](semantic-routing.md)** - Two-level tool selection
- **[GraphRAG](graphrag.md)** - Relationship discovery
- **[Token Optimization](token-optimization.md)** - Advanced optimization

---

**[← Back to Architecture](./)**
