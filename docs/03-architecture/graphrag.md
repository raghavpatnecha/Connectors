# GraphRAG Architecture

## Overview

GraphRAG (Graph Retrieval-Augmented Generation) enhances semantic tool selection by discovering related tools through a Neo4j knowledge graph. This captures relationships like "often used with", "depends on", and "alternative to".

## Core Concept

**Problem:** Semantic search alone misses important relationships
- Creating a PR often requires authentication first
- Merging a PR is commonly followed by creating a Jira ticket
- GitLab MR is an alternative to GitHub PR

**Solution:** Use graph database to model and traverse tool relationships, adding 2-3 related tools to semantic search results

## Graph Schema

### Nodes

```cypher
(:Tool {
  id: string,           // "github.createPullRequest"
  name: string,         // "Create Pull Request"
  category: string,     // "code"
  description: string,
  usageCount: integer   // 850 (for popularity ranking)
})

(:Category {
  name: string,
  description: string
})
```

### Relationships

```cypher
// Frequently used together
(:Tool)-[:OFTEN_USED_WITH {
  confidence: float,    // 0.92 (co-occurrence probability)
  coOccurrences: int    // 157 (times used together)
}]->(:Tool)

// Tool A requires Tool B
(:Tool)-[:DEPENDS_ON {
  required: boolean     // true (must include)
}]->(:Tool)

// Category membership
(:Tool)-[:BELONGS_TO]->(:Category)

// Interchangeable tools
(:Tool)-[:ALTERNATIVE_TO {
  confidence: float,
  reason: string
}]->(:Tool)

// Sequential workflow
(:Tool)-[:PRECEDES {
  confidence: float,
  avgTimeBetween: int   // seconds
}]->(:Tool)

// Version replacement
(:Tool)-[:REPLACES {
  version: string,
  deprecatedAt: datetime
}]->(:Tool)
```

## Enhancement Algorithm

```
Semantic Router Results: [github.createPullRequest]
    │
    └─> GraphRAG Enhancement
            │
            ├─> 1. Find Dependencies (DEPENDS_ON)
            │       └─> github.authenticate (required: true)
            │
            ├─> 2. Find Workflows (OFTEN_USED_WITH)
            │       ├─> github.mergePullRequest (0.92)
            │       └─> jira.createIssue (0.72)
            │
            ├─> 3. Calculate Path Confidence
            │       • 1-hop: Use edge confidence
            │       • 2-hop: product(confidences) / 2
            │
            ├─> 4. Filter & Rank
            │       • Min confidence: 0.5
            │       • Max related: 3
            │       • Sort: confidence DESC, usage DESC
            │
            └─> Result:
                    • github.authenticate (required)
                    • github.mergePullRequest (0.92)
                    • jira.createIssue (0.72)
```

## Relationship Discovery Query

```cypher
// Find related tools via relationships (2-hop max)
MATCH (t:Tool)-[r:OFTEN_USED_WITH|DEPENDS_ON*1..2]-(related:Tool)
WHERE t.id IN $toolIds
  AND related.category IN $allowedCategories
  AND related.id NOT IN $toolIds

// Calculate path confidence
WITH related,
     REDUCE(conf = 1.0, rel IN relationships(path) |
       conf * rel.confidence
     ) / SIZE(relationships(path)) AS pathConfidence

WHERE pathConfidence >= $minConfidence
RETURN DISTINCT related, pathConfidence
ORDER BY pathConfidence DESC, related.usageCount DESC
LIMIT $maxRelatedTools
```

## Components

### GraphRAGService

**Location:** `/home/user/Connectors/gateway/src/graph/graphrag-service.ts`

**Key Methods:**
```typescript
enhanceWithRelationships(tools, context) // Add related tools
updateToolUsage(toolId, increment)       // Track usage
getGraphStats()                          // Graph statistics
findAlternatives(toolId, context)        // Find tool alternatives
```

## Relationship Types

### OFTEN_USED_WITH

Tools frequently used together in workflows

**Example:**
```cypher
(github.createPullRequest)-[:OFTEN_USED_WITH {
  confidence: 0.92,
  coOccurrences: 157
}]->(github.mergePullRequest)
```

**Use Case:** Suggest merge after creating PR

**Learning:** Auto-update from usage logs:
```
confidence = coOccurrences / max(toolA.usage, toolB.usage)
```

### DEPENDS_ON

Tool A requires Tool B to function

**Example:**
```cypher
(github.createPullRequest)-[:DEPENDS_ON {
  required: true
}]->(github.authenticate)
```

**Use Case:** Auto-include authentication when PR creation selected

### ALTERNATIVE_TO

Similar functionality for different platforms

**Example:**
```cypher
(github.createPullRequest)-[:ALTERNATIVE_TO {
  confidence: 0.90,
  reason: "GitLab equivalent"
}]->(gitlab.createMergeRequest)
```

**Use Case:** Suggest GitLab when GitHub unavailable

### PRECEDES

Tool A typically used before Tool B

**Example:**
```cypher
(github.createBranch)-[:PRECEDES {
  confidence: 0.93,
  avgTimeBetween: 3600  // 1 hour
}]->(github.createPullRequest)
```

**Use Case:** Suggest PR creation after branch created

### REPLACES

Tool A supersedes Tool B (version upgrade)

**Example:**
```cypher
(github.v2.createPR)-[:REPLACES {
  version: "v2",
  deprecatedAt: "2024-01-01"
}]->(github.v1.createPR)
```

**Use Case:** Warn about deprecated tools

## Integration with Semantic Router

```typescript
async selectTools(query: string, context: QueryContext): Promise<Tool[]> {
  // Step 1: Semantic search (FAISS)
  const semanticTools = await this._performSemanticSearch(query, context);

  // Step 2: GraphRAG enhancement (Neo4j)
  const enhanced = await this._graphRAG.enhanceWithRelationships(
    semanticTools,
    {
      allowedCategories: context.allowedCategories,
      maxRelatedTools: 3,
      minConfidence: 0.5
    }
  );

  // Step 3: Token optimization
  return this._tokenOptimizer.optimize(enhanced, context.tokenBudget);
}
```

## Seed Data Example

```cypher
// GitHub tools with relationships
(github.createPullRequest)-[:DEPENDS_ON]->(github.authenticate)
(github.createPullRequest)-[:OFTEN_USED_WITH {confidence: 0.92}]->(github.mergePullRequest)
(github.mergePullRequest)-[:OFTEN_USED_WITH {confidence: 0.72}]->(jira.createIssue)
(github.createBranch)-[:PRECEDES {confidence: 0.93}]->(github.createPullRequest)

// Alternatives
(github.createPullRequest)-[:ALTERNATIVE_TO {confidence: 0.90}]->(gitlab.createMergeRequest)
(slack.sendMessage)-[:ALTERNATIVE_TO {confidence: 0.75}]->(teams.sendMessage)
```

## Performance

**Latency Targets:**

| Operation | Target | Typical |
|-----------|--------|---------|
| Enhancement (2-hop) | <50ms | 18ms |
| Update Usage | <10ms | 5ms |
| Find Alternatives | <30ms | 12ms |

**Optimization:**
- Connection pooling (50 max)
- Query indexes on `id`, `category`, `usageCount`
- Limit traversal depth to 2 hops

## Monitoring

```typescript
logger.info('graphrag_enhancement', {
  inputTools: 5,
  relatedToolsFound: 12,
  relatedToolsAdded: 3,
  traversalDepth: 2,
  latencyMs: 18,
  avgConfidence: 0.76
});
```

## Future Enhancements

**Machine Learning:**
- Auto-discover relationships from usage logs
- Predict tool sequences using temporal patterns
- Personalized recommendations per tenant

**Advanced Relationships:**
- `MUTUALLY_EXCLUSIVE`: Tools that conflict
- `OPTIMIZES`: Tool A improves Tool B
- `VALIDATES`: Tool A checks Tool B

**Graph Algorithms:**
- PageRank for tool importance
- Community detection for clustering
- Shortest path for workflow optimization

## Next Steps

- **Semantic Routing:** [semantic-routing.md](./semantic-routing.md)
- **Token Optimization:** [token-optimization.md](./token-optimization.md)
- **Gateway Integration:** [gateway.md](./gateway.md)
