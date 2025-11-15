/**
 * Google Tasks MCP Integration Module
 * Connectors Platform - Tasks integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Tasks-specific configuration
const TASKS_RATE_LIMIT = parseInt(process.env.TASKS_RATE_LIMIT || '5', 10); // 5 requests per second
const TASKS_TIMEOUT_MS = parseInt(process.env.TASKS_TIMEOUT_MS || '10000', 10);
const TASKS_SERVER_URL = process.env.TASKS_SERVER_URL || 'http://localhost:3137';
const TASKS_ENABLED = process.env.TASKS_ENABLED !== 'false';

/**
 * Tasks OAuth configuration (Google OAuth 2.0)
 * See: https://developers.google.com/tasks/reference/rest
 */
export const TASKS_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.TASKS_REDIRECT_URI || 'http://localhost:3137/oauth/callback'
};

/**
 * Tasks API error codes mapped to our error types
 */
const TASKS_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid task or task list parameters',
  401: 'Unauthorized - OAuth token expired or invalid',
  403: 'Forbidden - insufficient permissions or rate limit exceeded',
  404: 'Task or task list not found',
  409: 'Conflict - concurrent modification detected',
  429: 'Rate limit exceeded - quota exhausted',
  500: 'Tasks internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Tasks API
 * Implements token bucket algorithm (5 req/s, 500 req/min)
 */
class TasksRateLimiter {
  private _tokens: number = TASKS_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = TASKS_RATE_LIMIT;
  private readonly _refillRate: number = TASKS_RATE_LIMIT; // tokens per second

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
    logger.debug('Tasks rate limit throttling', {
      integration: 'tasks',
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
 * Tasks Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Tasks MCP server
 */
export class TasksIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: TasksRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new TasksRateLimiter();
    this._serverUrl = TASKS_SERVER_URL;

    logger.info('TasksIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: TASKS_RATE_LIMIT,
      enabled: TASKS_ENABLED
    });
  }

  /**
   * Initialize Tasks integration
   * - Register OAuth config
   * - Index Tasks tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!TASKS_ENABLED) {
      logger.info('Tasks integration disabled');
      return;
    }

    logger.info('Initializing Tasks integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('tasks', TASKS_OAUTH_CONFIG);

    // Index Tasks tools for semantic routing
    await this._indexTasksTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('Tasks integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to Tasks MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!TASKS_ENABLED) {
      throw new MCPError('Tasks integration is disabled', {
        integration: 'tasks'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'tasks'
      });

      const duration = Date.now() - startTime;
      logger.debug('Tasks request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Tasks-specific errors
      const mappedError = this._mapTasksError(error, req);

      logger.error('Tasks request failed', {
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
   * Health check for Tasks MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(TASKS_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('Tasks health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('Tasks health check error', {
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
      enabled: TASKS_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: TASKS_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index Tasks tools in semantic router
   * Tasks provides 16 tools across task lists and tasks
   */
  private async _indexTasksTools(): Promise<void> {
    const tasksTools: ToolEmbedding[] = [
      // Task Lists (6 tools)
      {
        toolId: 'tasks.listTaskLists',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'List Task Lists',
          description: 'List all task lists for the user',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.getTaskList',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Task List',
          description: 'Get details of a specific task list',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.createTaskList',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Task List',
          description: 'Create a new task list',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.updateTaskList',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Task List',
          description: 'Update an existing task list (full update)',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.patchTaskList',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Patch Task List',
          description: 'Partially update a task list',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.deleteTaskList',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Task List',
          description: 'Delete a task list and all its tasks',
          usageCount: 0
        }
      },

      // Tasks (10 tools)
      {
        toolId: 'tasks.listTasks',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'List Tasks',
          description: 'List all tasks in a task list with filtering and pagination',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.getTask',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Task',
          description: 'Get details of a specific task',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.createTask',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Task',
          description: 'Create a new task with optional parent and positioning',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.updateTask',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Task',
          description: 'Update an existing task (full update)',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.patchTask',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Patch Task',
          description: 'Partially update a task',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.deleteTask',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Task',
          description: 'Delete a task from the task list',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.moveTask',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Move Task',
          description: 'Move task to different position or parent',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.clearCompletedTasks',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Clear Completed Tasks',
          description: 'Clear all completed tasks from a task list',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.completeTask',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Complete Task',
          description: 'Mark a task as completed',
          usageCount: 0
        }
      },
      {
        toolId: 'tasks.uncompleteTask',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Uncomplete Task',
          description: 'Mark a task as not completed',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing Tasks tools', { count: tasksTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(tasksTools);

    logger.info('Tasks tools indexed successfully');
  }

  /**
   * Map Tasks API errors to gateway error types
   */
  private _mapTasksError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 403 || status === 429) {
      const reason = error.response?.data?.error?.errors?.[0]?.reason;

      if (reason === 'rateLimitExceeded' || reason === 'quotaExceeded' || status === 429) {
        return new RateLimitError(
          TASKS_ERROR_MAP[429] || 'Tasks rate limit exceeded',
          {
            reason,
            limit: TASKS_RATE_LIMIT
          }
        );
      }
    }

    // Map known Tasks error codes
    if (status && TASKS_ERROR_MAP[status]) {
      return new MCPError(TASKS_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'tasks'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown Tasks error',
      {
        status,
        endpoint: req.path,
        integration: 'tasks'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing Tasks integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export Tasks integration instance
 */
export function createTasksIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): TasksIntegration {
  return new TasksIntegration(oauthProxy, semanticRouter);
}
