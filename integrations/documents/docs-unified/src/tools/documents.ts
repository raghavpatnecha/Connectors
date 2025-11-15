/**
 * Google Docs MCP - Document Management Tools
 * Tools for creating, reading, and managing Google Docs
 */

import { z } from 'zod';
import { docs_v1, drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all document management tools
 */
export function registerDocumentTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Create a new document
  registry.registerTool(
    'docs_create_document',
    'Create a new Google Doc with optional initial content',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      title: z.string().describe('Title of the new document'),
      content: z.string().optional().describe('Initial text content to insert')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        const response = await client.documents.create({
          requestBody: {
            title: args.title
          }
        });

        const documentId = response.data.documentId!;

        // Insert initial content if provided
        if (args.content) {
          await client.documents.batchUpdate({
            documentId,
            requestBody: {
              requests: [{
                insertText: {
                  location: { index: 1 },
                  text: args.content
                }
              }]
            }
          });
        }

        const result = {
          documentId,
          title: response.data.title,
          revisionId: response.data.revisionId,
          link: `https://docs.google.com/document/d/${documentId}/edit`
        };

        logger.info('Created document', {
          tenantId: args.tenantId,
          documentId,
          title: args.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create document', {
          tenantId: args.tenantId,
          title: args.title,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Get document content
  registry.registerTool(
    'docs_get_document',
    'Retrieve the full content and structure of a Google Doc',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document to retrieve')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        const response = await client.documents.get({
          documentId: args.documentId
        });

        // Extract text content from document
        const extractText = (elements: docs_v1.Schema$StructuralElement[] = []): string => {
          let text = '';
          for (const element of elements) {
            if (element.paragraph?.elements) {
              for (const paragraphElement of element.paragraph.elements) {
                if (paragraphElement.textRun?.content) {
                  text += paragraphElement.textRun.content;
                }
              }
            } else if (element.table) {
              // Extract table content
              for (const row of element.table.tableRows || []) {
                for (const cell of row.tableCells || []) {
                  text += extractText(cell.content);
                }
              }
            }
          }
          return text;
        };

        const bodyContent = extractText(response.data.body?.content);

        const result = {
          documentId: response.data.documentId,
          title: response.data.title,
          revisionId: response.data.revisionId,
          content: bodyContent,
          contentLength: bodyContent.length,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };

        logger.info('Retrieved document', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          contentLength: bodyContent.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get document', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Search for documents (uses Drive API)
  registry.registerTool(
    'docs_search_documents',
    'Search for Google Docs by name',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      query: z.string().describe('Search query (searches in document names)'),
      maxResults: z.number().int().min(1).max(100).optional().describe('Maximum number of results (default: 10)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDriveClient(args.tenantId);

        const escapedQuery = args.query.replace(/'/g, "\\'");
        const response = await client.files.list({
          q: `name contains '${escapedQuery}' and mimeType='application/vnd.google-apps.document' and trashed=false`,
          pageSize: args.maxResults || 10,
          fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });

        const documents = (response.data.files || []).map(file => ({
          id: file.id,
          name: file.name,
          createdTime: file.createdTime,
          modifiedTime: file.modifiedTime,
          link: file.webViewLink
        }));

        logger.info('Searched documents', {
          tenantId: args.tenantId,
          query: args.query,
          resultsFound: documents.length
        });

        return {
          query: args.query,
          totalResults: documents.length,
          documents
        };
      } catch (error: any) {
        logger.error('Failed to search documents', {
          tenantId: args.tenantId,
          query: args.query,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // List documents in a folder
  registry.registerTool(
    'docs_list_documents_in_folder',
    'List all Google Docs in a specific Drive folder',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      folderId: z.string().optional().describe('Drive folder ID (default: root)'),
      maxResults: z.number().int().min(1).max(1000).optional().describe('Maximum number of documents (default: 100)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDriveClient(args.tenantId);

        const folderId = args.folderId || 'root';
        const response = await client.files.list({
          q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
          pageSize: args.maxResults || 100,
          fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });

        const documents = (response.data.files || []).map(file => ({
          id: file.id,
          name: file.name,
          createdTime: file.createdTime,
          modifiedTime: file.modifiedTime,
          link: file.webViewLink
        }));

        logger.info('Listed documents in folder', {
          tenantId: args.tenantId,
          folderId,
          count: documents.length
        });

        return {
          folderId,
          totalDocuments: documents.length,
          documents
        };
      } catch (error: any) {
        logger.error('Failed to list documents in folder', {
          tenantId: args.tenantId,
          folderId: args.folderId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Copy a document
  registry.registerTool(
    'docs_copy_document',
    'Create a copy of an existing Google Doc',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document to copy'),
      title: z.string().optional().describe('Title for the copied document (default: "Copy of [original title]")'),
      folderId: z.string().optional().describe('Drive folder ID to place the copy in')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const requestBody: drive_v3.Schema$File = {};
        if (args.title) requestBody.name = args.title;
        if (args.folderId) requestBody.parents = [args.folderId];

        const response = await driveClient.files.copy({
          fileId: args.documentId,
          requestBody,
          fields: 'id, name, webViewLink',
          supportsAllDrives: true
        });

        const result = {
          documentId: response.data.id,
          title: response.data.name,
          link: response.data.webViewLink
        };

        logger.info('Copied document', {
          tenantId: args.tenantId,
          sourceId: args.documentId,
          newId: response.data.id
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to copy document', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Delete a document
  registry.registerTool(
    'docs_delete_document',
    'Move a Google Doc to trash',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document to delete')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        await driveClient.files.update({
          fileId: args.documentId,
          requestBody: {
            trashed: true
          },
          supportsAllDrives: true
        });

        logger.info('Deleted document', {
          tenantId: args.tenantId,
          documentId: args.documentId
        });

        return {
          success: true,
          message: `Document ${args.documentId} has been moved to trash.`
        };
      } catch (error: any) {
        logger.error('Failed to delete document', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Export document to PDF
  registry.registerTool(
    'docs_export_to_pdf',
    'Export a Google Doc to PDF format and save to Drive',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document to export'),
      pdfFilename: z.string().optional().describe('Name for the PDF file (default: [document name]_PDF.pdf)'),
      folderId: z.string().optional().describe('Drive folder ID to save PDF in (default: root)')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        // Get original document metadata
        const fileMetadata = await driveClient.files.get({
          fileId: args.documentId,
          fields: 'id, name, mimeType',
          supportsAllDrives: true
        });

        if (fileMetadata.data.mimeType !== 'application/vnd.google-apps.document') {
          throw new Error('File is not a Google Doc');
        }

        // Export as PDF
        const pdfResponse = await driveClient.files.export({
          fileId: args.documentId,
          mimeType: 'application/pdf'
        }, {
          responseType: 'stream'
        });

        // Determine PDF filename
        let pdfFilename = args.pdfFilename || `${fileMetadata.data.name}_PDF.pdf`;
        if (!pdfFilename.endsWith('.pdf')) {
          pdfFilename += '.pdf';
        }

        // Upload PDF to Drive
        const uploadMetadata: drive_v3.Schema$File = {
          name: pdfFilename,
          mimeType: 'application/pdf'
        };
        if (args.folderId) uploadMetadata.parents = [args.folderId];

        const uploadResponse = await driveClient.files.create({
          requestBody: uploadMetadata,
          media: {
            mimeType: 'application/pdf',
            body: pdfResponse.data
          },
          fields: 'id, name, webViewLink',
          supportsAllDrives: true
        });

        const result = {
          pdfFileId: uploadResponse.data.id,
          pdfFilename: uploadResponse.data.name,
          pdfLink: uploadResponse.data.webViewLink,
          originalDocumentId: args.documentId
        };

        logger.info('Exported document to PDF', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          pdfFileId: uploadResponse.data.id
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to export document to PDF', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Get document structure
  registry.registerTool(
    'docs_get_document_structure',
    'Get detailed structure information about a document (elements, indices, tables)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document to inspect')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        const response = await client.documents.get({
          documentId: args.documentId
        });

        const elements = response.data.body?.content || [];
        const structure = {
          documentId: response.data.documentId,
          title: response.data.title,
          totalElements: elements.length,
          documentLength: elements[elements.length - 1]?.endIndex || 1,
          elements: elements.map(elem => ({
            startIndex: elem.startIndex,
            endIndex: elem.endIndex,
            type: elem.paragraph ? 'paragraph' :
                  elem.table ? 'table' :
                  elem.sectionBreak ? 'sectionBreak' :
                  elem.tableOfContents ? 'tableOfContents' : 'unknown',
            ...(elem.table && {
              tableInfo: {
                rows: elem.table.rows,
                columns: elem.table.columns
              }
            })
          })),
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };

        logger.info('Retrieved document structure', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          totalElements: elements.length
        });

        return structure;
      } catch (error: any) {
        logger.error('Failed to get document structure', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Batch update document
  registry.registerTool(
    'docs_batch_update',
    'Execute multiple document operations in a single atomic batch',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document to update'),
      requests: z.array(z.any()).describe('Array of batch update requests (Google Docs API format)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        const response = await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: args.requests
          }
        });

        const result = {
          documentId: args.documentId,
          repliesCount: response.data.replies?.length || 0,
          replies: response.data.replies,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };

        logger.info('Executed batch update', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          requestsCount: args.requests.length,
          repliesCount: result.repliesCount
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to execute batch update', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Get document revisions
  registry.registerTool(
    'docs_get_revisions',
    'Get revision history of a Google Doc',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      maxResults: z.number().int().min(1).max(1000).optional().describe('Maximum number of revisions (default: 100)')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const response = await driveClient.revisions.list({
          fileId: args.documentId,
          pageSize: args.maxResults || 100,
          fields: 'revisions(id, modifiedTime, lastModifyingUser, exportLinks)',
          supportsAllDrives: true
        });

        const revisions = (response.data.revisions || []).map(rev => ({
          id: rev.id,
          modifiedTime: rev.modifiedTime,
          lastModifyingUser: rev.lastModifyingUser?.displayName || rev.lastModifyingUser?.emailAddress,
          exportLinks: rev.exportLinks
        }));

        logger.info('Retrieved document revisions', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          revisionsCount: revisions.length
        });

        return {
          documentId: args.documentId,
          totalRevisions: revisions.length,
          revisions
        };
      } catch (error: any) {
        logger.error('Failed to get document revisions', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );
}
