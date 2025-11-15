/**
 * Google Slides MCP Integration Module
 * Connectors Platform - Slides integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Slides-specific configuration
const SLIDES_RATE_LIMIT = parseInt(process.env.SLIDES_RATE_LIMIT || '10', 10); // 10 requests per second
const SLIDES_TIMEOUT_MS = parseInt(process.env.SLIDES_TIMEOUT_MS || '15000', 10);
const SLIDES_SERVER_URL = process.env.SLIDES_SERVER_URL || 'http://localhost:3135';
const SLIDES_ENABLED = process.env.SLIDES_ENABLED !== 'false';

/**
 * Slides OAuth configuration (Google OAuth 2.0)
 * See: https://developers.google.com/slides/api/reference/rest
 */
export const SLIDES_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.SLIDES_REDIRECT_URI || 'http://localhost:3135/oauth/callback'
};

/**
 * Slides API error codes mapped to our error types
 */
const SLIDES_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid presentation ID or parameters',
  401: 'Unauthorized - OAuth token expired or invalid',
  403: 'Forbidden - insufficient permissions or rate limit exceeded',
  404: 'Presentation or slide not found',
  409: 'Conflict - concurrent modification detected',
  429: 'Rate limit exceeded - quota exhausted',
  500: 'Slides internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Slides API
 * Implements token bucket algorithm (10 req/s, 1000 req/min)
 */
class SlidesRateLimiter {
  private _tokens: number = SLIDES_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = SLIDES_RATE_LIMIT;
  private readonly _refillRate: number = SLIDES_RATE_LIMIT; // tokens per second

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
    logger.debug('Slides rate limit throttling', {
      integration: 'slides',
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
 * Slides Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Slides MCP server
 */
export class SlidesIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: SlidesRateLimiter;
  private readonly _serverUrl: string;
  private readonly _enabled: boolean;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new SlidesRateLimiter();
    this._serverUrl = SLIDES_SERVER_URL;
    this._enabled = SLIDES_ENABLED;

    logger.info('Slides integration initialized', {
      serverUrl: this._serverUrl,
      enabled: this._enabled,
      rateLimit: `${SLIDES_RATE_LIMIT} req/s`,
      timeout: `${SLIDES_TIMEOUT_MS}ms`
    });
  }

  /**
   * Check if Slides integration is enabled
   */
  isEnabled(): boolean {
    return this._enabled;
  }

  /**
   * Get Slides MCP server URL
   */
  getServerUrl(): string {
    return this._serverUrl;
  }

  /**
   * Call Slides MCP tool with OAuth and rate limiting
   */
  async callTool(
    toolName: string,
    args: Record<string, unknown>,
    tenantId: string
  ): Promise<MCPResponse> {
    // Check if enabled
    if (!this._enabled) {
      throw new MCPError('Slides integration is disabled', {
        integration: 'slides',
        toolName
      });
    }

    // Rate limiting
    await this._rateLimiter.acquire();

    // Build MCP request
    const request: MCPRequest = {
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: { ...args, tenantId }
      }
    };

    logger.debug('Calling Slides tool', {
      integration: 'slides',
      toolName,
      tenantId,
      availableTokens: this._rateLimiter.getAvailableTokens().toFixed(2)
    });

    try {
      // Proxy request through OAuth handler
      const response = await this._oauthProxy.proxyRequest({
        integration: 'slides',
        tenantId,
        method: 'POST',
        path: '/mcp',
        body: request,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: SLIDES_TIMEOUT_MS
      });

      logger.info('Slides tool executed successfully', {
        integration: 'slides',
        toolName,
        tenantId,
        status: response.status
      });

      return response;
    } catch (error: any) {
      // Map Slides-specific errors
      const mappedError = this._mapSlidesError(error, toolName);
      logger.error('Slides tool execution failed', {
        integration: 'slides',
        toolName,
        tenantId,
        error: mappedError.message,
        errorType: mappedError.constructor.name
      });
      throw mappedError;
    }
  }

  /**
   * Map Slides API errors to our error types
   */
  private _mapSlidesError(error: any, toolName: string): Error {
    // Rate limit errors
    if (error.status === 429 || error.code === 429) {
      return new RateLimitError(
        SLIDES_ERROR_MAP[429] || 'Rate limit exceeded',
        {
          integration: 'slides',
          toolName,
          resetTime: error.resetTime || Date.now() + 60000
        }
      );
    }

    // HTTP error codes
    if (error.status && SLIDES_ERROR_MAP[error.status]) {
      return new MCPError(SLIDES_ERROR_MAP[error.status], {
        integration: 'slides',
        toolName,
        status: error.status,
        originalError: error.message
      });
    }

    // Generic error
    return new MCPError(
      `Slides API error: ${error.message || 'Unknown error'}`,
      {
        integration: 'slides',
        toolName,
        originalError: error
      }
    );
  }

  /**
   * Health check for Slides MCP server
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    if (!this._enabled) {
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

      logger.debug('Slides health check completed', {
        integration: 'slides',
        healthy,
        latency
      });

      return { healthy, latency };
    } catch (error: any) {
      logger.warn('Slides health check failed', {
        integration: 'slides',
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
 * Factory function to create Slides integration
 */
export function createSlidesIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): SlidesIntegration {
  return new SlidesIntegration(oauthProxy, semanticRouter);
}
