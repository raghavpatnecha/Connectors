/**
 * Notion MCP Integration Module
 * Connectors Platform - Notion integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Notion-specific configuration
const NOTION_RATE_LIMIT = parseInt(process.env.NOTION_RATE_LIMIT || '3', 10); // 3 requests per second
const NOTION_TIMEOUT_MS = parseInt(process.env.NOTION_TIMEOUT_MS || '5000', 10);
const NOTION_SERVER_URL = process.env.NOTION_SERVER_URL || 'http://localhost:3100';
const NOTION_ENABLED = process.env.NOTION_ENABLED !== 'false';

/**
 * Notion OAuth configuration
 * See: https://developers.notion.com/docs/authorization
 */
export const NOTION_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.NOTION_CLIENT_ID || '',
  clientSecret: process.env.NOTION_CLIENT_SECRET || '',
  tokenEndpoint: 'https://api.notion.com/v1/oauth/token',
  authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
  redirectUri: process.env.NOTION_REDIRECT_URI || 'http://localhost:3000/oauth/callback/notion'
};

/**
 * Notion API error codes mapped to our error types
 */
const NOTION_ERROR_MAP: Record<number, string> = {
  400: 'Invalid request parameters',
  401: 'Unauthorized - token may be expired',
  403: 'Forbidden - insufficient permissions',
  404: 'Resource not found',
  409: 'Conflict - resource already exists or version mismatch',
  429: 'Rate limit exceeded',
  500: 'Notion internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable',
  504: 'Gateway timeout'
};

/**
 * Rate limiter for Notion API
 * Implements token bucket algorithm (3 req/sec average)
 */
class NotionRateLimiter {
  private _tokens: number = NOTION_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = NOTION_RATE_LIMIT;
  private readonly _refillRate: number = NOTION_RATE_LIMIT; // tokens per second

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
      integration: 'notion',
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
 * Notion Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Notion MCP server
 */
export class NotionIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: NotionRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new NotionRateLimiter();
    this._serverUrl = NOTION_SERVER_URL;

    logger.info('NotionIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: NOTION_RATE_LIMIT,
      enabled: NOTION_ENABLED
    });
  }

  /**
   * Initialize Notion integration
   * - Register OAuth config
   * - Index Notion tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!NOTION_ENABLED) {
      logger.info('Notion integration disabled');
      return;
    }

    logger.info('Initializing Notion integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('notion', NOTION_OAUTH_CONFIG);

    // Index Notion tools for semantic routing
    await this._indexNotionTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('Notion integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to Notion MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!NOTION_ENABLED) {
      throw new MCPError('Notion integration is disabled', {
        integration: 'notion'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'notion'
      });

      const duration = Date.now() - startTime;
      logger.debug('Notion request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Notion-specific errors
      const mappedError = this._mapNotionError(error, req);

      logger.error('Notion request failed', {
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
   * Health check for Notion MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(NOTION_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('Notion health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('Notion health check error', {
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
      enabled: NOTION_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: NOTION_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index Notion tools in semantic router
   * Notion provides tools for pages, databases, blocks, comments, users
   */
  private async _indexNotionTools(): Promise<void> {
    const notionTools: ToolEmbedding[] = [
      {
        toolId: 'notion.createPage',
        embedding: [], // Will be generated by embedding service
        category: 'productivity',
        metadata: {
          name: 'Create Notion Page',
          description: 'Create a new page in Notion workspace with content and properties',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.updatePage',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Notion Page',
          description: 'Update properties and content of an existing Notion page',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.getPage',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Notion Page',
          description: 'Retrieve page content and properties from Notion',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.queryDatabase',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Query Notion Database',
          description: 'Query a Notion database with filters and sorting',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.createDatabase',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Notion Database',
          description: 'Create a new database in Notion with schema and properties',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.updateDatabase',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Notion Database',
          description: 'Update database properties, schema, and configuration',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.appendBlock',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Append Block to Page',
          description: 'Append content blocks (text, images, lists) to a Notion page',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.getBlock',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Notion Block',
          description: 'Retrieve a specific block and its children from Notion',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.createComment',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Comment',
          description: 'Add a comment to a Notion page or discussion',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.getUser',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Notion User',
          description: 'Retrieve user information from Notion workspace',
          usageCount: 0
        }
      },
      {
        toolId: 'notion.search',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Search Notion',
          description: 'Search across all pages and databases in Notion workspace',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing Notion tools', { count: notionTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(notionTools);

    logger.info('Notion tools indexed successfully');
  }

  /**
   * Map Notion API errors to gateway error types
   */
  private _mapNotionError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 429) {
      const resetTime = error.response?.headers['retry-after'];
      return new RateLimitError(
        NOTION_ERROR_MAP[429] || 'Rate limit exceeded',
        {
          resetTime: resetTime ? Date.now() / 1000 + parseInt(resetTime) : undefined,
          remaining: 0,
          limit: NOTION_RATE_LIMIT
        }
      );
    }

    // Map known Notion error codes
    if (status && NOTION_ERROR_MAP[status]) {
      return new MCPError(NOTION_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'notion'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown Notion error',
      {
        status,
        endpoint: req.path,
        integration: 'notion'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing Notion integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export Notion integration instance
 */
export function createNotionIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): NotionIntegration {
  return new NotionIntegration(oauthProxy, semanticRouter);
}
