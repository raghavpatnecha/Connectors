/**
 * Google Drive Comment Tools (9 tools)
 * Implements comment and reply management for Drive files
 */

import { drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GoogleClientFactory } from '../clients/drive-client.js';

export function registerCommentTools(
  registry: ToolRegistry,
  clientFactory: GoogleClientFactory
): void {
  // 1. list_comments
  registry.registerTool(
    {
      name: 'list_comments',
      description: 'List all comments on a Drive file.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          pageSize: { type: 'number', description: 'Max results (default: 100)', default: 100 },
          includeDeleted: { type: 'boolean', description: 'Include deleted comments', default: false }
        },
        required: ['tenantId', 'fileId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.comments.list({
        fileId: args.fileId,
        pageSize: args.pageSize || 100,
        includeDeleted: args.includeDeleted || false,
        fields: 'comments(id, author, content, createdTime, resolved, quotedFileContent)'
      });

      const comments = response.data.comments || [];
      if (comments.length === 0) {
        return `No comments found on file ${args.fileId}`;
      }

      const results = comments.map(c =>
        `- Comment ${c.id} by ${c.author?.displayName} (${c.createdTime}):\n  ${c.content}\n  Resolved: ${c.resolved}`
      );

      return `Found ${comments.length} comments:\n${results.join('\n')}`;
    }
  );

  // 2. get_comment
  registry.registerTool(
    {
      name: 'get_comment',
      description: 'Get details of a specific comment.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          commentId: { type: 'string', description: 'Comment ID' }
        },
        required: ['tenantId', 'fileId', 'commentId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.comments.get({
        fileId: args.fileId,
        commentId: args.commentId,
        fields: 'id, author, content, createdTime, modifiedTime, resolved, replies'
      });

      const c = response.data;
      return `Comment ${c.id}:\n` +
             `  Author: ${c.author?.displayName} (${c.author?.emailAddress})\n` +
             `  Content: ${c.content}\n` +
             `  Created: ${c.createdTime}\n` +
             `  Modified: ${c.modifiedTime}\n` +
             `  Resolved: ${c.resolved}\n` +
             `  Replies: ${c.replies?.length || 0}`;
    }
  );

  // 3. create_comment
  registry.registerTool(
    {
      name: 'create_comment',
      description: 'Add a new comment to a Drive file.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          content: { type: 'string', description: 'Comment text' }
        },
        required: ['tenantId', 'fileId', 'content']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.comments.create({
        fileId: args.fileId,
        requestBody: {
          content: args.content
        },
        fields: 'id, content, author, createdTime'
      });

      return `✅ Created comment ${response.data.id} by ${response.data.author?.displayName}`;
    }
  );

  // 4. update_comment
  registry.registerTool(
    {
      name: 'update_comment',
      description: 'Update comment content.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          commentId: { type: 'string', description: 'Comment ID' },
          content: { type: 'string', description: 'New comment text' }
        },
        required: ['tenantId', 'fileId', 'commentId', 'content']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.comments.update({
        fileId: args.fileId,
        commentId: args.commentId,
        requestBody: {
          content: args.content
        },
        fields: 'id, content, modifiedTime'
      });

      return `✅ Updated comment ${response.data.id} (Modified: ${response.data.modifiedTime})`;
    }
  );

  // 5. delete_comment
  registry.registerTool(
    {
      name: 'delete_comment',
      description: 'Delete a comment from a file.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          commentId: { type: 'string', description: 'Comment ID to delete' }
        },
        required: ['tenantId', 'fileId', 'commentId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.comments.delete({
        fileId: args.fileId,
        commentId: args.commentId
      });

      return `✅ Deleted comment ${args.commentId}`;
    }
  );

  // 6. list_replies
  registry.registerTool(
    {
      name: 'list_replies',
      description: 'List all replies to a comment.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          commentId: { type: 'string', description: 'Comment ID' }
        },
        required: ['tenantId', 'fileId', 'commentId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.replies.list({
        fileId: args.fileId,
        commentId: args.commentId,
        fields: 'replies(id, author, content, createdTime, action)'
      });

      const replies = response.data.replies || [];
      if (replies.length === 0) {
        return `No replies to comment ${args.commentId}`;
      }

      const results = replies.map(r =>
        `- Reply ${r.id} by ${r.author?.displayName} (${r.createdTime}):\n  ${r.content}\n  Action: ${r.action || 'none'}`
      );

      return `Found ${replies.length} replies:\n${results.join('\n')}`;
    }
  );

  // 7. create_reply
  registry.registerTool(
    {
      name: 'create_reply',
      description: 'Reply to a comment.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          commentId: { type: 'string', description: 'Comment ID to reply to' },
          content: { type: 'string', description: 'Reply text' },
          action: {
            type: 'string',
            description: 'Action: resolve or reopen',
            enum: ['resolve', 'reopen']
          }
        },
        required: ['tenantId', 'fileId', 'commentId', 'content']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const replyBody: drive_v3.Schema$Reply = {
        content: args.content
      };

      if (args.action) replyBody.action = args.action;

      const response = await drive.replies.create({
        fileId: args.fileId,
        commentId: args.commentId,
        requestBody: replyBody,
        fields: 'id, content, author, createdTime'
      });

      return `✅ Created reply ${response.data.id} by ${response.data.author?.displayName}`;
    }
  );

  // 8. update_reply
  registry.registerTool(
    {
      name: 'update_reply',
      description: 'Update reply content.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          commentId: { type: 'string', description: 'Comment ID' },
          replyId: { type: 'string', description: 'Reply ID' },
          content: { type: 'string', description: 'New reply text' }
        },
        required: ['tenantId', 'fileId', 'commentId', 'replyId', 'content']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      const response = await drive.replies.update({
        fileId: args.fileId,
        commentId: args.commentId,
        replyId: args.replyId,
        requestBody: {
          content: args.content
        },
        fields: 'id, content, modifiedTime'
      });

      return `✅ Updated reply ${response.data.id} (Modified: ${response.data.modifiedTime})`;
    }
  );

  // 9. delete_reply
  registry.registerTool(
    {
      name: 'delete_reply',
      description: 'Delete a reply to a comment.',
      inputSchema: {
        type: 'object',
        properties: {
          tenantId: { type: 'string', description: 'Tenant ID for authentication' },
          fileId: { type: 'string', description: 'File ID' },
          commentId: { type: 'string', description: 'Comment ID' },
          replyId: { type: 'string', description: 'Reply ID to delete' }
        },
        required: ['tenantId', 'fileId', 'commentId', 'replyId']
      }
    },
    async (args: any, tenantId: string) => {
      const drive = await clientFactory.getDriveClient(tenantId);

      await drive.replies.delete({
        fileId: args.fileId,
        commentId: args.commentId,
        replyId: args.replyId
      });

      return `✅ Deleted reply ${args.replyId}`;
    }
  );
}
