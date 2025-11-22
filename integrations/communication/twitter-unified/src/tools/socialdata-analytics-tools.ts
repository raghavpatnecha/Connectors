/**
 * SocialData Analytics Tools
 * Based on mcp-twitter-server's socialdata-tools.ts
 * 20 tools for advanced Twitter analytics bypassing API restrictions
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const SOCIALDATA_ANALYTICS_TOOLS: Tool[] = [
  // Advanced Search Tools (6 tools)
  {
    name: 'advanced_tweet_search',
    description: 'Advanced tweet search with operators and filters, bypassing API tier restrictions. Works without Pro tier ($5k/month) requirement.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query with advanced operators (e.g., "AI OR ML -crypto lang:en")'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10, max: 100)',
          minimum: 1,
          maximum: 100
        },
        startTime: {
          type: 'string',
          description: 'Start time for search in ISO 8601 format (e.g., "2024-01-01T00:00:00Z")'
        },
        endTime: {
          type: 'string',
          description: 'End time for search in ISO 8601 format'
        },
        includeRetweets: {
          type: 'boolean',
          description: 'Whether to include retweets in results (default: true)'
        },
        language: {
          type: 'string',
          description: 'Language code to filter tweets (e.g., "en", "es", "fr")'
        }
      },
      required: ['query']
    }
  },

  {
    name: 'historical_tweet_search',
    description: 'Search historical tweets beyond standard API limitations',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string'
        },
        dateRange: {
          type: 'object',
          properties: {
            start: {
              type: 'string',
              description: 'Start date in ISO 8601 format'
            },
            end: {
              type: 'string',
              description: 'End date in ISO 8601 format'
            }
          },
          required: ['start', 'end'],
          description: 'Date range for historical search'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results (default: 50, max: 200)',
          minimum: 1,
          maximum: 200
        }
      },
      required: ['query', 'dateRange']
    }
  },

  {
    name: 'trending_topics_search',
    description: 'Get trending topics and popular content for analysis',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'Location for trending topics (default: "worldwide")'
        },
        timeframe: {
          type: 'string',
          enum: ['hourly', 'daily', 'weekly'],
          description: 'Timeframe for trending analysis (default: "hourly")'
        },
        count: {
          type: 'number',
          description: 'Number of trending topics to return (default: 10, max: 50)',
          minimum: 1,
          maximum: 50
        }
      },
      required: []
    }
  },

  {
    name: 'bulk_user_profiles',
    description: 'Get multiple user profiles in a single request for comparative analysis',
    inputSchema: {
      type: 'object',
      properties: {
        usernames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of usernames to analyze (e.g., ["elonmusk", "sundarpichai"])',
          maxItems: 20
        },
        userIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of user IDs to analyze',
          maxItems: 20
        },
        includeMetrics: {
          type: 'boolean',
          description: 'Include detailed metrics and analytics (default: true)'
        }
      },
      required: []
    }
  },

  {
    name: 'user_growth_analytics',
    description: 'Analyze user growth patterns and engagement trends over time',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username to analyze growth patterns for'
        },
        timeframe: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: 'Analysis timeframe (default: "weekly")'
        },
        period: {
          type: 'number',
          description: 'Number of periods to analyze (default: 4)',
          minimum: 1,
          maximum: 12
        }
      },
      required: ['username']
    }
  },

  {
    name: 'user_influence_metrics',
    description: 'Calculate user influence scores and engagement metrics',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username to analyze influence metrics for'
        },
        analyzeEngagement: {
          type: 'boolean',
          description: 'Include engagement analysis (default: true)'
        },
        analyzeReach: {
          type: 'boolean',
          description: 'Include reach and influence scoring (default: true)'
        }
      },
      required: ['username']
    }
  },

  // Thread & Conversation Analysis Tools (3 tools)
  {
    name: 'get_thread_metrics',
    description: 'Get analytics for entire thread including engagement distribution and performance',
    inputSchema: {
      type: 'object',
      properties: {
        tweetId: {
          type: 'string',
          description: 'The ID of the thread to analyze'
        },
        includeReplies: {
          type: 'boolean',
          description: 'Include reply metrics (default: true)'
        }
      },
      required: ['tweetId']
    }
  },

  // Network Analysis Tools (3 tools)
  {
    name: 'find_mutual_connections',
    description: 'Discover mutual connections between two users via interactions',
    inputSchema: {
      type: 'object',
      properties: {
        userId1: {
          type: 'string',
          description: 'First user ID or username'
        },
        userId2: {
          type: 'string',
          description: 'Second user ID or username'
        },
        connectionType: {
          type: 'string',
          enum: ['followers', 'following', 'interactions'],
          description: 'Type of connection to analyze (default: "followers")'
        }
      },
      required: ['userId1', 'userId2']
    }
  },

  {
    name: 'analyze_follower_demographics',
    description: 'Analyze follower patterns and demographic information',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username to analyze follower demographics for'
        },
        sampleSize: {
          type: 'number',
          description: 'Number of followers to sample (default: 100, max: 1000)',
          minimum: 10,
          maximum: 1000
        }
      },
      required: ['username']
    }
  },

  {
    name: 'map_influence_network',
    description: 'Map user influence network and connection strength analysis',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username to map influence network for'
        },
        depth: {
          type: 'number',
          description: 'Network depth to analyze (default: 2, max: 3)',
          minimum: 1,
          maximum: 3
        },
        minInfluenceScore: {
          type: 'number',
          description: 'Minimum influence score to include (default: 50)',
          minimum: 0,
          maximum: 100
        }
      },
      required: ['username']
    }
  },

  // Advanced Analytics Tools (8 tools)
  {
    name: 'get_hashtag_trends',
    description: 'Track hashtag performance over time with trend analysis. Bypasses Pro tier requirement.',
    inputSchema: {
      type: 'object',
      properties: {
        hashtag: {
          type: 'string',
          description: 'Hashtag to analyze (with or without #)'
        },
        timeframe: {
          type: 'string',
          enum: ['hourly', 'daily', 'weekly'],
          description: 'Analysis timeframe (default: "daily")'
        },
        period: {
          type: 'number',
          description: 'Number of periods to analyze (default: 7)',
          minimum: 1,
          maximum: 30
        }
      },
      required: ['hashtag']
    }
  },

  {
    name: 'analyze_sentiment',
    description: 'Sentiment analysis with keyword frequency tracking for tweets matching query',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for sentiment analysis'
        },
        sampleSize: {
          type: 'number',
          description: 'Number of tweets to analyze (default: 100, max: 500)',
          minimum: 10,
          maximum: 500
        },
        language: {
          type: 'string',
          description: 'Language code (e.g., "en", "es")'
        }
      },
      required: ['query']
    }
  },

  {
    name: 'track_virality',
    description: 'Track tweet virality metrics and engagement velocity over time',
    inputSchema: {
      type: 'object',
      properties: {
        tweetId: {
          type: 'string',
          description: 'Tweet ID to track virality for'
        },
        interval: {
          type: 'string',
          enum: ['hourly', 'daily'],
          description: 'Tracking interval (default: "hourly")'
        },
        duration: {
          type: 'number',
          description: 'Duration to track in hours (default: 24, max: 168)',
          minimum: 1,
          maximum: 168
        }
      },
      required: ['tweetId']
    }
  },

  {
    name: 'get_hashtag_analytics',
    description: 'Get comprehensive analytics for a specific hashtag including usage, reach, and engagement',
    inputSchema: {
      type: 'object',
      properties: {
        hashtag: {
          type: 'string',
          description: 'Hashtag to analyze (with or without #)'
        },
        timeRange: {
          type: 'string',
          enum: ['24h', '7d', '30d'],
          description: 'Time range for analysis (default: "7d")'
        }
      },
      required: ['hashtag']
    }
  },

  {
    name: 'compare_user_engagement',
    description: 'Compare engagement metrics between multiple users',
    inputSchema: {
      type: 'object',
      properties: {
        usernames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of usernames to compare (2-5 users)',
          minItems: 2,
          maxItems: 5
        },
        metrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['engagement_rate', 'followers_growth', 'tweet_frequency', 'reply_rate']
          },
          description: 'Metrics to compare'
        }
      },
      required: ['usernames']
    }
  },

  {
    name: 'predict_tweet_performance',
    description: 'Predict potential performance of a tweet based on historical data',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Tweet text to analyze'
        },
        username: {
          type: 'string',
          description: 'Username of account that would post (for historical context)'
        },
        includeHashtags: {
          type: 'boolean',
          description: 'Analyze hashtag impact (default: true)'
        }
      },
      required: ['text', 'username']
    }
  },

  {
    name: 'get_optimal_posting_times',
    description: 'Analyze optimal posting times based on audience engagement patterns',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Username to analyze posting patterns for'
        },
        timezone: {
          type: 'string',
          description: 'Timezone for recommendations (e.g., "America/New_York")'
        },
        period: {
          type: 'string',
          enum: ['weekly', 'monthly'],
          description: 'Analysis period (default: "weekly")'
        }
      },
      required: ['username']
    }
  },

  {
    name: 'analyze_competitor_strategy',
    description: 'Analyze competitor posting strategy, content types, and engagement patterns',
    inputSchema: {
      type: 'object',
      properties: {
        usernames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of competitor usernames to analyze',
          maxItems: 10
        },
        timeframe: {
          type: 'string',
          enum: ['weekly', 'monthly'],
          description: 'Analysis timeframe (default: "monthly")'
        }
      },
      required: ['usernames']
    }
  }
];

/**
 * SocialData Analytics tool handlers
 * All tools require SocialData API key
 */
export class SocialDataAnalyticsHandlers {
  constructor(private client: TwitterClient) {}

  /**
   * Helper to check if SocialData API is available
   */
  private checkSocialDataAvailable(): void {
    if (!process.env.SOCIALDATA_API_KEY) {
      throw new Error(
        'SocialData API key not configured. To use this tool:\n' +
        '1. Sign up at https://socialdata.tools\n' +
        '2. Get your API key from the dashboard\n' +
        '3. Add SOCIALDATA_API_KEY=your_key to your .env file\n\n' +
        'SocialData provides enhanced Twitter analytics that bypass standard API tier restrictions.'
      );
    }
  }

  async advancedTweetSearch(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { query, maxResults = 10, startTime, endTime, includeRetweets = true, language } = args;

    return await this.client.socialDataRequest('POST', '/twitter/search/advanced', {
      query,
      max_results: maxResults,
      start_time: startTime,
      end_time: endTime,
      include_retweets: includeRetweets,
      language
    });
  }

  async historicalTweetSearch(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { query, dateRange, maxResults = 50 } = args;

    return await this.client.socialDataRequest('POST', '/twitter/search/historical', {
      query,
      start_date: dateRange.start,
      end_date: dateRange.end,
      max_results: maxResults
    });
  }

  async trendingTopicsSearch(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { location = 'worldwide', timeframe = 'hourly', count = 10 } = args;

    return await this.client.socialDataRequest('GET', '/twitter/trending', {
      location,
      timeframe,
      count
    });
  }

  async bulkUserProfiles(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { usernames, userIds, includeMetrics = true } = args;

    return await this.client.socialDataRequest('POST', '/twitter/users/bulk', {
      usernames,
      user_ids: userIds,
      include_metrics: includeMetrics
    });
  }

  async userGrowthAnalytics(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { username, timeframe = 'weekly', period = 4 } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/user-growth', {
      username,
      timeframe,
      period
    });
  }

  async userInfluenceMetrics(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { username, analyzeEngagement = true, analyzeReach = true } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/influence', {
      username,
      analyze_engagement: analyzeEngagement,
      analyze_reach: analyzeReach
    });
  }

  async getThreadMetrics(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { tweetId, includeReplies = true } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/thread', {
      tweet_id: tweetId,
      include_replies: includeReplies
    });
  }

  async findMutualConnections(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { userId1, userId2, connectionType = 'followers' } = args;

    return await this.client.socialDataRequest('POST', '/twitter/network/mutual', {
      user_id_1: userId1,
      user_id_2: userId2,
      connection_type: connectionType
    });
  }

  async analyzeFollowerDemographics(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { username, sampleSize = 100 } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/demographics', {
      username,
      sample_size: sampleSize
    });
  }

  async mapInfluenceNetwork(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { username, depth = 2, minInfluenceScore = 50 } = args;

    return await this.client.socialDataRequest('POST', '/twitter/network/influence-map', {
      username,
      depth,
      min_influence_score: minInfluenceScore
    });
  }

  async getHashtagTrends(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { hashtag, timeframe = 'daily', period = 7 } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/hashtag-trends', {
      hashtag: hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
      timeframe,
      period
    });
  }

  async analyzeSentiment(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { query, sampleSize = 100, language } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/sentiment', {
      query,
      sample_size: sampleSize,
      language
    });
  }

  async trackVirality(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { tweetId, interval = 'hourly', duration = 24 } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/virality', {
      tweet_id: tweetId,
      interval,
      duration
    });
  }

  async getHashtagAnalytics(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { hashtag, timeRange = '7d' } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/hashtag', {
      hashtag: hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
      time_range: timeRange
    });
  }

  async compareUserEngagement(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { usernames, metrics } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/compare-engagement', {
      usernames,
      metrics
    });
  }

  async predictTweetPerformance(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { text, username, includeHashtags = true } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/predict-performance', {
      text,
      username,
      include_hashtags: includeHashtags
    });
  }

  async getOptimalPostingTimes(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { username, timezone, period = 'weekly' } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/optimal-times', {
      username,
      timezone,
      period
    });
  }

  async analyzeCompetitorStrategy(args: any, tenantId: string): Promise<any> {
    this.checkSocialDataAvailable();
    const { usernames, timeframe = 'monthly' } = args;

    return await this.client.socialDataRequest('POST', '/twitter/analytics/competitor-strategy', {
      usernames,
      timeframe
    });
  }
}
