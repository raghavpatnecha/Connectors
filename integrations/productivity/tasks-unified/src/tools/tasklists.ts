/**
 * Google Tasks MCP - Task Lists Tools
 * Tools for managing Google Tasks task lists
 */

import { z } from 'zod';
import { tasks_v1 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory.js';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all task list management tools
 */
export function registerTaskListTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // List all task lists
  registry.registerTool(
    'tasks_list_task_lists',
    'List all task lists for the user',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      maxResults: z.number().int().min(1).max(1000).optional().describe('Maximum number of task lists to return (default: 100)'),
      pageToken: z.string().optional().describe('Token for pagination')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const params: tasks_v1.Params$Resource$Tasklists$List = {};
        if (args.maxResults) params.maxResults = args.maxResults;
        if (args.pageToken) params.pageToken = args.pageToken;

        const response = await client.tasklists.list(params);

        const taskLists = response.data.items || [];
        const result = {
          taskLists: taskLists.map(list => ({
            id: list.id,
            title: list.title,
            updated: list.updated,
            selfLink: list.selfLink
          })),
          nextPageToken: response.data.nextPageToken,
          totalCount: taskLists.length
        };

        logger.info('Listed task lists', {
          tenantId: args.tenantId,
          count: taskLists.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to list task lists', {
          tenantId: args.tenantId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Get a specific task list
  registry.registerTool(
    'tasks_get_task_list',
    'Get details of a specific task list',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list to retrieve')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const response = await client.tasklists.get({
          tasklist: args.taskListId
        });

        const result = {
          id: response.data.id,
          title: response.data.title,
          updated: response.data.updated,
          selfLink: response.data.selfLink
        };

        logger.info('Retrieved task list', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          title: response.data.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get task list', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Create a new task list
  registry.registerTool(
    'tasks_create_task_list',
    'Create a new task list',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      title: z.string().describe('Title of the new task list')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const response = await client.tasklists.insert({
          requestBody: {
            title: args.title
          }
        });

        const result = {
          id: response.data.id,
          title: response.data.title,
          updated: response.data.updated,
          selfLink: response.data.selfLink
        };

        logger.info('Created task list', {
          tenantId: args.tenantId,
          taskListId: response.data.id,
          title: args.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create task list', {
          tenantId: args.tenantId,
          title: args.title,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Update a task list
  registry.registerTool(
    'tasks_update_task_list',
    'Update an existing task list',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list to update'),
      title: z.string().describe('New title for the task list')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const response = await client.tasklists.update({
          tasklist: args.taskListId,
          requestBody: {
            id: args.taskListId,
            title: args.title
          }
        });

        const result = {
          id: response.data.id,
          title: response.data.title,
          updated: response.data.updated
        };

        logger.info('Updated task list', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          newTitle: args.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to update task list', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Patch a task list (partial update)
  registry.registerTool(
    'tasks_patch_task_list',
    'Partially update a task list',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list to patch'),
      title: z.string().optional().describe('New title for the task list')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const requestBody: tasks_v1.Schema$TaskList = {};
        if (args.title) requestBody.title = args.title;

        const response = await client.tasklists.patch({
          tasklist: args.taskListId,
          requestBody
        });

        const result = {
          id: response.data.id,
          title: response.data.title,
          updated: response.data.updated
        };

        logger.info('Patched task list', {
          tenantId: args.tenantId,
          taskListId: args.taskListId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to patch task list', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Delete a task list
  registry.registerTool(
    'tasks_delete_task_list',
    'Delete a task list (this will also delete all tasks in the list)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        await client.tasklists.delete({
          tasklist: args.taskListId
        });

        logger.info('Deleted task list', {
          tenantId: args.tenantId,
          taskListId: args.taskListId
        });

        return {
          success: true,
          message: `Task list ${args.taskListId} has been deleted. All tasks in this list have also been deleted.`
        };
      } catch (error: any) {
        logger.error('Failed to delete task list', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );
}
