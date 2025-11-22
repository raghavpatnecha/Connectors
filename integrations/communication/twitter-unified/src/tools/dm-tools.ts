/**
 * Direct Message Tools
 * Based on mcp-twikit implementation
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const DM_TOOLS: Tool[] = [
  {
    name: 'send_dm',
    description: 'Send a direct message to a user with optional media attachment',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The ID of the user to send the message to'
        },
        message: {
          type: 'string',
          description: 'The message text content'
        },
        mediaPath: {
          type: 'string',
          description: 'Optional local file path to media attachment'
        }
      },
      required: ['userId', 'message']
    }
  },
  {
    name: 'delete_dm',
    description: 'Delete a direct message by its ID',
    inputSchema: {
      type: 'object',
      properties: {
        messageId: {
          type: 'string',
          description: 'The ID of the message to delete'
        }
      },
      required: ['messageId']
    }
  }
];

/**
 * DM tool handlers
 */
export class DMToolHandlers {
  constructor(private client: TwitterClient) {}

  async sendDM(args: any, tenantId: string): Promise<any> {
    const { userId, message, mediaPath } = args;

    // Check rate limit (1000 DMs per 15 minutes)
    // This will be implemented in rate limiter

    let mediaId = null;
    if (mediaPath) {
      // Upload media first
      const mediaUpload = await this.client.request(
        'POST',
        '/media/upload',
        tenantId,
        { media: mediaPath }
      );
      mediaId = mediaUpload.media_id_string;
    }

    const payload: any = {
      text: message,
      participant_id: userId
    };

    if (mediaId) {
      payload.media_id = mediaId;
    }

    return await this.client.request(
      'POST',
      '/dm_conversations/with/:participant_id/messages',
      tenantId,
      payload
    );
  }

  async deleteDM(args: any, tenantId: string): Promise<any> {
    const { messageId } = args;

    return await this.client.request(
      'DELETE',
      `/dm_conversations/messages/${messageId}`,
      tenantId
    );
  }
}
