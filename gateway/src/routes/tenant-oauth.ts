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
import { authorizeTenant } from '../middleware/authorize-tenant';

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
    authorizeTenant,
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

        res.sendSuccess(
          {
            tenantId,
            integration,
            message: 'OAuth configuration stored successfully'
          },
          201
        );
      } catch (error) {
        logger.error('Failed to create OAuth config', {
          tenantId,
          integration,
          error: error instanceof Error ? error.message : String(error)
        });

        if (error instanceof VaultError) {
          res.sendError(
            'VAULT_STORAGE_ERROR',
            'Failed to store OAuth configuration in Vault',
            { tenantId, integration },
            500
          );
        } else {
          res.sendError(
            'OAUTH_CONFIG_STORAGE_ERROR',
            error instanceof Error ? error.message : 'Unknown error',
            { tenantId, integration },
            500
          );
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
    authorizeTenant,
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

        res.sendSuccess({
          tenantId,
          integration,
          config: configWithoutSecret
        });
      } catch (error) {
        if (error instanceof CredentialNotFoundError) {
          logger.warn('OAuth config not found', {
            tenantId,
            integration
          });

          res.sendError(
            'OAUTH_CONFIG_NOT_FOUND',
            'OAuth configuration not found',
            { tenantId, integration },
            404
          );
        } else {
          logger.error('Failed to retrieve OAuth config', {
            tenantId,
            integration,
            error: error instanceof Error ? error.message : String(error)
          });

          res.sendError(
            'OAUTH_CONFIG_RETRIEVAL_ERROR',
            'Failed to retrieve OAuth configuration',
            { tenantId, integration },
            500
          );
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
    authorizeTenant,
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

          res.sendError(
            'OAUTH_CONFIG_NOT_FOUND',
            'OAuth configuration not found',
            { tenantId, integration },
            404
          );
          return;
        }

        // Delete OAuth configuration
        await storage.deleteTenantOAuthConfig(tenantId, integration);

        logger.info('OAuth config deleted via API', {
          tenantId,
          integration
        });

        res.sendSuccess({
          tenantId,
          integration,
          message: 'OAuth configuration deleted successfully'
        });
      } catch (error) {
        logger.error('Failed to delete OAuth config', {
          tenantId,
          integration,
          error: error instanceof Error ? error.message : String(error)
        });

        res.sendError(
          'OAUTH_CONFIG_DELETION_ERROR',
          'Failed to delete OAuth configuration',
          { tenantId, integration },
          500
        );
      }
    }
  );

  /**
   * List all configured integrations for a tenant
   * GET /api/v1/tenants/:tenantId/integrations
   */
  router.get(
    '/tenants/:tenantId/integrations',
    authorizeTenant,
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

        res.sendSuccess({
          tenantId,
          integrations,
          count: integrations.length
        });
      } catch (error) {
        logger.error('Failed to list tenant integrations', {
          tenantId,
          error: error instanceof Error ? error.message : String(error)
        });

        res.sendError(
          'INTEGRATIONS_LIST_ERROR',
          'Failed to list integrations',
          { tenantId },
          500
        );
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
        res.sendSuccess({
          service: 'tenant-oauth-config',
          status: 'healthy',
          vault: 'connected'
        });
      } else {
        res.sendError(
          'SERVICE_UNHEALTHY',
          'OAuth config service is unhealthy',
          { vault: 'disconnected' },
          503
        );
      }
    } catch (error) {
      logger.error('OAuth config health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });

      res.sendError(
        'HEALTH_CHECK_FAILED',
        'Health check failed',
        { service: 'tenant-oauth-config' },
        503
      );
    }
  });

  return router;
}

/**
 * Export default router factory
 */
export default createTenantOAuthRouter;
