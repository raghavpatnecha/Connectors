/**
 * Tweet Operation Tools
 * Post, reply, delete, search, quote, polls, threads
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const TWEET_TOOLS: Tool[] = [
  {
    name: 'post_tweet',
    description: 'Post a new tweet to Twitter. Supports text, images, and videos. Max 280 characters.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        text: { type: 'string', description: 'Tweet text (max 280 characters)', maxLength: 280 },
        media: {
          type: 'array',
          description: 'Media URLs or file paths (images, videos)',
          items: { type: 'string' }
        }
      },
      required: ['tenantId', 'text']
    }
  },
  {
    name: 'get_tweet_by_id',
    description: 'Retrieve a specific tweet by its ID with full details including metrics',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Tweet ID' },
        expansions: {
          type: 'array',
          description: 'Additional data to include (author_id, referenced_tweets, etc.)',
          items: { type: 'string' }
        }
      },
      required: ['tenantId', 'tweetId']
    }
  },
  {
    name: 'reply_to_tweet',
    description: 'Reply to an existing tweet',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'ID of tweet to reply to' },
        text: { type: 'string', description: 'Reply text', maxLength: 280 }
      },
      required: ['tenantId', 'tweetId', 'text']
    }
  },
  {
    name: 'delete_tweet',
    description: 'Delete one of your tweets',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'ID of tweet to delete' }
      },
      required: ['tenantId', 'tweetId']
    }
  },
  {
    name: 'search_tweets',
    description: 'Search Twitter for tweets matching a query with filters and sorting',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        query: { type: 'string', description: 'Search query' },
        maxResults: { type: 'number', description: 'Max results (10-100)', minimum: 10, maximum: 100 },
        sortOrder: { type: 'string', enum: ['recency', 'relevancy'], description: 'Sort order' }
      },
      required: ['tenantId', 'query']
    }
  },
  {
    name: 'quote_tweet',
    description: 'Quote tweet with your own commentary',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'ID of tweet to quote' },
        text: { type: 'string', description: 'Your commentary', maxLength: 280 }
      },
      required: ['tenantId', 'tweetId', 'text']
    }
  },
  {
    name: 'send_tweet_with_poll',
    description: 'Post a tweet with a poll. Supports 2-4 options with configurable duration.',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        text: { type: 'string', description: 'Tweet text', maxLength: 280 },
        options: {
          type: 'array',
          description: 'Poll options (2-4)',
          items: { type: 'string' },
          minItems: 2,
          maxItems: 4
        },
        durationMinutes: {
          type: 'number',
          description: 'Poll duration in minutes (5-10080)',
          minimum: 5,
          maximum: 10080
        }
      },
      required: ['tenantId', 'text', 'options']
    }
  },
  {
    name: 'get_timeline',
    description: 'Get your home timeline (personalized feed)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        maxResults: { type: 'number', description: 'Max tweets (10-100)', minimum: 10, maximum: 100 }
      },
      required: ['tenantId']
    }
  },
  {
    name: 'get_user_tweets',
    description: 'Get tweets from a specific user',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID or username' },
        maxResults: { type: 'number', description: 'Max tweets', minimum: 5, maximum: 100 }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'get_full_thread',
    description: 'Get entire tweet thread (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Tweet ID' }
      },
      required: ['tenantId', 'tweetId']
    }
  }
];

/**
 * Tweet tool handlers
 */
export class TweetToolHandlers {
  constructor(private client: TwitterClient) {}

  async postTweet(args: any): Promise<any> {
    const { tenantId, text, media } = args;

    const payload: any = { text };
    if (media && media.length > 0) {
      payload.media = { media_ids: media };
    }

    return await this.client.request(
      'POST',
      '/tweets',
      tenantId,
      payload
    );
  }

  async getTweetById(args: any): Promise<any> {
    const { tenantId, tweetId, expansions } = args;

    const params: any = {
      'tweet.fields': 'created_at,public_metrics,author_id'
    };

    if (expansions && expansions.length > 0) {
      params.expansions = expansions.join(',');
    }

    return await this.client.request(
      'GET',
      `/tweets/${tweetId}`,
      tenantId,
      undefined,
      params
    );
  }

  async replyToTweet(args: any): Promise<any> {
    const { tenantId, tweetId, text } = args;

    return await this.client.request(
      'POST',
      '/tweets',
      tenantId,
      {
        text,
        reply: {
          in_reply_to_tweet_id: tweetId
        }
      }
    );
  }

  async deleteTweet(args: any): Promise<any> {
    const { tenantId, tweetId } = args;

    return await this.client.request(
      'DELETE',
      `/tweets/${tweetId}`,
      tenantId
    );
  }

  async searchTweets(args: any): Promise<any> {
    const { tenantId, query, maxResults = 10, sortOrder = 'recency' } = args;

    return await this.client.request(
      'GET',
      '/tweets/search/recent',
      tenantId,
      undefined,
      {
        query,
        max_results: maxResults,
        sort_order: sortOrder,
        'tweet.fields': 'created_at,public_metrics,author_id'
      }
    );
  }

  async quoteTweet(args: any): Promise<any> {
    const { tenantId, tweetId, text } = args;

    return await this.client.request(
      'POST',
      '/tweets',
      tenantId,
      {
        text,
        quote_tweet_id: tweetId
      }
    );
  }

  async sendTweetWithPoll(args: any): Promise<any> {
    const { tenantId, text, options, durationMinutes = 1440 } = args;

    return await this.client.request(
      'POST',
      '/tweets',
      tenantId,
      {
        text,
        poll: {
          options,
          duration_minutes: durationMinutes
        }
      }
    );
  }

  async getTimeline(args: any): Promise<any> {
    const { tenantId, maxResults = 10 } = args;

    // Get authenticated user ID first
    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'GET',
      `/users/${userId}/timelines/reverse_chronological`,
      tenantId,
      undefined,
      {
        max_results: maxResults,
        'tweet.fields': 'created_at,public_metrics'
      }
    );
  }

  async getUserTweets(args: any): Promise<any> {
    const { tenantId, userId, maxResults = 10 } = args;

    // If username provided, look up user ID
    let actualUserId = userId;
    if (!userId.match(/^\d+$/)) {
      const user = await this.client.request(
        'GET',
        `/users/by/username/${userId}`,
        tenantId
      );
      actualUserId = user.data.id;
    }

    return await this.client.request(
      'GET',
      `/users/${actualUserId}/tweets`,
      tenantId,
      undefined,
      {
        max_results: maxResults,
        'tweet.fields': 'created_at,public_metrics'
      }
    );
  }

  async getFullThread(args: any): Promise<any> {
    const { tenantId, tweetId } = args;

    // Use SocialData API for thread retrieval
    return await this.client.socialDataRequest(
      'POST',
      '/twitter/thread',
      { tweet_id: tweetId }
    );
  }
}
