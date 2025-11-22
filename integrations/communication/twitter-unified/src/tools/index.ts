/**
 * Twitter Unified MCP Tools Registry - CORRECTED VERSION
 * All 62 tools with accurate schemas matching source code
 * Based on actual implementations from 4 reference repositories
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

// Import corrected tool definitions
import { TWEET_TOOLS, TweetToolHandlers } from './tweet-tools';
import { ENGAGEMENT_TOOLS, EngagementToolHandlers } from './engagement-tools';
import { USER_TOOLS, UserToolHandlers } from './user-tools';
import { LIST_TOOLS, ListToolHandlers } from './list-tools';
import { DM_TOOLS, DMToolHandlers } from './dm-tools';
import { GROK_TOOLS, GrokToolHandlers } from './grok-tools';
import { MODERATION_TOOLS, ModerationToolHandlers } from './moderation-tools';
import { SOCIALDATA_ANALYTICS_TOOLS, SocialDataAnalyticsHandlers } from './socialdata-analytics-tools';

/**
 * All Twitter tools (62 total)
 *
 * Breakdown:
 * - Tweet Operations: 15 tools (send_tweet, post_tweet_with_media, send_tweet_with_poll, etc.)
 * - Engagement: 6 tools (like, unlike, retweet, undo_retweet, etc.)
 * - User Operations: 7 tools (get_user_profile, follow, get_authenticated_user, etc.)
 * - List Management: 7 tools (create, delete, update, add/remove members, etc.)
 * - Direct Messages: 2 tools (send_dm, delete_dm)
 * - Grok AI: 1 tool (grok_chat)
 * - Moderation: 6 tools (block, unblock, mute, unmute, get blocked/muted)
 * - SocialData Analytics: 18 tools (advanced search, sentiment, trends, predictions, etc.)
 */
export const ALL_TWITTER_TOOLS: Tool[] = [
  ...TWEET_TOOLS,                    // 15 tools
  ...ENGAGEMENT_TOOLS,               // 6 tools
  ...USER_TOOLS,                     // 7 tools
  ...LIST_TOOLS,                     // 7 tools
  ...DM_TOOLS,                       // 2 tools
  ...GROK_TOOLS,                     // 1 tool
  ...MODERATION_TOOLS,               // 6 tools
  ...SOCIALDATA_ANALYTICS_TOOLS      // 18 tools
];

/**
 * Tool handler registry - CORRECTED
 * All handlers now use (args, tenantId) signature
 * tenantId extracted from auth context, not from tool parameters
 */
export class ToolHandlerRegistry {
  private readonly _tweetHandlers: TweetToolHandlers;
  private readonly _engagementHandlers: EngagementToolHandlers;
  private readonly _userHandlers: UserToolHandlers;
  private readonly _listHandlers: ListToolHandlers;
  private readonly _dmHandlers: DMToolHandlers;
  private readonly _grokHandlers: GrokToolHandlers;
  private readonly _moderationHandlers: ModerationToolHandlers;
  private readonly _socialDataHandlers: SocialDataAnalyticsHandlers;

  constructor(twitterClient: TwitterClient) {
    this._tweetHandlers = new TweetToolHandlers(twitterClient);
    this._engagementHandlers = new EngagementToolHandlers(twitterClient);
    this._userHandlers = new UserToolHandlers(twitterClient);
    this._listHandlers = new ListToolHandlers(twitterClient);
    this._dmHandlers = new DMToolHandlers(twitterClient);
    this._grokHandlers = new GrokToolHandlers(twitterClient);
    this._moderationHandlers = new ModerationToolHandlers(twitterClient);
    this._socialDataHandlers = new SocialDataAnalyticsHandlers(twitterClient);
  }

  /**
   * Handle tool invocation with tenantId from auth context
   */
  async handleTool(toolName: string, args: any, tenantId: string): Promise<any> {
    // Tweet operations (15 tools)
    if (toolName === 'send_tweet') return this._tweetHandlers.sendTweet(args, tenantId);
    if (toolName === 'post_tweet_with_media') return this._tweetHandlers.postTweetWithMedia(args, tenantId);
    if (toolName === 'send_tweet_with_poll') return this._tweetHandlers.sendTweetWithPoll(args, tenantId);
    if (toolName === 'get_tweet_by_id') return this._tweetHandlers.getTweetById(args, tenantId);
    if (toolName === 'get_tweets_by_ids') return this._tweetHandlers.getTweetsByIds(args, tenantId);
    if (toolName === 'reply_to_tweet') return this._tweetHandlers.replyToTweet(args, tenantId);
    if (toolName === 'delete_tweet') return this._tweetHandlers.deleteTweet(args, tenantId);
    if (toolName === 'search_tweets') return this._tweetHandlers.searchTweets(args, tenantId);
    if (toolName === 'quote_tweet') return this._tweetHandlers.quoteTweet(args, tenantId);
    if (toolName === 'get_timeline') return this._tweetHandlers.getTimeline(args, tenantId);
    if (toolName === 'get_latest_timeline') return this._tweetHandlers.getLatestTimeline(args, tenantId);
    if (toolName === 'get_user_tweets') return this._tweetHandlers.getUserTweets(args, tenantId);
    if (toolName === 'get_user_timeline') return this._tweetHandlers.getUserTimeline(args, tenantId);
    if (toolName === 'get_full_thread') return this._tweetHandlers.getFullThread(args, tenantId);
    if (toolName === 'get_conversation_tree') return this._tweetHandlers.getConversationTree(args, tenantId);

    // Engagement (6 tools)
    if (toolName === 'like_tweet') return this._engagementHandlers.likeTweet(args, tenantId);
    if (toolName === 'unlike_tweet') return this._engagementHandlers.unlikeTweet(args, tenantId);
    if (toolName === 'retweet') return this._engagementHandlers.retweet(args, tenantId);
    if (toolName === 'undo_retweet') return this._engagementHandlers.undoRetweet(args, tenantId);
    if (toolName === 'get_retweets') return this._engagementHandlers.getRetweets(args, tenantId);
    if (toolName === 'get_liked_tweets') return this._engagementHandlers.getLikedTweets(args, tenantId);

    // User operations (7 tools)
    if (toolName === 'get_user_profile') return this._userHandlers.getUserProfile(args, tenantId);
    if (toolName === 'get_user_info') return this._userHandlers.getUserInfo(args, tenantId);
    if (toolName === 'get_authenticated_user') return this._userHandlers.getAuthenticatedUser(args, tenantId);
    if (toolName === 'follow_user') return this._userHandlers.followUser(args, tenantId);
    if (toolName === 'unfollow_user') return this._userHandlers.unfollowUser(args, tenantId);
    if (toolName === 'get_followers') return this._userHandlers.getFollowers(args, tenantId);
    if (toolName === 'get_following') return this._userHandlers.getFollowing(args, tenantId);

    // List management (7 tools)
    if (toolName === 'create_list') return this._listHandlers.createList(args, tenantId);
    if (toolName === 'get_user_lists') return this._listHandlers.getUserLists(args, tenantId);
    if (toolName === 'add_user_to_list') return this._listHandlers.addUserToList(args, tenantId);
    if (toolName === 'remove_user_from_list') return this._listHandlers.removeUserFromList(args, tenantId);
    if (toolName === 'get_list_members') return this._listHandlers.getListMembers(args, tenantId);
    if (toolName === 'delete_list') return this._listHandlers.deleteList(args, tenantId);
    if (toolName === 'update_list') return this._listHandlers.updateList(args, tenantId);

    // Direct messages (2 tools)
    if (toolName === 'send_dm') return this._dmHandlers.sendDM(args, tenantId);
    if (toolName === 'delete_dm') return this._dmHandlers.deleteDM(args, tenantId);

    // Grok AI (1 tool)
    if (toolName === 'grok_chat') return this._grokHandlers.grokChat(args, tenantId);

    // Moderation (6 tools)
    if (toolName === 'block_user') return this._moderationHandlers.blockUser(args, tenantId);
    if (toolName === 'unblock_user') return this._moderationHandlers.unblockUser(args, tenantId);
    if (toolName === 'mute_user') return this._moderationHandlers.muteUser(args, tenantId);
    if (toolName === 'unmute_user') return this._moderationHandlers.unmuteUser(args, tenantId);
    if (toolName === 'get_blocked_users') return this._moderationHandlers.getBlockedUsers(args, tenantId);
    if (toolName === 'get_muted_users') return this._moderationHandlers.getMutedUsers(args, tenantId);

    // SocialData Analytics (18 tools)
    if (toolName === 'advanced_tweet_search') return this._socialDataHandlers.advancedTweetSearch(args, tenantId);
    if (toolName === 'historical_tweet_search') return this._socialDataHandlers.historicalTweetSearch(args, tenantId);
    if (toolName === 'trending_topics_search') return this._socialDataHandlers.trendingTopicsSearch(args, tenantId);
    if (toolName === 'bulk_user_profiles') return this._socialDataHandlers.bulkUserProfiles(args, tenantId);
    if (toolName === 'user_growth_analytics') return this._socialDataHandlers.userGrowthAnalytics(args, tenantId);
    if (toolName === 'user_influence_metrics') return this._socialDataHandlers.userInfluenceMetrics(args, tenantId);
    if (toolName === 'get_thread_metrics') return this._socialDataHandlers.getThreadMetrics(args, tenantId);
    if (toolName === 'find_mutual_connections') return this._socialDataHandlers.findMutualConnections(args, tenantId);
    if (toolName === 'analyze_follower_demographics') return this._socialDataHandlers.analyzeFollowerDemographics(args, tenantId);
    if (toolName === 'map_influence_network') return this._socialDataHandlers.mapInfluenceNetwork(args, tenantId);
    if (toolName === 'get_hashtag_trends') return this._socialDataHandlers.getHashtagTrends(args, tenantId);
    if (toolName === 'analyze_sentiment') return this._socialDataHandlers.analyzeSentiment(args, tenantId);
    if (toolName === 'track_virality') return this._socialDataHandlers.trackVirality(args, tenantId);
    if (toolName === 'get_hashtag_analytics') return this._socialDataHandlers.getHashtagAnalytics(args, tenantId);
    if (toolName === 'compare_user_engagement') return this._socialDataHandlers.compareUserEngagement(args, tenantId);
    if (toolName === 'predict_tweet_performance') return this._socialDataHandlers.predictTweetPerformance(args, tenantId);
    if (toolName === 'get_optimal_posting_times') return this._socialDataHandlers.getOptimalPostingTimes(args, tenantId);
    if (toolName === 'analyze_competitor_strategy') return this._socialDataHandlers.analyzeCompetitorStrategy(args, tenantId);

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

  /**
   * Get tool count
   */
  getToolCount(): number {
    return ALL_TWITTER_TOOLS.length;
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(): Record<string, Tool[]> {
    return {
      tweet: TWEET_TOOLS,
      engagement: ENGAGEMENT_TOOLS,
      user: USER_TOOLS,
      list: LIST_TOOLS,
      dm: DM_TOOLS,
      grok: GROK_TOOLS,
      moderation: MODERATION_TOOLS,
      analytics: SOCIALDATA_ANALYTICS_TOOLS
    };
  }
}
