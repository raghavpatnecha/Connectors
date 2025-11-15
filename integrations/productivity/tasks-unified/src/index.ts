#!/usr/bin/env node

/**
 * Google Tasks MCP Server
 * Unified MCP server for Google Tasks API with OAuth 2.0 authentication
 *
 * Features:
 * - 16 tools for comprehensive task and task list management
 * - Multi-tenant OAuth via HashiCorp Vault
 * - Dual server: stdio (MCP) + HTTP (OAuth callbacks)
 * - Task list operations (list, create, update, delete)
 * - Task operations (list, create, update, delete, move, complete)
 * - Subtask support with parent-child relationships
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { ToolRegistry } from './utils/tool-registry-helper';
import { OAuthManager, OAuthConfig } from '../../shared/google-auth/oauth-manager';
import { VaultClient } from '../../shared/google-auth/vault-client';
import { GoogleClientFactory } from '../../shared/google-auth/google-client-factory';
import { SCOPE_SETS, GOOGLE_SCOPES } from '../../shared/google-auth/oauth-config';
import { registerTaskListTools } from './tools/tasklists';
import { registerTaskTools } from './tools/tasks';
import { logger } from './utils/logger';

// Configuration
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3137', 10);
const TASKS_SCOPES = [GOOGLE_SCOPES.TASKS];

/**
 * Initialize Tasks MCP Server
 */
async function initializeTasksServer(oauthManager: OAuthManager): Promise<void> {
  logger.info('Initializing Google Tasks MCP Server');

  const clientFactory = new GoogleClientFactory(oauthManager);

  // Create MCP server
  const mcpServer = new Server(
    {
      name: 'tasks-unified',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register all tools
  const registry = new ToolRegistry();

  logger.info('Registering Tasks tools...');
  registerTaskListTools(registry, clientFactory);  // 6 tools
  registerTaskTools(registry, clientFactory);      // 10 tools

  // Setup MCP server with registered tools
  registry.setupServer(mcpServer);

  logger.info('Tasks MCP Server initialized', {
    totalTools: registry.getAllTools().length,
    scopes: TASKS_SCOPES
  });

  // Start stdio transport for MCP
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  logger.info('Tasks MCP Server connected via stdio');

  // Setup HTTP server for OAuth callbacks
  const app = express();
  app.use(express.json());

  /**
   * OAuth authorization endpoint
   * Generates auth URL for tenant to authorize Google Tasks access
   */
  app.get('/oauth/authorize', (req, res) => {
    const { tenantId } = req.query;

    if (!tenantId || typeof tenantId !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid tenantId parameter'
      });
    }

    try {
      const authUrl = oauthManager.generateAuthUrl(tenantId);

      logger.info('Generated OAuth URL', { tenantId });

      res.json({
        authUrl,
        message: 'Please visit the authUrl to authorize Google Tasks access'
      });
    } catch (error: any) {
      logger.error('Failed to generate auth URL', {
        tenantId,
        error: error.message
      });

      res.status(500).json({
        error: 'Failed to generate authorization URL',
        message: error.message
      });
    }
  });

  /**
   * OAuth callback endpoint
   * Handles the OAuth callback after user authorization
   */
  app.get('/oauth/callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Missing authorization code'
      });
    }

    if (!state || typeof state !== 'string') {
      return res.status(400).json({
        error: 'Missing state parameter (tenantId)'
      });
    }

    const tenantId = state;

    try {
      await oauthManager.handleCallback(code, tenantId);

      logger.info('OAuth callback successful', { tenantId });

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Google Tasks - Authorization Successful</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #4CAF50; margin-bottom: 1rem; }
              p { color: #666; line-height: 1.6; }
              .check { font-size: 48px; color: #4CAF50; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="check">✓</div>
              <h1>Authorization Successful!</h1>
              <p>Google Tasks access has been authorized for tenant: <strong>${tenantId}</strong></p>
              <p>You can now close this window and return to your application.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      logger.error('OAuth callback failed', {
        tenantId,
        error: error.message
      });

      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Google Tasks - Authorization Failed</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #f44336; margin-bottom: 1rem; }
              p { color: #666; line-height: 1.6; }
              .error { font-size: 48px; color: #f44336; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error">✗</div>
              <h1>Authorization Failed</h1>
              <p>Failed to authorize Google Tasks access.</p>
              <p>Error: ${error.message}</p>
              <p>Please try again or contact support.</p>
            </div>
          </body>
        </html>
      `);
    }
  });

  /**
   * Health check endpoint
   */
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'tasks-unified',
      version: '1.0.0',
      tools: registry.getAllTools().length,
      uptime: process.uptime()
    });
  });

  /**
   * Root endpoint with service info
   */
  app.get('/', (req, res) => {
    res.json({
      service: 'Google Tasks MCP Server',
      version: '1.0.0',
      tools: registry.getAllTools().map(t => ({
        name: t.name,
        description: t.description
      })),
      endpoints: {
        authorize: '/oauth/authorize?tenantId=YOUR_TENANT_ID',
        callback: '/oauth/callback',
        health: '/health'
      },
      scopes: TASKS_SCOPES
    });
  });

  // Start HTTP server
  app.listen(HTTP_PORT, () => {
    logger.info('Tasks HTTP server listening', {
      port: HTTP_PORT,
      endpoints: {
        authorize: `/oauth/authorize`,
        callback: `/oauth/callback`,
        health: `/health`
      }
    });
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down Tasks MCP Server...');
    await mcpServer.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down Tasks MCP Server...');
    await mcpServer.close();
    process.exit(0);
  });
}

// Start the server
async function main() {
  try {
    // Initialize Vault client
    const vaultClient = new VaultClient(
      process.env.VAULT_ADDR || 'http://localhost:8200',
      process.env.VAULT_TOKEN || 'dev-token',
      'google-workspace-mcp'
    );

    // Initialize OAuth manager
    const oauthConfig: OAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || `http://localhost:${HTTP_PORT}/oauth/callback`,
      scopes: TASKS_SCOPES
    };

    const oauthManager = new OAuthManager(oauthConfig, vaultClient);

    // Start the server
    await initializeTasksServer(oauthManager);
  } catch (error: any) {
    logger.error('Failed to start Tasks MCP Server', { error: error.message });
    process.exit(1);
  }
}

main();
