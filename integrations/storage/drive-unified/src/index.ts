#!/usr/bin/env node

/**
 * Google Drive MCP Server - Unified Implementation
 *
 * Features:
 * - 41 comprehensive Drive tools for files, folders, permissions, comments, and shared drives
 * - Multi-tenant OAuth via shared Google auth
 * - Dual server: stdio (MCP) + HTTP (OAuth callbacks)
 *
 * Tools:
 * - Files (18): search, get, create, list, update, copy, delete, export, etc.
 * - Folders (4): create, move, add_parent, remove_parent
 * - Permissions (5): list, get, create, update, delete
 * - Comments (9): list, get, create, update, delete + replies
 * - Shared Drives (5): list, get, create, update, delete
 *
 * Port: 3132
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { ToolRegistry } from './utils/tool-registry-helper.js';
import { GoogleClientFactory } from './clients/drive-client.js';
import { registerAllDriveTools } from './tools/index.js';
import { OAuthManager } from '../../shared/google-auth/oauth-manager';
import { GOOGLE_SCOPES } from '../../shared/google-auth/oauth-config';

// Configuration
const PORT = parseInt(process.env.PORT || '3132', 10);
const OAUTH_CALLBACK_PATH = process.env.OAUTH_CALLBACK_PATH || '/oauth/callback';

// Google Drive API scopes
const DRIVE_SCOPES = [
  GOOGLE_SCOPES.DRIVE
];

// OAuth manager (global instance)
let oauthManager: OAuthManager;

/**
 * Initialize Drive MCP Server with OAuth
 */
async function initializeDriveServer(): Promise<Server> {
  console.log('Initializing Google Drive MCP Server');

  // Initialize OAuth manager
  oauthManager = new OAuthManager(DRIVE_SCOPES);

  // Initialize tool registry and client factory
  const registry = new ToolRegistry();
  const clientFactory = new GoogleClientFactory(oauthManager);

  // Register all 41 Drive tools
  registerAllDriveTools(registry, clientFactory);

  // Create MCP server
  const server = new Server(
    {
      name: 'google-drive-mcp',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Handle list_tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: registry.getTools()
    };
  });

  // Handle call_tool
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handler = registry.getHandler(name);
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Extract tenantId from args
    const tenantId = (args as any).tenantId;
    if (!tenantId) {
      throw new Error('tenantId is required in tool arguments');
    }

    try {
      const result = await handler(args, tenantId);

      return {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error: any) {
      console.error(`Error executing ${name}:`, error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message || error}`
          }
        ],
        isError: true
      };
    }
  });

  console.log(`Drive MCP Server initialized with ${registry.getToolCount()} tools`);
  console.log(`Tools: ${registry.getAllToolNames().join(', ')}`);
  console.log('Scopes:', DRIVE_SCOPES);

  return server;
}

/**
 * Create HTTP server for OAuth callbacks
 */
function createOAuthServer(): express.Application {
  const app = express();

  app.use(express.json());

  /**
   * Health check endpoint
   */
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'drive-unified-mcp' });
  });

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

      console.log('Generated OAuth URL', { tenantId });

      res.json({
        authUrl,
        message: 'Please visit the URL to authorize Drive access'
      });
    } catch (error: any) {
      console.error('Failed to generate auth URL', {
        tenantId,
        error: error.message
      });
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * OAuth callback endpoint
   */
  app.get(OAUTH_CALLBACK_PATH, async (req, res) => {
    const { code, state: tenantId, error } = req.query;

    if (error) {
      console.error('OAuth authorization failed', { error });
      return res.status(400).send(`
        <html>
          <body>
            <h1>Drive MCP OAuth</h1>
            <p>Authorization failed: ${error}</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);
    }

    if (!code || !tenantId || typeof code !== 'string' || typeof tenantId !== 'string') {
      return res.status(400).send(`
        <html>
          <body>
            <h1>Drive MCP OAuth</h1>
            <p>Invalid callback parameters</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);
    }

    try {
      await oauthManager.handleCallback(code, tenantId);

      console.log('OAuth callback successful', { tenantId });

      res.send(`
        <html>
          <body>
            <h1>Drive MCP OAuth</h1>
            <p>Authorization successful!</p>
            <p>You can close this window and return to your application.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('OAuth callback failed', {
        tenantId,
        error: error.message
      });
      res.status(500).send(`
        <html>
          <body>
            <h1>Drive MCP OAuth</h1>
            <p>Authorization failed: ${error.message}</p>
            <p>Please try again.</p>
          </body>
        </html>
      `);
    }
  });

  return app;
}

/**
 * Main entry point
 */
async function main() {
  try {
    console.log('🚀 Google Drive MCP Server Starting...');

    // Initialize and start stdio MCP server
    const mcpServer = await initializeDriveServer();
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.log('✅ Drive MCP Server connected via stdio');

    // Start HTTP OAuth server
    const oauthApp = createOAuthServer();
    oauthApp.listen(PORT, () => {
      console.log(`🌐 Drive OAuth HTTP server listening on port ${PORT}`);
      console.log('OAuth flow:', {
        authorize: `http://localhost:${PORT}/oauth/authorize?tenantId=<TENANT_ID>`,
        callback: `http://localhost:${PORT}${OAUTH_CALLBACK_PATH}`
      });
    });

  } catch (error: any) {
    console.error('❌ Server failed to start:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
