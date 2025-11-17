/**
 * Configuration options for the Connectors SDK
 */
export interface ConnectorsConfig {
  /**
   * Base URL of the Connectors gateway
   * @example 'http://localhost:3000'
   */
  baseURL: string;

  /**
   * API key for authentication (optional)
   */
  apiKey?: string;

  /**
   * Tenant ID for multi-tenant scenarios (optional)
   */
  tenantId?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>;
}

/**
 * Health status response from the gateway
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services?: {
    faiss?: 'up' | 'down';
    neo4j?: 'up' | 'down';
    vault?: 'up' | 'down';
    redis?: 'up' | 'down';
  };
  timestamp: string;
}
