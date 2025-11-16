/**
 * Post-related tools for Product Hunt MCP Server
 */

import { ProductHuntClient } from '../clients/producthunt-client.js';
import { POST_QUERY, POSTS_QUERY } from '../clients/graphql-queries.js';
import { ToolDefinition } from '../utils/tool-registry-helper.js';
import { logger } from '../utils/logger.js';

export function getPostTools(client: ProductHuntClient): ToolDefinition[] {
  return [
    // get_post_details tool
    {
      name: 'producthunt_get_post_details',
      description:
        'Retrieve detailed information about a specific Product Hunt post by ID or slug. Returns post details including name, description, votes, makers, topics, media, and optionally paginated comments.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
          id: {
            type: 'string',
            description: 'The post\'s unique ID',
          },
          slug: {
            type: 'string',
            description: 'The post\'s slug (e.g., "claude-desktop")',
          },
          commentsCount: {
            type: 'number',
            description:
              'Number of comments to return (default: 10, max: 20). Set to 0 to exclude comments.',
            minimum: 0,
            maximum: 20,
          },
          commentsAfter: {
            type: 'string',
            description: 'Pagination cursor for fetching the next page of comments',
          },
        },
        required: ['tenantId'],
      },
      handler: async (args: {
        tenantId: string;
        id?: string;
        slug?: string;
        commentsCount?: number;
        commentsAfter?: string;
      }) => {
        const { tenantId, id, slug, commentsCount = 10, commentsAfter } = args;

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

        logger.info('producthunt_get_post_details called', {
          tenantId,
          id,
          slug,
          commentsCount,
        });

        const variables: any = {};
        if (id) variables.id = id;
        if (slug) variables.slug = slug;
        if (commentsCount !== undefined) {
          variables.commentsCount = Math.min(commentsCount, 20);
        }
        if (commentsAfter) variables.commentsAfter = commentsAfter;

        const result = await client.query(POST_QUERY, variables, tenantId);

        if (!result.success) {
          return result;
        }

        // Check if post exists
        if (!result.data?.post) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `Post not found: ${id || slug}`,
            },
            rateLimits: result.rateLimits,
          };
        }

        return {
          success: true,
          data: result.data.post,
          rateLimits: result.rateLimits,
        };
      },
    },

    // get_posts tool
    {
      name: 'producthunt_get_posts',
      description:
        'Retrieve a list of Product Hunt posts with various filtering and sorting options. Supports filtering by topic, featured status, URL, and date range.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
          featured: {
            type: 'boolean',
            description: 'Only return featured posts if true',
          },
          topic: {
            type: 'string',
            description: 'Filter by topic slug',
          },
          order: {
            type: 'string',
            enum: ['RANKING', 'NEWEST', 'VOTES', 'FEATURED_AT'],
            description: 'Sorting order (default: RANKING)',
          },
          count: {
            type: 'number',
            description: 'Number of posts to return (default: 10, max: 20)',
            minimum: 1,
            maximum: 20,
          },
          after: {
            type: 'string',
            description: 'Pagination cursor for next page',
          },
          url: {
            type: 'string',
            description: 'Filter posts by URL',
          },
          twitterUrl: {
            type: 'string',
            description: 'Filter posts by Twitter URL',
          },
          postedBefore: {
            type: 'string',
            description: 'ISO datetime to filter posts posted before this date',
          },
          postedAfter: {
            type: 'string',
            description: 'ISO datetime to filter posts posted after this date',
          },
        },
        required: ['tenantId'],
      },
      handler: async (args: {
        tenantId: string;
        featured?: boolean;
        topic?: string;
        order?: string;
        count?: number;
        after?: string;
        url?: string;
        twitterUrl?: string;
        postedBefore?: string;
        postedAfter?: string;
      }) => {
        const {
          tenantId,
          featured,
          topic,
          order = 'RANKING',
          count = 10,
          after,
          url,
          twitterUrl,
          postedBefore,
          postedAfter,
        } = args;

        logger.info('producthunt_get_posts called', {
          tenantId,
          featured,
          topic,
          order,
          count,
        });

        const variables: any = {
          first: Math.min(count, 20),
          order,
        };

        if (after) variables.after = after;
        if (featured !== undefined) variables.featured = featured;
        if (topic) variables.topic = topic;
        if (url) variables.url = url;
        if (twitterUrl) variables.twitterUrl = twitterUrl;
        if (postedBefore) variables.postedBefore = postedBefore;
        if (postedAfter) variables.postedAfter = postedAfter;

        const result = await client.query(POSTS_QUERY, variables, tenantId);

        if (!result.success) {
          return result;
        }

        const posts = result.data?.posts?.edges || [];
        const pageInfo = result.data?.posts?.pageInfo || {
          endCursor: null,
          hasNextPage: false,
        };

        return {
          success: true,
          data: {
            posts,
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
