/**
 * Integration registry and configuration
 * Connectors Platform - Central registry for all MCP integrations
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { NotionIntegration, createNotionIntegration } from '../integrations/notion-integration';
import { GitHubIntegration, createGitHubIntegration } from '../integrations/github-integration';
import { LinkedInIntegration, createLinkedInIntegration } from '../integrations/linkedin-integration';
import { RedditIntegration, createRedditIntegration } from '../integrations/reddit-integration';
import { logger } from '../logging/logger';

/**
 * Integration metadata
 */
export interface IntegrationMetadata {
  /** Integration unique identifier */
  id: string;

  /** Display name */
  name: string;

  /** Category (code, communication, productivity, cloud, data, pm) */
  category: string;

  /** Short description */
  description: string;

  /** Is this integration enabled? */
  enabled: boolean;

  /** MCP server URL */
  serverUrl: string;

  /** Rate limit (requests per second) */
  rateLimit: number;

  /** Requires OAuth? */
  requiresOAuth: boolean;

  /** OAuth provider name */
  oauthProvider?: string;

  /** Documentation URL */
  docsUrl?: string;
}

/**
 * Integration registry
 * Manages all available integrations
 */
export class IntegrationRegistry {
  private readonly _integrations: Map<string, IntegrationMetadata> = new Map();
  private readonly _instances: Map<string, any> = new Map();
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
  }

  /**
   * Initialize all integrations
   */
  async initialize(): Promise<void> {
    logger.info('Initializing integration registry');

    // Register all integrations
    this._registerNotion();
    this._registerGitHub();
    this._registerLinkedIn();
    this._registerReddit();

    // Initialize all enabled integrations
    await this._initializeAll();

    logger.info('Integration registry initialized', {
      totalIntegrations: this._integrations.size,
      enabledIntegrations: Array.from(this._integrations.values())
        .filter(i => i.enabled).length
    });
  }

  /**
   * Get integration by ID
   */
  getIntegration(id: string): IntegrationMetadata | undefined {
    return this._integrations.get(id);
  }

  /**
   * Get integration instance
   */
  getInstance<T = any>(id: string): T | undefined {
    return this._instances.get(id);
  }

  /**
   * List all integrations
   */
  listIntegrations(options: {
    category?: string;
    enabled?: boolean;
  } = {}): IntegrationMetadata[] {
    let integrations = Array.from(this._integrations.values());

    if (options.category) {
      integrations = integrations.filter(i => i.category === options.category);
    }

    if (options.enabled !== undefined) {
      integrations = integrations.filter(i => i.enabled === options.enabled);
    }

    return integrations;
  }

  /**
   * List all categories
   */
  listCategories(): Array<{ name: string; count: number }> {
    const categories = new Map<string, number>();

    for (const integration of this._integrations.values()) {
      const count = categories.get(integration.category) || 0;
      categories.set(integration.category, count + 1);
    }

    return Array.from(categories.entries()).map(([name, count]) => ({
      name,
      count
    }));
  }

  /**
   * Health check for all integrations
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [id, instance] of this._instances.entries()) {
      if (typeof instance.healthCheck === 'function') {
        try {
          results[id] = await instance.healthCheck();
        } catch (error) {
          logger.error('Health check failed', { integration: id, error });
          results[id] = false;
        }
      } else {
        results[id] = true; // No health check = assume healthy
      }
    }

    return results;
  }

  /**
   * Close all integrations
   */
  async close(): Promise<void> {
    logger.info('Closing all integrations');

    for (const [id, instance] of this._instances.entries()) {
      if (typeof instance.close === 'function') {
        try {
          await instance.close();
        } catch (error) {
          logger.error('Error closing integration', { integration: id, error });
        }
      }
    }

    this._integrations.clear();
    this._instances.clear();
  }

  /**
   * Register Notion integration
   */
  private _registerNotion(): void {
    const metadata: IntegrationMetadata = {
      id: 'notion',
      name: 'Notion',
      category: 'productivity',
      description: 'Notion workspace integration for pages, databases, and collaboration',
      enabled: process.env.NOTION_ENABLED !== 'false',
      serverUrl: process.env.NOTION_SERVER_URL || 'http://localhost:3100',
      rateLimit: parseInt(process.env.NOTION_RATE_LIMIT || '3', 10),
      requiresOAuth: true,
      oauthProvider: 'notion',
      docsUrl: 'https://developers.notion.com'
    };

    this._integrations.set('notion', metadata);

    if (metadata.enabled) {
      const instance = createNotionIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('notion', instance);
    }

    logger.info('Registered Notion integration', metadata);
  }

  /**
   * Register GitHub integration
   */
  private _registerGitHub(): void {
    const metadata: IntegrationMetadata = {
      id: 'github',
      name: 'GitHub',
      category: 'code',
      description: 'GitHub integration for repositories, issues, PRs, and actions (1,111 operations)',
      enabled: process.env.GITHUB_ENABLED !== 'false',
      serverUrl: process.env.GITHUB_SERVER_URL || 'http://localhost:3110',
      rateLimit: parseInt(process.env.GITHUB_RATE_LIMIT || '60', 10),
      requiresOAuth: true,
      oauthProvider: 'github',
      docsUrl: 'https://docs.github.com/en/rest'
    };

    this._integrations.set('github', metadata);

    if (metadata.enabled) {
      const instance = createGitHubIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('github', instance);
    }

    logger.info('Registered GitHub integration', metadata);
  }

  /**
   * Register LinkedIn integration
   */
  private _registerLinkedIn(): void {
    const metadata: IntegrationMetadata = {
      id: 'linkedin',
      name: 'LinkedIn',
      category: 'communication',
      description: 'LinkedIn unified integration for profiles, connections, posts, and messaging',
      enabled: process.env.LINKEDIN_ENABLED !== 'false',
      serverUrl: process.env.LINKEDIN_SERVER_URL || 'http://localhost:3120',
      rateLimit: parseInt(process.env.LINKEDIN_RATE_LIMIT || '100', 10),
      requiresOAuth: true,
      oauthProvider: 'linkedin',
      docsUrl: 'https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication'
    };

    this._integrations.set('linkedin', metadata);

    if (metadata.enabled) {
      const instance = createLinkedInIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('linkedin', instance);
    }

    logger.info('Registered LinkedIn integration', metadata);
  }

  /**
   * Register Reddit integration
   */
  private _registerReddit(): void {
    const metadata: IntegrationMetadata = {
      id: 'reddit',
      name: 'Reddit',
      category: 'communication',
      description: 'Reddit unified integration for browsing, posting, and community management (25 tools)',
      enabled: process.env.REDDIT_ENABLED !== 'false',
      serverUrl: process.env.REDDIT_SERVER_URL || 'http://localhost:3200',
      rateLimit: parseInt(process.env.REDDIT_RATE_LIMIT || '60', 10),
      requiresOAuth: true,
      oauthProvider: 'reddit',
      docsUrl: 'https://www.reddit.com/dev/api'
    };

    this._integrations.set('reddit', metadata);

    if (metadata.enabled) {
      const instance = createRedditIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('reddit', instance);
    }

    logger.info('Registered Reddit integration', metadata);
  }

  /**
   * Initialize all enabled integrations
   */
  private async _initializeAll(): Promise<void> {
    const enabledIntegrations = Array.from(this._instances.entries());

    await Promise.all(
      enabledIntegrations.map(async ([id, instance]) => {
        if (typeof instance.initialize === 'function') {
          try {
            await instance.initialize();
            logger.info('Integration initialized', { integration: id });
          } catch (error) {
            logger.error('Failed to initialize integration', { integration: id, error });
          }
        }
      })
    );
  }
}

/**
 * Create integration registry
 */
export function createIntegrationRegistry(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): IntegrationRegistry {
  return new IntegrationRegistry(oauthProxy, semanticRouter);
}
