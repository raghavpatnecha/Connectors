/**
 * HashiCorp Vault client for secure Google OAuth credential storage
 * Supports multi-tenant credential isolation with per-tenant encryption
 */

import vault from 'node-vault';
import { logger } from '../../shared/google-utils/logger.js';
import { VaultError } from '../../shared/google-utils/error-mapper.js';

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
    namespace: string = 'google-workspace-mcp'
  ) {
    this.client = vault({
      apiVersion: 'v1',
      endpoint: vaultAddr,
      token: vaultToken,
    });
    this.namespace = namespace;

    logger.info('Vault client initialized for Google Workspace', {
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
   * Path: {namespace}/data/{tenantId}/google
   */
  async storeCredentials(
    tenantId: string,
    credentials: StoredCredentials
  ): Promise<void> {
    try {
      const path = `${this.namespace}/data/${tenantId}/google`;

      await this.client.write(path, {
        data: credentials,
      });

      logger.info('Stored Google credentials in Vault', {
        tenantId,
        path,
        hasRefreshToken: !!credentials.refresh_token,
        scopeCount: credentials.scope.split(' ').length,
      });
    } catch (error: any) {
      logger.error('Failed to store Google credentials', {
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
      const path = `${this.namespace}/data/${tenantId}/google`;

      const response = await this.client.read(path);

      if (!response || !response.data || !response.data.data) {
        logger.warn('No Google credentials found in Vault', { tenantId, path });
        return null;
      }

      logger.info('Retrieved Google credentials from Vault', {
        tenantId,
        hasRefreshToken: !!response.data.data.refresh_token,
        scopeCount: response.data.data.scope?.split(' ').length || 0,
      });

      return response.data.data as StoredCredentials;
    } catch (error: any) {
      // 404 means no credentials stored yet
      if (error.response?.statusCode === 404) {
        logger.debug('No credentials found for tenant', { tenantId });
        return null;
      }

      logger.error('Failed to retrieve Google credentials', {
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
      const path = `${this.namespace}/data/${tenantId}/google`;

      await this.client.delete(path);

      logger.info('Deleted Google credentials from Vault', { tenantId });
    } catch (error: any) {
      logger.error('Failed to delete Google credentials', {
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
   * Check if credentials are expired (with 5 minute buffer)
   */
  isTokenExpired(credentials: StoredCredentials): boolean {
    if (!credentials.expires_at) {
      return false; // No expiry, assume valid
    }

    const now = Math.floor(Date.now() / 1000);
    const buffer = 300; // 5 minute buffer before expiry

    return now >= credentials.expires_at - buffer;
  }

  /**
   * Get time until token expiry in seconds
   */
  getTimeUntilExpiry(credentials: StoredCredentials): number | null {
    if (!credentials.expires_at) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, credentials.expires_at - now);
  }

  /**
   * Update only the access token (used after refresh)
   */
  async updateAccessToken(
    tenantId: string,
    accessToken: string,
    expiresAt?: number
  ): Promise<void> {
    const existing = await this.getCredentials(tenantId);

    if (!existing) {
      throw new VaultError('Cannot update token - no existing credentials');
    }

    const updated: StoredCredentials = {
      ...existing,
      access_token: accessToken,
      expires_at: expiresAt,
    };

    await this.storeCredentials(tenantId, updated);
  }

  /**
   * List all tenants with stored credentials
   */
  async listTenants(): Promise<string[]> {
    try {
      const path = `${this.namespace}/metadata`;
      const response = await this.client.list(path);

      if (!response || !response.data || !response.data.keys) {
        return [];
      }

      return response.data.keys as string[];
    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        return []; // No tenants yet
      }

      logger.error('Failed to list tenants', { error: error.message });
      throw new VaultError(`Failed to list tenants: ${error.message}`);
    }
  }

  /**
   * Get credential metadata without retrieving the full credentials
   */
  async getCredentialMetadata(tenantId: string): Promise<{
    hasRefreshToken: boolean;
    scopeCount: number;
    expiresAt?: Date;
  } | null> {
    const credentials = await this.getCredentials(tenantId);

    if (!credentials) {
      return null;
    }

    return {
      hasRefreshToken: !!credentials.refresh_token,
      scopeCount: credentials.scope.split(' ').length,
      expiresAt: credentials.expires_at
        ? new Date(credentials.expires_at * 1000)
        : undefined,
    };
  }
}
