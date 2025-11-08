/**
 * GraphRAG Type Definitions
 * Defines types for Neo4j tool relationship graph
 */

/**
 * Tool node representation in Neo4j
 */
export interface ToolNode {
  id: string;
  name: string;
  category: string;
  description: string;
  usageCount: number;
  parameters?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Category node representation in Neo4j
 */
export interface CategoryNode {
  name: string;
  description: string;
  toolCount?: number;
}

/**
 * Relationship types in the graph
 */
export enum RelationshipType {
  OFTEN_USED_WITH = 'OFTEN_USED_WITH',
  DEPENDS_ON = 'DEPENDS_ON',
  BELONGS_TO = 'BELONGS_TO',
  ALTERNATIVE_TO = 'ALTERNATIVE_TO',
  REPLACES = 'REPLACES',
  PRECEDES = 'PRECEDES'
}

/**
 * Tool relationship with confidence score
 */
export interface ToolRelationship {
  type: RelationshipType;
  confidence: number;
  metadata?: Record<string, unknown>;
}

/**
 * Tool with its related tools
 */
export interface ToolWithRelationships {
  tool: ToolNode;
  relationships: Array<{
    type: RelationshipType;
    relatedTool: ToolNode;
    confidence: number;
  }>;
}

/**
 * Query context for GraphRAG operations
 */
export interface QueryContext {
  allowedCategories?: string[];
  tokenBudget?: number;
  maxRelatedTools?: number;
  minConfidence?: number;
  tenantId?: string;
}

/**
 * GraphRAG enhancement result
 */
export interface EnhancementResult {
  originalTools: ToolNode[];
  relatedTools: ToolNode[];
  totalTools: number;
  relationshipsFound: number;
  confidence: number;
}

/**
 * Neo4j query parameters
 */
export interface CypherQueryParams {
  toolIds?: string[];
  categories?: string[];
  limit?: number;
  minConfidence?: number;
  maxHops?: number;
}

/**
 * Graph statistics for monitoring
 */
export interface GraphStats {
  totalTools: number;
  totalCategories: number;
  totalRelationships: number;
  relationshipsByType: Record<string, number>;
  avgUsageCount: number;
  topTools: Array<{ id: string; name: string; usageCount: number }>;
}

/**
 * Tool usage update payload
 */
export interface ToolUsageUpdate {
  toolId: string;
  increment?: number;
  timestamp?: Date;
  tenantId?: string;
}

/**
 * Relationship creation payload
 */
export interface CreateRelationshipPayload {
  fromToolId: string;
  toToolId: string;
  type: RelationshipType;
  confidence: number;
  metadata?: Record<string, unknown>;
}
