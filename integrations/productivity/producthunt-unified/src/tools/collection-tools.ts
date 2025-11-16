/**
 * Collection-related tools for Product Hunt MCP Server
 */

import { ProductHuntClient } from '../clients/producthunt-client.js';
import {
  COLLECTION_QUERY,
  COLLECTIONS_QUERY,
} from '../clients/graphql-queries.js';
import { ToolDefinition } from '../utils/tool-registry-helper.js';
import { logger } from '../utils/logger.js';

export function getCollectionTools(
  client: ProductHuntClient
): ToolDefinition[] {
  return [
    // get_collection tool
    {
      name: 'producthunt_get_collection',
      description:
        'Retrieve detailed information about a specific Product Hunt collection by ID or slug. Returns collection details including name, description, and posts.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
          id: {
            type: 'string',
            description: 'The collection\'s unique ID',
          },
          slug: {
            type: 'string',
            description: 'The collection\'s slug (e.g., "best-productivity-apps")',
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

        logger.info('producthunt_get_collection called', { tenantId, id, slug });

        const variables: any = {};
        if (id) variables.id = id;
        if (slug) variables.slug = slug;

        const result = await client.query(
          COLLECTION_QUERY,
          variables,
          tenantId
        );

        if (!result.success) {
          return result;
        }

        // Check if collection exists
        if (!result.data?.collection) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Collection not found: ${id || slug}`,
            },
            rateLimits: result.rateLimits,
          };
        }

        return {
          success: true,
          data: result.data.collection,
          rateLimits: result.rateLimits,
        };
      },
    },

    // get_collections tool
    {
      name: 'producthunt_get_collections',
      description:
        'Retrieve a list of Product Hunt collections with optional filters for featured collections, user-created collections, or collections containing a specific post. Returns paginated results.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
          featured: {
            type: 'boolean',
            description: 'Only return featured collections if true',
          },
          userId: {
            type: 'string',
            description: 'Filter to collections created by this user ID',
          },
          postId: {
            type: 'string',
            description: 'Filter to collections that include this post ID',
          },
          order: {
            type: 'string',
            enum: ['FOLLOWERS_COUNT', 'NEWEST'],
            description: 'Sorting order (default: FOLLOWERS_COUNT)',
          },
          count: {
            type: 'number',
            description:
              'Number of collections to return (default: 10, max: 20)',
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
        featured?: boolean;
        userId?: string;
        postId?: string;
        order?: string;
        count?: number;
        after?: string;
      }) => {
        const {
          tenantId,
          featured,
          userId,
          postId,
          order = 'FOLLOWERS_COUNT',
          count = 10,
          after,
        } = args;

        logger.info('producthunt_get_collections called', {
          tenantId,
          featured,
          userId,
          postId,
          order,
          count,
        });

        const variables: any = {
          first: Math.min(count, 20),
          order,
        };

        if (after) variables.after = after;
        if (featured !== undefined) variables.featured = featured;
        if (userId) variables.userId = userId;
        if (postId) variables.postId = postId;

        const result = await client.query(
          COLLECTIONS_QUERY,
          variables,
          tenantId
        );

        if (!result.success) {
          return result;
        }

        const collections = result.data?.collections?.edges || [];
        const pageInfo = result.data?.collections?.pageInfo || {
          endCursor: null,
          hasNextPage: false,
        };

        return {
          success: true,
          data: {
            collections,
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
