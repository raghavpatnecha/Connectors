/**
 * Google Custom Search MCP - CSE Management Tools
 * Tools for managing Custom Search Engines (CSE)
 */

import { z } from 'zod';
import { customsearch_v1 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { SearchClientFactory } from '../clients/search-client';
import { mapSearchError } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * OAuth manager interface (for getting authenticated clients)
 */
interface OAuthManager {
  getAuthenticatedClient(tenantId: string): Promise<any>;
}

/**
 * Register all CSE management tools
 */
export function registerCSETools(
  registry: ToolRegistry,
  searchClientFactory: SearchClientFactory,
  oauthManager: OAuthManager
): void {
  // List custom search engines
  registry.registerTool(
    'search_list_cse',
    'List all custom search engines available to the user',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
    }),
    async (args) => {
      try {
        const auth = await oauthManager.getAuthenticatedClient(args.tenantId);
        const client = searchClientFactory.getCustomSearchClient(auth);
        const apiKey = searchClientFactory.getApiKey();
        const cx = searchClientFactory.getSearchEngineId();

        // Use a minimal search to get CSE context information
        const response = await client.cse.list({
          key: apiKey,
          cx: cx,
          q: 'test',
          num: 1,
        });

        const context = response.data.context || {};

        const result = {
          searchEngineId: cx,
          title: context.title || 'Unknown',
          facets: context.facets || [],
          message: 'Custom Search Engine information retrieved successfully',
        };

        logger.info('Listed CSE information', {
          tenantId: args.tenantId,
          searchEngineId: cx,
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to list CSE', {
          tenantId: args.tenantId,
          error: error.message,
        });
        throw mapSearchError(error);
      }
    }
  );

  // Get CSE details
  registry.registerTool(
    'search_get_cse',
    'Get detailed information about a custom search engine including configuration and available refinements',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      searchEngineId: z.string().optional().describe('Custom Search Engine ID (uses default if not provided)'),
    }),
    async (args) => {
      try {
        const auth = await oauthManager.getAuthenticatedClient(args.tenantId);
        const client = searchClientFactory.getCustomSearchClient(auth);
        const apiKey = searchClientFactory.getApiKey();
        const cx = args.searchEngineId || searchClientFactory.getSearchEngineId();

        // Execute minimal search to get metadata
        const response = await client.cse.list({
          key: apiKey,
          cx: cx,
          q: 'test',
          num: 1,
        });

        const context = response.data.context || {};
        const searchInfo = response.data.searchInformation || {};

        const result = {
          searchEngineId: cx,
          title: context.title || 'Unknown',
          totalIndexedResults: searchInfo.totalResults || '0',
          refinements: context.facets?.map((facet) =>
            facet.map((item) => ({
              label: item.label,
              anchor: item.anchor,
            }))
          ) || [],
          message: 'Custom Search Engine details retrieved successfully',
        };

        logger.info('Retrieved CSE details', {
          tenantId: args.tenantId,
          searchEngineId: cx,
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get CSE details', {
          tenantId: args.tenantId,
          searchEngineId: args.searchEngineId,
          error: error.message,
        });
        throw mapSearchError(error);
      }
    }
  );

  // Update CSE configuration (placeholder - actual update requires Admin API)
  registry.registerTool(
    'search_update_cse',
    'Update custom search engine configuration (Note: This operation requires additional API access and may be limited)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      searchEngineId: z.string().describe('Custom Search Engine ID to update'),
      title: z.string().optional().describe('New title for the search engine'),
      description: z.string().optional().describe('New description for the search engine'),
    }),
    async (args) => {
      try {
        // Note: The Custom Search JSON API is read-only
        // Actual CSE updates require the Control Panel API or manual configuration
        // This tool provides information about the limitation

        logger.info('CSE update requested (read-only API limitation)', {
          tenantId: args.tenantId,
          searchEngineId: args.searchEngineId,
        });

        const result = {
          searchEngineId: args.searchEngineId,
          success: false,
          message: 'Custom Search Engine updates are not supported via the JSON API. Please use the Custom Search Control Panel at https://programmablesearchengine.google.com/controlpanel/all to manage your search engines.',
          controlPanelUrl: 'https://programmablesearchengine.google.com/controlpanel/all',
          requestedChanges: {
            title: args.title,
            description: args.description,
          },
        };

        return result;
      } catch (error: any) {
        logger.error('Failed to update CSE', {
          tenantId: args.tenantId,
          searchEngineId: args.searchEngineId,
          error: error.message,
        });
        throw mapSearchError(error);
      }
    }
  );
}
