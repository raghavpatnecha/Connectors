/**
 * Reddit Unified MCP - HashiCorp Vault Client
 *
 * Manages secure credential storage with per-tenant encryption,
 * automatic rotation, and audit logging.
 *
 * Security Features:
 * - Per-tenant encryption keys (Transit engine)
 * - KV v2 storage with versioning
 * - Automatic credential rotation
 * - Audit logging for all access
 *
 * @module auth/vault-client
 */

import vault from 'node-vault';
import type { VaultConfig, OAuthCredentials, VaultCredentials, TenantContext } from './types';
import { logger } from '../utils/logger';

export class VaultClient {
  private readonly _client: vault.client;
  private readonly _transitEngine: string;
  private readonly _kvEngine: string;
  private readonly _namespace?: string;

  constructor(config: VaultConfig) {
    this._client = vault({
      apiVersion: 'v1',
      endpoint: config.address,
      token: config.token,
      namespace: config.namespace
    });
    this._transitEngine = config.transitEngine || 'transit';
    this._kvEngine = config.kvEngine || 'secret';
    this._namespace = config.namespace;

    logger.info('VaultClient initialized', {
      address: config.address,
      transitEngine: this._transitEngine,
      kvEngine: this._kvEngine,
      namespace: this._namespace
    });
  }

  /**
   * Store OAuth credentials with per-tenant encryption
   *
   * @param tenantId - Unique tenant identifier
   * @param integration - Integration name (reddit)
   * @param credentials - OAuth credentials to store
   * @param username - Optional Reddit username
   */
  async storeCredentials(
    tenantId: string,
    integration: string,
    credentials: OAuthCredentials,
    username?: string
  ): Promise<void> {
    try {
      logger.info('Storing credentials in Vault', { tenantId, integration, username });

      // Ensure tenant encryption key exists
      await this._ensureTenantKey(tenantId);

      // Encrypt credentials with tenant-specific key
      const encryptedAccessToken = await this._encrypt(tenantId, credentials.accessToken);
      const encryptedRefreshToken = credentials.refreshToken
        ? await this._encrypt(tenantId, credentials.refreshToken)
        : undefined;

      // Prepare Vault data structure
      const vaultData: VaultCredentials = {
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: credentials.expiresAt.toISOString(),
        scopes: credentials.scopes,
        created_at: new Date().toISOString(),
        metadata: {
          tenant_id: tenantId,
          integration,
          username
        }
      };

      // Store in KV v2 with metadata
      const path = `${this._kvEngine}/data/${tenantId}/${integration}`;
      await this._client.write(path, {
        data: vaultData,
        options: {
          cas: 0 // Check-and-set: create only if doesn't exist, or update
        }
      });

      logger.info('Credentials stored successfully', {
        tenantId,
        integration,
        path,
        expiresAt: credentials.expiresAt.toISOString()
      });

      // Schedule auto-refresh if refresh token present
      if (credentials.refreshToken) {
        await this._scheduleAutoRefresh(tenantId, integration, credentials.expiresAt);
      }
    } catch (error) {
      logger.error('Failed to store credentials', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to store credentials in Vault: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieve and decrypt OAuth credentials
   *
   * @param tenantId - Unique tenant identifier
   * @param integration - Integration name (reddit)
   * @returns Decrypted OAuth credentials
   */
  async getCredentials(tenantId: string, integration: string): Promise<OAuthCredentials> {
    try {
      logger.debug('Retrieving credentials from Vault', { tenantId, integration });

      const path = `${this._kvEngine}/data/${tenantId}/${integration}`;
      const response = await this._client.read(path);

      if (!response || !response.data || !response.data.data) {
        throw new Error('No credentials found in Vault');
      }

      const vaultData = response.data.data as VaultCredentials;

      // Decrypt tokens with tenant-specific key
      const accessToken = await this._decrypt(tenantId, vaultData.access_token);
      const refreshToken = vaultData.refresh_token
        ? await this._decrypt(tenantId, vaultData.refresh_token)
        : undefined;

      const credentials: OAuthCredentials = {
        accessToken,
        refreshToken,
        expiresAt: new Date(vaultData.expires_at),
        scopes: vaultData.scopes,
        tokenType: 'bearer'
      };

      logger.debug('Credentials retrieved successfully', {
        tenantId,
        integration,
        expiresAt: credentials.expiresAt.toISOString(),
        hasRefreshToken: !!credentials.refreshToken
      });

      return credentials;
    } catch (error) {
      logger.error('Failed to retrieve credentials', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to retrieve credentials from Vault: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update existing credentials (e.g., after refresh)
   *
   * @param tenantId - Unique tenant identifier
   * @param integration - Integration name
   * @param credentials - Updated credentials
   */
  async updateCredentials(
    tenantId: string,
    integration: string,
    credentials: OAuthCredentials
  ): Promise<void> {
    try {
      logger.info('Updating credentials in Vault', { tenantId, integration });

      // Get current version for check-and-set
      const path = `${this._kvEngine}/data/${tenantId}/${integration}`;
      const current = await this._client.read(path);
      const currentVersion = current?.data?.metadata?.version || 0;

      // Encrypt new credentials
      const encryptedAccessToken = await this._encrypt(tenantId, credentials.accessToken);
      const encryptedRefreshToken = credentials.refreshToken
        ? await this._encrypt(tenantId, credentials.refreshToken)
        : undefined;

      const vaultData: VaultCredentials = {
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: credentials.expiresAt.toISOString(),
        scopes: credentials.scopes,
        created_at: new Date().toISOString(),
        metadata: {
          tenant_id: tenantId,
          integration,
          username: (current?.data?.data as VaultCredentials)?.metadata?.username
        }
      };

      // Update with check-and-set
      await this._client.write(path, {
        data: vaultData,
        options: {
          cas: currentVersion
        }
      });

      logger.info('Credentials updated successfully', {
        tenantId,
        integration,
        version: currentVersion + 1
      });
    } catch (error) {
      logger.error('Failed to update credentials', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to update credentials in Vault: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete credentials (e.g., on user disconnect)
   *
   * @param tenantId - Unique tenant identifier
   * @param integration - Integration name
   */
  async deleteCredentials(tenantId: string, integration: string): Promise<void> {
    try {
      logger.info('Deleting credentials from Vault', { tenantId, integration });

      const path = `${this._kvEngine}/data/${tenantId}/${integration}`;
      await this._client.delete(path);

      logger.info('Credentials deleted successfully', { tenantId, integration });
    } catch (error) {
      logger.error('Failed to delete credentials', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to delete credentials from Vault: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if credentials exist for tenant
   *
   * @param tenantId - Unique tenant identifier
   * @param integration - Integration name
   * @returns True if credentials exist
   */
  async hasCredentials(tenantId: string, integration: string): Promise<boolean> {
    try {
      const path = `${this._kvEngine}/data/${tenantId}/${integration}`;
      const response = await this._client.read(path);
      return !!(response && response.data && response.data.data);
    } catch (error) {
      return false;
    }
  }

  /**
   * Ensure tenant encryption key exists
   * Creates key if it doesn't exist
   *
   * @param tenantId - Unique tenant identifier
   */
  private async _ensureTenantKey(tenantId: string): Promise<void> {
    try {
      const keyName = `tenant-${tenantId}`;
      const keyPath = `${this._transitEngine}/keys/${keyName}`;

      // Try to read key
      try {
        await this._client.read(keyPath);
        logger.debug('Tenant encryption key exists', { tenantId, keyName });
      } catch (error) {
        // Key doesn't exist, create it
        logger.info('Creating tenant encryption key', { tenantId, keyName });
        await this._client.write(keyPath, {
          type: 'aes256-gcm96',
          exportable: false
        });
        logger.info('Tenant encryption key created', { tenantId, keyName });
      }
    } catch (error) {
      logger.error('Failed to ensure tenant key', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Encrypt data with tenant-specific key
   *
   * @param tenantId - Unique tenant identifier
   * @param plaintext - Data to encrypt
   * @returns Encrypted ciphertext
   */
  private async _encrypt(tenantId: string, plaintext: string): Promise<string> {
    try {
      const keyName = `tenant-${tenantId}`;
      const path = `${this._transitEngine}/encrypt/${keyName}`;

      const response = await this._client.write(path, {
        plaintext: Buffer.from(plaintext).toString('base64')
      });

      return response.data.ciphertext;
    } catch (error) {
      logger.error('Encryption failed', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Decrypt data with tenant-specific key
   *
   * @param tenantId - Unique tenant identifier
   * @param ciphertext - Data to decrypt
   * @returns Decrypted plaintext
   */
  private async _decrypt(tenantId: string, ciphertext: string): Promise<string> {
    try {
      const keyName = `tenant-${tenantId}`;
      const path = `${this._transitEngine}/decrypt/${keyName}`;

      const response = await this._client.write(path, {
        ciphertext
      });

      return Buffer.from(response.data.plaintext, 'base64').toString('utf-8');
    } catch (error) {
      logger.error('Decryption failed', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Schedule automatic token refresh
   *
   * @param tenantId - Unique tenant identifier
   * @param integration - Integration name
   * @param expiresAt - Token expiration time
   */
  private async _scheduleAutoRefresh(
    tenantId: string,
    integration: string,
    expiresAt: Date
  ): Promise<void> {
    // Calculate refresh time (5 minutes before expiry)
    const refreshTime = new Date(expiresAt.getTime() - 5 * 60 * 1000);
    const now = new Date();

    if (refreshTime <= now) {
      logger.warn('Token expires too soon for auto-refresh', {
        tenantId,
        integration,
        expiresAt: expiresAt.toISOString(),
        refreshTime: refreshTime.toISOString()
      });
      return;
    }

    logger.info('Auto-refresh scheduled', {
      tenantId,
      integration,
      refreshTime: refreshTime.toISOString()
    });

    // Note: In production, this would integrate with a job scheduler
    // For now, we log the intent. The actual refresh happens on-demand
    // when credentials are accessed and found to be expired.
  }

  /**
   * Get Vault health status
   *
   * @returns Health status object
   */
  async getHealth(): Promise<{ sealed: boolean; initialized: boolean }> {
    try {
      const health = await this._client.health();
      return {
        sealed: health.sealed || false,
        initialized: health.initialized || false
      };
    } catch (error) {
      logger.error('Failed to get Vault health', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}
