/**
 * Engagement Tools - CORRECTED VERSION
 * Schemas match actual source code from reference repositories
 * NO tenantId in schemas (handled by auth context)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const ENGAGEMENT_TOOLS: Tool[] = [
  {
    name: 'like_tweet',
    description: 'Like a tweet',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Tweet ID to like'
        }
      },
      required: ['id']
    }
  },

  {
    name: 'unlike_tweet',
    description: 'Unlike a previously liked tweet',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Tweet ID to unlike'
        }
      },
      required: ['id']
    }
  },

  {
    name: 'retweet',
    description: 'Retweet a tweet to your followers',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Tweet ID to retweet'
        }
      },
      required: ['id']
    }
  },

  // Missing from original implementation!
  {
    name: 'undo_retweet',
    description: 'Remove a retweet (unretweet)',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Tweet ID to unretweet'
        }
      },
      required: ['id']
    }
  },

  {
    name: 'get_retweets',
    description: 'Get users who retweeted a specific tweet',
    inputSchema: {
      type: 'object',
      properties: {
        tweetId: {
          type: 'string',
          description: 'Tweet ID'
        },
        maxResults: {
          type: 'number',
          description: 'Max results (default: 10, max: 100)',
          minimum: 1,
          maximum: 100
        }
      },
      required: ['tweetId']
    }
  },

  // From mcp-twitter-server
  {
    name: 'get_liked_tweets',
    description: 'Get tweets liked by a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The ID of the user whose likes to fetch'
        },
        maxResults: {
          type: 'number',
          description: 'The maximum number of results to return (default: 100, max: 100)',
          minimum: 1,
          maximum: 100
        },
        tweetFields: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['created_at', 'author_id', 'conversation_id', 'public_metrics', 'entities', 'context_annotations']
          },
          description: 'Additional tweet fields to include in the response'
        }
      },
      required: ['userId']
    }
  }
];

/**
 * Engagement tool handlers - CORRECTED
 * tenantId now passed as separate parameter (auth context)
 */
export class EngagementToolHandlers {
  constructor(private client: TwitterClient) {}

  async likeTweet(args: any, tenantId: string): Promise<any> {
    const { id } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'POST',
      `/users/${userId}/likes`,
      tenantId,
      { tweet_id: id }
    );
  }

  async unlikeTweet(args: any, tenantId: string): Promise<any> {
    const { id } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'DELETE',
      `/users/${userId}/likes/${id}`,
      tenantId
    );
  }

  async retweet(args: any, tenantId: string): Promise<any> {
    const { id } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'POST',
      `/users/${userId}/retweets`,
      tenantId,
      { tweet_id: id }
    );
  }

  async undoRetweet(args: any, tenantId: string): Promise<any> {
    const { id } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'DELETE',
      `/users/${userId}/retweets/${id}`,
      tenantId
    );
  }

  async getRetweets(args: any, tenantId: string): Promise<any> {
    const { tweetId, maxResults = 10 } = args;

    return await this.client.request(
      'GET',
      `/tweets/${tweetId}/retweeted_by`,
      tenantId,
      undefined,
      { max_results: maxResults }
    );
  }

  async getLikedTweets(args: any, tenantId: string): Promise<any> {
    const { userId, maxResults = 100, tweetFields } = args;

    const params: any = {
      max_results: maxResults
    };

    if (tweetFields && tweetFields.length > 0) {
      params['tweet.fields'] = tweetFields.join(',');
    }

    return await this.client.request(
      'GET',
      `/users/${userId}/liked_tweets`,
      tenantId,
      undefined,
      params
    );
  }
}
