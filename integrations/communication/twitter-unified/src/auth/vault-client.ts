/**
 * HashiCorp Vault Client for Twitter OAuth Credentials
 * Per-tenant encryption using Transit engine
 */

import vault from 'node-vault';
import { logger } from '../utils/logger';

export interface TwitterOAuthCredentials {
  accessToken: string;
  accessTokenSecret: string;
  apiKey?: string;
  apiSecret?: string;
  expiresAt?: Date;
  socialDataApiKey?: string;
}

export interface SessionCookies {
  authToken: string;
  ct0: string;
  twid: string;
}

export class VaultClient {
  private readonly _client: vault.client;
  private readonly _transitEngine: string = 'transit';
  private readonly _kvEngine: string = 'secret';

  constructor(config: {
    address: string;
    token: string;
  }) {
    this._client = vault({
      apiVersion: 'v1',
      endpoint: config.address,
      token: config.token
    });

    logger.info('VaultClient initialized', {
      address: config.address,
      transitEngine: this._transitEngine,
      kvEngine: this._kvEngine
    });
  }

  /**
   * Store Twitter OAuth credentials for a tenant
   * Encrypted with tenant-specific key
   */
  async storeOAuthCredentials(
    tenantId: string,
    credentials: TwitterOAuthCredentials
  ): Promise<void> {
    try {
      // Ensure transit key exists
      await this._ensureTransitKey(tenantId);

      // Encrypt sensitive tokens
      const encryptedAccessToken = await this._encrypt(
        tenantId,
        credentials.accessToken
      );
      const encryptedAccessTokenSecret = await this._encrypt(
        tenantId,
        credentials.accessTokenSecret
      );

      // Store in KV v2
      await this._client.write(
        `${this._kvEngine}/data/${tenantId}/twitter/oauth`,
        {
          data: {
            access_token: encryptedAccessToken,
            access_token_secret: encryptedAccessTokenSecret,
            api_key: credentials.apiKey,
            api_secret: credentials.apiSecret,
            expires_at: credentials.expiresAt?.toISOString(),
            social_data_api_key: credentials.socialDataApiKey,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      );

      logger.info('OAuth credentials stored', { tenantId });
    } catch (error: any) {
      logger.error('Failed to store OAuth credentials', {
        tenantId,
        error: error.message
      });
      throw new Error(`Vault storage failed: ${error.message}`);
    }
  }

  /**
   * Retrieve Twitter OAuth credentials for a tenant
   */
  async getOAuthCredentials(
    tenantId: string
  ): Promise<TwitterOAuthCredentials | null> {
    try {
      const response = await this._client.read(
        `${this._kvEngine}/data/${tenantId}/twitter/oauth`
      );

      if (!response?.data?.data) {
        return null;
      }

      const data = response.data.data;

      // Decrypt sensitive tokens
      const accessToken = await this._decrypt(
        tenantId,
        data.access_token
      );
      const accessTokenSecret = await this._decrypt(
        tenantId,
        data.access_token_secret
      );

      return {
        accessToken,
        accessTokenSecret,
        apiKey: data.api_key,
        apiSecret: data.api_secret,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
        socialDataApiKey: data.social_data_api_key
      };
    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        return null;
      }
      logger.error('Failed to retrieve OAuth credentials', {
        tenantId,
        error: error.message
      });
      throw new Error(`Vault retrieval failed: ${error.message}`);
    }
  }

  /**
   * Store session cookies for tenant (fallback auth)
   */
  async storeSessionCookies(
    tenantId: string,
    cookies: SessionCookies
  ): Promise<void> {
    try {
      await this._ensureTransitKey(tenantId);

      const encryptedAuthToken = await this._encrypt(
        tenantId,
        cookies.authToken
      );
      const encryptedCt0 = await this._encrypt(tenantId, cookies.ct0);
      const encryptedTwid = await this._encrypt(tenantId, cookies.twid);

      await this._client.write(
        `${this._kvEngine}/data/${tenantId}/twitter/session`,
        {
          data: {
            auth_token: encryptedAuthToken,
            ct0: encryptedCt0,
            twid: encryptedTwid,
            created_at: new Date().toISOString()
          }
        }
      );

      logger.info('Session cookies stored', { tenantId });
    } catch (error: any) {
      logger.error('Failed to store session cookies', {
        tenantId,
        error: error.message
      });
      throw new Error(`Vault storage failed: ${error.message}`);
    }
  }

  /**
   * Retrieve session cookies for tenant
   */
  async getSessionCookies(tenantId: string): Promise<SessionCookies | null> {
    try {
      const response = await this._client.read(
        `${this._kvEngine}/data/${tenantId}/twitter/session`
      );

      if (!response?.data?.data) {
        return null;
      }

      const data = response.data.data;

      const authToken = await this._decrypt(tenantId, data.auth_token);
      const ct0 = await this._decrypt(tenantId, data.ct0);
      const twid = await this._decrypt(tenantId, data.twid);

      return { authToken, ct0, twid };
    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        return null;
      }
      throw new Error(`Vault retrieval failed: ${error.message}`);
    }
  }

  /**
   * Delete all Twitter credentials for tenant
   */
  async deleteCredentials(tenantId: string): Promise<void> {
    try {
      await this._client.delete(
        `${this._kvEngine}/metadata/${tenantId}/twitter/oauth`
      );
      await this._client.delete(
        `${this._kvEngine}/metadata/${tenantId}/twitter/session`
      );
      logger.info('Credentials deleted', { tenantId });
    } catch (error: any) {
      logger.error('Failed to delete credentials', {
        tenantId,
        error: error.message
      });
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const health = await this._client.health();
      return health.sealed === false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ensure transit encryption key exists for tenant
   */
  private async _ensureTransitKey(tenantId: string): Promise<void> {
    try {
      await this._client.read(`${this._transitEngine}/keys/${tenantId}`);
    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        await this._client.write(`${this._transitEngine}/keys/${tenantId}`, {
          type: 'aes256-gcm96'
        });
        logger.info('Transit key created', { tenantId });
      }
    }
  }

  /**
   * Encrypt data using tenant's transit key
   */
  private async _encrypt(tenantId: string, plaintext: string): Promise<string> {
    const response = await this._client.write(
      `${this._transitEngine}/encrypt/${tenantId}`,
      {
        plaintext: Buffer.from(plaintext).toString('base64')
      }
    );
    return response.data.ciphertext;
  }

  /**
   * Decrypt data using tenant's transit key
   */
  private async _decrypt(tenantId: string, ciphertext: string): Promise<string> {
    const response = await this._client.write(
      `${this._transitEngine}/decrypt/${tenantId}`,
      { ciphertext }
    );
    return Buffer.from(response.data.plaintext, 'base64').toString('utf-8');
  }
}
