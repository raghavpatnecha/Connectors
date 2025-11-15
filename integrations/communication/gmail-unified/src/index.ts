#!/usr/bin/env node

/**
 * Gmail MCP Server
 * Unified MCP server for Gmail API with OAuth 2.0 authentication
 *
 * Features:
 * - 48 tools for comprehensive Gmail management
 * - Multi-tenant OAuth via shared Google auth
 * - Dual server: stdio (MCP) + HTTP (OAuth callbacks)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { ToolRegistry } from './utils/tool-registry-helper.js';
import { logger } from './utils/logger.js';
import { OAuthManager, OAuthConfig } from '../../shared/google-auth/oauth-manager';
import { VaultClient } from '../../shared/google-auth/vault-client';
import { GoogleClientFactory } from '../../shared/google-auth/google-client-factory';
import { GOOGLE_SCOPES } from '../../shared/google-auth/oauth-config';
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

// Gmail API scopes
const GMAIL_SCOPES = [
  GOOGLE_SCOPES.GMAIL_MODIFY,
  GOOGLE_SCOPES.GMAIL_COMPOSE,
  GOOGLE_SCOPES.GMAIL_SEND,
  GOOGLE_SCOPES.GMAIL_LABELS,
  GOOGLE_SCOPES.GMAIL_SETTINGS_BASIC
];

/**
 * Initialize Gmail MCP Server with OAuth
 */
async function initializeGmailServer(oauthManager: OAuthManager): Promise<Server> {
  logger.info('Initializing Gmail MCP Server');

  const clientFactory = new GoogleClientFactory(oauthManager);

  // Adapter function to get access token for tenant
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
  logger.info('Registering Gmail tools...');
  registerUserTools(registry, getAccessTokenForTenant);
  registerMessageTools(registry, getAccessTokenForTenant);
  registerLabelTools(registry, getAccessTokenForTenant);
  registerThreadTools(registry, getAccessTokenForTenant);
  registerDraftTools(registry, getAccessTokenForTenant);
  registerSettingsTools(registry, getAccessTokenForTenant);

  const toolCount = registry.getToolCount();
  logger.info(`Gmail MCP Server initialized`, {
    totalTools: toolCount,
    scopes: GMAIL_SCOPES
  });

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
    res.json({ status: 'healthy', service: 'gmail-unified-mcp' });
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
        message: 'Please visit the URL to authorize Gmail access'
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
   */
  app.get(OAUTH_CALLBACK_PATH, async (req, res) => {
    const { code, state: tenantId, error } = req.query;

    if (error) {
      logger.error('OAuth authorization failed', { error });
      return res.status(400).send(`
        <html>
          <body>
            <h1>Gmail MCP OAuth</h1>
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
            <h1>Gmail MCP OAuth</h1>
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
            <h1>Gmail MCP OAuth</h1>
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
            <h1>Gmail MCP OAuth</h1>
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
    logger.info('Starting Gmail Unified MCP Server');

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
      redirectUri: process.env.GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/oauth/callback`,
      scopes: GMAIL_SCOPES
    };

    const oauthManager = new OAuthManager(oauthConfig, vaultClient);

    // Initialize and start stdio MCP server
    const mcpServer = await initializeGmailServer(oauthManager);
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    logger.info('Gmail MCP Server connected via stdio');

    // Start HTTP OAuth server
    const oauthApp = createOAuthServer(oauthManager);
    oauthApp.listen(PORT, () => {
      logger.info(`Gmail OAuth HTTP server listening on port ${PORT}`);
      logger.info('OAuth flow:', {
        authorize: `http://localhost:${PORT}/oauth/authorize?tenantId=<TENANT_ID>`,
        callback: `http://localhost:${PORT}${OAUTH_CALLBACK_PATH}`
      });
    });

  } catch (error: any) {
    logger.error('Failed to start Gmail Unified MCP Server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

main();
