/**
 * GitHub Unified MCP Server - Main Entry Point
 *
 * This server provides a unified GitHub integration with:
 * - OAuth 2.0 authentication (no manual token management)
 * - Multi-tenant credential storage (HashiCorp Vault)
 * - 29 GitHub tools: repositories, issues, PRs, actions/workflows
 * - Automatic token refresh and session management
 * - Official @octokit/rest SDK for reliability
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Import auth components
import { OAuthManager, OAuthConfig } from './auth/oauth-manager.js';
import { VaultClient } from './auth/vault-client.js';

// Import GitHub client
import { GitHubClient } from './clients/github-client.js';

// Import utilities
import { logger } from './utils/logger.js';
import { ToolRegistry } from './utils/tool-registry-helper.js';
import { formatErrorResponse } from './utils/error-handler.js';

// Import tool registration functions
import {
  registerRepositoryTools,
  registerIssuesTools,
  registerPullRequestTools,
  registerActionsTools,
} from './tools/index.js';

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  const required = [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GITHUB_REDIRECT_URI',
    'VAULT_ADDR',
    'VAULT_TOKEN',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  logger.info('Environment variables validated successfully');
}

/**
 * Ensure required directories exist
 */
function ensureDirectories(): void {
  const directories = ['logs', '.sessions'];

  directories.forEach((dir) => {
    const dirPath = resolve(process.cwd(), dir);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });
}

/**
 * Test Vault connection
 */
async function testVaultConnection(vaultClient: VaultClient): Promise<void> {
  try {
    const isHealthy = await vaultClient.healthCheck();
    if (!isHealthy) {
      throw new Error('Vault is sealed or unhealthy');
    }
    logger.info('Vault connection successful');
  } catch (error: any) {
    logger.error('Failed to connect to Vault', { error: error.message });
    throw new Error(`Vault connection failed: ${error.message}`);
  }
}

/**
 * Register all GitHub MCP tools
 */
function registerTools(
  server: Server,
  githubClient: GitHubClient
): ToolRegistry {
  logger.info('Registering GitHub MCP tools...');

  // Create tool registry
  const registry = new ToolRegistry();

  // Register all 29 tools across 4 categories
  registerRepositoryTools(registry, githubClient); // 7 tools
  registerIssuesTools(registry, githubClient); // 6 tools
  registerPullRequestTools(registry, githubClient); // 8 tools
  registerActionsTools(registry, githubClient); // 8 tools

  logger.info('Registered all tools', {
    count: registry.getToolCount(),
    tools: registry.getRegisteredTools(),
  });

  // Setup server with registered tools
  registry.setupServer(server);
  logger.info('ToolRegistry connected to MCP server');

  return registry;
}

/**
 * Create Express server for OAuth callbacks
 */
function createExpressServer(
  oauthManager: OAuthManager,
  port: number
): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'github-unified-mcp',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // OAuth authorization endpoint
  app.get('/oauth/authorize', (req: Request, res: Response) => {
    try {
      const tenantId = req.query.tenant_id as string;

      if (!tenantId) {
        return res.status(400).json({
          error: 'Missing required parameter',
          message: 'tenant_id is required',
        });
      }

      const authUrl = oauthManager.generateAuthUrl(tenantId);

      logger.info('Generated OAuth authorization URL', { tenantId });

      res.json({
        authUrl,
        instructions:
          'Open this URL in your browser to authenticate with GitHub',
      });
    } catch (error: any) {
      logger.error('Failed to generate OAuth URL', { error: error.message });
      res.status(500).json(formatErrorResponse(error));
    }
  });

  // OAuth callback endpoint
  app.get('/oauth/callback', async (req: Request, res: Response) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;
      const error = req.query.error as string;

      // Handle OAuth errors
      if (error) {
        logger.error('OAuth authorization failed', { error });
        return res.status(400).send(`
          <html>
            <head><title>Authentication Failed</title></head>
            <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
              <h1 style="color: #d32f2f;">❌ Authentication Failed</h1>
              <p>GitHub returned an error: <strong>${error}</strong></p>
              <p>Please try again or contact support.</p>
              <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
                Close Window
              </button>
            </body>
          </html>
        `);
      }

      if (!code || !state) {
        return res.status(400).send(`
          <html>
            <head><title>Invalid Request</title></head>
            <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
              <h1 style="color: #d32f2f;">❌ Invalid Request</h1>
              <p>Missing authorization code or state parameter.</p>
              <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
                Close Window
              </button>
            </body>
          </html>
        `);
      }

      // Extract tenant ID from state (state format: tenantId:randomValue)
      const tenantId = state.split(':')[0];

      // Exchange authorization code for access token
      logger.info('Processing OAuth callback', { tenantId });
      await oauthManager.handleCallback(code, tenantId);

      logger.info('OAuth authentication successful', { tenantId });

      // Success page
      res.send(`
        <html>
          <head><title>Authentication Successful</title></head>
          <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
            <h1 style="color: #4caf50;">✅ Authentication Successful!</h1>
            <p>Your GitHub account has been connected successfully.</p>
            <p>You can now close this window and return to your application.</p>
            <script>
              // Auto-close after 3 seconds
              setTimeout(() => window.close(), 3000);
            </script>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-top: 20px;">
              Close Window
            </button>
          </body>
        </html>
      `);
    } catch (error: any) {
      logger.error('OAuth callback failed', {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).send(`
        <html>
          <head><title>Authentication Error</title></head>
          <body style="font-family: Arial, sans-serif; padding: 50px; text-align: center;">
            <h1 style="color: #d32f2f;">❌ Authentication Error</h1>
            <p>Failed to complete authentication: ${error.message}</p>
            <p>Please try again or contact support.</p>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
              Close Window
            </button>
          </body>
        </html>
      `);
    }
  });

  // Revoke credentials endpoint (for testing/cleanup)
  app.delete('/oauth/revoke', async (req: Request, res: Response) => {
    try {
      const tenantId = req.query.tenant_id as string;

      if (!tenantId) {
        return res.status(400).json({
          error: 'Missing required parameter',
          message: 'tenant_id is required',
        });
      }

      await oauthManager.revokeCredentials(tenantId);

      logger.info('Credentials revoked', { tenantId });

      res.json({
        success: true,
        message: 'Credentials revoked successfully',
        tenantId,
      });
    } catch (error: any) {
      logger.error('Failed to revoke credentials', { error: error.message });
      res.status(500).json(formatErrorResponse(error));
    }
  });

  return app;
}

/**
 * Main server startup
 */
async function main() {
  try {
    logger.info('Starting GitHub Unified MCP Server...');

    // 1. Validate environment
    validateEnvironment();

    // 2. Ensure required directories exist
    ensureDirectories();

    // 3. Initialize Vault client
    const vaultClient = new VaultClient(
      process.env.VAULT_ADDR!,
      process.env.VAULT_TOKEN!,
      process.env.VAULT_NAMESPACE || 'github-mcp'
    );

    // 4. Test Vault connection
    await testVaultConnection(vaultClient);

    // 5. Initialize OAuth manager
    const oauthConfig: OAuthConfig = {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      redirectUri: process.env.GITHUB_REDIRECT_URI!,
      scopes: [
        'repo', // Full repository access
        'read:user', // Read user profile
        'user:email', // Read user email
        'workflow', // Update GitHub Actions workflows
      ],
    };

    const oauthManager = new OAuthManager(oauthConfig, vaultClient);

    // 6. Initialize GitHub client
    const githubClient = new GitHubClient(oauthManager);

    // 7. Create Express server for OAuth callbacks
    const port = parseInt(process.env.PORT || '3000', 10);
    const app = createExpressServer(oauthManager, port);

    const httpServer = app.listen(port, () => {
      logger.info(`OAuth callback server listening on port ${port}`);
      logger.info(
        `Authorization URL: http://localhost:${port}/oauth/authorize?tenant_id=YOUR_TENANT_ID`
      );
      logger.info(`Health check: http://localhost:${port}/health`);
    });

    // 8. Create MCP server
    const mcpServer = new Server(
      {
        name: 'github-unified',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 9. Register MCP tools
    const registry = registerTools(mcpServer, githubClient);

    // 10. Start MCP server with stdio transport
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);

    logger.info('GitHub Unified MCP Server started successfully');
    logger.info('Server info:', {
      mcpServer: 'github-unified v1.0.0',
      oauthEndpoint: `http://localhost:${port}/oauth/authorize`,
      transport: 'stdio',
      toolCount: registry.getToolCount(),
      capabilities:
        'OAuth 2.0, Multi-tenant, 29 GitHub tools (repos, issues, PRs, actions)',
    });

    // 11. Graceful shutdown handler
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      try {
        // Close HTTP server
        httpServer.close(() => {
          logger.info('HTTP server closed');
        });

        // Close MCP server
        await mcpServer.close();
        logger.info('MCP server closed');

        logger.info('Shutdown complete');
        process.exit(0);
      } catch (error: any) {
        logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
      }
    };

    // Register shutdown handlers
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack,
      });
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
      shutdown('unhandledRejection');
    });
  } catch (error: any) {
    logger.error('Fatal error during startup', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  main().catch((error) => {
    logger.error('Fatal error', { error });
    process.exit(1);
  });
}

export { main };
