/**
 * GraphRAG Service - Tool Relationship Management
 * Provides intelligent tool discovery using Neo4j graph database
 */

import { Neo4jConnectionPool } from './config';
import { logger } from '../logging/logger';
import {
  ToolNode,
  QueryContext,
  ToolWithRelationships,
  RelationshipType,
  GraphStats,
  ToolUsageUpdate,
  CreateRelationshipPayload,
  CypherQueryParams
} from './types';
import {
  FIND_RELATED_TOOLS,
  FIND_ALTERNATIVE_TOOLS,
  FIND_TOOL_DEPENDENCIES,
  INCREMENT_TOOL_USAGE,
  UPDATE_RELATIONSHIP_CONFIDENCE,
  GET_GRAPH_STATS,
  UPSERT_TOOL,
  LINK_TOOL_TO_CATEGORY,
  BATCH_UPSERT_TOOLS
} from './queries';
import { InvalidRelationshipTypeError } from '../errors/gateway-errors';

/**
 * Whitelist of allowed relationship types for Cypher injection prevention
 */
const ALLOWED_RELATIONSHIP_TYPES = [
  'OFTEN_USED_WITH',
  'DEPENDS_ON',
  'ALTERNATIVE_TO',
  'REPLACES',
  'PRECEDES',
  'BELONGS_TO'
];

/**
 * SECURITY FIX: Parameterized Cypher queries by relationship type
 * Prevents Cypher injection by avoiding string interpolation
 */
const RELATIONSHIP_QUERIES = {
  OFTEN_USED_WITH: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:OFTEN_USED_WITH]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  DEPENDS_ON: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:DEPENDS_ON]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  ALTERNATIVE_TO: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:ALTERNATIVE_TO]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  REPLACES: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:REPLACES]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  PRECEDES: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:PRECEDES]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  BELONGS_TO: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:BELONGS_TO]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `
} as const;

type RelationshipQueryKey = keyof typeof RELATIONSHIP_QUERIES;

/**
 * SECURITY FIX: Parameterized batch relationship queries
 * Prevents Cypher injection in batch operations
 */
const BATCH_RELATIONSHIP_QUERIES = {
  OFTEN_USED_WITH: `
    UNWIND $relationships AS rel
    MATCH (t1:Tool {id: rel.from})
    MATCH (t2:Tool {id: rel.to})
    MERGE (t1)-[r:OFTEN_USED_WITH]->(t2)
    SET r.confidence = rel.confidence,
        r.updatedAt = datetime()
    RETURN count(r) AS relationshipsCreated
  `,
  DEPENDS_ON: `
    UNWIND $relationships AS rel
    MATCH (t1:Tool {id: rel.from})
    MATCH (t2:Tool {id: rel.to})
    MERGE (t1)-[r:DEPENDS_ON]->(t2)
    SET r.confidence = rel.confidence,
        r.updatedAt = datetime()
    RETURN count(r) AS relationshipsCreated
  `,
  ALTERNATIVE_TO: `
    UNWIND $relationships AS rel
    MATCH (t1:Tool {id: rel.from})
    MATCH (t2:Tool {id: rel.to})
    MERGE (t1)-[r:ALTERNATIVE_TO]->(t2)
    SET r.confidence = rel.confidence,
        r.updatedAt = datetime()
    RETURN count(r) AS relationshipsCreated
  `,
  REPLACES: `
    UNWIND $relationships AS rel
    MATCH (t1:Tool {id: rel.from})
    MATCH (t2:Tool {id: rel.to})
    MERGE (t1)-[r:REPLACES]->(t2)
    SET r.confidence = rel.confidence,
        r.updatedAt = datetime()
    RETURN count(r) AS relationshipsCreated
  `,
  PRECEDES: `
    UNWIND $relationships AS rel
    MATCH (t1:Tool {id: rel.from})
    MATCH (t2:Tool {id: rel.to})
    MERGE (t1)-[r:PRECEDES]->(t2)
    SET r.confidence = rel.confidence,
        r.updatedAt = datetime()
    RETURN count(r) AS relationshipsCreated
  `,
  BELONGS_TO: `
    UNWIND $relationships AS rel
    MATCH (t1:Tool {id: rel.from})
    MATCH (t2:Tool {id: rel.to})
    MERGE (t1)-[r:BELONGS_TO]->(t2)
    SET r.confidence = rel.confidence,
        r.updatedAt = datetime()
    RETURN count(r) AS relationshipsCreated
  `
} as const;

/**
 * Validate relationship type against whitelist to prevent Cypher injection
 * @param type - Relationship type to validate
 * @throws InvalidRelationshipTypeError if type is not in whitelist
 */
function validateRelationshipType(type: string): void {
  if (ALLOWED_RELATIONSHIP_TYPES.indexOf(type) === -1) {
    logger.warn('Invalid relationship type attempted', {
      attemptedType: type,
      allowed: ALLOWED_RELATIONSHIP_TYPES
    });
    throw new InvalidRelationshipTypeError(
      `Invalid relationship type: ${type}. Allowed: ${ALLOWED_RELATIONSHIP_TYPES.join(', ')}`,
      type
    );
  }
}

/**
 * GraphRAG Service for intelligent tool selection and relationship discovery
 */
export class GraphRAGService {
  private readonly _connectionPool: Neo4jConnectionPool;
  private readonly _defaultMaxHops: number = 2;
  private readonly _defaultMinConfidence: number = 0.5;
  private readonly _defaultMaxRelatedTools: number = 3;

  constructor(connectionPool?: Neo4jConnectionPool) {
    this._connectionPool = connectionPool || Neo4jConnectionPool.getInstance();
  }

  /**
   * Enhance tool selection with related tools from graph
   * Core method for GraphRAG integration
   *
   * @param tools - Initially selected tools
   * @param context - Query context with constraints
   * @returns Enhanced tool list with related tools
   */
  async enhanceWithRelationships(
    tools: ToolNode[],
    context: QueryContext = {}
  ): Promise<ToolNode[]> {
    if (tools.length === 0) {
      return [];
    }

    const {
      allowedCategories,
      maxRelatedTools = this._defaultMaxRelatedTools,
      minConfidence = this._defaultMinConfidence
    } = context;

    const toolIds = tools.map(t => t.id);

    const params: CypherQueryParams = {
      toolIds,
      categories: allowedCategories || undefined,
      maxHops: this._defaultMaxHops,
      minConfidence,
      limit: maxRelatedTools
    };

    try {
      const session = this._connectionPool.getSession();

      try {
        const result = await session.run(FIND_RELATED_TOOLS, params);

        const relatedTools: ToolNode[] = result.records.map(record => {
          const node = record.get('related');
          return this._mapNodeToTool(node);
        });

        logger.info('GraphRAG enhancement', {
          originalTools: tools.length,
          relatedToolsFound: relatedTools.length,
          totalTools: tools.length + relatedTools.length,
          allowedCategories
        });

        // Merge original and related tools (deduplicated)
        const allTools = [...tools];
        const existingIds = new Set(toolIds);

        for (const relatedTool of relatedTools) {
          if (!existingIds.has(relatedTool.id)) {
            allTools.push(relatedTool);
            existingIds.add(relatedTool.id);
          }
        }

        return allTools;
      } finally {
        await session.close();
      }
    } catch (error) {
      logger.error('GraphRAG enhancement failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        toolIds,
        context
      });

      // Graceful degradation: return original tools
      return tools;
    }
  }

  /**
   * Get detailed tool relationships
   */
  async getToolWithRelationships(toolId: string): Promise<ToolWithRelationships | null> {
    const session = this._connectionPool.getSession();

    try {
      const query = `
        MATCH (t:Tool {id: $toolId})
        OPTIONAL MATCH (t)-[r]->(related:Tool)
        RETURN t, collect({
          type: type(r),
          relatedTool: related,
          confidence: r.confidence
        }) AS relationships
      `;

      const result = await session.run(query, { toolId });

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const tool = this._mapNodeToTool(record.get('t'));
      const relationships = record.get('relationships')
        .filter((rel: any) => rel.relatedTool !== null)
        .map((rel: any) => ({
          type: rel.type as RelationshipType,
          relatedTool: this._mapNodeToTool(rel.relatedTool),
          confidence: rel.confidence || 0.5
        }));

      return { tool, relationships };
    } finally {
      await session.close();
    }
  }

  /**
   * Find alternative tools (same category, different implementation)
   */
  async findAlternativeTools(toolId: string, limit: number = 5): Promise<ToolNode[]> {
    const session = this._connectionPool.getSession();

    try {
      const result = await session.run(FIND_ALTERNATIVE_TOOLS, { toolId, limit });

      return result.records.map(record => {
        const node = record.get('alt');
        return this._mapNodeToTool(node);
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Find tool dependencies (prerequisite tools)
   */
  async findDependencies(toolId: string): Promise<ToolNode[]> {
    const session = this._connectionPool.getSession();

    try {
      const result = await session.run(FIND_TOOL_DEPENDENCIES, { toolId });

      return result.records.map(record => {
        const node = record.get('dep');
        return this._mapNodeToTool(node);
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Update tool usage count (called after each invocation)
   */
  async updateToolUsage(update: ToolUsageUpdate): Promise<void> {
    const { toolId, increment = 1 } = update;

    const session = this._connectionPool.getSession();

    try {
      await session.run(INCREMENT_TOOL_USAGE, { toolId, increment });

      logger.info('Tool usage updated', {
        toolId,
        increment,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Failed to update tool usage', {
        toolId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Update relationship confidence based on co-occurrence
   */
  async updateRelationshipConfidence(toolId1: string, toolId2: string): Promise<void> {
    const session = this._connectionPool.getSession();

    try {
      await session.run(UPDATE_RELATIONSHIP_CONFIDENCE, { toolId1, toolId2 });
    } catch (error) {
      logger.error('Failed to update relationship confidence', {
        toolId1,
        toolId2,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Get graph statistics for monitoring
   */
  async getGraphStats(): Promise<GraphStats> {
    const session = this._connectionPool.getSession();

    try {
      const result = await session.run(GET_GRAPH_STATS);

      if (result.records.length === 0) {
        return {
          totalTools: 0,
          totalCategories: 0,
          totalRelationships: 0,
          relationshipsByType: {},
          avgUsageCount: 0,
          topTools: []
        };
      }

      const stats = result.records[0].get('stats');

      return {
        totalTools: stats.totalTools || 0,
        totalCategories: stats.totalCategories || 0,
        totalRelationships: stats.totalRelationships || 0,
        relationshipsByType: this._mapRelationshipsByType(stats.relationshipsByType || []),
        avgUsageCount: stats.avgUsageCount || 0,
        topTools: stats.topTools || []
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Upsert a tool node
   */
  async upsertTool(tool: ToolNode): Promise<void> {
    const session = this._connectionPool.getSession();

    try {
      await session.run(UPSERT_TOOL, {
        id: tool.id,
        name: tool.name,
        category: tool.category,
        description: tool.description
      });

      await session.run(LINK_TOOL_TO_CATEGORY, {
        toolId: tool.id,
        category: tool.category
      });
    } finally {
      await session.close();
    }
  }

  /**
   * Create relationship between tools
   * SECURITY FIX: Uses parameterized queries instead of string interpolation
   */
  async createRelationship(payload: CreateRelationshipPayload): Promise<void> {
    const { fromToolId, toToolId, type, confidence } = payload;

    // SECURITY: Validate relationship type to prevent Cypher injection
    validateRelationshipType(type);

    // SECURITY FIX: Get parameterized query for this relationship type
    const query = RELATIONSHIP_QUERIES[type as RelationshipQueryKey];

    if (!query) {
      throw new InvalidRelationshipTypeError(
        `No query defined for relationship type: ${type}`,
        type
      );
    }

    const session = this._connectionPool.getSession();

    try {
      await session.run(query, { fromToolId, toToolId, confidence });

      logger.info('Relationship created', {
        fromToolId,
        toToolId,
        type,
        confidence
      });
    } catch (error) {
      logger.error('Failed to create relationship', {
        fromToolId,
        toToolId,
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Batch upsert tools (for initialization)
   */
  async batchUpsertTools(tools: ToolNode[]): Promise<number> {
    const session = this._connectionPool.getSession();

    try {
      const result = await session.run(BATCH_UPSERT_TOOLS, { tools });
      return result.records[0]?.get('toolsCreated') || 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Batch create relationships (for initialization)
   * SECURITY FIX: Uses parameterized queries instead of string interpolation
   */
  async batchCreateRelationships(
    relationships: Array<{ from: string; to: string; confidence: number }>,
    type: RelationshipType
  ): Promise<number> {
    // SECURITY: Validate relationship type to prevent Cypher injection
    validateRelationshipType(type);

    // SECURITY FIX: Get parameterized query for this relationship type
    const query = BATCH_RELATIONSHIP_QUERIES[type as RelationshipQueryKey];

    if (!query) {
      throw new InvalidRelationshipTypeError(
        `No batch query defined for relationship type: ${type}`,
        type
      );
    }

    const session = this._connectionPool.getSession();

    try {
      const result = await session.run(query, { relationships });
      const relationshipsCreated = result.records[0]?.get('relationshipsCreated') || 0;

      logger.info('Batch relationships created', {
        count: relationshipsCreated,
        type,
        relationshipCount: relationships.length
      });

      return relationshipsCreated;
    } catch (error) {
      logger.error('Failed to batch create relationships', {
        type,
        count: relationships.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Map Neo4j node to ToolNode
   */
  private _mapNodeToTool(node: any): ToolNode {
    const props = node.properties;
    return {
      id: props.id,
      name: props.name,
      category: props.category,
      description: props.description,
      usageCount: props.usageCount || 0,
      metadata: props.metadata || {}
    };
  }

  /**
   * Map relationships by type
   */
  private _mapRelationshipsByType(rels: Array<{ type: string; count: number }>): Record<string, number> {
    const result: Record<string, number> = {};
    for (const rel of rels) {
      result[rel.type] = rel.count;
    }
    return result;
  }
}
