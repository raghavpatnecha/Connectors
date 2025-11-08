/**
 * GraphRAG Module - Exports
 * Central export point for all GraphRAG functionality
 */

export { GraphRAGService } from './graphrag-service';
export { Neo4jConnectionPool, initializeFromEnv, getConnectionPool } from './config';
export { initializeGraphDB, resetGraphDB } from './init';

export type {
  ToolNode,
  CategoryNode,
  ToolRelationship,
  ToolWithRelationships,
  QueryContext,
  EnhancementResult,
  GraphStats,
  ToolUsageUpdate,
  CreateRelationshipPayload,
  CypherQueryParams
} from './types';

export { RelationshipType } from './types';

// Re-export commonly used queries
export {
  FIND_RELATED_TOOLS,
  FIND_TOOLS_BY_CATEGORY,
  FIND_ALTERNATIVE_TOOLS,
  INCREMENT_TOOL_USAGE,
  GET_GRAPH_STATS
} from './queries';
