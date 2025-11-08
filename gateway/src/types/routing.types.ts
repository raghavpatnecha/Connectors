/**
 * Type definitions for semantic routing and tool selection
 */

export interface QueryContext {
  /** Allowed tool categories for this query */
  allowedCategories?: string[];

  /** Maximum token budget for tool schemas */
  tokenBudget?: number;

  /** Primary category hint (from user context) */
  primaryCategory?: string;

  /** Tenant ID for multi-tenancy */
  tenantId?: string;

  /** Additional context for routing decisions */
  metadata?: Record<string, unknown>;
}

export interface ToolSelection {
  /** Unique tool identifier (e.g., 'github.createPullRequest') */
  toolId: string;

  /** Tool name */
  name: string;

  /** Tool description */
  description: string;

  /** Category this tool belongs to */
  category: string;

  /** Semantic similarity score (0-1) */
  score: number;

  /** Estimated token cost for this tool's schema */
  tokenCost: number;

  /** Schema tier (1=minimal, 2=medium, 3=full) */
  tier: 1 | 2 | 3;

  /** Full tool schema (populated based on tier) */
  schema?: ToolSchema;

  /** Lazy load URL for tier 3 tools */
  loadUrl?: string;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters?: ParameterSchema;
  examples?: Example[];
  rateLimit?: RateLimit;
  requiresAuth?: boolean;
}

export interface ParameterSchema {
  type: string;
  properties?: Record<string, PropertySchema>;
  required?: string[];
}

export interface PropertySchema {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  format?: string;
}

export interface Example {
  description: string;
  input: Record<string, unknown>;
  output?: unknown;
}

export interface RateLimit {
  requests: number;
  period: string;
  scope: 'user' | 'app' | 'tenant';
}

export interface ToolEmbedding {
  /** Tool identifier */
  toolId: string;

  /** Embedding vector */
  embedding: number[];

  /** Category */
  category: string;

  /** Metadata */
  metadata: {
    name: string;
    description: string;
    usageCount: number;
    averageLatency?: number;
  };
}

export interface CategoryEmbedding {
  /** Category name */
  category: string;

  /** Embedding vector */
  embedding: number[];

  /** Number of tools in this category */
  toolCount: number;

  /** Category description */
  description: string;
}

export interface SearchResult {
  /** Item ID (category or tool) */
  id: string;

  /** Similarity score (0-1) */
  score: number;

  /** Distance metric from FAISS */
  distance: number;
}

export interface TieredToolSet {
  /** Tier 1: Essential tools with minimal schema */
  tier1: ToolSelection[];

  /** Tier 2: Contextual tools with medium schema */
  tier2: ToolSelection[];

  /** Tier 3: Full tools (lazy loaded) */
  tier3: ToolSelection[];

  /** Total estimated token cost (tier1 + tier2 only) */
  totalTokens: number;

  /** Token reduction percentage vs loading all tools */
  reductionPercentage: number;
}

export interface EmbeddingOptions {
  /** Model to use for embeddings */
  model?: 'openai' | 'local';

  /** OpenAI model name (if using OpenAI) */
  openaiModel?: string;

  /** Dimensions for embedding vectors */
  dimensions?: number;

  /** Batch size for embedding generation */
  batchSize?: number;
}

export interface FAISSIndexConfig {
  /** Path to FAISS index file */
  indexPath: string;

  /** Dimension of embedding vectors */
  dimension: number;

  /** Index type (e.g., 'Flat', 'IVFFlat', 'HNSW') */
  indexType?: string;

  /** Number of clusters for IVF indices */
  nlist?: number;
}

export interface RoutingMetrics {
  /** Query that was routed */
  query: string;

  /** Number of categories found */
  categoriesFound: number;

  /** Number of tools selected */
  toolsSelected: number;

  /** FAISS search latency (ms) */
  faissLatency: number;

  /** Total routing latency (ms) */
  totalLatency: number;

  /** Total token cost */
  tokenCost: number;

  /** Token reduction percentage */
  tokenReductionPct: number;

  /** Cache hit/miss */
  cacheHit: boolean;
}
