/**
 * Tool Registry Helper
 *
 * Bridges the gap between a simple tool registration API and MCP SDK 0.5.0's
 * actual setRequestHandler pattern.
 *
 * The MCP SDK 0.5.0 doesn't have a `server.tool()` method. Instead, it requires
 * registering request handlers for "tools/list" and "tools/call" using
 * setRequestHandler with proper Zod schemas.
 *
 * This helper provides a clean API that:
 * - Matches the pattern agents used in tool files
 * - Works with MCP SDK 0.5.0's actual API
 * - Handles both tools/list and tools/call requests
 * - Provides comprehensive logging and error handling
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  ListToolsRequest
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './logger.js';
import { z, ZodSchema } from 'zod';

/**
 * Tool definition stored in registry
 */
interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

/**
 * Tool handler function type
 */
type ToolHandler = (params: any, context: any) => Promise<any>;

/**
 * Tool Registry Helper
 *
 * Provides a simple API for registering MCP tools that matches the pattern
 * agents used, but works with MCP SDK 0.5.0's actual API.
 *
 * Usage:
 * ```typescript
 * const registry = new ToolRegistry();
 *
 * // Register tools using simple API
 * registry.registerTool(
 *   'search-people',
 *   'Search for LinkedIn profiles',
 *   z.object({
 *     keywords: z.string(),
 *     limit: z.number().default(20)
 *   }),
 *   async (params, context) => {
 *     // Tool implementation
 *     return { results: [...] };
 *   }
 * );
 *
 * // Setup server with proper MCP handlers
 * registry.setupServer(server);
 * ```
 */
export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private handlers: Map<string, ToolHandler> = new Map();

  /**
   * Register a tool with the registry
   *
   * This method accepts the same parameters as the non-existent `server.tool()`
   * method that agents tried to use.
   *
   * @param name - Tool name (kebab-case recommended)
   * @param description - Human-readable tool description
   * @param schema - Zod schema object OR plain object with Zod properties
   * @param handler - Async function to handle tool execution
   */
  registerTool(
    name: string,
    description: string,
    schema: ZodSchema<any> | Record<string, ZodSchema<any>>,
    handler: ToolHandler
  ): void {
    try {
      // Convert schema to MCP inputSchema format
      let inputSchema: ToolDefinition['inputSchema'];

      if ('_def' in schema && (schema._def as any).typeName === 'ZodObject') {
        // It's already a Zod object schema
        const zodObject = schema as z.ZodObject<any>;
        const shape = zodObject._def.shape();
        const properties: Record<string, any> = {};
        const required: string[] = [];

        // Convert Zod schema to JSON Schema format
        for (const [key, value] of Object.entries(shape)) {
          properties[key] = this._zodToJsonSchema(value as ZodSchema);

          // Check if field is required (not optional)
          if (!(value as any).isOptional()) {
            required.push(key);
          }
        }

        inputSchema = {
          type: 'object',
          properties,
          required: required.length > 0 ? required : undefined,
          additionalProperties: false
        };
      } else {
        // It's a plain object with Zod properties (legacy format from tool files)
        const properties: Record<string, any> = {};
        const required: string[] = [];

        for (const [key, value] of Object.entries(schema as Record<string, ZodSchema>)) {
          properties[key] = this._zodToJsonSchema(value);

          // Check if field is required
          if (!value.isOptional()) {
            required.push(key);
          }
        }

        inputSchema = {
          type: 'object',
          properties,
          required: required.length > 0 ? required : undefined,
          additionalProperties: false
        };
      }

      // Store tool definition
      this.tools.set(name, {
        name,
        description,
        inputSchema
      });

      // Store handler
      this.handlers.set(name, handler);

      logger.info('Tool registered', {
        name,
        description: description.substring(0, 60) + (description.length > 60 ? '...' : ''),
        paramCount: Object.keys(inputSchema.properties).length
      });
    } catch (error) {
      logger.error('Failed to register tool', {
        name,
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Convert Zod schema to JSON Schema format
   * (Simplified conversion for common types)
   */
  private _zodToJsonSchema(zodSchema: ZodSchema): any {
    const typeName = (zodSchema as any)._def?.typeName;

    if (!typeName) {
      return { type: 'string' };
    }

    switch (typeName) {
      case 'ZodString':
        return { type: 'string' };
      case 'ZodNumber':
        return { type: 'number' };
      case 'ZodBoolean':
        return { type: 'boolean' };
      case 'ZodArray':
        const arraySchema = (zodSchema as any)._def.type;
        return {
          type: 'array',
          items: this._zodToJsonSchema(arraySchema)
        };
      case 'ZodObject':
        const shape = (zodSchema as any)._def.shape();
        const properties: Record<string, any> = {};
        for (const [key, value] of Object.entries(shape)) {
          properties[key] = this._zodToJsonSchema(value as ZodSchema);
        }
        return {
          type: 'object',
          properties
        };
      case 'ZodEnum':
        return {
          type: 'string',
          enum: (zodSchema as any)._def.values
        };
      case 'ZodOptional':
        return this._zodToJsonSchema((zodSchema as any)._def.innerType);
      case 'ZodDefault':
        const defaultValue = (zodSchema as any)._def.defaultValue();
        const innerSchema = this._zodToJsonSchema((zodSchema as any)._def.innerType);
        return {
          ...innerSchema,
          default: defaultValue
        };
      default:
        return { type: 'string' };
    }
  }

  /**
   * Setup the MCP server with proper request handlers
   *
   * This registers handlers for:
   * - tools/list: Returns list of registered tools
   * - tools/call: Executes a tool by name
   *
   * @param server - MCP Server instance
   */
  setupServer(server: Server): void {
    logger.info('Setting up ToolRegistry with MCP server', {
      toolCount: this.tools.size,
      tools: Array.from(this.tools.keys())
    });

    // Handler for tools/list request
    server.setRequestHandler(
      ListToolsRequestSchema,
      async (request: ListToolsRequest) => {
        logger.debug('tools/list request received', {
          params: request.params
        });

        const tools = Array.from(this.tools.values());

        logger.info('Returning tool list', {
          count: tools.length,
          tools: tools.map(t => t.name)
        });

        return {
          tools
        };
      }
    );

    // Handler for tools/call request
    server.setRequestHandler(
      CallToolRequestSchema,
      async (request: CallToolRequest) => {
        const { name, arguments: args } = request.params;

        logger.info('tools/call request received', {
          name,
          args: this._sanitizeForLogging(args)
        });

        // Check if tool exists
        const handler = this.handlers.get(name);
        if (!handler) {
          const availableTools = Array.from(this.tools.keys());
          logger.error('Unknown tool requested', {
            requestedTool: name,
            availableTools
          });

          const toolList = availableTools.join(', ');
          throw new Error(
            `Unknown tool: ${name}. Available tools: ${toolList}`
          );
        }

        // Execute tool handler
        try {
          const startTime = Date.now();

          // Extract context from args (tenantId is commonly passed)
          const context = {
            tenantId: args?.tenantId || 'default'
          };

          const result = await handler(args, context);

          const duration = Date.now() - startTime;

          logger.info('Tool executed successfully', {
            name,
            duration: `${duration}ms`,
            resultType: typeof result
          });

          // Format result according to MCP spec
          // Tools should return content array with text/image/resource
          if (result.content) {
            return result;
          }

          // If handler returned plain data, wrap it
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          const errorMessage = (error as Error).message;
          const errorStack = (error as Error).stack;

          logger.error('Tool execution failed', {
            name,
            error: errorMessage,
            stack: errorStack
          });

          // Return error as content (MCP pattern)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: errorMessage,
                  tool: name,
                  timestamp: new Date().toISOString()
                }, null, 2)
              }
            ],
            isError: true
          };
        }
      }
    );

    logger.info('ToolRegistry setup complete', {
      registeredTools: Array.from(this.tools.keys()),
      handlersRegistered: ['tools/list', 'tools/call']
    });
  }

  /**
   * Sanitize parameters for logging (remove sensitive data)
   */
  private _sanitizeForLogging(args: any): any {
    if (!args || typeof args !== 'object') {
      return args;
    }

    const sanitized = { ...args };
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Get list of registered tool names (for debugging)
   */
  getRegisteredTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get total number of registered tools
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Get tool definition by name (for debugging)
   */
  getToolDefinition(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Clear all registered tools (useful for testing)
   */
  clear(): void {
    logger.warn('Clearing all registered tools', {
      count: this.tools.size
    });

    this.tools.clear();
    this.handlers.clear();
  }
}

/**
 * Default singleton instance for convenience
 */
export const defaultToolRegistry = new ToolRegistry();
