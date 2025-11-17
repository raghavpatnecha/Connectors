/**
 * Types for LangChain integration with Connectors platform
 */

/**
 * Tool parameter definition (JSONSchema-like)
 */
export interface ToolParameter {
  name: string;
  type: string;
  description?: string;
  required?: boolean | string[]; // boolean for single param, string[] for nested object properties
  enum?: string[];
  format?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  items?: { type: string };
  minItems?: number;
  maxItems?: number;
  properties?: Record<string, any>;
}

/**
 * Configuration for ConnectorsToolkit
 */
export interface ConnectorsToolkitConfig {
  /**
   * Connectors SDK configuration
   */
  connectors: {
    /**
     * Base URL of the Connectors gateway
     */
    baseURL: string;

    /**
     * API key for authentication (optional)
     */
    apiKey?: string;

    /**
     * Tenant ID for multi-tenant setup (optional)
     */
    tenantId?: string;
  };

  /**
   * Specific integrations to load tools from (optional)
   * If not provided, will use toolQuery instead
   */
  integrations?: string[];

  /**
   * Semantic query for tool selection (optional)
   * If not provided, will use integrations instead
   */
  toolQuery?: string;
}

/**
 * Options for tool selection
 */
export interface ToolSelectionOptions {
  /**
   * Maximum number of tools to select
   * @default 10
   */
  maxTools?: number;

  /**
   * Categories to filter by (optional)
   */
  categories?: string[];

  /**
   * Minimum relevance score (0-1)
   * @default 0.7
   */
  minScore?: number;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  /**
   * Whether execution was successful
   */
  success: boolean;

  /**
   * Result data (if successful)
   */
  data?: any;

  /**
   * Error message (if failed)
   */
  error?: string;

  /**
   * Execution metadata
   */
  metadata?: {
    /**
     * Execution time in milliseconds
     */
    executionTime?: number;

    /**
     * Tool ID
     */
    toolId?: string;

    /**
     * Integration name
     */
    integration?: string;
  };
}
