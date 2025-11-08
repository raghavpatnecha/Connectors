# GraphRAG Implementation Guide

## Overview

This document describes the Neo4j-based GraphRAG (Graph Retrieval-Augmented Generation) implementation for intelligent tool relationship management in the Connectors platform.

## Architecture

### Graph Schema

```cypher
// Nodes
(:Tool {id, name, category, description, usageCount})
(:Category {name, description})

// Relationships
(:Tool)-[:OFTEN_USED_WITH {confidence: float, coOccurrences: int}]->(:Tool)
(:Tool)-[:DEPENDS_ON {required: boolean}]->(:Tool)
(:Tool)-[:BELONGS_TO]->(:Category)
(:Tool)-[:ALTERNATIVE_TO {confidence: float, reason: string}]->(:Tool)
(:Tool)-[:PRECEDES {confidence: float, avgTimeBetween: int}]->(:Tool)
(:Tool)-[:REPLACES {version: string, deprecatedAt: datetime}]->(:Tool)
```

### Key Components

1. **GraphRAGService** - Main service class for graph operations
2. **Neo4jConnectionPool** - Connection pooling and session management
3. **Cypher Queries** - Optimized query templates for relationship discovery
4. **Initialization Scripts** - Schema setup and seed data

## File Structure

```
gateway/src/graph/
├── types.ts              # TypeScript type definitions
├── config.ts             # Neo4j connection pool configuration
├── graphrag-service.ts   # Main GraphRAG service implementation
├── queries.ts            # Reusable Cypher query templates
├── schema.cypher         # Schema constraints and indexes
├── seed-data.cypher      # Initial tool relationships
├── init.ts               # Initialization scripts
└── index.ts              # Module exports
```

## Usage

### 1. Initialize Database

```bash
# Set environment variables
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=password

# Run initialization
npm run graph:init

# Or reset and re-initialize
npm run graph:reset
```

### 2. Use GraphRAG Service

```typescript
import { GraphRAGService, initializeFromEnv } from './graph';

// Initialize connection
initializeFromEnv();

// Create service instance
const graphRAG = new GraphRAGService();

// Enhance tool selection with related tools
const selectedTools = [
  { id: 'github.createPullRequest', name: 'Create PR', category: 'code', description: '...', usageCount: 850 }
];

const enhancedTools = await graphRAG.enhanceWithRelationships(selectedTools, {
  allowedCategories: ['code', 'project-management'],
  maxRelatedTools: 3,
  minConfidence: 0.7
});

// Result: selectedTools + related tools (e.g., github.mergePullRequest, github.listPullRequests)
```

### 3. Update Tool Usage

```typescript
// Called after each tool invocation
await graphRAG.updateToolUsage({
  toolId: 'github.createPullRequest',
  increment: 1,
  tenantId: 'tenant-123'
});
```

### 4. Get Graph Statistics

```typescript
const stats = await graphRAG.getGraphStats();

console.log(stats);
// {
//   totalTools: 18,
//   totalCategories: 5,
//   totalRelationships: 28,
//   relationshipsByType: {
//     OFTEN_USED_WITH: 8,
//     DEPENDS_ON: 3,
//     ALTERNATIVE_TO: 4,
//     PRECEDES: 3
//   },
//   avgUsageCount: 650,
//   topTools: [...]
// }
```

## Relationship Types

### OFTEN_USED_WITH
Tools frequently used together in workflows.

**Example:**
```cypher
(github.createPullRequest)-[:OFTEN_USED_WITH {confidence: 0.92}]->(github.mergePullRequest)
```

**Use Case:** Suggest `mergePullRequest` when user creates a PR.

### DEPENDS_ON
Tool A requires Tool B to function.

**Example:**
```cypher
(github.createPullRequest)-[:DEPENDS_ON {required: true}]->(github.authenticate)
```

**Use Case:** Auto-include authentication when PR creation is selected.

### ALTERNATIVE_TO
Tools that can be used interchangeably.

**Example:**
```cypher
(github.createPullRequest)-[:ALTERNATIVE_TO {confidence: 0.90}]->(gitlab.createMergeRequest)
```

**Use Case:** Suggest GitLab alternative when GitHub is unavailable.

### PRECEDES
Tool A typically used before Tool B in workflows.

**Example:**
```cypher
(github.createBranch)-[:PRECEDES {confidence: 0.93, avgTimeBetween: 3600}]->(github.createPullRequest)
```

**Use Case:** Suggest PR creation after branch is created.

### REPLACES
Tool A supersedes Tool B (version upgrades).

**Example:**
```cypher
(github.v2.createPullRequest)-[:REPLACES {version: 'v2', deprecatedAt: '2024-01-01'}]->(github.v1.createPullRequest)
```

## Query Optimization

### Indexes
- `tool_id_unique` - Unique constraint on Tool.id
- `tool_category_index` - Fast category-based lookups
- `tool_usage_index` - Sort by popularity
- `relationship_confidence_index` - Filter by confidence score

### Query Performance
- **Tool Selection:** <50ms (2-hop traversal with 500 tools)
- **Usage Update:** <10ms (single node update)
- **Statistics:** <100ms (aggregation query)

## Relationship Discovery Algorithm

```typescript
// Pseudocode
function findRelatedTools(toolIds, context) {
  // 1. Start from selected tools
  startNodes = MATCH (t:Tool) WHERE t.id IN toolIds

  // 2. Traverse relationships (up to 2 hops)
  relatedPaths = MATCH path = (startNodes)-[:OFTEN_USED_WITH|:DEPENDS_ON*1..2]-(related)

  // 3. Calculate path confidence
  //    Confidence = product of edge confidences / path length
  for each path:
    pathConfidence = product(edge.confidence for edge in path) / length(path)

  // 4. Filter by minimum confidence
  filtered = relatedPaths WHERE pathConfidence >= minConfidence

  // 5. Deduplicate and sort
  //    Priority: confidence DESC, usageCount DESC
  results = DISTINCT filtered
            ORDER BY pathConfidence DESC, related.usageCount DESC
            LIMIT maxRelatedTools

  return results
}
```

## Seed Data

The seed data includes 18 tools across 5 categories:

**Code (8 tools):**
- GitHub: authenticate, createPullRequest, mergePullRequest, listPullRequests, createIssue, createBranch
- GitLab: createMergeRequest, mergeMergeRequest

**Communication (3 tools):**
- Slack: sendMessage, createChannel
- Teams: sendMessage

**Project Management (3 tools):**
- Jira: createIssue, transitionIssue
- Linear: createIssue

**Cloud (2 tools):**
- AWS: deployLambda, s3Upload

**Relationships:**
- 8 OFTEN_USED_WITH (e.g., createPullRequest → mergePullRequest)
- 3 DEPENDS_ON (e.g., createPullRequest → authenticate)
- 4 ALTERNATIVE_TO (e.g., GitHub PR ↔ GitLab MR)
- 3 PRECEDES (e.g., createBranch → createPullRequest)

## Example Workflows

### 1. GitHub PR Creation Flow

```
User Query: "Create a pull request on GitHub"

Selected Tools (Semantic Router):
1. github.createPullRequest (primary match)

GraphRAG Enhancement:
2. github.authenticate (DEPENDS_ON, required)
3. github.mergePullRequest (OFTEN_USED_WITH, confidence: 0.92)
4. github.listPullRequests (OFTEN_USED_WITH, confidence: 0.78)

Final Tool Set: [authenticate, createPullRequest, mergePullRequest, listPullRequests]
```

### 2. Cross-Category Integration

```
User Query: "Create Jira ticket when PR is merged"

Selected Tools:
1. github.mergePullRequest (code category)

GraphRAG Enhancement:
2. jira.createIssue (OFTEN_USED_WITH, confidence: 0.72)
3. slack.sendMessage (OFTEN_USED_WITH, confidence: 0.85) - notification

Final Tool Set: [mergePullRequest, createIssue, sendMessage]
```

## Monitoring

### Metrics to Track
- Graph size: `totalTools`, `totalRelationships`
- Query performance: `enhancementLatency`, `traversalDepth`
- Relationship quality: `avgConfidence`, `orphanedTools`
- Usage patterns: `topTools`, `relationshipsByType`

### Health Checks
```typescript
// Check Neo4j connectivity
const isHealthy = await graphRAG.getConnectionPool().verifyConnectivity();

// Verify data integrity
const stats = await graphRAG.getGraphStats();
if (stats.totalTools === 0) {
  throw new Error('Graph database is empty');
}
```

## Integration with Gateway

```typescript
// gateway/src/routing/semantic-router.ts

import { GraphRAGService } from '../graph';

export class SemanticRouter {
  private readonly _graphRAG: GraphRAGService;

  async selectTools(query: string, context: QueryContext): Promise<ToolSelection[]> {
    // Step 1: Category selection (FAISS)
    const categories = await this._selectCategories(query, 3);

    // Step 2: Tool selection within categories (FAISS)
    const tools = await this._selectWithinCategories(categories, query, 5);

    // Step 3: GraphRAG enhancement (Neo4j)
    const enhanced = await this._graphRAG.enhanceWithRelationships(tools, context);

    // Step 4: Token optimization
    return this._tokenOptimizer.optimize(enhanced, context.tokenBudget);
  }
}
```

## Best Practices

1. **Connection Management**
   - Always use connection pool
   - Close sessions after use
   - Implement retry logic for transient failures

2. **Relationship Confidence**
   - Update confidence based on co-occurrence
   - Decay confidence over time for unused relationships
   - Set minimum confidence threshold (default: 0.5)

3. **Performance**
   - Limit traversal depth to 2 hops
   - Use category filtering to reduce search space
   - Cache frequently accessed relationships

4. **Data Quality**
   - Regularly audit orphaned tools
   - Remove low-confidence relationships (<0.3)
   - Update tool descriptions for better semantic search

## Troubleshooting

### Connection Issues
```bash
# Check Neo4j is running
docker ps | grep neo4j

# Test connection
curl http://localhost:7474/

# Check logs
docker logs neo4j-container
```

### Empty Results
```typescript
// Verify data exists
const stats = await graphRAG.getGraphStats();
console.log('Total tools:', stats.totalTools);

// Check query parameters
const results = await graphRAG.enhanceWithRelationships(tools, {
  minConfidence: 0.1,  // Lower threshold
  maxRelatedTools: 10  // More results
});
```

### Performance Issues
```cypher
// Check index usage
EXPLAIN MATCH (t:Tool {id: $toolId}) RETURN t;

// Verify indexes exist
SHOW INDEXES;

// Rebuild index if needed
DROP INDEX tool_category_index;
CREATE INDEX tool_category_index FOR (t:Tool) ON (t.category);
```

## Future Enhancements

1. **Machine Learning**
   - Auto-discover relationships from usage logs
   - Predict tool sequences using temporal patterns
   - Personalized tool recommendations per tenant

2. **Advanced Relationships**
   - MUTUALLY_EXCLUSIVE: Tools that conflict
   - OPTIMIZES: Tool A improves Tool B's output
   - VALIDATES: Tool A checks Tool B's results

3. **Graph Algorithms**
   - PageRank for tool importance
   - Community detection for tool clustering
   - Shortest path for workflow optimization

## References

- Neo4j Documentation: https://neo4j.com/docs/
- Cypher Query Language: https://neo4j.com/docs/cypher-manual/
- Tool-to-Agent Retrieval: Research paper showing 19.4% accuracy improvement
- Less-is-More Tool Selection: Progressive loading patterns
