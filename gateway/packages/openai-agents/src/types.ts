/**
 * Type definitions for OpenAI Agents integration
 */

import type { ConnectorsConfig } from '@connectors/sdk';
import type OpenAI from 'openai';

/**
 * Configuration for ConnectorsProvider
 */
export interface ConnectorsProviderConfig {
  /**
   * Connectors SDK configuration
   */
  connectors: ConnectorsConfig;

  /**
   * OpenAI client configuration
   */
  openai: {
    /**
     * OpenAI API key
     */
    apiKey: string;

    /**
     * OpenAI organization ID (optional)
     */
    organization?: string;

    /**
     * Base URL for OpenAI API (optional, for proxies)
     */
    baseURL?: string;

    /**
     * Default request timeout in milliseconds
     */
    timeout?: number;

    /**
     * Maximum number of retries for failed requests
     */
    maxRetries?: number;
  };
}

/**
 * Options for semantic tool selection
 */
export interface ToolSelectionOptions {
  /**
   * Maximum number of tools to select
   * @default 10
   */
  maxTools?: number;

  /**
   * Filter by specific categories
   */
  categories?: string[];

  /**
   * Token budget for tool schemas
   * @default 3000
   */
  tokenBudget?: number;

  /**
   * Additional context for selection
   */
  context?: Record<string, unknown>;
}

/**
 * Configuration for creating an OpenAI agent with Connectors tools
 */
export interface AgentConfig {
  /**
   * Agent name
   */
  name: string;

  /**
   * Agent instructions/system prompt
   */
  instructions: string;

  /**
   * OpenAI model to use
   * @default 'gpt-4-turbo-preview'
   */
  model?: string;

  /**
   * Semantic query for automatic tool selection
   * If provided, tools will be selected based on this query
   */
  toolQuery?: string;

  /**
   * Specific integrations to include
   * If provided, all tools from these integrations will be included
   */
  integrations?: string[];

  /**
   * Manual tool selection options (used with toolQuery)
   */
  toolSelectionOptions?: ToolSelectionOptions;

  /**
   * Additional assistant configuration
   */
  assistantConfig?: {
    /**
     * File IDs for code interpreter
     */
    file_ids?: string[];

    /**
     * Assistant metadata
     */
    metadata?: Record<string, string>;

    /**
     * Temperature for response generation
     */
    temperature?: number;

    /**
     * Top P for response generation
     */
    top_p?: number;
  };
}

/**
 * Tool parameter definition from Connectors
 */
export interface ToolParameter {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  enum?: string[];
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
}

/**
 * Extended types for better compatibility
 */
export type OpenAITool = OpenAI.ChatCompletionTool;
export type OpenAIToolCall = OpenAI.ChatCompletionMessageToolCall;
export type OpenAIAssistant = OpenAI.Beta.Assistants.Assistant;
export type OpenAIFunctionParameters = OpenAI.FunctionParameters;
