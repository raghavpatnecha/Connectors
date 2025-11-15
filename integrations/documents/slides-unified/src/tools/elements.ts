/**
 * Google Slides MCP - Element Management Tools
 * Tools for creating and managing shapes, text boxes, images, tables, lines, and other elements
 */

import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all element management tools
 */
export function registerElementTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Create a shape
  registry.registerTool(
    'slides_create_shape',
    'Create a shape on a slide',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      pageObjectId: z.string().describe('Object ID of the slide to add shape to'),
      shapeType: z.enum(['TEXT_BOX', 'RECTANGLE', 'ROUND_RECTANGLE', 'ELLIPSE', 'CLOUD', 'STAR', 'ARROW']).describe('Type of shape to create'),
      elementId: z.string().optional().describe('Custom element ID (auto-generated if not provided)'),
      width: z.number().optional().describe('Width in EMU (default: 3000000)'),
      height: z.number().optional().describe('Height in EMU (default: 3000000)'),
      translateX: z.number().optional().describe('X position in EMU (default: 0)'),
      translateY: z.number().optional().describe('Y position in EMU (default: 0)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const elementId = args.elementId || `shape_${Date.now()}`;

        const response = await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [{
              createShape: {
                objectId: elementId,
                shapeType: args.shapeType,
                elementProperties: {
                  pageObjectId: args.pageObjectId,
                  size: {
                    width: { magnitude: args.width || 3000000, unit: 'EMU' },
                    height: { magnitude: args.height || 3000000, unit: 'EMU' }
                  },
                  transform: {
                    scaleX: 1,
                    scaleY: 1,
                    translateX: args.translateX || 0,
                    translateY: args.translateY || 0,
                    unit: 'EMU'
                  }
                }
              }
            }]
          }
        });

        const objectId = response.data.replies?.[0]?.createShape?.objectId;

        const result = {
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          shapeObjectId: objectId,
          shapeType: args.shapeType,
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit#slide=id.${args.pageObjectId}`
        };

        logger.info('Created shape', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          shapeObjectId: objectId,
          shapeType: args.shapeType
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create shape', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Insert text into a shape
  registry.registerTool(
    'slides_insert_text',
    'Insert text into a shape or text box',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      shapeObjectId: z.string().describe('Object ID of the shape/text box'),
      text: z.string().describe('Text to insert'),
      insertionIndex: z.number().int().min(0).optional().describe('Position to insert text (default: 0)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [{
              insertText: {
                objectId: args.shapeObjectId,
                insertionIndex: args.insertionIndex || 0,
                text: args.text
              }
            }]
          }
        });

        logger.info('Inserted text', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          textLength: args.text.length
        });

        return {
          success: true,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          insertedLength: args.text.length
        };
      } catch (error: any) {
        logger.error('Failed to insert text', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Delete text from a shape
  registry.registerTool(
    'slides_delete_text',
    'Delete text from a shape or text box',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      shapeObjectId: z.string().describe('Object ID of the shape/text box'),
      startIndex: z.number().int().min(0).describe('Start index of text to delete'),
      endIndex: z.number().int().min(0).describe('End index of text to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [{
              deleteText: {
                objectId: args.shapeObjectId,
                textRange: {
                  type: 'FIXED_RANGE',
                  startIndex: args.startIndex,
                  endIndex: args.endIndex
                }
              }
            }]
          }
        });

        logger.info('Deleted text', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          deletedLength: args.endIndex - args.startIndex
        });

        return {
          success: true,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          deletedLength: args.endIndex - args.startIndex
        };
      } catch (error: any) {
        logger.error('Failed to delete text', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Create an image
  registry.registerTool(
    'slides_create_image',
    'Create an image on a slide from a URL',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      pageObjectId: z.string().describe('Object ID of the slide to add image to'),
      imageUrl: z.string().url().describe('URL of the image to insert'),
      elementId: z.string().optional().describe('Custom element ID (auto-generated if not provided)'),
      width: z.number().optional().describe('Width in EMU'),
      height: z.number().optional().describe('Height in EMU'),
      translateX: z.number().optional().describe('X position in EMU (default: 0)'),
      translateY: z.number().optional().describe('Y position in EMU (default: 0)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const elementId = args.elementId || `image_${Date.now()}`;

        const createImageRequest: any = {
          createImage: {
            objectId: elementId,
            url: args.imageUrl,
            elementProperties: {
              pageObjectId: args.pageObjectId,
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: args.translateX || 0,
                translateY: args.translateY || 0,
                unit: 'EMU'
              }
            }
          }
        };

        if (args.width && args.height) {
          createImageRequest.createImage.elementProperties.size = {
            width: { magnitude: args.width, unit: 'EMU' },
            height: { magnitude: args.height, unit: 'EMU' }
          };
        }

        const response = await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [createImageRequest]
          }
        });

        const objectId = response.data.replies?.[0]?.createImage?.objectId;

        const result = {
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          imageObjectId: objectId,
          imageUrl: args.imageUrl,
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit#slide=id.${args.pageObjectId}`
        };

        logger.info('Created image', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          imageObjectId: objectId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create image', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Create a table
  registry.registerTool(
    'slides_create_table',
    'Create a table on a slide',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      pageObjectId: z.string().describe('Object ID of the slide to add table to'),
      rows: z.number().int().min(1).describe('Number of rows'),
      columns: z.number().int().min(1).describe('Number of columns'),
      elementId: z.string().optional().describe('Custom element ID (auto-generated if not provided)'),
      translateX: z.number().optional().describe('X position in EMU (default: 0)'),
      translateY: z.number().optional().describe('Y position in EMU (default: 0)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const elementId = args.elementId || `table_${Date.now()}`;

        const response = await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [{
              createTable: {
                objectId: elementId,
                rows: args.rows,
                columns: args.columns,
                elementProperties: {
                  pageObjectId: args.pageObjectId,
                  transform: {
                    scaleX: 1,
                    scaleY: 1,
                    translateX: args.translateX || 0,
                    translateY: args.translateY || 0,
                    unit: 'EMU'
                  }
                }
              }
            }]
          }
        });

        const objectId = response.data.replies?.[0]?.createTable?.objectId;

        const result = {
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          tableObjectId: objectId,
          rows: args.rows,
          columns: args.columns,
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit#slide=id.${args.pageObjectId}`
        };

        logger.info('Created table', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          tableObjectId: objectId,
          rows: args.rows,
          columns: args.columns
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create table', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Create a line
  registry.registerTool(
    'slides_create_line',
    'Create a line on a slide',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      pageObjectId: z.string().describe('Object ID of the slide to add line to'),
      lineCategory: z.enum(['STRAIGHT', 'BENT', 'CURVED']).describe('Category of line'),
      elementId: z.string().optional().describe('Custom element ID (auto-generated if not provided)'),
      startX: z.number().describe('Start X position in EMU'),
      startY: z.number().describe('Start Y position in EMU'),
      endX: z.number().describe('End X position in EMU'),
      endY: z.number().describe('End Y position in EMU')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const elementId = args.elementId || `line_${Date.now()}`;

        const response = await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [{
              createLine: {
                objectId: elementId,
                lineCategory: args.lineCategory,
                elementProperties: {
                  pageObjectId: args.pageObjectId,
                  transform: {
                    scaleX: 1,
                    scaleY: 1,
                    translateX: args.startX,
                    translateY: args.startY,
                    unit: 'EMU'
                  }
                }
              }
            }]
          }
        });

        const objectId = response.data.replies?.[0]?.createLine?.objectId;

        const result = {
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          lineObjectId: objectId,
          lineCategory: args.lineCategory,
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit#slide=id.${args.pageObjectId}`
        };

        logger.info('Created line', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          lineObjectId: objectId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create line', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Create a video
  registry.registerTool(
    'slides_create_video',
    'Create a video on a slide from a YouTube URL or Drive file',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      pageObjectId: z.string().describe('Object ID of the slide to add video to'),
      videoSource: z.enum(['YOUTUBE', 'DRIVE']).describe('Source of the video'),
      videoId: z.string().describe('YouTube video ID or Drive file ID'),
      elementId: z.string().optional().describe('Custom element ID (auto-generated if not provided)'),
      translateX: z.number().optional().describe('X position in EMU (default: 0)'),
      translateY: z.number().optional().describe('Y position in EMU (default: 0)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const elementId = args.elementId || `video_${Date.now()}`;

        const createVideoRequest: any = {
          createVideo: {
            objectId: elementId,
            source: args.videoSource,
            elementProperties: {
              pageObjectId: args.pageObjectId,
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: args.translateX || 0,
                translateY: args.translateY || 0,
                unit: 'EMU'
              }
            }
          }
        };

        if (args.videoSource === 'YOUTUBE') {
          createVideoRequest.createVideo.id = args.videoId;
        } else {
          createVideoRequest.createVideo.id = args.videoId;
        }

        const response = await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [createVideoRequest]
          }
        });

        const objectId = response.data.replies?.[0]?.createVideo?.objectId;

        const result = {
          presentationId: args.presentationId,
          pageObjectId: args.pageObjectId,
          videoObjectId: objectId,
          videoSource: args.videoSource,
          link: `https://docs.google.com/presentation/d/${args.presentationId}/edit#slide=id.${args.pageObjectId}`
        };

        logger.info('Created video', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          videoObjectId: objectId,
          videoSource: args.videoSource
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create video', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Update text style
  registry.registerTool(
    'slides_update_text_style',
    'Update text formatting in a shape or text box',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      shapeObjectId: z.string().describe('Object ID of the shape/text box'),
      bold: z.boolean().optional().describe('Make text bold'),
      italic: z.boolean().optional().describe('Make text italic'),
      fontSize: z.number().optional().describe('Font size in points'),
      foregroundColor: z.object({
        red: z.number().min(0).max(1),
        green: z.number().min(0).max(1),
        blue: z.number().min(0).max(1)
      }).optional().describe('Text color (RGB values 0-1)'),
      startIndex: z.number().int().min(0).optional().describe('Start index of text range (default: all text)'),
      endIndex: z.number().int().min(0).optional().describe('End index of text range (default: all text)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const textStyle: any = {};
        if (args.bold !== undefined) textStyle.bold = args.bold;
        if (args.italic !== undefined) textStyle.italic = args.italic;
        if (args.fontSize !== undefined) textStyle.fontSize = { magnitude: args.fontSize, unit: 'PT' };
        if (args.foregroundColor) {
          textStyle.foregroundColor = {
            opaqueColor: { rgbColor: args.foregroundColor }
          };
        }

        const textRange: any = {};
        if (args.startIndex !== undefined && args.endIndex !== undefined) {
          textRange.type = 'FIXED_RANGE';
          textRange.startIndex = args.startIndex;
          textRange.endIndex = args.endIndex;
        } else {
          textRange.type = 'ALL';
        }

        await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [{
              updateTextStyle: {
                objectId: args.shapeObjectId,
                textRange,
                style: textStyle,
                fields: Object.keys(textStyle).join(',')
              }
            }]
          }
        });

        logger.info('Updated text style', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId
        });

        return {
          success: true,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          updatedProperties: Object.keys(textStyle)
        };
      } catch (error: any) {
        logger.error('Failed to update text style', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Delete an element/object
  registry.registerTool(
    'slides_delete_element',
    'Delete an element (shape, image, table, etc.) from a slide',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      objectId: z.string().describe('Object ID of the element to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [{
              deleteObject: {
                objectId: args.objectId
              }
            }]
          }
        });

        logger.info('Deleted element', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          objectId: args.objectId
        });

        return {
          success: true,
          presentationId: args.presentationId,
          deletedObjectId: args.objectId
        };
      } catch (error: any) {
        logger.error('Failed to delete element', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          objectId: args.objectId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Replace text in a shape
  registry.registerTool(
    'slides_replace_text',
    'Replace all instances of text in a shape or presentation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      containsText: z.string().describe('Text to search for'),
      replaceText: z.string().describe('Replacement text'),
      matchCase: z.boolean().optional().describe('Whether to match case (default: false)'),
      pageObjectId: z.string().optional().describe('Limit replacement to specific slide (optional)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const replaceRequest: any = {
          replaceAllText: {
            containsText: {
              text: args.containsText,
              matchCase: args.matchCase || false
            },
            replaceText: args.replaceText
          }
        };

        if (args.pageObjectId) {
          replaceRequest.replaceAllText.pageObjectIds = [args.pageObjectId];
        }

        const response = await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests: [replaceRequest]
          }
        });

        const occurrencesChanged = response.data.replies?.[0]?.replaceAllText?.occurrencesChanged || 0;

        logger.info('Replaced text', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          occurrencesChanged
        });

        return {
          success: true,
          presentationId: args.presentationId,
          searchText: args.containsText,
          replaceText: args.replaceText,
          occurrencesChanged
        };
      } catch (error: any) {
        logger.error('Failed to replace text', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );

  // Update shape properties
  registry.registerTool(
    'slides_update_shape_properties',
    'Update visual properties of a shape (fill color, outline, etc.)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      presentationId: z.string().describe('ID of the presentation'),
      shapeObjectId: z.string().describe('Object ID of the shape'),
      fillColor: z.object({
        red: z.number().min(0).max(1),
        green: z.number().min(0).max(1),
        blue: z.number().min(0).max(1)
      }).optional().describe('Fill color (RGB values 0-1)'),
      outlineColor: z.object({
        red: z.number().min(0).max(1),
        green: z.number().min(0).max(1),
        blue: z.number().min(0).max(1)
      }).optional().describe('Outline color (RGB values 0-1)'),
      outlineWeight: z.number().optional().describe('Outline weight in EMU')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSlidesClient(args.tenantId);

        const requests: any[] = [];

        // Update fill color
        if (args.fillColor) {
          requests.push({
            updateShapeProperties: {
              objectId: args.shapeObjectId,
              shapeProperties: {
                shapeBackgroundFill: {
                  solidFill: {
                    color: {
                      rgbColor: args.fillColor
                    }
                  }
                }
              },
              fields: 'shapeBackgroundFill.solidFill.color'
            }
          });
        }

        // Update outline
        if (args.outlineColor || args.outlineWeight) {
          const outline: any = {};
          if (args.outlineColor) {
            outline.solidFill = {
              color: {
                rgbColor: args.outlineColor
              }
            };
          }
          if (args.outlineWeight) {
            outline.weight = {
              magnitude: args.outlineWeight,
              unit: 'EMU'
            };
          }

          const fields = [];
          if (args.outlineColor) fields.push('outline.solidFill.color');
          if (args.outlineWeight) fields.push('outline.weight');

          requests.push({
            updateShapeProperties: {
              objectId: args.shapeObjectId,
              shapeProperties: {
                outline
              },
              fields: fields.join(',')
            }
          });
        }

        await client.presentations.batchUpdate({
          presentationId: args.presentationId,
          requestBody: {
            requests
          }
        });

        logger.info('Updated shape properties', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId
        });

        return {
          success: true,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          updatedProperties: {
            fillColor: !!args.fillColor,
            outlineColor: !!args.outlineColor,
            outlineWeight: !!args.outlineWeight
          }
        };
      } catch (error: any) {
        logger.error('Failed to update shape properties', {
          tenantId: args.tenantId,
          presentationId: args.presentationId,
          shapeObjectId: args.shapeObjectId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'slides');
      }
    }
  );
}
