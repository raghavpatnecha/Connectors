/**
 * Google Slides MCP - Thumbnail Tools
 * Tools for generating and retrieving slide thumbnails
 */

import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory.js';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all thumbnail tools
 */
export function registerThumbnailTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Get page thumbnail
  registry.registerTool(
    'slides_get_page_thumbnail',
    'Generate a thumbnail URL for a specific slide/page in a presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      pageObjectId: z.string().describe('Object ID of the page/slide'),
      thumbnailSize: z.enum(['LARGE', 'MEDIUM', 'SMALL']).optional().describe('Size of thumbnail (default: MEDIUM)'),
      mimeType: z.enum(['PNG']).optional().describe('MIME type of thumbnail (default: PNG)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const response = await client.presentations.pages.getThumbnail({
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          'thumbnailProperties.thumbnailSize': args.thumbnailSize || 'MEDIUM',
          'thumbnailProperties.mimeType': args.mimeType || 'PNG'
        });

        const thumbnailUrl = response.data.contentUrl || '';

        const result = {
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          thumbnailUrl,
          thumbnailSize: args.thumbnailSize || 'MEDIUM',
          mimeType: args.mimeType || 'PNG',
          width: response.data.width,
          height: response.data.height
        };

        logger.info('Generated page thumbnail', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          thumbnailSize: args.thumbnailSize || 'MEDIUM'
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to generate page thumbnail', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Get all slide thumbnails
  registry.registerTool(
    'slides_get_all_thumbnails',
    'Get thumbnail URLs for all slides in a presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      thumbnailSize: z.enum(['LARGE', 'MEDIUM', 'SMALL']).optional().describe('Size of thumbnails (default: MEDIUM)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        // First, get the presentation to get all slide IDs
        const presentation = await client.presentations.get({
          presentationId: args.presentationId
        });

        const slides = presentation.data.slides || [];

        // Get thumbnails for all slides
        const thumbnails = await Promise.all(
          slides.map(async (slide, index) => {
            try {
              const response = await client.presentations.pages.getThumbnail({
                presentationId: args.presentationId,
                pageObjectId: slide.objectId!,
                'thumbnailProperties.thumbnailSize': args.thumbnailSize || 'MEDIUM',
                'thumbnailProperties.mimeType': 'PNG'
              });

              return {
                slideNumber: index + 1,
                objectId: slide.objectId,
                thumbnailUrl: response.data.contentUrl,
                width: response.data.width,
                height: response.data.height
              };
            } catch (error) {
              return {
                slideNumber: index + 1,
                objectId: slide.objectId,
                error: 'Failed to generate thumbnail'
              };
            }
          })
        );

        const result = {
          presentationId: args.presentationId,
          totalSlides: slides.length,
          thumbnailSize: args.thumbnailSize || 'MEDIUM',
          thumbnails
        };

        logger.info('Generated all slide thumbnails', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          totalSlides: slides.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to generate all thumbnails', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );
}
