/**
 * Google Custom Search MCP Integration Module
 * Connectors Platform - Search integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Search-specific configuration
const SEARCH_RATE_LIMIT = parseInt(process.env.SEARCH_RATE_LIMIT || '5', 10); // 5 requests per second
const SEARCH_TIMEOUT_MS = parseInt(process.env.SEARCH_TIMEOUT_MS || '20000', 10);
const SEARCH_SERVER_URL = process.env.SEARCH_SERVER_URL || 'http://localhost:3139';
const SEARCH_ENABLED = process.env.SEARCH_ENABLED !== 'false';

/**
 * Search OAuth configuration (Google OAuth 2.0)
 * Note: Custom Search also requires API key for some operations
 * See: https://developers.google.com/custom-search/v1/overview
 */
export const SEARCH_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.SEARCH_REDIRECT_URI || 'http://localhost:3139/oauth/callback',
  scopes: [
    'https://www.googleapis.com/auth/cse' // Custom Search Engine management
  ]
};

/**
 * Search API error codes mapped to our error types
 */
const SEARCH_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid search query or parameters',
  401: 'Unauthorized - invalid API key or OAuth token',
  403: 'Forbidden - API key quota exceeded or invalid CSE ID',
  404: 'Custom search engine not found',
  429: 'Rate limit exceeded - too many queries',
  500: 'Search internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Search API
 * Implements token bucket algorithm (5 req/s, conservative for quota management)
 */
class SearchRateLimiter {
  private _tokens: number = SEARCH_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = SEARCH_RATE_LIMIT;
  private readonly _refillRate: number = SEARCH_RATE_LIMIT; // tokens per second

  async acquire(): Promise<void> {
    // Refill tokens based on time elapsed
    const now = Date.now();
    const elapsed = (now - this._lastRefill) / 1000; // seconds
    this._tokens = Math.min(
      this._maxTokens,
      this._tokens + elapsed * this._refillRate
    );
    this._lastRefill = now;

    // If we have tokens, consume one
    if (this._tokens >= 1) {
      this._tokens -= 1;
      return;
    }

    // Wait until we have a token
    const waitTime = ((1 - this._tokens) / this._refillRate) * 1000;
    logger.debug('Search rate limit throttling', {
      integration: 'search',
      waitTimeMs: waitTime.toFixed(0)
    });

    await new Promise(resolve => setTimeout(resolve, waitTime));
    this._tokens = 0;
  }

  getAvailableTokens(): number {
    const now = Date.now();
    const elapsed = (now - this._lastRefill) / 1000;
    return Math.min(
      this._maxTokens,
      this._tokens + elapsed * this._refillRate
    );
  }
}

/**
 * Search Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Search MCP server
 */
export class SearchIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: SearchRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new SearchRateLimiter();
    this._serverUrl = SEARCH_SERVER_URL;

    logger.info('SearchIntegration constructed', {
      serverUrl: this._serverUrl,
      enabled: SEARCH_ENABLED,
      rateLimit: `${SEARCH_RATE_LIMIT} req/s`,
      timeout: `${SEARCH_TIMEOUT_MS}ms`
    });
  }

  /**
   * Initialize Search integration
   * - Register OAuth config
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!SEARCH_ENABLED) {
      logger.info('Search integration disabled');
      return;
    }

    logger.info('Initializing Search integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('search', SEARCH_OAUTH_CONFIG);

    // Perform initial health check
    const healthResult = await this.healthCheck();
    this._isHealthy = healthResult.healthy;

    logger.info('Search integration initialized successfully', {
      healthy: this._isHealthy,
      serverUrl: this._serverUrl
    });
  }

  /**
   * Check if Search integration is enabled
   */
  isEnabled(): boolean {
    return SEARCH_ENABLED;
  }

  /**
   * Get Search MCP server URL
   */
  getServerUrl(): string {
    return this._serverUrl;
  }

  /**
   * Get integration status
   */
  getStatus(): { healthy: boolean; serverUrl: string } {
    return {
      healthy: this._isHealthy,
      serverUrl: this._serverUrl
    };
  }

  /**
   * Proxy request to Search MCP server with OAuth and rate limiting
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    // Check if enabled
    if (!SEARCH_ENABLED) {
      throw new MCPError('Search integration is disabled', {
        integration: 'search'
      });
    }

    // Rate limiting (more conservative for search quota)
    await this._rateLimiter.acquire();

    logger.debug('Proxying Search request', {
      integration: 'search',
      method: req.method,
      availableTokens: this._rateLimiter.getAvailableTokens().toFixed(2)
    });

    try {
      // Proxy request through OAuth handler
      const response = await this._oauthProxy.proxyRequest({
        integration: 'search',
        tenantId: req.params?.tenantId || 'default',
        method: 'POST',
        path: '/mcp',
        body: req,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: SEARCH_TIMEOUT_MS
      });

      logger.info('Search request executed successfully', {
        integration: 'search',
        method: req.method,
        status: response.status
      });

      return response;
    } catch (error: any) {
      // Map Search-specific errors
      const mappedError = this._mapSearchError(error, req.method);
      logger.error('Search request failed', {
        integration: 'search',
        method: req.method,
        error: mappedError.message,
        errorType: mappedError.constructor.name
      });
      throw mappedError;
    }
  }

  /**
   * Map Search API errors to our error types
   */
  private _mapSearchError(error: any, method: string): Error {
    // Rate limit / quota errors
    if (error.status === 429 || error.status === 403) {
      return new RateLimitError(
        SEARCH_ERROR_MAP[error.status] || 'Search quota exceeded',
        {
          integration: 'search',
          method,
          resetTime: error.resetTime || Date.now() + 86400000 // Daily quota
        }
      );
    }

    // HTTP error codes
    if (error.status && SEARCH_ERROR_MAP[error.status]) {
      return new MCPError(SEARCH_ERROR_MAP[error.status], {
        integration: 'search',
        method,
        status: error.status,
        originalError: error.message
      });
    }

    // Generic error
    return new MCPError(
      `Search API error: ${error.message || 'Unknown error'}`,
      {
        integration: 'search',
        method,
        originalError: error
      }
    );
  }

  /**
   * Health check for Search MCP server
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    if (!SEARCH_ENABLED) {
      return { healthy: false, error: 'Integration disabled' };
    }

    const startTime = Date.now();
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      const latency = Date.now() - startTime;
      const healthy = response.ok;

      logger.debug('Search health check completed', {
        integration: 'search',
        healthy,
        latency
      });

      return { healthy, latency };
    } catch (error: any) {
      logger.warn('Search health check failed', {
        integration: 'search',
        error: error.message
      });
      return { healthy: false, error: error.message };
    }
  }

  /**
   * Get tool embeddings for semantic routing
   */
  async getToolEmbeddings(): Promise<ToolEmbedding[]> {
    // TODO: Implement once semantic router is fully integrated
    // For now, return empty array
    return [];
  }
}

/**
 * Factory function to create Search integration
 */
export function createSearchIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): SearchIntegration {
  return new SearchIntegration(oauthProxy, semanticRouter);
}
