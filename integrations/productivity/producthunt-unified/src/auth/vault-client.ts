/**
 * HashiCorp Vault client for Product Hunt API token storage
 *
 * Stores per-tenant API tokens with encryption
 */

import vault from 'node-vault';
import { logger } from '../utils/logger.js';
import { TokenError } from '../utils/error-handler.js';

export interface StoredToken {
  api_token: string;
  created_at?: string;
  updated_at?: string;
}

export class VaultClient {
  private client: any;
  private namespace: string;

  constructor(vaultAddr: string, vaultToken: string, namespace: string = 'producthunt-mcp') {
    this.client = vault({
      apiVersion: 'v1',
      endpoint: vaultAddr,
      token: vaultToken,
    });
    this.namespace = namespace;

    logger.info('Vault client initialized', {
      endpoint: vaultAddr,
      namespace: this.namespace,
    });
  }

  /**
   * Health check for Vault connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const health = await this.client.health();
      return !health.sealed;
    } catch (error: any) {
      logger.error('Vault health check failed', { error: error.message });
      return false;
    }
  }

  /**
   * Store API token for a tenant (encrypted)
   */
  async storeToken(tenantId: string, apiToken: string): Promise<void> {
    try {
      // Encrypt the API token using Vault's transit engine
      const encryptResponse = await this.client.write(
        `transit/encrypt/producthunt-${tenantId}`,
        {
          plaintext: Buffer.from(apiToken).toString('base64'),
        }
      );

      const encryptedToken = encryptResponse.data.ciphertext;

      // Store encrypted token in KV v2
      await this.client.write(`secret/data/tenants/${tenantId}/producthunt`, {
        data: {
          api_token: encryptedToken,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      logger.info('API token stored successfully', { tenantId });
    } catch (error: any) {
      logger.error('Failed to store API token', {
        tenantId,
        error: error.message,
      });
      throw new TokenError(`Failed to store API token: ${error.message}`);
    }
  }

  /**
   * Retrieve API token for a tenant (decrypted)
   */
  async getToken(tenantId: string): Promise<string | null> {
    try {
      // Retrieve encrypted token from KV v2
      const secretResponse = await this.client.read(
        `secret/data/tenants/${tenantId}/producthunt`
      );

      if (!secretResponse?.data?.data?.api_token) {
        logger.warn('No API token found for tenant', { tenantId });
        return null;
      }

      const encryptedToken = secretResponse.data.data.api_token;

      // Decrypt using transit engine
      const decryptResponse = await this.client.write(
        `transit/decrypt/producthunt-${tenantId}`,
        {
          ciphertext: encryptedToken,
        }
      );

      const decryptedToken = Buffer.from(
        decryptResponse.data.plaintext,
        'base64'
      ).toString();

      logger.debug('API token retrieved successfully', { tenantId });

      return decryptedToken;
    } catch (error: any) {
      // If the secret doesn't exist, that's not necessarily an error
      if (error.response?.statusCode === 404) {
        logger.info('No API token found for tenant (404)', { tenantId });
        return null;
      }

      logger.error('Failed to retrieve API token', {
        tenantId,
        error: error.message,
      });
      throw new TokenError(`Failed to retrieve API token: ${error.message}`);
    }
  }

  /**
   * Delete API token for a tenant
   */
  async deleteToken(tenantId: string): Promise<void> {
    try {
      await this.client.delete(`secret/data/tenants/${tenantId}/producthunt`);
      logger.info('API token deleted', { tenantId });
    } catch (error: any) {
      logger.error('Failed to delete API token', {
        tenantId,
        error: error.message,
      });
      throw new TokenError(`Failed to delete API token: ${error.message}`);
    }
  }

  /**
   * Check if a tenant has an API token stored
   */
  async hasToken(tenantId: string): Promise<boolean> {
    const token = await this.getToken(tenantId);
    return token !== null;
  }

  /**
   * Create encryption key for a tenant (if not exists)
   */
  async ensureEncryptionKey(tenantId: string): Promise<void> {
    try {
      const keyName = `producthunt-${tenantId}`;

      // Check if key exists
      try {
        await this.client.read(`transit/keys/${keyName}`);
        logger.debug('Encryption key already exists', { tenantId });
        return;
      } catch (error: any) {
        if (error.response?.statusCode !== 404) {
          throw error;
        }
      }

      // Create new encryption key
      await this.client.write(`transit/keys/${keyName}`, {
        type: 'aes256-gcm96',
      });

      logger.info('Created encryption key for tenant', { tenantId, keyName });
    } catch (error: any) {
      logger.error('Failed to ensure encryption key', {
        tenantId,
        error: error.message,
      });
      throw new TokenError(`Failed to ensure encryption key: ${error.message}`);
    }
  }
}
