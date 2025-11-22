/**
 * User Operation Tools
 * Profile, follow, followers, mutual connections, demographics
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const USER_TOOLS: Tool[] = [
  {
    name: 'get_user_profile',
    description: 'Get user profile information including bio, followers, location',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID or username' }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'follow_user',
    description: 'Follow a Twitter user',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID to follow' }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'unfollow_user',
    description: 'Unfollow a Twitter user',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID to unfollow' }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'get_followers',
    description: 'Get list of followers for a user',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID' },
        maxResults: { type: 'number', description: 'Max results', minimum: 10, maximum: 1000 }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'get_following',
    description: 'Get list of users that a user is following',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID' },
        maxResults: { type: 'number', description: 'Max results', minimum: 10, maximum: 1000 }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'get_user_timeline',
    description: 'Get tweets from a specific user\'s timeline',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID' },
        maxResults: { type: 'number', description: 'Max tweets', minimum: 5, maximum: 100 }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'find_mutual_connections',
    description: 'Find mutual followers between two users (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId1: { type: 'string', description: 'First user ID' },
        userId2: { type: 'string', description: 'Second user ID' }
      },
      required: ['tenantId', 'userId1', 'userId2']
    }
  },
  {
    name: 'analyze_follower_demographics',
    description: 'Analyze follower demographics (location, activity, etc.) - requires SocialData API',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID' }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'bulk_user_profiles',
    description: 'Get multiple user profiles at once (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userIds: {
          type: 'array',
          description: 'Array of user IDs',
          items: { type: 'string' },
          maxItems: 100
        }
      },
      required: ['tenantId', 'userIds']
    }
  },
  {
    name: 'user_growth_analytics',
    description: 'Track user growth over time (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID' },
        period: { type: 'string', enum: ['7d', '30d', '90d'], description: 'Analysis period' }
      },
      required: ['tenantId', 'userId']
    }
  }
];

/**
 * User tool handlers
 */
export class UserToolHandlers {
  constructor(private client: TwitterClient) {}

  async getUserProfile(args: any): Promise<any> {
    const { tenantId, userId } = args;

    // If username provided, use by/username endpoint
    const endpoint = userId.match(/^\d+$/)
      ? `/users/${userId}`
      : `/users/by/username/${userId}`;

    return await this.client.request(
      'GET',
      endpoint,
      tenantId,
      undefined,
      {
        'user.fields': 'created_at,description,location,public_metrics,verified'
      }
    );
  }

  async followUser(args: any): Promise<any> {
    const { tenantId, userId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'POST',
      `/users/${myUserId}/following`,
      tenantId,
      { target_user_id: userId }
    );
  }

  async unfollowUser(args: any): Promise<any> {
    const { tenantId, userId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'DELETE',
      `/users/${myUserId}/following/${userId}`,
      tenantId
    );
  }

  async getFollowers(args: any): Promise<any> {
    const { tenantId, userId, maxResults = 100 } = args;

    return await this.client.request(
      'GET',
      `/users/${userId}/followers`,
      tenantId,
      undefined,
      {
        max_results: maxResults,
        'user.fields': 'public_metrics,verified'
      }
    );
  }

  async getFollowing(args: any): Promise<any> {
    const { tenantId, userId, maxResults = 100 } = args;

    return await this.client.request(
      'GET',
      `/users/${userId}/following`,
      tenantId,
      undefined,
      {
        max_results: maxResults,
        'user.fields': 'public_metrics,verified'
      }
    );
  }

  async getUserTimeline(args: any): Promise<any> {
    const { tenantId, userId, maxResults = 10 } = args;

    return await this.client.request(
      'GET',
      `/users/${userId}/tweets`,
      tenantId,
      undefined,
      {
        max_results: maxResults,
        'tweet.fields': 'created_at,public_metrics'
      }
    );
  }

  async findMutualConnections(args: any): Promise<any> {
    const { tenantId, userId1, userId2 } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/mutual-connections',
      {
        user_id_1: userId1,
        user_id_2: userId2
      }
    );
  }

  async analyzeFollowerDemographics(args: any): Promise<any> {
    const { tenantId, userId } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/follower-demographics',
      { user_id: userId }
    );
  }

  async bulkUserProfiles(args: any): Promise<any> {
    const { tenantId, userIds } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/bulk-users',
      { user_ids: userIds }
    );
  }

  async userGrowthAnalytics(args: any): Promise<any> {
    const { tenantId, userId, period = '30d' } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/user-growth',
      {
        user_id: userId,
        period
      }
    );
  }
}
