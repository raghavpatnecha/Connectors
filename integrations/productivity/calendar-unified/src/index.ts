#!/usr/bin/env node

/**
 * Google Calendar MCP Server
 * Unified MCP server for Google Calendar API with OAuth 2.0 authentication
 *
 * Features:
 * - 29 tools for comprehensive Calendar management
 * - Multi-tenant OAuth via shared Google auth
 * - Dual server: stdio (MCP) + HTTP (OAuth callbacks)
 *
 * Categories:
 * - Events (12 tools): list, get, create, update, patch, delete, import, move, quickAdd, instances, watch, stopChannel
 * - Calendars (8 tools): list, get, insert, update, patch, delete, clear, freebusyQuery
 * - CalendarList (3 tools): list, insert, delete
 * - ACL (6 tools): list, get, insert, update, patch, delete
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { calendarClientFactory } from './clients/calendar-client.js';
import { OAuthManager, OAuthConfig } from '../../shared/google-auth/oauth-manager';
import { VaultClient } from '../../shared/google-auth/vault-client';
import { GoogleClientFactory } from '../../shared/google-auth/google-client-factory';
import { GOOGLE_SCOPES } from '../../shared/google-auth/oauth-config';

// Import all tool schemas and handlers
import {
  // Events
  listEventsSchema, listEvents,
  getEventSchema, getEvent,
  createEventSchema, createEvent,
  updateEventSchema, updateEvent,
  patchEventSchema, patchEvent,
  deleteEventSchema, deleteEvent,
  importEventSchema, importEvent,
  moveEventSchema, moveEvent,
  quickAddEventSchema, quickAddEvent,
  getInstancesSchema, getInstances,
  watchEventsSchema, watchEvents,
  stopChannelSchema, stopChannel,
  // Calendars
  listCalendarsSchema, listCalendars,
  getCalendarSchema, getCalendar,
  insertCalendarSchema, insertCalendar,
  updateCalendarSchema, updateCalendar,
  patchCalendarSchema, patchCalendar,
  deleteCalendarSchema, deleteCalendar,
  clearCalendarSchema, clearCalendar,
  freebusyQuerySchema, freebusyQuery,
  // CalendarList
  listCalendarListSchema, listCalendarList,
  insertCalendarListSchema, insertCalendarList,
  deleteCalendarListSchema, deleteCalendarList,
  // ACL
  listAclSchema, listAcl,
  getAclSchema, getAcl,
  insertAclSchema, insertAcl,
  updateAclSchema, updateAcl,
  patchAclSchema, patchAcl,
  deleteAclSchema, deleteAcl,
} from './tools/index.js';

// Configuration
const PORT = parseInt(process.env.PORT || '3131', 10);
const OAUTH_CALLBACK_PATH = process.env.OAUTH_CALLBACK_PATH || '/oauth/callback';

// Google Calendar API scopes
const CALENDAR_SCOPES = [
  GOOGLE_SCOPES.CALENDAR,
  GOOGLE_SCOPES.CALENDAR_EVENTS
];

// OAuth manager (global instance)
let oauthManager: OAuthManager;

/**
 * Initialize Calendar MCP Server with OAuth
 */
async function initializeCalendarServer(oauthMgr: OAuthManager): Promise<Server> {
  console.error('Initializing Google Calendar MCP Server');

  // Store OAuth manager globally for HTTP endpoints
  oauthManager = oauthMgr;
  const clientFactory = new GoogleClientFactory(oauthManager);

  const server = new Server(
    {
      name: 'calendar-unified',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Tool definitions (29 tools)
  const TOOLS = [
    // Events (12)
    { name: 'calendar_list_events', description: 'List events from a calendar with filtering options', schema: listEventsSchema, handler: listEvents },
    { name: 'calendar_get_event', description: 'Get detailed information about a specific event', schema: getEventSchema, handler: getEvent },
    { name: 'calendar_create_event', description: 'Create a new calendar event with attendees, reminders, and attachments', schema: createEventSchema, handler: createEvent },
    { name: 'calendar_update_event', description: 'Update all fields of an existing event', schema: updateEventSchema, handler: updateEvent },
    { name: 'calendar_patch_event', description: 'Partially update specific fields of an event', schema: patchEventSchema, handler: patchEvent },
    { name: 'calendar_delete_event', description: 'Delete an event from a calendar', schema: deleteEventSchema, handler: deleteEvent },
    { name: 'calendar_import_event', description: 'Import an event from external calendar data', schema: importEventSchema, handler: importEvent },
    { name: 'calendar_move_event', description: 'Move an event to a different calendar', schema: moveEventSchema, handler: moveEvent },
    { name: 'calendar_quick_add_event', description: 'Create event from natural language (e.g., "Lunch tomorrow at 12pm")', schema: quickAddEventSchema, handler: quickAddEvent },
    { name: 'calendar_get_instances', description: 'Get instances of a recurring event', schema: getInstancesSchema, handler: getInstances },
    { name: 'calendar_watch_events', description: 'Set up push notifications for event changes', schema: watchEventsSchema, handler: watchEvents },
    { name: 'calendar_stop_channel', description: 'Stop receiving push notifications for a channel', schema: stopChannelSchema, handler: stopChannel },

    // Calendars (8)
    { name: 'calendar_list_calendars', description: 'List all calendars accessible to the user', schema: listCalendarsSchema, handler: listCalendars },
    { name: 'calendar_get_calendar', description: 'Get metadata for a specific calendar', schema: getCalendarSchema, handler: getCalendar },
    { name: 'calendar_insert_calendar', description: 'Create a new calendar', schema: insertCalendarSchema, handler: insertCalendar },
    { name: 'calendar_update_calendar', description: 'Update calendar metadata (full update)', schema: updateCalendarSchema, handler: updateCalendar },
    { name: 'calendar_patch_calendar', description: 'Partially update calendar metadata', schema: patchCalendarSchema, handler: patchCalendar },
    { name: 'calendar_delete_calendar', description: 'Delete a calendar', schema: deleteCalendarSchema, handler: deleteCalendar },
    { name: 'calendar_clear_calendar', description: 'Delete all events from a calendar', schema: clearCalendarSchema, handler: clearCalendar },
    { name: 'calendar_freebusy_query', description: 'Query free/busy information for calendars', schema: freebusyQuerySchema, handler: freebusyQuery },

    // CalendarList (3)
    { name: 'calendar_list_calendar_list', description: 'List user\'s calendar subscriptions', schema: listCalendarListSchema, handler: listCalendarList },
    { name: 'calendar_insert_calendar_list', description: 'Subscribe to a calendar', schema: insertCalendarListSchema, handler: insertCalendarList },
    { name: 'calendar_delete_calendar_list', description: 'Unsubscribe from a calendar', schema: deleteCalendarListSchema, handler: deleteCalendarList },

    // ACL (6)
    { name: 'calendar_list_acl', description: 'List access control rules for a calendar', schema: listAclSchema, handler: listAcl },
    { name: 'calendar_get_acl', description: 'Get a specific ACL rule', schema: getAclSchema, handler: getAcl },
    { name: 'calendar_insert_acl', description: 'Create a new ACL rule (share calendar)', schema: insertAclSchema, handler: insertAcl },
    { name: 'calendar_update_acl', description: 'Update an ACL rule (full update)', schema: updateAclSchema, handler: updateAcl },
    { name: 'calendar_patch_acl', description: 'Partially update an ACL rule', schema: patchAclSchema, handler: patchAcl },
    { name: 'calendar_delete_acl', description: 'Delete an ACL rule (unshare calendar)', schema: deleteAclSchema, handler: deleteAcl },
  ];

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.schema.shape,
      })),
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const tool = TOOLS.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      // Validate arguments
      const validatedArgs = tool.schema.parse(args);

      // Extract tenant ID and get access token from OAuth manager
      const tenantId = validatedArgs.tenantId || 'default';

      // Get access token from OAuth manager
      let accessToken = '';
      try {
        const auth = await oauthManager.getAuthenticatedClient(tenantId);
        const credentials = await auth.getAccessToken();
        if (!credentials.token) {
          throw new Error(`No access token available for tenant: ${tenantId}`);
        }
        accessToken = credentials.token;
      } catch (error: any) {
        console.error('Failed to get access token', { tenantId, error: error.message });
        throw new Error(`Authentication failed for tenant ${tenantId}: ${error.message}`);
      }

      // Create Calendar client
      const calendar = await calendarClientFactory.getCalendarClient(tenantId, accessToken);

      // Execute tool
      const result = await tool.handler(calendar, validatedArgs);

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  console.error('Calendar MCP Server initialized', {
    totalTools: TOOLS.length,
    scopes: CALENDAR_SCOPES
  });

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
    res.json({ status: 'healthy', service: 'calendar-unified-mcp' });
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

      console.error('Generated OAuth URL', { tenantId });

      res.json({
        authUrl,
        message: 'Please visit the URL to authorize Calendar access'
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
            <h1>Calendar MCP OAuth</h1>
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
            <h1>Calendar MCP OAuth</h1>
            <p>Invalid callback parameters</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);
    }

    try {
      await oauthManager.handleCallback(code, tenantId);

      console.error('OAuth callback successful', { tenantId });

      res.send(`
        <html>
          <body>
            <h1>Calendar MCP OAuth</h1>
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
            <h1>Calendar MCP OAuth</h1>
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
    console.error('Starting Google Calendar Unified MCP Server');

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
      scopes: CALENDAR_SCOPES
    };

    const oauthMgr = new OAuthManager(oauthConfig, vaultClient);

    // Initialize and start stdio MCP server
    const mcpServer = await initializeCalendarServer(oauthMgr);
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error('Calendar MCP Server connected via stdio');
    console.error('29 tools available: Events(12), Calendars(8), CalendarList(3), ACL(6)');

    // Start HTTP OAuth server
    const oauthApp = createOAuthServer();
    oauthApp.listen(PORT, () => {
      console.error(`Calendar OAuth HTTP server listening on port ${PORT}`);
      console.error('OAuth flow:', {
        authorize: `http://localhost:${PORT}/oauth/authorize?tenantId=<TENANT_ID>`,
        callback: `http://localhost:${PORT}${OAUTH_CALLBACK_PATH}`
      });
    });

  } catch (error: any) {
    console.error('Failed to start Google Calendar Unified MCP Server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
