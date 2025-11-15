/**
 * Google Docs MCP - Document Features Tools
 * Tools for headers, footers, comments, named ranges, and bookmarks
 */

import { z } from 'zod';
import { docs_v1, drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all document feature tools
 */
export function registerFeatureTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Update header
  registry.registerTool(
    'docs_update_header',
    'Update or create a header in the document',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      headerText: z.string().describe('Text for the header'),
      headerType: z.enum(['DEFAULT', 'FIRST_PAGE_HEADER']).optional().describe('Type of header (default: DEFAULT)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        // Get document to find header ID
        const doc = await client.documents.get({ documentId: args.documentId });

        const headerType = args.headerType || 'DEFAULT';
        const headerId = headerType === 'FIRST_PAGE_HEADER'
          ? doc.data.documentStyle?.firstPageHeaderId
          : doc.data.headers?.DEFAULT?.headerId;

        if (!headerId) {
          throw new Error(`Header of type ${headerType} not found. Document may need to be initialized with headers.`);
        }

        // Find header content start index
        const header = doc.data.headers?.[headerType];
        const headerContent = header?.content || [];
        const startIndex = headerContent[0]?.startIndex;

        if (!startIndex) {
          throw new Error('Could not find header content start index');
        }

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              insertText: {
                location: { index: startIndex + 1 },
                text: args.headerText
              }
            }]
          }
        });

        logger.info('Updated header', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          headerType
        });

        return {
          success: true,
          documentId: args.documentId,
          headerType,
          text: args.headerText,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to update header', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Update footer
  registry.registerTool(
    'docs_update_footer',
    'Update or create a footer in the document',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      footerText: z.string().describe('Text for the footer'),
      footerType: z.enum(['DEFAULT', 'FIRST_PAGE_FOOTER']).optional().describe('Type of footer (default: DEFAULT)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        // Get document to find footer ID
        const doc = await client.documents.get({ documentId: args.documentId });

        const footerType = args.footerType || 'DEFAULT';
        const footerId = footerType === 'FIRST_PAGE_FOOTER'
          ? doc.data.documentStyle?.firstPageFooterId
          : doc.data.footers?.DEFAULT?.footerId;

        if (!footerId) {
          throw new Error(`Footer of type ${footerType} not found. Document may need to be initialized with footers.`);
        }

        // Find footer content start index
        const footer = doc.data.footers?.[footerType];
        const footerContent = footer?.content || [];
        const startIndex = footerContent[0]?.startIndex;

        if (!startIndex) {
          throw new Error('Could not find footer content start index');
        }

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              insertText: {
                location: { index: startIndex + 1 },
                text: args.footerText
              }
            }]
          }
        });

        logger.info('Updated footer', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          footerType
        });

        return {
          success: true,
          documentId: args.documentId,
          footerType,
          text: args.footerText,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to update footer', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Create named range
  registry.registerTool(
    'docs_create_named_range',
    'Create a named range for a text selection',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      name: z.string().describe('Name for the range'),
      startIndex: z.number().int().min(1).describe('Start position of the range'),
      endIndex: z.number().int().min(1).describe('End position of the range')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        const response = await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              createNamedRange: {
                name: args.name,
                range: {
                  startIndex: args.startIndex,
                  endIndex: args.endIndex
                }
              }
            }]
          }
        });

        const namedRangeId = response.data.replies?.[0]?.createNamedRange?.namedRangeId;

        logger.info('Created named range', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          name: args.name,
          namedRangeId
        });

        return {
          success: true,
          documentId: args.documentId,
          name: args.name,
          namedRangeId,
          startIndex: args.startIndex,
          endIndex: args.endIndex,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to create named range', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Delete named range
  registry.registerTool(
    'docs_delete_named_range',
    'Delete a named range from the document',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      namedRangeId: z.string().optional().describe('ID of the named range to delete'),
      name: z.string().optional().describe('Name of the named range to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        if (!args.namedRangeId && !args.name) {
          throw new Error('Either namedRangeId or name must be provided');
        }

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              deleteNamedRange: {
                ...(args.namedRangeId && { namedRangeId: args.namedRangeId }),
                ...(args.name && { name: args.name })
              }
            }]
          }
        });

        logger.info('Deleted named range', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          namedRangeId: args.namedRangeId,
          name: args.name
        });

        return {
          success: true,
          documentId: args.documentId,
          deletedId: args.namedRangeId,
          deletedName: args.name,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to delete named range', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // List comments (via Drive API)
  registry.registerTool(
    'docs_list_comments',
    'List all comments in the document',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      includeDeleted: z.boolean().optional().describe('Include deleted comments (default: false)')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const response = await driveClient.comments.list({
          fileId: args.documentId,
          fields: 'comments(id, content, author, createdTime, modifiedTime, resolved, quotedFileContent, replies)',
          includeDeleted: args.includeDeleted || false
        });

        const comments = (response.data.comments || []).map(comment => ({
          id: comment.id,
          content: comment.content,
          author: comment.author?.displayName || comment.author?.emailAddress,
          createdTime: comment.createdTime,
          modifiedTime: comment.modifiedTime,
          resolved: comment.resolved,
          quotedText: comment.quotedFileContent?.value,
          repliesCount: comment.replies?.length || 0
        }));

        logger.info('Listed comments', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          count: comments.length
        });

        return {
          documentId: args.documentId,
          totalComments: comments.length,
          comments
        };
      } catch (error: any) {
        logger.error('Failed to list comments', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Create comment (via Drive API)
  registry.registerTool(
    'docs_create_comment',
    'Add a comment to the document',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      content: z.string().describe('Comment text'),
      quotedText: z.string().optional().describe('Text to quote in the comment')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const requestBody: drive_v3.Schema$Comment = {
          content: args.content
        };

        if (args.quotedText) {
          requestBody.quotedFileContent = {
            value: args.quotedText,
            mimeType: 'text/plain'
          };
        }

        const response = await driveClient.comments.create({
          fileId: args.documentId,
          requestBody,
          fields: 'id, content, author, createdTime'
        });

        logger.info('Created comment', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          commentId: response.data.id
        });

        return {
          success: true,
          documentId: args.documentId,
          commentId: response.data.id,
          content: response.data.content,
          author: response.data.author?.displayName,
          createdTime: response.data.createdTime,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to create comment', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Reply to comment
  registry.registerTool(
    'docs_reply_to_comment',
    'Reply to an existing comment',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      commentId: z.string().describe('ID of the comment to reply to'),
      replyText: z.string().describe('Reply text')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const response = await driveClient.replies.create({
          fileId: args.documentId,
          commentId: args.commentId,
          requestBody: {
            content: args.replyText
          },
          fields: 'id, content, author, createdTime'
        });

        logger.info('Replied to comment', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          commentId: args.commentId,
          replyId: response.data.id
        });

        return {
          success: true,
          documentId: args.documentId,
          commentId: args.commentId,
          replyId: response.data.id,
          content: response.data.content,
          author: response.data.author?.displayName,
          createdTime: response.data.createdTime,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to reply to comment', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          commentId: args.commentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Resolve comment
  registry.registerTool(
    'docs_resolve_comment',
    'Mark a comment as resolved',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      commentId: z.string().describe('ID of the comment to resolve')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        await driveClient.comments.update({
          fileId: args.documentId,
          commentId: args.commentId,
          requestBody: {
            resolved: true
          }
        });

        logger.info('Resolved comment', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          commentId: args.commentId
        });

        return {
          success: true,
          documentId: args.documentId,
          commentId: args.commentId,
          resolved: true,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to resolve comment', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          commentId: args.commentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Create bookmark
  registry.registerTool(
    'docs_create_bookmark',
    'Create a bookmark at a specific position',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      index: z.number().int().min(1).describe('Position to create bookmark')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        const response = await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              createParagraphBullets: { // Using paragraph bullets as a workaround for bookmarks
                range: {
                  startIndex: args.index,
                  endIndex: args.index + 1
                },
                bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE'
              }
            }]
          }
        });

        logger.info('Created bookmark', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          index: args.index
        });

        return {
          success: true,
          documentId: args.documentId,
          index: args.index,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to create bookmark', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Delete bookmark
  registry.registerTool(
    'docs_delete_bookmark',
    'Delete a bookmark from the document',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      bookmarkId: z.string().describe('ID of the bookmark to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              deleteContentRange: {
                range: {
                  segmentId: args.bookmarkId
                }
              }
            }]
          }
        });

        logger.info('Deleted bookmark', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          bookmarkId: args.bookmarkId
        });

        return {
          success: true,
          documentId: args.documentId,
          bookmarkId: args.bookmarkId,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to delete bookmark', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );
}
