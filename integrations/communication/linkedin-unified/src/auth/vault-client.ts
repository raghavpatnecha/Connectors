/**
 * HashiCorp Vault Client for Multi-Tenant Credential Storage
 *
 * Provides secure storage and retrieval of OAuth credentials with:
 * - Per-tenant encryption
 * - Automatic credential rotation
 * - Audit logging
 * - Version control
 */

import vault from 'node-vault';
import { logger } from '../utils/logger';
import { OAuthCredentials } from './oauth-manager';

export class VaultClient {
  private client: any;
  private readonly transitEngine = 'transit';
  private readonly secretEngine = 'secret';
  private readonly namespace: string;

  constructor(vaultAddr: string, vaultToken: string, namespace: string = 'linkedin-mcp') {
    this.namespace = namespace;
    this.client = vault({
      apiVersion: 'v1',
      endpoint: vaultAddr,
      token: vaultToken
    });

    logger.info('Vault client initialized', { endpoint: vaultAddr, namespace });
  }

  /**
   * Store OAuth credentials with per-tenant encryption
   */
  async storeCredentials(tenantId: string, integration: string, credentials: OAuthCredentials): Promise<void> {
    logger.info('Storing credentials in Vault', { tenantId, integration });

    try {
      // Ensure transit key exists for tenant
      await this.ensureTransitKey(tenantId);

      // Encrypt sensitive data with tenant-specific key
      const encryptedAccessToken = await this.encrypt(tenantId, credentials.accessToken);
      const encryptedRefreshToken = credentials.refreshToken
        ? await this.encrypt(tenantId, credentials.refreshToken)
        : null;

      // Store in KV v2 with metadata
      const path = `${this.secretEngine}/data/${this.namespace}/${tenantId}/${integration}`;

      await this.client.write(path, {
        data: {
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          expires_at: credentials.expiresAt,
          scopes: credentials.scopes,
          tenant_id: tenantId
        },
        metadata: {
          created_by: 'linkedin-unified-mcp',
          integration,
          auto_refresh: true
        }
      });

      logger.info('Credentials stored successfully', { tenantId, integration });

    } catch (error: any) {
      logger.error('Failed to store credentials', {
        tenantId,
        integration,
        error: error.message
      });
      throw new Error(`Failed to store credentials: ${error.message}`);
    }
  }

  /**
   * Retrieve OAuth credentials with automatic decryption
   */
  async getCredentials(tenantId: string, integration: string): Promise<OAuthCredentials> {
    logger.debug('Retrieving credentials from Vault', { tenantId, integration });

    try {
      const path = `${this.secretEngine}/data/${this.namespace}/${tenantId}/${integration}`;

      const response = await this.client.read(path);
      const data = response.data.data;

      // Decrypt sensitive data
      const accessToken = await this.decrypt(tenantId, data.access_token);
      const refreshToken = data.refresh_token
        ? await this.decrypt(tenantId, data.refresh_token)
        : undefined;

      return {
        accessToken,
        refreshToken,
        expiresAt: data.expires_at,
        scopes: data.scopes,
        tenantId: data.tenant_id
      };

    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        throw new Error(`No credentials found for tenant ${tenantId}`);
      }

      logger.error('Failed to retrieve credentials', {
        tenantId,
        integration,
        error: error.message
      });
      throw new Error(`Failed to retrieve credentials: ${error.message}`);
    }
  }

  /**
   * Delete credentials for a tenant
   */
  async deleteCredentials(tenantId: string, integration: string): Promise<void> {
    logger.info('Deleting credentials from Vault', { tenantId, integration });

    try {
      const path = `${this.secretEngine}/data/${this.namespace}/${tenantId}/${integration}`;
      await this.client.delete(path);

      logger.info('Credentials deleted successfully', { tenantId, integration });
    } catch (error: any) {
      logger.error('Failed to delete credentials', {
        tenantId,
        integration,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Ensure transit encryption key exists for tenant
   */
  private async ensureTransitKey(tenantId: string): Promise<void> {
    const keyName = `linkedin-${tenantId}`;

    try {
      // Try to read the key
      await this.client.read(`${this.transitEngine}/keys/${keyName}`);
    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        // Key doesn't exist, create it
        logger.info('Creating new transit key for tenant', { tenantId, keyName });

        await this.client.write(`${this.transitEngine}/keys/${keyName}`, {
          type: 'aes256-gcm96',
          exportable: false,
          allow_plaintext_backup: false
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Encrypt data with tenant-specific key
   */
  private async encrypt(tenantId: string, plaintext: string): Promise<string> {
    const keyName = `linkedin-${tenantId}`;
    const base64Plaintext = Buffer.from(plaintext).toString('base64');

    const response = await this.client.write(`${this.transitEngine}/encrypt/${keyName}`, {
      plaintext: base64Plaintext
    });

    return response.data.ciphertext;
  }

  /**
   * Decrypt data with tenant-specific key
   */
  private async decrypt(tenantId: string, ciphertext: string): Promise<string> {
    const keyName = `linkedin-${tenantId}`;

    const response = await this.client.write(`${this.transitEngine}/decrypt/${keyName}`, {
      ciphertext
    });

    const base64Plaintext = response.data.plaintext;
    return Buffer.from(base64Plaintext, 'base64').toString('utf-8');
  }

  /**
   * List all credentials for a tenant
   */
  async listTenantCredentials(tenantId: string): Promise<string[]> {
    try {
      const path = `${this.secretEngine}/metadata/${this.namespace}/${tenantId}`;
      const response = await this.client.list(path);
      return response.data.keys || [];
    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Health check for Vault connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.health();
      return response.sealed === false;
    } catch (error) {
      logger.error('Vault health check failed', { error });
      return false;
    }
  }
}
