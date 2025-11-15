#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { ToolRegistry } from './utils/tool-registry-helper.js';
import { logger } from './utils/logger.js';
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

// Mock OAuth token retrieval (to be replaced with actual Vault integration)
// This will be integrated with ../../shared/google-auth/vault-client.ts
async function getAccessTokenForTenant(tenantId: string): Promise<string> {
  // TODO: Integrate with VaultClient from shared/google-auth
  // For now, this is a placeholder that should be replaced with:
  // const vaultClient = new VaultClient();
  // const credentials = await vaultClient.getCredentials(tenantId, 'chat');
  // return credentials.accessToken;

  const token = process.env[`CHAT_ACCESS_TOKEN_${tenantId}`];
  if (!token) {
    throw new Error(`No access token found for tenant: ${tenantId}`);
  }
  return token;
}

// Create MCP server
function createMCPServer(): Server {
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
  registerSpaceTools(registry, getAccessTokenForTenant);
  registerMessageTools(registry, getAccessTokenForTenant);
  registerMemberTools(registry, getAccessTokenForTenant);
  registerAttachmentTools(registry, getAccessTokenForTenant);
  registerReactionTools(registry, getAccessTokenForTenant);
  registerAdvancedTools(registry, getAccessTokenForTenant);

  const toolCount = registry.getToolCount();
  logger.info(`Google Chat Unified MCP Server initialized with ${toolCount} tools`);

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

// Create HTTP server for OAuth callbacks
function createOAuthServer(): express.Application {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'chat-unified-mcp' });
  });

  app.get(OAUTH_CALLBACK_PATH, (req, res) => {
    // OAuth callback handler
    // TODO: Integrate with GoogleOAuthManager from shared/google-auth
    const { code, state } = req.query;

    logger.info('OAuth callback received', { code: !!code, state });

    res.send(`
      <html>
        <body>
          <h1>Google Chat MCP OAuth</h1>
          <p>Authorization ${code ? 'successful' : 'failed'}!</p>
          <p>You can close this window.</p>
        </body>
      </html>
    `);
  });

  app.post('/oauth/token', async (req, res) => {
    // Token exchange endpoint
    // TODO: Integrate with VaultClient
    try {
      const { tenantId, code } = req.body;

      if (!tenantId || !code) {
        return res.status(400).json({ error: 'Missing tenantId or code' });
      }

      // Placeholder: Exchange code for token and store in Vault
      logger.info('Token exchange requested', { tenantId });

      res.json({ success: true, message: 'Token stored successfully' });
    } catch (error: any) {
      logger.error('Token exchange failed', { error: error.message });
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}

// Main entry point
async function main() {
  try {
    // Start stdio MCP server
    const mcpServer = createMCPServer();
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    logger.info('Google Chat Unified MCP Server started (stdio mode)');

    // Start HTTP OAuth server
    const oauthApp = createOAuthServer();
    oauthApp.listen(PORT, () => {
      logger.info(`OAuth HTTP server listening on port ${PORT}`);
    });

  } catch (error: any) {
    logger.error('Failed to start Google Chat Unified MCP Server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

main();
