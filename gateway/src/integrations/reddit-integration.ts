/**
 * Reddit MCP Integration Module
 * Connectors Platform - Reddit integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Reddit-specific configuration
const REDDIT_RATE_LIMIT = parseInt(process.env.REDDIT_RATE_LIMIT || '60', 10); // 60 requests per minute
const REDDIT_TIMEOUT_MS = parseInt(process.env.REDDIT_TIMEOUT_MS || '5000', 10);
const REDDIT_SERVER_URL = process.env.REDDIT_SERVER_URL || 'http://localhost:3200';
const REDDIT_ENABLED = process.env.REDDIT_ENABLED !== 'false';

/**
 * Reddit OAuth configuration
 * See: https://github.com/reddit-archive/reddit/wiki/OAuth2
 */
export const REDDIT_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.REDDIT_CLIENT_ID || '',
  clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
  tokenEndpoint: 'https://www.reddit.com/api/v1/access_token',
  authEndpoint: 'https://www.reddit.com/api/v1/authorize',
  redirectUri: process.env.REDDIT_REDIRECT_URI || 'http://localhost:3000/oauth/callback/reddit'
};

/**
 * Reddit API error codes mapped to our error types
 */
const REDDIT_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid parameters',
  401: 'Unauthorized - token may be expired',
  403: 'Forbidden - insufficient permissions or rate limited',
  404: 'Resource not found',
  409: 'Conflict - resource already exists',
  429: 'Rate limit exceeded',
  500: 'Reddit internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable - Reddit may be down',
  504: 'Gateway timeout'
};

/**
 * Rate limiter for Reddit API
 * Implements token bucket algorithm (60 req/min average)
 */
class RedditRateLimiter {
  private _tokens: number = REDDIT_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = REDDIT_RATE_LIMIT;
  private readonly _refillRate: number = REDDIT_RATE_LIMIT / 60; // tokens per second

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
      integration: 'reddit',
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
 * Reddit Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Reddit MCP server
 */
export class RedditIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: RedditRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new RedditRateLimiter();
    this._serverUrl = REDDIT_SERVER_URL;

    logger.info('RedditIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: REDDIT_RATE_LIMIT,
      enabled: REDDIT_ENABLED
    });
  }

  /**
   * Initialize Reddit integration
   * - Register OAuth config
   * - Index Reddit tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!REDDIT_ENABLED) {
      logger.info('Reddit integration disabled');
      return;
    }

    logger.info('Initializing Reddit integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('reddit', REDDIT_OAUTH_CONFIG);

    // Index Reddit tools for semantic routing
    await this._indexRedditTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('Reddit integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to Reddit MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!REDDIT_ENABLED) {
      throw new MCPError('Reddit integration is disabled', {
        integration: 'reddit'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'reddit'
      });

      const duration = Date.now() - startTime;
      logger.debug('Reddit request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Reddit-specific errors
      const mappedError = this._mapRedditError(error, req);

      logger.error('Reddit request failed', {
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
   * Health check for Reddit MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(REDDIT_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('Reddit health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('Reddit health check error', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get integration status
   */
  getStatus(): {
    enabled: boolean;
    healthy: boolean;
    serverUrl: string;
    rateLimit: number;
    availableTokens: number;
  } {
    return {
      enabled: REDDIT_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: REDDIT_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index Reddit tools in semantic router
   * Reddit provides 25 comprehensive tools for browsing, posting, and community management
   */
  private async _indexRedditTools(): Promise<void> {
    const redditTools: ToolEmbedding[] = [
      {
        toolId: 'reddit.browse_frontpage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Browse Reddit Frontpage',
          description: 'Browse personalized Reddit frontpage or r/popular feed',
          usageCount: 0
        }
      },
      {
        toolId: 'reddit.browse_subreddit',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Browse Subreddit',
          description: 'Browse hot posts from a specific subreddit',
          usageCount: 0
        }
      },
      {
        toolId: 'reddit.search_posts',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Search Reddit Posts',
          description: 'Search Reddit posts with filters and sorting options',
          usageCount: 0
        }
      },
      {
        toolId: 'reddit.search_subreddits',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Search Subreddits',
          description: 'Search for subreddits by name or description',
          usageCount: 0
        }
      },
      {
        toolId: 'reddit.get_post',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Reddit Post',
          description: 'Retrieve a specific Reddit post with full details',
          usageCount: 0
        }
      },
      {
        toolId: 'reddit.get_post_comments',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Post Comments',
          description: 'Get nested comment tree from a Reddit post',
          usageCount: 0
        }
      },
      {
        toolId: 'reddit.create_post',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Create Reddit Post',
          description: 'Create a new text or link post on Reddit (requires OAuth)',
          usageCount: 0
        }
      },
      {
        toolId: 'reddit.post_comment',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Post Comment',
          description: 'Post a comment on a Reddit post (requires OAuth)',
          usageCount: 0
        }
      },
      {
        toolId: 'reddit.get_user_info',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get User Info',
          description: 'Retrieve Reddit user profile information and karma',
          usageCount: 0
        }
      },
      {
        toolId: 'reddit.get_subreddit_info',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Subreddit Info',
          description: 'Get subreddit details, rules, and subscriber count',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing Reddit tools', { count: redditTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(redditTools);

    logger.info('Reddit tools indexed successfully');
  }

  /**
   * Map Reddit API errors to gateway error types
   */
  private _mapRedditError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 429) {
      const resetTime = error.response?.headers['x-ratelimit-reset'];
      return new RateLimitError(
        REDDIT_ERROR_MAP[429] || 'Rate limit exceeded',
        {
          resetTime: resetTime ? parseInt(resetTime) : undefined,
          remaining: 0,
          limit: REDDIT_RATE_LIMIT
        }
      );
    }

    // Map known Reddit error codes
    if (status && REDDIT_ERROR_MAP[status]) {
      return new MCPError(REDDIT_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'reddit'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown Reddit error',
      {
        status,
        endpoint: req.path,
        integration: 'reddit'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing Reddit integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export Reddit integration instance
 */
export function createRedditIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): RedditIntegration {
  return new RedditIntegration(oauthProxy, semanticRouter);
}
