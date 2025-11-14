import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GmailClient } from '../clients/gmail-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const listLabelsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials')
});

const getLabelSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Label ID')
});

const createLabelSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Label display name'),
  messageListVisibility: z.enum(['show', 'hide']).optional().describe('Message list visibility'),
  labelListVisibility: z.enum(['labelShow', 'labelShowIfUnread', 'labelHide']).optional().describe('Label list visibility'),
  color: z.object({
    textColor: z.string().describe('Text color hex'),
    backgroundColor: z.string().describe('Background color hex')
  }).optional().describe('Label color settings')
});

const updateLabelSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Label ID to update'),
  name: z.string().optional().describe('Label display name'),
  messageListVisibility: z.enum(['show', 'hide']).optional().describe('Message list visibility'),
  labelListVisibility: z.enum(['labelShow', 'labelShowIfUnread', 'labelHide']).optional().describe('Label list visibility'),
  color: z.object({
    textColor: z.string().describe('Text color hex'),
    backgroundColor: z.string().describe('Background color hex')
  }).optional().describe('Label color settings')
});

const patchLabelSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Label ID to patch'),
  name: z.string().optional().describe('Label display name'),
  messageListVisibility: z.enum(['show', 'hide']).optional().describe('Message list visibility'),
  labelListVisibility: z.enum(['labelShow', 'labelShowIfUnread', 'labelHide']).optional().describe('Label list visibility'),
  color: z.object({
    textColor: z.string().describe('Text color hex'),
    backgroundColor: z.string().describe('Background color hex')
  }).optional().describe('Label color settings')
});

const deleteLabelSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Label ID to delete')
});

export function registerLabelTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // list_labels
  registry.registerTool(
    'list_labels',
    'List all labels in the mailbox',
    listLabelsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.labels.list({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  // get_label
  registry.registerTool(
    'get_label',
    'Get a specific label by ID',
    getLabelSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.labels.get({
        userId: 'me',
        id: params.id
      });
      return registry.formatResponse(data);
    }
  );

  // create_label
  registry.registerTool(
    'create_label',
    'Create a new label',
    createLabelSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { tenantId, ...labelData } = params;
      const { data } = await client.api.users.labels.create({
        userId: 'me',
        requestBody: labelData
      });
      return registry.formatResponse(data);
    }
  );

  // update_label
  registry.registerTool(
    'update_label',
    'Update an existing label (full update)',
    updateLabelSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { tenantId, id, ...labelData } = params;
      const { data } = await client.api.users.labels.update({
        userId: 'me',
        id,
        requestBody: labelData
      });
      return registry.formatResponse(data);
    }
  );

  // patch_label
  registry.registerTool(
    'patch_label',
    'Patch an existing label (partial update)',
    patchLabelSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { tenantId, id, ...labelData } = params;
      const { data } = await client.api.users.labels.patch({
        userId: 'me',
        id,
        requestBody: labelData
      });
      return registry.formatResponse(data);
    }
  );

  // delete_label
  registry.registerTool(
    'delete_label',
    'Delete a label',
    deleteLabelSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.labels.delete({
        userId: 'me',
        id: params.id
      });
      return registry.formatResponse(data);
    }
  );

  logger.info('Registered 6 label tools');
}
