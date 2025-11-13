/**
 * Tool registry helper for MCP server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './logger.js';
import { formatErrorResponse } from './error-handler.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolHandler {
  (args: any, tenantId: string): Promise<any>;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private handlers: Map<string, ToolHandler> = new Map();

  /**
   * Register a tool with its definition and handler
   */
  registerTool(definition: ToolDefinition, handler: ToolHandler): void {
    this.tools.set(definition.name, definition);
    this.handlers.set(definition.name, handler);
    logger.debug('Registered tool', { tool: definition.name });
  }

  /**
   * Get all registered tool definitions
   */
  getToolDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Get registered tool names
   */
  getRegisteredTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Setup MCP server with registered tools
   */
  setupServer(server: Server): void {
    // Handle list tools request
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.getToolDefinitions();
      logger.debug('Listing tools', { count: tools.length });
      return { tools };
    });

    // Handle call tool request
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.info('Tool invocation', {
        tool: name,
        args: Object.keys(args || {}),
      });

      // Check if tool exists
      if (!this.handlers.has(name)) {
        const error = new Error(`Unknown tool: ${name}`);
        logger.error('Tool not found', { tool: name });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatErrorResponse(error), null, 2),
            },
          ],
          isError: true,
        };
      }

      try {
        // Extract tenant ID from args or use default
        const tenantId = args?.tenantId || args?.tenant_id || 'default';

        // Execute tool handler
        const handler = this.handlers.get(name)!;
        const result = await handler(args || {}, tenantId);

        logger.info('Tool execution successful', {
          tool: name,
          tenantId,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        logger.error('Tool execution failed', {
          tool: name,
          error: error.message,
          stack: error.stack,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatErrorResponse(error), null, 2),
            },
          ],
          isError: true,
        };
      }
    });

    logger.info('ToolRegistry connected to MCP server', {
      toolCount: this.getToolCount(),
    });
  }
}
