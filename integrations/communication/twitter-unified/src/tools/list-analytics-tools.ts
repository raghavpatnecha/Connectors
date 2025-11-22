/**
 * List Management and Analytics Tools
 * Lists, hashtag analytics, sentiment analysis, trending topics
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const LIST_ANALYTICS_TOOLS: Tool[] = [
  // List Management Tools
  {
    name: 'create_list',
    description: 'Create a new Twitter list',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        name: { type: 'string', description: 'List name' },
        description: { type: 'string', description: 'List description' },
        private: { type: 'boolean', description: 'Make list private' }
      },
      required: ['tenantId', 'name']
    }
  },
  {
    name: 'get_user_lists',
    description: 'Get all lists owned by a user',
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
    name: 'add_user_to_list',
    description: 'Add a user to a Twitter list',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        listId: { type: 'string', description: 'List ID' },
        userId: { type: 'string', description: 'User ID to add' }
      },
      required: ['tenantId', 'listId', 'userId']
    }
  },
  {
    name: 'remove_user_from_list',
    description: 'Remove a user from a Twitter list',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        listId: { type: 'string', description: 'List ID' },
        userId: { type: 'string', description: 'User ID to remove' }
      },
      required: ['tenantId', 'listId', 'userId']
    }
  },
  {
    name: 'get_list_members',
    description: 'Get all members of a Twitter list',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        listId: { type: 'string', description: 'List ID' },
        maxResults: { type: 'number', description: 'Max results', minimum: 10, maximum: 100 }
      },
      required: ['tenantId', 'listId']
    }
  },

  // Analytics and Search Tools
  {
    name: 'get_hashtag_analytics',
    description: 'Get analytics for a specific hashtag',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        hashtag: { type: 'string', description: 'Hashtag (without #)' },
        period: { type: 'string', enum: ['24h', '7d', '30d'], description: 'Analysis period' }
      },
      required: ['tenantId', 'hashtag']
    }
  },
  {
    name: 'advanced_tweet_search',
    description: 'Advanced tweet search with complex filters (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        query: { type: 'string', description: 'Search query' },
        filters: {
          type: 'object',
          description: 'Advanced filters',
          properties: {
            fromDate: { type: 'string', description: 'Start date (ISO 8601)' },
            toDate: { type: 'string', description: 'End date (ISO 8601)' },
            language: { type: 'string', description: 'Language code' },
            verified: { type: 'boolean', description: 'Only verified users' },
            minRetweets: { type: 'number', description: 'Minimum retweets' },
            minLikes: { type: 'number', description: 'Minimum likes' }
          }
        },
        maxResults: { type: 'number', description: 'Max results', maximum: 100 }
      },
      required: ['tenantId', 'query']
    }
  },
  {
    name: 'historical_tweet_search',
    description: 'Search historical tweets (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        query: { type: 'string', description: 'Search query' },
        startDate: { type: 'string', description: 'Start date (ISO 8601)' },
        endDate: { type: 'string', description: 'End date (ISO 8601)' }
      },
      required: ['tenantId', 'query', 'startDate', 'endDate']
    }
  },
  {
    name: 'trending_topics_search',
    description: 'Get trending topics by location (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        woeid: { type: 'number', description: 'Where On Earth ID (1 = worldwide, 23424977 = US)' }
      },
      required: ['tenantId']
    }
  },
  {
    name: 'get_hashtag_trends',
    description: 'Track hashtag trends over time (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        hashtags: {
          type: 'array',
          description: 'Hashtags to track (without #)',
          items: { type: 'string' },
          maxItems: 10
        },
        period: { type: 'string', enum: ['24h', '7d', '30d'], description: 'Tracking period' }
      },
      required: ['tenantId', 'hashtags']
    }
  },
  {
    name: 'analyze_sentiment',
    description: 'Analyze sentiment of tweets (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        query: { type: 'string', description: 'Search query' },
        maxTweets: { type: 'number', description: 'Number of tweets to analyze', maximum: 1000 }
      },
      required: ['tenantId', 'query']
    }
  },
  {
    name: 'get_thread_metrics',
    description: 'Get metrics for entire tweet thread (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Thread root tweet ID' }
      },
      required: ['tenantId', 'tweetId']
    }
  },
  {
    name: 'get_conversation_tree',
    description: 'Get full conversation tree for a tweet (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        tweetId: { type: 'string', description: 'Tweet ID' },
        depth: { type: 'number', description: 'Conversation depth', minimum: 1, maximum: 5 }
      },
      required: ['tenantId', 'tweetId']
    }
  },
  {
    name: 'map_influence_network',
    description: 'Map user influence network (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID' },
        degrees: { type: 'number', description: 'Degrees of separation', minimum: 1, maximum: 3 }
      },
      required: ['tenantId', 'userId']
    }
  },
  {
    name: 'user_influence_metrics',
    description: 'Calculate user influence metrics (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        userId: { type: 'string', description: 'User ID' }
      },
      required: ['tenantId', 'userId']
    }
  }
];

/**
 * List and analytics tool handlers
 */
export class ListAnalyticsToolHandlers {
  constructor(private client: TwitterClient) {}

  // List Management
  async createList(args: any): Promise<any> {
    const { tenantId, name, description, private: isPrivate = false } = args;

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

  async getUserLists(args: any): Promise<any> {
    const { tenantId, userId } = args;

    return await this.client.request(
      'GET',
      `/users/${userId}/owned_lists`,
      tenantId
    );
  }

  async addUserToList(args: any): Promise<any> {
    const { tenantId, listId, userId } = args;

    return await this.client.request(
      'POST',
      `/lists/${listId}/members`,
      tenantId,
      { user_id: userId }
    );
  }

  async removeUserFromList(args: any): Promise<any> {
    const { tenantId, listId, userId } = args;

    return await this.client.request(
      'DELETE',
      `/lists/${listId}/members/${userId}`,
      tenantId
    );
  }

  async getListMembers(args: any): Promise<any> {
    const { tenantId, listId, maxResults = 100 } = args;

    return await this.client.request(
      'GET',
      `/lists/${listId}/members`,
      tenantId,
      undefined,
      { max_results: maxResults }
    );
  }

  // Analytics Tools
  async getHashtagAnalytics(args: any): Promise<any> {
    const { tenantId, hashtag, period = '24h' } = args;

    return await this.client.request(
      'GET',
      '/tweets/search/recent',
      tenantId,
      undefined,
      {
        query: `#${hashtag}`,
        max_results: 100,
        'tweet.fields': 'public_metrics,created_at'
      }
    );
  }

  async advancedTweetSearch(args: any): Promise<any> {
    const { tenantId, query, filters = {}, maxResults = 100 } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/advanced-search',
      {
        query,
        filters,
        max_results: maxResults
      }
    );
  }

  async historicalTweetSearch(args: any): Promise<any> {
    const { tenantId, query, startDate, endDate } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/historical-search',
      {
        query,
        start_date: startDate,
        end_date: endDate
      }
    );
  }

  async trendingTopicsSearch(args: any): Promise<any> {
    const { tenantId, woeid = 1 } = args;

    return await this.client.socialDataRequest(
      'GET',
      `/twitter/trends/${woeid}`,
      undefined
    );
  }

  async getHashtagTrends(args: any): Promise<any> {
    const { tenantId, hashtags, period = '7d' } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/hashtag-trends',
      {
        hashtags,
        period
      }
    );
  }

  async analyzeSentiment(args: any): Promise<any> {
    const { tenantId, query, maxTweets = 100 } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/sentiment',
      {
        query,
        max_tweets: maxTweets
      }
    );
  }

  async getThreadMetrics(args: any): Promise<any> {
    const { tenantId, tweetId } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/thread-metrics',
      { tweet_id: tweetId }
    );
  }

  async getConversationTree(args: any): Promise<any> {
    const { tenantId, tweetId, depth = 3 } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/conversation-tree',
      {
        tweet_id: tweetId,
        depth
      }
    );
  }

  async mapInfluenceNetwork(args: any): Promise<any> {
    const { tenantId, userId, degrees = 2 } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/influence-network',
      {
        user_id: userId,
        degrees
      }
    );
  }

  async userInfluenceMetrics(args: any): Promise<any> {
    const { tenantId, userId } = args;

    return await this.client.socialDataRequest(
      'POST',
      '/twitter/influence-metrics',
      { user_id: userId }
    );
  }
}
