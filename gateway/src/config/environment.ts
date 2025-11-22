/**
 * Environment configuration for MCP Gateway
 * Centralizes all environment variable parsing and defaults
 */

/**
 * Parse integer from environment variable with default
 */
function parseIntEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Invalid integer for ${key}: ${value}, using default ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Parse float from environment variable with default
 */
function parseFloatEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    console.warn(`Invalid float for ${key}: ${value}, using default ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Parse boolean from environment variable with default
 */
function parseBoolEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Semantic Router Configuration
 */
export const SemanticRouterConfig = {
  /** Maximum tools to return per query */
  MAX_TOOLS_PER_QUERY: parseIntEnv('SEMANTIC_ROUTER_MAX_TOOLS', 5),

  /** Minimum similarity score for category selection */
  CATEGORY_THRESHOLD: parseFloatEnv('SEMANTIC_ROUTER_CATEGORY_THRESHOLD', 0.7),

  /** Minimum similarity score for tool selection */
  TOOL_THRESHOLD: parseFloatEnv('SEMANTIC_ROUTER_TOOL_THRESHOLD', 0.5),

  /** Maximum categories to consider */
  MAX_CATEGORIES: parseIntEnv('SEMANTIC_ROUTER_MAX_CATEGORIES', 3),
};

/**
 * OAuth Refresh Scheduler Configuration
 */
export const RefreshSchedulerConfig = {
  /** Buffer time before expiry to trigger refresh (milliseconds) */
  REFRESH_BUFFER_MS: parseIntEnv('OAUTH_REFRESH_BUFFER_MS', 5 * 60 * 1000), // 5 minutes

  /** Interval for checking refresh jobs (milliseconds) */
  CHECK_INTERVAL_MS: parseIntEnv('OAUTH_CHECK_INTERVAL_MS', 60 * 1000), // 1 minute

  /** Maximum retry attempts for failed refreshes */
  MAX_RETRY_ATTEMPTS: parseIntEnv('OAUTH_MAX_RETRY_ATTEMPTS', 3),
};

/**
 * API Key Authentication Configuration
 */
export const APIKeyAuthConfig = {
  /** Cache TTL for API key lookups (milliseconds) */
  CACHE_TTL_MS: parseIntEnv('API_KEY_CACHE_TTL_MS', 5 * 60 * 1000), // 5 minutes

  /** Cache cleanup interval (milliseconds) */
  CACHE_CLEANUP_INTERVAL_MS: parseIntEnv('API_KEY_CACHE_CLEANUP_INTERVAL_MS', 60 * 1000), // 1 minute
};

/**
 * Rate Limiter Configuration
 */
export const RateLimiterConfig = {
  /** Global rate limit (requests per second) */
  GLOBAL_RPS: parseIntEnv('RATE_LIMIT_GLOBAL_RPS', 1000),

  /** Per-tenant rate limit (requests per second) */
  TENANT_RPS: parseIntEnv('RATE_LIMIT_TENANT_RPS', 100),

  /** Anonymous rate limit (requests per second) */
  ANONYMOUS_RPS: parseIntEnv('RATE_LIMIT_ANONYMOUS_RPS', 10),
};

/**
 * Vault Circuit Breaker Configuration
 */
export const VaultCircuitBreakerConfig = {
  /** Number of consecutive failures before opening circuit */
  FAILURE_THRESHOLD: parseIntEnv('VAULT_CB_FAILURE_THRESHOLD', 5),

  /** Number of successes needed to close circuit from HALF_OPEN */
  SUCCESS_THRESHOLD: parseIntEnv('VAULT_CB_SUCCESS_THRESHOLD', 2),

  /** Time to wait before attempting recovery (milliseconds) */
  RESET_TIMEOUT_MS: parseIntEnv('VAULT_CB_RESET_TIMEOUT_MS', 60000), // 1 minute

  /** Time window for counting failures (milliseconds) */
  WINDOW_DURATION_MS: parseIntEnv('VAULT_CB_WINDOW_DURATION_MS', 10000), // 10 seconds
};

/**
 * Server Configuration
 */
export const ServerConfig = {
  /** Server port */
  PORT: parseIntEnv('PORT', 3000),

  /** Node environment */
  NODE_ENV: process.env.NODE_ENV || 'development',

  /** CORS origins (comma-separated) */
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['*'],

  /** Enable request logging */
  ENABLE_REQUEST_LOGGING: parseBoolEnv('ENABLE_REQUEST_LOGGING', true),

  /** Log level */
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

/**
 * FAISS Index Configuration
 */
export const FAISSConfig = {
  /** Category index path */
  CATEGORY_INDEX_PATH: process.env.CATEGORY_INDEX_PATH || 'data/indices/categories.faiss',

  /** Tool index path */
  TOOL_INDEX_PATH: process.env.TOOL_INDEX_PATH || 'data/indices/tools.faiss',
};

/**
 * Vault Configuration
 */
export const VaultConfig = {
  /** Vault server address */
  ADDRESS: process.env.VAULT_ADDR || 'http://localhost:8200',

  /** Vault token */
  TOKEN: process.env.VAULT_TOKEN || '',

  /** Transit engine name */
  TRANSIT_ENGINE: process.env.VAULT_TRANSIT_ENGINE || 'transit',

  /** KV engine name */
  KV_ENGINE: process.env.VAULT_KV_ENGINE || 'secret',

  /** Request timeout (milliseconds) */
  TIMEOUT_MS: parseIntEnv('VAULT_TIMEOUT_MS', 5000),

  /** Max retries */
  MAX_RETRIES: parseIntEnv('VAULT_MAX_RETRIES', 3),
};

/**
 * Redis Configuration
 */
export const RedisConfig = {
  /** Redis URL */
  URL: process.env.REDIS_URL || 'redis://localhost:6379',

  /** Connection timeout (milliseconds) */
  CONNECT_TIMEOUT_MS: parseIntEnv('REDIS_CONNECT_TIMEOUT_MS', 5000),

  /** Command timeout (milliseconds) */
  COMMAND_TIMEOUT_MS: parseIntEnv('REDIS_COMMAND_TIMEOUT_MS', 3000),
};

/**
 * Neo4j Configuration
 */
export const Neo4jConfig = {
  /** Neo4j URI */
  URI: process.env.NEO4J_URI || 'bolt://localhost:7687',

  /** Neo4j username */
  USERNAME: process.env.NEO4J_USERNAME || 'neo4j',

  /** Neo4j password */
  PASSWORD: process.env.NEO4J_PASSWORD || 'password',
};

/**
 * Get all configuration as a single object
 */
export const Config = {
  server: ServerConfig,
  semanticRouter: SemanticRouterConfig,
  refreshScheduler: RefreshSchedulerConfig,
  apiKeyAuth: APIKeyAuthConfig,
  rateLimiter: RateLimiterConfig,
  vaultCircuitBreaker: VaultCircuitBreakerConfig,
  faiss: FAISSConfig,
  vault: VaultConfig,
  redis: RedisConfig,
  neo4j: Neo4jConfig,
};

/**
 * Validate required configuration
 * Throws error if critical config is missing
 */
export function validateConfig(): void {
  const errors: string[] = [];

  if (!VaultConfig.TOKEN && ServerConfig.NODE_ENV === 'production') {
    errors.push('VAULT_TOKEN is required in production');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Print configuration summary (for debugging)
 * Sensitive values are redacted
 */
export function printConfigSummary(): void {
  console.log('=== MCP Gateway Configuration ===');
  console.log(`Environment: ${ServerConfig.NODE_ENV}`);
  console.log(`Port: ${ServerConfig.PORT}`);
  console.log(`Log Level: ${ServerConfig.LOG_LEVEL}`);
  console.log(`Vault: ${VaultConfig.ADDRESS} (token: ${VaultConfig.TOKEN ? '[SET]' : '[NOT SET]'})`);
  console.log(`Redis: ${RedisConfig.URL}`);
  console.log(`Neo4j: ${Neo4jConfig.URI}`);
  console.log(`Semantic Router - Max Tools: ${SemanticRouterConfig.MAX_TOOLS_PER_QUERY}`);
  console.log(`Semantic Router - Category Threshold: ${SemanticRouterConfig.CATEGORY_THRESHOLD}`);
  console.log(`OAuth Refresh Buffer: ${RefreshSchedulerConfig.REFRESH_BUFFER_MS}ms`);
  console.log(`Circuit Breaker - Failure Threshold: ${VaultCircuitBreakerConfig.FAILURE_THRESHOLD}`);
  console.log('================================');
}
