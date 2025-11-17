/**
 * Comment-related tools for Product Hunt MCP Server
 */

import { ProductHuntClient } from '../clients/producthunt-client.js';
import { COMMENT_QUERY, COMMENTS_QUERY } from '../clients/graphql-queries.js';
import { ToolDefinition } from '../utils/tool-registry-helper.js';
import { logger } from '../utils/logger.js';

export function getCommentTools(client: ProductHuntClient): ToolDefinition[] {
  return [
    // get_comment tool
    {
      name: 'producthunt_get_comment',
      description:
        'Retrieve detailed information about a specific Product Hunt comment by ID. Returns comment details including body, creation date, votes count, and author information.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
          id: {
            type: 'string',
            description: 'The comment\'s unique ID',
          },
        },
        required: ['tenantId', 'id'],
      },
      handler: async (args: { tenantId: string; id: string }) => {
        const { tenantId, id } = args;

        logger.info('producthunt_get_comment called', { tenantId, id });

        const result = await client.query(COMMENT_QUERY, { id }, tenantId);

        if (!result.success) {
          return result;
        }

        // Check if comment exists
        if (!result.data?.comment) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Comment not found: ${id}`,
            },
            rateLimits: result.rateLimits,
          };
        }

        return {
          success: true,
          data: result.data.comment,
          rateLimits: result.rateLimits,
        };
      },
    },

    // get_post_comments tool
    {
      name: 'producthunt_get_post_comments',
      description:
        'Retrieve comments for a specific Product Hunt post by post ID or slug, with optional sorting and pagination. Returns a list of comments with author details.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
          postId: {
            type: 'string',
            description: 'The post\'s unique ID',
          },
          slug: {
            type: 'string',
            description: 'The post\'s slug',
          },
          order: {
            type: 'string',
            enum: ['NEWEST', 'OLDEST', 'VOTES'],
            description: 'Sorting order (default: NEWEST)',
          },
          count: {
            type: 'number',
            description: 'Number of comments to return (default: 10, max: 20)',
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
        postId?: string;
        slug?: string;
        order?: string;
        count?: number;
        after?: string;
      }) => {
        const {
          tenantId,
          postId,
          slug,
          order = 'NEWEST',
          count = 10,
          after,
        } = args;

        // Validate that at least one of postId or slug is provided
        if (!postId && !slug) {
          return {
            success: false,
            error: {
              code: 'INVALID_PARAMETERS',
              message: 'Either "postId" or "slug" must be provided',
            },
          };
        }

        logger.info('producthunt_get_post_comments called', {
          tenantId,
          postId,
          slug,
          order,
          count,
        });

        const variables: any = {
          first: Math.min(count, 20),
          order,
        };

        if (postId) variables.id = postId;
        if (slug) variables.slug = slug;
        if (after) variables.after = after;

        const result = await client.query(COMMENTS_QUERY, variables, tenantId);

        if (!result.success) {
          return result;
        }

        // Check if post exists
        if (!result.data?.post) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Post not found: ${postId || slug}`,
            },
            rateLimits: result.rateLimits,
          };
        }

        const comments = result.data.post.comments?.edges || [];
        const pageInfo = result.data.post.comments?.pageInfo || {
          endCursor: null,
          hasNextPage: false,
        };

        return {
          success: true,
          data: {
            comments,
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
