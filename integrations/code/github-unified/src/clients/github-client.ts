/**
 * GitHub Octokit client wrapper with OAuth integration
 */

import { Octokit } from '@octokit/rest';
import { logger } from '../utils/logger.js';
import { handleOctokitError } from '../utils/error-handler.js';
import { OAuthManager } from '../auth/oauth-manager.js';

export class GitHubClient {
  private oauthManager: OAuthManager;
  private clients: Map<string, Octokit> = new Map();

  constructor(oauthManager: OAuthManager) {
    this.oauthManager = oauthManager;
    logger.info('GitHub client initialized');
  }

  /**
   * Get or create Octokit instance for a tenant
   */
  async getClient(tenantId: string): Promise<Octokit> {
    try {
      // Get valid access token (will refresh if needed)
      const accessToken = await this.oauthManager.getValidToken(tenantId);

      // Create new Octokit instance with current token
      // (We don't cache because tokens can be refreshed)
      const octokit = new Octokit({
        auth: accessToken,
        userAgent: 'connectors-github-unified-mcp/1.0.0',
        log: {
          debug: (message) => logger.debug('Octokit', { message }),
          info: (message) => logger.info('Octokit', { message }),
          warn: (message) => logger.warn('Octokit', { message }),
          error: (message) => logger.error('Octokit', { message }),
        },
      });

      logger.debug('Created Octokit client', { tenantId });

      return octokit;
    } catch (error: any) {
      logger.error('Failed to create GitHub client', {
        tenantId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Execute GitHub API request with error handling
   */
  async execute<T>(
    tenantId: string,
    operation: (client: Octokit) => Promise<T>
  ): Promise<T> {
    try {
      const client = await this.getClient(tenantId);
      const result = await operation(client);

      logger.debug('GitHub API request successful', { tenantId });

      return result;
    } catch (error: any) {
      logger.error('GitHub API request failed', {
        tenantId,
        error: error.message,
        status: error.status,
      });

      handleOctokitError(error);
    }
  }

  /**
   * Get rate limit information
   */
  async getRateLimit(tenantId: string): Promise<any> {
    return this.execute(tenantId, async (client) => {
      const response = await client.rateLimit.get();
      return response.data;
    });
  }

  /**
   * Verify tenant authentication
   */
  async verifyAuth(tenantId: string): Promise<boolean> {
    try {
      const client = await this.getClient(tenantId);
      await client.users.getAuthenticated();
      return true;
    } catch (error) {
      return false;
    }
  }
}
