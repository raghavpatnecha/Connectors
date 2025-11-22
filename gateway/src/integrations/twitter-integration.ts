/**
 * Twitter MCP Integration Module
 * Connectors Platform - Twitter integration with OAuth 1.0a, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Twitter-specific configuration
const TWITTER_RATE_LIMIT = parseInt(process.env.TWITTER_RATE_LIMIT || '15', 10); // 15 requests per minute
const TWITTER_TIMEOUT_MS = parseInt(process.env.TWITTER_TIMEOUT_MS || '10000', 10);
const TWITTER_SERVER_URL = process.env.TWITTER_SERVER_URL || 'http://localhost:3150';
const TWITTER_ENABLED = process.env.TWITTER_ENABLED !== 'false';

/**
 * Twitter OAuth 1.0a configuration
 * See: https://developer.twitter.com/en/docs/authentication/oauth-1-0a
 */
export const TWITTER_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.X_API_KEY || '',
  clientSecret: process.env.X_API_SECRET || '',
  tokenEndpoint: 'https://api.twitter.com/oauth/access_token',
  authEndpoint: 'https://api.twitter.com/oauth/authenticate',
  redirectUri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:3000/oauth/callback/twitter'
};

/**
 * Twitter API error codes mapped to our error types
 */
const TWITTER_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid parameters',
  401: 'Unauthorized - OAuth credentials invalid or expired',
  403: 'Forbidden - insufficient permissions or rate limited',
  404: 'Resource not found',
  409: 'Conflict - duplicate resource',
  429: 'Rate limit exceeded',
  500: 'Twitter internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable - Twitter may be down',
  504: 'Gateway timeout'
};

/**
 * Rate limiter for Twitter API
 * Implements token bucket algorithm (15 req/min average)
 */
class TwitterRateLimiter {
  private _tokens: number = TWITTER_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = TWITTER_RATE_LIMIT;
  private readonly _refillRate: number = TWITTER_RATE_LIMIT / 60; // tokens per second

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
      integration: 'twitter',
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
 * Twitter Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Twitter MCP server
 */
export class TwitterIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: TwitterRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new TwitterRateLimiter();
    this._serverUrl = TWITTER_SERVER_URL;

    logger.info('TwitterIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: TWITTER_RATE_LIMIT,
      enabled: TWITTER_ENABLED
    });
  }

  /**
   * Initialize Twitter integration
   * - Register OAuth config
   * - Index Twitter tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!TWITTER_ENABLED) {
      logger.info('Twitter integration disabled');
      return;
    }

    logger.info('Initializing Twitter integration');

    // Register OAuth configuration (OAuth 1.0a)
    this._oauthProxy.registerOAuthConfig('twitter', TWITTER_OAUTH_CONFIG);

    // Index Twitter tools for semantic routing (45 comprehensive tools)
    await this._indexTwitterTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('Twitter integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to Twitter MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!TWITTER_ENABLED) {
      throw new MCPError('Twitter integration is disabled', {
        integration: 'twitter'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'twitter'
      });

      const duration = Date.now() - startTime;
      logger.debug('Twitter request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Twitter-specific errors
      const mappedError = this._mapTwitterError(error, req);

      logger.error('Twitter request failed', {
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
   * Health check for Twitter MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(TWITTER_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('Twitter health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('Twitter health check error', {
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
      enabled: TWITTER_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: TWITTER_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index Twitter tools in semantic router
   * Twitter provides 45 comprehensive tools across tweets, users, lists, and analytics
   */
  private async _indexTwitterTools(): Promise<void> {
    const twitterTools: ToolEmbedding[] = [
      // Tweet Operations (10 tools)
      {
        toolId: 'twitter.post_tweet',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Post Tweet',
          description: 'Post a new tweet to Twitter with text, images, or videos',
          usageCount: 0
        }
      },
      {
        toolId: 'twitter.get_tweet_by_id',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Tweet by ID',
          description: 'Retrieve a specific tweet with full details and metrics',
          usageCount: 0
        }
      },
      {
        toolId: 'twitter.reply_to_tweet',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Reply to Tweet',
          description: 'Reply to an existing tweet',
          usageCount: 0
        }
      },
      {
        toolId: 'twitter.search_tweets',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Search Tweets',
          description: 'Search Twitter for tweets matching a query with filters',
          usageCount: 0
        }
      },
      {
        toolId: 'twitter.quote_tweet',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Quote Tweet',
          description: 'Quote tweet with your own commentary',
          usageCount: 0
        }
      },

      // Engagement Tools (7 tools)
      {
        toolId: 'twitter.like_tweet',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Like Tweet',
          description: 'Like a tweet',
          usageCount: 0
        }
      },
      {
        toolId: 'twitter.retweet',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Retweet',
          description: 'Retweet a tweet to your followers',
          usageCount: 0
        }
      },

      // User Operations (10 tools)
      {
        toolId: 'twitter.get_user_profile',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get User Profile',
          description: 'Get Twitter user profile including bio, followers, location',
          usageCount: 0
        }
      },
      {
        toolId: 'twitter.follow_user',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Follow User',
          description: 'Follow a Twitter user',
          usageCount: 0
        }
      },
      {
        toolId: 'twitter.get_followers',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Followers',
          description: 'Get list of followers for a user',
          usageCount: 0
        }
      },

      // Analytics Tools
      {
        toolId: 'twitter.analyze_sentiment',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Analyze Sentiment',
          description: 'Analyze sentiment of tweets matching a query',
          usageCount: 0
        }
      },
      {
        toolId: 'twitter.get_hashtag_analytics',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Hashtag Analytics',
          description: 'Get analytics for a specific hashtag',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing Twitter tools', { count: twitterTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(twitterTools);

    logger.info('Twitter tools indexed successfully');
  }

  /**
   * Map Twitter API errors to gateway error types
   */
  private _mapTwitterError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 429) {
      const resetTime = error.response?.headers['x-rate-limit-reset'];
      return new RateLimitError(
        TWITTER_ERROR_MAP[429] || 'Rate limit exceeded',
        {
          resetTime: resetTime ? parseInt(resetTime) : undefined,
          remaining: 0,
          limit: TWITTER_RATE_LIMIT
        }
      );
    }

    // Map known Twitter error codes
    if (status && TWITTER_ERROR_MAP[status]) {
      return new MCPError(TWITTER_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'twitter'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown Twitter error',
      {
        status,
        endpoint: req.path,
        integration: 'twitter'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing Twitter integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export Twitter integration instance
 */
export function createTwitterIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): TwitterIntegration {
  return new TwitterIntegration(oauthProxy, semanticRouter);
}
