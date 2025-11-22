/**
 * List Management Tools - CORRECTED VERSION
 * Based on mcp-twitter-server implementation
 * NO tenantId in schemas (handled by auth context)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const LIST_TOOLS: Tool[] = [
  {
    name: 'create_list',
    description: 'Create a new Twitter list (public or private)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the list'
        },
        description: {
          type: 'string',
          description: 'Description of the list'
        },
        private: {
          type: 'boolean',
          description: 'Whether the list is private (default: false)'
        }
      },
      required: ['name']
    }
  },

  {
    name: 'get_user_lists',
    description: 'Get all lists owned by a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User ID to get lists for'
        }
      },
      required: ['userId']
    }
  },

  {
    name: 'add_user_to_list',
    description: 'Add a user to a Twitter list',
    inputSchema: {
      type: 'object',
      properties: {
        listId: {
          type: 'string',
          description: 'List ID'
        },
        userId: {
          type: 'string',
          description: 'User ID to add to the list'
        }
      },
      required: ['listId', 'userId']
    }
  },

  {
    name: 'remove_user_from_list',
    description: 'Remove a user from a Twitter list',
    inputSchema: {
      type: 'object',
      properties: {
        listId: {
          type: 'string',
          description: 'List ID'
        },
        userId: {
          type: 'string',
          description: 'User ID to remove from the list'
        }
      },
      required: ['listId', 'userId']
    }
  },

  {
    name: 'get_list_members',
    description: 'Get all members of a Twitter list',
    inputSchema: {
      type: 'object',
      properties: {
        listId: {
          type: 'string',
          description: 'List ID'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of members to return (default: 100)',
          minimum: 1,
          maximum: 100
        }
      },
      required: ['listId']
    }
  },

  // MISSING from original implementation!
  {
    name: 'delete_list',
    description: 'Delete a Twitter list',
    inputSchema: {
      type: 'object',
      properties: {
        listId: {
          type: 'string',
          description: 'List ID to delete'
        }
      },
      required: ['listId']
    }
  },

  // MISSING from original implementation!
  {
    name: 'update_list',
    description: 'Update a Twitter list\'s name, description, or privacy settings',
    inputSchema: {
      type: 'object',
      properties: {
        listId: {
          type: 'string',
          description: 'List ID to update'
        },
        name: {
          type: 'string',
          description: 'New name for the list'
        },
        description: {
          type: 'string',
          description: 'New description for the list'
        },
        private: {
          type: 'boolean',
          description: 'Whether the list should be private'
        }
      },
      required: ['listId']
    }
  }
];

/**
 * List tool handlers
 */
export class ListToolHandlers {
  constructor(private client: TwitterClient) {}

  async createList(args: any, tenantId: string): Promise<any> {
    const { name, description, private: isPrivate = false } = args;

    return await this.client.request(
      'POST',
      '/lists',
      tenantId,
      {
        name,
        description,
        private: isPrivate
      }
    );
  }

  async getUserLists(args: any, tenantId: string): Promise<any> {
    const { userId } = args;

    return await this.client.request(
      'GET',
      `/users/${userId}/owned_lists`,
      tenantId
    );
  }

  async addUserToList(args: any, tenantId: string): Promise<any> {
    const { listId, userId } = args;

    return await this.client.request(
      'POST',
      `/lists/${listId}/members`,
      tenantId,
      { user_id: userId }
    );
  }

  async removeUserFromList(args: any, tenantId: string): Promise<any> {
    const { listId, userId } = args;

    return await this.client.request(
      'DELETE',
      `/lists/${listId}/members/${userId}`,
      tenantId
    );
  }

  async getListMembers(args: any, tenantId: string): Promise<any> {
    const { listId, maxResults = 100 } = args;

    return await this.client.request(
      'GET',
      `/lists/${listId}/members`,
      tenantId,
      undefined,
      {
        max_results: maxResults,
        'user.fields': 'public_metrics,verified'
      }
    );
  }

  async deleteList(args: any, tenantId: string): Promise<any> {
    const { listId } = args;

    return await this.client.request(
      'DELETE',
      `/lists/${listId}`,
      tenantId
    );
  }

  async updateList(args: any, tenantId: string): Promise<any> {
    const { listId, name, description, private: isPrivate } = args;

    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (isPrivate !== undefined) payload.private = isPrivate;

    return await this.client.request(
      'PUT',
      `/lists/${listId}`,
      tenantId,
      payload
    );
  }
}
