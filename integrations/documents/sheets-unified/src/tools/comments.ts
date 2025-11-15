/**
 * Google Sheets MCP - Comments Tools
 * Tools for managing comments on spreadsheets (via Drive API)
 */

import { z } from 'zod';
import { drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory.js';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all comment management tools
 */
export function registerCommentTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Read sheet comments
  registry.registerTool(
    'sheets_read_comments',
    'Read all comments on a Google Sheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const response = await driveClient.comments.list({
          fileId: args.spreadsheetId,
          fields: 'comments(id,content,author,createdTime,modifiedTime,resolved,quotedFileContent,anchor,replies)'
        });

        const comments = (response.data.comments || []).map(comment => ({
          id: comment.id,
          content: comment.content,
          author: {
            displayName: comment.author?.displayName,
            emailAddress: comment.author?.emailAddress
          },
          createdTime: comment.createdTime,
          modifiedTime: comment.modifiedTime,
          resolved: comment.resolved,
          quotedText: comment.quotedFileContent?.value,
          anchor: comment.anchor,
          replyCount: comment.replies?.length || 0
        }));

        logger.info('Read sheet comments', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          commentCount: comments.length
        });

        return {
          totalComments: comments.length,
          comments
        };
      } catch (error: any) {
        logger.error('Failed to read sheet comments', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Create sheet comment
  registry.registerTool(
    'sheets_create_comment',
    'Create a new comment on a Google Sheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      content: z.string().describe('Comment text content'),
      quotedText: z.string().optional().describe('Text being commented on'),
      anchor: z.string().optional().describe('Anchor for the comment (e.g., specific cell range)')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const commentBody: drive_v3.Schema$Comment = {
          content: args.content
        };

        if (args.quotedText) {
          commentBody.quotedFileContent = {
            value: args.quotedText,
            mimeType: 'text/plain'
          };
        }

        if (args.anchor) {
          commentBody.anchor = args.anchor;
        }

        const response = await driveClient.comments.create({
          fileId: args.spreadsheetId,
          requestBody: commentBody,
          fields: 'id,content,author,createdTime,anchor'
        });

        logger.info('Created sheet comment', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          commentId: response.data.id
        });

        return {
          commentId: response.data.id,
          content: response.data.content,
          author: response.data.author?.displayName,
          createdTime: response.data.createdTime,
          anchor: response.data.anchor
        };
      } catch (error: any) {
        logger.error('Failed to create sheet comment', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Reply to sheet comment
  registry.registerTool(
    'sheets_reply_to_comment',
    'Reply to an existing comment on a Google Sheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      commentId: z.string().describe('ID of the comment to reply to'),
      replyContent: z.string().describe('Reply text content')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const response = await driveClient.replies.create({
          fileId: args.spreadsheetId,
          commentId: args.commentId,
          requestBody: {
            content: args.replyContent
          },
          fields: 'id,content,author,createdTime'
        });

        logger.info('Replied to sheet comment', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          commentId: args.commentId,
          replyId: response.data.id
        });

        return {
          replyId: response.data.id,
          content: response.data.content,
          author: response.data.author?.displayName,
          createdTime: response.data.createdTime
        };
      } catch (error: any) {
        logger.error('Failed to reply to sheet comment', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          commentId: args.commentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Resolve sheet comment
  registry.registerTool(
    'sheets_resolve_comment',
    'Resolve or unresolve a comment on a Google Sheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      commentId: z.string().describe('ID of the comment to resolve/unresolve'),
      resolved: z.boolean().default(true).describe('True to resolve, false to unresolve')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const response = await driveClient.comments.update({
          fileId: args.spreadsheetId,
          commentId: args.commentId,
          requestBody: {
            resolved: args.resolved
          },
          fields: 'id,resolved,modifiedTime'
        });

        logger.info('Updated sheet comment resolution', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          commentId: args.commentId,
          resolved: args.resolved
        });

        return {
          commentId: response.data.id,
          resolved: response.data.resolved,
          modifiedTime: response.data.modifiedTime
        };
      } catch (error: any) {
        logger.error('Failed to update sheet comment resolution', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          commentId: args.commentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );
}
