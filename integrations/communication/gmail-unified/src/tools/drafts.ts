import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GmailClient } from '../clients/gmail-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const listDraftsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  maxResults: z.number().optional().describe('Maximum drafts to return (1-500)'),
  q: z.string().optional().describe('Gmail search query'),
  includeSpamTrash: z.boolean().optional().describe('Include SPAM and TRASH'),
  includeBodyHtml: z.boolean().optional().describe('Include parsed HTML body')
});

const getDraftSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Draft ID'),
  includeBodyHtml: z.boolean().optional().describe('Include parsed HTML body')
});

const createDraftSchema = z.object({
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

const updateDraftSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Draft ID to update'),
  raw: z.string().optional().describe('Base64url encoded RFC 2822 message'),
  threadId: z.string().optional().describe('Thread ID to associate with'),
  to: z.array(z.string()).optional().describe('Recipient email addresses'),
  cc: z.array(z.string()).optional().describe('CC email addresses'),
  bcc: z.array(z.string()).optional().describe('BCC email addresses'),
  subject: z.string().optional().describe('Email subject'),
  body: z.string().optional().describe('Email body'),
  includeBodyHtml: z.boolean().optional().describe('Include parsed HTML body in response')
});

const sendDraftSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Draft ID to send')
});

const deleteDraftSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Draft ID to delete')
});

export function registerDraftTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // list_drafts
  registry.registerTool(
    'list_drafts',
    'List drafts in the mailbox',
    listDraftsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      let drafts: any[] = [];
      const { data } = await client.api.users.drafts.list({
        userId: 'me',
        maxResults: params.maxResults,
        q: params.q,
        includeSpamTrash: params.includeSpamTrash
      });

      drafts.push(...(data.drafts || []));

      // Handle pagination
      let nextPageToken = data.nextPageToken;
      while (nextPageToken) {
        const { data: nextData } = await client.api.users.drafts.list({
          userId: 'me',
          maxResults: params.maxResults,
          q: params.q,
          includeSpamTrash: params.includeSpamTrash,
          pageToken: nextPageToken
        });
        drafts.push(...(nextData.drafts || []));
        nextPageToken = nextData.nextPageToken;
      }

      // Process message parts
      drafts = drafts.map((draft: any) => {
        if (draft.message?.payload) {
          draft.message.payload = client.processMessagePart(
            draft.message.payload,
            params.includeBodyHtml
          );
        }
        return draft;
      });

      return registry.formatResponse(drafts);
    }
  );

  // get_draft
  registry.registerTool(
    'get_draft',
    'Get a specific draft by ID',
    getDraftSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.drafts.get({
        userId: 'me',
        id: params.id,
        format: 'full'
      });

      if (data.message?.payload) {
        data.message.payload = client.processMessagePart(
          data.message.payload,
          params.includeBodyHtml
        );
      }

      return registry.formatResponse(data);
    }
  );

  // create_draft
  registry.registerTool(
    'create_draft',
    'Create a new draft email',
    createDraftSchema,
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

      const { data } = await client.api.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw,
            threadId: params.threadId
          }
        }
      });

      if (data.message?.payload) {
        data.message.payload = client.processMessagePart(
          data.message.payload,
          params.includeBodyHtml
        );
      }

      return registry.formatResponse(data);
    }
  );

  // update_draft
  registry.registerTool(
    'update_draft',
    'Update an existing draft',
    updateDraftSchema,
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

      const { data } = await client.api.users.drafts.update({
        userId: 'me',
        id: params.id,
        requestBody: {
          message: {
            raw,
            threadId: params.threadId,
            id: params.id
          }
        }
      });

      if (data.message?.payload) {
        data.message.payload = client.processMessagePart(
          data.message.payload,
          params.includeBodyHtml
        );
      }

      return registry.formatResponse(data);
    }
  );

  // send_draft
  registry.registerTool(
    'send_draft',
    'Send an existing draft',
    sendDraftSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      try {
        const { data } = await client.api.users.drafts.send({
          userId: 'me',
          requestBody: { id: params.id }
        });
        return registry.formatResponse(data);
      } catch (error: any) {
        return registry.formatResponse({
          error: 'Error sending draft. Ensure you have at least one recipient.',
          details: error.message
        });
      }
    }
  );

  // delete_draft
  registry.registerTool(
    'delete_draft',
    'Delete a draft',
    deleteDraftSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.drafts.delete({
        userId: 'me',
        id: params.id
      });

      return registry.formatResponse(data);
    }
  );

  logger.info('Registered 6 draft tools');
}
