/**
 * Core TypeScript type definitions for MCP Gateway
 *
 * Defines interfaces for tool selection, semantic routing, GraphRAG,
 * OAuth management, and progressive loading.
 */

/**
 * MCP Tool definition with metadata for semantic search
 */
export interface Tool {
  /** Unique tool identifier (e.g., "github.createPullRequest") */
  id: string;

  /** Tool name */
  name: string;

  /** Human-readable description for semantic matching */
  description: string;

  /** Category (code, communication, project-management, cloud, data) */
  category: string;

  /** Integration name (e.g., "github", "slack", "jira") */
  integration: string;

  /** JSON schema for tool parameters */
  parameters: ToolParameterSchema;

  /** Usage examples for few-shot learning */
  examples?: ToolExample[];

  /** Estimated token cost for full schema */
  tokenCost: number;

  /** Embedding vector for FAISS semantic search */
  embedding?: number[];

  /** Tags for additional filtering */
  tags?: string[];

  /** OAuth scopes required */
  requiredScopes?: string[];
}

/**
 * Tool parameter schema (JSON Schema format)
 */
export interface ToolParameterSchema {
  type: 'object';
  properties: Record<string, ParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Individual parameter property definition
 */
export interface ParameterProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  items?: ParameterProperty;
  properties?: Record<string, ParameterProperty>;
  default?: unknown;
}

/**
 * Tool usage example
 */
export interface ToolExample {
  /** Example description */
  description: string;

  /** Input parameters */
  input: Record<string, unknown>;

  /** Expected output */
  output?: Record<string, unknown>;
}

/**
 * Selected tool with relevance scoring
 */
export interface ToolSelection {
  /** Tool definition */
  tool: Tool;

  /** Relevance score from semantic search (0-1) */
  relevanceScore: number;

  /** Tier for progressive loading (1=essential, 2=contextual, 3=full) */
  tier: 1 | 2 | 3;

  /** Related tools from GraphRAG */
  relatedTools?: string[];

  /** Reason for selection (for debugging) */
  selectionReason?: string;
}

/**
 * Query context for tool selection
 */
export interface QueryContext {
  /** Original user query */
  query: string;

  /** Tenant ID for multi-tenancy */
  tenantId: string;

  /** Allowed categories (empty = all allowed) */
  allowedCategories?: string[];

  /** Maximum token budget for tool schemas */
  tokenBudget?: number;

  /** Maximum number of tools to return */
  maxTools?: number;

  /** Conversation history for context-aware selection */
  conversationHistory?: ConversationMessage[];

  /** Previous tool usage in session */
  previousToolUsage?: string[];
}

/**
 * Conversation message for context
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * OAuth credentials stored in Vault
 */
export interface OAuthCredentials {
  /** Access token */
  accessToken: string;

  /** Refresh token */
  refreshToken?: string;

  /** Token expiration timestamp */
  expiresAt: Date;

  /** OAuth scopes granted */
  scopes: string[];

  /** Token type (usually "Bearer") */
  tokenType: string;

  /** Integration name */
  integration: string;

  /** Tenant ID */
  tenantId: string;
}

/**
 * MCP request routed through gateway
 */
export interface MCPRequest {
  /** Tenant ID for credential lookup */
  tenantId: string;

  /** Integration name (e.g., "github") */
  integration: string;

  /** Tool name to invoke */
  tool: string;

  /** Tool parameters */
  parameters: Record<string, unknown>;

  /** Request headers */
  headers?: Record<string, string>;

  /** Request metadata */
  metadata?: Record<string, unknown>;
}

/**
 * MCP response from integration
 */
export interface MCPResponse {
  /** Success status */
  success: boolean;

  /** Response data */
  data?: unknown;

  /** Error details if failed */
  error?: MCPError;

  /** Response metadata */
  metadata?: {
    /** Execution time in ms */
    executionTime?: number;

    /** Integration responded from */
    integration?: string;

    /** Rate limit info */
    rateLimit?: RateLimitInfo;
  };
}

/**
 * MCP error details
 */
export interface MCPError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Stack trace (only in development) */
  stack?: string;

  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  /** Requests remaining in current window */
  remaining: number;

  /** Total limit per window */
  limit: number;

  /** Window reset timestamp */
  resetAt: Date;

  /** Whether rate limit was hit */
  exceeded?: boolean;
}

/**
 * Category embedding for coarse-grained search
 */
export interface CategoryEmbedding {
  /** Category name */
  category: string;

  /** Embedding vector */
  embedding: number[];

  /** Number of tools in category */
  toolCount: number;

  /** Popular tools in category */
  popularTools?: string[];
}

/**
 * Tool relationship from GraphRAG
 */
export interface ToolRelationship {
  /** Source tool ID */
  sourceToolId: string;

  /** Target tool ID */
  targetToolId: string;

  /** Relationship type */
  type: 'OFTEN_USED_WITH' | 'DEPENDS_ON' | 'SIMILAR_TO' | 'ALTERNATIVE_TO';

  /** Relationship weight/strength (0-1) */
  weight: number;

  /** Number of times observed */
  observationCount?: number;
}

/**
 * Tiered tool set for progressive loading
 */
export interface TieredToolSet {
  /** Tier 1: Essential tools (minimal schema) */
  tier1: MinimalToolSchema[];

  /** Tier 2: Contextual tools (medium schema) */
  tier2: MediumToolSchema[];

  /** Tier 3: Full tools (lazy loaded) */
  tier3: LazyToolReference[];

  /** Total estimated tokens for tier1 + tier2 */
  totalTokens: number;
}

/**
 * Minimal tool schema (name + description only)
 */
export interface MinimalToolSchema {
  name: string;
  description: string;
  category: string;
  integration: string;
}

/**
 * Medium tool schema (+ parameters, no examples)
 */
export interface MediumToolSchema extends MinimalToolSchema {
  parameters: ToolParameterSchema;
  requiredScopes?: string[];
}

/**
 * Lazy tool reference (full schema loaded on demand)
 */
export interface LazyToolReference {
  id: string;
  loadUrl: string;
}

/**
 * Gateway configuration
 */
export interface GatewayConfig {
  /** Server port */
  port: number;

  /** FAISS index path */
  faissIndexPath: string;

  /** Neo4j connection URI */
  neo4jUri: string;

  /** Neo4j credentials */
  neo4jAuth: {
    username: string;
    password: string;
  };

  /** Vault configuration */
  vaultConfig: {
    address: string;
    token: string;
    transitEngine: string;
  };

  /** Redis configuration */
  redisConfig: {
    host: string;
    port: number;
    password?: string;
  };

  /** Token optimization settings */
  tokenOptimization: {
    maxToolsPerQuery: number;
    defaultTokenBudget: number;
    categoryThreshold: number;
  };

  /** Rate limiting */
  rateLimiting: {
    enabled: boolean;
    maxRequestsPerMinute: number;
  };

  /** Logging */
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
}

/**
 * FAISS search result
 */
export interface FAISSSearchResult {
  /** Index in FAISS */
  index: number;

  /** Distance score (lower = more similar) */
  distance: number;

  /** Metadata associated with index */
  metadata?: Record<string, unknown>;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Query text */
  query: string;

  /** Categories found */
  categoriesFound: number;

  /** Tools selected */
  toolsSelected: number;

  /** FAISS latency (ms) */
  faissLatencyMs: number;

  /** GraphRAG latency (ms) */
  graphragLatencyMs: number;

  /** Total latency (ms) */
  totalLatencyMs: number;

  /** Token cost */
  tokenCost: number;

  /** Token reduction percentage vs traditional */
  tokenReductionPct: number;

  /** Timestamp */
  timestamp: Date;
}

/**
 * Health check response
 */
export interface HealthCheck {
  /** Overall status */
  status: 'healthy' | 'degraded' | 'unhealthy';

  /** Component statuses */
  components: {
    faiss: ComponentHealth;
    neo4j: ComponentHealth;
    vault: ComponentHealth;
    redis: ComponentHealth;
  };

  /** Uptime in seconds */
  uptime: number;

  /** Version */
  version: string;
}

/**
 * Component health status
 */
export interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  error?: string;
}
