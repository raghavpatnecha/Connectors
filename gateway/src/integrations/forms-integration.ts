/**
 * Google Forms MCP Integration Module
 * Connectors Platform - Forms integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Forms-specific configuration
const FORMS_RATE_LIMIT = parseInt(process.env.FORMS_RATE_LIMIT || '10', 10); // 10 requests per second
const FORMS_TIMEOUT_MS = parseInt(process.env.FORMS_TIMEOUT_MS || '15000', 10);
const FORMS_SERVER_URL = process.env.FORMS_SERVER_URL || 'http://localhost:3136';
const FORMS_ENABLED = process.env.FORMS_ENABLED !== 'false';

/**
 * Forms OAuth configuration (Google OAuth 2.0)
 * See: https://developers.google.com/forms/api/reference/rest
 */
export const FORMS_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.FORMS_REDIRECT_URI || 'http://localhost:3136/oauth/callback'
};

/**
 * Forms API error codes mapped to our error types
 */
const FORMS_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid form ID or parameters',
  401: 'Unauthorized - OAuth token expired or invalid',
  403: 'Forbidden - insufficient permissions or rate limit exceeded',
  404: 'Form or question not found',
  409: 'Conflict - concurrent modification detected',
  429: 'Rate limit exceeded - quota exhausted',
  500: 'Forms internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Forms API
 * Implements token bucket algorithm (10 req/s, 1000 req/min)
 */
class FormsRateLimiter {
  private _tokens: number = FORMS_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = FORMS_RATE_LIMIT;
  private readonly _refillRate: number = FORMS_RATE_LIMIT; // tokens per second

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
    logger.debug('Forms rate limit throttling', {
      integration: 'forms',
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
 * Forms Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Forms MCP server
 */
export class FormsIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: FormsRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new FormsRateLimiter();
    this._serverUrl = FORMS_SERVER_URL;

    logger.info('FormsIntegration constructed', {
      serverUrl: this._serverUrl,
      enabled: FORMS_ENABLED,
      rateLimit: `${FORMS_RATE_LIMIT} req/s`,
      timeout: `${FORMS_TIMEOUT_MS}ms`
    });
  }

  /**
   * Initialize Forms integration
   * - Register OAuth config
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!FORMS_ENABLED) {
      logger.info('Forms integration disabled');
      return;
    }

    logger.info('Initializing Forms integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('forms', FORMS_OAUTH_CONFIG);

    // Perform initial health check
    const healthResult = await this.healthCheck();
    this._isHealthy = healthResult.healthy;

    logger.info('Forms integration initialized successfully', {
      healthy: this._isHealthy,
      serverUrl: this._serverUrl
    });
  }

  /**
   * Check if Forms integration is enabled
   */
  isEnabled(): boolean {
    return FORMS_ENABLED;
  }

  /**
   * Get Forms MCP server URL
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
   * Proxy request to Forms MCP server with OAuth and rate limiting
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    // Check if enabled
    if (!FORMS_ENABLED) {
      throw new MCPError('Forms integration is disabled', {
        integration: 'forms'
      });
    }

    // Rate limiting
    await this._rateLimiter.acquire();

    logger.debug('Proxying Forms request', {
      integration: 'forms',
      method: req.method,
      availableTokens: this._rateLimiter.getAvailableTokens().toFixed(2)
    });

    try {
      // Proxy request through OAuth handler
      const response = await this._oauthProxy.proxyRequest({
        integration: 'forms',
        tenantId: req.params?.tenantId || 'default',
        method: 'POST',
        path: '/mcp',
        body: req,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: FORMS_TIMEOUT_MS
      });

      logger.info('Forms request executed successfully', {
        integration: 'forms',
        method: req.method,
        status: response.status
      });

      return response;
    } catch (error: any) {
      // Map Forms-specific errors
      const mappedError = this._mapFormsError(error, req.method);
      logger.error('Forms request failed', {
        integration: 'forms',
        method: req.method,
        error: mappedError.message,
        errorType: mappedError.constructor.name
      });
      throw mappedError;
    }
  }

  /**
   * Map Forms API errors to our error types
   */
  private _mapFormsError(error: any, method: string): Error {
    // Rate limit errors
    if (error.status === 429 || error.code === 429) {
      return new RateLimitError(
        FORMS_ERROR_MAP[429] || 'Rate limit exceeded',
        {
          integration: 'forms',
          method,
          resetTime: error.resetTime || Date.now() + 60000
        }
      );
    }

    // HTTP error codes
    if (error.status && FORMS_ERROR_MAP[error.status]) {
      return new MCPError(FORMS_ERROR_MAP[error.status], {
        integration: 'forms',
        method,
        status: error.status,
        originalError: error.message
      });
    }

    // Generic error
    return new MCPError(
      `Forms API error: ${error.message || 'Unknown error'}`,
      {
        integration: 'forms',
        method,
        originalError: error
      }
    );
  }

  /**
   * Health check for Forms MCP server
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    if (!FORMS_ENABLED) {
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

      logger.debug('Forms health check completed', {
        integration: 'forms',
        healthy,
        latency
      });

      return { healthy, latency };
    } catch (error: any) {
      logger.warn('Forms health check failed', {
        integration: 'forms',
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
 * Factory function to create Forms integration
 */
export function createFormsIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): FormsIntegration {
  return new FormsIntegration(oauthProxy, semanticRouter);
}
