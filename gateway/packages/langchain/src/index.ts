/**
 * @connectors/langchain - LangChain integration for Connectors platform
 *
 * Provides seamless integration between Connectors' semantic tool routing
 * and LangChain's agent framework.
 *
 * @module @connectors/langchain
 */

export { ConnectorsToolkit } from './ConnectorsToolkit';
export { ConnectorsTool } from './ConnectorsTool';
export { convertToZodSchema, validateInput } from './tool-converter';
export type {
  ConnectorsToolkitConfig,
  ToolSelectionOptions,
  ToolExecutionResult
} from './types';
