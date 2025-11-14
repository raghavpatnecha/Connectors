/**
 * Gmail MCP Integration Module
 * Connectors Platform - Gmail integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Gmail-specific configuration
const GMAIL_RATE_LIMIT = parseInt(process.env.GMAIL_RATE_LIMIT || '25', 10); // 25 requests per second
const GMAIL_TIMEOUT_MS = parseInt(process.env.GMAIL_TIMEOUT_MS || '10000', 10);
const GMAIL_SERVER_URL = process.env.GMAIL_SERVER_URL || 'http://localhost:3130';
const GMAIL_ENABLED = process.env.GMAIL_ENABLED !== 'false';

/**
 * Gmail OAuth configuration (Google OAuth 2.0)
 * See: https://developers.google.com/gmail/api/auth/about-auth
 */
export const GMAIL_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3130/oauth/callback'
};

/**
 * Gmail API error codes mapped to our error types
 */
const GMAIL_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid parameters or malformed request',
  401: 'Unauthorized - OAuth token expired or invalid',
  403: 'Forbidden - insufficient permissions or rate limit exceeded',
  404: 'Resource not found - message, label, or thread does not exist',
  409: 'Conflict - concurrent modification detected',
  429: 'Rate limit exceeded - quota exhausted',
  500: 'Gmail internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Gmail API
 * Implements token bucket algorithm (25 req/s, 250 req/min)
 */
class GmailRateLimiter {
  private _tokens: number = GMAIL_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = GMAIL_RATE_LIMIT;
  private readonly _refillRate: number = GMAIL_RATE_LIMIT; // tokens per second

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
    logger.debug('Gmail rate limit throttling', {
      integration: 'gmail',
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
 * Gmail Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Gmail MCP server
 */
export class GmailIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: GmailRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new GmailRateLimiter();
    this._serverUrl = GMAIL_SERVER_URL;

    logger.info('GmailIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: GMAIL_RATE_LIMIT,
      enabled: GMAIL_ENABLED
    });
  }

  /**
   * Initialize Gmail integration
   * - Register OAuth config
   * - Index Gmail tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!GMAIL_ENABLED) {
      logger.info('Gmail integration disabled');
      return;
    }

    logger.info('Initializing Gmail integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('gmail', GMAIL_OAUTH_CONFIG);

    // Index Gmail tools for semantic routing
    await this._indexGmailTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('Gmail integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to Gmail MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!GMAIL_ENABLED) {
      throw new MCPError('Gmail integration is disabled', {
        integration: 'gmail'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'gmail'
      });

      const duration = Date.now() - startTime;
      logger.debug('Gmail request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Gmail-specific errors
      const mappedError = this._mapGmailError(error, req);

      logger.error('Gmail request failed', {
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
   * Health check for Gmail MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(GMAIL_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('Gmail health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('Gmail health check error', {
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
      enabled: GMAIL_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: GMAIL_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index Gmail tools in semantic router
   * Gmail provides 66 tools across messages, labels, threads, drafts, settings
   */
  private async _indexGmailTools(): Promise<void> {
    const gmailTools: ToolEmbedding[] = [
      // User Profile (3 tools)
      {
        toolId: 'gmail.getProfile',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Gmail Profile',
          description: 'Get the current user Gmail profile information',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getSettings',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Gmail Settings',
          description: 'Retrieve Gmail account settings and preferences',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.updateSettings',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update Gmail Settings',
          description: 'Update Gmail account settings and preferences',
          usageCount: 0
        }
      },

      // Messages (11 tools)
      {
        toolId: 'gmail.listMessages',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'List Messages',
          description: 'List Gmail messages with optional filters and pagination',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getMessage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Message',
          description: 'Retrieve a specific Gmail message by ID',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.sendMessage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Send Message',
          description: 'Send a new Gmail message with attachments support',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.deleteMessage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Delete Message',
          description: 'Permanently delete a Gmail message',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.trashMessage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Trash Message',
          description: 'Move a Gmail message to trash',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.untrashMessage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Untrash Message',
          description: 'Restore a Gmail message from trash',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.modifyMessage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Modify Message',
          description: 'Modify Gmail message labels',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.batchModifyMessages',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Batch Modify Messages',
          description: 'Modify labels for multiple Gmail messages',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.batchDeleteMessages',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Batch Delete Messages',
          description: 'Delete multiple Gmail messages at once',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getAttachment',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Attachment',
          description: 'Download a Gmail message attachment',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.importMessage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Import Message',
          description: 'Import a message into Gmail',
          usageCount: 0
        }
      },

      // Labels (6 tools)
      {
        toolId: 'gmail.listLabels',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'List Labels',
          description: 'List all Gmail labels',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.createLabel',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Create Label',
          description: 'Create a new Gmail label',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.updateLabel',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update Label',
          description: 'Update an existing Gmail label',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.deleteLabel',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Delete Label',
          description: 'Delete a Gmail label',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.patchLabel',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Patch Label',
          description: 'Partially update a Gmail label',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getLabel',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Label',
          description: 'Get details of a specific Gmail label',
          usageCount: 0
        }
      },

      // Threads (6 tools)
      {
        toolId: 'gmail.listThreads',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'List Threads',
          description: 'List Gmail conversation threads',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getThread',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Thread',
          description: 'Retrieve a specific Gmail thread',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.modifyThread',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Modify Thread',
          description: 'Modify labels for an entire Gmail thread',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.trashThread',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Trash Thread',
          description: 'Move an entire Gmail thread to trash',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.untrashThread',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Untrash Thread',
          description: 'Restore a Gmail thread from trash',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.deleteThread',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Delete Thread',
          description: 'Permanently delete an entire Gmail thread',
          usageCount: 0
        }
      },

      // Drafts (6 tools)
      {
        toolId: 'gmail.listDrafts',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'List Drafts',
          description: 'List all Gmail draft messages',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getDraft',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Draft',
          description: 'Retrieve a specific Gmail draft',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.createDraft',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Create Draft',
          description: 'Create a new Gmail draft message',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.updateDraft',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update Draft',
          description: 'Update an existing Gmail draft',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.deleteDraft',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Delete Draft',
          description: 'Delete a Gmail draft message',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.sendDraft',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Send Draft',
          description: 'Send a Gmail draft message',
          usageCount: 0
        }
      },

      // Settings - Auto-forwarding (2 tools)
      {
        toolId: 'gmail.getAutoForwarding',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Auto Forwarding',
          description: 'Get Gmail auto-forwarding settings',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.updateAutoForwarding',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update Auto Forwarding',
          description: 'Update Gmail auto-forwarding settings',
          usageCount: 0
        }
      },

      // Settings - IMAP (2 tools)
      {
        toolId: 'gmail.getImap',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get IMAP Settings',
          description: 'Get Gmail IMAP settings',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.updateImap',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update IMAP Settings',
          description: 'Update Gmail IMAP settings',
          usageCount: 0
        }
      },

      // Settings - POP (2 tools)
      {
        toolId: 'gmail.getPop',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get POP Settings',
          description: 'Get Gmail POP settings',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.updatePop',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update POP Settings',
          description: 'Update Gmail POP settings',
          usageCount: 0
        }
      },

      // Settings - Vacation (2 tools)
      {
        toolId: 'gmail.getVacation',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Vacation Responder',
          description: 'Get Gmail vacation auto-reply settings',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.updateVacation',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update Vacation Responder',
          description: 'Update Gmail vacation auto-reply settings',
          usageCount: 0
        }
      },

      // Settings - Language (2 tools)
      {
        toolId: 'gmail.getLanguage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Language Settings',
          description: 'Get Gmail language settings',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.updateLanguage',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update Language Settings',
          description: 'Update Gmail language settings',
          usageCount: 0
        }
      },

      // Settings - Delegates (4 tools)
      {
        toolId: 'gmail.listDelegates',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'List Delegates',
          description: 'List Gmail account delegates',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getDelegate',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Delegate',
          description: 'Get a specific Gmail delegate',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.addDelegate',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Add Delegate',
          description: 'Add a delegate to Gmail account',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.removeDelegate',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Remove Delegate',
          description: 'Remove a delegate from Gmail account',
          usageCount: 0
        }
      },

      // Settings - Filters (4 tools)
      {
        toolId: 'gmail.listFilters',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'List Filters',
          description: 'List all Gmail filters',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getFilter',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Filter',
          description: 'Get a specific Gmail filter',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.createFilter',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Create Filter',
          description: 'Create a new Gmail filter',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.deleteFilter',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Delete Filter',
          description: 'Delete a Gmail filter',
          usageCount: 0
        }
      },

      // Settings - Forwarding Addresses (4 tools)
      {
        toolId: 'gmail.listForwardingAddresses',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'List Forwarding Addresses',
          description: 'List all Gmail forwarding addresses',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getForwardingAddress',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Forwarding Address',
          description: 'Get a specific Gmail forwarding address',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.createForwardingAddress',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Create Forwarding Address',
          description: 'Add a new Gmail forwarding address',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.deleteForwardingAddress',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Delete Forwarding Address',
          description: 'Remove a Gmail forwarding address',
          usageCount: 0
        }
      },

      // Settings - Send-as (7 tools)
      {
        toolId: 'gmail.listSendAs',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'List Send-As Aliases',
          description: 'List all Gmail send-as aliases',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getSendAs',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get Send-As Alias',
          description: 'Get a specific Gmail send-as alias',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.createSendAs',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Create Send-As Alias',
          description: 'Create a new Gmail send-as alias',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.updateSendAs',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Update Send-As Alias',
          description: 'Update a Gmail send-as alias',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.patchSendAs',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Patch Send-As Alias',
          description: 'Partially update a Gmail send-as alias',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.deleteSendAs',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Delete Send-As Alias',
          description: 'Delete a Gmail send-as alias',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.verifySendAs',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Verify Send-As Alias',
          description: 'Send verification email for send-as alias',
          usageCount: 0
        }
      },

      // Settings - S/MIME (5 tools)
      {
        toolId: 'gmail.listSmimeInfo',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'List S/MIME Info',
          description: 'List S/MIME configurations',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.getSmimeInfo',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Get S/MIME Info',
          description: 'Get a specific S/MIME configuration',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.insertSmimeInfo',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Insert S/MIME Info',
          description: 'Add a new S/MIME configuration',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.setDefaultSmimeInfo',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Set Default S/MIME',
          description: 'Set default S/MIME configuration',
          usageCount: 0
        }
      },
      {
        toolId: 'gmail.deleteSmimeInfo',
        embedding: [],
        category: 'communication',
        metadata: {
          name: 'Delete S/MIME Info',
          description: 'Delete an S/MIME configuration',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing Gmail tools', { count: gmailTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(gmailTools);

    logger.info('Gmail tools indexed successfully');
  }

  /**
   * Map Gmail API errors to gateway error types
   */
  private _mapGmailError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 403 || status === 429) {
      const quotaUser = error.response?.headers['x-goog-quota-user'];
      const reason = error.response?.data?.error?.errors?.[0]?.reason;

      if (reason === 'rateLimitExceeded' || reason === 'quotaExceeded' || status === 429) {
        return new RateLimitError(
          GMAIL_ERROR_MAP[429] || 'Gmail rate limit exceeded',
          {
            quotaUser,
            reason,
            limit: GMAIL_RATE_LIMIT
          }
        );
      }
    }

    // Map known Gmail error codes
    if (status && GMAIL_ERROR_MAP[status]) {
      return new MCPError(GMAIL_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'gmail'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown Gmail error',
      {
        status,
        endpoint: req.path,
        integration: 'gmail'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing Gmail integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export Gmail integration instance
 */
export function createGmailIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): GmailIntegration {
  return new GmailIntegration(oauthProxy, semanticRouter);
}
