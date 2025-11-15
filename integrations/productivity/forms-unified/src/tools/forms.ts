/**
 * Google Forms MCP - Forms Tools
 * Tools for managing Google Forms
 */

import { z } from 'zod';
import { forms_v1 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory.js';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all form management tools
 */
export function registerFormTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Create a new form
  registry.registerTool(
    'forms_create_form',
    'Create a new Google Form with title and optional description',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      title: z.string().describe('Title of the form'),
      description: z.string().optional().describe('Description of the form'),
      documentTitle: z.string().optional().describe('Document title (shown in browser tab)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const formBody: forms_v1.Schema$Form = {
          info: {
            title: args.title
          }
        };

        if (args.description) {
          formBody.info!.description = args.description;
        }

        if (args.documentTitle) {
          formBody.info!.documentTitle = args.documentTitle;
        }

        const response = await client.forms.create({
          requestBody: formBody
        });

        const formId = response.data.formId!;
        const editUrl = `https://docs.google.com/forms/d/${formId}/edit`;
        const responderUrl = response.data.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`;

        const result = {
          formId,
          title: response.data.info?.title,
          editUrl,
          responderUrl,
          message: `Successfully created form '${response.data.info?.title}'. Form ID: ${formId}`
        };

        logger.info('Created form', {
          tenantId: args.tenantId,
          formId,
          title: args.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create form', {
          tenantId: args.tenantId,
          title: args.title,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Get form details
  registry.registerTool(
    'forms_get_form',
    'Get details of a specific form including questions and settings',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form to retrieve')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const response = await client.forms.get({
          formId: args.formId
        });

        const form = response.data;
        const formInfo = form.info || {};
        const items = form.items || [];

        const result = {
          formId: form.formId,
          title: formInfo.title || 'No Title',
          description: formInfo.description || 'No Description',
          documentTitle: formInfo.documentTitle,
          editUrl: `https://docs.google.com/forms/d/${form.formId}/edit`,
          responderUrl: form.responderUri || `https://docs.google.com/forms/d/${form.formId}/viewform`,
          questionCount: items.length,
          questions: items.map((item, index) => ({
            itemId: item.itemId,
            title: item.title || `Question ${index + 1}`,
            questionType: item.questionItem?.question?.questionId ? 'question' : 'other',
            required: item.questionItem?.question?.required || false
          })),
          settings: form.settings
        };

        logger.info('Retrieved form', {
          tenantId: args.tenantId,
          formId: args.formId,
          title: formInfo.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get form', {
          tenantId: args.tenantId,
          formId: args.formId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Batch update form (generic updates)
  registry.registerTool(
    'forms_batch_update',
    'Perform batch updates to a form structure (add/update/delete items, update settings)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form to update'),
      requests: z.array(z.any()).describe('Array of batch update requests (CreateItem, UpdateItem, DeleteItem, UpdateFormInfo, UpdateSettings)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const response = await client.forms.batchUpdate({
          formId: args.formId,
          requestBody: {
            requests: args.requests
          }
        });

        logger.info('Batch updated form', {
          tenantId: args.tenantId,
          formId: args.formId,
          requestCount: args.requests.length
        });

        return {
          success: true,
          formId: args.formId,
          replies: response.data.replies,
          message: `Successfully applied ${args.requests.length} update(s) to form ${args.formId}`
        };
      } catch (error: any) {
        logger.error('Failed to batch update form', {
          tenantId: args.tenantId,
          formId: args.formId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Update form info (title/description)
  registry.registerTool(
    'forms_update_info',
    'Update form title, description, or document title',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form to update'),
      title: z.string().optional().describe('New title for the form'),
      description: z.string().optional().describe('New description for the form'),
      documentTitle: z.string().optional().describe('New document title')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const updateMask: string[] = [];
        const info: forms_v1.Schema$Info = {};

        if (args.title !== undefined) {
          info.title = args.title;
          updateMask.push('title');
        }

        if (args.description !== undefined) {
          info.description = args.description;
          updateMask.push('description');
        }

        if (args.documentTitle !== undefined) {
          info.documentTitle = args.documentTitle;
          updateMask.push('documentTitle');
        }

        const response = await client.forms.batchUpdate({
          formId: args.formId,
          requestBody: {
            requests: [{
              updateFormInfo: {
                info,
                updateMask: updateMask.join(',')
              }
            }]
          }
        });

        logger.info('Updated form info', {
          tenantId: args.tenantId,
          formId: args.formId,
          updates: updateMask
        });

        return {
          success: true,
          formId: args.formId,
          updatedFields: updateMask,
          message: `Successfully updated form info: ${updateMask.join(', ')}`
        };
      } catch (error: any) {
        logger.error('Failed to update form info', {
          tenantId: args.tenantId,
          formId: args.formId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Update form settings
  registry.registerTool(
    'forms_update_settings',
    'Update form settings (quiz mode, collect email, etc.)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form to update'),
      quizSettings: z.object({
        isQuiz: z.boolean().optional()
      }).optional().describe('Quiz settings'),
      settings: z.any().optional().describe('Additional form settings')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const requests: any[] = [];

        if (args.quizSettings) {
          requests.push({
            updateSettings: {
              settings: {
                quizSettings: args.quizSettings
              },
              updateMask: 'quizSettings.isQuiz'
            }
          });
        }

        if (args.settings) {
          requests.push({
            updateSettings: {
              settings: args.settings,
              updateMask: '*'
            }
          });
        }

        const response = await client.forms.batchUpdate({
          formId: args.formId,
          requestBody: { requests }
        });

        logger.info('Updated form settings', {
          tenantId: args.tenantId,
          formId: args.formId
        });

        return {
          success: true,
          formId: args.formId,
          message: 'Successfully updated form settings'
        };
      } catch (error: any) {
        logger.error('Failed to update form settings', {
          tenantId: args.tenantId,
          formId: args.formId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Create form item (question)
  registry.registerTool(
    'forms_create_item',
    'Add a new question or section to a form',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form'),
      title: z.string().describe('Title/text of the question'),
      questionType: z.enum(['TEXT', 'PARAGRAPH_TEXT', 'MULTIPLE_CHOICE', 'CHECKBOX', 'DROPDOWN', 'LINEAR_SCALE', 'DATE', 'TIME']).describe('Type of question'),
      required: z.boolean().optional().describe('Whether the question is required (default: false)'),
      location: z.object({
        index: z.number().int().optional().describe('Position to insert the item (0-based)')
      }).optional().describe('Location to insert the item')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const item: forms_v1.Schema$Item = {
          title: args.title,
          questionItem: {
            question: {
              required: args.required || false,
              [args.questionType.toLowerCase() + 'Question']: {}
            }
          }
        };

        const request: any = {
          createItem: {
            item,
            location: args.location || { index: 0 }
          }
        };

        const response = await client.forms.batchUpdate({
          formId: args.formId,
          requestBody: {
            requests: [request]
          }
        });

        logger.info('Created form item', {
          tenantId: args.tenantId,
          formId: args.formId,
          questionType: args.questionType
        });

        return {
          success: true,
          formId: args.formId,
          itemId: response.data.replies?.[0]?.createItem?.itemId,
          message: `Successfully added ${args.questionType} question: "${args.title}"`
        };
      } catch (error: any) {
        logger.error('Failed to create form item', {
          tenantId: args.tenantId,
          formId: args.formId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Update form item
  registry.registerTool(
    'forms_update_item',
    'Update an existing question in a form',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form'),
      itemId: z.string().describe('ID of the item to update'),
      title: z.string().optional().describe('New title for the question'),
      required: z.boolean().optional().describe('Whether the question is required'),
      updateMask: z.string().optional().describe('Fields to update (comma-separated)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const item: any = {};
        const fields: string[] = [];

        if (args.title !== undefined) {
          item.title = args.title;
          fields.push('title');
        }

        if (args.required !== undefined) {
          item.questionItem = {
            question: {
              required: args.required
            }
          };
          fields.push('questionItem.question.required');
        }

        const response = await client.forms.batchUpdate({
          formId: args.formId,
          requestBody: {
            requests: [{
              updateItem: {
                item: {
                  itemId: args.itemId,
                  ...item
                },
                updateMask: args.updateMask || fields.join(','),
                location: { index: 0 }
              }
            }]
          }
        });

        logger.info('Updated form item', {
          tenantId: args.tenantId,
          formId: args.formId,
          itemId: args.itemId
        });

        return {
          success: true,
          formId: args.formId,
          itemId: args.itemId,
          message: 'Successfully updated question'
        };
      } catch (error: any) {
        logger.error('Failed to update form item', {
          tenantId: args.tenantId,
          formId: args.formId,
          itemId: args.itemId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Delete form item
  registry.registerTool(
    'forms_delete_item',
    'Delete a question from a form',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form'),
      itemId: z.string().describe('ID of the item to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const response = await client.forms.batchUpdate({
          formId: args.formId,
          requestBody: {
            requests: [{
              deleteItem: {
                location: {
                  index: 0
                }
              }
            }]
          }
        });

        logger.info('Deleted form item', {
          tenantId: args.tenantId,
          formId: args.formId,
          itemId: args.itemId
        });

        return {
          success: true,
          formId: args.formId,
          itemId: args.itemId,
          message: `Successfully deleted item ${args.itemId} from form`
        };
      } catch (error: any) {
        logger.error('Failed to delete form item', {
          tenantId: args.tenantId,
          formId: args.formId,
          itemId: args.itemId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Move form item
  registry.registerTool(
    'forms_move_item',
    'Move a question to a different position in the form',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form'),
      itemId: z.string().describe('ID of the item to move'),
      newIndex: z.number().int().min(0).describe('New position index (0-based)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const response = await client.forms.batchUpdate({
          formId: args.formId,
          requestBody: {
            requests: [{
              moveItem: {
                originalLocation: {
                  index: 0
                },
                newLocation: {
                  index: args.newIndex
                }
              }
            }]
          }
        });

        logger.info('Moved form item', {
          tenantId: args.tenantId,
          formId: args.formId,
          itemId: args.itemId,
          newIndex: args.newIndex
        });

        return {
          success: true,
          formId: args.formId,
          itemId: args.itemId,
          newIndex: args.newIndex,
          message: `Successfully moved item to position ${args.newIndex}`
        };
      } catch (error: any) {
        logger.error('Failed to move form item', {
          tenantId: args.tenantId,
          formId: args.formId,
          itemId: args.itemId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );
}
