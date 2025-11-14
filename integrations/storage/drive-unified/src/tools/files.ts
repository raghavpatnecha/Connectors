/**
 * Google Drive File Tools (18 tools)
 * Implements all file management operations
 */

import { google, drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GoogleClientFactory } from '../clients/drive-client.js';
import { buildDriveListParams, extractOfficeXmlText } from '../utils/helpers.js';
import * as stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

export function registerFileTools(
  registry: ToolRegistry,
  clientFactory: GoogleClientFactory
): void {
  // 1. search_drive_files
  registry.registerTool(
    {
      name: 'search_drive_files',
      description: 'Search for files and folders in Google Drive using query syntax. Supports structured queries (e.g., "name contains \'report\'") and free text search.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          query: { type: 'string', description: 'Search query (free text or Drive API query syntax)' },
          pageSize: { type: 'number', description: 'Max results (default: 10)', default: 10 },
          driveId: { type: 'string', description: 'Shared drive ID (optional)' },
          includeItemsFromAllDrives: { type: 'boolean', description: 'Include shared drives', default: true },
          corpora: { type: 'string', description: 'Corpus: user, domain, drive, allDrives' }
        },
        required: ['tenantId', 'query']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      // Check if structured query or free text
      const isStructured = /\b\w+\s*(=|!=|>|<|contains|in\s+parents)\b/i.test(args.query);
      const finalQuery = isStructured
        ? args.query
        : `fullText contains '${args.query.replace(/'/g, "\\'")}'`;

      const params = buildDriveListParams({
        query: finalQuery,
        pageSize: args.pageSize || 10,
        driveId: args.driveId,
        includeItemsFromAllDrives: args.includeItemsFromAllDrives !== false,
        corpora: args.corpora
      });

      const response = await drive.files.list(params);
      const files = response.data.files || [];

      if (files.length === 0) {
        return `No files found for query: ${args.query}`;
      }

      const results = files.map(f =>
        `- "${f.name}" (ID: ${f.id}, Type: ${f.mimeType}, Modified: ${f.modifiedTime}) ${f.webViewLink || ''}`
      );

      return `Found ${files.length} files:\n${results.join('\n')}`;
    }
  );

  // 2. get_drive_file_content
  registry.registerTool(
    {
      name: 'get_drive_file_content',
      description: 'Retrieve content of a Google Drive file. Exports Google Docs/Sheets/Slides to text/CSV. Parses Office files (.docx, .xlsx, .pptx). Other files: downloads and attempts UTF-8 decode.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'Drive file ID' }
        },
        required: ['tenantId', 'fileId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const metadata = await drive.files.get({
        fileId: args.fileId,
        fields: 'id, name, mimeType, webViewLink',
        supportsAllDrives: true
      });

      const { mimeType, name } = metadata.data;

      // Export Google native formats
      const exportMap: Record<string, string> = {
        'application/vnd.google-apps.document': 'text/plain',
        'application/vnd.google-apps.spreadsheet': 'text/csv',
        'application/vnd.google-apps.presentation': 'text/plain'
      };

      let content = '';

      if (mimeType && exportMap[mimeType]) {
        const response = await drive.files.export({
          fileId: args.fileId,
          mimeType: exportMap[mimeType]
        }, { responseType: 'arraybuffer' });
        content = Buffer.from(response.data as ArrayBuffer).toString('utf-8');
      } else {
        // Download file
        const response = await drive.files.get({
          fileId: args.fileId,
          alt: 'media'
        }, { responseType: 'arraybuffer' });

        const buffer = Buffer.from(response.data as ArrayBuffer);

        // Try Office XML extraction for Office files
        const officeMimes = [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (mimeType && officeMimes.includes(mimeType)) {
          content = extractOfficeXmlText(buffer, mimeType) || '[Office file - text extraction failed]';
        } else {
          // Try UTF-8 decode
          try {
            content = buffer.toString('utf-8');
          } catch {
            content = `[Binary file - ${buffer.length} bytes]`;
          }
        }
      }

      return `File: "${name}" (ID: ${args.fileId}, Type: ${mimeType})\nLink: ${metadata.data.webViewLink}\n\n--- CONTENT ---\n${content}`;
    }
  );

  // 3. create_drive_file
  registry.registerTool(
    {
      name: 'create_drive_file',
      description: 'Create a new file in Google Drive from text content or URL (file://, http://, https://). Supports shared drives.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileName: { type: 'string', description: 'Name for the new file' },
          content: { type: 'string', description: 'Text content (optional if fileUrl provided)' },
          folderId: { type: 'string', description: 'Parent folder ID (default: root)', default: 'root' },
          mimeType: { type: 'string', description: 'MIME type (default: text/plain)', default: 'text/plain' },
          fileUrl: { type: 'string', description: 'URL to fetch content from (file://, http://, https://)' }
        },
        required: ['tenantId', 'fileName']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      if (!args.content && !args.fileUrl) {
        throw new Error('Must provide either content or fileUrl');
      }

      const fileMetadata: drive_v3.Schema$File = {
        name: args.fileName,
        parents: [args.folderId || 'root'],
        mimeType: args.mimeType || 'text/plain'
      };

      let media: any;

      if (args.content) {
        media = {
          mimeType: args.mimeType || 'text/plain',
          body: stream.Readable.from([Buffer.from(args.content, 'utf-8')])
        };
      } else if (args.fileUrl) {
        // Handle file URL (simplified - production would need full URL handling)
        const response = await fetch(args.fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        media = {
          mimeType: args.mimeType || 'text/plain',
          body: stream.Readable.from([Buffer.from(buffer)])
        };
      }

      const result = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, webViewLink',
        supportsAllDrives: true
      });

      return `✅ Created file "${result.data.name}" (ID: ${result.data.id})\nLink: ${result.data.webViewLink}`;
    }
  );

  // 4. list_drive_items
  registry.registerTool(
    {
      name: 'list_drive_items',
      description: 'List files and folders in a specific folder. Supports shared drives.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          folderId: { type: 'string', description: 'Folder ID (default: root)', default: 'root' },
          pageSize: { type: 'number', description: 'Max results (default: 100)', default: 100 },
          driveId: { type: 'string', description: 'Shared drive ID (optional)' },
          includeItemsFromAllDrives: { type: 'boolean', description: 'Include shared drives', default: true }
        },
        required: ['tenantId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const query = `'${args.folderId || 'root'}' in parents and trashed=false`;
      const params = buildDriveListParams({
        query,
        pageSize: args.pageSize || 100,
        driveId: args.driveId,
        includeItemsFromAllDrives: args.includeItemsFromAllDrives !== false
      });

      const response = await drive.files.list(params);
      const files = response.data.files || [];

      if (files.length === 0) {
        return `No items in folder ${args.folderId || 'root'}`;
      }

      const results = files.map(f =>
        `- "${f.name}" (ID: ${f.id}, Type: ${f.mimeType}, Size: ${f.size || 'N/A'}, Modified: ${f.modifiedTime})`
      );

      return `Found ${files.length} items:\n${results.join('\n')}`;
    }
  );

  // 5. update_drive_file
  registry.registerTool(
    {
      name: 'update_drive_file',
      description: 'Update file metadata: name, description, starred, trashed, permissions, parents, properties.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID to update' },
          name: { type: 'string', description: 'New file name' },
          description: { type: 'string', description: 'File description' },
          starred: { type: 'boolean', description: 'Star/unstar file' },
          trashed: { type: 'boolean', description: 'Move to/from trash' },
          addParents: { type: 'string', description: 'Comma-separated folder IDs to add' },
          removeParents: { type: 'string', description: 'Comma-separated folder IDs to remove' },
          writersCanShare: { type: 'boolean', description: 'Allow editors to share' },
          properties: { type: 'object', description: 'Custom key-value properties' }
        },
        required: ['tenantId', 'fileId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const updateBody: drive_v3.Schema$File = {};
      if (args.name !== undefined) updateBody.name = args.name;
      if (args.description !== undefined) updateBody.description = args.description;
      if (args.starred !== undefined) updateBody.starred = args.starred;
      if (args.trashed !== undefined) updateBody.trashed = args.trashed;
      if (args.writersCanShare !== undefined) updateBody.writersCanShare = args.writersCanShare;
      if (args.properties !== undefined) updateBody.properties = args.properties;

      const params: any = {
        fileId: args.fileId,
        requestBody: updateBody,
        supportsAllDrives: true,
        fields: 'id, name, webViewLink'
      };

      if (args.addParents) params.addParents = args.addParents;
      if (args.removeParents) params.removeParents = args.removeParents;

      const result = await drive.files.update(params);

      return `✅ Updated file "${result.data.name}" (ID: ${result.data.id})\nLink: ${result.data.webViewLink}`;
    }
  );

  // 6. copy_file
  registry.registerTool(
    {
      name: 'copy_file',
      description: 'Duplicate a Drive file to same or different folder.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'Source file ID' },
          newName: { type: 'string', description: 'Name for copy (optional)' },
          folderId: { type: 'string', description: 'Destination folder ID (optional)' }
        },
        required: ['tenantId', 'fileId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const copyMetadata: drive_v3.Schema$File = {};
      if (args.newName) copyMetadata.name = args.newName;
      if (args.folderId) copyMetadata.parents = [args.folderId];

      const result = await drive.files.copy({
        fileId: args.fileId,
        requestBody: copyMetadata,
        supportsAllDrives: true,
        fields: 'id, name, webViewLink'
      });

      return `✅ Copied file to "${result.data.name}" (ID: ${result.data.id})\nLink: ${result.data.webViewLink}`;
    }
  );

  // 7. delete_file
  registry.registerTool(
    {
      name: 'delete_file',
      description: 'Move file to trash (recoverable).',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID to trash' }
        },
        required: ['tenantId', 'fileId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.files.update({
        fileId: args.fileId,
        requestBody: { trashed: true },
        supportsAllDrives: true
      });

      return `✅ Moved file ${args.fileId} to trash`;
    }
  );

  // 8. permanently_delete_file
  registry.registerTool(
    {
      name: 'permanently_delete_file',
      description: 'Permanently delete a file (cannot be recovered).',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID to delete permanently' }
        },
        required: ['tenantId', 'fileId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.files.delete({
        fileId: args.fileId,
        supportsAllDrives: true
      });

      return `✅ Permanently deleted file ${args.fileId}`;
    }
  );

  // 9. export_file
  registry.registerTool(
    {
      name: 'export_file',
      description: 'Export Google Workspace file to different format (PDF, DOCX, XLSX, etc.).',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID to export' },
          mimeType: { type: 'string', description: 'Target MIME type (e.g., application/pdf)' }
        },
        required: ['tenantId', 'fileId', 'mimeType']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.files.export({
        fileId: args.fileId,
        mimeType: args.mimeType
      }, { responseType: 'arraybuffer' });

      const buffer = Buffer.from(response.data as ArrayBuffer);
      return `✅ Exported file (${buffer.length} bytes, type: ${args.mimeType})`;
    }
  );

  // 10. generate_ids
  registry.registerTool(
    {
      name: 'generate_ids',
      description: 'Pre-generate Drive file IDs for batch operations.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          count: { type: 'number', description: 'Number of IDs to generate (default: 1)', default: 1 }
        },
        required: ['tenantId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.files.generateIds({
        count: args.count || 1
      });

      return `Generated IDs: ${response.data.ids?.join(', ')}`;
    }
  );

  // 11. watch_file
  registry.registerTool(
    {
      name: 'watch_file',
      description: 'Subscribe to file changes via push notifications.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID to watch' },
          channelId: { type: 'string', description: 'Unique channel identifier' },
          webhookUrl: { type: 'string', description: 'HTTPS URL for notifications' }
        },
        required: ['tenantId', 'fileId', 'channelId', 'webhookUrl']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.files.watch({
        fileId: args.fileId,
        supportsAllDrives: true,
        requestBody: {
          id: args.channelId,
          type: 'web_hook',
          address: args.webhookUrl
        }
      });

      return `✅ Watching file ${args.fileId} (Channel: ${response.data.id}, Expires: ${response.data.expiration})`;
    }
  );

  // 12. stop_channel
  registry.registerTool(
    {
      name: 'stop_channel',
      description: 'Stop receiving push notifications for a watch channel.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          channelId: { type: 'string', description: 'Channel ID to stop' },
          resourceId: { type: 'string', description: 'Resource ID from watch response' }
        },
        required: ['tenantId', 'channelId', 'resourceId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.channels.stop({
        requestBody: {
          id: args.channelId,
          resourceId: args.resourceId
        }
      });

      return `✅ Stopped channel ${args.channelId}`;
    }
  );

  // 13. empty_trash
  registry.registerTool(
    {
      name: 'empty_trash',
      description: 'Permanently delete all trashed files.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' }
        },
        required: ['tenantId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.files.emptyTrash();

      return `✅ Emptied trash`;
    }
  );

  // 14. get_file_revisions
  registry.registerTool(
    {
      name: 'get_file_revisions',
      description: 'List all revisions of a file.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' }
        },
        required: ['tenantId', 'fileId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.revisions.list({
        fileId: args.fileId,
        fields: 'revisions(id, modifiedTime, lastModifyingUser, keepForever)'
      });

      const revisions = response.data.revisions || [];
      const results = revisions.map(r =>
        `- Revision ${r.id} (Modified: ${r.modifiedTime}, User: ${r.lastModifyingUser?.displayName}, Keep: ${r.keepForever})`
      );

      return `Found ${revisions.length} revisions:\n${results.join('\n')}`;
    }
  );

  // 15. update_revision
  registry.registerTool(
    {
      name: 'update_revision',
      description: 'Update revision metadata (e.g., keep forever).',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          revisionId: { type: 'string', description: 'Revision ID' },
          keepForever: { type: 'boolean', description: 'Prevent auto-deletion' }
        },
        required: ['tenantId', 'fileId', 'revisionId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.revisions.update({
        fileId: args.fileId,
        revisionId: args.revisionId,
        requestBody: {
          keepForever: args.keepForever
        }
      });

      return `✅ Updated revision ${args.revisionId}`;
    }
  );

  // 16. delete_revision
  registry.registerTool(
    {
      name: 'delete_revision',
      description: 'Delete a specific file revision.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          revisionId: { type: 'string', description: 'Revision ID to delete' }
        },
        required: ['tenantId', 'fileId', 'revisionId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.revisions.delete({
        fileId: args.fileId,
        revisionId: args.revisionId
      });

      return `✅ Deleted revision ${args.revisionId}`;
    }
  );

  // 17. get_drive_file_permissions
  registry.registerTool(
    {
      name: 'get_drive_file_permissions',
      description: 'Get detailed file metadata including sharing permissions and URLs.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' }
        },
        required: ['tenantId', 'fileId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.files.get({
        fileId: args.fileId,
        fields: 'id, name, mimeType, permissions, shared, webViewLink, webContentLink',
        supportsAllDrives: true
      });

      const permissions = response.data.permissions || [];
      const permList = permissions.map(p =>
        `  - ${p.type}: ${p.emailAddress || 'anyone'} (${p.role})`
      );

      return `File: ${response.data.name} (ID: ${args.fileId})\nShared: ${response.data.shared}\nPermissions:\n${permList.join('\n')}\nLink: ${response.data.webViewLink}`;
    }
  );

  // 18. check_drive_file_public_access
  registry.registerTool(
    {
      name: 'check_drive_file_public_access',
      description: 'Search for file by name and check if it has public link sharing enabled.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileName: { type: 'string', description: 'File name to search' }
        },
        required: ['tenantId', 'fileName']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const searchResponse = await drive.files.list({
        q: `name = '${args.fileName.replace(/'/g, "\\'")}'`,
        pageSize: 5,
        fields: 'files(id, name, mimeType)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

      const files = searchResponse.data.files || [];
      if (files.length === 0) {
        return `No file found: ${args.fileName}`;
      }

      const fileId = files[0].id!;
      const permResponse = await drive.files.get({
        fileId,
        fields: 'permissions',
        supportsAllDrives: true
      });

      const hasPublicLink = permResponse.data.permissions?.some(
        p => p.type === 'anyone' && ['reader', 'writer', 'commenter'].includes(p.role || '')
      );

      return hasPublicLink
        ? `✅ PUBLIC ACCESS: ${args.fileName} (ID: ${fileId})\nURL: https://drive.google.com/uc?export=view&id=${fileId}`
        : `❌ NO PUBLIC ACCESS: ${args.fileName} (ID: ${fileId})`;
    }
  );
}
