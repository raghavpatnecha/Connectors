/**
 * Google Chat MCP Integration Module
 * Connectors Platform - Chat integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Chat-specific configuration
const CHAT_RATE_LIMIT = parseInt(process.env.CHAT_RATE_LIMIT || '20', 10); // 20 requests per second
const CHAT_TIMEOUT_MS = parseInt(process.env.CHAT_TIMEOUT_MS || '10000', 10);
const CHAT_SERVER_URL = process.env.CHAT_SERVER_URL || 'http://localhost:3138';
const CHAT_ENABLED = process.env.CHAT_ENABLED !== 'false';

/**
 * Chat OAuth configuration (Google OAuth 2.0)
 * See: https://developers.google.com/chat/api/guides/auth
 */
export const CHAT_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.CHAT_REDIRECT_URI || 'http://localhost:3138/oauth/callback',
  scopes: [
    'https://www.googleapis.com/auth/chat.messages',
    'https://www.googleapis.com/auth/chat.messages.create',
    'https://www.googleapis.com/auth/chat.spaces',
    'https://www.googleapis.com/auth/chat.spaces.readonly'
  ]
};

/**
 * Chat API error codes mapped to our error types
 */
const CHAT_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid space, message, or parameters',
  401: 'Unauthorized - OAuth token expired or invalid',
  403: 'Forbidden - insufficient permissions or rate limit exceeded',
  404: 'Resource not found - space, message, or member does not exist',
  409: 'Conflict - concurrent modification detected',
  429: 'Rate limit exceeded - quota exhausted',
  500: 'Chat internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Chat API
 * Implements token bucket algorithm (20 req/s, 1200 req/min)
 */
class ChatRateLimiter {
  private _tokens: number = CHAT_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = CHAT_RATE_LIMIT;
  private readonly _refillRate: number = CHAT_RATE_LIMIT; // tokens per second

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
    logger.debug('Chat rate limit throttling', {
      integration: 'chat',
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
 * Chat Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Chat MCP server
 */
export class ChatIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: ChatRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new ChatRateLimiter();
    this._serverUrl = CHAT_SERVER_URL;

    logger.info('ChatIntegration constructed', {
      serverUrl: this._serverUrl,
      enabled: CHAT_ENABLED,
      rateLimit: `${CHAT_RATE_LIMIT} req/s`,
      timeout: `${CHAT_TIMEOUT_MS}ms`
    });
  }

  /**
   * Initialize Chat integration
   * - Register OAuth config
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!CHAT_ENABLED) {
      logger.info('Chat integration disabled');
      return;
    }

    logger.info('Initializing Chat integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('chat', CHAT_OAUTH_CONFIG);

    // Perform initial health check
    const healthResult = await this.healthCheck();
    this._isHealthy = healthResult.healthy;

    logger.info('Chat integration initialized successfully', {
      healthy: this._isHealthy,
      serverUrl: this._serverUrl
    });
  }

  /**
   * Check if Chat integration is enabled
   */
  isEnabled(): boolean {
    return CHAT_ENABLED;
  }

  /**
   * Get Chat MCP server URL
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
   * Proxy request to Chat MCP server with OAuth and rate limiting
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    // Check if enabled
    if (!CHAT_ENABLED) {
      throw new MCPError('Chat integration is disabled', {
        integration: 'chat'
      });
    }

    // Rate limiting
    await this._rateLimiter.acquire();

    logger.debug('Proxying Chat request', {
      integration: 'chat',
      method: req.method,
      availableTokens: this._rateLimiter.getAvailableTokens().toFixed(2)
    });

    try {
      // Proxy request through OAuth handler
      const response = await this._oauthProxy.proxyRequest({
        integration: 'chat',
        tenantId: req.params?.tenantId || 'default',
        method: 'POST',
        path: '/mcp',
        body: req,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: CHAT_TIMEOUT_MS
      });

      logger.info('Chat request executed successfully', {
        integration: 'chat',
        method: req.method,
        status: response.status
      });

      return response;
    } catch (error: any) {
      // Map Chat-specific errors
      const mappedError = this._mapChatError(error, req.method);
      logger.error('Chat request failed', {
        integration: 'chat',
        method: req.method,
        error: mappedError.message,
        errorType: mappedError.constructor.name
      });
      throw mappedError;
    }
  }

  /**
   * Map Chat API errors to our error types
   */
  private _mapChatError(error: any, method: string): Error {
    // Rate limit errors
    if (error.status === 429 || error.code === 429) {
      return new RateLimitError(
        CHAT_ERROR_MAP[429] || 'Rate limit exceeded',
        {
          integration: 'chat',
          method,
          resetTime: error.resetTime || Date.now() + 60000
        }
      );
    }

    // HTTP error codes
    if (error.status && CHAT_ERROR_MAP[error.status]) {
      return new MCPError(CHAT_ERROR_MAP[error.status], {
        integration: 'chat',
        method,
        status: error.status,
        originalError: error.message
      });
    }

    // Generic error
    return new MCPError(
      `Chat API error: ${error.message || 'Unknown error'}`,
      {
        integration: 'chat',
        method,
        originalError: error
      }
    );
  }

  /**
   * Health check for Chat MCP server
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
  }> {
    if (!CHAT_ENABLED) {
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

      logger.debug('Chat health check completed', {
        integration: 'chat',
        healthy,
        latency
      });

      return { healthy, latency };
    } catch (error: any) {
      logger.warn('Chat health check failed', {
        integration: 'chat',
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
 * Factory function to create Chat integration
 */
export function createChatIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): ChatIntegration {
  return new ChatIntegration(oauthProxy, semanticRouter);
}
