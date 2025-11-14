import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GmailClient } from '../clients/gmail-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const listThreadsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  maxResults: z.number().optional().describe('Maximum threads to return'),
  pageToken: z.string().optional().describe('Page token for pagination'),
  q: z.string().optional().describe('Gmail search query'),
  labelIds: z.array(z.string()).optional().describe('Filter by label IDs'),
  includeSpamTrash: z.boolean().optional().describe('Include SPAM and TRASH'),
  includeBodyHtml: z.boolean().optional().describe('Include parsed HTML body')
});

const getThreadSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Thread ID'),
  includeBodyHtml: z.boolean().optional().describe('Include parsed HTML body')
});

const modifyThreadSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Thread ID'),
  addLabelIds: z.array(z.string()).optional().describe('Label IDs to add'),
  removeLabelIds: z.array(z.string()).optional().describe('Label IDs to remove')
});

const trashThreadSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Thread ID to trash')
});

const untrashThreadSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Thread ID to untrash')
});

const deleteThreadSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Thread ID to delete')
});

export function registerThreadTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // list_threads
  registry.registerTool(
    'list_threads',
    'List threads in the mailbox',
    listThreadsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.threads.list({
        userId: 'me',
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        q: params.q,
        labelIds: params.labelIds,
        includeSpamTrash: params.includeSpamTrash
      });

      if (data.threads) {
        data.threads = data.threads.map((thread: any) => {
          if (thread.messages) {
            thread.messages = thread.messages.map((message: any) => {
              if (message.payload) {
                message.payload = client.processMessagePart(
                  message.payload,
                  params.includeBodyHtml
                );
              }
              return message;
            });
          }
          return thread;
        });
      }

      return registry.formatResponse(data);
    }
  );

  // get_thread
  registry.registerTool(
    'get_thread',
    'Get a specific thread by ID with all messages',
    getThreadSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.threads.get({
        userId: 'me',
        id: params.id,
        format: 'full'
      });

      if (data.messages) {
        data.messages = data.messages.map((message: any) => {
          if (message.payload) {
            message.payload = client.processMessagePart(
              message.payload,
              params.includeBodyHtml
            );
          }
          return message;
        });
      }

      return registry.formatResponse(data);
    }
  );

  // modify_thread
  registry.registerTool(
    'modify_thread',
    'Modify labels applied to a thread',
    modifyThreadSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.threads.modify({
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

  // trash_thread
  registry.registerTool(
    'trash_thread',
    'Move a thread to trash',
    trashThreadSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.threads.trash({
        userId: 'me',
        id: params.id
      });

      return registry.formatResponse(data);
    }
  );

  // untrash_thread
  registry.registerTool(
    'untrash_thread',
    'Remove a thread from trash',
    untrashThreadSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.threads.untrash({
        userId: 'me',
        id: params.id
      });

      return registry.formatResponse(data);
    }
  );

  // delete_thread
  registry.registerTool(
    'delete_thread',
    'Permanently delete a thread',
    deleteThreadSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.threads.delete({
        userId: 'me',
        id: params.id
      });

      return registry.formatResponse(data);
    }
  );

  logger.info('Registered 6 thread tools');
}
