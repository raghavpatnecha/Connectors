/**
 * Google Forms MCP - Watches Tools
 * Tools for managing form watches (notifications for new responses)
 */

import { z } from 'zod';
import { forms_v1 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all watch management tools
 */
export function registerWatchTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Create watch
  registry.registerTool(
    'forms_create_watch',
    'Create a watch to receive notifications for new form responses',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form to watch'),
      watchId: z.string().optional().describe('Optional custom watch ID'),
      eventType: z.enum(['RESPONSES', 'SCHEMA']).optional().describe('Type of events to watch (default: RESPONSES)'),
      target: z.object({
        topic: z.string().describe('Cloud Pub/Sub topic name')
      }).describe('Watch target (Cloud Pub/Sub topic)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const watchBody: forms_v1.Schema$Watch = {
          target: args.target,
          eventType: args.eventType || 'RESPONSES'
        };

        if (args.watchId) {
          watchBody.id = args.watchId;
        }

        const response = await client.forms.watches.create({
          formId: args.formId,
          requestBody: watchBody
        });

        const watch = response.data;

        const result = {
          watchId: watch.id,
          formId: args.formId,
          eventType: watch.eventType,
          state: watch.state,
          createTime: watch.createTime,
          expireTime: watch.expireTime,
          target: watch.target,
          message: `Successfully created watch for form ${args.formId}`
        };

        logger.info('Created form watch', {
          tenantId: args.tenantId,
          formId: args.formId,
          watchId: watch.id
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create form watch', {
          tenantId: args.tenantId,
          formId: args.formId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Delete watch
  registry.registerTool(
    'forms_delete_watch',
    'Delete an existing watch to stop receiving notifications',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form'),
      watchId: z.string().describe('ID of the watch to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        await client.forms.watches.delete({
          formId: args.formId,
          watchId: args.watchId
        });

        logger.info('Deleted form watch', {
          tenantId: args.tenantId,
          formId: args.formId,
          watchId: args.watchId
        });

        return {
          success: true,
          formId: args.formId,
          watchId: args.watchId,
          message: `Successfully deleted watch ${args.watchId} for form ${args.formId}`
        };
      } catch (error: any) {
        logger.error('Failed to delete form watch', {
          tenantId: args.tenantId,
          formId: args.formId,
          watchId: args.watchId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // List watches
  registry.registerTool(
    'forms_list_watches',
    'List all active watches for a form',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const response = await client.forms.watches.list({
          formId: args.formId
        });

        const watches = response.data.watches || [];

        const result = {
          formId: args.formId,
          totalWatches: watches.length,
          watches: watches.map(watch => ({
            watchId: watch.id,
            eventType: watch.eventType,
            state: watch.state,
            createTime: watch.createTime,
            expireTime: watch.expireTime,
            errorType: watch.errorType
          }))
        };

        logger.info('Listed form watches', {
          tenantId: args.tenantId,
          formId: args.formId,
          count: watches.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to list form watches', {
          tenantId: args.tenantId,
          formId: args.formId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Renew watch
  registry.registerTool(
    'forms_renew_watch',
    'Renew an existing watch to extend its expiration time',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form'),
      watchId: z.string().describe('ID of the watch to renew')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const response = await client.forms.watches.renew({
          formId: args.formId,
          watchId: args.watchId
        });

        const watch = response.data;

        const result = {
          watchId: watch.id,
          formId: args.formId,
          state: watch.state,
          expireTime: watch.expireTime,
          message: `Successfully renewed watch ${args.watchId}. New expiration: ${watch.expireTime}`
        };

        logger.info('Renewed form watch', {
          tenantId: args.tenantId,
          formId: args.formId,
          watchId: args.watchId,
          expireTime: watch.expireTime
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to renew form watch', {
          tenantId: args.tenantId,
          formId: args.formId,
          watchId: args.watchId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );
}
