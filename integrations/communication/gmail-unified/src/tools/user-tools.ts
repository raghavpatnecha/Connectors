import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GmailClient } from '../clients/gmail-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const getProfileSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials')
});

const watchMailboxSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  topicName: z.string().describe('Cloud Pub/Sub topic name for notifications'),
  labelIds: z.array(z.string()).optional().describe('Label IDs to restrict notifications'),
  labelFilterAction: z.enum(['include', 'exclude']).optional().describe('Include or exclude specified labels')
});

const stopMailWatchSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials')
});

export function registerUserTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // get_profile
  registry.registerTool(
    'get_profile',
    "Get the current user's Gmail profile information",
    getProfileSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.getProfile({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  // watch_mailbox
  registry.registerTool(
    'watch_mailbox',
    'Set up push notifications for mailbox changes via Cloud Pub/Sub',
    watchMailboxSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.watch({
        userId: 'me',
        requestBody: {
          topicName: params.topicName,
          labelIds: params.labelIds,
          labelFilterAction: params.labelFilterAction
        }
      });
      return registry.formatResponse(data);
    }
  );

  // stop_mail_watch
  registry.registerTool(
    'stop_mail_watch',
    'Stop receiving push notifications for the mailbox',
    stopMailWatchSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);

      const { data } = await client.api.users.stop({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  logger.info('Registered 3 user management tools');
}
