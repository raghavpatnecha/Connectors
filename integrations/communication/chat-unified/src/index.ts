#!/usr/bin/env node

/**
 * Google Chat MCP Server
 * Unified MCP server for Google Chat API with OAuth 2.0 authentication
 *
 * Features:
 * - 23 tools for comprehensive Chat space and message management
 * - Multi-tenant OAuth via shared Google auth
 * - Dual server: stdio (MCP) + HTTP (OAuth callbacks)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { ToolRegistry } from './utils/tool-registry-helper.js';
import { logger } from './utils/logger.js';
import { OAuthManager } from '../../shared/google-auth/oauth-manager';
import { GoogleClientFactory } from '../../shared/google-auth/google-client-factory';
import { GOOGLE_SCOPES } from '../../shared/google-auth/oauth-config';
import {
  registerSpaceTools,
  registerMessageTools,
  registerMemberTools,
  registerAttachmentTools,
  registerReactionTools,
  registerAdvancedTools
} from './tools/index.js';

// Environment configuration
const PORT = parseInt(process.env.PORT || '3138', 10);
const OAUTH_CALLBACK_PATH = process.env.OAUTH_CALLBACK_PATH || '/oauth/callback';

// Google Chat API scopes
const CHAT_SCOPES = [
  GOOGLE_SCOPES.CHAT_MESSAGES,
  GOOGLE_SCOPES.CHAT_MESSAGES_CREATE,
  GOOGLE_SCOPES.CHAT_SPACES,
  GOOGLE_SCOPES.CHAT_SPACES_READONLY
];

/**
 * Initialize Chat MCP Server with OAuth
 */
async function initializeChatServer(): Promise<Server> {
  logger.info('Initializing Google Chat MCP Server');

  // Initialize OAuth manager
  const oauthManager = new OAuthManager(CHAT_SCOPES);
  const clientFactory = new GoogleClientFactory(oauthManager);

  // Adapter function to get access token for tenant
  // Wraps the OAuth manager to match the existing tool signature
  async function getAccessTokenForTenant(tenantId: string): Promise<string> {
    try {
      const auth = await oauthManager.getAuthenticatedClient(tenantId);
      const credentials = await auth.getAccessToken();
      if (!credentials.token) {
        throw new Error(`No access token available for tenant: ${tenantId}`);
      }
      return credentials.token;
    } catch (error: any) {
      logger.error('Failed to get access token', { tenantId, error: error.message });
      throw new Error(`Authentication failed for tenant ${tenantId}: ${error.message}`);
    }
  }

  // Create MCP server
  const server = new Server(
    {
      name: 'chat-unified',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const registry = new ToolRegistry(server);

  // Register all tool categories
  logger.info('Registering Chat tools...');
  registerSpaceTools(registry, getAccessTokenForTenant);
  registerMessageTools(registry, getAccessTokenForTenant);
  registerMemberTools(registry, getAccessTokenForTenant);
  registerAttachmentTools(registry, getAccessTokenForTenant);
  registerReactionTools(registry, getAccessTokenForTenant);
  registerAdvancedTools(registry, getAccessTokenForTenant);

  const toolCount = registry.getToolCount();
  logger.info(`Chat MCP Server initialized`, {
    totalTools: toolCount,
    scopes: CHAT_SCOPES
  });

  // List tools handler
  server.setRequestHandler({ method: 'tools/list' } as any, async () => {
    return {
      tools: [
        // Spaces (6)
        { name: 'list_spaces', description: 'List all Google Chat spaces accessible to the user', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_space', description: 'Get details of a specific Google Chat space', inputSchema: { type: 'object', properties: {} } },
        { name: 'create_space', description: 'Create a new Google Chat space (room)', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_space', description: 'Update an existing Google Chat space', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_space', description: 'Delete a Google Chat space', inputSchema: { type: 'object', properties: {} } },
        { name: 'find_direct_message', description: 'Find or create a direct message space with a user', inputSchema: { type: 'object', properties: {} } },

        // Messages (5)
        { name: 'list_messages', description: 'List messages in a Google Chat space', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_message', description: 'Get a specific message from Google Chat', inputSchema: { type: 'object', properties: {} } },
        { name: 'create_message', description: 'Send a message to a Google Chat space', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_message', description: 'Update an existing message in Google Chat', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_message', description: 'Delete a message from Google Chat', inputSchema: { type: 'object', properties: {} } },

        // Members (4)
        { name: 'list_memberships', description: 'List all members in a Google Chat space', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_membership', description: 'Get details of a specific membership', inputSchema: { type: 'object', properties: {} } },
        { name: 'create_membership', description: 'Add a member to a Google Chat space', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_membership', description: 'Remove a member from a Google Chat space', inputSchema: { type: 'object', properties: {} } },

        // Attachments (2)
        { name: 'get_attachment', description: 'Get details of an attachment in a message', inputSchema: { type: 'object', properties: {} } },
        { name: 'upload_attachment', description: 'Upload an attachment to a Google Chat space', inputSchema: { type: 'object', properties: {} } },

        // Reactions (3)
        { name: 'list_reactions', description: 'List all reactions on a message', inputSchema: { type: 'object', properties: {} } },
        { name: 'create_reaction', description: 'Add a reaction to a message', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_reaction', description: 'Remove a reaction from a message', inputSchema: { type: 'object', properties: {} } },

        // Advanced (3)
        { name: 'search_messages', description: 'Search for messages across Google Chat spaces', inputSchema: { type: 'object', properties: {} } },
        { name: 'set_space_topic', description: 'Set or update the topic of a space', inputSchema: { type: 'object', properties: {} } },
        { name: 'batch_add_members', description: 'Add multiple members to a space in batch', inputSchema: { type: 'object', properties: {} } }
      ]
    };
  });

  return server;
}

/**
 * Create HTTP server for OAuth callbacks
 */
function createOAuthServer(oauthManager: OAuthManager): express.Application {
  const app = express();

  app.use(express.json());

  /**
   * Health check endpoint
   */
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'chat-unified-mcp' });
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

      logger.info('Generated OAuth URL', { tenantId });

      res.json({
        authUrl,
        message: 'Please visit the URL to authorize Google Chat access'
      });
    } catch (error: any) {
      logger.error('Failed to generate auth URL', {
        tenantId,
        error: error.message
      });
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * OAuth callback endpoint
   * Handles the OAuth callback after user authorization
   */
  app.get(OAUTH_CALLBACK_PATH, async (req, res) => {
    const { code, state: tenantId, error } = req.query;

    if (error) {
      logger.error('OAuth authorization failed', { error });
      return res.status(400).send(`
        <html>
          <body>
            <h1>Google Chat MCP OAuth</h1>
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
            <h1>Google Chat MCP OAuth</h1>
            <p>Invalid callback parameters</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);
    }

    try {
      await oauthManager.handleCallback(code, tenantId);

      logger.info('OAuth callback successful', { tenantId });

      res.send(`
        <html>
          <body>
            <h1>Google Chat MCP OAuth</h1>
            <p>Authorization successful!</p>
            <p>You can close this window and return to your application.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      logger.error('OAuth callback failed', {
        tenantId,
        error: error.message
      });
      res.status(500).send(`
        <html>
          <body>
            <h1>Google Chat MCP OAuth</h1>
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
    logger.info('Starting Google Chat Unified MCP Server');

    // Initialize OAuth manager
    const oauthManager = new OAuthManager(CHAT_SCOPES);

    // Initialize and start stdio MCP server
    const mcpServer = await initializeChatServer();
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    logger.info('Chat MCP Server connected via stdio');

    // Start HTTP OAuth server
    const oauthApp = createOAuthServer(oauthManager);
    oauthApp.listen(PORT, () => {
      logger.info(`Chat OAuth HTTP server listening on port ${PORT}`);
      logger.info('OAuth flow:', {
        authorize: `http://localhost:${PORT}/oauth/authorize?tenantId=<TENANT_ID>`,
        callback: `http://localhost:${PORT}${OAUTH_CALLBACK_PATH}`
      });
    });

  } catch (error: any) {
    logger.error('Failed to start Google Chat Unified MCP Server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

main();
