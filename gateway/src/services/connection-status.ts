/**
 * Connection Status Checker Service
 * Connectors Platform - Checks OAuth connection status for toolkits
 */

import { IntegrationRegistry } from '../config/integrations';
import { VaultClient } from '../auth/vault-client';
import { TenantOAuthStorage } from '../auth/tenant-oauth-storage';
import { logger } from '../logging/logger';
import { ToolkitConnectionStatus } from '../types/workflow.types';

/**
 * ConnectionStatusChecker validates OAuth connections for integrations
 *
 * This service:
 * - Checks if OAuth config exists for tenant
 * - Validates integration is enabled
 * - Optionally checks token validity (future enhancement)
 */
export class ConnectionStatusChecker {
  private readonly _integrationRegistry: IntegrationRegistry;
  private readonly _oauthStorage: TenantOAuthStorage;

  constructor(
    integrationRegistry: IntegrationRegistry,
    vaultClient: VaultClient
  ) {
    this._integrationRegistry = integrationRegistry;
    this._oauthStorage = new TenantOAuthStorage(vaultClient);
  }

  /**
   * Get connection status for specified toolkits
   *
   * @param toolkits - Array of toolkit names (e.g., ["youtube", "notion"])
   * @param tenantId - Optional tenant ID to check OAuth config
   * @returns Array of connection statuses
   */
  async getStatus(
    toolkits: string[],
    tenantId?: string
  ): Promise<ToolkitConnectionStatus[]> {
    if (toolkits.length === 0) {
      return [];
    }

    const startTime = Date.now();
    logger.debug('Checking connection status', { toolkits, tenantId });

    try {
      // Check status for each toolkit in parallel
      const statusPromises = toolkits.map(toolkit =>
        this._checkToolkitStatus(toolkit, tenantId)
      );

      const statuses = await Promise.all(statusPromises);

      const duration = Date.now() - startTime;
      logger.info('Connection status checked', {
        toolkitCount: toolkits.length,
        activeCount: statuses.filter(s => s.active_connection).length,
        duration
      });

      return statuses;
    } catch (error) {
      logger.error('Failed to check connection status', {
        toolkits,
        error: error instanceof Error ? error.message : String(error)
      });

      // Return error status for all toolkits
      return toolkits.map(toolkit => ({
        toolkit,
        description: 'Status check failed',
        active_connection: false,
        message: 'Unable to determine connection status'
      }));
    }
  }

  /**
   * Check status for a single toolkit
   */
  private async _checkToolkitStatus(
    toolkit: string,
    tenantId?: string
  ): Promise<ToolkitConnectionStatus> {
    try {
      // Get integration metadata
      const integration = this._integrationRegistry.getIntegration(toolkit);

      if (!integration) {
        return {
          toolkit,
          description: `${toolkit} integration not found`,
          active_connection: false,
          message: `Integration '${toolkit}' is not registered`
        };
      }

      if (!integration.enabled) {
        return {
          toolkit,
          description: integration.description,
          active_connection: false,
          message: `Integration '${toolkit}' is disabled`
        };
      }

      // Check if OAuth is required
      if (!integration.requiresOAuth) {
        // No OAuth required, connection is always active if enabled
        return {
          toolkit,
          description: integration.description,
          active_connection: true,
          connection_details: {
            oauth_required: false,
            enabled: true
          },
          message: 'Integration active (no OAuth required)'
        };
      }

      // OAuth required - check if tenant has config
      if (!tenantId) {
        return {
          toolkit,
          description: integration.description,
          active_connection: false,
          message: 'OAuth required but no tenant ID provided'
        };
      }

      // Check if OAuth config exists for this tenant
      const hasConfig = await this._oauthStorage.hasOAuthConfig(tenantId, toolkit);

      if (!hasConfig) {
        return {
          toolkit,
          description: integration.description,
          active_connection: false,
          connection_details: {
            oauth_required: true,
            tenant_id: tenantId
          },
          message: 'Connection not found, use OAuth flow to connect'
        };
      }

      // OAuth config exists
      return {
        toolkit,
        description: integration.description,
        active_connection: true,
        connection_details: {
          oauth_required: true,
          tenant_id: tenantId,
          config_exists: true
        },
        message: 'Connection active'
      };
    } catch (error) {
      logger.error('Failed to check toolkit status', {
        toolkit,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        toolkit,
        description: 'Error checking status',
        active_connection: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if integration registry is accessible
      const integrations = this._integrationRegistry.listIntegrations();
      return integrations.length > 0;
    } catch (error) {
      logger.error('Connection status checker health check failed', { error });
      return false;
    }
  }
}
