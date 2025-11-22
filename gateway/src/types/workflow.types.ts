/**
 * Workflow-related type definitions
 * Connectors Platform - Types for workflow planning and batch tool selection
 */

import { ToolSelection } from './routing.types';

/**
 * Batch query item for multi-use-case tool selection
 */
export interface BatchQuery {
  /** Use case description (e.g., "search for trending videos on YouTube") */
  use_case: string;

  /** Optional known fields as key:value pairs (e.g., "category:productivity, limit:5") */
  known_fields?: string;
}

/**
 * Unified tool selection options (applies to both single & batch modes)
 */
export interface ToolSelectionOptions {
  // Existing routing options
  /** Filter by specific categories */
  allowedCategories?: string[];

  /** Maximum token budget for tool schemas */
  tokenBudget?: number;

  /** Maximum number of tools to return */
  maxTools?: number;

  /** Tenant ID for multi-tenancy */
  tenantId?: string;

  // Workflow feature flags
  /** Include full tool schemas from MCP servers */
  includeSchemas?: boolean;

  /** Include workflow guidance (plans, pitfalls, difficulty) */
  includeGuidance?: boolean;

  /** Include toolkit OAuth connection status */
  includeConnectionStatus?: boolean;
}

/**
 * Session configuration for workflow tracking
 */
export interface SessionConfig {
  /** Existing session ID to continue */
  id?: string;

  /** Auto-generate new session ID */
  generate_id?: boolean;
}

/**
 * Workflow guidance for a use case
 * Includes step-by-step plan, common pitfalls, and difficulty rating
 */
export interface WorkflowGuidance {
  /** Critical instructions for the user */
  guidance?: string;

  /** Step-by-step validated execution plan */
  validated_plan: string[];

  /** Common pitfalls and errors to avoid */
  pitfalls: string[];

  /** Difficulty rating for this workflow */
  difficulty: 'easy' | 'medium' | 'hard';

  /** Primary tools needed for this workflow */
  main_tool_slugs: string[];

  /** Related/optional tools that may be useful */
  related_tool_slugs: string[];

  /** Toolkits (integrations) required */
  toolkits: string[];

  /** Cached plan ID for reference */
  cached_plan_id?: string;
}

/**
 * Toolkit OAuth connection status
 */
export interface ToolkitConnectionStatus {
  /** Toolkit identifier (e.g., "youtube", "notion") */
  toolkit: string;

  /** Human-readable description */
  description: string;

  /** Is OAuth connection active and valid? */
  active_connection: boolean;

  /** Additional connection details */
  connection_details?: Record<string, unknown>;

  /** Status message (e.g., "Connection not found") */
  message?: string;
}

/**
 * Full tool schema from MCP server
 * Includes complete input schema, examples, and metadata
 */
export interface FullToolSchema {
  /** Tool identifier (e.g., "YOUTUBE_SEARCH_YOU_TUBE") */
  tool_slug: string;

  /** Toolkit this tool belongs to */
  toolkit: string;

  /** Tool description */
  description: string;

  /** JSON Schema for tool input parameters */
  input_schema: {
    type: string;
    properties?: Record<string, PropertyDefinition>;
    required?: string[];
    [key: string]: unknown;
  };
}

/**
 * Property definition in tool schema
 */
export interface PropertyDefinition {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  format?: string;
  examples?: unknown[];
  items?: PropertyDefinition;
  properties?: Record<string, PropertyDefinition>;
  [key: string]: unknown;
}

/**
 * Single query result (simple mode response)
 */
export interface SingleToolResult {
  /** Original query string */
  query: string;

  /** Selected tools organized by tier */
  tools: {
    tier1: ToolSelection[];
    tier2: ToolSelection[];
    tier3: ToolSelection[];
  };

  /** Workflow guidance (if includeGuidance: true) */
  guidance?: WorkflowGuidance;

  /** Performance metrics */
  performance: {
    totalTools: number;
    tokenUsage: number;
    tokenBudget?: number;
    latency_ms: number;
  };
}

/**
 * Batch query result item (batch mode response)
 */
export interface BatchToolResult {
  /** Result index (1-based) */
  index: number;

  /** Original use case */
  use_case: string;

  /** Workflow guidance (if includeGuidance: true) */
  guidance?: WorkflowGuidance;

  /** Primary tools for this use case */
  main_tool_slugs: string[];

  /** Related/optional tools */
  related_tool_slugs: string[];

  /** Required toolkits */
  toolkits: string[];

  /** Cached plan ID */
  cached_plan_id?: string;
}

/**
 * Tool selection response data (polymorphic based on mode)
 */
export interface ToolSelectionResponseData {
  // Single mode fields
  /** Query string (single mode only) */
  query?: string;

  /** Selected tools (single mode only) */
  tools?: {
    tier1: ToolSelection[];
    tier2: ToolSelection[];
    tier3: ToolSelection[];
  };

  /** Performance metrics (single mode only) */
  performance?: {
    totalTools: number;
    tokenUsage: number;
    tokenBudget?: number;
    latency_ms: number;
  };

  /** Workflow guidance (single mode, if includeGuidance: true) */
  guidance?: WorkflowGuidance;

  // Batch mode fields
  /** Batch query results (batch mode only) */
  results?: BatchToolResult[];

  // Optional enrichments (both modes)
  /** Full tool schemas (if includeSchemas: true) */
  tool_schemas?: Record<string, FullToolSchema>;

  /** Toolkit connection statuses (if includeConnectionStatus: true) */
  toolkit_connection_statuses?: ToolkitConnectionStatus[];

  /** Session information (if session provided) */
  session?: {
    id: string;
    generated?: boolean;
    instructions?: string;
  };

  /** Time information for temporal queries */
  time_info?: {
    current_time: string;
    current_time_epoch_in_seconds: number;
    message?: string;
  };

  /** Next steps guidance */
  next_steps_guidance?: string[];
}

/**
 * Parsed known fields from batch query
 */
export interface ParsedKnownFields {
  category?: string;
  limit?: number;
  [key: string]: string | number | undefined;
}

/**
 * Service context for dependency injection
 */
export interface ServiceContext {
  schemaLoader?: ToolSchemaLoader | null;
  workflowPlanner?: WorkflowPlanner | null;
  connectionChecker?: ConnectionStatusChecker | null;
  sessionManager?: SessionManager | null;
  session?: SessionConfig;
}

/**
 * Type imports for service interfaces (to avoid circular dependencies)
 */
export interface ToolSchemaLoader {
  loadToolSchemas(toolIds: string[]): Promise<Record<string, FullToolSchema>>;
}

export interface WorkflowPlanner {
  generateWorkflowPlan(
    useCase: string,
    selectedTools: ToolSelection[],
    knownFields?: string
  ): Promise<WorkflowGuidance>;
}

export interface ConnectionStatusChecker {
  getStatus(
    toolkits: string[],
    tenantId?: string
  ): Promise<ToolkitConnectionStatus[]>;
}

export interface SessionManager {
  handleSession(config: SessionConfig): Promise<{
    id: string;
    generated?: boolean;
    instructions?: string;
  }>;
}
