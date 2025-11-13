/**
 * Reddit Unified MCP - Browse Tools
 *
 * Tools for browsing Reddit content:
 * - Frontpage browsing
 * - Subreddit browsing (hot, new, top, rising, controversial)
 * - Popular posts
 * - Trending subreddits
 *
 * @module tools/browse-tools
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

export function registerBrowseTools(server: Server, client: RedditClient): void {
  logger.info('Registering browse tools');

  // 1. Browse Frontpage
  registerTool(server, {
    name: 'browse_frontpage',
    description: 'Browse the Reddit frontpage (personalized feed if authenticated, or r/popular if not). Returns hot posts from subscribed subreddits (if authenticated) or popular posts across Reddit.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { ...ToolSchemas.tenantId, description: 'Optional tenant ID for personalized feed' },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: []
    },
    handler: async (params: { tenantId?: string; limit?: number; after?: string }) => {
      const listing = await client.getFrontpage(params.tenantId || null, {
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        posts: parsed.items,
        pagination: parsed.pagination
      }, {
        source: params.tenantId ? 'personalized_frontpage' : 'popular',
        count: parsed.items.length
      });
    }
  });

  // 2. Browse Subreddit (Hot)
  registerTool(server, {
    name: 'browse_subreddit',
    description: 'Browse hot posts from a specific subreddit. Returns the most popular and trending posts currently in the subreddit.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: ToolSchemas.subreddit,
        tenantId: { ...ToolSchemas.tenantId, description: 'Optional tenant ID for authentication' },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: ['subreddit']
    },
    handler: async (params: { subreddit: string; tenantId?: string; limit?: number; after?: string }) => {
      const listing = await client.getSubredditPosts(params.tenantId || null, params.subreddit, {
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        subreddit: params.subreddit,
        posts: parsed.items,
        pagination: parsed.pagination
      }, {
        sort: 'hot',
        count: parsed.items.length
      });
    }
  });

  // 3. Browse Subreddit New
  registerTool(server, {
    name: 'browse_subreddit_new',
    description: 'Browse newest posts from a specific subreddit. Returns posts sorted by submission time (most recent first).',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: ToolSchemas.subreddit,
        tenantId: { ...ToolSchemas.tenantId, description: 'Optional tenant ID for authentication' },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: ['subreddit']
    },
    handler: async (params: { subreddit: string; tenantId?: string; limit?: number; after?: string }) => {
      const listing = await client.getSubredditNew(params.tenantId || null, params.subreddit, {
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        subreddit: params.subreddit,
        posts: parsed.items,
        pagination: parsed.pagination
      }, {
        sort: 'new',
        count: parsed.items.length
      });
    }
  });

  // 4. Browse Subreddit Top
  registerTool(server, {
    name: 'browse_subreddit_top',
    description: 'Browse top-rated posts from a specific subreddit within a time period. Returns posts with the highest scores (upvotes minus downvotes).',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: ToolSchemas.subreddit,
        time: ToolSchemas.timeFilter,
        tenantId: { ...ToolSchemas.tenantId, description: 'Optional tenant ID for authentication' },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: ['subreddit']
    },
    handler: async (params: {
      subreddit: string;
      time?: string;
      tenantId?: string;
      limit?: number;
      after?: string;
    }) => {
      const listing = await client.getSubredditTop(params.tenantId || null, params.subreddit, {
        time: params.time || 'day',
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        subreddit: params.subreddit,
        time_filter: params.time || 'day',
        posts: parsed.items,
        pagination: parsed.pagination
      }, {
        sort: 'top',
        count: parsed.items.length
      });
    }
  });

  // 5. Browse Subreddit Rising
  registerTool(server, {
    name: 'browse_subreddit_rising',
    description: 'Browse rising posts from a specific subreddit. Returns posts that are gaining traction quickly (high engagement rate).',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: ToolSchemas.subreddit,
        tenantId: { ...ToolSchemas.tenantId, description: 'Optional tenant ID for authentication' },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: ['subreddit']
    },
    handler: async (params: { subreddit: string; tenantId?: string; limit?: number; after?: string }) => {
      const listing = await client.getSubredditRising(params.tenantId || null, params.subreddit, {
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        subreddit: params.subreddit,
        posts: parsed.items,
        pagination: parsed.pagination
      }, {
        sort: 'rising',
        count: parsed.items.length
      });
    }
  });

  // 6. Browse Subreddit Controversial
  registerTool(server, {
    name: 'browse_subreddit_controversial',
    description: 'Browse controversial posts from a specific subreddit within a time period. Returns posts with similar numbers of upvotes and downvotes (polarizing content).',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: ToolSchemas.subreddit,
        time: ToolSchemas.timeFilter,
        tenantId: { ...ToolSchemas.tenantId, description: 'Optional tenant ID for authentication' },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: ['subreddit']
    },
    handler: async (params: {
      subreddit: string;
      time?: string;
      tenantId?: string;
      limit?: number;
      after?: string;
    }) => {
      const listing = await client.getSubredditControversial(params.tenantId || null, params.subreddit, {
        time: params.time || 'day',
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        subreddit: params.subreddit,
        time_filter: params.time || 'day',
        posts: parsed.items,
        pagination: parsed.pagination
      }, {
        sort: 'controversial',
        count: parsed.items.length
      });
    }
  });

  // 7. Get Trending Subreddits
  registerTool(server, {
    name: 'get_trending_subreddits',
    description: 'Get the list of currently trending subreddits on Reddit. Returns subreddit names that are trending today.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { ...ToolSchemas.tenantId, description: 'Optional tenant ID for authentication' }
      },
      required: []
    },
    handler: async (params: { tenantId?: string }) => {
      const trending = await client.getTrendingSubreddits(params.tenantId || null);

      return formatToolResponse({
        trending_subreddits: trending
      }, {
        count: trending.length,
        date: new Date().toISOString().split('T')[0]
      });
    }
  });

  // 8. Browse Popular
  registerTool(server, {
    name: 'browse_popular',
    description: 'Browse popular posts across all of Reddit (r/popular). Returns the most popular posts site-wide, excluding NSFW content and certain subreddits.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { ...ToolSchemas.tenantId, description: 'Optional tenant ID for authentication' },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: []
    },
    handler: async (params: { tenantId?: string; limit?: number; after?: string }) => {
      const listing = await client.getPopular(params.tenantId || null, {
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        posts: parsed.items,
        pagination: parsed.pagination
      }, {
        source: 'r/popular',
        count: parsed.items.length
      });
    }
  });

  logger.info('Browse tools registered successfully', { count: 8 });
}
