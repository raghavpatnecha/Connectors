#!/usr/bin/env node

/**
 * Reddit Unified MCP Server
 *
 * Comprehensive Reddit integration for Model Context Protocol providing:
 * - 25 core tools for Reddit interaction
 * - OAuth 2.0 authentication via HashiCorp Vault
 * - Rate limiting and caching
 * - Session management
 * - Full API coverage (browse, search, post, comment, user, subreddit tools)
 *
 * @module index
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Auth components
import { VaultClient } from './auth/vault-client';
import { OAuthManager } from './auth/oauth-manager';
import { SessionManager } from './auth/session-manager';

// Client components
import { RedditClient } from './clients/reddit-client';
import { RateLimiter } from './clients/rate-limiter';
import { CacheManager } from './clients/cache-manager';

// Tool registrations
import { registerBrowseTools } from './tools/browse-tools';
import { registerSearchTools } from './tools/search-tools';
import { registerPostTools } from './tools/post-tools';
import { registerCommentTools } from './tools/comment-tools';
import { registerSubredditTools } from './tools/subreddit-tools';
import { registerUserTools } from './tools/user-tools';
import { registerUtilityTools } from './tools/utility-tools';
import { registerAuthenticatedTools } from './tools/authenticated-tools';

// Utilities
import { setupToolHandlers } from './utils/tool-registry-helper';
import { logger } from './utils/logger';

/**
 * Server configuration from environment variables
 */
interface ServerConfig {
  // Reddit OAuth
  redditClientId: string;
  redditClientSecret: string;
  redditRedirectUri: string;
  redditUserAgent: string;
  redditScopes: string[];

  // HashiCorp Vault
  vaultAddress: string;
  vaultToken: string;
  vaultNamespace?: string;
  vaultTransitEngine: string;
  vaultKvEngine: string;

  // Redis
  redisUrl: string;
  sessionTTL: number;

  // Rate limiting
  maxRequestsPerMinute: number;
  maxRequestsPer10Minutes: number;

  // Caching
  cacheMaxSize: number;
  cacheTTL: number;
}

/**
 * Load configuration from environment variables
 */
function loadConfig(): ServerConfig {
  const config: ServerConfig = {
    // Reddit OAuth
    redditClientId: process.env.REDDIT_CLIENT_ID || '',
    redditClientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    redditRedirectUri: process.env.REDDIT_REDIRECT_URI || 'http://localhost:3000/callback',
    redditUserAgent: process.env.REDDIT_USER_AGENT || 'Reddit-Unified-MCP/1.0.0',
    redditScopes: (process.env.REDDIT_SCOPES || 'identity,read,submit,edit,vote,save,subscribe,mysubreddits').split(','),

    // HashiCorp Vault
    vaultAddress: process.env.VAULT_ADDR || 'http://localhost:8200',
    vaultToken: process.env.VAULT_TOKEN || '',
    vaultNamespace: process.env.VAULT_NAMESPACE,
    vaultTransitEngine: process.env.VAULT_TRANSIT_ENGINE || 'transit',
    vaultKvEngine: process.env.VAULT_KV_ENGINE || 'secret',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    sessionTTL: parseInt(process.env.SESSION_TTL || '3600', 10),

    // Rate limiting
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '60', 10),
    maxRequestsPer10Minutes: parseInt(process.env.MAX_REQUESTS_PER_10MIN || '600', 10),

    // Caching
    cacheMaxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
    cacheTTL: parseInt(process.env.CACHE_TTL || '300000', 10)
  };

  // Validate required configuration
  const requiredFields: (keyof ServerConfig)[] = [
    'redditClientId',
    'redditClientSecret',
    'vaultAddress',
    'vaultToken'
  ];

  const missing = requiredFields.filter(field => !config[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  return config;
}

/**
 * Initialize all server components
 */
async function initializeComponents(config: ServerConfig) {
  logger.info('Initializing Reddit Unified MCP Server components');

  // Initialize Vault client
  const vaultClient = new VaultClient({
    address: config.vaultAddress,
    token: config.vaultToken,
    namespace: config.vaultNamespace,
    transitEngine: config.vaultTransitEngine,
    kvEngine: config.vaultKvEngine
  });

  // Check Vault health
  try {
    const health = await vaultClient.getHealth();
    if (health.sealed) {
      throw new Error('Vault is sealed');
    }
    if (!health.initialized) {
      throw new Error('Vault is not initialized');
    }
    logger.info('Vault connection verified', { address: config.vaultAddress });
  } catch (error) {
    logger.error('Vault connection failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error('Failed to connect to Vault. Ensure Vault is running and accessible.');
  }

  // Initialize OAuth manager
  const oauthManager = new OAuthManager(
    {
      clientId: config.redditClientId,
      clientSecret: config.redditClientSecret,
      redirectUri: config.redditRedirectUri,
      userAgent: config.redditUserAgent,
      scopes: config.redditScopes
    },
    vaultClient
  );

  // Validate OAuth configuration
  if (!oauthManager.validateConfig()) {
    throw new Error('Invalid OAuth configuration');
  }

  // Initialize session manager
  const sessionManager = new SessionManager(
    {
      redisUrl: config.redisUrl,
      sessionTTL: config.sessionTTL
    },
    oauthManager
  );

  // Connect to Redis
  try {
    await sessionManager.connect();
    logger.info('Redis connection established', { url: config.redisUrl });
  } catch (error) {
    logger.error('Redis connection failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error('Failed to connect to Redis. Ensure Redis is running and accessible.');
  }

  // Initialize rate limiter
  const rateLimiter = new RateLimiter({
    maxRequestsPerMinute: config.maxRequestsPerMinute,
    maxRequestsPer10Minutes: config.maxRequestsPer10Minutes,
    enableAutoBackoff: true
  });

  // Initialize cache manager
  const cacheManager = new CacheManager({
    maxSize: config.cacheMaxSize,
    ttl: config.cacheTTL,
    enableStats: true
  });

  // Initialize Reddit client
  const redditClient = new RedditClient({
    userAgent: config.redditUserAgent,
    rateLimiter,
    cacheManager,
    sessionManager
  });

  logger.info('All components initialized successfully');

  return {
    vaultClient,
    oauthManager,
    sessionManager,
    rateLimiter,
    cacheManager,
    redditClient
  };
}

/**
 * Register all MCP tools
 */
function registerAllTools(server: Server, redditClient: RedditClient) {
  logger.info('Registering all MCP tools');

  // Register tool categories
  registerBrowseTools(server, redditClient); // 8 tools
  registerSearchTools(server, redditClient); // 2 tools
  registerPostTools(server, redditClient); // 4 tools
  registerCommentTools(server, redditClient); // 2 tools
  registerSubredditTools(server, redditClient); // 2 tools
  registerUserTools(server, redditClient); // 3 tools
  registerUtilityTools(server); // 1 tool
  registerAuthenticatedTools(server, redditClient); // 5 tools

  // Setup tool handlers (ListTools and CallTool)
  setupToolHandlers(server);

  const toolCount = server._tools?.length || 0;
  logger.info('All tools registered', { count: toolCount });

  return toolCount;
}

/**
 * Main server startup
 */
async function main() {
  try {
    logger.info('Starting Reddit Unified MCP Server');

    // Load configuration
    const config = loadConfig();
    logger.info('Configuration loaded', {
      redditClientId: config.redditClientId.substring(0, 8) + '...',
      vaultAddress: config.vaultAddress,
      redisUrl: config.redisUrl
    });

    // Initialize components
    const components = await initializeComponents(config);

    // Create MCP server
    const server = new Server(
      {
        name: 'reddit-unified-mcp',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Register all tools
    const toolCount = registerAllTools(server, components.redditClient);

    // Setup error handlers
    server.onerror = (error) => {
      logger.error('MCP Server error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    };

    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully');
      await components.sessionManager.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      await components.sessionManager.disconnect();
      process.exit(0);
    });

    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('Reddit Unified MCP Server started successfully', {
      toolCount,
      transport: 'stdio'
    });

    // Log server info
    logger.info('Server ready', {
      name: 'reddit-unified-mcp',
      version: '1.0.0',
      tools: toolCount,
      features: [
        'OAuth 2.0 authentication',
        'HashiCorp Vault integration',
        'Rate limiting (60/min, 600/10min)',
        'Response caching',
        'Session management',
        'Browse tools (8)',
        'Search tools (2)',
        'Post tools (4)',
        'Comment tools (2)',
        'Subreddit tools (2)',
        'User tools (3)',
        'Utility tools (1)',
        'Authenticated tools (5)'
      ]
    });

    // Periodic health checks
    setInterval(async () => {
      try {
        const redisHealth = await components.sessionManager.getHealth();
        const cacheStats = components.cacheManager.getStats();
        const rateLimitStatus = components.rateLimiter.getStatus();

        logger.debug('Health check', {
          redis: redisHealth,
          cache: cacheStats,
          rateLimit: rateLimitStatus
        });
      } catch (error) {
        logger.error('Health check failed', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }, 60000); // Every minute

  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  logger.error('Unhandled error in main', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  process.exit(1);
});
