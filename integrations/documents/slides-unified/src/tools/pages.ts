/**
 * Google Slides MCP - Page/Slide Management Tools
 * Tools for creating, deleting, duplicating, and managing individual slides
 */

import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all page/slide management tools
 */
export function registerPageTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Create a new slide
  registry.registerTool(
    'slides_create_slide',
    'Create a new slide in a presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      insertionIndex: z.number().int().min(0).optional().describe('Index where to insert slide (default: end of presentation)'),
      slideLayoutReference: z.string().optional().describe('Layout object ID to use for the slide')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const createSlideRequest: any = {
          createSlide: {}
        };

        if (args.insertionIndex !== undefined) {
          createSlideRequest.createSlide.insertionIndex = args.insertionIndex;
        }

        if (args.slideLayoutReference) {
          createSlideRequest.createSlide.slideLayoutReference = {
            layoutId: args.slideLayoutReference
          };
        }

        const response = await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [createSlideRequest]
          }
        });

        const objectId = response.data.replies?.[0]?.createSlide?.objectId;

        const result = {
          presentationId: args.presentationId,
          slideObjectId: objectId,
          insertionIndex: args.insertionIndex,
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit#slide=id.${objectId}`
        };

        logger.info('Created slide', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          slideObjectId: objectId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create slide', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Delete a slide
  registry.registerTool(
    'slides_delete_slide',
    'Delete a slide from a presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      pageObjectId: z.string().describe('Object ID of the slide to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [{
              deleteObject: {
                objectId: args.pageObjectId
              }
            }]
          }
        });

        logger.info('Deleted slide', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId
        });

        return {
          success: true,
          presentationId: args.presentationId,
          deletedSlideId: args.pageObjectId,
          message: `Slide ${args.pageObjectId} has been deleted.`
        };
      } catch (error: any) {
        logger.error('Failed to delete slide', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Duplicate a slide
  registry.registerTool(
    'slides_duplicate_slide',
    'Duplicate an existing slide in a presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      pageObjectId: z.string().describe('Object ID of the slide to duplicate'),
      insertionIndex: z.number().int().min(0).optional().describe('Index where to insert duplicated slide')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const duplicateRequest: any = {
          duplicateObject: {
            objectId: args.pageObjectId
          }
        };

        if (args.insertionIndex !== undefined) {
          duplicateRequest.duplicateObject.objectIds = {
            [args.pageObjectId]: `duplicate_${args.pageObjectId}_${Date.now()}`
          };
        }

        const response = await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [duplicateRequest]
          }
        });

        const newObjectId = response.data.replies?.[0]?.duplicateObject?.objectId;

        const result = {
          presentationId: args.presentationId,
          originalSlideId: args.pageObjectId,
          newSlideId: newObjectId,
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit#slide=id.${newObjectId}`
        };

        logger.info('Duplicated slide', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          originalSlideId: args.pageObjectId,
          newSlideId: newObjectId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to duplicate slide', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Get page details
  registry.registerTool(
    'slides_get_page',
    'Get detailed information about a specific slide/page in a presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      pageObjectId: z.string().describe('Object ID of the page/slide to retrieve')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const response = await client.presentations.pages.get({
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId
        });

        const page = response.data;
        const pageElements = page.pageElements || [];

        const elementsInfo = pageElements.map(element => {
          const elementType = element.shape ? 'shape' :
                            element.table ? 'table' :
                            element.line ? 'line' :
                            element.image ? 'image' :
                            element.video ? 'video' :
                            element.wordArt ? 'wordArt' :
                            element.speakerSpotlight ? 'speakerSpotlight' : 'unknown';

          return {
            objectId: element.objectId,
            type: elementType,
            ...(element.shape && { shapeType: element.shape.shapeType }),
            ...(element.table && {
              rows: element.table.rows,
              columns: element.table.columns
            })
          };
        });

        const result = {
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          pageType: page.pageType,
          totalElements: pageElements.length,
          elements: elementsInfo,
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit#slide=id.${args.pageObjectId}`
        };

        logger.info('Retrieved page details', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          elementsCount: pageElements.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get page', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Reorder slides
  registry.registerTool(
    'slides_reorder_slides',
    'Reorder slides in a presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      slideObjectIds: z.array(z.string()).describe('Array of slide object IDs in desired order')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        // Create update requests to reorder slides
        const requests = args.slideObjectIds.map((objectId, index) => ({
          updateSlidesPosition: {
            slideObjectIds: [objectId],
            insertionIndex: index
          }
        }));

        await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests
          }
        });

        logger.info('Reordered slides', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          slidesCount: args.slideObjectIds.length
        });

        return {
          success: true,
          presentationId: args.presentationId,
          reorderedSlides: args.slideObjectIds.length,
          newOrder: args.slideObjectIds
        };
      } catch (error: any) {
        logger.error('Failed to reorder slides', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );
}
