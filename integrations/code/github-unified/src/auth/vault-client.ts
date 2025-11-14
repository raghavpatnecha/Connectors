/**
 * HashiCorp Vault client for secure credential storage
 */

import vault from 'node-vault';
import { logger } from '../utils/logger.js';
import { VaultError } from '../utils/error-handler.js';

export interface StoredCredentials {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  token_type: string;
  scope: string;
}

export class VaultClient {
  private client: any;
  private namespace: string;

  constructor(
    vaultAddr: string,
    vaultToken: string,
    namespace: string = 'github-mcp'
  ) {
    this.client = vault({
      apiVersion: 'v1',
      endpoint: vaultAddr,
      token: vaultToken,
    });
    this.namespace = namespace;

    logger.info('Vault client initialized', {
      address: vaultAddr,
      namespace: this.namespace,
    });
  }

  /**
   * Health check for Vault connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const health = await this.client.health();
      return health.sealed === false && health.initialized === true;
    } catch (error: any) {
      logger.error('Vault health check failed', { error: error.message });
      return false;
    }
  }

  /**
   * Store OAuth credentials for a tenant
   */
  async storeCredentials(
    tenantId: string,
    credentials: StoredCredentials
  ): Promise<void> {
    try {
      const path = `${this.namespace}/data/${tenantId}/github`;

      await this.client.write(path, {
        data: credentials,
      });

      logger.info('Stored credentials in Vault', {
        tenantId,
        path,
        hasRefreshToken: !!credentials.refresh_token,
      });
    } catch (error: any) {
      logger.error('Failed to store credentials', {
        tenantId,
        error: error.message,
      });
      throw new VaultError(`Failed to store credentials: ${error.message}`);
    }
  }

  /**
   * Retrieve OAuth credentials for a tenant
   */
  async getCredentials(tenantId: string): Promise<StoredCredentials | null> {
    try {
      const path = `${this.namespace}/data/${tenantId}/github`;

      const response = await this.client.read(path);

      if (!response || !response.data || !response.data.data) {
        logger.warn('No credentials found in Vault', { tenantId, path });
        return null;
      }

      logger.info('Retrieved credentials from Vault', {
        tenantId,
        hasRefreshToken: !!response.data.data.refresh_token,
      });

      return response.data.data as StoredCredentials;
    } catch (error: any) {
      // 404 means no credentials stored yet
      if (error.response?.statusCode === 404) {
        logger.debug('No credentials found for tenant', { tenantId });
        return null;
      }

      logger.error('Failed to retrieve credentials', {
        tenantId,
        error: error.message,
      });
      throw new VaultError(`Failed to retrieve credentials: ${error.message}`);
    }
  }

  /**
   * Delete OAuth credentials for a tenant
   */
  async deleteCredentials(tenantId: string): Promise<void> {
    try {
      const path = `${this.namespace}/data/${tenantId}/github`;

      await this.client.delete(path);

      logger.info('Deleted credentials from Vault', { tenantId });
    } catch (error: any) {
      logger.error('Failed to delete credentials', {
        tenantId,
        error: error.message,
      });
      throw new VaultError(`Failed to delete credentials: ${error.message}`);
    }
  }

  /**
   * Check if credentials exist for a tenant
   */
  async hasCredentials(tenantId: string): Promise<boolean> {
    const credentials = await this.getCredentials(tenantId);
    return credentials !== null;
  }

  /**
   * Check if credentials are expired
   */
  isTokenExpired(credentials: StoredCredentials): boolean {
    if (!credentials.expires_at) {
      return false; // No expiry, assume valid
    }

    const now = Math.floor(Date.now() / 1000);
    const buffer = 300; // 5 minute buffer

    return now >= credentials.expires_at - buffer;
  }
}
