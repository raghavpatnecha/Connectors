#!/usr/bin/env node

/**
 * Google Slides MCP Server
 * Unified MCP server for Google Slides API with OAuth 2.0 authentication
 *
 * Features:
 * - 28 tools for comprehensive presentation creation and editing
 * - Presentation management (create, get, search, copy, delete, export)
 * - Slide operations (create, delete, duplicate, reorder)
 * - Element creation (shapes, text boxes, images, tables, lines, videos)
 * - Text manipulation (insert, delete, format)
 * - Thumbnail generation
 * - Multi-tenant OAuth via shared Google auth
 * - Dual server: stdio (MCP) + HTTP (OAuth callbacks)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { ToolRegistry } from './utils/tool-registry-helper';
import { OAuthManager, OAuthConfig } from '../../shared/google-auth/oauth-manager';
import { VaultClient } from '../../shared/google-auth/vault-client';
import { GoogleClientFactory } from '../../shared/google-auth/google-client-factory';
import { GOOGLE_SCOPES } from '../../shared/google-auth/oauth-config';
import {
  registerPresentationTools,
  registerPageTools,
  registerElementTools,
  registerThumbnailTools
} from './tools/index';
import { logger } from './utils/logger';

// Configuration
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3135', 10);
const SLIDES_SCOPES = [
  GOOGLE_SCOPES.PRESENTATIONS,
  GOOGLE_SCOPES.DRIVE  // For Drive operations (copy, delete, export, search)
];

/**
 * Initialize Slides MCP Server
 */
async function initializeSlidesServer(oauthManager: OAuthManager): Promise<void> {
  logger.info('Initializing Google Slides MCP Server');

  const clientFactory = new GoogleClientFactory(oauthManager);

  // Create MCP server
  const mcpServer = new Server(
    {
      name: 'slides-unified',
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

  logger.info('Registering Slides tools...');
  registerPresentationTools(registry, clientFactory);  // 7 tools: create, get, batch_update, search, copy, delete, export
  registerPageTools(registry, clientFactory);          // 5 tools: create_slide, delete_slide, duplicate_slide, get_page, reorder_slides
  registerElementTools(registry, clientFactory);       // 11 tools: create_shape, insert_text, delete_text, create_image, create_table, create_line, create_video, update_text_style, delete_element, replace_text, update_shape_properties
  registerThumbnailTools(registry, clientFactory);     // 2 tools: get_page_thumbnail, get_all_thumbnails

  // Setup MCP server with registered tools
  registry.setupServer(mcpServer);

  logger.info('Slides MCP Server initialized', {
    totalTools: registry.getAllTools().length,
    scopes: SLIDES_SCOPES
  });

  // Start stdio transport for MCP
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);

  logger.info('Slides MCP Server connected via stdio');

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
        message: 'Please visit the authUrl to authorize Google Slides access'
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
            <title>Google Slides - Authorization Successful</title>
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
              <p>Google Slides access has been authorized for tenant: <strong>${tenantId}</strong></p>
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
            <title>Google Slides - Authorization Failed</title>
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
              <p>Failed to authorize Google Slides access.</p>
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
      service: 'slides-unified',
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
      service: 'Google Slides MCP Server',
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
      scopes: SLIDES_SCOPES
    });
  });

  // Start HTTP server
  app.listen(HTTP_PORT, () => {
    logger.info('Slides HTTP server listening', {
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
    logger.info('Shutting down Slides MCP Server...');
    await mcpServer.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down Slides MCP Server...');
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
      scopes: SLIDES_SCOPES
    };

    const oauthManager = new OAuthManager(oauthConfig, vaultClient);

    // Start the server
    await initializeSlidesServer(oauthManager);
  } catch (error: any) {
    logger.error('Failed to start Slides MCP Server', { error: error.message });
    process.exit(1);
  }
}

main();
