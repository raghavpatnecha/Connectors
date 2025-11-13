/**
 * Reddit Unified MCP - Subreddit Tools
 *
 * Tools for working with subreddits:
 * - Get subreddit info
 * - Get subreddit stats
 *
 * @module tools/subreddit-tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { RedditClient } from '../clients/reddit-client';
import {
  registerTool,
  ToolSchemas,
  formatToolResponse
} from '../utils/tool-registry-helper';
import { logger } from '../utils/logger';

export function registerSubredditTools(server: Server, client: RedditClient): void {
  logger.info('Registering subreddit tools');

  // 1. Get Subreddit Info
  registerTool(server, {
    name: 'get_subreddit_info',
    description: 'Get detailed information about a subreddit. Returns comprehensive subreddit metadata including name, description, subscriber count, rules, and creation date.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: ToolSchemas.subreddit,
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        }
      },
      required: ['subreddit']
    },
    handler: async (params: { subreddit: string; tenantId?: string }) => {
      const response = await client.getSubredditInfo(params.tenantId || null, params.subreddit);

      const subreddit = response.data;

      return formatToolResponse({
        subreddit: {
          id: subreddit.id,
          name: subreddit.display_name,
          title: subreddit.title,
          description: subreddit.description,
          public_description: subreddit.public_description,
          subscribers: subreddit.subscribers,
          active_user_count: subreddit.active_user_count,
          created_utc: subreddit.created_utc,
          created_date: new Date(subreddit.created_utc * 1000).toISOString(),
          over18: subreddit.over18 || false,
          lang: subreddit.lang || 'en',
          subreddit_type: subreddit.subreddit_type || 'public',
          url: `https://reddit.com/r/${subreddit.display_name}`,
          // Additional metadata
          allow_images: subreddit.allow_images,
          allow_videos: subreddit.allow_videos,
          allow_polls: subreddit.allow_polls,
          community_icon: subreddit.community_icon || subreddit.icon_img
        }
      }, {
        display_name: subreddit.display_name,
        subscriber_count: subreddit.subscribers,
        active_users: subreddit.active_user_count
      });
    }
  });

  // 2. Get Subreddit Stats
  registerTool(server, {
    name: 'get_subreddit_stats',
    description: 'Get statistics and metrics for a subreddit. Returns subscriber count, active users, and other engagement metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        subreddit: ToolSchemas.subreddit,
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        }
      },
      required: ['subreddit']
    },
    handler: async (params: { subreddit: string; tenantId?: string }) => {
      const response = await client.getSubredditInfo(params.tenantId || null, params.subreddit);

      const subreddit = response.data;

      // Calculate subreddit age
      const createdDate = new Date(subreddit.created_utc * 1000);
      const now = new Date();
      const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const ageInYears = (ageInDays / 365).toFixed(1);

      // Calculate engagement rate (if active users available)
      const engagementRate = subreddit.active_user_count && subreddit.subscribers
        ? ((subreddit.active_user_count / subreddit.subscribers) * 100).toFixed(2)
        : null;

      return formatToolResponse({
        subreddit: subreddit.display_name,
        statistics: {
          subscribers: subreddit.subscribers,
          active_users: subreddit.active_user_count || 0,
          engagement_rate_percent: engagementRate ? parseFloat(engagementRate) : null,
          created_utc: subreddit.created_utc,
          created_date: createdDate.toISOString(),
          age_days: ageInDays,
          age_years: parseFloat(ageInYears),
          subreddit_type: subreddit.subreddit_type || 'public',
          is_nsfw: subreddit.over18 || false,
          language: subreddit.lang || 'en'
        },
        growth_metrics: {
          subscribers_per_day: subreddit.subscribers && ageInDays > 0
            ? Math.round(subreddit.subscribers / ageInDays)
            : null
        },
        content_policies: {
          allow_images: subreddit.allow_images || false,
          allow_videos: subreddit.allow_videos || false,
          allow_polls: subreddit.allow_polls || false,
          restrict_posting: subreddit.restrict_posting || false,
          restrict_commenting: subreddit.restrict_commenting || false
        }
      }, {
        display_name: subreddit.display_name,
        last_updated: new Date().toISOString()
      });
    }
  });

  logger.info('Subreddit tools registered successfully', { count: 2 });
}
