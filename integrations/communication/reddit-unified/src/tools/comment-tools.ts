/**
 * Reddit Unified MCP - Comment Tools
 *
 * Tools for working with Reddit comments:
 * - Get post comments
 * - Get user comments
 *
 * @module tools/comment-tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { RedditClient } from '../clients/reddit-client';
import {
  registerTool,
  ToolSchemas,
  parseRedditListing,
  formatToolResponse
} from '../utils/tool-registry-helper';
import { logger } from '../utils/logger';

export function registerCommentTools(server: Server, client: RedditClient): void {
  logger.info('Registering comment tools');

  // 1. Get Post Comments
  registerTool(server, {
    name: 'get_post_comments',
    description: 'Get comments from a specific post. Returns all comments (including nested replies) for the given post, with optional sorting and depth control.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: ToolSchemas.subreddit,
        postId: ToolSchemas.postId,
        sort: {
          type: 'string',
          description: 'Sort order for comments',
          enum: ['confidence', 'top', 'new', 'controversial', 'old', 'qa'],
          default: 'confidence'
        },
        limit: {
          ...ToolSchemas.pagination.limit,
          description: 'Maximum number of top-level comments to return'
        },
        depth: {
          type: 'number',
          description: 'Maximum depth of nested replies to fetch (0-10)',
          minimum: 0,
          maximum: 10,
          default: 5
        },
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        }
      },
      required: ['subreddit', 'postId']
    },
    handler: async (params: {
      subreddit: string;
      postId: string;
      sort?: string;
      limit?: number;
      depth?: number;
      tenantId?: string;
    }) => {
      const [postListing, commentsListing] = await client.getPostComments(
        params.tenantId || null,
        params.subreddit,
        params.postId,
        {
          sort: params.sort,
          limit: params.limit,
          depth: params.depth
        }
      );

      const post = postListing.data.children[0]?.data;
      if (!post) {
        throw new Error('Post not found');
      }

      const comments = parseRedditListing(commentsListing);

      return formatToolResponse({
        post: {
          id: post.id,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          num_comments: post.num_comments
        },
        comments: comments.items,
        comment_count: comments.items.length
      }, {
        sort: params.sort || 'confidence',
        depth: params.depth || 5,
        subreddit: params.subreddit,
        post_id: params.postId
      });
    }
  });

  // 2. Get User Comments
  registerTool(server, {
    name: 'get_user_comments',
    description: 'Get comments posted by a specific user. Returns a list of comments made by the user across all subreddits, with optional sorting.',
    inputSchema: {
      type: 'object',
      properties: {
        username: ToolSchemas.username,
        sort: {
          type: 'string',
          description: 'Sort order for comments',
          enum: ['new', 'hot', 'top', 'controversial'],
          default: 'new'
        },
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: ['username']
    },
    handler: async (params: {
      username: string;
      sort?: string;
      tenantId?: string;
      limit?: number;
      after?: string;
    }) => {
      const listing = await client.getUserComments(params.tenantId || null, params.username, {
        sort: params.sort,
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        username: params.username,
        sort: params.sort || 'new',
        comments: parsed.items,
        pagination: parsed.pagination
      }, {
        count: parsed.items.length
      });
    }
  });

  logger.info('Comment tools registered successfully', { count: 2 });
}
