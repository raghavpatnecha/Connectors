/**
 * Tool Registry Helper
 * Helper class for registering MCP tools with Zod schemas
 */

import { z } from 'zod';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './logger';

export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodSchema;
  handler: (args: any) => Promise<any>;
}

/**
 * Registry for MCP tools with Zod validation
 */
export class ToolRegistry {
  private _tools: Map<string, ToolDefinition> = new Map();

  /**
   * Register a new tool
   */
  registerTool(
    name: string,
    description: string,
    schema: z.ZodSchema,
    handler: (args: any) => Promise<any>
  ): void {
    this._tools.set(name, { name, description, schema, handler });
    logger.debug('Registered tool', { name });
  }

  /**
   * Get all registered tools
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this._tools.values());
  }

  /**
   * Get a specific tool by name
   */
  getTool(name: string): ToolDefinition | undefined {
    return this._tools.get(name);
  }

  /**
   * Setup MCP server with all registered tools
   */
  setupServer(server: Server): void {
    // List tools handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAllTools().map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: this._zodToJsonSchema(tool.schema)
        }))
      };
    });

    // Call tool handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const tool = this.getTool(request.params.name);

      if (!tool) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      try {
        // Validate arguments with Zod
        const validatedArgs = tool.schema.parse(request.params.arguments);

        // Execute tool handler
        const result = await tool.handler(validatedArgs);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        logger.error('Tool execution failed', {
          tool: request.params.name,
          error: error.message
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: error.message,
                tool: request.params.name
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    });

    logger.info('MCP server configured', {
      toolCount: this._tools.size
    });
  }

  /**
   * Convert Zod schema to JSON Schema
   * Simplified conversion for MCP compatibility
   */
  private _zodToJsonSchema(schema: z.ZodSchema): any {
    // This is a simplified conversion
    // For production, consider using a library like zod-to-json-schema

    if (schema instanceof z.ZodObject) {
      const shape = schema._def.shape();
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const fieldSchema = value as z.ZodTypeAny;
        properties[key] = this._zodFieldToJson(fieldSchema);

        if (!this._isOptional(fieldSchema)) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined
      };
    }

    return { type: 'object' };
  }

  private _zodFieldToJson(schema: z.ZodTypeAny): any {
    if (schema instanceof z.ZodString) {
      return { type: 'string', description: schema.description };
    }
    if (schema instanceof z.ZodNumber) {
      return { type: 'number', description: schema.description };
    }
    if (schema instanceof z.ZodBoolean) {
      return { type: 'boolean', description: schema.description };
    }
    if (schema instanceof z.ZodArray) {
      return {
        type: 'array',
        items: this._zodFieldToJson(schema.element),
        description: schema.description
      };
    }
    if (schema instanceof z.ZodEnum) {
      return {
        type: 'string',
        enum: schema._def.values,
        description: schema.description
      };
    }
    if (schema instanceof z.ZodOptional) {
      return this._zodFieldToJson(schema.unwrap());
    }

    return { type: 'string' };
  }

  private _isOptional(schema: z.ZodTypeAny): boolean {
    return schema instanceof z.ZodOptional;
  }
}
