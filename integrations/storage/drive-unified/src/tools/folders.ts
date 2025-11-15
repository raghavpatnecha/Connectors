/**
 * Google Drive Folder Tools (4 tools)
 * Implements folder management operations
 */

import { drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GoogleClientFactory } from '../clients/drive-client.js';

export function registerFolderTools(
  registry: ToolRegistry,
  clientFactory: GoogleClientFactory
): void {
  // 1. create_folder
  registry.registerTool(
    {
      name: 'create_folder',
      description: 'Create a new folder in Google Drive.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          folderName: { type: 'string', description: 'Name for the new folder' },
          parentId: { type: 'string', description: 'Parent folder ID (default: root)', default: 'root' }
        },
        required: ['tenantId', 'folderName']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const folderMetadata: drive_v3.Schema$File = {
        name: args.folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [args.parentId || 'root']
      };

      const result = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, webViewLink',
        supportsAllDrives: true
      });

      return `✅ Created folder "${result.data.name}" (ID: ${result.data.id})\nLink: ${result.data.webViewLink}`;
    }
  );

  // 2. move_file
  registry.registerTool(
    {
      name: 'move_file',
      description: 'Move a file or folder to a different parent folder.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File/folder ID to move' },
          newParentId: { type: 'string', description: 'Destination folder ID' }
        },
        required: ['tenantId', 'fileId', 'newParentId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      // Get current parents
      const file = await drive.files.get({
        fileId: args.fileId,
        fields: 'parents',
        supportsAllDrives: true
      });

      const previousParents = file.data.parents?.join(',') || '';

      const result = await drive.files.update({
        fileId: args.fileId,
        addParents: args.newParentId,
        removeParents: previousParents,
        supportsAllDrives: true,
        fields: 'id, name, parents'
      });

      return `✅ Moved "${result.data.name}" (ID: ${result.data.id}) to folder ${args.newParentId}`;
    }
  );

  // 3. add_parent
  registry.registerTool(
    {
      name: 'add_parent',
      description: 'Add file to additional folder (multi-parent).',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          parentId: { type: 'string', description: 'Folder ID to add as parent' }
        },
        required: ['tenantId', 'fileId', 'parentId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const result = await drive.files.update({
        fileId: args.fileId,
        addParents: args.parentId,
        supportsAllDrives: true,
        fields: 'id, name, parents'
      });

      return `✅ Added parent ${args.parentId} to file ${result.data.name} (ID: ${result.data.id})`;
    }
  );

  // 4. remove_parent
  registry.registerTool(
    {
      name: 'remove_parent',
      description: 'Remove file from a parent folder.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          parentId: { type: 'string', description: 'Folder ID to remove' }
        },
        required: ['tenantId', 'fileId', 'parentId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const result = await drive.files.update({
        fileId: args.fileId,
        removeParents: args.parentId,
        supportsAllDrives: true,
        fields: 'id, name, parents'
      });

      return `✅ Removed parent ${args.parentId} from file ${result.data.name} (ID: ${result.data.id})`;
    }
  );
}
