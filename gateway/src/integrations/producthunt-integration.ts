/**
 * Product Hunt MCP Integration Module
 * Connectors Platform - Product Hunt integration with API token auth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Product Hunt-specific configuration
const PRODUCTHUNT_RATE_LIMIT = parseInt(process.env.PRODUCTHUNT_RATE_LIMIT || '100', 10); // 100 requests per hour
const PRODUCTHUNT_TIMEOUT_MS = parseInt(process.env.PRODUCTHUNT_TIMEOUT_MS || '10000', 10);
const PRODUCTHUNT_SERVER_URL = process.env.PRODUCTHUNT_SERVER_URL || 'http://localhost:3140';
const PRODUCTHUNT_ENABLED = process.env.PRODUCTHUNT_ENABLED !== 'false';

/**
 * Product Hunt API error codes mapped to our error types
 */
const PRODUCTHUNT_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid parameters',
  401: 'Unauthorized - invalid or expired API token',
  403: 'Forbidden - insufficient permissions',
  404: 'Resource not found',
  429: 'Rate limit exceeded',
  500: 'Product Hunt internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable - Product Hunt may be down',
  504: 'Gateway timeout'
};

/**
 * Rate limiter for Product Hunt API
 * Implements token bucket algorithm (100 req/hour)
 */
class ProductHuntRateLimiter {
  private _tokens: number = PRODUCTHUNT_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = PRODUCTHUNT_RATE_LIMIT;
  private readonly _refillRate: number = PRODUCTHUNT_RATE_LIMIT / 3600; // tokens per second

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
    logger.debug('Rate limit throttling', {
      integration: 'producthunt',
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
 * Product Hunt Integration Handler
 * Manages API token auth, rate limiting, and error mapping for Product Hunt MCP server
 */
export class ProductHuntIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: ProductHuntRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new ProductHuntRateLimiter();
    this._serverUrl = PRODUCTHUNT_SERVER_URL;

    logger.info('Product Hunt integration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: PRODUCTHUNT_RATE_LIMIT,
      enabled: PRODUCTHUNT_ENABLED
    });
  }

  /**
   * Initialize Product Hunt integration
   * Performs health check and registers tools with semantic router
   */
  async initialize(): Promise<void> {
    if (!PRODUCTHUNT_ENABLED) {
      logger.warn('Product Hunt integration is disabled');
      return;
    }

    try {
      // Health check
      this._isHealthy = await this.healthCheck();
      if (!this._isHealthy) {
        logger.warn('Product Hunt MCP server health check failed');
        return;
      }

      // Register tool embeddings with semantic router
      await this._registerToolEmbeddings();

      logger.info('Product Hunt integration initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Product Hunt integration', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Register Product Hunt tool embeddings with semantic router
   * @private
   */
  private async _registerToolEmbeddings(): Promise<void> {
    const producthuntTools: ToolEmbedding[] = [
      {
        toolId: 'producthunt.getPostDetails',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Product Hunt Post Details',
          description: 'Get detailed information about a specific Product Hunt post including votes, comments, and maker details',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.getPosts',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Product Hunt Posts',
          description: 'Get a list of Product Hunt posts with filters for date, featured status, and sorting options',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.getTopic',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Product Hunt Topic',
          description: 'Get information about a Product Hunt topic including name, description, and follower count',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.searchTopics',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Search Product Hunt Topics',
          description: 'Search for Product Hunt topics by name or keyword to discover relevant product categories',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.getUser',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Product Hunt User',
          description: 'Get detailed information about a Product Hunt user including their profile, posts made, and upvoted products',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.getViewer',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Current Viewer',
          description: 'Get information about the currently authenticated Product Hunt user (API token owner)',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.getComment',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Product Hunt Comment',
          description: 'Get details about a specific comment on a Product Hunt post including author and votes',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.getPostComments',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Post Comments',
          description: 'Get all comments for a specific Product Hunt post with pagination support',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.getCollection',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Product Hunt Collection',
          description: 'Get details about a Product Hunt collection including featured products and curator information',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.getCollections',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Product Hunt Collections',
          description: 'Get a list of Product Hunt collections with filters and sorting options',
          usageCount: 0
        }
      },
      {
        toolId: 'producthunt.checkStatus',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Check Product Hunt Server Status',
          description: 'Health check endpoint to verify Product Hunt MCP server is running and accessible',
          usageCount: 0
        }
      }
    ];

    // Register all embeddings with semantic router
    for (const tool of producthuntTools) {
      await this._semanticRouter.addToolEmbedding(tool);
    }

    logger.info('Product Hunt tool embeddings registered', {
      toolCount: producthuntTools.length
    });
  }

  /**
   * Handle Product Hunt MCP request
   * Applies rate limiting and error mapping
   */
  async handleRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!PRODUCTHUNT_ENABLED) {
      throw new MCPError('Product Hunt integration is disabled', {
        integration: 'producthunt'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles API token injection from Vault)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'producthunt'
      });

      const duration = Date.now() - startTime;
      logger.debug('Product Hunt request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Product Hunt-specific errors
      const mappedError = this._mapProductHuntError(error, req);

      logger.error('Product Hunt request failed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: error.response?.status,
        error: mappedError.message,
        duration
      });

      throw mappedError;
    }
  }

  /**
   * Health check for Product Hunt MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(PRODUCTHUNT_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;
      return this._isHealthy;
    } catch (error) {
      logger.error('Product Hunt health check failed', {
        serverUrl: this._serverUrl,
        error: error instanceof Error ? error.message : String(error)
      });
      this._isHealthy = false;
      return false;
    }
  }

  /**
   * Get current status and metrics
   */
  getStatus(): {
    enabled: boolean;
    healthy: boolean;
    serverUrl: string;
    rateLimit: number;
    availableTokens: number;
  } {
    return {
      enabled: PRODUCTHUNT_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: PRODUCTHUNT_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Close Product Hunt integration
   * Cleanup resources
   */
  async close(): Promise<void> {
    logger.info('Closing Product Hunt integration');
    this._isHealthy = false;
  }

  /**
   * Map Product Hunt API errors to our error types
   * @private
   */
  private _mapProductHuntError(error: any, req: MCPRequest): Error {
    const status = error.response?.status || error.status;

    // Rate limit error
    if (status === 429) {
      const resetTime = error.response?.headers?.['x-ratelimit-reset'];
      return new RateLimitError(
        PRODUCTHUNT_ERROR_MAP[429] || 'Rate limit exceeded',
        { resetTime: resetTime ? parseInt(resetTime, 10) : undefined }
      );
    }

    // Other mapped errors
    const message = PRODUCTHUNT_ERROR_MAP[status] || error.message || 'Product Hunt API error';

    return new MCPError(message, {
      status,
      integration: 'producthunt',
      method: req.method,
      path: req.path
    });
  }
}

/**
 * Factory function to create Product Hunt integration instance
 */
export function createProductHuntIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): ProductHuntIntegration {
  return new ProductHuntIntegration(oauthProxy, semanticRouter);
}
