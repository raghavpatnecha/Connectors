/**
 * Tool Schema Loader Service
 * Connectors Platform - Fetches full tool schemas from MCP servers
 */

import { IntegrationRegistry } from '../config/integrations';
import { OAuthProxy } from '../auth/oauth-proxy';
import { logger } from '../logging/logger';
import { FullToolSchema } from '../types/workflow.types';

/**
 * ToolSchemaLoader fetches complete tool schemas from MCP servers
 *
 * This service:
 * - Groups tools by integration
 * - Calls each MCP server's tools endpoint
 * - Returns full schemas with parameters, examples, descriptions
 */
export class ToolSchemaLoader {
  private readonly _integrationRegistry: IntegrationRegistry;
  private readonly _oauthProxy: OAuthProxy;

  constructor(
    integrationRegistry: IntegrationRegistry,
    oauthProxy: OAuthProxy
  ) {
    this._integrationRegistry = integrationRegistry;
    this._oauthProxy = oauthProxy;
  }

  /**
   * Load full schemas for specified tools
   *
   * @param toolIds - Array of tool IDs (e.g., ["github.createPullRequest", "notion.createPage"])
   * @returns Map of tool ID to full schema
   */
  async loadToolSchemas(toolIds: string[]): Promise<Record<string, FullToolSchema>> {
    if (toolIds.length === 0) {
      return {};
    }

    const startTime = Date.now();
    logger.debug('Loading tool schemas', { toolCount: toolIds.length });

    try {
      // Group tools by integration
      const toolsByIntegration = this._groupToolsByIntegration(toolIds);

      // Fetch schemas from each integration in parallel
      const schemaPromises = Object.entries(toolsByIntegration).map(
        ([integration, tools]) => this._fetchSchemasFromIntegration(integration, tools)
      );

      const schemaArrays = await Promise.all(schemaPromises);

      // Merge all schemas into a single map
      const schemas: Record<string, FullToolSchema> = {};
      schemaArrays.forEach(schemaMap => {
        Object.assign(schemas, schemaMap);
      });

      const duration = Date.now() - startTime;
      logger.info('Tool schemas loaded', {
        requestedCount: toolIds.length,
        loadedCount: Object.keys(schemas).length,
        duration
      });

      return schemas;
    } catch (error) {
      logger.error('Failed to load tool schemas', {
        toolIds,
        error: error instanceof Error ? error.message : String(error)
      });

      // Return empty schemas instead of failing the entire request
      return {};
    }
  }

  /**
   * Group tool IDs by their integration
   *
   * @param toolIds - Array of tool IDs
   * @returns Map of integration name to tool IDs
   */
  private _groupToolsByIntegration(toolIds: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    for (const toolId of toolIds) {
      // Extract integration name from tool ID (format: "integration.toolName")
      const parts = toolId.split('.');

      if (parts.length < 2) {
        logger.warn('Invalid tool ID format', { toolId });
        continue;
      }

      const integration = parts[0].toLowerCase();

      if (!grouped[integration]) {
        grouped[integration] = [];
      }

      grouped[integration].push(toolId);
    }

    return grouped;
  }

  /**
   * Fetch schemas from a specific integration's MCP server
   *
   * @param integration - Integration name (e.g., "github", "notion")
   * @param toolIds - Tool IDs for this integration
   * @returns Map of tool ID to schema
   */
  private async _fetchSchemasFromIntegration(
    integration: string,
    toolIds: string[]
  ): Promise<Record<string, FullToolSchema>> {
    try {
      // Get integration metadata
      const integrationMeta = this._integrationRegistry.getIntegration(integration);

      if (!integrationMeta) {
        logger.warn('Integration not found', { integration });
        return {};
      }

      if (!integrationMeta.enabled) {
        logger.debug('Integration disabled, skipping schema fetch', { integration });
        return {};
      }

      // Get integration instance
      const instance = this._integrationRegistry.getInstance(integration);

      if (!instance) {
        logger.warn('Integration instance not found', { integration });
        return {};
      }

      // CRITICAL FIX: Type-safe method call with return validation
      if (instance && typeof instance.getToolSchemas === 'function') {
        try {
          const result = await instance.getToolSchemas(toolIds);

          // Validate return type
          if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
            return result as Record<string, FullToolSchema>;
          }

          logger.warn('getToolSchemas returned invalid type', {
            integration,
            resultType: typeof result
          });
        } catch (error) {
          logger.error('getToolSchemas call failed', {
            integration,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      // Fallback: Try to fetch from MCP server directly
      return await this._fetchFromMCPServer(integrationMeta.serverUrl, toolIds);
    } catch (error) {
      logger.error('Failed to fetch schemas from integration', {
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      return {};
    }
  }

  /**
   * Fetch schemas directly from MCP server HTTP endpoint
   *
   * @param serverUrl - MCP server URL
   * @param toolIds - Tool IDs to fetch
   * @returns Map of tool ID to schema
   */
  private async _fetchFromMCPServer(
    serverUrl: string,
    toolIds: string[]
  ): Promise<Record<string, FullToolSchema>> {
    try {
      // Call MCP server's /tools endpoint
      const response = await fetch(`${serverUrl}/tools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`MCP server returned ${response.status}`);
      }

      const data = await response.json();

      // Extract schemas for requested tools
      const schemas: Record<string, FullToolSchema> = {};

      if (Array.isArray(data.tools)) {
        for (const tool of data.tools) {
          // Match by tool slug or name
          const toolSlug = tool.tool_slug || tool.name;

          if (toolIds.some(id => id.includes(toolSlug))) {
            schemas[toolSlug] = {
              tool_slug: toolSlug,
              toolkit: tool.toolkit || tool.integration || 'unknown',
              description: tool.description || '',
              input_schema: tool.input_schema || tool.schema || {}
            };
          }
        }
      }

      return schemas;
    } catch (error) {
      logger.error('Failed to fetch from MCP server', {
        serverUrl,
        error: error instanceof Error ? error.message : String(error)
      });
      return {};
    }
  }
}
