// =====================================================
// Neo4j Schema Definition for Tool Relationship Graph
// =====================================================

// Drop existing constraints and indexes (for clean initialization)
// Uncomment when re-initializing
// DROP CONSTRAINT tool_id_unique IF EXISTS;
// DROP CONSTRAINT category_name_unique IF EXISTS;
// DROP INDEX tool_category_index IF EXISTS;
// DROP INDEX tool_usage_index IF EXISTS;
// DROP INDEX tool_name_index IF EXISTS;

// =====================================================
// CONSTRAINTS
// =====================================================

// Ensure Tool IDs are unique
CREATE CONSTRAINT tool_id_unique IF NOT EXISTS
FOR (t:Tool)
REQUIRE t.id IS UNIQUE;

// Ensure Category names are unique
CREATE CONSTRAINT category_name_unique IF NOT EXISTS
FOR (c:Category)
REQUIRE c.name IS UNIQUE;

// =====================================================
// INDEXES
// =====================================================

// Index on Tool category for fast category-based queries
CREATE INDEX tool_category_index IF NOT EXISTS
FOR (t:Tool)
ON (t.category);

// Index on Tool usageCount for sorting by popularity
CREATE INDEX tool_usage_index IF NOT EXISTS
FOR (t:Tool)
ON (t.usageCount);

// Index on Tool name for search
CREATE INDEX tool_name_index IF NOT EXISTS
FOR (t:Tool)
ON (t.name);

// Composite index for category + usage queries
CREATE INDEX tool_category_usage_index IF NOT EXISTS
FOR (t:Tool)
ON (t.category, t.usageCount);

// Index on relationship confidence for filtering
CREATE INDEX relationship_confidence_index IF NOT EXISTS
FOR ()-[r:OFTEN_USED_WITH]-()
ON (r.confidence);

// =====================================================
// SCHEMA DOCUMENTATION
// =====================================================

// Node Labels:
// -----------
// Tool: Represents an MCP tool/integration
//   Properties:
//     - id: string (unique, required) - Tool identifier (e.g., "github.createPullRequest")
//     - name: string (required) - Human-readable tool name
//     - category: string (required) - Tool category (code, comm, pm, cloud, data)
//     - description: string (required) - Tool description for semantic search
//     - usageCount: integer (default: 0) - Number of times tool has been invoked
//     - lastUsedAt: datetime - Last invocation timestamp
//     - updatedAt: datetime - Last update timestamp
//     - metadata: map - Additional tool metadata (optional)

// Category: Represents a tool category
//   Properties:
//     - name: string (unique, required) - Category name
//     - description: string (required) - Category description
//     - updatedAt: datetime - Last update timestamp

// Relationship Types:
// ------------------
// OFTEN_USED_WITH: Tools frequently used together in same workflow
//   Properties:
//     - confidence: float (0.0-1.0) - Co-occurrence confidence score
//     - coOccurrences: integer - Number of times used together
//     - updatedAt: datetime - Last update timestamp

// DEPENDS_ON: Tool A requires Tool B to function
//   Properties:
//     - required: boolean - Whether dependency is mandatory
//     - updatedAt: datetime

// BELONGS_TO: Tool belongs to a Category
//   Properties: None (simple membership)

// ALTERNATIVE_TO: Tools that can be used interchangeably
//   Properties:
//     - confidence: float (0.0-1.0) - Similarity score
//     - reason: string - Why they're alternatives

// REPLACES: Tool A supersedes Tool B (version upgrades)
//   Properties:
//     - version: string - Version that replaced
//     - deprecatedAt: datetime

// PRECEDES: Tool A typically used before Tool B in workflows
//   Properties:
//     - confidence: float - How often this sequence occurs
//     - avgTimeBetween: integer - Average seconds between invocations

// =====================================================
// SAMPLE GRAPH STRUCTURE
// =====================================================

// Example:
// (github.createPullRequest:Tool)-[:BELONGS_TO]->(Code:Category)
// (github.createPullRequest:Tool)-[:OFTEN_USED_WITH {confidence: 0.95}]->(github.mergePullRequest:Tool)
// (github.createPullRequest:Tool)-[:DEPENDS_ON {required: true}]->(github.authenticate:Tool)
// (github.createPullRequest:Tool)-[:ALTERNATIVE_TO {confidence: 0.7}]->(gitlab.createMergeRequest:Tool)
