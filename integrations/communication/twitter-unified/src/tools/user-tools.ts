/**
 * User Operation Tools - CORRECTED VERSION
 * Schemas match actual source code from reference repositories
 * NO tenantId in schemas (handled by auth context)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const USER_TOOLS: Tool[] = [
  // Based on agent-twitter-client-mcp
  {
    name: 'get_user_profile',
    description: 'Get a user\'s profile information including bio, followers, location, and verification status',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Twitter username (without @)'
        }
      },
      required: ['username']
    }
  },

  // From mcp-twitter-server - MISSING from original!
  {
    name: 'get_user_info',
    description: 'Get information about a Twitter user by username',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'The username of the user'
        }
      },
      required: ['username']
    }
  },

  // From mcp-twitter-server - MISSING from original!
  {
    name: 'get_authenticated_user',
    description: 'Get the authenticated user\'s own profile information without needing to specify username or ID',
    inputSchema: {
      type: 'object',
      properties: {
        userFields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional user fields to include (e.g., ["id", "username", "name", "description", "public_metrics", "verified", "profile_image_url", "created_at"])'
        }
      },
      required: []
    }
  },

  // Based on agent-twitter-client-mcp
  {
    name: 'follow_user',
    description: 'Follow a Twitter user',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username of the user to follow'
        }
      },
      required: ['username']
    }
  },

  {
    name: 'unfollow_user',
    description: 'Unfollow a Twitter user',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username of the user to unfollow'
        }
      },
      required: ['username']
    }
  },

  // Based on agent-twitter-client-mcp
  {
    name: 'get_followers',
    description: 'Get a user\'s followers list',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User ID to get followers for'
        },
        count: {
          type: 'number',
          description: 'Number of followers to fetch (default: 100)',
          minimum: 1,
          maximum: 1000
        }
      },
      required: ['userId']
    }
  },

  // Based on agent-twitter-client-mcp
  {
    name: 'get_following',
    description: 'Get a list of users that a user is following',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User ID to get following list for'
        },
        count: {
          type: 'number',
          description: 'Number of users to fetch (default: 100)',
          minimum: 1,
          maximum: 1000
        }
      },
      required: ['userId']
    }
  }
];

/**
 * User tool handlers - CORRECTED
 * tenantId now passed as separate parameter (auth context)
 */
export class UserToolHandlers {
  constructor(private client: TwitterClient) {}

  async getUserProfile(args: any, tenantId: string): Promise<any> {
    const { username } = args;

    return await this.client.request(
      'GET',
      `/users/by/username/${username}`,
      tenantId,
      undefined,
      {
        'user.fields': 'created_at,description,location,public_metrics,verified,profile_image_url'
      }
    );
  }

  async getUserInfo(args: any, tenantId: string): Promise<any> {
    const { username } = args;

    return await this.client.request(
      'GET',
      `/users/by/username/${username}`,
      tenantId,
      undefined,
      {
        'user.fields': 'id,username,name,description,public_metrics,verified,profile_image_url,created_at'
      }
    );
  }

  async getAuthenticatedUser(args: any, tenantId: string): Promise<any> {
    const { userFields } = args;

    const params: any = {};

    if (userFields && userFields.length > 0) {
      params['user.fields'] = userFields.join(',');
    } else {
      params['user.fields'] = 'id,username,name,description,public_metrics,verified,profile_image_url,created_at';
    }

    return await this.client.request(
      'GET',
      '/users/me',
      tenantId,
      undefined,
      params
    );
  }

  async followUser(args: any, tenantId: string): Promise<any> {
    const { username } = args;

    // Look up user ID from username
    const user = await this.client.request(
      'GET',
      `/users/by/username/${username}`,
      tenantId
    );
    const targetUserId = user.data.id;

    // Get authenticated user ID
    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'POST',
      `/users/${myUserId}/following`,
      tenantId,
      { target_user_id: targetUserId }
    );
  }

  async unfollowUser(args: any, tenantId: string): Promise<any> {
    const { username } = args;

    // Look up user ID from username
    const user = await this.client.request(
      'GET',
      `/users/by/username/${username}`,
      tenantId
    );
    const targetUserId = user.data.id;

    // Get authenticated user ID
    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'DELETE',
      `/users/${myUserId}/following/${targetUserId}`,
      tenantId
    );
  }

  async getFollowers(args: any, tenantId: string): Promise<any> {
    const { userId, count = 100 } = args;

    return await this.client.request(
      'GET',
      `/users/${userId}/followers`,
      tenantId,
      undefined,
      {
        max_results: count,
        'user.fields': 'public_metrics,verified,description'
      }
    );
  }

  async getFollowing(args: any, tenantId: string): Promise<any> {
    const { userId, count = 100 } = args;

    return await this.client.request(
      'GET',
      `/users/${userId}/following`,
      tenantId,
      undefined,
      {
        max_results: count,
        'user.fields': 'public_metrics,verified,description'
      }
    );
  }
}
