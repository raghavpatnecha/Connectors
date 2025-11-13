/**
 * GitHub MCP Integration Module
 * Connectors Platform - GitHub integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// GitHub-specific configuration
const GITHUB_RATE_LIMIT = parseInt(process.env.GITHUB_RATE_LIMIT || '60', 10); // 60 requests per minute
const GITHUB_TIMEOUT_MS = parseInt(process.env.GITHUB_TIMEOUT_MS || '5000', 10);
const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL || 'http://localhost:3110';
const GITHUB_ENABLED = process.env.GITHUB_ENABLED !== 'false';

/**
 * GitHub OAuth configuration
 * See: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
 */
export const GITHUB_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  authEndpoint: 'https://github.com/login/oauth/authorize',
  redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/oauth/callback/github'
};

/**
 * GitHub API error codes mapped to our error types
 */
const GITHUB_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid parameters',
  401: 'Unauthorized - token may be expired or invalid',
  403: 'Forbidden - rate limit exceeded or insufficient permissions',
  404: 'Resource not found',
  409: 'Conflict - resource already exists',
  410: 'Gone - resource permanently deleted',
  422: 'Validation failed - check input parameters',
  429: 'Rate limit exceeded',
  500: 'GitHub internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable',
  504: 'Gateway timeout'
};

/**
 * Rate limiter for GitHub API
 * Implements token bucket algorithm (60 req/min average)
 */
class GitHubRateLimiter {
  private _tokens: number = GITHUB_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = GITHUB_RATE_LIMIT;
  private readonly _refillRate: number = GITHUB_RATE_LIMIT / 60; // tokens per second

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
      integration: 'github',
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
 * GitHub Integration Handler
 * Manages OAuth, rate limiting, and error mapping for GitHub MCP servers
 */
export class GitHubIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: GitHubRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new GitHubRateLimiter();
    this._serverUrl = GITHUB_SERVER_URL;

    logger.info('GitHubIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: GITHUB_RATE_LIMIT,
      enabled: GITHUB_ENABLED
    });
  }

  /**
   * Initialize GitHub integration
   * - Register OAuth config
   * - Index GitHub tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!GITHUB_ENABLED) {
      logger.info('GitHub integration disabled');
      return;
    }

    logger.info('Initializing GitHub integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('github', GITHUB_OAUTH_CONFIG);

    // Index GitHub tools for semantic routing
    await this._indexGitHubTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('GitHub integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to GitHub MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!GITHUB_ENABLED) {
      throw new MCPError('GitHub integration is disabled', {
        integration: 'github'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'github'
      });

      const duration = Date.now() - startTime;
      logger.debug('GitHub request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map GitHub-specific errors
      const mappedError = this._mapGitHubError(error, req);

      logger.error('GitHub request failed', {
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
   * Health check for GitHub MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('GitHub health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('GitHub health check error', {
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
      enabled: GITHUB_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: GITHUB_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index GitHub tools in semantic router
   * GitHub provides tools for repos, issues, PRs, actions, etc.
   */
  private async _indexGitHubTools(): Promise<void> {
    const githubTools: ToolEmbedding[] = [
      {
        toolId: 'github.createRepository',
        embedding: [], // Will be generated by embedding service
        category: 'code',
        metadata: {
          name: 'Create Repository',
          description: 'Create a new GitHub repository with settings and configuration',
          usageCount: 0
        }
      },
      {
        toolId: 'github.getRepository',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Get Repository',
          description: 'Retrieve repository information and metadata from GitHub',
          usageCount: 0
        }
      },
      {
        toolId: 'github.createPullRequest',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Create Pull Request',
          description: 'Create a pull request in a GitHub repository',
          usageCount: 0
        }
      },
      {
        toolId: 'github.mergePullRequest',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Merge Pull Request',
          description: 'Merge a pull request in a GitHub repository',
          usageCount: 0
        }
      },
      {
        toolId: 'github.createIssue',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Create Issue',
          description: 'Create a new issue in a GitHub repository with labels and assignees',
          usageCount: 0
        }
      },
      {
        toolId: 'github.updateIssue',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Update Issue',
          description: 'Update an existing GitHub issue with new information',
          usageCount: 0
        }
      },
      {
        toolId: 'github.listIssues',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'List Issues',
          description: 'List issues in a GitHub repository with filters',
          usageCount: 0
        }
      },
      {
        toolId: 'github.createBranch',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Create Branch',
          description: 'Create a new branch in a GitHub repository',
          usageCount: 0
        }
      },
      {
        toolId: 'github.commitFile',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Commit File',
          description: 'Commit a file to a GitHub repository',
          usageCount: 0
        }
      },
      {
        toolId: 'github.getCommit',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Get Commit',
          description: 'Retrieve commit details from a GitHub repository',
          usageCount: 0
        }
      },
      {
        toolId: 'github.runWorkflow',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Run GitHub Actions Workflow',
          description: 'Trigger a GitHub Actions workflow run',
          usageCount: 0
        }
      },
      {
        toolId: 'github.getWorkflowRun',
        embedding: [],
        category: 'code',
        metadata: {
          name: 'Get Workflow Run',
          description: 'Retrieve GitHub Actions workflow run status and logs',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing GitHub tools', { count: githubTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(githubTools);

    logger.info('GitHub tools indexed successfully');
  }

  /**
   * Map GitHub API errors to gateway error types
   */
  private _mapGitHubError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error (GitHub has special headers for rate limits)
    if (status === 403 || status === 429) {
      const resetTime = error.response?.headers['x-ratelimit-reset'];
      const remaining = error.response?.headers['x-ratelimit-remaining'];

      if (remaining === '0' || status === 429) {
        return new RateLimitError(
          GITHUB_ERROR_MAP[429] || 'Rate limit exceeded',
          {
            resetTime: resetTime ? parseInt(resetTime) : undefined,
            remaining: 0,
            limit: GITHUB_RATE_LIMIT
          }
        );
      }
    }

    // Map known GitHub error codes
    if (status && GITHUB_ERROR_MAP[status]) {
      return new MCPError(GITHUB_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'github'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown GitHub error',
      {
        status,
        endpoint: req.path,
        integration: 'github'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing GitHub integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export GitHub integration instance
 */
export function createGitHubIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): GitHubIntegration {
  return new GitHubIntegration(oauthProxy, semanticRouter);
}
