/**
 * Tenant OAuth Configuration API Routes
 * Connectors Platform - REST API for managing per-tenant OAuth configurations
 *
 * Endpoints:
 * POST   /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
 * GET    /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
 * DELETE /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
 * GET    /api/v1/tenants/:tenantId/integrations
 */

import { Router, Request, Response } from 'express';
import { TenantOAuthStorage } from '../auth/tenant-oauth-storage';
import { VaultClient } from '../auth/vault-client';
import { logger } from '../logging/logger';
import {
  validateOAuthConfig,
  validateTenantAndIntegration,
  validateTenantId
} from '../middleware/validate-oauth-config';
import {
  CreateOAuthConfigRequest,
  OAuthConfigResponse
} from '../auth/types';
import { CredentialNotFoundError, VaultError } from '../errors/oauth-errors';

/**
 * Create and configure OAuth configuration router
 *
 * @param vaultClient - Vault client instance
 * @returns Configured Express router
 */
export function createTenantOAuthRouter(vaultClient: VaultClient): Router {
  const router = Router();
  const storage = new TenantOAuthStorage(vaultClient);

  /**
   * Create or update OAuth configuration for a tenant's integration
   * POST /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
   */
  router.post(
    '/tenants/:tenantId/integrations/:integration/oauth-config',
    validateTenantAndIntegration,
    validateOAuthConfig,
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId, integration } = req.params;
      const config: CreateOAuthConfigRequest = req.body;
      const createdBy = req.headers['x-user-id'] as string || 'api';

      try {
        // Store OAuth configuration
        await storage.storeTenantOAuthConfig(tenantId, integration, config, createdBy);

        logger.info('OAuth config created/updated via API', {
          tenantId,
          integration,
          createdBy
        });

        const response: OAuthConfigResponse = {
          success: true,
          tenantId,
          integration,
          message: 'OAuth configuration stored successfully'
        };

        res.status(201).json(response);
      } catch (error) {
        logger.error('Failed to create OAuth config', {
          tenantId,
          integration,
          error: error instanceof Error ? error.message : String(error)
        });

        if (error instanceof VaultError) {
          const response: OAuthConfigResponse = {
            success: false,
            tenantId,
            integration,
            error: 'Failed to store OAuth configuration in Vault'
          };
          res.status(500).json(response);
        } else {
          const response: OAuthConfigResponse = {
            success: false,
            tenantId,
            integration,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          res.status(500).json(response);
        }
      }
    }
  );

  /**
   * Get OAuth configuration for a tenant's integration
   * GET /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
   *
   * Note: Client secret is NOT returned in the response for security
   */
  router.get(
    '/tenants/:tenantId/integrations/:integration/oauth-config',
    validateTenantAndIntegration,
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId, integration } = req.params;

      try {
        // Get OAuth configuration
        const config = await storage.getTenantOAuthConfig(tenantId, integration);

        logger.debug('OAuth config retrieved via API', {
          tenantId,
          integration
        });

        // Remove client secret from response
        const { clientSecret, ...configWithoutSecret } = config;

        const response: OAuthConfigResponse = {
          success: true,
          tenantId,
          integration,
          config: configWithoutSecret
        };

        res.status(200).json(response);
      } catch (error) {
        if (error instanceof CredentialNotFoundError) {
          logger.warn('OAuth config not found', {
            tenantId,
            integration
          });

          const response: OAuthConfigResponse = {
            success: false,
            tenantId,
            integration,
            error: 'OAuth configuration not found'
          };
          res.status(404).json(response);
        } else {
          logger.error('Failed to retrieve OAuth config', {
            tenantId,
            integration,
            error: error instanceof Error ? error.message : String(error)
          });

          const response: OAuthConfigResponse = {
            success: false,
            tenantId,
            integration,
            error: 'Failed to retrieve OAuth configuration'
          };
          res.status(500).json(response);
        }
      }
    }
  );

  /**
   * Delete OAuth configuration for a tenant's integration
   * DELETE /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
   */
  router.delete(
    '/tenants/:tenantId/integrations/:integration/oauth-config',
    validateTenantAndIntegration,
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId, integration } = req.params;

      try {
        // Check if config exists
        const exists = await storage.hasOAuthConfig(tenantId, integration);
        if (!exists) {
          logger.warn('Attempt to delete non-existent OAuth config', {
            tenantId,
            integration
          });

          const response: OAuthConfigResponse = {
            success: false,
            tenantId,
            integration,
            error: 'OAuth configuration not found'
          };
          res.status(404).json(response);
          return;
        }

        // Delete OAuth configuration
        await storage.deleteTenantOAuthConfig(tenantId, integration);

        logger.info('OAuth config deleted via API', {
          tenantId,
          integration
        });

        const response: OAuthConfigResponse = {
          success: true,
          tenantId,
          integration,
          message: 'OAuth configuration deleted successfully'
        };

        res.status(200).json(response);
      } catch (error) {
        logger.error('Failed to delete OAuth config', {
          tenantId,
          integration,
          error: error instanceof Error ? error.message : String(error)
        });

        const response: OAuthConfigResponse = {
          success: false,
          tenantId,
          integration,
          error: 'Failed to delete OAuth configuration'
        };
        res.status(500).json(response);
      }
    }
  );

  /**
   * List all configured integrations for a tenant
   * GET /api/v1/tenants/:tenantId/integrations
   */
  router.get(
    '/tenants/:tenantId/integrations',
    validateTenantId,
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId } = req.params;

      try {
        // List all integrations
        const integrations = await storage.listTenantIntegrations(tenantId);

        logger.debug('Listed tenant integrations via API', {
          tenantId,
          count: integrations.length
        });

        res.status(200).json({
          success: true,
          tenantId,
          integrations,
          count: integrations.length
        });
      } catch (error) {
        logger.error('Failed to list tenant integrations', {
          tenantId,
          error: error instanceof Error ? error.message : String(error)
        });

        res.status(500).json({
          success: false,
          tenantId,
          error: 'Failed to list integrations'
        });
      }
    }
  );

  /**
   * Health check endpoint for OAuth config service
   * GET /api/v1/tenants/oauth-config/health
   */
  router.get('/oauth-config/health', async (_req: Request, res: Response): Promise<void> => {
    try {
      const healthy = await vaultClient.healthCheck();

      if (healthy) {
        res.status(200).json({
          success: true,
          service: 'tenant-oauth-config',
          status: 'healthy',
          vault: 'connected'
        });
      } else {
        res.status(503).json({
          success: false,
          service: 'tenant-oauth-config',
          status: 'unhealthy',
          vault: 'disconnected'
        });
      }
    } catch (error) {
      logger.error('OAuth config health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });

      res.status(503).json({
        success: false,
        service: 'tenant-oauth-config',
        status: 'unhealthy',
        error: 'Health check failed'
      });
    }
  });

  return router;
}

/**
 * Export default router factory
 */
export default createTenantOAuthRouter;
