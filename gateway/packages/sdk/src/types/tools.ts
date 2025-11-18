/**
 * Tool selection request parameters
 */
export interface ToolSelectionRequest {
  /**
   * Natural language query describing the task
   */
  query: string;

  /**
   * Maximum number of tools to select
   * @default 5
   */
  maxTools?: number;

  /**
   * Filter by specific categories
   */
  categories?: string[];

  /**
   * Token budget for tool schemas
   * @default 3000
   */
  tokenBudget?: number;

  /**
   * Additional context for selection
   */
  context?: Record<string, unknown>;
}

/**
 * Tool schema with tiered loading support
 */
export interface Tool {
  /**
   * Unique tool identifier (e.g., 'github.createPullRequest')
   */
  id: string;

  /**
   * Human-readable tool name
   */
  name: string;

  /**
   * Tool description
   */
  description: string;

  /**
   * Integration/category this tool belongs to
   */
  integration: string;

  /**
   * Tool category (code, communication, pm, cloud, data, etc.)
   */
  category: string;

  /**
   * Tool parameters schema (JSONSchema)
   */
  parameters?: Record<string, unknown>;

  /**
   * Usage examples (omitted in tier1/tier2)
   */
  examples?: Array<{
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  }>;

  /**
   * Estimated token cost for this tool's schema
   */
  tokenCost?: number;

  /**
   * URL to load full schema (for tier3 lazy loading)
   */
  loadUrl?: string;
}

/**
 * Tiered tool selection response
 */
export interface ToolSelectionResponse {
  /**
   * Tier 1: Essential tools with minimal schema (name, description only)
   */
  tier1: Tool[];

  /**
   * Tier 2: Contextual tools with medium schema (+ parameters, no examples)
   */
  tier2: Tool[];

  /**
   * Tier 3: Additional tools for lazy loading (reference only)
   */
  tier3: Array<{
    id: string;
    loadUrl: string;
  }>;

  /**
   * Total token cost of tier1 + tier2
   */
  totalTokens: number;

  /**
   * All tools (flat list for convenience)
   */
  tools: Tool[];

  /**
   * Selection metadata
   */
  metadata?: {
    categoriesUsed: string[];
    selectionLatency: number;
    queryEmbedding?: number[];
  };
}

/**
 * Tool invocation request
 */
export interface ToolInvocationRequest {
  /**
   * Tool ID to invoke
   */
  toolId: string;

  /**
   * Integration name (optional if included in toolId)
   */
  integration?: string;

  /**
   * Tool parameters
   */
  parameters: Record<string, unknown>;

  /**
   * Tenant ID (optional, uses config default)
   */
  tenantId?: string;
}

/**
 * Tool invocation response
 */
export interface ToolInvocationResponse<T = unknown> {
  /**
   * Whether the invocation was successful
   */
  success: boolean;

  /**
   * Result data
   */
  data?: T;

  /**
   * Error information if failed
   */
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };

  /**
   * Execution metadata
   */
  metadata?: {
    executionTime: number;
    tokensUsed?: number;
  };
}

/**
 * Tool list request parameters
 */
export interface ToolListRequest {
  /**
   * Filter by integration
   */
  integration?: string;

  /**
   * Filter by category
   */
  category?: string;

  /**
   * Search query
   */
  search?: string;

  /**
   * Pagination: page number
   */
  page?: number;

  /**
   * Pagination: items per page
   */
  limit?: number;
}

/**
 * Tool list response
 */
export interface ToolListResponse {
  tools: Tool[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
