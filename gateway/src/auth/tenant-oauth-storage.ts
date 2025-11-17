/**
 * Tenant OAuth Configuration Storage
 * Connectors Platform - Per-tenant OAuth app configuration management
 *
 * This service manages OAuth CLIENT configurations (client_id, client_secret)
 * that are used to authenticate the integration itself.
 * This is separate from user OAuth credentials (access_token, refresh_token).
 */

import { VaultClient } from './vault-client';
import { logger } from '../logging/logger';
import {
  TenantOAuthConfig,
  EncryptedTenantOAuthConfig,
  TenantOAuthConfigMetadata,
  CreateOAuthConfigRequest
} from './types';
import {
  VaultError,
  CredentialNotFoundError
} from '../errors/oauth-errors';

/**
 * TenantOAuthStorage manages OAuth client configurations in Vault
 *
 * Storage Pattern:
 * - Path: secret/data/{tenantId}/oauth-configs/{integration}
 * - Client secrets are encrypted using Transit engine
 * - Supports CRUD operations on OAuth configurations
 * - Maintains metadata for tracking and auditing
 */
export class TenantOAuthStorage {
  private readonly _vault: VaultClient;
  private readonly _configPrefix = 'oauth-configs';

  constructor(vault: VaultClient) {
    this._vault = vault;
    logger.info('TenantOAuthStorage initialized');
  }

  /**
   * Store tenant OAuth configuration
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name (e.g., "github", "notion")
   * @param config - OAuth configuration to store
   * @param createdBy - User/service creating the config
   */
  async storeTenantOAuthConfig(
    tenantId: string,
    integration: string,
    config: CreateOAuthConfigRequest,
    createdBy: string = 'api'
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Validate inputs
      this._validateConfig(config);

      // Encrypt client secret using tenant-specific encryption key
      const encryptedSecret = await this._encryptSecret(tenantId, config.clientSecret);

      // Prepare encrypted configuration
      const encryptedConfig: EncryptedTenantOAuthConfig = {
        clientSecret: encryptedSecret,
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        authEndpoint: config.authEndpoint,
        tokenEndpoint: config.tokenEndpoint,
        scopes: config.scopes,
        additionalParams: config.additionalParams
      };

      // Prepare metadata
      const metadata: TenantOAuthConfigMetadata = {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        status: 'active'
      };

      // Store in Vault
      const path = this._buildConfigPath(tenantId, integration);
      await this._writeToVault(path, {
        config: encryptedConfig,
        metadata
      });

      const duration = Date.now() - startTime;
      logger.info('Tenant OAuth config stored successfully', {
        tenantId,
        integration,
        duration,
        createdBy
      });
    } catch (error) {
      logger.error('Failed to store tenant OAuth config', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new VaultError(
        'Failed to store tenant OAuth configuration',
        'store-oauth-config',
        this._buildConfigPath(tenantId, integration),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve tenant OAuth configuration
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   * @returns Decrypted OAuth configuration
   * @throws CredentialNotFoundError if config doesn't exist
   */
  async getTenantOAuthConfig(
    tenantId: string,
    integration: string
  ): Promise<TenantOAuthConfig> {
    const startTime = Date.now();

    try {
      const path = this._buildConfigPath(tenantId, integration);
      const vaultData = await this._readFromVault(path);

      if (!vaultData?.config) {
        throw new CredentialNotFoundError(
          integration,
          tenantId,
          path
        );
      }

      const encryptedConfig: EncryptedTenantOAuthConfig = vaultData.config;
      const metadata: TenantOAuthConfigMetadata = vaultData.metadata;

      // Decrypt client secret
      const clientSecret = await this._decryptSecret(tenantId, encryptedConfig.clientSecret);

      // Build full configuration
      const config: TenantOAuthConfig = {
        tenantId,
        integration,
        clientId: encryptedConfig.clientId,
        clientSecret,
        redirectUri: encryptedConfig.redirectUri,
        authEndpoint: encryptedConfig.authEndpoint,
        tokenEndpoint: encryptedConfig.tokenEndpoint,
        scopes: encryptedConfig.scopes,
        additionalParams: encryptedConfig.additionalParams,
        metadata
      };

      const duration = Date.now() - startTime;
      logger.debug('Tenant OAuth config retrieved successfully', {
        tenantId,
        integration,
        duration
      });

      return config;
    } catch (error) {
      if (error instanceof CredentialNotFoundError) {
        throw error;
      }

      logger.error('Failed to retrieve tenant OAuth config', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new VaultError(
        'Failed to retrieve tenant OAuth configuration',
        'get-oauth-config',
        this._buildConfigPath(tenantId, integration),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete tenant OAuth configuration
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   */
  async deleteTenantOAuthConfig(tenantId: string, integration: string): Promise<void> {
    try {
      const path = this._buildConfigPath(tenantId, integration);
      await this._deleteFromVault(path);

      logger.info('Tenant OAuth config deleted', { tenantId, integration });
    } catch (error) {
      logger.error('Failed to delete tenant OAuth config', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new VaultError(
        'Failed to delete tenant OAuth configuration',
        'delete-oauth-config',
        this._buildConfigPath(tenantId, integration),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * List all integrations configured for a tenant
   *
   * @param tenantId - Tenant identifier
   * @returns Array of integration names
   */
  async listTenantIntegrations(tenantId: string): Promise<string[]> {
    try {
      const basePath = `${tenantId}/${this._configPrefix}`;
      const integrations = await this._vault.listIntegrations(basePath);

      logger.debug('Listed tenant integrations', {
        tenantId,
        count: integrations.length
      });

      return integrations;
    } catch (error) {
      logger.error('Failed to list tenant integrations', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Check if OAuth config exists for integration
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   * @returns True if config exists
   */
  async hasOAuthConfig(tenantId: string, integration: string): Promise<boolean> {
    try {
      await this.getTenantOAuthConfig(tenantId, integration);
      return true;
    } catch (error) {
      if (error instanceof CredentialNotFoundError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Update tenant OAuth configuration
   * This is a convenience method that combines get + store
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   * @param updates - Partial configuration updates
   * @param updatedBy - User/service updating the config
   */
  async updateTenantOAuthConfig(
    tenantId: string,
    integration: string,
    updates: Partial<CreateOAuthConfigRequest>,
    updatedBy: string = 'api'
  ): Promise<void> {
    try {
      // Get existing config
      const existing = await this.getTenantOAuthConfig(tenantId, integration);

      // Merge updates
      const merged: CreateOAuthConfigRequest = {
        clientId: updates.clientId ?? existing.clientId,
        clientSecret: updates.clientSecret ?? existing.clientSecret,
        redirectUri: updates.redirectUri ?? existing.redirectUri,
        authEndpoint: updates.authEndpoint ?? existing.authEndpoint,
        tokenEndpoint: updates.tokenEndpoint ?? existing.tokenEndpoint,
        scopes: updates.scopes ?? existing.scopes,
        additionalParams: updates.additionalParams ?? existing.additionalParams
      };

      // Store updated config
      await this.storeTenantOAuthConfig(tenantId, integration, merged, updatedBy);

      logger.info('Tenant OAuth config updated', {
        tenantId,
        integration,
        updatedBy,
        updatedFields: Object.keys(updates)
      });
    } catch (error) {
      logger.error('Failed to update tenant OAuth config', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Validate OAuth configuration
   * @private
   */
  private _validateConfig(config: CreateOAuthConfigRequest): void {
    const requiredFields = ['clientId', 'clientSecret', 'redirectUri', 'authEndpoint', 'tokenEndpoint'];
    const missingFields = requiredFields.filter(field => !config[field as keyof CreateOAuthConfigRequest]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate URLs
    const urlFields = ['redirectUri', 'authEndpoint', 'tokenEndpoint'] as const;
    for (const field of urlFields) {
      try {
        new URL(config[field]);
      } catch {
        throw new Error(`Invalid URL for ${field}: ${config[field]}`);
      }
    }
  }

  /**
   * Build Vault path for OAuth config
   * @private
   */
  private _buildConfigPath(tenantId: string, integration: string): string {
    return `secret/data/${tenantId}/${this._configPrefix}/${integration}`;
  }

  /**
   * Encrypt client secret using Vault Transit
   * @private
   */
  private async _encryptSecret(tenantId: string, plaintext: string): Promise<string> {
    // Use VaultClient's public encryption method
    return this._vault.encryptForTenant(tenantId, plaintext);
  }

  /**
   * Decrypt client secret using Vault Transit
   * @private
   */
  private async _decryptSecret(tenantId: string, ciphertext: string): Promise<string> {
    // Use VaultClient's public decryption method
    return this._vault.decryptForTenant(tenantId, ciphertext);
  }

  /**
   * Write data to Vault KV v2
   * @private
   */
  private async _writeToVault(path: string, data: unknown): Promise<void> {
    // Use VaultClient's public retry mechanism and HTTP client
    await this._vault.executeWithRetry(async () => {
      await this._vault.httpClient.post(`/v1/${path}`, { data });
    });
  }

  /**
   * Read data from Vault KV v2
   * @private
   */
  private async _readFromVault(path: string): Promise<any> {
    const response = await this._vault.executeWithRetry(async () => {
      return await this._vault.httpClient.get(`/v1/${path}`);
    });

    return response.data?.data?.data;
  }

  /**
   * Delete data from Vault KV v2
   * @private
   */
  private async _deleteFromVault(path: string): Promise<void> {
    await this._vault.executeWithRetry(async () => {
      await this._vault.httpClient.delete(`/v1/${path}`);
    });
  }
}
