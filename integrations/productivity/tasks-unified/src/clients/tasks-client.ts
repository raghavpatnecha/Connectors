/**
 * Google Tasks MCP - Tasks Client
 * Wrapper around Google Tasks API client
 */

import { google, tasks_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../utils/logger';

/**
 * Tasks API Client
 * Provides authenticated access to Google Tasks API
 */
export class TasksClient {
  private _client: tasks_v1.Tasks;

  constructor(auth: OAuth2Client) {
    this._client = google.tasks({ version: 'v1', auth });
    logger.debug('TasksClient initialized');
  }

  /**
   * Get the underlying Google Tasks API client
   */
  get api(): tasks_v1.Tasks {
    return this._client;
  }

  /**
   * List all task lists
   */
  async listTaskLists(params?: tasks_v1.Params$Resource$Tasklists$List): Promise<tasks_v1.Schema$TaskLists> {
    const response = await this._client.tasklists.list(params);
    return response.data;
  }

  /**
   * Get a specific task list
   */
  async getTaskList(taskListId: string): Promise<tasks_v1.Schema$TaskList> {
    const response = await this._client.tasklists.get({ tasklist: taskListId });
    return response.data;
  }

  /**
   * Create a new task list
   */
  async createTaskList(title: string): Promise<tasks_v1.Schema$TaskList> {
    const response = await this._client.tasklists.insert({
      requestBody: { title }
    });
    return response.data;
  }

  /**
   * Update a task list
   */
  async updateTaskList(taskListId: string, title: string): Promise<tasks_v1.Schema$TaskList> {
    const response = await this._client.tasklists.update({
      tasklist: taskListId,
      requestBody: { id: taskListId, title }
    });
    return response.data;
  }

  /**
   * Delete a task list
   */
  async deleteTaskList(taskListId: string): Promise<void> {
    await this._client.tasklists.delete({ tasklist: taskListId });
  }

  /**
   * List tasks in a task list
   */
  async listTasks(taskListId: string, params?: Omit<tasks_v1.Params$Resource$Tasks$List, 'tasklist'>): Promise<tasks_v1.Schema$Tasks> {
    const response = await this._client.tasks.list({
      tasklist: taskListId,
      ...params
    });
    return response.data;
  }

  /**
   * Get a specific task
   */
  async getTask(taskListId: string, taskId: string): Promise<tasks_v1.Schema$Task> {
    const response = await this._client.tasks.get({
      tasklist: taskListId,
      task: taskId
    });
    return response.data;
  }

  /**
   * Create a new task
   */
  async createTask(
    taskListId: string,
    task: tasks_v1.Schema$Task,
    params?: { parent?: string; previous?: string }
  ): Promise<tasks_v1.Schema$Task> {
    const response = await this._client.tasks.insert({
      tasklist: taskListId,
      requestBody: task,
      ...params
    });
    return response.data;
  }

  /**
   * Update a task
   */
  async updateTask(taskListId: string, taskId: string, task: tasks_v1.Schema$Task): Promise<tasks_v1.Schema$Task> {
    const response = await this._client.tasks.update({
      tasklist: taskListId,
      task: taskId,
      requestBody: task
    });
    return response.data;
  }

  /**
   * Patch a task (partial update)
   */
  async patchTask(taskListId: string, taskId: string, task: tasks_v1.Schema$Task): Promise<tasks_v1.Schema$Task> {
    const response = await this._client.tasks.patch({
      tasklist: taskListId,
      task: taskId,
      requestBody: task
    });
    return response.data;
  }

  /**
   * Delete a task
   */
  async deleteTask(taskListId: string, taskId: string): Promise<void> {
    await this._client.tasks.delete({
      tasklist: taskListId,
      task: taskId
    });
  }

  /**
   * Move a task
   */
  async moveTask(
    taskListId: string,
    taskId: string,
    params?: { parent?: string; previous?: string; destinationTasklist?: string }
  ): Promise<tasks_v1.Schema$Task> {
    const response = await this._client.tasks.move({
      tasklist: taskListId,
      task: taskId,
      ...params
    });
    return response.data;
  }

  /**
   * Clear completed tasks
   */
  async clearCompletedTasks(taskListId: string): Promise<void> {
    await this._client.tasks.clear({ tasklist: taskListId });
  }
}
