/**
 * ConnectorsTool - LangChain StructuredTool implementation for Connectors
 */

import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { Connectors, Tool } from '@connectors/sdk';
import { convertToZodSchema } from './tool-converter';
import type { ToolParameter } from './types';

/**
 * Convert SDK Tool.parameters (Record<string, unknown>) to ToolParameter[]
 */
function convertParametersToArray(parameters?: Record<string, unknown>): ToolParameter[] {
  if (!parameters || typeof parameters !== 'object') {
    return [];
  }

  // If it's a JSONSchema-like object with 'properties'
  if ('properties' in parameters && typeof parameters.properties === 'object') {
    const props = parameters.properties as Record<string, any>;
    const required = (parameters.required as string[]) || [];

    return Object.entries(props).map(([name, schema]) => ({
      name,
      type: schema.type || 'string',
      description: schema.description,
      required: required.includes(name),
      enum: schema.enum,
      format: schema.format,
      minLength: schema.minLength,
      maxLength: schema.maxLength,
      minimum: schema.minimum,
      maximum: schema.maximum,
      pattern: schema.pattern,
      items: schema.items,
      minItems: schema.minItems,
      maxItems: schema.maxItems,
      properties: schema.properties
    }));
  }

  // Otherwise, try to convert directly
  return Object.entries(parameters).map(([name, value]) => {
    const schema = value as any;
    return {
      name,
      type: schema?.type || 'string',
      description: schema?.description,
      required: schema?.required || false
    };
  });
}

/**
 * LangChain tool that wraps a Connectors tool
 * Extends StructuredTool for integration with LangChain agents
 */
export class ConnectorsTool extends StructuredTool {
  name: string;
  description: string;
  schema: z.ZodObject<any>;

  private readonly _connectors: Connectors;
  private readonly _toolId: string;
  private readonly _integration: string;

  /**
   * Create a new ConnectorsTool
   *
   * @param tool - Connectors tool definition
   * @param connectors - Connectors SDK instance
   */
  constructor(tool: Tool, connectors: Connectors) {
    super();

    this.name = this._sanitizeToolName(tool.id);
    this.description = tool.description || `Execute ${tool.id}`;
    this.schema = convertToZodSchema(convertParametersToArray(tool.parameters));

    this._connectors = connectors;
    this._toolId = tool.id;
    this._integration = tool.integration || 'unknown';
  }

  /**
   * Sanitize tool name for LangChain compatibility
   * LangChain tool names should be alphanumeric with underscores
   */
  private _sanitizeToolName(toolId: string): string {
    return toolId.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Execute the tool via Connectors SDK
   *
   * @param arg - Tool arguments (validated by Zod schema)
   * @returns Tool execution result as JSON string
   */
  async _call(arg: z.infer<this['schema']>): Promise<string> {
    const startTime = Date.now();

    try {
      // Validate input against schema
      const validatedInput = this.schema.parse(arg);

      // Execute tool via Connectors SDK
      const result = await this._connectors.tools.invoke(this._toolId, validatedInput);

      const executionTime = Date.now() - startTime;

      // Return result as JSON string
      return JSON.stringify({
        success: true,
        data: result,
        metadata: {
          executionTime,
          toolId: this._toolId,
          integration: this._integration
        }
      });
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      // Return error as JSON string
      return JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        metadata: {
          executionTime,
          toolId: this._toolId,
          integration: this._integration,
          errorType: error.name || 'Error'
        }
      });
    }
  }

  /**
   * Convert a Connectors Tool to a LangChain StructuredTool
   *
   * @param tool - Connectors tool definition
   * @param connectors - Connectors SDK instance
   * @returns ConnectorsTool instance
   */
  static fromConnectorsTool(tool: Tool, connectors: Connectors): ConnectorsTool {
    return new ConnectorsTool(tool, connectors);
  }

  /**
   * Get tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: this.description,
      toolId: this._toolId,
      integration: this._integration,
      schema: this.schema.shape
    };
  }
}
