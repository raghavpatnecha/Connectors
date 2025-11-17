/**
 * MCP Management API Routes
 * REST API for managing custom MCP server deployments
 *
 * Endpoints:
 * POST   /api/v1/mcp/add - Add a new custom MCP server
 * GET    /api/v1/mcp/deployments/:deploymentId - Get deployment status
 * GET    /api/v1/mcp/custom - List all custom servers
 * DELETE /api/v1/mcp/custom/:name - Remove a custom server
 */

import { Router, Request, Response } from 'express';
import { MCPDeployer, AddMCPServerRequest } from '../services/mcp-deployer';
import { logger } from '../logging/logger';
import { authorizeTenant } from '../middleware/authorize-tenant';

/**
 * Create and configure MCP management router
 *
 * @param deployer - MCP deployer service instance
 * @returns Configured Express router
 */
export function createMCPManagementRouter(deployer: MCPDeployer): Router {
  const router = Router();

  /**
   * Add a new custom MCP server
   * POST /api/v1/mcp/add
   *
   * Body:
   * {
   *   name: string,
   *   source: { type: 'github' | 'stdio' | 'http' | 'docker', ... },
   *   category: string,
   *   description?: string,
   *   tenantId?: string
   * }
   */
  router.post(
    '/add',
    authorizeTenant,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const request: AddMCPServerRequest = req.body;

        // Validate required fields
        if (!request.name) {
          res.sendError(
            'MISSING_FIELD',
            'Server name is required',
            undefined,
            400
          );
          return;
        }

        if (!request.source) {
          res.sendError(
            'MISSING_FIELD',
            'Source configuration is required',
            undefined,
            400
          );
          return;
        }

        if (!request.category) {
          res.sendError(
            'MISSING_FIELD',
            'Category is required',
            undefined,
            400
          );
          return;
        }

        logger.info('Adding custom MCP server', {
          name: request.name,
          sourceType: request.source.type,
          category: request.category,
        });

        // Deploy the MCP server
        const response = await deployer.addMCPServer(request);

        logger.info('MCP server deployment initiated', {
          deploymentId: response.deploymentId,
          name: request.name,
        });

        res.sendSuccess(
          {
            deploymentId: response.deploymentId,
            status: response.status,
            estimatedTime: response.estimatedTime,
            message: `MCP server '${request.name}' deployment initiated`,
          },
          202 // Accepted
        );
      } catch (error) {
        logger.error('Failed to add MCP server', {
          error: error instanceof Error ? error.message : String(error),
        });

        if (error instanceof Error && error.message.includes('already exists')) {
          res.sendError(
            'SERVER_ALREADY_EXISTS',
            error.message,
            undefined,
            409 // Conflict
          );
        } else {
          res.sendError(
            'DEPLOYMENT_FAILED',
            error instanceof Error ? error.message : 'Unknown error',
            undefined,
            500
          );
        }
      }
    }
  );

  /**
   * Get deployment status
   * GET /api/v1/mcp/deployments/:deploymentId
   */
  router.get(
    '/deployments/:deploymentId',
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { deploymentId } = req.params;

        if (!deploymentId) {
          res.sendError(
            'MISSING_PARAMETER',
            'Deployment ID is required',
            undefined,
            400
          );
          return;
        }

        const status = await deployer.getDeploymentStatus(deploymentId);

        if (!status) {
          res.sendError(
            'DEPLOYMENT_NOT_FOUND',
            `Deployment '${deploymentId}' not found`,
            { deploymentId },
            404
          );
          return;
        }

        logger.debug('Retrieved deployment status', {
          deploymentId,
          status: status.status,
        });

        res.sendSuccess({
          deploymentId: status.deploymentId,
          status: status.status,
          progress: status.progress,
          toolsDiscovered: status.toolsDiscovered,
          endpoint: status.endpoint,
          error: status.error,
          estimatedTime: status.estimatedTime,
        });
      } catch (error) {
        logger.error('Failed to get deployment status', {
          deploymentId: req.params.deploymentId,
          error: error instanceof Error ? error.message : String(error),
        });

        res.sendError(
          'STATUS_RETRIEVAL_FAILED',
          'Failed to retrieve deployment status',
          { deploymentId: req.params.deploymentId },
          500
        );
      }
    }
  );

  /**
   * List all custom servers
   * GET /api/v1/mcp/custom
   *
   * Query params:
   * - tenantId?: string (optional, filter by tenant)
   */
  router.get(
    '/custom',
    async (req: Request, res: Response): Promise<void> => {
      try {
        const tenantId = req.query.tenantId as string | undefined;

        const servers = await deployer.listCustomServers(tenantId);

        logger.debug('Listed custom MCP servers', {
          count: servers.length,
          tenantId,
        });

        res.sendSuccess({
          servers,
          count: servers.length,
          tenantId,
        });
      } catch (error) {
        logger.error('Failed to list custom servers', {
          error: error instanceof Error ? error.message : String(error),
        });

        res.sendError(
          'LIST_FAILED',
          'Failed to list custom servers',
          undefined,
          500
        );
      }
    }
  );

  /**
   * Remove a custom server
   * DELETE /api/v1/mcp/custom/:name
   */
  router.delete(
    '/custom/:name',
    authorizeTenant,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { name } = req.params;

        if (!name) {
          res.sendError(
            'MISSING_PARAMETER',
            'Server name is required',
            undefined,
            400
          );
          return;
        }

        logger.info('Removing custom MCP server', { name });

        const removed = await deployer.removeCustomServer(name);

        if (!removed) {
          res.sendError(
            'SERVER_NOT_FOUND',
            `Custom server '${name}' not found`,
            { name },
            404
          );
          return;
        }

        logger.info('Custom MCP server removed', { name });

        res.sendSuccess({
          name,
          message: `Server '${name}' removed successfully`,
        });
      } catch (error) {
        logger.error('Failed to remove custom server', {
          name: req.params.name,
          error: error instanceof Error ? error.message : String(error),
        });

        res.sendError(
          'REMOVAL_FAILED',
          'Failed to remove custom server',
          { name: req.params.name },
          500
        );
      }
    }
  );

  /**
   * Health check for MCP deployer service
   * GET /api/v1/mcp/health
   */
  router.get('/health', async (_req: Request, res: Response): Promise<void> => {
    try {
      const healthy = await deployer.healthCheck();

      if (healthy) {
        res.sendSuccess({
          service: 'mcp-deployer',
          status: 'healthy',
          tracker: 'connected',
        });
      } else {
        res.sendError(
          'SERVICE_UNHEALTHY',
          'MCP deployer service is unhealthy',
          { tracker: 'disconnected' },
          503
        );
      }
    } catch (error) {
      logger.error('MCP deployer health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });

      res.sendError(
        'HEALTH_CHECK_FAILED',
        'Health check failed',
        { service: 'mcp-deployer' },
        503
      );
    }
  });

  return router;
}

/**
 * Export default router factory
 */
export default createMCPManagementRouter;
