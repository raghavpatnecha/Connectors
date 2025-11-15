import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GmailClient } from '../clients/gmail-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const listMessagesSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  maxResults: z.number().optional().describe('Maximum messages to return (1-500)'),
  pageToken: z.string().optional().describe('Page token for pagination'),
  q: z.string().optional().describe('Gmail search query'),
  labelIds: z.array(z.string()).optional().describe('Filter by label IDs'),
  includeSpamTrash: z.boolean().optional().describe('Include SPAM and TRASH'),
  includeBodyHtml: z.boolean().optional().describe('Include parsed HTML body')
});

const getMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Message ID'),
  includeBodyHtml: z.boolean().optional().describe('Include parsed HTML body')
});

const sendMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  raw: z.string().optional().describe('Base64url encoded RFC 2822 message'),
  threadId: z.string().optional().describe('Thread ID to associate with'),
  to: z.array(z.string()).optional().describe('Recipient email addresses'),
  cc: z.array(z.string()).optional().describe('CC email addresses'),
  bcc: z.array(z.string()).optional().describe('BCC email addresses'),
  subject: z.string().optional().describe('Email subject'),
  body: z.string().optional().describe('Email body'),
  includeBodyHtml: z.boolean().optional().describe('Include parsed HTML body in response')
});

const deleteMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Message ID to delete')
});

const trashMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Message ID to trash')
});

const untrashMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Message ID to untrash')
});

const modifyMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Message ID'),
  addLabelIds: z.array(z.string()).optional().describe('Label IDs to add'),
  removeLabelIds: z.array(z.string()).optional().describe('Label IDs to remove')
});

const batchModifyMessagesSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  ids: z.array(z.string()).describe('Message IDs to modify'),
  addLabelIds: z.array(z.string()).optional().describe('Label IDs to add'),
  removeLabelIds: z.array(z.string()).optional().describe('Label IDs to remove')
});

const batchDeleteMessagesSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  ids: z.array(z.string()).describe('Message IDs to delete')
});

const getAttachmentSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  messageId: z.string().describe('Message ID containing attachment'),
  id: z.string().describe('Attachment ID')
});

const importMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  raw: z.string().describe('Base64url encoded RFC 2822 message'),
  internalDateSource: z.enum(['dateHeader', 'receivedTime']).optional().describe('Source for internal date'),
  neverMarkSpam: z.boolean().optional().describe('Never mark as spam'),
  processForCalendar: z.boolean().optional().describe('Process for calendar events'),
  deleted: z.boolean().optional().describe('Mark as deleted'),
  labelIds: z.array(z.string()).optional().describe('Label IDs to apply')
});

export function registerMessageTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // list_messages
  registry.registerTool(
    'list_messages',
    'List messages in the mailbox with optional filtering',
    listMessagesSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.list({
        userId: 'me',
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        q: params.q,
        labelIds: params.labelIds,
        includeSpamTrash: params.includeSpamTrash
      });

      if (data.messages) {
        data.messages = data.messages.map((message: any) => {
          if (message.payload) {
            message.payload = client.processMessagePart(message.payload, params.includeBodyHtml);
          }
          return message;
        });
      }

      return registry.formatResponse(data);
    }
  );

  // get_message
  registry.registerTool(
    'get_message',
    'Get a specific message by ID with full details',
    getMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.get({
        userId: 'me',
        id: params.id,
        format: 'full'
      });

      if (data.payload) {
        data.payload = client.processMessagePart(data.payload, params.includeBodyHtml);
      }

      return registry.formatResponse(data);
    }
  );

  // send_message
  registry.registerTool(
    'send_message',
    'Send an email message to specified recipients',
    sendMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      let raw = params.raw;
      if (!raw) {
        raw = await client.constructRawMessage({
          threadId: params.threadId,
          to: params.to,
          cc: params.cc,
          bcc: params.bcc,
          subject: params.subject,
          body: params.body
        });
      }

      const { data } = await client.api.users.messages.send({
        userId: 'me',
        requestBody: {
          raw,
          threadId: params.threadId
        }
      });

      if (data.payload) {
        data.payload = client.processMessagePart(data.payload, params.includeBodyHtml);
      }

      return registry.formatResponse(data);
    }
  );

  // delete_message
  registry.registerTool(
    'delete_message',
    'Permanently delete a message immediately',
    deleteMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.delete({
        userId: 'me',
        id: params.id
      });

      return registry.formatResponse(data);
    }
  );

  // trash_message
  registry.registerTool(
    'trash_message',
    'Move a message to trash',
    trashMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.trash({
        userId: 'me',
        id: params.id
      });

      return registry.formatResponse(data);
    }
  );

  // untrash_message
  registry.registerTool(
    'untrash_message',
    'Remove a message from trash',
    untrashMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.untrash({
        userId: 'me',
        id: params.id
      });

      return registry.formatResponse(data);
    }
  );

  // modify_message
  registry.registerTool(
    'modify_message',
    'Modify labels on a message',
    modifyMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.modify({
        userId: 'me',
        id: params.id,
        requestBody: {
          addLabelIds: params.addLabelIds,
          removeLabelIds: params.removeLabelIds
        }
      });

      return registry.formatResponse(data);
    }
  );

  // batch_modify_messages
  registry.registerTool(
    'batch_modify_messages',
    'Modify labels on multiple messages in batch',
    batchModifyMessagesSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.batchModify({
        userId: 'me',
        requestBody: {
          ids: params.ids,
          addLabelIds: params.addLabelIds,
          removeLabelIds: params.removeLabelIds
        }
      });

      return registry.formatResponse(data);
    }
  );

  // batch_delete_messages
  registry.registerTool(
    'batch_delete_messages',
    'Delete multiple messages in batch',
    batchDeleteMessagesSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.batchDelete({
        userId: 'me',
        requestBody: { ids: params.ids }
      });

      return registry.formatResponse(data);
    }
  );

  // get_attachment
  registry.registerTool(
    'get_attachment',
    'Get a message attachment by ID',
    getAttachmentSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.attachments.get({
        userId: 'me',
        messageId: params.messageId,
        id: params.id
      });

      return registry.formatResponse(data);
    }
  );

  // import_message
  registry.registerTool(
    'import_message',
    'Import a message into the mailbox',
    importMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.messages.import({
        userId: 'me',
        internalDateSource: params.internalDateSource,
        neverMarkSpam: params.neverMarkSpam,
        processForCalendar: params.processForCalendar,
        deleted: params.deleted,
        requestBody: {
          raw: params.raw,
          labelIds: params.labelIds
        }
      });

      return registry.formatResponse(data);
    }
  );

  logger.info('Registered 11 message tools');
}
