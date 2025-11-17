/**
 * Connectors SDK - Main client class
 */

import { HTTPClient } from './utils/http-client';
import { validateConfig } from './utils/validation';
import type { ConnectorsConfig, HealthStatus } from './types/config';

/**
 * Placeholder interfaces for Wave 2 implementation
 */
export interface ToolsAPI {
  select: (query: string, options?: unknown) => Promise<unknown>;
  list: (options?: unknown) => Promise<unknown>;
  invoke: (toolId: string, parameters: unknown) => Promise<unknown>;
}

export interface MCPRegistry {
  get: (name: string) => unknown;
  list: () => Promise<unknown>;
  add: (request: unknown) => Promise<unknown>;
}

export interface OAuthManager {
  authorize: (integration: string, options?: unknown) => Promise<unknown>;
  getStatus: (integration: string) => Promise<unknown>;
  revoke: (integration: string) => Promise<unknown>;
}

export interface CategoriesAPI {
  list: () => Promise<unknown>;
  get: (category: string) => Promise<unknown>;
}

/**
 * Main Connectors SDK client
 *
 * @example
 * ```typescript
 * import { Connectors } from '@connectors/sdk';
 *
 * const connectors = new Connectors({
 *   baseURL: 'http://localhost:3000',
 *   apiKey: 'your-api-key',
 *   tenantId: 'your-tenant-id'
 * });
 *
 * // Check gateway health
 * const health = await connectors.health();
 * console.log(health.status); // 'healthy'
 * ```
 */
export class Connectors {
  private readonly _baseURL: string;
  private readonly _apiKey?: string;
  private readonly _tenantId?: string;
  private readonly _httpClient: HTTPClient;
  private readonly _config: ConnectorsConfig;

  /**
   * Create a new Connectors SDK client
   *
   * @param config - Configuration options
   * @throws {ValidationError} If configuration is invalid
   */
  constructor(config: ConnectorsConfig) {
    // Validate configuration
    validateConfig(config);

    this._config = config;
    this._baseURL = config.baseURL.replace(/\/$/, ''); // Remove trailing slash
    this._apiKey = config.apiKey;
    this._tenantId = config.tenantId;

    // Initialize HTTP client with config
    const headers: Record<string, string> = {
      ...config.headers,
    };

    // Add API key header if provided
    if (this._apiKey) {
      headers['X-API-Key'] = this._apiKey;
    }

    // Add tenant ID header if provided
    if (this._tenantId) {
      headers['X-Tenant-ID'] = this._tenantId;
    }

    this._httpClient = new HTTPClient({
      baseURL: this._baseURL,
      timeout: config.timeout,
      maxRetries: config.maxRetries,
      headers,
    });
  }

  /**
   * Get base URL
   */
  get baseURL(): string {
    return this._baseURL;
  }

  /**
   * Get tenant ID
   */
  get tenantId(): string | undefined {
    return this._tenantId;
  }

  /**
   * Get API key (masked)
   */
  get apiKey(): string | undefined {
    return this._apiKey ? '***' : undefined;
  }

  /**
   * Get configuration
   */
  get config(): Readonly<ConnectorsConfig> {
    return { ...this._config };
  }

  /**
   * Get HTTP client (for internal use)
   * @internal
   */
  get httpClient(): HTTPClient {
    return this._httpClient;
  }

  /**
   * Tools API - select, list, and invoke tools
   * @throws {Error} Not implemented in Wave 1
   */
  get tools(): ToolsAPI {
    throw new Error(
      'ToolsAPI not implemented yet. This will be available in Wave 2 of the SDK implementation.'
    );
  }

  /**
   * MCP Registry - manage MCP servers
   * @throws {Error} Not implemented in Wave 1
   */
  get mcp(): MCPRegistry {
    throw new Error(
      'MCPRegistry not implemented yet. This will be available in Wave 2 of the SDK implementation.'
    );
  }

  /**
   * OAuth Manager - manage OAuth connections
   * @throws {Error} Not implemented in Wave 1
   */
  get oauth(): OAuthManager {
    throw new Error(
      'OAuthManager not implemented yet. This will be available in Wave 2 of the SDK implementation.'
    );
  }

  /**
   * Categories API - browse tool categories
   * @throws {Error} Not implemented in Wave 1
   */
  get categories(): CategoriesAPI {
    throw new Error(
      'CategoriesAPI not implemented yet. This will be available in Wave 2 of the SDK implementation.'
    );
  }

  /**
   * Check gateway health status
   *
   * @returns Health status information
   * @throws {HTTPError} If the request fails
   *
   * @example
   * ```typescript
   * const health = await connectors.health();
   * if (health.status === 'healthy') {
   *   console.log('Gateway is healthy');
   * }
   * ```
   */
  async health(): Promise<HealthStatus> {
    const response = await this._httpClient.get<HealthStatus>('/health');
    return response.data;
  }

  /**
   * Test connection to the gateway
   *
   * @returns True if connection is successful
   *
   * @example
   * ```typescript
   * const isConnected = await connectors.testConnection();
   * if (isConnected) {
   *   console.log('Connected to gateway');
   * }
   * ```
   */
  async testConnection(): Promise<boolean> {
    try {
      const health = await this.health();
      return health.status === 'healthy' || health.status === 'degraded';
    } catch {
      return false;
    }
  }
}
