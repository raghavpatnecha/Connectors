/**
 * Reddit Unified MCP Tools - Centralized Tool Exports
 *
 * This file exports all tool registration functions for the Reddit Unified MCP server.
 * All 25 core tools are organized by category for easy integration with the main server.
 *
 * @module tools
 */

// Tool registration functions
export { registerBrowseTools } from './browse-tools';
export { registerSearchTools } from './search-tools';
export { registerPostTools } from './post-tools';
export { registerCommentTools } from './comment-tools';
export { registerSubredditTools } from './subreddit-tools';
export { registerUserTools } from './user-tools';
export { registerUtilityTools } from './utility-tools';
export { registerAuthenticatedTools } from './authenticated-tools';

/**
 * Tool Categories Summary:
 *
 * Browse Tools (8):
 * - browse_frontpage, browse_subreddit, browse_subreddit_new,
 * - browse_subreddit_top, browse_subreddit_rising, browse_subreddit_controversial,
 * - get_trending_subreddits, browse_popular
 *
 * Search Tools (2):
 * - search_posts, search_subreddits
 *
 * Post Tools (4):
 * - get_post, get_post_by_url, get_post_by_id, get_user_posts
 *
 * Comment Tools (2):
 * - get_post_comments, get_user_comments
 *
 * Subreddit Tools (2):
 * - get_subreddit_info, get_subreddit_stats
 *
 * User Tools (3):
 * - get_user_info, get_user_trophies, get_user_karma
 *
 * Utility Tools (1):
 * - reddit_explain
 *
 * Authenticated Tools (5):
 * - who_am_i, create_post, create_post_optimized, post_comment, reply_to_post
 *
 * Total: 25 core tools
 */
