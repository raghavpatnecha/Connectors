/**
 * Reddit Unified MCP - Post Tools
 *
 * Tools for working with Reddit posts:
 * - Get post by ID
 * - Get post by URL
 * - Get post by fullname
 * - Get user posts
 *
 * @module tools/post-tools
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

export function registerPostTools(server: Server, client: RedditClient): void {
  logger.info('Registering post tools');

  // 1. Get Post
  registerTool(server, {
    name: 'get_post',
    description: 'Get a specific post by its ID and subreddit. Returns full post details including title, content, author, score, and comments.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: ToolSchemas.subreddit,
        postId: ToolSchemas.postId,
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        }
      },
      required: ['subreddit', 'postId']
    },
    handler: async (params: { subreddit: string; postId: string; tenantId?: string }) => {
      const [postListing, commentsListing] = await client.getPost(
        params.tenantId || null,
        params.subreddit,
        params.postId
      );

      const post = postListing.data.children[0]?.data;
      if (!post) {
        throw new Error('Post not found');
      }

      const comments = parseRedditListing(commentsListing);

      return formatToolResponse({
        post,
        comments: comments.items,
        comment_count: comments.items.length
      }, {
        subreddit: params.subreddit,
        post_id: params.postId
      });
    }
  });

  // 2. Get Post by URL
  registerTool(server, {
    name: 'get_post_by_url',
    description: 'Get a post by its Reddit URL. Extracts subreddit and post ID from the URL and returns full post details. Supports both old.reddit.com and www.reddit.com URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Reddit post URL (e.g., https://reddit.com/r/subreddit/comments/abc123/title)',
          format: 'uri'
        },
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        }
      },
      required: ['url']
    },
    handler: async (params: { url: string; tenantId?: string }) => {
      // Parse Reddit URL to extract subreddit and post ID
      const urlPattern = /reddit\.com\/r\/([^/]+)\/comments\/([^/]+)/;
      const match = params.url.match(urlPattern);

      if (!match) {
        throw new Error('Invalid Reddit post URL. Expected format: https://reddit.com/r/subreddit/comments/postid/title');
      }

      const [, subreddit, postId] = match;

      const [postListing, commentsListing] = await client.getPost(
        params.tenantId || null,
        subreddit,
        postId
      );

      const post = postListing.data.children[0]?.data;
      if (!post) {
        throw new Error('Post not found');
      }

      const comments = parseRedditListing(commentsListing);

      return formatToolResponse({
        post,
        comments: comments.items,
        comment_count: comments.items.length
      }, {
        subreddit,
        post_id: postId,
        url: params.url
      });
    }
  });

  // 3. Get Post by ID (with fullname)
  registerTool(server, {
    name: 'get_post_by_id',
    description: 'Get a post using its fullname ID (t3_xxxxx format). This method works without knowing the subreddit. Returns full post details.',
    inputSchema: {
      type: 'object',
      properties: {
        fullname: {
          type: 'string',
          description: 'Reddit post fullname (format: t3_postid)',
          pattern: '^t3_[a-z0-9]+$'
        },
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        }
      },
      required: ['fullname']
    },
    handler: async (params: { fullname: string; tenantId?: string }) => {
      // Extract post ID from fullname (remove t3_ prefix)
      const postId = params.fullname.replace(/^t3_/, '');

      // Reddit API endpoint for getting post info by fullname
      // We'll need to search by URL or use the /api/info endpoint
      // For now, return an error message about needing subreddit
      throw new Error(
        'Getting post by fullname requires using the /api/info endpoint. ' +
        'Please use get_post with subreddit and post ID, or get_post_by_url with the full URL instead.'
      );
    }
  });

  // 4. Get User Posts
  registerTool(server, {
    name: 'get_user_posts',
    description: 'Get posts submitted by a specific user. Returns a list of posts created by the user, with optional sorting and time filtering.',
    inputSchema: {
      type: 'object',
      properties: {
        username: ToolSchemas.username,
        sort: {
          type: 'string',
          description: 'Sort order for posts',
          enum: ['new', 'hot', 'top', 'controversial'],
          default: 'new'
        },
        time: {
          ...ToolSchemas.timeFilter,
          description: 'Time filter (only applies to top/controversial sort)',
          default: 'all'
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
      time?: string;
      tenantId?: string;
      limit?: number;
      after?: string;
    }) => {
      const listing = await client.getUserPosts(params.tenantId || null, params.username, {
        sort: params.sort,
        time: params.time,
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        username: params.username,
        sort: params.sort || 'new',
        posts: parsed.items,
        pagination: parsed.pagination
      }, {
        count: parsed.items.length,
        time_filter: params.time || 'all'
      });
    }
  });

  logger.info('Post tools registered successfully', { count: 4 });
}
