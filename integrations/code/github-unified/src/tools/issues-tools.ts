/**
 * GitHub Issues Tools
 */

import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GitHubClient } from '../clients/github-client.js';
import { logger } from '../utils/logger.js';

export function registerIssuesTools(
  registry: ToolRegistry,
  githubClient: GitHubClient
): void {
  /**
   * List issues
   */
  registry.registerTool(
    {
      name: 'github_list_issues',
      description: 'List issues for a repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          state: {
            type: 'string',
            enum: ['open', 'closed', 'all'],
            description: 'Issue state filter',
            default: 'open',
          },
          labels: {
            type: 'string',
            description: 'Comma-separated label names',
          },
          sort: {
            type: 'string',
            enum: ['created', 'updated', 'comments'],
            description: 'Sort order',
            default: 'created',
          },
          per_page: {
            type: 'number',
            description: 'Results per page',
            default: 30,
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.issues.listForRepo({
          owner: args.owner,
          repo: args.repo,
          state: args.state || 'open',
          labels: args.labels,
          sort: args.sort || 'created',
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  /**
   * Get issue
   */
  registry.registerTool(
    {
      name: 'github_get_issue',
      description: 'Get a specific issue by number',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          issue_number: {
            type: 'number',
            description: 'Issue number',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'issue_number', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.issues.get({
          owner: args.owner,
          repo: args.repo,
          issue_number: args.issue_number,
        });
        return response.data;
      });
    }
  );

  /**
   * Create issue
   */
  registry.registerTool(
    {
      name: 'github_create_issue',
      description: 'Create a new issue',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          title: {
            type: 'string',
            description: 'Issue title',
          },
          body: {
            type: 'string',
            description: 'Issue description',
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Labels to add',
          },
          assignees: {
            type: 'array',
            items: { type: 'string' },
            description: 'Usernames to assign',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'title', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.issues.create({
          owner: args.owner,
          repo: args.repo,
          title: args.title,
          body: args.body,
          labels: args.labels,
          assignees: args.assignees,
        });
        return response.data;
      });
    }
  );

  /**
   * Update issue
   */
  registry.registerTool(
    {
      name: 'github_update_issue',
      description: 'Update an existing issue',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          issue_number: {
            type: 'number',
            description: 'Issue number',
          },
          title: {
            type: 'string',
            description: 'New title',
          },
          body: {
            type: 'string',
            description: 'New description',
          },
          state: {
            type: 'string',
            enum: ['open', 'closed'],
            description: 'Issue state',
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Labels to set',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'issue_number', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.issues.update({
          owner: args.owner,
          repo: args.repo,
          issue_number: args.issue_number,
          title: args.title,
          body: args.body,
          state: args.state,
          labels: args.labels,
        });
        return response.data;
      });
    }
  );

  /**
   * List comments
   */
  registry.registerTool(
    {
      name: 'github_list_issue_comments',
      description: 'List comments on an issue',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          issue_number: {
            type: 'number',
            description: 'Issue number',
          },
          per_page: {
            type: 'number',
            description: 'Results per page',
            default: 30,
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'issue_number', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.issues.listComments({
          owner: args.owner,
          repo: args.repo,
          issue_number: args.issue_number,
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  /**
   * Create comment
   */
  registry.registerTool(
    {
      name: 'github_create_issue_comment',
      description: 'Add a comment to an issue',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          issue_number: {
            type: 'number',
            description: 'Issue number',
          },
          body: {
            type: 'string',
            description: 'Comment text',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'issue_number', 'body', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.issues.createComment({
          owner: args.owner,
          repo: args.repo,
          issue_number: args.issue_number,
          body: args.body,
        });
        return response.data;
      });
    }
  );

  logger.info('Registered issues tools', { count: 6 });
}
