import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { ChatClient } from '../clients/chat-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const searchMessagesSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  query: z.string().describe('Search query text'),
  spaceId: z.string().optional().describe('Specific space to search within'),
  pageSize: z.number().optional().describe('Maximum number of messages to return (1-100)')
});

const setSpaceTopicSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Space name (e.g., spaces/AAAAAAAAAAA)'),
  topic: z.string().describe('New topic/description for the space')
});

const batchAddMembersSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  parent: z.string().describe('Parent space name (e.g., spaces/AAAAAAAAAAA)'),
  memberNames: z.array(z.string()).describe('Array of member names to add (e.g., ["users/123", "users/456"])'),
  role: z.enum(['ROLE_UNSPECIFIED', 'ROLE_MEMBER', 'ROLE_MANAGER']).optional().describe('Role for all members')
});

export function registerAdvancedTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // search_messages
  registry.registerTool(
    'search_messages',
    'Search for messages across Google Chat spaces',
    searchMessagesSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const pageSize = params.pageSize || 25;
      let searchResults: any[] = [];

      if (params.spaceId) {
        // Search within specific space
        const normalizedSpace = client.normalizeSpaceName(params.spaceId);
        const { data } = await client.api.spaces.messages.list({
          parent: normalizedSpace,
          pageSize,
          filter: `text:"${params.query}"`
        });

        searchResults = data.messages?.map(msg => ({
          ...client.formatMessage(msg),
          spaceName: normalizedSpace
        })) || [];
      } else {
        // Search across all accessible spaces
        const { data: spacesData } = await client.api.spaces.list({
          pageSize: 100
        });

        const spaces = spacesData.spaces || [];

        // Search first 10 spaces to avoid timeout
        for (const space of spaces.slice(0, 10)) {
          try {
            const { data } = await client.api.spaces.messages.list({
              parent: space.name!,
              pageSize: 5,
              filter: `text:"${params.query}"`
            });

            const spaceMessages = data.messages?.map(msg => ({
              ...client.formatMessage(msg),
              spaceName: space.displayName || space.name
            })) || [];

            searchResults.push(...spaceMessages);
          } catch (error) {
            // Skip spaces we can't access
            continue;
          }
        }
      }

      logger.info('Message search completed', {
        query: params.query,
        resultsCount: searchResults.length
      });

      return registry.formatResponse({
        query: params.query,
        results: searchResults,
        total: searchResults.length
      });
    }
  );

  // set_space_topic
  registry.registerTool(
    'set_space_topic',
    'Set or update the topic/description of a Google Chat space',
    setSpaceTopicSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedName = client.normalizeSpaceName(params.name);

      const { data } = await client.api.spaces.patch({
        name: normalizedName,
        updateMask: 'spaceDetails.description',
        requestBody: {
          spaceDetails: {
            description: params.topic
          }
        }
      });

      logger.info('Space topic updated', { spaceName: normalizedName });

      return registry.formatResponse(client.formatSpace(data));
    }
  );

  // batch_add_members
  registry.registerTool(
    'batch_add_members',
    'Add multiple members to a Google Chat space in batch',
    batchAddMembersSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedParent = client.normalizeSpaceName(params.parent);

      const results: any[] = [];
      const errors: any[] = [];

      // Add members sequentially (Chat API doesn't have native batch endpoint)
      for (const memberName of params.memberNames) {
        try {
          const membershipBody: any = {
            member: {
              name: memberName
            }
          };

          if (params.role) {
            membershipBody.role = params.role;
          }

          const { data } = await client.api.spaces.members.create({
            parent: normalizedParent,
            requestBody: membershipBody
          });

          results.push(client.formatMembership(data));
        } catch (error: any) {
          errors.push({
            memberName,
            error: error.message
          });
        }
      }

      logger.info('Batch add members completed', {
        space: normalizedParent,
        successful: results.length,
        failed: errors.length
      });

      return registry.formatResponse({
        successful: results,
        failed: errors,
        totalRequested: params.memberNames.length,
        successCount: results.length,
        failureCount: errors.length
      });
    }
  );

  logger.info('Registered 3 advanced tools');
}
