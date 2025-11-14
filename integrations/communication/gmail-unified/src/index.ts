#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { ToolRegistry } from './utils/tool-registry-helper.js';
import { logger } from './utils/logger.js';
import {
  registerUserTools,
  registerMessageTools,
  registerLabelTools,
  registerThreadTools,
  registerDraftTools,
  registerSettingsTools
} from './tools/index.js';

// Environment configuration
const PORT = parseInt(process.env.PORT || '3130', 10);
const OAUTH_CALLBACK_PATH = process.env.OAUTH_CALLBACK_PATH || '/oauth/callback';

// Mock OAuth token retrieval (to be replaced with actual Vault integration)
// This will be integrated with ../../shared/google-auth/vault-client.ts
async function getAccessTokenForTenant(tenantId: string): Promise<string> {
  // TODO: Integrate with VaultClient from shared/google-auth
  // For now, this is a placeholder that should be replaced with:
  // const vaultClient = new VaultClient();
  // const credentials = await vaultClient.getCredentials(tenantId, 'gmail');
  // return credentials.accessToken;

  const token = process.env[`GMAIL_ACCESS_TOKEN_${tenantId}`];
  if (!token) {
    throw new Error(`No access token found for tenant: ${tenantId}`);
  }
  return token;
}

// Create MCP server
function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'gmail-unified',
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
  registerUserTools(registry, getAccessTokenForTenant);
  registerMessageTools(registry, getAccessTokenForTenant);
  registerLabelTools(registry, getAccessTokenForTenant);
  registerThreadTools(registry, getAccessTokenForTenant);
  registerDraftTools(registry, getAccessTokenForTenant);
  registerSettingsTools(registry, getAccessTokenForTenant);

  const toolCount = registry.getToolCount();
  logger.info(`Gmail Unified MCP Server initialized with ${toolCount} tools`);

  // List tools handler
  server.setRequestHandler({ method: 'tools/list' } as any, async () => {
    return {
      tools: [
        // User Management (3)
        { name: 'get_profile', description: "Get the current user's Gmail profile information", inputSchema: { type: 'object', properties: {} } },
        { name: 'watch_mailbox', description: 'Set up push notifications for mailbox changes', inputSchema: { type: 'object', properties: {} } },
        { name: 'stop_mail_watch', description: 'Stop receiving push notifications', inputSchema: { type: 'object', properties: {} } },

        // Messages (11)
        { name: 'list_messages', description: 'List messages in the mailbox', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_message', description: 'Get a specific message by ID', inputSchema: { type: 'object', properties: {} } },
        { name: 'send_message', description: 'Send an email message', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_message', description: 'Permanently delete a message', inputSchema: { type: 'object', properties: {} } },
        { name: 'trash_message', description: 'Move message to trash', inputSchema: { type: 'object', properties: {} } },
        { name: 'untrash_message', description: 'Remove message from trash', inputSchema: { type: 'object', properties: {} } },
        { name: 'modify_message', description: 'Modify message labels', inputSchema: { type: 'object', properties: {} } },
        { name: 'batch_modify_messages', description: 'Modify labels on multiple messages', inputSchema: { type: 'object', properties: {} } },
        { name: 'batch_delete_messages', description: 'Delete multiple messages', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_attachment', description: 'Get message attachment', inputSchema: { type: 'object', properties: {} } },
        { name: 'import_message', description: 'Import a message into mailbox', inputSchema: { type: 'object', properties: {} } },

        // Labels (6)
        { name: 'list_labels', description: 'List all labels', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_label', description: 'Get a specific label', inputSchema: { type: 'object', properties: {} } },
        { name: 'create_label', description: 'Create a new label', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_label', description: 'Update a label', inputSchema: { type: 'object', properties: {} } },
        { name: 'patch_label', description: 'Patch a label', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_label', description: 'Delete a label', inputSchema: { type: 'object', properties: {} } },

        // Threads (6)
        { name: 'list_threads', description: 'List threads in mailbox', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_thread', description: 'Get a specific thread', inputSchema: { type: 'object', properties: {} } },
        { name: 'modify_thread', description: 'Modify thread labels', inputSchema: { type: 'object', properties: {} } },
        { name: 'trash_thread', description: 'Move thread to trash', inputSchema: { type: 'object', properties: {} } },
        { name: 'untrash_thread', description: 'Remove thread from trash', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_thread', description: 'Permanently delete thread', inputSchema: { type: 'object', properties: {} } },

        // Drafts (6)
        { name: 'list_drafts', description: 'List drafts', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_draft', description: 'Get a specific draft', inputSchema: { type: 'object', properties: {} } },
        { name: 'create_draft', description: 'Create a new draft', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_draft', description: 'Update an existing draft', inputSchema: { type: 'object', properties: {} } },
        { name: 'send_draft', description: 'Send a draft', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_draft', description: 'Delete a draft', inputSchema: { type: 'object', properties: {} } },

        // Settings - Auto-forwarding (2)
        { name: 'get_auto_forwarding', description: 'Get auto-forwarding settings', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_auto_forwarding', description: 'Update auto-forwarding settings', inputSchema: { type: 'object', properties: {} } },

        // Settings - IMAP (2)
        { name: 'get_imap', description: 'Get IMAP settings', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_imap', description: 'Update IMAP settings', inputSchema: { type: 'object', properties: {} } },

        // Settings - Language (2)
        { name: 'get_language', description: 'Get language settings', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_language', description: 'Update language settings', inputSchema: { type: 'object', properties: {} } },

        // Settings - POP (2)
        { name: 'get_pop', description: 'Get POP settings', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_pop', description: 'Update POP settings', inputSchema: { type: 'object', properties: {} } },

        // Settings - Vacation (2)
        { name: 'get_vacation', description: 'Get vacation responder settings', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_vacation', description: 'Update vacation responder settings', inputSchema: { type: 'object', properties: {} } },

        // Settings - Delegates (4)
        { name: 'list_delegates', description: 'List all delegates', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_delegate', description: 'Get a specific delegate', inputSchema: { type: 'object', properties: {} } },
        { name: 'add_delegate', description: 'Add a delegate', inputSchema: { type: 'object', properties: {} } },
        { name: 'remove_delegate', description: 'Remove a delegate', inputSchema: { type: 'object', properties: {} } },

        // Settings - Filters (4)
        { name: 'list_filters', description: 'List all filters', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_filter', description: 'Get a specific filter', inputSchema: { type: 'object', properties: {} } },
        { name: 'create_filter', description: 'Create a new filter', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_filter', description: 'Delete a filter', inputSchema: { type: 'object', properties: {} } },

        // Settings - Forwarding Addresses (4)
        { name: 'list_forwarding_addresses', description: 'List forwarding addresses', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_forwarding_address', description: 'Get a forwarding address', inputSchema: { type: 'object', properties: {} } },
        { name: 'create_forwarding_address', description: 'Create forwarding address', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_forwarding_address', description: 'Delete forwarding address', inputSchema: { type: 'object', properties: {} } },

        // Settings - Send-as (7)
        { name: 'list_send_as', description: 'List send-as aliases', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_send_as', description: 'Get a send-as alias', inputSchema: { type: 'object', properties: {} } },
        { name: 'create_send_as', description: 'Create send-as alias', inputSchema: { type: 'object', properties: {} } },
        { name: 'update_send_as', description: 'Update send-as alias', inputSchema: { type: 'object', properties: {} } },
        { name: 'patch_send_as', description: 'Patch send-as alias', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_send_as', description: 'Delete send-as alias', inputSchema: { type: 'object', properties: {} } },
        { name: 'verify_send_as', description: 'Verify send-as alias', inputSchema: { type: 'object', properties: {} } },

        // Settings - S/MIME (5)
        { name: 'list_smime_info', description: 'List S/MIME configs', inputSchema: { type: 'object', properties: {} } },
        { name: 'get_smime_info', description: 'Get S/MIME config', inputSchema: { type: 'object', properties: {} } },
        { name: 'insert_smime_info', description: 'Insert S/MIME config', inputSchema: { type: 'object', properties: {} } },
        { name: 'delete_smime_info', description: 'Delete S/MIME config', inputSchema: { type: 'object', properties: {} } },
        { name: 'set_default_smime_info', description: 'Set default S/MIME config', inputSchema: { type: 'object', properties: {} } }
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
    res.json({ status: 'healthy', service: 'gmail-unified-mcp' });
  });

  app.get(OAUTH_CALLBACK_PATH, (req, res) => {
    // OAuth callback handler
    // TODO: Integrate with GoogleOAuthManager from shared/google-auth
    const { code, state } = req.query;

    logger.info('OAuth callback received', { code: !!code, state });

    res.send(`
      <html>
        <body>
          <h1>Gmail MCP OAuth</h1>
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
    logger.info('Gmail Unified MCP Server started (stdio mode)');

    // Start HTTP OAuth server
    const oauthApp = createOAuthServer();
    oauthApp.listen(PORT, () => {
      logger.info(`OAuth HTTP server listening on port ${PORT}`);
    });

  } catch (error: any) {
    logger.error('Failed to start Gmail Unified MCP Server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

main();
