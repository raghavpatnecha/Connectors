/**
 * Reusable Cypher Query Templates
 * All GraphRAG queries centralized for maintainability
 */

/**
 * Create or update a Tool node
 */
export const UPSERT_TOOL = `
  MERGE (t:Tool {id: $id})
  SET t.name = $name,
      t.category = $category,
      t.description = $description,
      t.usageCount = COALESCE(t.usageCount, 0),
      t.updatedAt = datetime()
  RETURN t
`;

/**
 * Create or update a Category node
 */
export const UPSERT_CATEGORY = `
  MERGE (c:Category {name: $name})
  SET c.description = $description,
      c.updatedAt = datetime()
  RETURN c
`;

/**
 * Link tool to category
 */
export const LINK_TOOL_TO_CATEGORY = `
  MATCH (t:Tool {id: $toolId})
  MATCH (c:Category {name: $category})
  MERGE (t)-[r:BELONGS_TO]->(c)
  RETURN t, r, c
`;

/**
 * Create relationship between tools
 */
export const CREATE_TOOL_RELATIONSHIP = `
  MATCH (t1:Tool {id: $fromToolId})
  MATCH (t2:Tool {id: $toToolId})
  MERGE (t1)-[r:${`$type`}]->(t2)
  SET r.confidence = $confidence,
      r.updatedAt = datetime()
  RETURN t1, r, t2
`;

/**
 * Find related tools up to N hops away
 * Core query for GraphRAG enhancement
 */
export const FIND_RELATED_TOOLS = `
  MATCH (t:Tool)
  WHERE t.id IN $toolIds

  // Find related tools via relationships (up to maxHops)
  CALL {
    WITH t
    MATCH path = (t)-[:OFTEN_USED_WITH|:DEPENDS_ON*1..$maxHops]-(related:Tool)
    WHERE related.id NOT IN $toolIds
    AND ($categories IS NULL OR related.category IN $categories)

    // Calculate path confidence (product of all edge confidences)
    WITH related,
         relationships(path) AS rels,
         length(path) as pathLength

    UNWIND rels AS rel
    WITH related,
         pathLength,
         CASE
           WHEN rel.confidence IS NOT NULL THEN rel.confidence
           ELSE 1.0
         END AS edgeConfidence

    WITH related,
         pathLength,
         exp(sum(log(edgeConfidence))) AS pathConfidence

    RETURN related,
           pathConfidence / pathLength AS normalizedConfidence,
           pathLength
    ORDER BY normalizedConfidence DESC, related.usageCount DESC
  }

  // Deduplicate and filter by confidence
  WITH DISTINCT related, max(normalizedConfidence) AS confidence
  WHERE confidence >= $minConfidence

  RETURN related
  ORDER BY confidence DESC, related.usageCount DESC
  LIMIT $limit
`;

/**
 * Find tools by category with usage stats
 */
export const FIND_TOOLS_BY_CATEGORY = `
  MATCH (t:Tool)-[:BELONGS_TO]->(c:Category)
  WHERE c.name IN $categories
  RETURN t
  ORDER BY t.usageCount DESC
  LIMIT $limit
`;

/**
 * Find alternative tools (same category, different implementation)
 */
export const FIND_ALTERNATIVE_TOOLS = `
  MATCH (t:Tool {id: $toolId})-[:BELONGS_TO]->(c:Category)
  MATCH (alt:Tool)-[:BELONGS_TO]->(c)
  WHERE alt.id <> t.id
  OPTIONAL MATCH (t)-[r:ALTERNATIVE_TO]-(alt)
  RETURN alt,
         COALESCE(r.confidence, 0.5) AS confidence
  ORDER BY confidence DESC, alt.usageCount DESC
  LIMIT $limit
`;

/**
 * Find tool dependencies (required prerequisite tools)
 */
export const FIND_TOOL_DEPENDENCIES = `
  MATCH path = (t:Tool {id: $toolId})-[:DEPENDS_ON*1..3]->(dep:Tool)
  WHERE dep.id <> t.id
  RETURN DISTINCT dep,
         length(path) AS depth
  ORDER BY depth ASC, dep.usageCount DESC
`;

/**
 * Increment tool usage count
 */
export const INCREMENT_TOOL_USAGE = `
  MATCH (t:Tool {id: $toolId})
  SET t.usageCount = t.usageCount + $increment,
      t.lastUsedAt = datetime()
  RETURN t.usageCount AS newCount
`;

/**
 * Update relationship confidence based on co-occurrence
 */
export const UPDATE_RELATIONSHIP_CONFIDENCE = `
  MATCH (t1:Tool {id: $toolId1})-[r:OFTEN_USED_WITH]-(t2:Tool {id: $toolId2})
  SET r.confidence = CASE
    WHEN r.confidence IS NULL THEN 0.5
    ELSE LEAST(r.confidence + 0.05, 1.0)
  END,
  r.coOccurrences = COALESCE(r.coOccurrences, 0) + 1,
  r.updatedAt = datetime()
  RETURN r.confidence AS newConfidence
`;

/**
 * Get graph statistics
 */
export const GET_GRAPH_STATS = `
  MATCH (t:Tool)
  WITH count(t) AS totalTools, avg(t.usageCount) AS avgUsage

  MATCH (c:Category)
  WITH totalTools, avgUsage, count(c) AS totalCategories

  MATCH ()-[r]->()
  WITH totalTools, avgUsage, totalCategories,
       count(r) AS totalRelationships,
       type(r) AS relType

  WITH totalTools, avgUsage, totalCategories,
       sum(totalRelationships) AS totalRels,
       collect({type: relType, count: totalRelationships}) AS relsByType

  MATCH (t:Tool)
  WITH totalTools, avgUsage, totalCategories, totalRels, relsByType, t
  ORDER BY t.usageCount DESC
  LIMIT 10

  RETURN {
    totalTools: totalTools,
    totalCategories: totalCategories,
    totalRelationships: totalRels,
    avgUsageCount: avgUsage,
    relationshipsByType: relsByType,
    topTools: collect({id: t.id, name: t.name, usageCount: t.usageCount})
  } AS stats
`;

/**
 * Delete tool and its relationships
 */
export const DELETE_TOOL = `
  MATCH (t:Tool {id: $toolId})
  DETACH DELETE t
`;

/**
 * Find orphaned tools (no relationships)
 */
export const FIND_ORPHANED_TOOLS = `
  MATCH (t:Tool)
  WHERE NOT (t)-[]-()
  RETURN t
  ORDER BY t.usageCount ASC
  LIMIT $limit
`;

/**
 * Batch upsert tools for initialization
 */
export const BATCH_UPSERT_TOOLS = `
  UNWIND $tools AS tool
  MERGE (t:Tool {id: tool.id})
  SET t.name = tool.name,
      t.category = tool.category,
      t.description = tool.description,
      t.usageCount = COALESCE(tool.usageCount, 0),
      t.updatedAt = datetime()

  MERGE (c:Category {name: tool.category})
  MERGE (t)-[:BELONGS_TO]->(c)

  RETURN count(t) AS toolsCreated
`;

/**
 * Batch create relationships for initialization
 */
export const BATCH_CREATE_RELATIONSHIPS = `
  UNWIND $relationships AS rel
  MATCH (t1:Tool {id: rel.from})
  MATCH (t2:Tool {id: rel.to})
  MERGE (t1)-[r:${`$type`}]->(t2)
  SET r.confidence = rel.confidence,
      r.updatedAt = datetime()
  RETURN count(r) AS relationshipsCreated
`;
