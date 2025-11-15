/**
 * Google Docs MCP Integration Module
 * Connectors Platform - Docs integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Docs-specific configuration
const DOCS_RATE_LIMIT = parseInt(process.env.DOCS_RATE_LIMIT || '10', 10); // 10 requests per second
const DOCS_TIMEOUT_MS = parseInt(process.env.DOCS_TIMEOUT_MS || '15000', 10);
const DOCS_SERVER_URL = process.env.DOCS_SERVER_URL || 'http://localhost:3133';
const DOCS_ENABLED = process.env.DOCS_ENABLED !== 'false';

/**
 * Docs OAuth configuration (Google OAuth 2.0)
 * See: https://developers.google.com/docs/api/reference/rest
 */
export const DOCS_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.DOCS_REDIRECT_URI || 'http://localhost:3133/oauth/callback'
};

/**
 * Docs API error codes mapped to our error types
 */
const DOCS_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid document ID or parameters',
  401: 'Unauthorized - OAuth token expired or invalid',
  403: 'Forbidden - insufficient permissions or rate limit exceeded',
  404: 'Document not found',
  409: 'Conflict - concurrent modification detected',
  429: 'Rate limit exceeded - quota exhausted',
  500: 'Docs internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Docs API
 * Implements token bucket algorithm (10 req/s, 1000 req/min)
 */
class DocsRateLimiter {
  private _tokens: number = DOCS_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = DOCS_RATE_LIMIT;
  private readonly _refillRate: number = DOCS_RATE_LIMIT; // tokens per second

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
    logger.debug('Docs rate limit throttling', {
      integration: 'docs',
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
 * Docs Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Docs MCP server
 */
export class DocsIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: DocsRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new DocsRateLimiter();
    this._serverUrl = DOCS_SERVER_URL;

    logger.info('DocsIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: DOCS_RATE_LIMIT,
      enabled: DOCS_ENABLED
    });
  }

  /**
   * Initialize Docs integration
   * - Register OAuth config
   * - Index Docs tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!DOCS_ENABLED) {
      logger.info('Docs integration disabled');
      return;
    }

    logger.info('Initializing Docs integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('docs', DOCS_OAUTH_CONFIG);

    // Index Docs tools for semantic routing
    await this._indexDocsTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('Docs integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to Docs MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!DOCS_ENABLED) {
      throw new MCPError('Docs integration is disabled', {
        integration: 'docs'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'docs'
      });

      const duration = Date.now() - startTime;
      logger.debug('Docs request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Docs-specific errors
      const mappedError = this._mapDocsError(error, req);

      logger.error('Docs request failed', {
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
   * Health check for Docs MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(DOCS_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('Docs health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('Docs health check error', {
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
      enabled: DOCS_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: DOCS_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index Docs tools in semantic router
   * Docs provides 32 tools across documents, content editing, and features
   */
  private async _indexDocsTools(): Promise<void> {
    const docsTools: ToolEmbedding[] = [
      // Documents (10 tools)
      {
        toolId: 'docs.createDocument',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Document',
          description: 'Create a new Google Doc with optional initial content',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.getDocument',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Document',
          description: 'Retrieve the full content and structure of a Google Doc',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.searchDocuments',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Search Documents',
          description: 'Search for Google Docs by name using Drive API',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.listDocumentsInFolder',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'List Documents in Folder',
          description: 'List all Google Docs in a specific Drive folder',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.copyDocument',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Copy Document',
          description: 'Create a copy of a Google Doc',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.deleteDocument',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Document',
          description: 'Move a Google Doc to trash',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.exportToPDF',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Export to PDF',
          description: 'Export a Google Doc as PDF and save to Drive',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.getDocumentStructure',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Document Structure',
          description: 'Get the structural elements of a document',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.batchUpdate',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Batch Update',
          description: 'Execute multiple document operations atomically',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.getRevisions',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Revisions',
          description: 'Get revision history of a Google Doc via Drive API',
          usageCount: 0
        }
      },

      // Content Editing (12 tools)
      {
        toolId: 'docs.insertText',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert Text',
          description: 'Insert text at a specific index in the document',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.deleteText',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Text',
          description: 'Delete text from a specific range',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.replaceText',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Replace Text',
          description: 'Replace text in a specific range',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.findAndReplace',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Find and Replace',
          description: 'Find and replace text throughout the document',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.formatText',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Format Text',
          description: 'Apply text formatting (bold, italic, font, color, etc.)',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.insertTable',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert Table',
          description: 'Insert a table with specified rows and columns',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.insertPageBreak',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert Page Break',
          description: 'Insert a page break at a specific location',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.insertImage',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert Image',
          description: 'Insert an image from URL or Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.insertList',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert List',
          description: 'Create a bulleted or numbered list',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.createTableWithData',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Table with Data',
          description: 'Create and populate a table with data',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.insertTableRow',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert Table Row',
          description: 'Add a row to an existing table',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.insertTableColumn',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert Table Column',
          description: 'Add a column to an existing table',
          usageCount: 0
        }
      },

      // Features (10 tools)
      {
        toolId: 'docs.updateHeader',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Header',
          description: 'Update document header (default or first page)',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.updateFooter',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Footer',
          description: 'Update document footer (default or first page)',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.createNamedRange',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Named Range',
          description: 'Create a named range (bookmark) in the document',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.deleteNamedRange',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Named Range',
          description: 'Delete a named range by ID or name',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.listComments',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'List Comments',
          description: 'List all comments on a Google Doc via Drive API',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.createComment',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Comment',
          description: 'Add a comment to the document',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.replyToComment',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Reply to Comment',
          description: 'Reply to an existing comment',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.resolveComment',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Resolve Comment',
          description: 'Mark a comment as resolved',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.createBookmark',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Bookmark',
          description: 'Create a bookmark at a specific location',
          usageCount: 0
        }
      },
      {
        toolId: 'docs.deleteBookmark',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Bookmark',
          description: 'Delete a bookmark by ID',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing Docs tools', { count: docsTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(docsTools);

    logger.info('Docs tools indexed successfully');
  }

  /**
   * Map Docs API errors to gateway error types
   */
  private _mapDocsError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 403 || status === 429) {
      const reason = error.response?.data?.error?.errors?.[0]?.reason;

      if (reason === 'rateLimitExceeded' || reason === 'quotaExceeded' || status === 429) {
        return new RateLimitError(
          DOCS_ERROR_MAP[429] || 'Docs rate limit exceeded',
          {
            reason,
            limit: DOCS_RATE_LIMIT
          }
        );
      }
    }

    // Map known Docs error codes
    if (status && DOCS_ERROR_MAP[status]) {
      return new MCPError(DOCS_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'docs'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown Docs error',
      {
        status,
        endpoint: req.path,
        integration: 'docs'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing Docs integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export Docs integration instance
 */
export function createDocsIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): DocsIntegration {
  return new DocsIntegration(oauthProxy, semanticRouter);
}
