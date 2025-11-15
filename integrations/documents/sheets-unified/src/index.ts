#!/usr/bin/env node

/**
 * Google Sheets MCP Server
 * Unified MCP server for Google Sheets API with OAuth 2.0 authentication
 *
 * Features:
 * - 40 tools for comprehensive spreadsheet management
 * - Comments operations (read, create, reply, resolve)
 * - Spreadsheet operations (list, create, get info, copy, delete, batch update)
 * - Values operations (get, update, append, clear, batch operations)
 * - Data operations (sort, find/replace, copy/paste, auto-fill, text-to-columns)
 * - Formatting (merge cells, number format, auto-resize dimensions)
 * - Row/Column operations (insert, delete, move, resize, hide/show)
 * - Charts (add, update, delete)
 * - Protection (add, update, delete protected ranges)
 * - Data validation (dropdown lists, number ranges, date rules)
 * - Multi-tenant OAuth via HashiCorp Vault
 * - Dual server: stdio (MCP) + HTTP (OAuth callbacks)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { ToolRegistry } from './utils/tool-registry-helper';
import { OAuthManager, OAuthConfig } from '../../shared/google-auth/oauth-manager.js';
import { VaultClient } from '../../shared/google-auth/vault-client.js';
import { GoogleClientFactory } from '../../shared/google-auth/google-client-factory.js';
import { SCOPE_SETS, GOOGLE_SCOPES } from '../../shared/google-auth/oauth-config.js';
import { registerSpreadsheetTools } from './tools/spreadsheets';
import { registerValuesTools } from './tools/values';
import { registerFormattingTools } from './tools/formatting';
import { registerCommentTools } from './tools/comments';
import { logger } from './utils/logger';

// Configuration
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3134', 10);
const SHEETS_SCOPES = [GOOGLE_SCOPES.SPREADSHEETS];

/**
 * Initialize Sheets MCP Server
 */
async function initializeSheetsServer(oauthManager: OAuthManager): Promise<void> {
  logger.info('Initializing Google Sheets MCP Server');

  const clientFactory = new GoogleClientFactory(oauthManager);

  // Create MCP server
  const mcpServer = new Server(
    {
      name: 'sheets-unified',
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

  logger.info('Registering Sheets tools...');
  registerSpreadsheetTools(registry, clientFactory);  // 7 tools
  registerValuesTools(registry, clientFactory);       // 14 tools (13 original + copy_to)
  registerFormattingTools(registry, clientFactory);   // 15 tools
  registerCommentTools(registry, clientFactory);      // 4 tools (comments)

  // Setup MCP server with registered tools
  registry.setupServer(mcpServer);

  logger.info('Sheets MCP Server initialized', {
    totalTools: registry.getAllTools().length,
    scopes: SHEETS_SCOPES
  });

  // Start stdio transport for MCP
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  logger.info('Sheets MCP Server connected via stdio');

  // Setup HTTP server for OAuth callbacks
  const app = express();
  app.use(express.json());

  /**
   * OAuth authorization endpoint
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
        message: 'Please visit the authUrl to authorize Google Sheets access'
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
            <title>Google Sheets - Authorization Successful</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #0F9D58 0%, #34A853 100%);
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                text-align: center;
                max-width: 500px;
              }
              h1 { color: #0F9D58; margin-bottom: 1rem; }
              p { color: #666; line-height: 1.6; }
              .check { font-size: 48px; color: #0F9D58; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="check">✓</div>
              <h1>Authorization Successful!</h1>
              <p>Google Sheets access has been authorized for tenant: <strong>${tenantId}</strong></p>
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
            <title>Google Sheets - Authorization Failed</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #0F9D58 0%, #34A853 100%);
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
              <p>Failed to authorize Google Sheets access.</p>
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
      service: 'sheets-unified',
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
      service: 'Google Sheets MCP Server',
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
      scopes: SHEETS_SCOPES
    });
  });

  // Start HTTP server
  app.listen(HTTP_PORT, () => {
    logger.info('Sheets HTTP server listening', {
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
    logger.info('Shutting down Sheets MCP Server...');
    await mcpServer.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down Sheets MCP Server...');
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
      scopes: SHEETS_SCOPES
    };

    const oauthManager = new OAuthManager(oauthConfig, vaultClient);

    // Start the server
    await initializeSheetsServer(oauthManager);
  } catch (error: any) {
    logger.error('Failed to start Sheets MCP Server', { error: error.message });
    process.exit(1);
  }
}

main();
