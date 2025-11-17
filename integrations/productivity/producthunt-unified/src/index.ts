/**
 * Product Hunt Unified MCP Server - Main Entry Point
 *
 * This server provides a unified Product Hunt integration with:
 * - API token authentication (multi-tenant via HashiCorp Vault)
 * - GraphQL client for Product Hunt API v2
 * - Tools for posts, comments, collections, topics, users
 * - Rate limiting and error handling
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// Import auth components
import { VaultClient } from './auth/vault-client.js';
import { TokenManager } from './auth/token-manager.js';

// Import Product Hunt client
import { ProductHuntClient } from './clients/producthunt-client.js';

// Import utilities
import { logger } from './utils/logger.js';
import { ToolRegistry } from './utils/tool-registry-helper.js';
import { formatErrorResponse } from './utils/error-handler.js';

// Import tool registration functions
import {
  getPostTools,
  getTopicTools,
  getUserTools,
  getCommentTools,
  getCollectionTools,
  getServerTools,
} from './tools/index.js';

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  const required = ['VAULT_ADDR', 'VAULT_TOKEN'];

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
  const directories = ['logs'];

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
 * Register all Product Hunt MCP tools
 */
function registerTools(
  server: Server,
  productHuntClient: ProductHuntClient
): ToolRegistry {
  logger.info('Registering Product Hunt MCP tools...');

  const registry = new ToolRegistry();

  // Register all tools
  const postTools = getPostTools(productHuntClient);
  const topicTools = getTopicTools(productHuntClient);
  const userTools = getUserTools(productHuntClient);
  const commentTools = getCommentTools(productHuntClient);
  const collectionTools = getCollectionTools(productHuntClient);
  const serverTools = getServerTools(productHuntClient);

  registry.registerTools([
    ...postTools,
    ...topicTools,
    ...userTools,
    ...commentTools,
    ...collectionTools,
    ...serverTools,
  ]);

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
 * Create Express server for token management endpoints
 */
function createExpressServer(tokenManager: TokenManager): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'producthunt-unified-mcp',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Set API token for a tenant
  app.post('/token/set', async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenantId, apiToken } = req.body;

      if (!tenantId || !apiToken) {
        res.status(400).json({
          error: 'Missing required parameters',
          message: 'Both tenantId and apiToken are required',
        });
        return;
      }

      await tokenManager.storeToken(tenantId, apiToken);

      logger.info('API token configured via HTTP', { tenantId });

      res.json({
        success: true,
        message: 'API token stored successfully',
        tenantId,
      });
    } catch (error: any) {
      logger.error('Failed to store API token', { error: error.message });
      res.status(500).json(formatErrorResponse(error));
    }
  });

  // Revoke API token for a tenant
  app.delete('/token/revoke', async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.query.tenant_id as string;

      if (!tenantId) {
        res.status(400).json({
          error: 'Missing required parameter',
          message: 'tenant_id is required',
        });
        return;
      }

      await tokenManager.revokeToken(tenantId);

      logger.info('API token revoked', { tenantId });

      res.json({
        success: true,
        message: 'API token revoked successfully',
        tenantId,
      });
    } catch (error: any) {
      logger.error('Failed to revoke API token', { error: error.message });
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
    logger.info('Starting Product Hunt Unified MCP Server...');

    // 1. Validate environment
    validateEnvironment();

    // 2. Ensure required directories exist
    ensureDirectories();

    // 3. Initialize Vault client
    const vaultClient = new VaultClient(
      process.env.VAULT_ADDR!,
      process.env.VAULT_TOKEN!,
      process.env.VAULT_NAMESPACE || 'producthunt-mcp'
    );

    // 4. Test Vault connection
    await testVaultConnection(vaultClient);

    // 5. Initialize Token Manager
    const tokenManager = new TokenManager(vaultClient);

    // 6. Initialize Product Hunt client
    const productHuntClient = new ProductHuntClient(tokenManager);

    // 7. Create Express server for token management
    const port = parseInt(process.env.PORT || '3000', 10);
    const app = createExpressServer(tokenManager);

    const httpServer = app.listen(port, () => {
      logger.info(`HTTP server listening on port ${port}`);
      logger.info(`Health check: http://localhost:${port}/health`);
      logger.info(`Set token: POST http://localhost:${port}/token/set`);
    });

    // 8. Create MCP server
    const mcpServer = new Server(
      {
        name: 'producthunt-unified',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // 9. Register MCP tools
    const registry = registerTools(mcpServer, productHuntClient);

    // 10. Start MCP server with stdio transport
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);

    logger.info('Product Hunt Unified MCP Server started successfully');
    logger.info('Server info:', {
      mcpServer: 'producthunt-unified v1.0.0',
      httpEndpoint: `http://localhost:${port}`,
      transport: 'stdio',
      toolCount: registry.getToolCount(),
      capabilities:
        'API Token Auth, Multi-tenant, GraphQL, 11 tools (posts, topics, users, comments, collections, server)',
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
main().catch((error) => {
  logger.error('Fatal error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});

export { main };
