/**
 * HashiCorp Vault client for OAuth credential management
 * Connectors Platform - Secure credential storage with per-tenant encryption
 */

import axios, { AxiosInstance } from 'axios';
import { createLogger } from 'winston';
import {
  OAuthCredentials,
  EncryptedCredentials,
  CredentialMetadata,
  VaultConfig
} from './types';
import {
  VaultError,
  VaultEncryptionError,
  CredentialNotFoundError
} from '../errors/oauth-errors';

const logger = createLogger({
  defaultMeta: { service: 'vault-client' }
});

const DEFAULT_TRANSIT_ENGINE = 'transit';
const DEFAULT_KV_ENGINE = 'secret';
const DEFAULT_TIMEOUT = 5000;
const DEFAULT_MAX_RETRIES = 3;

/**
 * VaultClient handles OAuth credential storage with per-tenant encryption
 *
 * Features:
 * - Per-tenant encryption keys using Transit engine
 * - KV v2 storage with versioning
 * - Automatic retry with exponential backoff
 * - Audit logging for all operations
 * - Graceful degradation on Vault unavailability
 */
export class VaultClient {
  private readonly _client: AxiosInstance;
  private readonly _transitEngine: string;
  private readonly _kvEngine: string;
  private readonly _maxRetries: number;
  private readonly _vaultToken: string;

  constructor(config: VaultConfig) {
    this._transitEngine = config.transitEngine || DEFAULT_TRANSIT_ENGINE;
    this._kvEngine = config.kvEngine || DEFAULT_KV_ENGINE;
    this._maxRetries = config.maxRetries || DEFAULT_MAX_RETRIES;
    this._vaultToken = config.token;

    // Create axios client WITHOUT token in static config to prevent logging
    this._client = axios.create({
      baseURL: config.address,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Use request interceptor to add token dynamically (not logged)
    this._client.interceptors.request.use((requestConfig) => {
      requestConfig.headers['X-Vault-Token'] = this._vaultToken;
      return requestConfig;
    });

    logger.info('VaultClient initialized', {
      address: config.address,
      transitEngine: this._transitEngine,
      kvEngine: this._kvEngine
    });
  }

  /**
   * Store OAuth credentials with per-tenant encryption
   *
   * Security Features:
   * - Credentials encrypted with tenant-specific key
   * - Tokens stored in KV v2 with versioning
   * - Audit logging enabled
   * - Metadata tracking
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name (e.g., "github", "slack")
   * @param creds - OAuth credentials to store
   */
  async storeCredentials(
    tenantId: string,
    integration: string,
    creds: OAuthCredentials
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Ensure encryption key exists for tenant
      await this._ensureEncryptionKey(tenantId);

      // Encrypt sensitive tokens
      const encryptedAccessToken = await this._encrypt(tenantId, creds.accessToken);
      const encryptedRefreshToken = await this._encrypt(tenantId, creds.refreshToken);

      // Prepare encrypted credentials
      const encryptedCreds: EncryptedCredentials = {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: creds.expiresAt.toISOString(),
        scopes: creds.scopes,
        tokenType: creds.tokenType || 'Bearer'
      };

      // Prepare metadata
      const metadata: CredentialMetadata = {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'oauth-proxy',
        integration,
        autoRefresh: true,
        refreshCount: 0
      };

      // Store in KV v2
      const path = this._buildKVPath(tenantId, integration);
      await this._retryOperation(async () => {
        await this._client.post(`/v1/${path}`, {
          data: encryptedCreds,
          metadata
        });
      });

      const duration = Date.now() - startTime;
      logger.info('OAuth credentials stored successfully', {
        tenantId,
        integration,
        duration,
        expiresAt: creds.expiresAt
      });
    } catch (error) {
      logger.error('Failed to store OAuth credentials', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new VaultError(
        'Failed to store OAuth credentials',
        'store',
        this._buildKVPath(tenantId, integration),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve and decrypt OAuth credentials
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   * @returns Decrypted OAuth credentials
   * @throws CredentialNotFoundError if credentials don't exist
   */
  async getCredentials(
    tenantId: string,
    integration: string
  ): Promise<OAuthCredentials> {
    const startTime = Date.now();

    try {
      // Retrieve from KV v2
      const path = this._buildKVPath(tenantId, integration);
      const response = await this._retryOperation(async () => {
        return await this._client.get(`/v1/${path}`);
      });

      if (!response.data?.data?.data) {
        throw new CredentialNotFoundError(integration, tenantId, path);
      }

      const encryptedCreds: EncryptedCredentials = response.data.data.data;

      // Decrypt tokens
      const accessToken = await this._decrypt(tenantId, encryptedCreds.accessToken);
      const refreshToken = await this._decrypt(tenantId, encryptedCreds.refreshToken);

      const credentials: OAuthCredentials = {
        accessToken,
        refreshToken,
        expiresAt: new Date(encryptedCreds.expiresAt),
        scopes: encryptedCreds.scopes,
        tokenType: encryptedCreds.tokenType,
        integration
      };

      const duration = Date.now() - startTime;
      logger.debug('OAuth credentials retrieved successfully', {
        tenantId,
        integration,
        duration,
        expiresAt: credentials.expiresAt
      });

      return credentials;
    } catch (error) {
      if (error instanceof CredentialNotFoundError) {
        throw error;
      }

      logger.error('Failed to retrieve OAuth credentials', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new VaultError(
        'Failed to retrieve OAuth credentials',
        'get',
        this._buildKVPath(tenantId, integration),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete OAuth credentials
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   */
  async deleteCredentials(tenantId: string, integration: string): Promise<void> {
    try {
      const path = this._buildKVPath(tenantId, integration);
      await this._retryOperation(async () => {
        await this._client.delete(`/v1/${path}`);
      });

      logger.info('OAuth credentials deleted', { tenantId, integration });
    } catch (error) {
      logger.error('Failed to delete OAuth credentials', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new VaultError(
        'Failed to delete OAuth credentials',
        'delete',
        this._buildKVPath(tenantId, integration),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * List all integrations for a tenant
   *
   * @param tenantId - Tenant identifier
   * @returns Array of integration names
   */
  async listIntegrations(tenantId: string): Promise<string[]> {
    try {
      const metadataPath = `${this._kvEngine}/metadata/${tenantId}`;
      const response = await this._client.request({
        method: 'LIST',
        url: `/v1/${metadataPath}`
      });

      return response.data?.data?.keys || [];
    } catch (error) {
      logger.error('Failed to list integrations', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Check if credentials exist for integration
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   * @returns True if credentials exist
   */
  async hasCredentials(tenantId: string, integration: string): Promise<boolean> {
    try {
      await this.getCredentials(tenantId, integration);
      return true;
    } catch (error) {
      if (error instanceof CredentialNotFoundError) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Health check for Vault connection
   *
   * @returns True if Vault is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this._client.get('/v1/sys/health');
      return response.status === 200;
    } catch (error) {
      logger.error('Vault health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Retrieve API key data from Vault
   *
   * API keys are stored in Vault at: secret/data/api-keys/<hashed-key>
   * The hash is SHA-256 to prevent storing plain API keys.
   *
   * @param apiKey - API key to validate
   * @returns API key data if valid, null if not found
   */
  async getAPIKey(apiKey: string): Promise<{
    id: string;
    tenantId: string;
    scopes: string[];
    rateLimit: {
      requestsPerSecond: number;
      requestsPerMinute: number;
    };
    metadata?: {
      name?: string;
      createdAt?: Date;
      lastUsedAt?: Date;
    };
  } | null> {
    const startTime = Date.now();

    try {
      // Hash the API key for lookup (SHA-256)
      const crypto = await import('crypto');
      const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

      // Retrieve from KV v2
      const path = `${this._kvEngine}/data/api-keys/${hashedKey}`;
      const response = await this._retryOperation(async () => {
        return await this._client.get(`/v1/${path}`);
      });

      if (!response.data?.data?.data) {
        logger.debug('API key not found', { hashedKey });
        return null;
      }

      const apiKeyData = response.data.data.data;

      const duration = Date.now() - startTime;
      logger.debug('API key retrieved successfully', {
        apiKeyId: apiKeyData.id,
        tenantId: apiKeyData.tenantId,
        duration,
      });

      return {
        id: apiKeyData.id,
        tenantId: apiKeyData.tenantId,
        scopes: apiKeyData.scopes || [],
        rateLimit: apiKeyData.rateLimit || {
          requestsPerSecond: 10,
          requestsPerMinute: 100,
        },
        metadata: apiKeyData.metadata ? {
          name: apiKeyData.metadata.name,
          createdAt: apiKeyData.metadata.createdAt ? new Date(apiKeyData.metadata.createdAt) : undefined,
          lastUsedAt: apiKeyData.metadata.lastUsedAt ? new Date(apiKeyData.metadata.lastUsedAt) : undefined,
        } : undefined,
      };
    } catch (error) {
      // If not found (404), return null instead of throwing
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.debug('API key not found in Vault');
        return null;
      }

      logger.error('Failed to retrieve API key', {
        error: error instanceof Error ? error.message : String(error),
      });

      // For other errors, return null to avoid exposing internal details
      return null;
    }
  }

  /**
   * Encrypt data using tenant-specific Transit key
   * Public wrapper for external use (e.g., TenantOAuthStorage)
   *
   * @param tenantId - Tenant identifier
   * @param plaintext - Data to encrypt
   * @returns Encrypted ciphertext
   */
  async encryptForTenant(tenantId: string, plaintext: string): Promise<string> {
    await this._ensureEncryptionKey(tenantId);
    return this._encrypt(tenantId, plaintext);
  }

  /**
   * Decrypt data using tenant-specific Transit key
   * Public wrapper for external use (e.g., TenantOAuthStorage)
   *
   * @param tenantId - Tenant identifier
   * @param ciphertext - Encrypted data
   * @returns Decrypted plaintext
   */
  async decryptForTenant(tenantId: string, ciphertext: string): Promise<string> {
    return this._decrypt(tenantId, ciphertext);
  }

  /**
   * Execute Vault operation with retry logic
   * Public wrapper for external use (e.g., TenantOAuthStorage)
   *
   * @param operation - Async operation to retry
   * @returns Operation result
   */
  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    return this._retryOperation(operation);
  }

  /**
   * Get Vault HTTP client
   * Public getter for external use (e.g., TenantOAuthStorage)
   *
   * @returns AxiosInstance configured for Vault
   */
  get httpClient(): AxiosInstance {
    return this._client;
  }

  /**
   * Ensure encryption key exists for tenant
   * Creates key if it doesn't exist
   */
  private async _ensureEncryptionKey(tenantId: string): Promise<void> {
    const keyPath = `${this._transitEngine}/keys/${tenantId}`;

    try {
      // Try to read key first
      await this._client.get(`/v1/${keyPath}`);
    } catch (error) {
      // Key doesn't exist, create it
      try {
        await this._client.post(`/v1/${keyPath}`, {
          type: 'aes256-gcm96',
          exportable: false
        });

        logger.info('Created encryption key for tenant', { tenantId });
      } catch (createError) {
        throw new VaultError(
          'Failed to create encryption key',
          'create-key',
          keyPath,
          createError instanceof Error ? createError : undefined
        );
      }
    }
  }

  /**
   * Encrypt data using tenant-specific key
   */
  private async _encrypt(tenantId: string, plaintext: string): Promise<string> {
    try {
      const response = await this._retryOperation(async () => {
        return await this._client.post(
          `/v1/${this._transitEngine}/encrypt/${tenantId}`,
          {
            plaintext: Buffer.from(plaintext).toString('base64')
          }
        );
      });

      return response.data.data.ciphertext;
    } catch (error) {
      throw new VaultEncryptionError(
        'Failed to encrypt data',
        'encrypt',
        tenantId,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Decrypt data using tenant-specific key
   */
  private async _decrypt(tenantId: string, ciphertext: string): Promise<string> {
    try {
      const response = await this._retryOperation(async () => {
        return await this._client.post(
          `/v1/${this._transitEngine}/decrypt/${tenantId}`,
          { ciphertext }
        );
      });

      return Buffer.from(response.data.data.plaintext, 'base64').toString('utf-8');
    } catch (error) {
      throw new VaultEncryptionError(
        'Failed to decrypt data',
        'decrypt',
        tenantId,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Build KV v2 path for credentials
   */
  private _buildKVPath(tenantId: string, integration: string): string {
    return `${this._kvEngine}/data/${tenantId}/${integration}`;
  }

  /**
   * Retry operation with exponential backoff
   */
  private async _retryOperation<T>(
    operation: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this._maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 100; // Exponential backoff
      logger.warn('Vault operation failed, retrying', {
        attempt: attempt + 1,
        maxRetries: this._maxRetries,
        delay
      });

      await new Promise(resolve => setTimeout(resolve, delay));
      return this._retryOperation(operation, attempt + 1);
    }
  }
}
