/**
 * Topic-related tools for Product Hunt MCP Server
 */

import { ProductHuntClient } from '../clients/producthunt-client.js';
import { TOPIC_QUERY, TOPICS_QUERY } from '../clients/graphql-queries.js';
import { ToolDefinition } from '../utils/tool-registry-helper.js';
import { logger } from '../utils/logger.js';

export function getTopicTools(client: ProductHuntClient): ToolDefinition[] {
  return [
    // get_topic tool
    {
      name: 'producthunt_get_topic',
      description:
        'Retrieve detailed information about a specific Product Hunt topic by ID or slug. Returns topic details including name, description, follower count, posts count, and image.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
          id: {
            type: 'string',
            description: 'The topic\'s unique ID',
          },
          slug: {
            type: 'string',
            description: 'The topic\'s slug (e.g., "artificial-intelligence")',
          },
        },
        required: ['tenantId'],
      },
      handler: async (args: {
        tenantId: string;
        id?: string;
        slug?: string;
      }) => {
        const { tenantId, id, slug } = args;

        // Validate that at least one of id or slug is provided
        if (!id && !slug) {
          return {
            success: false,
            error: {
              code: 'INVALID_PARAMETERS',
              message: 'Either "id" or "slug" must be provided',
            },
          };
        }

        logger.info('producthunt_get_topic called', { tenantId, id, slug });

        const variables: any = {};
        if (id) variables.id = id;
        if (slug) variables.slug = slug;

        const result = await client.query(TOPIC_QUERY, variables, tenantId);

        if (!result.success) {
          return result;
        }

        // Check if topic exists
        if (!result.data?.topic) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Topic not found: ${id || slug}`,
            },
            rateLimits: result.rateLimits,
          };
        }

        return {
          success: true,
          data: result.data.topic,
          rateLimits: result.rateLimits,
        };
      },
    },

    // search_topics tool
    {
      name: 'producthunt_search_topics',
      description:
        'Search for Product Hunt topics by name or filter by user following, with optional sorting and pagination. Returns a list of matching topics.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
          query: {
            type: 'string',
            description: 'Search term to find topics by name',
          },
          followedByUserId: {
            type: 'string',
            description: 'Only topics followed by this user ID',
          },
          order: {
            type: 'string',
            enum: ['FOLLOWERS_COUNT', 'NAME', 'NEWEST'],
            description: 'Sorting order (default: FOLLOWERS_COUNT)',
          },
          count: {
            type: 'number',
            description: 'Number of topics to return (default: 10, max: 20)',
            minimum: 1,
            maximum: 20,
          },
          after: {
            type: 'string',
            description: 'Pagination cursor for next page',
          },
        },
        required: ['tenantId'],
      },
      handler: async (args: {
        tenantId: string;
        query?: string;
        followedByUserId?: string;
        order?: string;
        count?: number;
        after?: string;
      }) => {
        const {
          tenantId,
          query,
          followedByUserId,
          order = 'FOLLOWERS_COUNT',
          count = 10,
          after,
        } = args;

        logger.info('producthunt_search_topics called', {
          tenantId,
          query,
          followedByUserId,
          order,
          count,
        });

        const variables: any = {
          first: Math.min(count, 20),
          order,
        };

        if (after) variables.after = after;
        if (query) variables.query = query;
        if (followedByUserId) variables.followedByUserId = followedByUserId;

        const result = await client.query(TOPICS_QUERY, variables, tenantId);

        if (!result.success) {
          return result;
        }

        const topics = result.data?.topics?.edges || [];
        const pageInfo = result.data?.topics?.pageInfo || {
          endCursor: null,
          hasNextPage: false,
        };

        return {
          success: true,
          data: {
            topics,
            pagination: {
              endCursor: pageInfo.endCursor,
              hasNextPage: pageInfo.hasNextPage,
            },
          },
          rateLimits: result.rateLimits,
        };
      },
    },
  ];
}
