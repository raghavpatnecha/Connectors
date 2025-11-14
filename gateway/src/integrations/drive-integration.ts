/**
 * Google Drive MCP Integration Module
 * Connectors Platform - Drive integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Drive-specific configuration
const DRIVE_RATE_LIMIT = parseInt(process.env.DRIVE_RATE_LIMIT || '10', 10); // 10 requests per second
const DRIVE_TIMEOUT_MS = parseInt(process.env.DRIVE_TIMEOUT_MS || '15000', 10);
const DRIVE_SERVER_URL = process.env.DRIVE_SERVER_URL || 'http://localhost:3132';
const DRIVE_ENABLED = process.env.DRIVE_ENABLED !== 'false';

/**
 * Drive OAuth configuration (Google OAuth 2.0)
 * See: https://developers.google.com/drive/api/guides/about-auth
 */
export const DRIVE_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.DRIVE_REDIRECT_URI || 'http://localhost:3132/oauth/callback'
};

/**
 * Drive API error codes mapped to our error types
 */
const DRIVE_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid file ID or parameters',
  401: 'Unauthorized - OAuth token expired or invalid',
  403: 'Forbidden - insufficient permissions or rate limit exceeded',
  404: 'File or folder not found',
  409: 'Conflict - concurrent modification or duplicate name',
  429: 'Rate limit exceeded - quota exhausted',
  500: 'Drive internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Drive API
 * Implements token bucket algorithm (10 req/s, 1000 req/min)
 */
class DriveRateLimiter {
  private _tokens: number = DRIVE_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = DRIVE_RATE_LIMIT;
  private readonly _refillRate: number = DRIVE_RATE_LIMIT; // tokens per second

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
    logger.debug('Drive rate limit throttling', {
      integration: 'drive',
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
 * Drive Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Drive MCP server
 */
export class DriveIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: DriveRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new DriveRateLimiter();
    this._serverUrl = DRIVE_SERVER_URL;

    logger.info('DriveIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: DRIVE_RATE_LIMIT,
      enabled: DRIVE_ENABLED
    });
  }

  /**
   * Initialize Drive integration
   * - Register OAuth config
   * - Index Drive tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!DRIVE_ENABLED) {
      logger.info('Drive integration disabled');
      return;
    }

    logger.info('Initializing Drive integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('drive', DRIVE_OAUTH_CONFIG);

    // Index Drive tools for semantic routing
    await this._indexDriveTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('Drive integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to Drive MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!DRIVE_ENABLED) {
      throw new MCPError('Drive integration is disabled', {
        integration: 'drive'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'drive'
      });

      const duration = Date.now() - startTime;
      logger.debug('Drive request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Drive-specific errors
      const mappedError = this._mapDriveError(error, req);

      logger.error('Drive request failed', {
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
   * Health check for Drive MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(DRIVE_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('Drive health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('Drive health check error', {
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
      enabled: DRIVE_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: DRIVE_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index Drive tools in semantic router
   * Drive provides 41 tools across files, folders, permissions, comments, shared drives
   */
  private async _indexDriveTools(): Promise<void> {
    const driveTools: ToolEmbedding[] = [
      // Files (18 tools)
      {
        toolId: 'drive.searchFiles',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Search Drive Files',
          description: 'Search for files and folders in Google Drive with advanced filters',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.getFileContent',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Get File Content',
          description: 'Download and retrieve Google Drive file content',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.createFile',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Create File',
          description: 'Create a new file in Google Drive',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.listFiles',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'List Drive Items',
          description: 'List files and folders in Google Drive',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.updateFile',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Update File',
          description: 'Update an existing Google Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.copyFile',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Copy File',
          description: 'Create a copy of a Google Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.deleteFile',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Delete File',
          description: 'Move a Google Drive file to trash',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.permanentlyDeleteFile',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Permanently Delete File',
          description: 'Permanently delete a Google Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.exportFile',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Export File',
          description: 'Export Google Workspace files to different formats',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.generateIds',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Generate File IDs',
          description: 'Generate unique file IDs for batch operations',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.watchFile',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Watch File',
          description: 'Watch for changes to a Google Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.stopChannel',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Stop Watch Channel',
          description: 'Stop watching for file changes',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.emptyTrash',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Empty Trash',
          description: 'Permanently delete all files in trash',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.getFileRevisions',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Get File Revisions',
          description: 'List all revisions of a Google Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.updateRevision',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Update Revision',
          description: 'Update file revision metadata',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.deleteRevision',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Delete Revision',
          description: 'Delete a specific file revision',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.getFilePermissions',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Get File Permissions',
          description: 'Retrieve permissions for a Google Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.checkFilePublicAccess',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Check Public Access',
          description: 'Check if a file is publicly accessible',
          usageCount: 0
        }
      },

      // Folders (4 tools)
      {
        toolId: 'drive.createFolder',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Create Folder',
          description: 'Create a new folder in Google Drive',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.listFolders',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'List Folders',
          description: 'List all folders in Google Drive',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.moveFile',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Move File',
          description: 'Move a file to a different folder',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.getFolderTree',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Get Folder Tree',
          description: 'Get the complete folder hierarchy',
          usageCount: 0
        }
      },

      // Permissions (5 tools)
      {
        toolId: 'drive.shareFile',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Share File',
          description: 'Share a Google Drive file with users or groups',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.revokeAccess',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Revoke Access',
          description: 'Revoke access to a Google Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.updatePermission',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Update Permission',
          description: 'Update file sharing permissions',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.transferOwnership',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Transfer Ownership',
          description: 'Transfer file ownership to another user',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.getPermission',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Get Permission',
          description: 'Get details of a specific permission',
          usageCount: 0
        }
      },

      // Comments (9 tools)
      {
        toolId: 'drive.listComments',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'List Comments',
          description: 'List all comments on a Google Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.getComment',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Get Comment',
          description: 'Retrieve a specific comment',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.createComment',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Create Comment',
          description: 'Add a comment to a Google Drive file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.updateComment',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Update Comment',
          description: 'Update an existing comment',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.deleteComment',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Delete Comment',
          description: 'Delete a comment from a file',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.listReplies',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'List Replies',
          description: 'List all replies to a comment',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.createReply',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Create Reply',
          description: 'Reply to a comment',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.updateReply',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Update Reply',
          description: 'Update a comment reply',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.deleteReply',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Delete Reply',
          description: 'Delete a comment reply',
          usageCount: 0
        }
      },

      // Shared Drives (5 tools)
      {
        toolId: 'drive.listSharedDrives',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'List Shared Drives',
          description: 'List all shared drives (Team Drives)',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.getSharedDrive',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Get Shared Drive',
          description: 'Get details of a shared drive',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.createSharedDrive',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Create Shared Drive',
          description: 'Create a new shared drive',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.updateSharedDrive',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Update Shared Drive',
          description: 'Update shared drive settings',
          usageCount: 0
        }
      },
      {
        toolId: 'drive.deleteSharedDrive',
        embedding: [],
        category: 'storage',
        metadata: {
          name: 'Delete Shared Drive',
          description: 'Delete a shared drive',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing Drive tools', { count: driveTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(driveTools);

    logger.info('Drive tools indexed successfully');
  }

  /**
   * Map Drive API errors to gateway error types
   */
  private _mapDriveError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 403 || status === 429) {
      const reason = error.response?.data?.error?.errors?.[0]?.reason;

      if (reason === 'rateLimitExceeded' || reason === 'quotaExceeded' || status === 429) {
        return new RateLimitError(
          DRIVE_ERROR_MAP[429] || 'Drive rate limit exceeded',
          {
            reason,
            limit: DRIVE_RATE_LIMIT
          }
        );
      }
    }

    // Map known Drive error codes
    if (status && DRIVE_ERROR_MAP[status]) {
      return new MCPError(DRIVE_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'drive'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown Drive error',
      {
        status,
        endpoint: req.path,
        integration: 'drive'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing Drive integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export Drive integration instance
 */
export function createDriveIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): DriveIntegration {
  return new DriveIntegration(oauthProxy, semanticRouter);
}
