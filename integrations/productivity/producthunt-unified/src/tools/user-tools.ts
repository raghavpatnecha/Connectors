/**
 * User-related tools for Product Hunt MCP Server
 */

import { ProductHuntClient } from '../clients/producthunt-client.js';
import {
  USER_QUERY,
  USER_POSTS_QUERY,
  USER_VOTED_POSTS_QUERY,
  VIEWER_QUERY,
} from '../clients/graphql-queries.js';
import { ToolDefinition } from '../utils/tool-registry-helper.js';
import { logger } from '../utils/logger.js';

export function getUserTools(client: ProductHuntClient): ToolDefinition[] {
  return [
    // get_user tool
    {
      name: 'producthunt_get_user',
      description:
        'Retrieve user information by ID or username, with optional retrieval of their posts (made or voted). Returns user profile details and optionally paginated posts.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: {
            type: 'string',
            description: 'Tenant ID for API token authentication',
          },
          id: {
            type: 'string',
            description: 'The user\'s unique ID',
          },
          username: {
            type: 'string',
            description: 'The user\'s username',
          },
          postsType: {
            type: 'string',
            enum: ['MADE', 'VOTED'],
            description:
              'Type of posts to retrieve: MADE (posts created by user) or VOTED (posts voted by user)',
          },
          postsCount: {
            type: 'number',
            description:
              'Number of posts to return (default: 10, max: 20). Only used when postsType is specified.',
            minimum: 1,
            maximum: 20,
          },
          postsAfter: {
            type: 'string',
            description: 'Pagination cursor for next page of posts',
          },
        },
        required: ['tenantId'],
      },
      handler: async (args: {
        tenantId: string;
        id?: string;
        username?: string;
        postsType?: 'MADE' | 'VOTED';
        postsCount?: number;
        postsAfter?: string;
      }) => {
        const { tenantId, id, username, postsType, postsCount, postsAfter } =
          args;

        // Validate that at least one of id or username is provided
        if (!id && !username) {
          return {
            success: false,
            error: {
              code: 'INVALID_PARAMETERS',
              message: 'Either "id" or "username" must be provided',
            },
          };
        }

        logger.info('producthunt_get_user called', {
          tenantId,
          id,
          username,
          postsType,
          postsCount,
        });

        const variables: any = {};
        if (id) variables.id = id;
        if (username) variables.username = username;

        // Determine if posts are being requested
        const requestingPosts = postsType !== undefined || postsCount !== undefined;

        // Case 1: Basic user info (no posts requested)
        if (!requestingPosts) {
          const result = await client.query(USER_QUERY, variables, tenantId);

          if (!result.success) {
            return result;
          }

          if (!result.data?.user) {
            return {
              success: false,
              error: {
                code: 'NOT_FOUND',
                message: `User not found: ${id || username}`,
              },
              rateLimits: result.rateLimits,
            };
          }

          return {
            success: true,
            data: result.data.user,
            rateLimits: result.rateLimits,
          };
        }

        // Case 2 & 3: Posts requested (made or voted)
        const normalizedPostsType = postsType?.toUpperCase() || 'MADE';

        if (normalizedPostsType !== 'MADE' && normalizedPostsType !== 'VOTED') {
          return {
            success: false,
            error: {
              code: 'INVALID_PARAMETER',
              message: `Invalid postsType: ${postsType}. Valid values are MADE, VOTED.`,
            },
          };
        }

        // Add pagination parameters
        variables.first = Math.min(postsCount || 10, 20);
        if (postsAfter) variables.after = postsAfter;

        // Choose query based on postsType
        const query =
          normalizedPostsType === 'MADE'
            ? USER_POSTS_QUERY
            : USER_VOTED_POSTS_QUERY;

        const result = await client.query(query, variables, tenantId);

        if (!result.success) {
          return result;
        }

        if (!result.data?.user) {
          return {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `User not found: ${id || username}`,
            },
            rateLimits: result.rateLimits,
          };
        }

        const userData = result.data.user;
        const postsField =
          normalizedPostsType === 'MADE' ? 'madePosts' : 'votedPosts';
        const postsData = userData[postsField];

        return {
          success: true,
          data: {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            headline: userData.headline,
            profileImage: userData.profileImage,
            posts: postsData?.edges || [],
            pagination: {
              endCursor: postsData?.pageInfo?.endCursor || null,
              hasNextPage: postsData?.pageInfo?.hasNextPage || false,
            },
          },
          rateLimits: result.rateLimits,
        };
      },
    },

    // get_viewer tool
    {
      name: 'producthunt_get_viewer',
      description:
        'Retrieve information about the currently authenticated user. Returns the profile details of the user whose API token is being used.',
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

        logger.info('producthunt_get_viewer called', { tenantId });

        const result = await client.query(VIEWER_QUERY, {}, tenantId);

        if (!result.success) {
          return result;
        }

        // Check if viewer info exists
        const viewerData = result.data?.viewer;

        if (!viewerData) {
          return {
            success: false,
            error: {
              code: 'AUTHENTICATION_ERROR',
              message:
                'Unable to get viewer information. Token may be invalid or expired.',
            },
            rateLimits: result.rateLimits,
          };
        }

        // Extract user data (handle nested user structure)
        const userData = viewerData.user || viewerData;

        return {
          success: true,
          data: userData,
          rateLimits: result.rateLimits,
        };
      },
    },
  ];
}
