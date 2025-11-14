/**
 * GitHub Actions & Workflows Tools
 */

import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GitHubClient } from '../clients/github-client.js';
import { logger } from '../utils/logger.js';

export function registerActionsTools(
  registry: ToolRegistry,
  githubClient: GitHubClient
): void {
  /**
   * List workflows
   */
  registry.registerTool(
    {
      name: 'github_list_workflows',
      description: 'List workflows for a repository',
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
        const response = await client.actions.listRepoWorkflows({
          owner: args.owner,
          repo: args.repo,
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  /**
   * Get workflow
   */
  registry.registerTool(
    {
      name: 'github_get_workflow',
      description: 'Get a specific workflow',
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
          workflow_id: {
            type: 'number',
            description: 'Workflow ID or filename',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'workflow_id', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.actions.getWorkflow({
          owner: args.owner,
          repo: args.repo,
          workflow_id: args.workflow_id,
        });
        return response.data;
      });
    }
  );

  /**
   * List workflow runs
   */
  registry.registerTool(
    {
      name: 'github_list_workflow_runs',
      description: 'List workflow runs for a repository',
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
          workflow_id: {
            type: 'number',
            description: 'Filter by workflow ID',
          },
          status: {
            type: 'string',
            enum: ['completed', 'action_required', 'cancelled', 'failure', 'neutral', 'skipped', 'stale', 'success', 'timed_out', 'in_progress', 'queued', 'requested', 'waiting'],
            description: 'Filter by status',
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
        // If workflow_id is provided, list runs for specific workflow
        if (args.workflow_id) {
          const response = await client.actions.listWorkflowRuns({
            owner: args.owner,
            repo: args.repo,
            workflow_id: args.workflow_id,
            status: args.status,
            per_page: args.per_page || 30,
          });
          return response.data;
        }

        // Otherwise, list all runs
        const response = await client.actions.listWorkflowRunsForRepo({
          owner: args.owner,
          repo: args.repo,
          status: args.status,
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  /**
   * Get workflow run
   */
  registry.registerTool(
    {
      name: 'github_get_workflow_run',
      description: 'Get a specific workflow run',
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
          run_id: {
            type: 'number',
            description: 'Workflow run ID',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'run_id', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.actions.getWorkflowRun({
          owner: args.owner,
          repo: args.repo,
          run_id: args.run_id,
        });
        return response.data;
      });
    }
  );

  /**
   * Trigger workflow
   */
  registry.registerTool(
    {
      name: 'github_trigger_workflow',
      description: 'Trigger a workflow dispatch event',
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
          workflow_id: {
            type: 'number',
            description: 'Workflow ID or filename',
          },
          ref: {
            type: 'string',
            description: 'Git reference (branch or tag)',
          },
          inputs: {
            type: 'object',
            description: 'Workflow inputs',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'workflow_id', 'ref', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.actions.createWorkflowDispatch({
          owner: args.owner,
          repo: args.repo,
          workflow_id: args.workflow_id,
          ref: args.ref,
          inputs: args.inputs,
        });
        return { success: true, status: response.status };
      });
    }
  );

  /**
   * Cancel workflow run
   */
  registry.registerTool(
    {
      name: 'github_cancel_workflow_run',
      description: 'Cancel a workflow run',
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
          run_id: {
            type: 'number',
            description: 'Workflow run ID',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'run_id', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.actions.cancelWorkflowRun({
          owner: args.owner,
          repo: args.repo,
          run_id: args.run_id,
        });
        return { success: true, status: response.status };
      });
    }
  );

  /**
   * Re-run workflow
   */
  registry.registerTool(
    {
      name: 'github_rerun_workflow',
      description: 'Re-run a workflow run',
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
          run_id: {
            type: 'number',
            description: 'Workflow run ID',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'run_id', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.actions.reRunWorkflow({
          owner: args.owner,
          repo: args.repo,
          run_id: args.run_id,
        });
        return { success: true, status: response.status };
      });
    }
  );

  /**
   * List workflow run jobs
   */
  registry.registerTool(
    {
      name: 'github_list_workflow_run_jobs',
      description: 'List jobs for a workflow run',
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
          run_id: {
            type: 'number',
            description: 'Workflow run ID',
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
        required: ['owner', 'repo', 'run_id', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.actions.listJobsForWorkflowRun({
          owner: args.owner,
          repo: args.repo,
          run_id: args.run_id,
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  logger.info('Registered actions tools', { count: 8 });
}
