import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { ChatClient } from '../clients/chat-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const listSpacesSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  pageSize: z.number().optional().describe('Maximum number of spaces to return (1-1000)'),
  pageToken: z.string().optional().describe('Page token for pagination'),
  filter: z.string().optional().describe('Filter query (e.g., "spaceType = SPACE" or "spaceType = DIRECT_MESSAGE")')
});

const getSpaceSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Space name (e.g., spaces/AAAAAAAAAAA)')
});

const createSpaceSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  displayName: z.string().describe('Display name for the space'),
  spaceType: z.enum(['SPACE', 'GROUP_CHAT', 'DIRECT_MESSAGE']).optional().describe('Type of space'),
  singleUserBotDm: z.boolean().optional().describe('Whether this is a DM with a single bot'),
  threaded: z.boolean().optional().describe('Whether the space is threaded'),
  externalUserAllowed: z.boolean().optional().describe('Whether external users are allowed'),
  spaceHistoryState: z.enum(['HISTORY_OFF', 'HISTORY_ON']).optional().describe('History state')
});

const updateSpaceSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Space name (e.g., spaces/AAAAAAAAAAA)'),
  displayName: z.string().optional().describe('New display name'),
  spaceType: z.enum(['SPACE', 'GROUP_CHAT', 'DIRECT_MESSAGE']).optional().describe('Type of space'),
  threaded: z.boolean().optional().describe('Whether the space is threaded'),
  externalUserAllowed: z.boolean().optional().describe('Whether external users are allowed'),
  spaceHistoryState: z.enum(['HISTORY_OFF', 'HISTORY_ON']).optional().describe('History state'),
  updateMask: z.string().optional().describe('Field mask for update (comma-separated fields)')
});

const deleteSpaceSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Space name (e.g., spaces/AAAAAAAAAAA)')
});

const findDirectMessageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('User resource name (e.g., users/123456789)')
});

export function registerSpaceTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // list_spaces
  registry.registerTool(
    'list_spaces',
    'List all Google Chat spaces (rooms and direct messages) accessible to the user',
    listSpacesSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const { data } = await client.api.spaces.list({
        pageSize: params.pageSize,
        pageToken: params.pageToken,
        filter: params.filter
      });

      const spaces = data.spaces?.map(space => client.formatSpace(space)) || [];

      return registry.formatResponse({
        spaces,
        nextPageToken: data.nextPageToken,
        total: spaces.length
      });
    }
  );

  // get_space
  registry.registerTool(
    'get_space',
    'Get details of a specific Google Chat space',
    getSpaceSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedName = client.normalizeSpaceName(params.name);
      const { data } = await client.api.spaces.get({
        name: normalizedName
      });

      return registry.formatResponse(client.formatSpace(data));
    }
  );

  // create_space
  registry.registerTool(
    'create_space',
    'Create a new Google Chat space (room)',
    createSpaceSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const spaceBody: any = {
        displayName: params.displayName,
        spaceType: params.spaceType || 'SPACE',
        singleUserBotDm: params.singleUserBotDm,
        threaded: params.threaded,
        externalUserAllowed: params.externalUserAllowed,
        spaceHistoryState: params.spaceHistoryState
      };

      // Remove undefined fields
      Object.keys(spaceBody).forEach(key => {
        if (spaceBody[key] === undefined) {
          delete spaceBody[key];
        }
      });

      const { data } = await client.api.spaces.create({
        requestBody: spaceBody
      });

      logger.info('Space created', { spaceName: data.name, displayName: data.displayName });

      return registry.formatResponse(client.formatSpace(data));
    }
  );

  // update_space
  registry.registerTool(
    'update_space',
    'Update an existing Google Chat space',
    updateSpaceSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedName = client.normalizeSpaceName(params.name);

      const spaceBody: any = {
        displayName: params.displayName,
        spaceType: params.spaceType,
        threaded: params.threaded,
        externalUserAllowed: params.externalUserAllowed,
        spaceHistoryState: params.spaceHistoryState
      };

      // Remove undefined fields
      Object.keys(spaceBody).forEach(key => {
        if (spaceBody[key] === undefined) {
          delete spaceBody[key];
        }
      });

      // Build update mask if not provided
      let updateMask = params.updateMask;
      if (!updateMask) {
        const fields = Object.keys(spaceBody);
        updateMask = fields.join(',');
      }

      const { data } = await client.api.spaces.patch({
        name: normalizedName,
        updateMask,
        requestBody: spaceBody
      });

      logger.info('Space updated', { spaceName: data.name });

      return registry.formatResponse(client.formatSpace(data));
    }
  );

  // delete_space
  registry.registerTool(
    'delete_space',
    'Delete a Google Chat space',
    deleteSpaceSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedName = client.normalizeSpaceName(params.name);

      await client.api.spaces.delete({
        name: normalizedName
      });

      logger.info('Space deleted', { spaceName: normalizedName });

      return registry.formatResponse({
        success: true,
        message: `Space ${normalizedName} deleted successfully`
      });
    }
  );

  // find_direct_message
  registry.registerTool(
    'find_direct_message',
    'Find or create a direct message space with a specific user',
    findDirectMessageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const { data } = await client.api.spaces.findDirectMessage({
        name: params.name
      });

      return registry.formatResponse(client.formatSpace(data));
    }
  );

  logger.info('Registered 6 space tools');
}
