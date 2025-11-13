/**
 * Reddit Unified MCP - User Tools
 *
 * Tools for working with Reddit users:
 * - Get user info
 * - Get user trophies
 * - Get user karma breakdown
 *
 * @module tools/user-tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { RedditClient } from '../clients/reddit-client';
import {
  registerTool,
  ToolSchemas,
  formatToolResponse
} from '../utils/tool-registry-helper';
import { logger } from '../utils/logger';

export function registerUserTools(server: Server, client: RedditClient): void {
  logger.info('Registering user tools');

  // 1. Get User Info
  registerTool(server, {
    name: 'get_user_info',
    description: 'Get detailed information about a Reddit user. Returns user profile data including karma, account age, premium status, and other public information.',
    inputSchema: {
      type: 'object',
      properties: {
        username: ToolSchemas.username,
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        }
      },
      required: ['username']
    },
    handler: async (params: { username: string; tenantId?: string }) => {
      const response = await client.getUserInfo(params.tenantId || null, params.username);

      const user = response.data;

      // Calculate account age
      const createdDate = new Date(user.created_utc * 1000);
      const now = new Date();
      const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const ageInYears = (ageInDays / 365).toFixed(1);

      return formatToolResponse({
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
        total_karma: user.total_karma || (user.link_karma + user.comment_karma),
        account_age_days: ageInDays
      });
    }
  });

  // 2. Get User Trophies
  registerTool(server, {
    name: 'get_user_trophies',
    description: 'Get trophies and awards earned by a Reddit user. Returns a list of all trophies the user has received (e.g., Verified Email, 5-Year Club, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        username: ToolSchemas.username,
        tenantId: {
          ...ToolSchemas.tenantId,
          description: 'Optional tenant ID for authentication'
        }
      },
      required: ['username']
    },
    handler: async (params: { username: string; tenantId?: string }) => {
      const response = await client.getUserTrophies(params.tenantId || null, params.username);

      const trophies = response.data.trophies || [];

      return formatToolResponse({
        username: params.username,
        trophies: trophies.map((trophy: any) => ({
          id: trophy.data?.id,
          name: trophy.data?.name,
          description: trophy.data?.description,
          icon_40: trophy.data?.icon_40,
          icon_70: trophy.data?.icon_70,
          award_id: trophy.data?.award_id,
          granted_at: trophy.data?.granted_at
        })),
        trophy_count: trophies.length
      }, {
        username: params.username,
        count: trophies.length
      });
    }
  });

  // 3. Get User Karma Breakdown
  registerTool(server, {
    name: 'get_user_karma',
    description: 'Get karma breakdown by subreddit for the authenticated user. Requires authentication. Returns link and comment karma earned in each subreddit.',
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
      const response = await client.getUserKarma(params.tenantId);

      const karmaList = response.data || [];

      // Calculate totals
      const totals = karmaList.reduce(
        (acc, item) => ({
          link_karma: acc.link_karma + (item.link_karma || 0),
          comment_karma: acc.comment_karma + (item.comment_karma || 0)
        }),
        { link_karma: 0, comment_karma: 0 }
      );

      // Sort by total karma (link + comment) descending
      const sortedKarma = karmaList
        .map((item: any) => ({
          subreddit: item.sr,
          link_karma: item.link_karma || 0,
          comment_karma: item.comment_karma || 0,
          total_karma: (item.link_karma || 0) + (item.comment_karma || 0)
        }))
        .sort((a: any, b: any) => b.total_karma - a.total_karma);

      return formatToolResponse({
        karma_by_subreddit: sortedKarma,
        totals: {
          link_karma: totals.link_karma,
          comment_karma: totals.comment_karma,
          total_karma: totals.link_karma + totals.comment_karma
        },
        subreddit_count: sortedKarma.length
      }, {
        total_karma: totals.link_karma + totals.comment_karma,
        subreddit_count: sortedKarma.length
      });
    }
  });

  logger.info('User tools registered successfully', { count: 3 });
}
