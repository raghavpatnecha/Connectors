/**
 * Google Slides MCP - Presentation Management Tools
 * Tools for creating, reading, and managing Google Slides presentations
 */

import { z } from 'zod';
import { slides_v1, drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all presentation management tools
 */
export function registerPresentationTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Create a new presentation
  registry.registerTool(
    'slides_create_presentation',
    'Create a new Google Slides presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      title: z.string().describe('Title of the new presentation')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const response = await client.presentations.create({
          requestBody: {
            title: args.title
          }
        });

        const presentationId = response.data.presentationId!;

        const result = {
          presentationId,
          title: response.data.title,
          revisionId: response.data.revisionId,
          slides: response.data.slides?.length || 0,
          link: `https://docs.google.com/presentation/d/${presentationId}/edit`
        };

        logger.info('Created presentation', {
          tenantId: args.tenantId,
          presentationId,
          title: args.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create presentation', {
          tenantId: args.tenantId,
          title: args.title,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Get presentation details
  registry.registerTool(
    'slides_get_presentation',
    'Retrieve the full content and structure of a Google Slides presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation to retrieve')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const response = await client.presentations.get({
          presentationId: args.presentationId
        });

        const slides = response.data.slides || [];
        const pageSize = response.data.pageSize || {};

        const slidesInfo = slides.map((slide, index) => ({
          slideNumber: index + 1,
          objectId: slide.objectId,
          pageType: slide.slideProperties?.layoutObjectId ? 'layout' : 'slide',
          elementsCount: slide.pageElements?.length || 0
        }));

        const result = {
          presentationId: response.data.presentationId,
          title: response.data.title,
          revisionId: response.data.revisionId,
          totalSlides: slides.length,
          pageSize: {
            width: pageSize.width?.magnitude,
            height: pageSize.height?.magnitude,
            unit: pageSize.width?.unit
          },
          slides: slidesInfo,
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit`
        };

        logger.info('Retrieved presentation', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          slidesCount: slides.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get presentation', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Batch update presentation
  registry.registerTool(
    'slides_batch_update',
    'Execute multiple presentation operations in a single atomic batch',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation to update'),
      requests: z.array(z.any()).describe('Array of batch update requests (Google Slides API format)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const response = await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: args.requests
          }
        });

        const replies = response.data.replies || [];

        const result = {
          presentationId: args.presentationId,
          requestsApplied: args.requests.length,
          repliesCount: replies.length,
          replies: replies.map(reply => {
            if (reply.createSlide) {
              return { type: 'createSlide', objectId: reply.createSlide.objectId };
            } else if (reply.createShape) {
              return { type: 'createShape', objectId: reply.createShape.objectId };
            } else if (reply.createTable) {
              return { type: 'createTable', objectId: reply.createTable.objectId };
            } else if (reply.createImage) {
              return { type: 'createImage', objectId: reply.createImage.objectId };
            }
            return { type: 'other' };
          }),
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit`
        };

        logger.info('Executed batch update', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          requestsCount: args.requests.length,
          repliesCount: replies.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to execute batch update', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Search for presentations (uses Drive API)
  registry.registerTool(
    'slides_search_presentations',
    'Search for Google Slides presentations by name',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      query: z.string().describe('Search query (searches in presentation names)'),
      maxResults: z.number().int().min(1).max(100).optional().describe('Maximum number of results (default: 10)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDriveClient(args.tenantId);

        const escapedQuery = args.query.replace(/'/g, "\\'");
        const response = await client.files.list({
          q: `name contains '${escapedQuery}' and mimeType='application/vnd.google-apps.presentation' and trashed=false`,
          pageSize: args.maxResults || 10,
          fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });

        const presentations = (response.data.files || []).map(file => ({
          id: file.id,
          name: file.name,
          createdTime: file.createdTime,
          modifiedTime: file.modifiedTime,
          link: file.webViewLink
        }));

        logger.info('Searched presentations', {
          tenantId: args.tenantId,
          query: args.query,
          resultsFound: presentations.length
        });

        return {
          query: args.query,
          totalResults: presentations.length,
          presentations
        };
      } catch (error: any) {
        logger.error('Failed to search presentations', {
          tenantId: args.tenantId,
          query: args.query,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Copy a presentation
  registry.registerTool(
    'slides_copy_presentation',
    'Create a copy of an existing Google Slides presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation to copy'),
      title: z.string().optional().describe('Title for the copied presentation (default: "Copy of [original title]")'),
      folderId: z.string().optional().describe('Drive folder ID to place the copy in')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const requestBody: drive_v3.Schema$File = {};
        if (args.title) requestBody.name = args.title;
        if (args.folderId) requestBody.parents = [args.folderId];

        const response = await driveClient.files.copy({
          fileId: args.presentationId,
          requestBody,
          fields: 'id, name, webViewLink',
          supportsAllDrives: true
        });

        const result = {
          presentationId: response.data.id,
          title: response.data.name,
          link: response.data.webViewLink
        };

        logger.info('Copied presentation', {
          tenantId: args.tenantId,
          sourceId: args.presentationId,
          newId: response.data.id
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to copy presentation', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Delete a presentation
  registry.registerTool(
    'slides_delete_presentation',
    'Move a Google Slides presentation to trash',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation to delete')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        await driveClient.files.update({
          fileId: args.presentationId,
          requestBody: {
            trashed: true
          },
          supportsAllDrives: true
        });

        logger.info('Deleted presentation', {
          tenantId: args.tenantId,
          presentationId: args.presentationId
        });

        return {
          success: true,
          message: `Presentation ${args.presentationId} has been moved to trash.`
        };
      } catch (error: any) {
        logger.error('Failed to delete presentation', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Export presentation to PDF
  registry.registerTool(
    'slides_export_to_pdf',
    'Export a Google Slides presentation to PDF format and save to Drive',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation to export'),
      pdfFilename: z.string().optional().describe('Name for the PDF file (default: [presentation name]_PDF.pdf)'),
      folderId: z.string().optional().describe('Drive folder ID to save PDF in (default: root)')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        // Get original presentation metadata
        const fileMetadata = await driveClient.files.get({
          fileId: args.presentationId,
          fields: 'id, name, mimeType',
          supportsAllDrives: true
        });

        if (fileMetadata.data.mimeType !== 'application/vnd.google-apps.presentation') {
          throw new Error('File is not a Google Slides presentation');
        }

        // Export as PDF
        const pdfResponse = await driveClient.files.export({
          fileId: args.presentationId,
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
          originalPresentationId: args.presentationId
        };

        logger.info('Exported presentation to PDF', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          pdfFileId: uploadResponse.data.id
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to export presentation to PDF', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );
}
