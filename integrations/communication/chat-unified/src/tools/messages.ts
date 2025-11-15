import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { ChatClient } from '../clients/chat-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const listMessagesSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  parent: z.string().describe('Parent space name (e.g., spaces/AAAAAAAAAAA)'),
  pageSize: z.number().optional().describe('Maximum number of messages to return (1-1000)'),
  pageToken: z.string().optional().describe('Page token for pagination'),
  filter: z.string().optional().describe('Filter query'),
  orderBy: z.string().optional().describe('Order by field (e.g., "createTime desc")')
});

const getMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Message name (e.g., spaces/AAAAAAAAAAA/messages/BBBBBBBBBBB)')
});

const createMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  parent: z.string().describe('Parent space name (e.g., spaces/AAAAAAAAAAA)'),
  text: z.string().describe('Message text content'),
  threadKey: z.string().optional().describe('Thread key for creating a new thread or replying'),
  messageId: z.string().optional().describe('Client-assigned message ID'),
  requestId: z.string().optional().describe('Request ID for idempotency'),
  messageReplyOption: z.enum(['MESSAGE_REPLY_OPTION_UNSPECIFIED', 'REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD', 'REPLY_MESSAGE_OR_FAIL']).optional().describe('How to handle thread replies')
});

const updateMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Message name (e.g., spaces/AAAAAAAAAAA/messages/BBBBBBBBBBB)'),
  text: z.string().describe('Updated message text'),
  updateMask: z.string().optional().describe('Field mask for update (comma-separated fields)')
});

const deleteMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Message name (e.g., spaces/AAAAAAAAAAA/messages/BBBBBBBBBBB)')
});

export function registerMessageTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // list_messages
  registry.registerTool(
    'list_messages',
    'List messages in a Google Chat space',
    listMessagesSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedParent = client.normalizeSpaceName(params.parent);

      const { data } = await client.api.spaces.messages.list({
        parent: normalizedParent,
        pageSize: params.pageSize,
        pageToken: params.pageToken,
        filter: params.filter,
        orderBy: params.orderBy || 'createTime desc'
      });

      const messages = data.messages?.map(msg => client.formatMessage(msg)) || [];

      return registry.formatResponse({
        messages,
        nextPageToken: data.nextPageToken,
        total: messages.length
      });
    }
  );

  // get_message
  registry.registerTool(
    'get_message',
    'Get a specific message from Google Chat',
    getMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const { data } = await client.api.spaces.messages.get({
        name: params.name
      });

      return registry.formatResponse(client.formatMessage(data));
    }
  );

  // create_message
  registry.registerTool(
    'create_message',
    'Send a message to a Google Chat space',
    createMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedParent = client.normalizeSpaceName(params.parent);

      const messageBody: any = {
        text: params.text
      };

      const requestParams: any = {
        parent: normalizedParent,
        requestBody: messageBody
      };

      if (params.threadKey) {
        requestParams.threadKey = params.threadKey;
      }

      if (params.messageId) {
        requestParams.messageId = params.messageId;
      }

      if (params.requestId) {
        requestParams.requestId = params.requestId;
      }

      if (params.messageReplyOption) {
        requestParams.messageReplyOption = params.messageReplyOption;
      }

      const { data } = await client.api.spaces.messages.create(requestParams);

      logger.info('Message sent', { messageName: data.name, space: normalizedParent });

      return registry.formatResponse(client.formatMessage(data));
    }
  );

  // update_message
  registry.registerTool(
    'update_message',
    'Update an existing message in Google Chat',
    updateMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const messageBody: any = {
        text: params.text
      };

      const updateMask = params.updateMask || 'text';

      const { data } = await client.api.spaces.messages.patch({
        name: params.name,
        updateMask,
        requestBody: messageBody
      });

      logger.info('Message updated', { messageName: data.name });

      return registry.formatResponse(client.formatMessage(data));
    }
  );

  // delete_message
  registry.registerTool(
    'delete_message',
    'Delete a message from Google Chat',
    deleteMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      await client.api.spaces.messages.delete({
        name: params.name
      });

      logger.info('Message deleted', { messageName: params.name });

      return registry.formatResponse({
        success: true,
        message: `Message ${params.name} deleted successfully`
      });
    }
  );

  logger.info('Registered 5 message tools');
}
