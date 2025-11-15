/**
 * Google Drive Shared Drives Tools (5 tools)
 * Implements shared drive (Team Drive) management
 */

import { drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GoogleClientFactory } from '../clients/drive-client.js';
import { randomUUID } from 'crypto';

export function registerSharedDriveTools(
  registry: ToolRegistry,
  clientFactory: GoogleClientFactory
): void {
  // 1. list_drives
  registry.registerTool(
    {
      name: 'list_drives',
      description: 'List all shared drives (Team Drives) accessible to the user.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          pageSize: { type: 'number', description: 'Max results (default: 100)', default: 100 }
        },
        required: ['tenantId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.drives.list({
        pageSize: args.pageSize || 100,
        fields: 'drives(id, name, createdTime, capabilities)'
      });

      const drives = response.data.drives || [];
      if (drives.length === 0) {
        return `No shared drives found`;
      }

      const results = drives.map(d =>
        `- "${d.name}" (ID: ${d.id}, Created: ${d.createdTime})`
      );

      return `Found ${drives.length} shared drives:\n${results.join('\n')}`;
    }
  );

  // 2. get_drive
  registry.registerTool(
    {
      name: 'get_drive',
      description: 'Get detailed information about a shared drive.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          driveId: { type: 'string', description: 'Shared drive ID' }
        },
        required: ['tenantId', 'driveId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.drives.get({
        driveId: args.driveId,
        fields: 'id, name, createdTime, capabilities, backgroundImageFile, themeId, colorRgb, restrictions'
      });

      const d = response.data;
      return `Shared Drive: ${d.name}\n` +
             `  ID: ${d.id}\n` +
             `  Created: ${d.createdTime}\n` +
             `  Theme: ${d.themeId || 'Default'}\n` +
             `  Color: ${d.colorRgb || 'N/A'}\n` +
             `  Capabilities: ${JSON.stringify(d.capabilities, null, 2)}`;
    }
  );

  // 3. create_drive
  registry.registerTool(
    {
      name: 'create_drive',
      description: 'Create a new shared drive (Team Drive). Requires domain admin or appropriate permissions.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          name: { type: 'string', description: 'Shared drive name' },
          requestId: { type: 'string', description: 'Unique request ID for idempotency (auto-generated if not provided)' }
        },
        required: ['tenantId', 'name']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const requestId = args.requestId || randomUUID();

      const response = await drive.drives.create({
        requestId,
        requestBody: {
          name: args.name
        },
        fields: 'id, name, createdTime'
      });

      return `✅ Created shared drive "${response.data.name}" (ID: ${response.data.id})`;
    }
  );

  // 4. update_drive
  registry.registerTool(
    {
      name: 'update_drive',
      description: 'Update shared drive settings (name, theme, restrictions).',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          driveId: { type: 'string', description: 'Shared drive ID' },
          name: { type: 'string', description: 'New drive name' },
          colorRgb: { type: 'string', description: 'RGB color (hex format, e.g., #FF0000)' },
          themeId: { type: 'string', description: 'Theme ID' },
          restrictions: {
            type: 'object',
            description: 'Restrictions object (adminManagedRestrictions, etc.)',
            properties: {
              adminManagedRestrictions: { type: 'boolean' },
              copyRequiresWriterPermission: { type: 'boolean' },
              domainUsersOnly: { type: 'boolean' },
              driveMembersOnly: { type: 'boolean' }
            }
          }
        },
        required: ['tenantId', 'driveId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const updateBody: drive_v3.Schema$Drive = {};
      if (args.name) updateBody.name = args.name;
      if (args.colorRgb) updateBody.colorRgb = args.colorRgb;
      if (args.themeId) updateBody.themeId = args.themeId;
      if (args.restrictions) updateBody.restrictions = args.restrictions;

      const response = await drive.drives.update({
        driveId: args.driveId,
        requestBody: updateBody,
        fields: 'id, name, colorRgb, themeId'
      });

      return `✅ Updated shared drive "${response.data.name}" (ID: ${response.data.id})`;
    }
  );

  // 5. delete_drive
  registry.registerTool(
    {
      name: 'delete_drive',
      description: 'Permanently delete a shared drive. Drive must be empty (all files deleted).',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          driveId: { type: 'string', description: 'Shared drive ID to delete' }
        },
        required: ['tenantId', 'driveId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.drives.delete({
        driveId: args.driveId
      });

      return `✅ Deleted shared drive ${args.driveId}`;
    }
  );
}
