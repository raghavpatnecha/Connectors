/**
 * Moderation Tools
 * Block, mute, report users
 * Based on mcp-twitter-server implementation
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const MODERATION_TOOLS: Tool[] = [
  {
    name: 'block_user',
    description: 'Block a Twitter user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The ID of the user to block'
        }
      },
      required: ['userId']
    }
  },
  {
    name: 'unblock_user',
    description: 'Unblock a previously blocked user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The ID of the user to unblock'
        }
      },
      required: ['userId']
    }
  },
  {
    name: 'mute_user',
    description: 'Mute a Twitter user (hide their tweets from your timeline)',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The ID of the user to mute'
        }
      },
      required: ['userId']
    }
  },
  {
    name: 'unmute_user',
    description: 'Unmute a previously muted user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The ID of the user to unmute'
        }
      },
      required: ['userId']
    }
  },
  {
    name: 'get_blocked_users',
    description: 'Get a list of users you have blocked',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: {
          type: 'number',
          description: 'Maximum number of users to return (default: 100, max: 1000)',
          minimum: 1,
          maximum: 1000
        }
      },
      required: []
    }
  },
  {
    name: 'get_muted_users',
    description: 'Get a list of users you have muted',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: {
          type: 'number',
          description: 'Maximum number of users to return (default: 100, max: 1000)',
          minimum: 1,
          maximum: 1000
        }
      },
      required: []
    }
  }
];

/**
 * Moderation tool handlers
 */
export class ModerationToolHandlers {
  constructor(private client: TwitterClient) {}

  async blockUser(args: any, tenantId: string): Promise<any> {
    const { userId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'POST',
      `/users/${myUserId}/blocking`,
      tenantId,
      { target_user_id: userId }
    );
  }

  async unblockUser(args: any, tenantId: string): Promise<any> {
    const { userId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'DELETE',
      `/users/${myUserId}/blocking/${userId}`,
      tenantId
    );
  }

  async muteUser(args: any, tenantId: string): Promise<any> {
    const { userId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'POST',
      `/users/${myUserId}/muting`,
      tenantId,
      { target_user_id: userId }
    );
  }

  async unmuteUser(args: any, tenantId: string): Promise<any> {
    const { userId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'DELETE',
      `/users/${myUserId}/muting/${userId}`,
      tenantId
    );
  }

  async getBlockedUsers(args: any, tenantId: string): Promise<any> {
    const { maxResults = 100 } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'GET',
      `/users/${myUserId}/blocking`,
      tenantId,
      undefined,
      {
        max_results: maxResults,
        'user.fields': 'description,public_metrics'
      }
    );
  }

  async getMutedUsers(args: any, tenantId: string): Promise<any> {
    const { maxResults = 100 } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const myUserId = me.data.id;

    return await this.client.request(
      'GET',
      `/users/${myUserId}/muting`,
      tenantId,
      undefined,
      {
        max_results: maxResults,
        'user.fields': 'description,public_metrics'
      }
    );
  }
}
