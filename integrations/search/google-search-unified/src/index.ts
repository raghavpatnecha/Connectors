#!/usr/bin/env node

/**
 * Google Custom Search MCP Server
 * Unified MCP server for Google Custom Search API with OAuth 2.0 authentication
 *
 * Features:
 * - 6 tools for web search and custom search engine management
 * - Multi-tenant OAuth via HashiCorp Vault
 * - Dual server: stdio (MCP) + HTTP (OAuth callbacks)
 * - Search operations (web, image, news)
 * - CSE operations (list, get, update)
 * - Advanced filtering and pagination support
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { ToolRegistry } from './utils/tool-registry-helper';
import { SearchClient, SearchClientFactory } from './clients/search-client';
import { registerSearchTools } from './tools/search';
import { registerCSETools } from './tools/cse';
import { logger } from './utils/logger';

// OAuth integration (simplified interface)
interface OAuthManager {
  generateAuthUrl(tenantId: string, additionalScopes?: string[]): string;
  handleCallback(code: string, tenantId: string): Promise<void>;
  getAuthenticatedClient(tenantId: string): Promise<any>;
  validateCredentials(tenantId: string): Promise<boolean>;
  revokeCredentials(tenantId: string): Promise<void>;
}

// Mock OAuth manager for development (replace with actual implementation)
class MockOAuthManager implements OAuthManager {
  generateAuthUrl(tenantId: string): string {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=mock&redirect_uri=http://localhost:3139/oauth/callback&response_type=code&scope=https://www.googleapis.com/auth/cse&state=${tenantId}`;
  }

  async handleCallback(code: string, tenantId: string): Promise<void> {
    logger.info('Mock OAuth callback', { code, tenantId });
  }

  async getAuthenticatedClient(tenantId: string): Promise<any> {
    // Return a mock OAuth2Client
    return {
      credentials: {
        access_token: process.env.GOOGLE_PSE_API_KEY,
      },
    };
  }

  async validateCredentials(tenantId: string): Promise<boolean> {
    return true;
  }

  async revokeCredentials(tenantId: string): Promise<void> {
    logger.info('Mock OAuth revoke', { tenantId });
  }
}

// Configuration
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3139', 10);

/**
 * Initialize Search MCP Server
 */
async function initializeSearchServer(): Promise<void> {
  logger.info('Initializing Google Custom Search MCP Server');

  // Initialize search client
  const searchClient = new SearchClient();
  const searchClientFactory = new SearchClientFactory(searchClient);

  // Initialize OAuth manager (use mock for now, replace with actual implementation)
  const oauthManager: OAuthManager = new MockOAuthManager();

  // Create MCP server
  const mcpServer = new Server(
    {
      name: 'google-search-unified',
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

  logger.info('Registering Search tools...');
  registerSearchTools(registry, searchClientFactory, oauthManager); // 3 tools
  registerCSETools(registry, searchClientFactory, oauthManager);     // 3 tools

  // Setup MCP server with registered tools
  registry.setupServer(mcpServer);

  logger.info('Search MCP Server initialized', {
    totalTools: registry.getAllTools().length,
    port: HTTP_PORT,
  });

  // Start stdio transport for MCP
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  logger.info('Search MCP Server connected via stdio');

  // Setup HTTP server for OAuth callbacks
  const app = express();
  app.use(express.json());

  /**
   * OAuth authorization endpoint
   * Generates auth URL for tenant to authorize Google Search access
   */
  app.get('/oauth/authorize', (req, res) => {
    const { tenantId } = req.query;

    if (!tenantId || typeof tenantId !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid tenantId parameter',
      });
    }

    try {
      const authUrl = oauthManager.generateAuthUrl(tenantId);

      logger.info('Generated OAuth URL', { tenantId });

      res.json({
        authUrl,
        message: 'Please visit the authUrl to authorize Google Custom Search access',
      });
    } catch (error: any) {
      logger.error('Failed to generate auth URL', {
        tenantId,
        error: error.message,
      });

      res.status(500).json({
        error: 'Failed to generate authorization URL',
        message: error.message,
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
        error: 'Missing authorization code',
      });
    }

    if (!state || typeof state !== 'string') {
      return res.status(400).json({
        error: 'Missing state parameter (tenantId)',
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
            <title>Google Search - Authorization Successful</title>
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
              <p>Google Custom Search access has been authorized for tenant: <strong>${tenantId}</strong></p>
              <p>You can now close this window and return to your application.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      logger.error('OAuth callback failed', {
        tenantId,
        error: error.message,
      });

      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Google Search - Authorization Failed</title>
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
              <p>Failed to authorize Google Custom Search access.</p>
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
      service: 'google-search-unified',
      version: '1.0.0',
      tools: registry.getAllTools().length,
      uptime: process.uptime(),
    });
  });

  /**
   * Root endpoint with service info
   */
  app.get('/', (req, res) => {
    res.json({
      service: 'Google Custom Search MCP Server',
      version: '1.0.0',
      tools: registry.getAllTools().map((t) => ({
        name: t.name,
        description: t.description,
      })),
      endpoints: {
        authorize: '/oauth/authorize?tenantId=YOUR_TENANT_ID',
        callback: '/oauth/callback',
        health: '/health',
      },
      configuration: {
        hasApiKey: !!process.env.GOOGLE_PSE_API_KEY,
        hasSearchEngineId: !!process.env.GOOGLE_PSE_ENGINE_ID,
      },
    });
  });

  // Start HTTP server
  app.listen(HTTP_PORT, () => {
    logger.info('Search HTTP server listening', {
      port: HTTP_PORT,
      endpoints: {
        authorize: `/oauth/authorize`,
        callback: `/oauth/callback`,
        health: `/health`,
      },
    });
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down Search MCP Server...');
    await mcpServer.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down Search MCP Server...');
    await mcpServer.close();
    process.exit(0);
  });
}

// Start the server
initializeSearchServer().catch((error) => {
  logger.error('Failed to start Search MCP Server', { error: error.message });
  process.exit(1);
});
