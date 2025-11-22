/**
 * Twitter Unified MCP Tools Registry
 * Combines all 45+ tools from tweet, engagement, user, list, and analytics categories
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';
import { TWEET_TOOLS, TweetToolHandlers } from './tweet-tools';
import { ENGAGEMENT_TOOLS, EngagementToolHandlers } from './engagement-tools';
import { USER_TOOLS, UserToolHandlers } from './user-tools';
import { LIST_ANALYTICS_TOOLS, ListAnalyticsToolHandlers } from './list-analytics-tools';

/**
 * All Twitter tools (45 total)
 */
export const ALL_TWITTER_TOOLS: Tool[] = [
  ...TWEET_TOOLS,          // 10 tools
  ...ENGAGEMENT_TOOLS,     // 7 tools
  ...USER_TOOLS,           // 10 tools
  ...LIST_ANALYTICS_TOOLS  // 18 tools (5 lists + 13 analytics)
];

/**
 * Tool handler registry
 * Handles all tool invocations
 */
export class ToolHandlerRegistry {
  private readonly _tweetHandlers: TweetToolHandlers;
  private readonly _engagementHandlers: EngagementToolHandlers;
  private readonly _userHandlers: UserToolHandlers;
  private readonly _listAnalyticsHandlers: ListAnalyticsToolHandlers;

  constructor(twitterClient: TwitterClient) {
    this._tweetHandlers = new TweetToolHandlers(twitterClient);
    this._engagementHandlers = new EngagementToolHandlers(twitterClient);
    this._userHandlers = new UserToolHandlers(twitterClient);
    this._listAnalyticsHandlers = new ListAnalyticsToolHandlers(twitterClient);
  }

  /**
   * Handle tool invocation
   */
  async handleTool(toolName: string, args: any): Promise<any> {
    // Tweet operations
    if (toolName === 'post_tweet') return this._tweetHandlers.postTweet(args);
    if (toolName === 'get_tweet_by_id') return this._tweetHandlers.getTweetById(args);
    if (toolName === 'reply_to_tweet') return this._tweetHandlers.replyToTweet(args);
    if (toolName === 'delete_tweet') return this._tweetHandlers.deleteTweet(args);
    if (toolName === 'search_tweets') return this._tweetHandlers.searchTweets(args);
    if (toolName === 'quote_tweet') return this._tweetHandlers.quoteTweet(args);
    if (toolName === 'send_tweet_with_poll') return this._tweetHandlers.sendTweetWithPoll(args);
    if (toolName === 'get_timeline') return this._tweetHandlers.getTimeline(args);
    if (toolName === 'get_user_tweets') return this._tweetHandlers.getUserTweets(args);
    if (toolName === 'get_full_thread') return this._tweetHandlers.getFullThread(args);

    // Engagement
    if (toolName === 'like_tweet') return this._engagementHandlers.likeTweet(args);
    if (toolName === 'unlike_tweet') return this._engagementHandlers.unlikeTweet(args);
    if (toolName === 'retweet') return this._engagementHandlers.retweet(args);
    if (toolName === 'undo_retweet') return this._engagementHandlers.undoRetweet(args);
    if (toolName === 'get_retweets') return this._engagementHandlers.getRetweets(args);
    if (toolName === 'get_liked_tweets') return this._engagementHandlers.getLikedTweets(args);
    if (toolName === 'track_virality') return this._engagementHandlers.trackVirality(args);

    // User operations
    if (toolName === 'get_user_profile') return this._userHandlers.getUserProfile(args);
    if (toolName === 'follow_user') return this._userHandlers.followUser(args);
    if (toolName === 'unfollow_user') return this._userHandlers.unfollowUser(args);
    if (toolName === 'get_followers') return this._userHandlers.getFollowers(args);
    if (toolName === 'get_following') return this._userHandlers.getFollowing(args);
    if (toolName === 'get_user_timeline') return this._userHandlers.getUserTimeline(args);
    if (toolName === 'find_mutual_connections') return this._userHandlers.findMutualConnections(args);
    if (toolName === 'analyze_follower_demographics') return this._userHandlers.analyzeFollowerDemographics(args);
    if (toolName === 'bulk_user_profiles') return this._userHandlers.bulkUserProfiles(args);
    if (toolName === 'user_growth_analytics') return this._userHandlers.userGrowthAnalytics(args);

    // Lists and analytics
    if (toolName === 'create_list') return this._listAnalyticsHandlers.createList(args);
    if (toolName === 'get_user_lists') return this._listAnalyticsHandlers.getUserLists(args);
    if (toolName === 'add_user_to_list') return this._listAnalyticsHandlers.addUserToList(args);
    if (toolName === 'remove_user_from_list') return this._listAnalyticsHandlers.removeUserFromList(args);
    if (toolName === 'get_list_members') return this._listAnalyticsHandlers.getListMembers(args);
    if (toolName === 'get_hashtag_analytics') return this._listAnalyticsHandlers.getHashtagAnalytics(args);
    if (toolName === 'advanced_tweet_search') return this._listAnalyticsHandlers.advancedTweetSearch(args);
    if (toolName === 'historical_tweet_search') return this._listAnalyticsHandlers.historicalTweetSearch(args);
    if (toolName === 'trending_topics_search') return this._listAnalyticsHandlers.trendingTopicsSearch(args);
    if (toolName === 'get_hashtag_trends') return this._listAnalyticsHandlers.getHashtagTrends(args);
    if (toolName === 'analyze_sentiment') return this._listAnalyticsHandlers.analyzeSentiment(args);
    if (toolName === 'get_thread_metrics') return this._listAnalyticsHandlers.getThreadMetrics(args);
    if (toolName === 'get_conversation_tree') return this._listAnalyticsHandlers.getConversationTree(args);
    if (toolName === 'map_influence_network') return this._listAnalyticsHandlers.mapInfluenceNetwork(args);
    if (toolName === 'user_influence_metrics') return this._listAnalyticsHandlers.userInfluenceMetrics(args);

    throw new Error(`Unknown tool: ${toolName}`);
  }

  /**
   * Get all available tools
   */
  getAllTools(): Tool[] {
    return ALL_TWITTER_TOOLS;
  }

  /**
   * Get tool by name
   */
  getTool(name: string): Tool | undefined {
    return ALL_TWITTER_TOOLS.find(tool => tool.name === name);
  }
}
