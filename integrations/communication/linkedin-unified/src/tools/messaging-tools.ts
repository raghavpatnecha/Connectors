/**
 * LinkedIn Messaging Tools
 *
 * Implements 3 MCP tools for LinkedIn messaging functionality
 * Allows sending messages, viewing conversations, and reading message threads
 */

import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { UnifiedClient } from '../clients/unified-client';
import { logger } from '../utils/logger';

/**
 * Register all messaging-related tools with the MCP server
 *
 * @param registry - ToolRegistry instance for registering tools
 * @param getClient - Function to retrieve UnifiedClient for a tenant
 */
export function registerMessagingTools(
  registry: ToolRegistry,
  getClient: (tenantId: string) => UnifiedClient
): void {
  // ============================================================================
  // Tool 1: send-message
  // ============================================================================
  registry.registerTool(
    'send-message',
    'Send a direct message to a LinkedIn connection. Requires existing connection or InMail credits for non-connections. WARNING: This will send a real message!',
    {
      recipientId: z.string().describe('LinkedIn user ID or public identifier of recipient'),
      message: z.string().min(1).max(8000).describe('Message content (max 8000 characters)'),
      subject: z.string().optional().describe('Message subject (optional, primarily for InMail)'),
      attachments: z.array(z.object({
        type: z.enum(['FILE', 'LINK', 'IMAGE']),
        url: z.string().optional(),
        filePath: z.string().optional(),
        title: z.string().optional()
      })).optional().describe('Attachments to include with message'),
      confirmBeforeSend: z.boolean().default(true).describe('Require confirmation before sending')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.warn('send-message tool called - WILL SEND REAL MESSAGE', {
        tenantId,
        recipientId: params.recipientId,
        messageLength: params.message.length,
        confirmBeforeSend: params.confirmBeforeSend
      });

      try {
        const client = getClient(tenantId);
        const result = await client.sendMessage(params.recipientId, params.message);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                result,
                metadata: {
                  recipient_id: params.recipientId,
                  message_length: params.message.length,
                  has_subject: !!params.subject,
                  attachments_count: params.attachments?.length || 0,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  status: result.status,
                  message_id: result.messageId
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('send-message tool failed', { error, tenantId, recipientId: params.recipientId });
        throw new Error(`Failed to send message: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 2: get-conversations
  // ============================================================================
  registry.registerTool(
    'get-conversations',
    'Get list of recent message conversations for the authenticated user. Returns conversation metadata, participants, and latest message preview.',
    {
      limit: z.number().min(1).max(100).default(20).describe('Maximum conversations to return (1-100)'),
      offset: z.number().min(0).default(0).describe('Pagination offset'),
      filter: z.enum(['ALL', 'UNREAD', 'ARCHIVED', 'STARRED']).default('ALL').describe('Filter conversations by status'),
      sortBy: z.enum(['RECENT_ACTIVITY', 'OLDEST_FIRST', 'UNREAD_FIRST']).default('RECENT_ACTIVITY').describe('Sort order'),
      includePreview: z.boolean().default(true).describe('Include preview of last message')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-conversations tool called', { tenantId, params });

      try {
        const client = getClient(tenantId);
        const conversations = await client.getConversations({
          limit: params.limit,
          offset: params.offset,
          filter: params.filter,
          sortBy: params.sortBy
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                conversations: conversations.results,
                pagination: {
                  offset: params.offset,
                  limit: params.limit,
                  count: conversations.results.length,
                  total: conversations.total,
                  hasMore: conversations.hasMore
                },
                metadata: {
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  filter: params.filter,
                  sort_by: params.sortBy,
                  unread_count: conversations.unreadCount
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-conversations tool failed', { error, tenantId, params });
        throw new Error(`Failed to get conversations: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 3: get-messages
  // ============================================================================
  registry.registerTool(
    'get-messages',
    'Get messages from a specific conversation thread. Returns message history with sender info, timestamps, and content. Supports pagination for long threads.',
    {
      conversationId: z.string().describe('LinkedIn conversation ID'),
      limit: z.number().min(1).max(100).default(50).describe('Maximum messages to return (1-100)'),
      before: z.string().optional().describe('Get messages before this message ID (for pagination)'),
      after: z.string().optional().describe('Get messages after this message ID (for newer messages)'),
      includeAttachments: z.boolean().default(true).describe('Include attachment metadata in messages'),
      markAsRead: z.boolean().default(false).describe('Mark messages as read when retrieving')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-messages tool called', { tenantId, conversationId: params.conversationId });

      try {
        const client = getClient(tenantId);
        const messages = await client.getMessages({
          conversationId: params.conversationId,
          limit: params.limit,
          before: params.before,
          after: params.after,
          includeAttachments: params.includeAttachments,
          markAsRead: params.markAsRead
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                messages: messages.results,
                conversation: {
                  id: params.conversationId,
                  participants: messages.participants,
                  total_messages: messages.totalCount
                },
                pagination: {
                  count: messages.results.length,
                  has_more_before: messages.hasMoreBefore,
                  has_more_after: messages.hasMoreAfter,
                  oldest_message_id: messages.results[0]?.id,
                  newest_message_id: messages.results[messages.results.length - 1]?.id
                },
                metadata: {
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  marked_as_read: params.markAsRead,
                  includes_attachments: params.includeAttachments
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-messages tool failed', { error, tenantId, conversationId: params.conversationId });
        throw new Error(`Failed to get messages: ${(error as Error).message}`);
      }
    }
  );

  logger.info('Registered 3 messaging tools');
}
