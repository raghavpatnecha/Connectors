#!/usr/bin/env node

/**
 * Google Drive MCP Server - Unified Implementation
 *
 * Provides 41 comprehensive Drive tools:
 * - Files (18): search, get, create, list, update, copy, delete, export, etc.
 * - Folders (4): create, move, add_parent, remove_parent
 * - Permissions (5): list, get, create, update, delete
 * - Comments (9): list, get, create, update, delete + replies
 * - Shared Drives (5): list, get, create, update, delete
 *
 * Port: 3132
 * Multi-tenant: Yes (via tenantId parameter)
 * OAuth: Google OAuth2 with Drive scopes
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ToolRegistry } from './utils/tool-registry-helper.js';
import { GoogleClientFactory } from './clients/drive-client.js';
import { registerAllDriveTools } from './tools/index.js';

// Configuration from environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/callback';
const SERVER_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3132;

// Initialize
const registry = new ToolRegistry();
const clientFactory = new GoogleClientFactory(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

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

// Start server
async function main() {
  console.log('🚀 Google Drive MCP Server Starting...');
  console.log(`📊 Registered ${registry.getToolCount()} tools`);
  console.log(`🔧 Tools: ${registry.getAllToolNames().join(', ')}`);
  console.log(`🌐 Port: ${SERVER_PORT}`);
  console.log('📡 Transport: stdio');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('✅ Drive MCP Server Ready!');
}

main().catch((error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});
