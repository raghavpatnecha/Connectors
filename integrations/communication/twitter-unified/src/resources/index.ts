/**
 * MCP Resources - Dynamic Real-Time Data Access
 * Based on mcp-twitter-server implementation
 *
 * Provides 6 dynamic resources for real-time Twitter data:
 * 1. account-analytics - Real-time account metrics
 * 2. recent-mentions - Latest mentions of authenticated user
 * 3. trending-topics - Current Twitter trends
 * 4. follower-insights - Follower demographics and growth
 * 5. content-performance - Top performing recent tweets
 * 6. engagement-summary - Recent engagement metrics
 *
 * Resources refresh automatically and can be accessed by AI agents
 * without explicit tool calls, providing passive context.
 */

import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const TWITTER_RESOURCES: Resource[] = [
  {
    uri: 'twitter://account-analytics',
    name: 'Account Analytics',
    description: 'Real-time analytics for the authenticated Twitter account including follower count, engagement rates, and growth metrics',
    mimeType: 'application/json'
  },
  {
    uri: 'twitter://recent-mentions',
    name: 'Recent Mentions',
    description: 'Latest mentions of the authenticated user from the past 24 hours, including replies and tags',
    mimeType: 'application/json'
  },
  {
    uri: 'twitter://trending-topics',
    name: 'Trending Topics',
    description: 'Current trending topics and hashtags on Twitter, filtered by location if available',
    mimeType: 'application/json'
  },
  {
    uri: 'twitter://follower-insights',
    name: 'Follower Insights',
    description: 'Demographic information and insights about followers including locations, verified status, and top followers',
    mimeType: 'application/json'
  },
  {
    uri: 'twitter://content-performance',
    name: 'Content Performance',
    description: 'Performance metrics for recent tweets including top performing posts by engagement, reach, and virality',
    mimeType: 'application/json'
  },
  {
    uri: 'twitter://engagement-summary',
    name: 'Engagement Summary',
    description: 'Summary of recent engagement activity including likes received, retweets, replies, and new followers',
    mimeType: 'application/json'
  }
];

/**
 * Resource handler for fetching dynamic resource contents
 */
export class TwitterResourceHandler {
  constructor(private client: TwitterClient) {}

  /**
   * Fetch resource contents by URI
   */
  async getResourceContents(uri: string, tenantId: string): Promise<any> {
    switch (uri) {
      case 'twitter://account-analytics':
        return this.getAccountAnalytics(tenantId);
      case 'twitter://recent-mentions':
        return this.getRecentMentions(tenantId);
      case 'twitter://trending-topics':
        return this.getTrendingTopics(tenantId);
      case 'twitter://follower-insights':
        return this.getFollowerInsights(tenantId);
      case 'twitter://content-performance':
        return this.getContentPerformance(tenantId);
      case 'twitter://engagement-summary':
        return this.getEngagementSummary(tenantId);
      default:
        throw new Error(`Unknown resource URI: ${uri}`);
    }
  }

  /**
   * Account Analytics Resource
   * Real-time metrics about the authenticated account
   */
  private async getAccountAnalytics(tenantId: string): Promise<any> {
    // Get authenticated user info
    const user = await this.client.request(
      'GET',
      '/users/me',
      tenantId,
      undefined,
      {
        'user.fields': 'public_metrics,created_at,verified,description,location'
      }
    );

    const { data } = user;
    const metrics = data.public_metrics;

    // Calculate account age
    const createdAt = new Date(data.created_at);
    const accountAgeDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate average engagement (followers / following ratio)
    const followerRatioNum = metrics.following_count > 0
      ? (metrics.followers_count / metrics.following_count)
      : 0;
    const followerRatioStr = followerRatioNum > 0 ? followerRatioNum.toFixed(2) : 'N/A';

    // Calculate average tweets per day
    const avgTweetsPerDay = (metrics.tweet_count / accountAgeDays).toFixed(2);

    return {
      account: {
        username: data.username,
        name: data.name,
        verified: data.verified || false,
        description: data.description,
        location: data.location,
        created_at: data.created_at,
        account_age_days: accountAgeDays
      },
      metrics: {
        followers: metrics.followers_count,
        following: metrics.following_count,
        tweets: metrics.tweet_count,
        listed: metrics.listed_count,
        follower_ratio: followerRatioStr,
        avg_tweets_per_day: avgTweetsPerDay
      },
      insights: {
        engagement_potential: metrics.followers_count > 1000 ? 'High' : metrics.followers_count > 100 ? 'Medium' : 'Growing',
        account_type: followerRatioNum > 2 ? 'Influencer' : followerRatioNum < 0.5 ? 'Active Follower' : 'Balanced',
        content_velocity: parseFloat(avgTweetsPerDay) > 3 ? 'Very Active' : parseFloat(avgTweetsPerDay) > 1 ? 'Active' : 'Moderate'
      },
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Recent Mentions Resource
   * Latest mentions from the past 24 hours
   */
  private async getRecentMentions(tenantId: string): Promise<any> {
    // Get authenticated user
    const user = await this.client.request('GET', '/users/me', tenantId);
    const username = user.data.username;

    // Search for mentions in past 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const mentions = await this.client.request(
      'GET',
      '/tweets/search/recent',
      tenantId,
      undefined,
      {
        query: `@${username}`,
        max_results: 100,
        'tweet.fields': 'created_at,author_id,public_metrics,referenced_tweets',
        'user.fields': 'username,name,verified,public_metrics',
        start_time: yesterday,
        expansions: 'author_id'
      }
    );

    const tweets = mentions.data || [];
    const users = mentions.includes?.users || [];

    // Map user data
    const userMap: Map<string, any> = new Map(users.map((u: any) => [u.id, u]));

    // Categorize mentions
    const categorized = {
      replies: [] as any[],
      mentions: [] as any[],
      high_value: [] as any[]  // From verified or high-follower accounts
    };

    tweets.forEach((tweet: any) => {
      const author = userMap.get(tweet.author_id);
      const isReply = tweet.referenced_tweets?.some((ref: any) => ref.type === 'replied_to');
      const isHighValue = author?.verified || author?.public_metrics?.followers_count > 10000;

      const mentionData = {
        tweet_id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: {
          username: author?.username,
          name: author?.name,
          verified: author?.verified || false,
          followers: author?.public_metrics?.followers_count || 0
        },
        metrics: tweet.public_metrics,
        is_reply: isReply
      };

      if (isReply) {
        categorized.replies.push(mentionData);
      } else {
        categorized.mentions.push(mentionData);
      }

      if (isHighValue) {
        categorized.high_value.push(mentionData);
      }
    });

    return {
      summary: {
        total_mentions: tweets.length,
        replies: categorized.replies.length,
        mentions: categorized.mentions.length,
        high_value: categorized.high_value.length
      },
      mentions: categorized,
      timeframe: '24 hours',
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Trending Topics Resource
   * Current Twitter trends
   */
  private async getTrendingTopics(tenantId: string): Promise<any> {
    // Note: Twitter API v2 requires specific permissions for trends
    // This is a simplified implementation - actual trends API may need elevated access

    try {
      // Attempt to get trends (may require elevated access)
      // Fallback to search-based trending detection

      // Search for high-volume recent tweets
      const searches = await Promise.all([
        this.client.request('GET', '/tweets/search/recent', tenantId, undefined, {
          query: 'lang:en -is:retweet',
          max_results: 100,
          'tweet.fields': 'entities,public_metrics'
        })
      ]);

      const tweets = searches[0].data || [];

      // Extract hashtags and count frequency
      const hashtagCounts = new Map<string, { count: number; tweets: number; engagement: number }>();

      tweets.forEach((tweet: any) => {
        const hashtags = tweet.entities?.hashtags || [];
        const engagement = (tweet.public_metrics?.like_count || 0) +
                          (tweet.public_metrics?.retweet_count || 0);

        hashtags.forEach((tag: any) => {
          const hashtag = tag.tag.toLowerCase();
          const current = hashtagCounts.get(hashtag) || { count: 0, tweets: 0, engagement: 0 };
          hashtagCounts.set(hashtag, {
            count: current.count + 1,
            tweets: current.tweets + 1,
            engagement: current.engagement + engagement
          });
        });
      });

      // Sort by frequency and engagement
      const trending = Array.from(hashtagCounts.entries())
        .map(([hashtag, stats]) => ({
          hashtag: `#${hashtag}`,
          frequency: stats.count,
          tweets: stats.tweets,
          total_engagement: stats.engagement,
          avg_engagement: Math.round(stats.engagement / stats.tweets)
        }))
        .sort((a, b) => b.total_engagement - a.total_engagement)
        .slice(0, 20);

      return {
        trending_hashtags: trending,
        timeframe: 'Last hour',
        data_source: 'Recent search analysis',
        last_updated: new Date().toISOString(),
        note: 'Trends based on recent tweet analysis. For official Twitter trends, elevated API access is required.'
      };
    } catch (error) {
      return {
        error: 'Unable to fetch trends - may require elevated API access',
        fallback_suggestion: 'Use search_tweets tool to explore specific topics',
        last_updated: new Date().toISOString()
      };
    }
  }

  /**
   * Follower Insights Resource
   * Demographics and insights about followers
   */
  private async getFollowerInsights(tenantId: string): Promise<any> {
    // Get authenticated user
    const user = await this.client.request('GET', '/users/me', tenantId);
    const userId = user.data.id;

    // Get recent followers
    const followers = await this.client.request(
      'GET',
      `/users/${userId}/followers`,
      tenantId,
      undefined,
      {
        max_results: 100,
        'user.fields': 'public_metrics,verified,description,location,created_at'
      }
    );

    const followerData: any[] = followers.data || [];

    // Analyze follower demographics
    const insights = {
      verified_count: 0,
      total_followers: followerData.length,
      avg_follower_count: 0,
      locations: new Map<string, number>(),
      top_followers: [] as any[]
    };

    let totalFollowerCount = 0;

    followerData.forEach((follower: any) => {
      if (follower.verified) insights.verified_count++;

      totalFollowerCount += (follower.public_metrics?.followers_count as number) || 0;

      if (follower.location) {
        const location = follower.location.split(',')[0].trim(); // Get primary location
        insights.locations.set(location, (insights.locations.get(location) || 0) + 1);
      }

      // Track top followers (by follower count)
      if ((follower.public_metrics?.followers_count as number) > 1000) {
        insights.top_followers.push({
          username: follower.username,
          name: follower.name,
          verified: follower.verified || false,
          followers: follower.public_metrics.followers_count,
          description: follower.description?.substring(0, 100)
        });
      }
    });

    insights.avg_follower_count = Math.round(totalFollowerCount / followerData.length);

    // Sort top followers
    insights.top_followers.sort((a, b) => b.followers - a.followers);
    insights.top_followers = insights.top_followers.slice(0, 10);

    // Convert locations map to array
    const topLocations = Array.from(insights.locations.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      summary: {
        total_analyzed: followerData.length,
        verified_followers: insights.verified_count,
        verified_percentage: ((insights.verified_count / followerData.length) * 100).toFixed(1),
        avg_follower_count: insights.avg_follower_count
      },
      top_locations: topLocations,
      top_followers: insights.top_followers,
      insights: {
        audience_quality: insights.avg_follower_count > 1000 ? 'High Quality' : 'Growing',
        verified_presence: insights.verified_count > 5 ? 'Strong' : insights.verified_count > 0 ? 'Moderate' : 'Limited',
        geographic_diversity: topLocations.length > 5 ? 'Global' : 'Regional'
      },
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Content Performance Resource
   * Top performing recent tweets
   */
  private async getContentPerformance(tenantId: string): Promise<any> {
    // Get authenticated user
    const user = await this.client.request('GET', '/users/me', tenantId);
    const userId = user.data.id;

    // Get recent tweets (last 7 days)
    const tweets = await this.client.request(
      'GET',
      `/users/${userId}/tweets`,
      tenantId,
      undefined,
      {
        max_results: 100,
        'tweet.fields': 'created_at,public_metrics,entities',
        exclude: 'retweets,replies'
      }
    );

    const tweetData = tweets.data || [];

    // Calculate engagement metrics for each tweet
    const analyzed = tweetData.map((tweet: any) => {
      const metrics = tweet.public_metrics;
      const totalEngagement = (metrics.like_count || 0) +
                             (metrics.retweet_count || 0) +
                             (metrics.reply_count || 0) +
                             (metrics.quote_count || 0);

      const impressions = metrics.impression_count || 1;
      const engagementRate = ((totalEngagement / impressions) * 100).toFixed(2);

      return {
        tweet_id: tweet.id,
        text: tweet.text.substring(0, 100) + (tweet.text.length > 100 ? '...' : ''),
        created_at: tweet.created_at,
        metrics: {
          likes: metrics.like_count,
          retweets: metrics.retweet_count,
          replies: metrics.reply_count,
          quotes: metrics.quote_count,
          impressions: metrics.impression_count,
          total_engagement: totalEngagement,
          engagement_rate: parseFloat(engagementRate)
        },
        hashtags: tweet.entities?.hashtags?.map((h: any) => h.tag) || []
      };
    });

    // Sort by engagement
    const byEngagement = [...analyzed].sort((a, b) => b.metrics.total_engagement - a.metrics.total_engagement);
    const byEngagementRate = [...analyzed].sort((a, b) => b.metrics.engagement_rate - a.metrics.engagement_rate);
    const byImpressions = [...analyzed].sort((a, b) => b.metrics.impressions - a.metrics.impressions);

    // Calculate averages
    const avgMetrics = {
      avg_likes: Math.round(analyzed.reduce((sum: number, t: any) => sum + t.metrics.likes, 0) / analyzed.length),
      avg_retweets: Math.round(analyzed.reduce((sum: number, t: any) => sum + t.metrics.retweets, 0) / analyzed.length),
      avg_replies: Math.round(analyzed.reduce((sum: number, t: any) => sum + t.metrics.replies, 0) / analyzed.length),
      avg_engagement_rate: (analyzed.reduce((sum: number, t: any) => sum + t.metrics.engagement_rate, 0) / analyzed.length).toFixed(2)
    };

    return {
      summary: {
        total_tweets_analyzed: analyzed.length,
        ...avgMetrics
      },
      top_performing: {
        by_total_engagement: byEngagement.slice(0, 5),
        by_engagement_rate: byEngagementRate.slice(0, 5),
        by_reach: byImpressions.slice(0, 5)
      },
      insights: {
        best_performing_type: this.identifyBestPerformingType(analyzed),
        optimal_posting_strategy: this.suggestPostingStrategy(analyzed)
      },
      timeframe: 'Last 100 tweets (excluding retweets and replies)',
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Engagement Summary Resource
   * Recent engagement activity summary
   */
  private async getEngagementSummary(tenantId: string): Promise<any> {
    // Get authenticated user
    const user = await this.client.request('GET', '/users/me', tenantId);
    const userId = user.data.id;

    // Get recent tweets
    const tweets = await this.client.request(
      'GET',
      `/users/${userId}/tweets`,
      tenantId,
      undefined,
      {
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics'
      }
    );

    const tweetData = tweets.data || [];

    // Calculate total engagement from recent tweets
    let totalLikes = 0;
    let totalRetweets = 0;
    let totalReplies = 0;
    let totalQuotes = 0;

    tweetData.forEach((tweet: any) => {
      const metrics = tweet.public_metrics;
      totalLikes += metrics.like_count || 0;
      totalRetweets += metrics.retweet_count || 0;
      totalReplies += metrics.reply_count || 0;
      totalQuotes += metrics.quote_count || 0;
    });

    const totalEngagement = totalLikes + totalRetweets + totalReplies + totalQuotes;

    // Get follower count for growth tracking
    const currentMetrics = user.data.public_metrics;

    return {
      recent_activity: {
        tweets_posted: tweetData.length,
        total_engagement_received: totalEngagement,
        likes_received: totalLikes,
        retweets_received: totalRetweets,
        replies_received: totalReplies,
        quotes_received: totalQuotes
      },
      current_stats: {
        followers: currentMetrics.followers_count,
        following: currentMetrics.following_count,
        total_tweets: currentMetrics.tweet_count
      },
      engagement_breakdown: {
        likes_percentage: ((totalLikes / totalEngagement) * 100).toFixed(1),
        retweets_percentage: ((totalRetweets / totalEngagement) * 100).toFixed(1),
        replies_percentage: ((totalReplies / totalEngagement) * 100).toFixed(1),
        quotes_percentage: ((totalQuotes / totalEngagement) * 100).toFixed(1)
      },
      insights: {
        engagement_trend: totalEngagement > 100 ? 'Strong' : totalEngagement > 20 ? 'Moderate' : 'Growing',
        audience_interaction: totalReplies > totalLikes * 0.1 ? 'Highly Interactive' : 'Standard',
        virality: totalRetweets > totalLikes * 0.3 ? 'High Virality' : 'Standard Sharing'
      },
      timeframe: 'Last 10 tweets',
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Helper: Identify best performing content type
   */
  private identifyBestPerformingType(tweets: any[]): string {
    const withHashtags = tweets.filter(t => t.hashtags.length > 0);
    const withoutHashtags = tweets.filter(t => t.hashtags.length === 0);

    const avgWithHashtags = withHashtags.length > 0
      ? withHashtags.reduce((sum, t) => sum + t.metrics.engagement_rate, 0) / withHashtags.length
      : 0;

    const avgWithoutHashtags = withoutHashtags.length > 0
      ? withoutHashtags.reduce((sum, t) => sum + t.metrics.engagement_rate, 0) / withoutHashtags.length
      : 0;

    if (avgWithHashtags > avgWithoutHashtags * 1.2) {
      return 'Tweets with hashtags perform better';
    } else if (avgWithoutHashtags > avgWithHashtags * 1.2) {
      return 'Tweets without hashtags perform better';
    } else {
      return 'Mixed performance - hashtags have neutral impact';
    }
  }

  /**
   * Helper: Suggest posting strategy based on performance
   */
  private suggestPostingStrategy(tweets: any[]): string {
    const avgEngagement = tweets.reduce((sum, t) => sum + t.metrics.total_engagement, 0) / tweets.length;

    if (avgEngagement > 100) {
      return 'High engagement - maintain current posting frequency and style';
    } else if (avgEngagement > 20) {
      return 'Moderate engagement - consider increasing posting frequency or testing new content formats';
    } else {
      return 'Growing engagement - focus on quality over quantity, engage with audience more';
    }
  }
}
