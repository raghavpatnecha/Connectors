/**
 * Twitter Unified MCP Server
 * Main entry point - combines 45+ tools from 4 different implementations
 *
 * Features:
 * - OAuth 1.0a authentication with Vault storage
 * - Session cookie fallback authentication
 * - SocialData API for enhanced analytics
 * - 45+ comprehensive tools for tweets, users, lists, and analytics
 * - Multi-tenant isolation
 * - Rate limiting (Twitter API limits)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import express from 'express';
import { VaultClient } from './auth/vault-client';
import { OAuthManager } from './auth/oauth-manager';
import { TwitterClient } from './clients/twitter-client';
import { RateLimiter } from './clients/rate-limiter';
import { ToolHandlerRegistry } from './tools';
import { logger, logOAuthEvent } from './utils/logger';

dotenv.config();

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  const required = [
    'X_API_KEY',
    'X_API_SECRET',
    'VAULT_ADDR',
    'VAULT_TOKEN'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Ensure required directories exist
 */
function ensureDirectories(): void {
  const fs = require('fs');
  const directories = ['logs', '.sessions'];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Twitter Unified MCP Server
 */
class TwitterUnifiedMCP {
  private readonly _server: Server;
  private readonly _httpServer: express.Application;
  private readonly _vaultClient: VaultClient;
  private readonly _oauthManager: OAuthManager;
  private readonly _twitterClient: TwitterClient;
  private readonly _toolRegistry: ToolHandlerRegistry;
  private _httpServerInstance: any;

  constructor() {
    // Initialize components
    this._vaultClient = new VaultClient({
      address: process.env.VAULT_ADDR!,
      token: process.env.VAULT_TOKEN!
    });

    this._oauthManager = new OAuthManager(
      {
        apiKey: process.env.X_API_KEY!,
        apiSecret: process.env.X_API_SECRET!
      },
      this._vaultClient
    );

    const rateLimiter = new RateLimiter({
      requestsPerMinute: parseInt(process.env.TWITTER_RATE_LIMIT_PER_MINUTE || '15', 10),
      requestsPerDay: parseInt(process.env.TWITTER_RATE_LIMIT_PER_DAY || '50', 10),
      requestsPerMonth: parseInt(process.env.TWITTER_RATE_LIMIT_PER_MONTH || '500', 10)
    });

    this._twitterClient = new TwitterClient({
      oauthManager: this._oauthManager,
      vaultClient: this._vaultClient,
      rateLimiter,
      socialDataApiKey: process.env.SOCIALDATA_API_KEY
    });

    this._toolRegistry = new ToolHandlerRegistry(this._twitterClient);

    // Initialize MCP Server
    this._server = new Server(
      {
        name: 'twitter-unified',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Initialize HTTP server for OAuth endpoints
    this._httpServer = express();
    this._httpServer.use(express.json());

    this._setupMCPHandlers();
    this._setupHTTPRoutes();

    logger.info('TwitterUnifiedMCP initialized', {
      tools: this._toolRegistry.getAllTools().length,
      port: process.env.PORT || 3150
    });
  }

  /**
   * Setup MCP request handlers
   */
  private _setupMCPHandlers(): void {
    // List available tools
    this._server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: this._toolRegistry.getAllTools()
      })
    );

    // Handle tool invocations
    this._server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        const { name, arguments: args } = request.params;

        try {
          logger.info('Tool invocation', {
            tool: name,
            tenantId: args?.tenantId
          });

          const result = await this._toolRegistry.handleTool(name, args || {});

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error: any) {
          logger.error('Tool invocation failed', {
            tool: name,
            tenantId: args?.tenantId,
            error: error.message
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: error.message,
                  tool: name
                }, null, 2)
              }
            ],
            isError: true
          };
        }
      }
    );
  }

  /**
   * Setup HTTP routes for OAuth and health
   */
  private _setupHTTPRoutes(): void {
    // Health check
    this._httpServer.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'twitter-unified-mcp',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        tools: this._toolRegistry.getAllTools().length
      });
    });

    // Store OAuth credentials
    this._httpServer.post('/oauth/store', async (req, res) => {
      try {
        const { tenantId, accessToken, accessTokenSecret, socialDataApiKey } = req.body;

        if (!tenantId || !accessToken || !accessTokenSecret) {
          return res.status(400).json({
            error: 'Missing required fields: tenantId, accessToken, accessTokenSecret'
          });
        }

        await this._oauthManager.storeCredentials(tenantId, {
          accessToken,
          accessTokenSecret,
          socialDataApiKey
        });

        logOAuthEvent('credentials_stored_via_http', tenantId);

        res.json({
          success: true,
          message: 'Credentials stored successfully'
        });
      } catch (error: any) {
        logger.error('Failed to store credentials', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Store session cookies (fallback auth)
    this._httpServer.post('/session/store', async (req, res) => {
      try {
        const { tenantId, authToken, ct0, twid } = req.body;

        if (!tenantId || !authToken || !ct0 || !twid) {
          return res.status(400).json({
            error: 'Missing required fields: tenantId, authToken, ct0, twid'
          });
        }

        await this._vaultClient.storeSessionCookies(tenantId, {
          authToken,
          ct0,
          twid
        });

        res.json({
          success: true,
          message: 'Session cookies stored successfully'
        });
      } catch (error: any) {
        logger.error('Failed to store session cookies', { error: error.message });
        res.status(500).json({ error: error.message });
      }
    });

    // Get tenant status
    this._httpServer.get('/tenant/:tenantId/status', async (req, res) => {
      try {
        const { tenantId } = req.params;

        const oauthCreds = await this._vaultClient.getOAuthCredentials(tenantId);
        const sessionCookies = await this._vaultClient.getSessionCookies(tenantId);

        res.json({
          tenantId,
          hasOAuthCredentials: !!oauthCreds,
          hasSessionCookies: !!sessionCookies,
          hasSocialDataKey: !!(oauthCreds?.socialDataApiKey)
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    // Start HTTP server
    const port = parseInt(process.env.PORT || '3150', 10);
    this._httpServerInstance = this._httpServer.listen(port, () => {
      logger.info('HTTP server listening', { port });
    });

    // Start MCP stdio transport
    const transport = new StdioServerTransport();
    await this._server.connect(transport);

    logger.info('MCP server connected via stdio');
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    logger.info('Shutting down Twitter Unified MCP server');

    if (this._httpServerInstance) {
      this._httpServerInstance.close();
    }

    await this._server.close();
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  try {
    validateEnvironment();
    ensureDirectories();

    const server = new TwitterUnifiedMCP();

    // Graceful shutdown handlers
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach(signal => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, shutting down gracefully`);
        await server.close();
        process.exit(0);
      });
    });

    await server.start();

    logger.info('Twitter Unified MCP server started successfully');
  } catch (error: any) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { TwitterUnifiedMCP, main };
