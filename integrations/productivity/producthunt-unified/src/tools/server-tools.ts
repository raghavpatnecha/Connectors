/**
 * Server/system tools for Product Hunt MCP Server
 */

import { ProductHuntClient } from '../clients/producthunt-client.js';
import { ToolDefinition } from '../utils/tool-registry-helper.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { logger } from '../utils/logger.js';

export function getServerTools(client: ProductHuntClient): ToolDefinition[] {
  return [
    {
      name: 'producthunt_check_status',
      description:
        'Check Product Hunt MCP server status, API connectivity, and rate limit information. Use this to verify the server is working correctly and check remaining API quota.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
        },
        required: ['tenantId'],
      },
      handler: async (args: { tenantId: string }) => {
        const { tenantId } = args;

        logger.info('producthunt_check_status called', { tenantId });

        // Get rate limit info
        const rateLimits = RateLimiter.getRateLimitInfo();

        // Simple health check query
        const healthQuery = `
          query {
            viewer {
              user {
                id
                username
              }
            }
          }
        `;

        const result = await client.query(healthQuery, {}, tenantId);

        return {
          success: true,
          data: {
            server: {
              status: 'healthy',
              service: 'producthunt-mcp-unified',
              version: '1.0.0',
            },
            api: {
              status: result.success ? 'connected' : 'error',
              authenticated: result.success,
              viewer: result.data?.viewer?.user || null,
            },
            rateLimits,
          },
        };
      },
    },
  ];
}
