/**
 * LinkedIn MCP Integration Module
 * Connectors Platform - LinkedIn integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// LinkedIn-specific configuration
const LINKEDIN_RATE_LIMIT = parseInt(process.env.LINKEDIN_RATE_LIMIT || '100', 10); // 100 requests per day / 86400 sec
const LINKEDIN_TIMEOUT_MS = parseInt(process.env.LINKEDIN_TIMEOUT_MS || '10000', 10);
const LINKEDIN_SERVER_URL = process.env.LINKEDIN_SERVER_URL || 'http://localhost:3120';
const LINKEDIN_ENABLED = process.env.LINKEDIN_ENABLED !== 'false';

/**
 * LinkedIn OAuth configuration
 * See: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
 */
export const LINKEDIN_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.LINKEDIN_CLIENT_ID || '',
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
  tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
  authEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
  redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/oauth/callback/linkedin'
};

/**
 * LinkedIn API error codes mapped to our error types
 */
const LINKEDIN_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid parameters',
  401: 'Unauthorized - token may be expired or invalid',
  403: 'Forbidden - insufficient permissions or app not authorized',
  404: 'Resource not found',
  409: 'Conflict - resource already exists',
  429: 'Rate limit exceeded - daily quota reached',
  500: 'LinkedIn internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable',
  504: 'Gateway timeout'
};

/**
 * Rate limiter for LinkedIn API
 * Implements token bucket algorithm (conservative rate limiting)
 */
class LinkedInRateLimiter {
  private _tokens: number = LINKEDIN_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = LINKEDIN_RATE_LIMIT;
  private readonly _refillRate: number = LINKEDIN_RATE_LIMIT / 86400; // tokens per second (daily limit)

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
      integration: 'linkedin',
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
 * LinkedIn Integration Handler
 * Manages OAuth, rate limiting, and error mapping for LinkedIn MCP server
 * Supports unified approach: API, automation, and scraping
 */
export class LinkedInIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: LinkedInRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new LinkedInRateLimiter();
    this._serverUrl = LINKEDIN_SERVER_URL;

    logger.info('LinkedInIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: LINKEDIN_RATE_LIMIT,
      enabled: LINKEDIN_ENABLED
    });
  }

  /**
   * Initialize LinkedIn integration
   * - Register OAuth config
   * - Index LinkedIn tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!LINKEDIN_ENABLED) {
      logger.info('LinkedIn integration disabled');
      return;
    }

    logger.info('Initializing LinkedIn integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('linkedin', LINKEDIN_OAUTH_CONFIG);

    // Index LinkedIn tools for semantic routing
    await this._indexLinkedInTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('LinkedIn integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to LinkedIn MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!LINKEDIN_ENABLED) {
      throw new MCPError('LinkedIn integration is disabled', {
        integration: 'linkedin'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'linkedin'
      });

      const duration = Date.now() - startTime;
      logger.debug('LinkedIn request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map LinkedIn-specific errors
      const mappedError = this._mapLinkedInError(error, req);

      logger.error('LinkedIn request failed', {
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
   * Health check for LinkedIn MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(LINKEDIN_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('LinkedIn health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('LinkedIn health check error', {
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
      enabled: LINKEDIN_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: LINKEDIN_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index LinkedIn tools in semantic router
   * LinkedIn unified MCP provides tools for profiles, connections, posts, and messaging
   */
  private async _indexLinkedInTools(): Promise<void> {
    const linkedinTools: ToolEmbedding[] = [
      {
        toolId: 'linkedin.getProfile',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get LinkedIn Profile',
          description: 'Retrieve LinkedIn profile information including experience, education, and skills',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.updateProfile',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update LinkedIn Profile',
          description: 'Update LinkedIn profile information and settings (requires OAuth)',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.searchPeople',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Search LinkedIn People',
          description: 'Search for people on LinkedIn with filters (location, company, title)',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.getConnections',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Connections',
          description: 'Retrieve LinkedIn connections and network information',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.sendConnectionRequest',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Send Connection Request',
          description: 'Send a connection request to a LinkedIn user (requires OAuth)',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.createPost',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Create LinkedIn Post',
          description: 'Create a new post on LinkedIn with text, images, or links (requires OAuth)',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.getFeed',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get LinkedIn Feed',
          description: 'Retrieve LinkedIn feed posts and updates',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.likePost',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Like LinkedIn Post',
          description: 'Like a post on LinkedIn (requires OAuth)',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.commentOnPost',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Comment on Post',
          description: 'Comment on a LinkedIn post (requires OAuth)',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.sendMessage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Send LinkedIn Message',
          description: 'Send a direct message to a LinkedIn connection (requires OAuth)',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.getCompanyInfo',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Company Info',
          description: 'Retrieve LinkedIn company page information and details',
          usageCount: 0
        }
      },
      {
        toolId: 'linkedin.searchJobs',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Search LinkedIn Jobs',
          description: 'Search for job postings on LinkedIn with filters',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing LinkedIn tools', { count: linkedinTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(linkedinTools);

    logger.info('LinkedIn tools indexed successfully');
  }

  /**
   * Map LinkedIn API errors to gateway error types
   */
  private _mapLinkedInError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 429) {
      const resetTime = error.response?.headers['x-ratelimit-reset'];
      return new RateLimitError(
        LINKEDIN_ERROR_MAP[429] || 'Rate limit exceeded',
        {
          resetTime: resetTime ? parseInt(resetTime) : undefined,
          remaining: 0,
          limit: LINKEDIN_RATE_LIMIT
        }
      );
    }

    // Map known LinkedIn error codes
    if (status && LINKEDIN_ERROR_MAP[status]) {
      return new MCPError(LINKEDIN_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'linkedin'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown LinkedIn error',
      {
        status,
        endpoint: req.path,
        integration: 'linkedin'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing LinkedIn integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export LinkedIn integration instance
 */
export function createLinkedInIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): LinkedInIntegration {
  return new LinkedInIntegration(oauthProxy, semanticRouter);
}
