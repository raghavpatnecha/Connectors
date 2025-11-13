/**
 * LinkedIn Feed & Posts Tools
 *
 * Implements 4 MCP tools for interacting with LinkedIn feed
 * Browse feed, like posts, comment, and create new posts
 */

import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { UnifiedClient } from '../clients/unified-client';
import { logger } from '../utils/logger';

/**
 * Register all feed and post-related tools with the MCP server
 *
 * @param registry - ToolRegistry instance for registering tools
 * @param getClient - Function to retrieve UnifiedClient for a tenant
 */
export function registerFeedTools(
  registry: ToolRegistry,
  getClient: (tenantId: string) => UnifiedClient
): void {
  // ============================================================================
  // Tool 1: browse-feed
  // ============================================================================
  registry.registerTool(
    'browse-feed',
    'Browse LinkedIn feed and retrieve posts. Returns posts with content, author info, engagement metrics, and comments. Uses browser automation for complete feed access.',
    {
      limit: z.number().min(1).max(100).default(20).describe('Maximum posts to retrieve (1-100)'),
      feedType: z.enum(['HOME', 'TOP', 'RECENT', 'CONNECTIONS_ONLY']).default('HOME').describe('Type of feed to browse'),
      includeComments: z.boolean().default(true).describe('Include top comments for each post'),
      maxCommentsPerPost: z.number().min(0).max(50).default(5).describe('Maximum comments to include per post'),
      includeEngagementMetrics: z.boolean().default(true).describe('Include likes, shares, and comment counts')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('browse-feed tool called', { tenantId, params });

      try {
        const client = getClient(tenantId);
        const feed = await client.browseFeed(params.limit || 10);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                posts: feed,
                metadata: {
                  count: feed.length,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  feed_type: params.feedType || 'recent',
                  includes: {
                    comments: params.includeComments,
                    engagement_metrics: params.includeEngagementMetrics
                  },
                  total_engagement: {
                    total_likes: feed.reduce((sum: number, p: any) => sum + (p.likeCount || 0), 0),
                    total_comments: feed.reduce((sum: number, p: any) => sum + (p.commentCount || 0), 0),
                    total_shares: feed.reduce((sum: number, p: any) => sum + (p.shareCount || 0), 0)
                  }
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('browse-feed tool failed', { error, tenantId, params });
        throw new Error(`Failed to browse feed: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 2: like-post
  // ============================================================================
  registry.registerTool(
    'like-post',
    'Like a LinkedIn post. Supports different reaction types (like, celebrate, support, insightful, funny). WARNING: This will perform a real action on LinkedIn!',
    {
      postUrl: z.string().url().describe('Full LinkedIn post URL or post ID'),
      reactionType: z.enum([
        'LIKE',
        'CELEBRATE',
        'SUPPORT',
        'INSIGHTFUL',
        'FUNNY',
        'LOVE'
      ]).default('LIKE').describe('Type of reaction to give'),
      unlike: z.boolean().default(false).describe('Remove existing reaction instead of adding one')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.warn('like-post tool called - WILL PERFORM REAL ACTION', {
        tenantId,
        postUrl: params.postUrl,
        reactionType: params.reactionType,
        unlike: params.unlike
      });

      try {
        const client = getClient(tenantId);
        const result = await client.likePost(params.postUrl);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                result,
                metadata: {
                  post_url: params.postUrl,
                  action: params.unlike ? 'unlike' : 'like',
                  reaction_type: params.reactionType,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  success: result.success,
                  was_already_liked: result.wasAlreadyLiked
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('like-post tool failed', { error, tenantId, postUrl: params.postUrl });
        throw new Error(`Failed to like post: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 3: comment-on-post
  // ============================================================================
  registry.registerTool(
    'comment-on-post',
    'Comment on a LinkedIn post. Supports text comments with optional media attachments. WARNING: This will post a real comment!',
    {
      postUrl: z.string().url().describe('Full LinkedIn post URL or post ID'),
      comment: z.string().min(1).max(3000).describe('Comment text (max 3000 characters)'),
      parentCommentId: z.string().optional().describe('Parent comment ID for nested replies'),
      attachments: z.array(z.object({
        type: z.enum(['IMAGE', 'DOCUMENT', 'LINK']),
        url: z.string().optional(),
        filePath: z.string().optional(),
        title: z.string().optional()
      })).optional().describe('Media attachments for comment'),
      confirmBeforePost: z.boolean().default(true).describe('Require confirmation before posting')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.warn('comment-on-post tool called - WILL POST REAL COMMENT', {
        tenantId,
        postUrl: params.postUrl,
        commentLength: params.comment.length,
        isReply: !!params.parentCommentId,
        confirmBeforePost: params.confirmBeforePost
      });

      try {
        const client = getClient(tenantId);
        const result = await client.commentOnPost(params.postUrl, params.comment);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                result,
                metadata: {
                  post_url: params.postUrl,
                  comment_length: params.comment.length,
                  is_reply: !!params.parentCommentId,
                  attachments_count: params.attachments?.length || 0,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  status: result.status,
                  comment_id: result.commentId,
                  comment_url: result.commentUrl
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('comment-on-post tool failed', { error, tenantId, postUrl: params.postUrl });
        throw new Error(`Failed to comment on post: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 4: create-post
  // ============================================================================
  registry.registerTool(
    'create-post',
    'Create a new LinkedIn post. Supports text, images, videos, documents, and links. WARNING: This will publish a real post to your LinkedIn profile!',
    {
      content: z.string().min(1).max(3000).describe('Post content text (max 3000 characters)'),
      visibility: z.enum(['PUBLIC', 'CONNECTIONS', 'PRIVATE']).default('CONNECTIONS').describe('Post visibility setting'),
      media: z.array(z.object({
        type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT', 'ARTICLE']),
        filePath: z.string().optional().describe('Local file path for upload'),
        url: z.string().optional().describe('URL for link/article sharing'),
        title: z.string().optional(),
        description: z.string().optional()
      })).optional().describe('Media attachments (images, videos, documents)'),
      hashtags: z.array(z.string()).optional().describe('Hashtags to include (without # prefix)'),
      mentionUsers: z.array(z.object({
        userId: z.string(),
        name: z.string()
      })).optional().describe('Users to mention in the post'),
      shareUrl: z.string().url().optional().describe('URL to share in the post'),
      confirmBeforePublish: z.boolean().default(true).describe('Require confirmation before publishing')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.warn('create-post tool called - WILL PUBLISH REAL POST', {
        tenantId,
        contentLength: params.content.length,
        visibility: params.visibility,
        hasMedia: !!params.media?.length,
        confirmBeforePublish: params.confirmBeforePublish
      });

      try {
        const client = getClient(tenantId);
        const result = await client.createPost({
          content: params.content,
          visibility: params.visibility,
          media: params.media,
          hashtags: params.hashtags,
          mentionUsers: params.mentionUsers,
          shareUrl: params.shareUrl
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                result,
                metadata: {
                  content_length: params.content.length,
                  visibility: params.visibility,
                  media_count: params.media?.length || 0,
                  hashtags_count: params.hashtags?.length || 0,
                  mentions_count: params.mentionUsers?.length || 0,
                  has_shared_url: !!params.shareUrl,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  status: result.status,
                  post_id: result.postId,
                  post_url: result.postUrl
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('create-post tool failed', { error, tenantId });
        throw new Error(`Failed to create post: ${(error as Error).message}`);
      }
    }
  );

  logger.info('Registered 4 feed tools');
}
