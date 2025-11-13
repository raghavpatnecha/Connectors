/**
 * Tool Registry - Central Export
 *
 * Exports all tool registration functions for the LinkedIn Unified MCP server
 * Total: 19 tools across 5 categories
 */

export { registerPeopleTools } from './people-tools';
export { registerJobTools } from './job-tools';
export { registerMessagingTools } from './messaging-tools';
export { registerFeedTools } from './feed-tools';
export { registerCompanyTools } from './company-tools';

/**
 * Tool Summary:
 *
 * People & Profiles (6 tools):
 * - search-people
 * - get-profile-basic
 * - get-profile-comprehensive
 * - get-my-profile
 * - get-network-stats
 * - get-connections
 *
 * Jobs (4 tools):
 * - search-jobs
 * - get-job-details
 * - get-recommended-jobs
 * - apply-to-job
 *
 * Messaging (3 tools):
 * - send-message
 * - get-conversations
 * - get-messages
 *
 * Feed & Posts (4 tools):
 * - browse-feed
 * - like-post
 * - comment-on-post
 * - create-post
 *
 * Companies (2 tools):
 * - get-company-profile
 * - follow-company
 */
