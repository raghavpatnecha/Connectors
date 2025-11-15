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
import { GmailIntegration, createGmailIntegration } from '../integrations/gmail-integration';
import { DriveIntegration, createDriveIntegration } from '../integrations/drive-integration';
import { CalendarIntegration, createCalendarIntegration } from '../integrations/calendar-integration';
import { TasksIntegration, createTasksIntegration } from '../integrations/tasks-integration';
import { DocsIntegration, createDocsIntegration } from '../integrations/docs-integration';
import { SheetsIntegration, createSheetsIntegration } from '../integrations/sheets-integration';
import { SlidesIntegration, createSlidesIntegration } from '../integrations/slides-integration';
import { FormsIntegration, createFormsIntegration } from '../integrations/forms-integration';
import { ChatIntegration, createChatIntegration } from '../integrations/chat-integration';
import { SearchIntegration, createSearchIntegration } from '../integrations/search-integration';
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
    this._registerGmail();
    this._registerDrive();
    this._registerCalendar();
    this._registerTasks();
    this._registerDocs();
    this._registerSheets();
    this._registerSlides();
    this._registerForms();
    this._registerChat();
    this._registerSearch();

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
      description: 'GitHub unified integration for repositories, issues, PRs, and actions (29 tools)',
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
   * Register Gmail integration
   */
  private _registerGmail(): void {
    const metadata: IntegrationMetadata = {
      id: 'gmail',
      name: 'Gmail',
      category: 'communication',
      description: 'Gmail unified integration for messages, labels, threads, drafts, and settings (66 tools)',
      enabled: process.env.GMAIL_ENABLED !== 'false',
      serverUrl: process.env.GMAIL_SERVER_URL || 'http://localhost:3130',
      rateLimit: parseInt(process.env.GMAIL_RATE_LIMIT || '25', 10),
      requiresOAuth: true,
      oauthProvider: 'gmail',
      docsUrl: 'https://developers.google.com/gmail/api'
    };

    this._integrations.set('gmail', metadata);

    if (metadata.enabled) {
      const instance = createGmailIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('gmail', instance);
    }

    logger.info('Registered Gmail integration', metadata);
  }

  /**
   * Register Google Drive integration
   */
  private _registerDrive(): void {
    const metadata: IntegrationMetadata = {
      id: 'drive',
      name: 'Google Drive',
      category: 'storage',
      description: 'Google Drive unified integration for files, folders, permissions, comments, and shared drives (41 tools)',
      enabled: process.env.DRIVE_ENABLED !== 'false',
      serverUrl: process.env.DRIVE_SERVER_URL || 'http://localhost:3132',
      rateLimit: parseInt(process.env.DRIVE_RATE_LIMIT || '10', 10),
      requiresOAuth: true,
      oauthProvider: 'drive',
      docsUrl: 'https://developers.google.com/drive/api'
    };

    this._integrations.set('drive', metadata);

    if (metadata.enabled) {
      const instance = createDriveIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('drive', instance);
    }

    logger.info('Registered Drive integration', metadata);
  }

  /**
   * Register Google Calendar integration
   */
  private _registerCalendar(): void {
    const metadata: IntegrationMetadata = {
      id: 'calendar',
      name: 'Google Calendar',
      category: 'productivity',
      description: 'Google Calendar unified integration for events, calendars, and access control (29 tools)',
      enabled: process.env.CALENDAR_ENABLED !== 'false',
      serverUrl: process.env.CALENDAR_SERVER_URL || 'http://localhost:3131',
      rateLimit: parseInt(process.env.CALENDAR_RATE_LIMIT || '5', 10),
      requiresOAuth: true,
      oauthProvider: 'calendar',
      docsUrl: 'https://developers.google.com/calendar/api'
    };

    this._integrations.set('calendar', metadata);

    if (metadata.enabled) {
      const instance = createCalendarIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('calendar', instance);
    }

    logger.info('Registered Calendar integration', metadata);
  }

  /**
   * Register Google Tasks integration
   */
  private _registerTasks(): void {
    const metadata: IntegrationMetadata = {
      id: 'tasks',
      name: 'Google Tasks',
      category: 'productivity',
      description: 'Google Tasks unified integration for task lists and tasks (16 tools)',
      enabled: process.env.TASKS_ENABLED !== 'false',
      serverUrl: process.env.TASKS_SERVER_URL || 'http://localhost:3137',
      rateLimit: parseInt(process.env.TASKS_RATE_LIMIT || '5', 10),
      requiresOAuth: true,
      oauthProvider: 'tasks',
      docsUrl: 'https://developers.google.com/tasks/reference/rest'
    };

    this._integrations.set('tasks', metadata);

    if (metadata.enabled) {
      const instance = createTasksIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('tasks', instance);
    }

    logger.info('Registered Tasks integration', metadata);
  }

  /**
   * Register Google Docs integration
   */
  private _registerDocs(): void {
    const metadata: IntegrationMetadata = {
      id: 'docs',
      name: 'Google Docs',
      category: 'productivity',
      description: 'Google Docs unified integration for documents, content editing, and features (32 tools)',
      enabled: process.env.DOCS_ENABLED !== 'false',
      serverUrl: process.env.DOCS_SERVER_URL || 'http://localhost:3133',
      rateLimit: parseInt(process.env.DOCS_RATE_LIMIT || '10', 10),
      requiresOAuth: true,
      oauthProvider: 'docs',
      docsUrl: 'https://developers.google.com/docs/api/reference/rest'
    };

    this._integrations.set('docs', metadata);

    if (metadata.enabled) {
      const instance = createDocsIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('docs', instance);
    }

    logger.info('Registered Docs integration', metadata);
  }

  /**
   * Register Google Sheets integration
   */
  private _registerSheets(): void {
    const metadata: IntegrationMetadata = {
      id: 'sheets',
      name: 'Google Sheets',
      category: 'productivity',
      description: 'Google Sheets unified integration for spreadsheets, values, and formatting (40 tools)',
      enabled: process.env.SHEETS_ENABLED !== 'false',
      serverUrl: process.env.SHEETS_SERVER_URL || 'http://localhost:3134',
      rateLimit: parseInt(process.env.SHEETS_RATE_LIMIT || '10', 10),
      requiresOAuth: true,
      oauthProvider: 'sheets',
      docsUrl: 'https://developers.google.com/sheets/api/reference/rest'
    };

    this._integrations.set('sheets', metadata);

    if (metadata.enabled) {
      const instance = createSheetsIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('sheets', instance);
    }

    logger.info('Registered Sheets integration', metadata);
  }

  /**
   * Register Google Slides integration
   */
  private _registerSlides(): void {
    const metadata: IntegrationMetadata = {
      id: 'slides',
      name: 'Google Slides',
      category: 'documents',
      description: 'Google Slides unified integration for presentations, pages, and elements (25 tools)',
      enabled: process.env.SLIDES_ENABLED !== 'false',
      serverUrl: process.env.SLIDES_SERVER_URL || 'http://localhost:3135',
      rateLimit: parseInt(process.env.SLIDES_RATE_LIMIT || '10', 10),
      requiresOAuth: true,
      oauthProvider: 'slides',
      docsUrl: 'https://developers.google.com/slides/api/reference/rest'
    };

    this._integrations.set('slides', metadata);

    if (metadata.enabled) {
      const instance = createSlidesIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('slides', instance);
    }

    logger.info('Registered Slides integration', metadata);
  }

  /**
   * Register Google Forms integration
   */
  private _registerForms(): void {
    const metadata: IntegrationMetadata = {
      id: 'forms',
      name: 'Google Forms',
      category: 'productivity',
      description: 'Google Forms unified integration for forms, responses, and watches (15 tools)',
      enabled: process.env.FORMS_ENABLED !== 'false',
      serverUrl: process.env.FORMS_SERVER_URL || 'http://localhost:3136',
      rateLimit: parseInt(process.env.FORMS_RATE_LIMIT || '10', 10),
      requiresOAuth: true,
      oauthProvider: 'forms',
      docsUrl: 'https://developers.google.com/forms/api/reference/rest'
    };

    this._integrations.set('forms', metadata);

    if (metadata.enabled) {
      const instance = createFormsIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('forms', instance);
    }

    logger.info('Registered Forms integration', metadata);
  }

  /**
   * Register Google Chat integration
   */
  private _registerChat(): void {
    const metadata: IntegrationMetadata = {
      id: 'chat',
      name: 'Google Chat',
      category: 'communication',
      description: 'Google Chat unified integration for spaces, messages, members, and reactions (23 tools)',
      enabled: process.env.CHAT_ENABLED !== 'false',
      serverUrl: process.env.CHAT_SERVER_URL || 'http://localhost:3138',
      rateLimit: parseInt(process.env.CHAT_RATE_LIMIT || '20', 10),
      requiresOAuth: true,
      oauthProvider: 'chat',
      docsUrl: 'https://developers.google.com/chat/api'
    };

    this._integrations.set('chat', metadata);

    if (metadata.enabled) {
      const instance = createChatIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('chat', instance);
    }

    logger.info('Registered Chat integration', metadata);
  }

  /**
   * Register Google Custom Search integration
   */
  private _registerSearch(): void {
    const metadata: IntegrationMetadata = {
      id: 'search',
      name: 'Google Custom Search',
      category: 'search',
      description: 'Google Custom Search unified integration for web search and CSE management (6 tools)',
      enabled: process.env.SEARCH_ENABLED !== 'false',
      serverUrl: process.env.SEARCH_SERVER_URL || 'http://localhost:3139',
      rateLimit: parseInt(process.env.SEARCH_RATE_LIMIT || '5', 10),
      requiresOAuth: true,
      oauthProvider: 'search',
      docsUrl: 'https://developers.google.com/custom-search/v1/overview'
    };

    this._integrations.set('search', metadata);

    if (metadata.enabled) {
      const instance = createSearchIntegration(this._oauthProxy, this._semanticRouter);
      this._instances.set('search', instance);
    }

    logger.info('Registered Search integration', metadata);
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
