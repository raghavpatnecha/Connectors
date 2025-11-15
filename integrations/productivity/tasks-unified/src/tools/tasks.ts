/**
 * Google Tasks MCP - Tasks Tools
 * Tools for managing individual tasks within task lists
 */

import { z } from 'zod';
import { tasks_v1 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all task management tools
 */
export function registerTaskTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // List tasks in a task list
  registry.registerTool(
    'tasks_list_tasks',
    'List all tasks in a specific task list with filtering options',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list to retrieve tasks from'),
      maxResults: z.number().int().min(1).max(10000).optional().describe('Maximum number of tasks to return (default: 100)'),
      pageToken: z.string().optional().describe('Token for pagination'),
      showCompleted: z.boolean().optional().describe('Whether to include completed tasks (default: true)'),
      showDeleted: z.boolean().optional().describe('Whether to include deleted tasks (default: false)'),
      showHidden: z.boolean().optional().describe('Whether to include hidden tasks (default: false)'),
      completedMin: z.string().optional().describe('Lower bound for completion date (RFC 3339 timestamp)'),
      completedMax: z.string().optional().describe('Upper bound for completion date (RFC 3339 timestamp)'),
      dueMin: z.string().optional().describe('Lower bound for due date (RFC 3339 timestamp)'),
      dueMax: z.string().optional().describe('Upper bound for due date (RFC 3339 timestamp)'),
      updatedMin: z.string().optional().describe('Lower bound for last modification time (RFC 3339 timestamp)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const params: tasks_v1.Params$Resource$Tasks$List = {
          tasklist: args.taskListId
        };
        if (args.maxResults) params.maxResults = args.maxResults;
        if (args.pageToken) params.pageToken = args.pageToken;
        if (args.showCompleted !== undefined) params.showCompleted = args.showCompleted;
        if (args.showDeleted !== undefined) params.showDeleted = args.showDeleted;
        if (args.showHidden !== undefined) params.showHidden = args.showHidden;
        if (args.completedMin) params.completedMin = args.completedMin;
        if (args.completedMax) params.completedMax = args.completedMax;
        if (args.dueMin) params.dueMin = args.dueMin;
        if (args.dueMax) params.dueMax = args.dueMax;
        if (args.updatedMin) params.updatedMin = args.updatedMin;

        const response = await client.tasks.list(params);

        const tasks = response.data.items || [];
        const result = {
          tasks: tasks.map(task => ({
            id: task.id,
            title: task.title,
            status: task.status,
            due: task.due,
            completed: task.completed,
            notes: task.notes,
            parent: task.parent,
            position: task.position,
            updated: task.updated,
            selfLink: task.selfLink,
            webViewLink: task.webViewLink
          })),
          nextPageToken: response.data.nextPageToken,
          totalCount: tasks.length
        };

        logger.info('Listed tasks', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          count: tasks.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to list tasks', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Get a specific task
  registry.registerTool(
    'tasks_get_task',
    'Get details of a specific task',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list containing the task'),
      taskId: z.string().describe('ID of the task to retrieve')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const response = await client.tasks.get({
          tasklist: args.taskListId,
          task: args.taskId
        });

        const result = {
          id: response.data.id,
          title: response.data.title,
          status: response.data.status,
          due: response.data.due,
          completed: response.data.completed,
          notes: response.data.notes,
          parent: response.data.parent,
          position: response.data.position,
          updated: response.data.updated,
          selfLink: response.data.selfLink,
          webViewLink: response.data.webViewLink
        };

        logger.info('Retrieved task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId,
          title: response.data.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Create a new task
  registry.registerTool(
    'tasks_create_task',
    'Create a new task in a task list',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list to create the task in'),
      title: z.string().describe('Title of the task'),
      notes: z.string().optional().describe('Notes/description for the task'),
      due: z.string().optional().describe('Due date in RFC 3339 format (e.g., "2024-12-31T23:59:59Z")'),
      parent: z.string().optional().describe('Parent task ID (for creating subtasks)'),
      previous: z.string().optional().describe('Previous sibling task ID (for positioning)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const requestBody: tasks_v1.Schema$Task = {
          title: args.title
        };
        if (args.notes) requestBody.notes = args.notes;
        if (args.due) requestBody.due = args.due;

        const params: tasks_v1.Params$Resource$Tasks$Insert = {
          tasklist: args.taskListId,
          requestBody
        };
        if (args.parent) params.parent = args.parent;
        if (args.previous) params.previous = args.previous;

        const response = await client.tasks.insert(params);

        const result = {
          id: response.data.id,
          title: response.data.title,
          status: response.data.status,
          due: response.data.due,
          notes: response.data.notes,
          updated: response.data.updated,
          webViewLink: response.data.webViewLink
        };

        logger.info('Created task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: response.data.id,
          title: args.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          title: args.title,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Update a task
  registry.registerTool(
    'tasks_update_task',
    'Update an existing task',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list containing the task'),
      taskId: z.string().describe('ID of the task to update'),
      title: z.string().optional().describe('New title for the task'),
      notes: z.string().optional().describe('New notes/description for the task'),
      status: z.enum(['needsAction', 'completed']).optional().describe('New status for the task'),
      due: z.string().optional().describe('New due date in RFC 3339 format')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        // Get current task to build update body
        const currentTask = await client.tasks.get({
          tasklist: args.taskListId,
          task: args.taskId
        });

        const requestBody: tasks_v1.Schema$Task = {
          id: args.taskId,
          title: args.title !== undefined ? args.title : currentTask.data.title,
          status: args.status !== undefined ? args.status : currentTask.data.status
        };

        if (args.notes !== undefined) {
          requestBody.notes = args.notes;
        } else if (currentTask.data.notes) {
          requestBody.notes = currentTask.data.notes;
        }

        if (args.due !== undefined) {
          requestBody.due = args.due;
        } else if (currentTask.data.due) {
          requestBody.due = currentTask.data.due;
        }

        const response = await client.tasks.update({
          tasklist: args.taskListId,
          task: args.taskId,
          requestBody
        });

        const result = {
          id: response.data.id,
          title: response.data.title,
          status: response.data.status,
          due: response.data.due,
          completed: response.data.completed,
          notes: response.data.notes,
          updated: response.data.updated
        };

        logger.info('Updated task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to update task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Patch a task (partial update)
  registry.registerTool(
    'tasks_patch_task',
    'Partially update a task',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list containing the task'),
      taskId: z.string().describe('ID of the task to patch'),
      title: z.string().optional().describe('New title for the task'),
      notes: z.string().optional().describe('New notes/description for the task'),
      status: z.enum(['needsAction', 'completed']).optional().describe('New status for the task'),
      due: z.string().optional().describe('New due date in RFC 3339 format')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const requestBody: tasks_v1.Schema$Task = {};
        if (args.title !== undefined) requestBody.title = args.title;
        if (args.notes !== undefined) requestBody.notes = args.notes;
        if (args.status !== undefined) requestBody.status = args.status;
        if (args.due !== undefined) requestBody.due = args.due;

        const response = await client.tasks.patch({
          tasklist: args.taskListId,
          task: args.taskId,
          requestBody
        });

        const result = {
          id: response.data.id,
          title: response.data.title,
          status: response.data.status,
          due: response.data.due,
          completed: response.data.completed,
          notes: response.data.notes,
          updated: response.data.updated
        };

        logger.info('Patched task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to patch task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Delete a task
  registry.registerTool(
    'tasks_delete_task',
    'Delete a task from a task list',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list containing the task'),
      taskId: z.string().describe('ID of the task to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        await client.tasks.delete({
          tasklist: args.taskListId,
          task: args.taskId
        });

        logger.info('Deleted task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId
        });

        return {
          success: true,
          message: `Task ${args.taskId} has been deleted from task list ${args.taskListId}.`
        };
      } catch (error: any) {
        logger.error('Failed to delete task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Move a task
  registry.registerTool(
    'tasks_move_task',
    'Move a task to a different position, parent, or task list',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the current task list containing the task'),
      taskId: z.string().describe('ID of the task to move'),
      parent: z.string().optional().describe('New parent task ID (for making it a subtask)'),
      previous: z.string().optional().describe('Previous sibling task ID (for positioning)'),
      destinationTaskList: z.string().optional().describe('Destination task list ID (for moving between lists)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const params: tasks_v1.Params$Resource$Tasks$Move = {
          tasklist: args.taskListId,
          task: args.taskId
        };
        if (args.parent) params.parent = args.parent;
        if (args.previous) params.previous = args.previous;
        if (args.destinationTaskList) params.destinationTasklist = args.destinationTaskList;

        const response = await client.tasks.move(params);

        const result = {
          id: response.data.id,
          title: response.data.title,
          status: response.data.status,
          parent: response.data.parent,
          position: response.data.position,
          updated: response.data.updated
        };

        logger.info('Moved task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId,
          destinationTaskList: args.destinationTaskList
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to move task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Clear completed tasks
  registry.registerTool(
    'tasks_clear_completed',
    'Clear all completed tasks from a task list (tasks will be marked as hidden)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list to clear completed tasks from')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        await client.tasks.clear({
          tasklist: args.taskListId
        });

        logger.info('Cleared completed tasks', {
          tenantId: args.tenantId,
          taskListId: args.taskListId
        });

        return {
          success: true,
          message: `All completed tasks have been cleared from task list ${args.taskListId}. The tasks are now hidden and won't appear in default task list views.`
        };
      } catch (error: any) {
        logger.error('Failed to clear completed tasks', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Complete task (helper method)
  registry.registerTool(
    'tasks_complete_task',
    'Mark a task as completed (shortcut for updating status)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list containing the task'),
      taskId: z.string().describe('ID of the task to complete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const response = await client.tasks.patch({
          tasklist: args.taskListId,
          task: args.taskId,
          requestBody: {
            status: 'completed'
          }
        });

        const result = {
          id: response.data.id,
          title: response.data.title,
          status: response.data.status,
          completed: response.data.completed,
          updated: response.data.updated
        };

        logger.info('Completed task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to complete task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );

  // Uncomplete task (helper method)
  registry.registerTool(
    'tasks_uncomplete_task',
    'Mark a task as not completed (shortcut for updating status)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      taskListId: z.string().describe('ID of the task list containing the task'),
      taskId: z.string().describe('ID of the task to mark as not completed')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getTasksClient(args.tenantId);

        const response = await client.tasks.patch({
          tasklist: args.taskListId,
          task: args.taskId,
          requestBody: {
            status: 'needsAction',
            completed: undefined
          }
        });

        const result = {
          id: response.data.id,
          title: response.data.title,
          status: response.data.status,
          updated: response.data.updated
        };

        logger.info('Uncompleted task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to uncomplete task', {
          tenantId: args.tenantId,
          taskListId: args.taskListId,
          taskId: args.taskId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'tasks');
      }
    }
  );
}
