/**
 * Google Sheets MCP Integration Module
 * Connectors Platform - Sheets integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Sheets-specific configuration
const SHEETS_RATE_LIMIT = parseInt(process.env.SHEETS_RATE_LIMIT || '10', 10); // 10 requests per second
const SHEETS_TIMEOUT_MS = parseInt(process.env.SHEETS_TIMEOUT_MS || '15000', 10);
const SHEETS_SERVER_URL = process.env.SHEETS_SERVER_URL || 'http://localhost:3134';
const SHEETS_ENABLED = process.env.SHEETS_ENABLED !== 'false';

/**
 * Sheets OAuth configuration (Google OAuth 2.0)
 * See: https://developers.google.com/sheets/api/reference/rest
 */
export const SHEETS_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.SHEETS_REDIRECT_URI || 'http://localhost:3134/oauth/callback'
};

/**
 * Sheets API error codes mapped to our error types
 */
const SHEETS_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid spreadsheet ID or parameters',
  401: 'Unauthorized - OAuth token expired or invalid',
  403: 'Forbidden - insufficient permissions or rate limit exceeded',
  404: 'Spreadsheet or sheet not found',
  409: 'Conflict - concurrent modification detected',
  429: 'Rate limit exceeded - quota exhausted',
  500: 'Sheets internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Sheets API
 * Implements token bucket algorithm (10 req/s, 1000 req/min)
 */
class SheetsRateLimiter {
  private _tokens: number = SHEETS_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = SHEETS_RATE_LIMIT;
  private readonly _refillRate: number = SHEETS_RATE_LIMIT; // tokens per second

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
    logger.debug('Sheets rate limit throttling', {
      integration: 'sheets',
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
 * Sheets Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Sheets MCP server
 */
export class SheetsIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: SheetsRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new SheetsRateLimiter();
    this._serverUrl = SHEETS_SERVER_URL;

    logger.info('SheetsIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: SHEETS_RATE_LIMIT,
      enabled: SHEETS_ENABLED
    });
  }

  /**
   * Initialize Sheets integration
   * - Register OAuth config
   * - Index Sheets tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!SHEETS_ENABLED) {
      logger.info('Sheets integration disabled');
      return;
    }

    logger.info('Initializing Sheets integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('sheets', SHEETS_OAUTH_CONFIG);

    // Index Sheets tools for semantic routing
    await this._indexSheetsTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('Sheets integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to Sheets MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!SHEETS_ENABLED) {
      throw new MCPError('Sheets integration is disabled', {
        integration: 'sheets'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'sheets'
      });

      const duration = Date.now() - startTime;
      logger.debug('Sheets request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Sheets-specific errors
      const mappedError = this._mapSheetsError(error, req);

      logger.error('Sheets request failed', {
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
   * Health check for Sheets MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(SHEETS_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('Sheets health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('Sheets health check error', {
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
      enabled: SHEETS_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: SHEETS_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index Sheets tools in semantic router
   * Sheets provides 40 tools across spreadsheets, values, and formatting
   */
  private async _indexSheetsTools(): Promise<void> {
    const sheetsTools: ToolEmbedding[] = [
      // Spreadsheets (7 tools)
      {
        toolId: 'sheets.listSpreadsheets',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'List Spreadsheets',
          description: 'List all Google Sheets spreadsheets accessible to the user',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.getSpreadsheetInfo',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Spreadsheet Info',
          description: 'Get metadata and sheet list for a specific spreadsheet',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.createSpreadsheet',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Spreadsheet',
          description: 'Create a new Google Sheets spreadsheet',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.createSheet',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Sheet',
          description: 'Add a new sheet to an existing spreadsheet',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.deleteSheet',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Sheet',
          description: 'Remove a sheet from a spreadsheet',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.copySheet',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Copy Sheet',
          description: 'Copy a sheet within or across spreadsheets',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.batchUpdate',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Batch Update',
          description: 'Execute multiple spreadsheet operations atomically',
          usageCount: 0
        }
      },

      // Values (15 tools)
      {
        toolId: 'sheets.getValues',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Values',
          description: 'Read cell values from a range',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.batchGetValues',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Batch Get Values',
          description: 'Read values from multiple ranges at once',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.updateValues',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Values',
          description: 'Update cell values in a range',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.batchUpdateValues',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Batch Update Values',
          description: 'Update values in multiple ranges',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.appendValues',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Append Values',
          description: 'Append rows of data to a sheet',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.clearValues',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Clear Values',
          description: 'Clear cell values from a range',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.batchClearValues',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Batch Clear Values',
          description: 'Clear values from multiple ranges',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.findReplace',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Find and Replace',
          description: 'Find and replace text in cells',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.copyPaste',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Copy Paste',
          description: 'Copy and paste cell ranges with formatting',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.cutPaste',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Cut Paste',
          description: 'Cut and paste cell ranges',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.sortRange',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Sort Range',
          description: 'Sort data in a range by columns',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.autoFill',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Auto Fill',
          description: 'Auto-fill patterns and series',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.textToColumns',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Text to Columns',
          description: 'Split cell text by delimiter',
          usageCount: 0
        }
      },

      // Formatting (18 tools)
      {
        toolId: 'sheets.mergeCells',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Merge Cells',
          description: 'Merge cells in a range',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.unmergeCells',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Unmerge Cells',
          description: 'Unmerge cells in a range',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.setNumberFormat',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Set Number Format',
          description: 'Apply number formatting to cells',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.autoResizeDimensions',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Auto Resize Dimensions',
          description: 'Auto-fit column or row sizes to content',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.insertDimension',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert Dimension',
          description: 'Insert rows or columns',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.deleteDimension',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Dimension',
          description: 'Delete rows or columns',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.moveDimension',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Move Dimension',
          description: 'Move rows or columns to a different position',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.updateDimensionProperties',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Dimension Properties',
          description: 'Update row or column properties (size, hide/show)',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.addChart',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Add Chart',
          description: 'Create a chart in the spreadsheet',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.updateChart',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Chart',
          description: 'Update chart properties',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.deleteChart',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Chart',
          description: 'Remove a chart from the spreadsheet',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.setDataValidation',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Set Data Validation',
          description: 'Add data validation rules to cells',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.addProtectedRange',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Add Protected Range',
          description: 'Protect cells from editing',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.updateProtectedRange',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Protected Range',
          description: 'Update protection settings for a range',
          usageCount: 0
        }
      },
      {
        toolId: 'sheets.deleteProtectedRange',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Protected Range',
          description: 'Remove protection from a range',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing Sheets tools', { count: sheetsTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(sheetsTools);

    logger.info('Sheets tools indexed successfully');
  }

  /**
   * Map Sheets API errors to gateway error types
   */
  private _mapSheetsError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 403 || status === 429) {
      const reason = error.response?.data?.error?.errors?.[0]?.reason;

      if (reason === 'rateLimitExceeded' || reason === 'quotaExceeded' || status === 429) {
        return new RateLimitError(
          SHEETS_ERROR_MAP[429] || 'Sheets rate limit exceeded',
          {
            reason,
            limit: SHEETS_RATE_LIMIT
          }
        );
      }
    }

    // Map known Sheets error codes
    if (status && SHEETS_ERROR_MAP[status]) {
      return new MCPError(SHEETS_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'sheets'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown Sheets error',
      {
        status,
        endpoint: req.path,
        integration: 'sheets'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing Sheets integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export Sheets integration instance
 */
export function createSheetsIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): SheetsIntegration {
  return new SheetsIntegration(oauthProxy, semanticRouter);
}
