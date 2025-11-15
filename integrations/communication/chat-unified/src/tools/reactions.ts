import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { ChatClient } from '../clients/chat-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const listReactionsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  parent: z.string().describe('Parent message name (e.g., spaces/AAAAAAAAAAA/messages/BBBBBBBBBBB)'),
  pageSize: z.number().optional().describe('Maximum number of reactions to return'),
  pageToken: z.string().optional().describe('Page token for pagination'),
  filter: z.string().optional().describe('Filter query')
});

const createReactionSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  parent: z.string().describe('Parent message name (e.g., spaces/AAAAAAAAAAA/messages/BBBBBBBBBBB)'),
  emoji: z.string().describe('Emoji unicode or shortcode (e.g., "👍" or ":thumbsup:")'),
  customEmoji: z.string().optional().describe('Custom emoji ID for workspace emoji')
});

const deleteReactionSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Reaction name (e.g., spaces/AAAAAAAAAAA/messages/BBBBBBBBBBB/reactions/CCCCCCCCCCC)')
});

export function registerReactionTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // list_reactions
  registry.registerTool(
    'list_reactions',
    'List all reactions on a Google Chat message',
    listReactionsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const { data } = await client.api.spaces.messages.reactions.list({
        parent: params.parent,
        pageSize: params.pageSize,
        pageToken: params.pageToken,
        filter: params.filter
      });

      const reactions = data.reactions || [];

      return registry.formatResponse({
        reactions,
        nextPageToken: data.nextPageToken,
        total: reactions.length
      });
    }
  );

  // create_reaction
  registry.registerTool(
    'create_reaction',
    'Add a reaction to a Google Chat message',
    createReactionSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const reactionBody: any = {
        emoji: {
          unicode: params.emoji
        }
      };

      if (params.customEmoji) {
        reactionBody.emoji.customEmoji = {
          uid: params.customEmoji
        };
        delete reactionBody.emoji.unicode;
      }

      const { data } = await client.api.spaces.messages.reactions.create({
        parent: params.parent,
        requestBody: reactionBody
      });

      logger.info('Reaction created', { reactionName: data.name, parent: params.parent });

      return registry.formatResponse(data);
    }
  );

  // delete_reaction
  registry.registerTool(
    'delete_reaction',
    'Remove a reaction from a Google Chat message',
    deleteReactionSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      await client.api.spaces.messages.reactions.delete({
        name: params.name
      });

      logger.info('Reaction deleted', { reactionName: params.name });

      return registry.formatResponse({
        success: true,
        message: `Reaction ${params.name} deleted successfully`
      });
    }
  );

  logger.info('Registered 3 reaction tools');
}
