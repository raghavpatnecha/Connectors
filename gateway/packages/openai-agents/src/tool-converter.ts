/**
 * Tool conversion utilities for OpenAI Agents
 * Converts Connectors Tool format to OpenAI function definitions
 */

import type { Tool } from '@connectors/sdk';
import type OpenAI from 'openai';
import type { ToolParameter } from './types';

/**
 * Convert Connectors Tool to OpenAI ChatCompletionTool format
 *
 * @param tool - Connectors tool definition
 * @returns OpenAI-compatible tool definition
 *
 * @example
 * ```typescript
 * const tool = {
 *   id: 'github.createPullRequest',
 *   name: 'Create Pull Request',
 *   description: 'Create a new pull request',
 *   parameters: { ... }
 * };
 *
 * const openaiTool = convertToOpenAITool(tool);
 * // {
 * //   type: 'function',
 * //   function: {
 * //     name: 'github.createPullRequest',
 * //     description: 'Create a new pull request',
 * //     parameters: { ... }
 * //   }
 * // }
 * ```
 */
export function convertToOpenAITool(tool: Tool): OpenAI.ChatCompletionTool {
  return {
    type: 'function',
    function: {
      name: tool.id,
      description: tool.description || `${tool.name} tool`,
      parameters: convertParameters(tool.parameters || {}),
    },
  };
}

/**
 * Convert Connectors parameters to OpenAI FunctionParameters (JSON Schema)
 *
 * @param params - Connectors parameters object
 * @returns JSON Schema compatible with OpenAI function calling
 *
 * @internal
 */
export function convertParameters(
  params: Record<string, unknown>
): OpenAI.FunctionParameters {
  // If parameters are already in JSON Schema format, return as-is
  if (isJSONSchema(params)) {
    return params as OpenAI.FunctionParameters;
  }

  // Otherwise, assume it's a simple object and convert
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (isToolParameter(value)) {
      properties[key] = convertParameterToSchema(value);
      if (value.required) {
        required.push(key);
      }
    } else {
      // Direct property definition
      properties[key] = value;
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
  } as OpenAI.FunctionParameters;
}

/**
 * Convert a single ToolParameter to JSON Schema property
 *
 * @param param - Tool parameter definition
 * @returns JSON Schema property
 *
 * @internal
 */
function convertParameterToSchema(param: ToolParameter): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    type: param.type,
  };

  if (param.description) {
    schema.description = param.description;
  }

  if (param.enum) {
    schema.enum = param.enum;
  }

  // Handle array type
  if (param.type === 'array' && param.items) {
    schema.items = convertParameterToSchema(param.items);
  }

  // Handle object type
  if (param.type === 'object' && param.properties) {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(param.properties)) {
      properties[key] = convertParameterToSchema(value);
      if (value.required) {
        required.push(key);
      }
    }

    schema.properties = properties;
    if (required.length > 0) {
      schema.required = required;
    }
  }

  return schema;
}

/**
 * Type guard to check if a value is a ToolParameter
 *
 * @param value - Value to check
 * @returns True if value is a ToolParameter
 *
 * @internal
 */
function isToolParameter(value: unknown): value is ToolParameter {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as ToolParameter).type === 'string'
  );
}

/**
 * Type guard to check if parameters are already in JSON Schema format
 *
 * @param params - Parameters to check
 * @returns True if parameters are JSON Schema
 *
 * @internal
 */
function isJSONSchema(params: Record<string, unknown>): boolean {
  return (
    'type' in params &&
    params.type === 'object' &&
    'properties' in params &&
    typeof params.properties === 'object'
  );
}

/**
 * Convert multiple Connectors tools to OpenAI format
 *
 * @param tools - Array of Connectors tools
 * @returns Array of OpenAI-compatible tools
 *
 * @example
 * ```typescript
 * const connectorsTools = await connectors.tools.select('GitHub operations');
 * const openaiTools = convertToolsToOpenAI(connectorsTools);
 * ```
 */
export function convertToolsToOpenAI(tools: Tool[]): OpenAI.ChatCompletionTool[] {
  return tools.map(convertToOpenAITool);
}
