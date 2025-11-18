/**
 * ConnectorsToolkit - LangChain Toolkit implementation for Connectors platform
 */

import { Connectors } from '@connectors/sdk';
import { ConnectorsTool } from './ConnectorsTool';
import type { ConnectorsToolkitConfig, ToolSelectionOptions } from './types';

/**
 * LangChain Toolkit for Connectors platform
 * Provides semantic tool selection and integration management
 */
export class ConnectorsToolkit {
  tools: ConnectorsTool[] = [];

  private readonly _connectors: Connectors;
  private readonly _config: ConnectorsToolkitConfig;
  private _initialized: boolean = false;

  /**
   * Create a new ConnectorsToolkit
   *
   * @param config - Toolkit configuration
   */
  constructor(config: ConnectorsToolkitConfig) {
    this._config = config;
    this._connectors = new Connectors(config.connectors);
  }

  /**
   * Get tools from semantic selection
   * Uses Connectors' semantic routing to select relevant tools
   *
   * @param query - Natural language query describing required tools
   * @param options - Tool selection options
   * @returns Array of ConnectorsTool instances
   */
  async getToolsFromQuery(
    query: string,
    options?: ToolSelectionOptions
  ): Promise<ConnectorsTool[]> {
    const maxTools = options?.maxTools || 10;
    const categories = options?.categories;

    // Use Connectors SDK to select tools semantically
    const tools = await this._connectors.tools.select(query, {
      maxTools,
      categories
    });

    // Convert to LangChain tools
    return tools.map(tool => ConnectorsTool.fromConnectorsTool(tool, this._connectors));
  }

  /**
   * Get all tools from a specific integration
   *
   * @param integration - Integration name (e.g., 'github', 'slack')
   * @returns Array of ConnectorsTool instances
   */
  async getToolsFromIntegration(integration: string): Promise<ConnectorsTool[]> {
    // Get MCP server for integration
    const mcpServer = await this._connectors.mcp.get(integration);

    if (!mcpServer) {
      throw new Error(`Integration '${integration}' not found`);
    }

    // List all tools from the MCP server
    const tools = await mcpServer.listTools();

    // Convert to LangChain tools
    return tools.map(tool =>
      ConnectorsTool.fromConnectorsTool(
        { ...tool, integration },
        this._connectors
      )
    );
  }

  /**
   * Get tools by category
   *
   * @param category - Category name (e.g., 'code', 'communication', 'pm')
   * @returns Array of ConnectorsTool instances
   */
  async getToolsByCategory(category: string): Promise<ConnectorsTool[]> {
    // Use semantic selection with category filter
    return this.getToolsFromQuery('', {
      categories: [category],
      maxTools: 50 // Get more tools when filtering by category
    });
  }

  /**
   * Get all tools (implements Toolkit interface)
   * Initializes tools based on configuration if not already initialized
   *
   * @returns Array of ConnectorsTool instances
   */
  async getTools(): Promise<ConnectorsTool[]> {
    if (!this._initialized) {
      await this._initializeTools();
      this._initialized = true;
    }

    return this.tools;
  }

  /**
   * Initialize tools based on configuration
   */
  private async _initializeTools(): Promise<void> {
    // Option 1: Load from specific integrations
    if (this._config.integrations && this._config.integrations.length > 0) {
      const toolPromises = this._config.integrations.map(integration =>
        this.getToolsFromIntegration(integration)
      );
      const toolArrays = await Promise.all(toolPromises);
      this.tools = toolArrays.flat();
      return;
    }

    // Option 2: Load from semantic query
    if (this._config.toolQuery) {
      this.tools = await this.getToolsFromQuery(this._config.toolQuery);
      return;
    }

    // Option 3: No configuration - throw error
    throw new Error(
      'ConnectorsToolkit requires either "integrations" or "toolQuery" in configuration'
    );
  }

  /**
   * Refresh tools (re-initialize)
   * Useful when tool availability changes
   */
  async refresh(): Promise<void> {
    this.tools = [];
    this._initialized = false;
    await this._initializeTools();
    this._initialized = true;
  }

  /**
   * Get toolkit metadata
   */
  getMetadata() {
    return {
      toolCount: this.tools.length,
      integrations: this._config.integrations,
      toolQuery: this._config.toolQuery,
      initialized: this._initialized,
      tools: this.tools.map(tool => tool.getMetadata())
    };
  }

  /**
   * Filter tools by name pattern
   *
   * @param pattern - Regex pattern to match tool names
   * @returns Filtered array of ConnectorsTool instances
   */
  filterToolsByName(pattern: RegExp): ConnectorsTool[] {
    return this.tools.filter(tool => pattern.test(tool.name));
  }

  /**
   * Get Connectors SDK instance (for advanced usage)
   */
  getConnectors(): Connectors {
    return this._connectors;
  }
}
