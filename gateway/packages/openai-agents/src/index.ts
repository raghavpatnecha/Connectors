/**
 * @connectors/openai-agents - OpenAI Agents SDK integration for Connectors
 *
 * Provides seamless integration between Connectors' semantic tool selection
 * and OpenAI's function calling / assistants API.
 *
 * @packageDocumentation
 */

// Main provider class
export { ConnectorsProvider } from './ConnectorsProvider';

// Tool conversion utilities
export {
  convertToOpenAITool,
  convertToolsToOpenAI,
  convertParameters,
} from './tool-converter';

// Type exports
export type {
  ConnectorsProviderConfig,
  ToolSelectionOptions,
  AgentConfig,
  ToolParameter,
  OpenAITool,
  OpenAIToolCall,
  OpenAIAssistant,
  OpenAIFunctionParameters,
} from './types';

// Re-export commonly used types from dependencies
export type { Connectors, ConnectorsConfig, Tool } from '@connectors/sdk';

// Version
export const VERSION = '0.1.0';
