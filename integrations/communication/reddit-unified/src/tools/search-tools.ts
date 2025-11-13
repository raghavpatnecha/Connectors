/**
 * Reddit Unified MCP - Search Tools
 *
 * Tools for searching Reddit:
 * - Search posts
 * - Search subreddits
 *
 * @module tools/search-tools
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

export function registerSearchTools(server: Server, client: RedditClient): void {
  logger.info('Registering search tools');

  // 1. Search Posts
  registerTool(server, {
    name: 'search_posts',
    description: 'Search for posts across Reddit or within a specific subreddit. Returns posts matching the search query, with optional filtering by subreddit, sort order, and time period.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (supports Reddit search syntax)',
          minLength: 1
        },
        subreddit: {
          ...ToolSchemas.subreddit,
          description: 'Optional subreddit to search within (omit to search all of Reddit)'
        },
        sort: {
          ...ToolSchemas.sort,
          description: 'Sort order for search results',
          default: 'relevance'
        },
        time: {
          ...ToolSchemas.timeFilter,
          description: 'Time filter for search results (only applies to top/comments sort)',
          default: 'all'
        },
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: ['query']
    },
    handler: async (params: {
      query: string;
      subreddit?: string;
      sort?: string;
      time?: string;
      tenantId?: string;
      limit?: number;
      after?: string;
    }) => {
      const listing = await client.searchPosts(params.tenantId || null, params.query, {
        subreddit: params.subreddit,
        sort: params.sort,
        time: params.time,
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        query: params.query,
        subreddit: params.subreddit || 'all',
        sort: params.sort || 'relevance',
        posts: parsed.items,
        pagination: parsed.pagination
      }, {
        count: parsed.items.length,
        time_filter: params.time || 'all'
      });
    }
  });

  // 2. Search Subreddits
  registerTool(server, {
    name: 'search_subreddits',
    description: 'Search for subreddits by name or description. Returns subreddits matching the search query, ordered by relevance.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (subreddit name or description keywords)',
          minLength: 1
        },
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        },
        limit: ToolSchemas.pagination.limit,
        after: ToolSchemas.pagination.after
      },
      required: ['query']
    },
    handler: async (params: {
      query: string;
      tenantId?: string;
      limit?: number;
      after?: string;
    }) => {
      const listing = await client.searchSubreddits(params.tenantId || null, params.query, {
        limit: params.limit,
        after: params.after
      });

      const parsed = parseRedditListing(listing);

      return formatToolResponse({
        query: params.query,
        subreddits: parsed.items,
        pagination: parsed.pagination
      }, {
        count: parsed.items.length
      });
    }
  });

  logger.info('Search tools registered successfully', { count: 2 });
}
