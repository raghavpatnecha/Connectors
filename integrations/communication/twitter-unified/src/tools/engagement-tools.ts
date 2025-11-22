/**
 * Engagement Tools
 * Like, retweet, track virality, analytics
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
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Tweet ID to like' }
      },
      required: ['tenantId', 'tweetId']
    }
  },
  {
    name: 'unlike_tweet',
    description: 'Unlike a previously liked tweet',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Tweet ID to unlike' }
      },
      required: ['tenantId', 'tweetId']
    }
  },
  {
    name: 'retweet',
    description: 'Retweet a tweet',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Tweet ID to retweet' }
      },
      required: ['tenantId', 'tweetId']
    }
  },
  {
    name: 'undo_retweet',
    description: 'Remove a retweet',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Tweet ID to unretweet' }
      },
      required: ['tenantId', 'tweetId']
    }
  },
  {
    name: 'get_retweets',
    description: 'Get users who retweeted a specific tweet',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Tweet ID' },
        maxResults: { type: 'number', description: 'Max results', minimum: 10, maximum: 100 }
      },
      required: ['tenantId', 'tweetId']
    }
  },
  {
    name: 'get_liked_tweets',
    description: 'Get tweets liked by a user',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID' },
        maxResults: { type: 'number', description: 'Max results', minimum: 5, maximum: 100 }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'track_virality',
    description: 'Track tweet virality metrics over time (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Tweet ID' },
        interval: { type: 'string', enum: ['hourly', 'daily'], description: 'Tracking interval' }
      },
      required: ['tenantId', 'tweetId']
    }
  }
];

/**
 * Engagement tool handlers
 */
export class EngagementToolHandlers {
  constructor(private client: TwitterClient) {}

  async likeTweet(args: any): Promise<any> {
    const { tenantId, tweetId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'POST',
      `/users/${userId}/likes`,
      tenantId,
      { tweet_id: tweetId }
    );
  }

  async unlikeTweet(args: any): Promise<any> {
    const { tenantId, tweetId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'DELETE',
      `/users/${userId}/likes/${tweetId}`,
      tenantId
    );
  }

  async retweet(args: any): Promise<any> {
    const { tenantId, tweetId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'POST',
      `/users/${userId}/retweets`,
      tenantId,
      { tweet_id: tweetId }
    );
  }

  async undoRetweet(args: any): Promise<any> {
    const { tenantId, tweetId } = args;

    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'DELETE',
      `/users/${userId}/retweets/${tweetId}`,
      tenantId
    );
  }

  async getRetweets(args: any): Promise<any> {
    const { tenantId, tweetId, maxResults = 10 } = args;

    return await this.client.request(
      'GET',
      `/tweets/${tweetId}/retweeted_by`,
      tenantId,
      undefined,
      { max_results: maxResults }
    );
  }

  async getLikedTweets(args: any): Promise<any> {
    const { tenantId, userId, maxResults = 10 } = args;

    return await this.client.request(
      'GET',
      `/users/${userId}/liked_tweets`,
      tenantId,
      undefined,
      {
        max_results: maxResults,
        'tweet.fields': 'created_at,public_metrics'
      }
    );
  }

  async trackVirality(args: any): Promise<any> {
    const { tenantId, tweetId, interval = 'hourly' } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/virality',
      {
        tweet_id: tweetId,
        interval
      }
    );
  }
}
