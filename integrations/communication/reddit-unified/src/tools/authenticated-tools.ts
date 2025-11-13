/**
 * Reddit Unified MCP - Authenticated Tools
 *
 * Tools requiring Reddit OAuth authentication:
 * - who_am_i: Get current authenticated user
 * - create_post: Submit a new post
 * - create_post_optimized: Optimized post creation
 * - post_comment: Comment on a post
 * - reply_to_post: Quick reply to a post
 *
 * @module tools/authenticated-tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { RedditClient } from '../clients/reddit-client';
import {
  registerTool,
  ToolSchemas,
  formatToolResponse,
  requireAuth
} from '../utils/tool-registry-helper';
import { logger } from '../utils/logger';

export function registerAuthenticatedTools(server: Server, client: RedditClient): void {
  logger.info('Registering authenticated tools');

  // 1. Who Am I
  registerTool(server, {
    name: 'who_am_i',
    description: 'Get information about the currently authenticated Reddit user. Returns username, karma, account age, and other profile details. Requires authentication.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Tenant ID for authentication (required)'
        }
      },
      required: ['tenantId']
    },
    handler: async (params: { tenantId: string }) => {
      requireAuth(params.tenantId);

      const user = await client.getCurrentUser(params.tenantId);

      // Calculate account age
      const createdDate = new Date(user.created_utc * 1000);
      const now = new Date();
      const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const ageInYears = (ageInDays / 365).toFixed(1);

      return formatToolResponse({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          link_karma: user.link_karma,
          comment_karma: user.comment_karma,
          total_karma: user.total_karma || (user.link_karma + user.comment_karma),
          created_utc: user.created_utc,
          created_date: createdDate.toISOString(),
          account_age_days: ageInDays,
          account_age_years: parseFloat(ageInYears),
          is_gold: user.is_gold || false,
          is_mod: user.is_mod || false,
          is_employee: user.is_employee || false,
          verified: user.verified || false,
          has_verified_email: user.has_verified_email || false,
          icon_img: user.icon_img,
          profile_url: `https://reddit.com/user/${user.name}`
        }
      }, {
        username: user.name,
        karma: user.total_karma || (user.link_karma + user.comment_karma)
      });
    }
  });

  // 2. Create Post
  registerTool(server, {
    name: 'create_post',
    description: 'Submit a new post to a subreddit. Supports text posts (self), link posts, image posts, and video posts. Requires authentication and appropriate subreddit permissions.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Tenant ID for authentication (required)'
        },
        subreddit: ToolSchemas.subreddit,
        kind: {
          ...ToolSchemas.postType,
          description: 'Type of post: "self" (text), "link" (URL), "image", or "video"'
        },
        title: ToolSchemas.title,
        text: {
          ...ToolSchemas.text,
          description: 'Post text/body (required for self posts, optional for others as a comment)'
        },
        url: {
          ...ToolSchemas.url,
          description: 'URL for link/image/video posts (required for non-self posts)'
        },
        nsfw: ToolSchemas.nsfw,
        spoiler: ToolSchemas.spoiler,
        send_replies: {
          type: 'boolean',
          description: 'Send reply notifications to inbox',
          default: true
        }
      },
      required: ['tenantId', 'subreddit', 'kind', 'title']
    },
    handler: async (params: {
      tenantId: string;
      subreddit: string;
      kind: 'self' | 'link' | 'image' | 'video';
      title: string;
      text?: string;
      url?: string;
      nsfw?: boolean;
      spoiler?: boolean;
      send_replies?: boolean;
    }) => {
      requireAuth(params.tenantId);

      // Validate parameters based on post kind
      if (params.kind === 'self' && !params.text) {
        throw new Error('Text is required for self posts');
      }

      if ((params.kind === 'link' || params.kind === 'image' || params.kind === 'video') && !params.url) {
        throw new Error(`URL is required for ${params.kind} posts`);
      }

      // Submit the post
      const response = await client.submitPost(params.tenantId, {
        sr: params.subreddit,
        kind: params.kind,
        title: params.title,
        text: params.text,
        url: params.url,
        nsfw: params.nsfw || false,
        spoiler: params.spoiler || false
      });

      const postData = response.json.data;

      return formatToolResponse({
        success: true,
        post: {
          id: postData.id,
          name: postData.name,
          url: postData.url,
          permalink: `https://reddit.com${postData.url}`
        }
      }, {
        subreddit: params.subreddit,
        post_type: params.kind,
        created_at: new Date().toISOString()
      });
    }
  });

  // 3. Create Post Optimized
  registerTool(server, {
    name: 'create_post_optimized',
    description: 'Optimized version of create_post for quick text post creation. Simplified parameters for common use case of submitting text posts. Requires authentication.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Tenant ID for authentication (required)'
        },
        subreddit: ToolSchemas.subreddit,
        title: ToolSchemas.title,
        body: {
          type: 'string',
          description: 'Post body/content',
          minLength: 0,
          maxLength: 40000
        },
        nsfw: ToolSchemas.nsfw,
        spoiler: ToolSchemas.spoiler
      },
      required: ['tenantId', 'subreddit', 'title', 'body']
    },
    handler: async (params: {
      tenantId: string;
      subreddit: string;
      title: string;
      body: string;
      nsfw?: boolean;
      spoiler?: boolean;
    }) => {
      requireAuth(params.tenantId);

      // Submit as self post
      const response = await client.submitPost(params.tenantId, {
        sr: params.subreddit,
        kind: 'self',
        title: params.title,
        text: params.body,
        nsfw: params.nsfw || false,
        spoiler: params.spoiler || false
      });

      const postData = response.json.data;

      return formatToolResponse({
        success: true,
        post: {
          id: postData.id,
          name: postData.name,
          url: postData.url,
          permalink: `https://reddit.com${postData.url}`,
          subreddit: params.subreddit,
          title: params.title
        }
      }, {
        subreddit: params.subreddit,
        post_type: 'self',
        created_at: new Date().toISOString()
      });
    }
  });

  // 4. Post Comment
  registerTool(server, {
    name: 'post_comment',
    description: 'Post a comment on a post or reply to an existing comment. Requires the thing_id (fullname) of the parent post or comment. Requires authentication.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Tenant ID for authentication (required)'
        },
        thing_id: {
          ...ToolSchemas.thingId,
          description: 'Parent thing ID (t3_xxx for post, t1_xxx for comment)'
        },
        text: {
          ...ToolSchemas.comment,
          description: 'Comment text (supports Markdown formatting)'
        }
      },
      required: ['tenantId', 'thing_id', 'text']
    },
    handler: async (params: {
      tenantId: string;
      thing_id: string;
      text: string;
    }) => {
      requireAuth(params.tenantId);

      // Validate thing_id format
      if (!params.thing_id.match(/^t[0-9]_[a-z0-9]+$/)) {
        throw new Error('Invalid thing_id format. Expected t3_xxx (post) or t1_xxx (comment)');
      }

      // Submit the comment
      const response = await client.submitComment(params.tenantId, {
        thing_id: params.thing_id,
        text: params.text
      });

      const commentData = response.json.data.things[0]?.data;

      if (!commentData) {
        throw new Error('Failed to create comment');
      }

      return formatToolResponse({
        success: true,
        comment: {
          id: commentData.id,
          name: commentData.name,
          body: commentData.body,
          permalink: `https://reddit.com${commentData.permalink}`,
          parent_id: params.thing_id,
          author: commentData.author,
          created_utc: commentData.created_utc
        }
      }, {
        parent_id: params.thing_id,
        comment_type: params.thing_id.startsWith('t3_') ? 'top_level' : 'reply',
        created_at: new Date().toISOString()
      });
    }
  });

  // 5. Reply to Post
  registerTool(server, {
    name: 'reply_to_post',
    description: 'Quick shortcut to reply to a post. Simplified version of post_comment specifically for replying to posts (not comments). Only requires subreddit and post_id instead of thing_id. Requires authentication.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Tenant ID for authentication (required)'
        },
        subreddit: ToolSchemas.subreddit,
        post_id: ToolSchemas.postId,
        text: {
          ...ToolSchemas.comment,
          description: 'Comment text (supports Markdown formatting)'
        }
      },
      required: ['tenantId', 'subreddit', 'post_id', 'text']
    },
    handler: async (params: {
      tenantId: string;
      subreddit: string;
      post_id: string;
      text: string;
    }) => {
      requireAuth(params.tenantId);

      // Construct thing_id from post_id
      const thing_id = `t3_${params.post_id}`;

      // Submit the comment
      const response = await client.submitComment(params.tenantId, {
        thing_id,
        text: params.text
      });

      const commentData = response.json.data.things[0]?.data;

      if (!commentData) {
        throw new Error('Failed to create comment');
      }

      return formatToolResponse({
        success: true,
        comment: {
          id: commentData.id,
          name: commentData.name,
          body: commentData.body,
          permalink: `https://reddit.com${commentData.permalink}`,
          post_id: params.post_id,
          subreddit: params.subreddit,
          author: commentData.author,
          created_utc: commentData.created_utc
        }
      }, {
        subreddit: params.subreddit,
        post_id: params.post_id,
        comment_type: 'top_level_reply',
        created_at: new Date().toISOString()
      });
    }
  });

  logger.info('Authenticated tools registered successfully', { count: 5 });
}
