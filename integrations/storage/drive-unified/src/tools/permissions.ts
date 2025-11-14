/**
 * Google Drive Permission Tools (5 tools)
 * Implements file/folder sharing and permission management
 */

import { drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GoogleClientFactory } from '../clients/drive-client.js';

export function registerPermissionTools(
  registry: ToolRegistry,
  clientFactory: GoogleClientFactory
): void {
  // 1. list_permissions
  registry.registerTool(
    {
      name: 'list_permissions',
      description: 'List all permissions for a file or folder.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File/folder ID' }
        },
        required: ['tenantId', 'fileId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.permissions.list({
        fileId: args.fileId,
        fields: 'permissions(id, type, role, emailAddress, domain, displayName)',
        supportsAllDrives: true
      });

      const permissions = response.data.permissions || [];
      if (permissions.length === 0) {
        return `No permissions found for file ${args.fileId}`;
      }

      const results = permissions.map(p => {
        const identity = p.emailAddress || p.domain || p.type;
        return `- Permission ${p.id}: ${identity} (${p.role})`;
      });

      return `Found ${permissions.length} permissions:\n${results.join('\n')}`;
    }
  );

  // 2. get_permission
  registry.registerTool(
    {
      name: 'get_permission',
      description: 'Get details of a specific permission.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File/folder ID' },
          permissionId: { type: 'string', description: 'Permission ID' }
        },
        required: ['tenantId', 'fileId', 'permissionId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.permissions.get({
        fileId: args.fileId,
        permissionId: args.permissionId,
        fields: 'id, type, role, emailAddress, domain, displayName, expirationTime',
        supportsAllDrives: true
      });

      const p = response.data;
      const identity = p.emailAddress || p.domain || p.type;

      return `Permission ${p.id}:\n` +
             `  Type: ${p.type}\n` +
             `  Role: ${p.role}\n` +
             `  Identity: ${identity}\n` +
             `  Display Name: ${p.displayName || 'N/A'}\n` +
             `  Expiration: ${p.expirationTime || 'Never'}`;
    }
  );

  // 3. create_permission
  registry.registerTool(
    {
      name: 'create_permission',
      description: 'Share file/folder with user, group, domain, or anyone. Creates new permission.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File/folder ID to share' },
          type: {
            type: 'string',
            description: 'Permission type: user, group, domain, anyone',
            enum: ['user', 'group', 'domain', 'anyone']
          },
          role: {
            type: 'string',
            description: 'Access role: reader, writer, commenter, owner',
            enum: ['reader', 'writer', 'commenter', 'owner']
          },
          emailAddress: { type: 'string', description: 'Email for user/group (required if type=user or group)' },
          domain: { type: 'string', description: 'Domain name (required if type=domain)' },
          sendNotificationEmail: { type: 'boolean', description: 'Send email notification', default: true },
          expirationTime: { type: 'string', description: 'RFC 3339 expiration time (optional)' }
        },
        required: ['tenantId', 'fileId', 'type', 'role']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const permission: drive_v3.Schema$Permission = {
        type: args.type,
        role: args.role
      };

      if (args.emailAddress) permission.emailAddress = args.emailAddress;
      if (args.domain) permission.domain = args.domain;
      if (args.expirationTime) permission.expirationTime = args.expirationTime;

      const response = await drive.permissions.create({
        fileId: args.fileId,
        requestBody: permission,
        sendNotificationEmail: args.sendNotificationEmail !== false,
        supportsAllDrives: true,
        fields: 'id, type, role, emailAddress'
      });

      const identity = response.data.emailAddress || response.data.type;
      return `✅ Created permission (ID: ${response.data.id}) for ${identity} with role ${response.data.role}`;
    }
  );

  // 4. update_permission
  registry.registerTool(
    {
      name: 'update_permission',
      description: 'Update an existing permission (change role).',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File/folder ID' },
          permissionId: { type: 'string', description: 'Permission ID to update' },
          role: {
            type: 'string',
            description: 'New role: reader, writer, commenter, owner',
            enum: ['reader', 'writer', 'commenter', 'owner']
          },
          expirationTime: { type: 'string', description: 'RFC 3339 expiration time (optional)' }
        },
        required: ['tenantId', 'fileId', 'permissionId', 'role']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const permission: drive_v3.Schema$Permission = {
        role: args.role
      };

      if (args.expirationTime) permission.expirationTime = args.expirationTime;

      const response = await drive.permissions.update({
        fileId: args.fileId,
        permissionId: args.permissionId,
        requestBody: permission,
        supportsAllDrives: true,
        fields: 'id, role'
      });

      return `✅ Updated permission ${response.data.id} to role ${response.data.role}`;
    }
  );

  // 5. delete_permission
  registry.registerTool(
    {
      name: 'delete_permission',
      description: 'Revoke access by deleting a permission.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File/folder ID' },
          permissionId: { type: 'string', description: 'Permission ID to delete' }
        },
        required: ['tenantId', 'fileId', 'permissionId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.permissions.delete({
        fileId: args.fileId,
        permissionId: args.permissionId,
        supportsAllDrives: true
      });

      return `✅ Deleted permission ${args.permissionId} from file ${args.fileId}`;
    }
  );
}
