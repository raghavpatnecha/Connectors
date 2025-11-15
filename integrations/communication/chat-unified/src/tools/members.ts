import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { ChatClient } from '../clients/chat-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const listMembershipsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  parent: z.string().describe('Parent space name (e.g., spaces/AAAAAAAAAAA)'),
  pageSize: z.number().optional().describe('Maximum number of memberships to return (1-1000)'),
  pageToken: z.string().optional().describe('Page token for pagination'),
  filter: z.string().optional().describe('Filter query (e.g., "member.type = HUMAN")')
});

const getMembershipSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Membership name (e.g., spaces/AAAAAAAAAAA/members/BBBBBBBBBBB)')
});

const createMembershipSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  parent: z.string().describe('Parent space name (e.g., spaces/AAAAAAAAAAA)'),
  memberName: z.string().describe('Member name to add (e.g., users/123456789)'),
  role: z.enum(['ROLE_UNSPECIFIED', 'ROLE_MEMBER', 'ROLE_MANAGER']).optional().describe('Role in the space')
});

const deleteMembershipSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Membership name (e.g., spaces/AAAAAAAAAAA/members/BBBBBBBBBBB)')
});

export function registerMemberTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // list_memberships
  registry.registerTool(
    'list_memberships',
    'List all members in a Google Chat space',
    listMembershipsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedParent = client.normalizeSpaceName(params.parent);

      const { data } = await client.api.spaces.members.list({
        parent: normalizedParent,
        pageSize: params.pageSize,
        pageToken: params.pageToken,
        filter: params.filter
      });

      const memberships = data.memberships?.map(member => client.formatMembership(member)) || [];

      return registry.formatResponse({
        memberships,
        nextPageToken: data.nextPageToken,
        total: memberships.length
      });
    }
  );

  // get_membership
  registry.registerTool(
    'get_membership',
    'Get details of a specific membership in a Google Chat space',
    getMembershipSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const { data } = await client.api.spaces.members.get({
        name: params.name
      });

      return registry.formatResponse(client.formatMembership(data));
    }
  );

  // create_membership
  registry.registerTool(
    'create_membership',
    'Add a member to a Google Chat space',
    createMembershipSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedParent = client.normalizeSpaceName(params.parent);

      const membershipBody: any = {
        member: {
          name: params.memberName
        }
      };

      if (params.role) {
        membershipBody.role = params.role;
      }

      const { data } = await client.api.spaces.members.create({
        parent: normalizedParent,
        requestBody: membershipBody
      });

      logger.info('Member added', { membershipName: data.name, space: normalizedParent });

      return registry.formatResponse(client.formatMembership(data));
    }
  );

  // delete_membership
  registry.registerTool(
    'delete_membership',
    'Remove a member from a Google Chat space',
    deleteMembershipSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      await client.api.spaces.members.delete({
        name: params.name
      });

      logger.info('Member removed', { membershipName: params.name });

      return registry.formatResponse({
        success: true,
        message: `Membership ${params.name} deleted successfully`
      });
    }
  );

  logger.info('Registered 4 member tools');
}
