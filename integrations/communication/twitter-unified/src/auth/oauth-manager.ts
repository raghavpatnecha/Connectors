/**
 * OAuth 1.0a Manager for Twitter API
 * Handles OAuth 1.0a signature generation and token management
 */

import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import axios from 'axios';
import { VaultClient, TwitterOAuthCredentials } from './vault-client';
import { logger, logOAuthEvent } from '../utils/logger';

export interface OAuthConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export class OAuthManager {
  private readonly _vaultClient: VaultClient;
  private readonly _oauth: OAuth;
  private readonly _consumerKey: string;
  private readonly _consumerSecret: string;

  constructor(
    config: {
      apiKey: string;
      apiSecret: string;
    },
    vaultClient: VaultClient
  ) {
    this._consumerKey = config.apiKey;
    this._consumerSecret = config.apiSecret;
    this._vaultClient = vaultClient;

    // Initialize OAuth 1.0a
    this._oauth = new OAuth({
      consumer: {
        key: this._consumerKey,
        secret: this._consumerSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString, key) {
        return crypto
          .createHmac('sha1', key)
          .update(baseString)
          .digest('base64');
      }
    });

    logger.info('OAuthManager initialized', {
      consumerKey: this._consumerKey.substring(0, 10) + '...'
    });
  }

  /**
   * Store OAuth credentials for tenant
   */
  async storeCredentials(
    tenantId: string,
    credentials: {
      accessToken: string;
      accessTokenSecret: string;
      socialDataApiKey?: string;
    }
  ): Promise<void> {
    const oauthCreds: TwitterOAuthCredentials = {
      accessToken: credentials.accessToken,
      accessTokenSecret: credentials.accessTokenSecret,
      apiKey: this._consumerKey,
      apiSecret: this._consumerSecret,
      socialDataApiKey: credentials.socialDataApiKey
    };

    await this._vaultClient.storeOAuthCredentials(tenantId, oauthCreds);
    logOAuthEvent('credentials_stored', tenantId);
  }

  /**
   * Get OAuth authorization header for API request
   */
  async getAuthorizationHeader(
    tenantId: string,
    method: string,
    url: string,
    data?: any
  ): Promise<string> {
    const credentials = await this._vaultClient.getOAuthCredentials(tenantId);

    if (!credentials) {
      throw new Error(`No OAuth credentials found for tenant: ${tenantId}`);
    }

    const token = {
      key: credentials.accessToken,
      secret: credentials.accessTokenSecret
    };

    const requestData = {
      url,
      method
    };

    const authHeader = this._oauth.toHeader(
      this._oauth.authorize(requestData, token)
    );

    return authHeader.Authorization;
  }

  /**
   * Generate OAuth 1.0a signed request
   */
  generateSignedRequest(
    config: OAuthConfig,
    method: string,
    url: string,
    data?: any
  ): { url: string; headers: Record<string, string> } {
    const token = {
      key: config.accessToken,
      secret: config.accessTokenSecret
    };

    const requestData = {
      url,
      method,
      data
    };

    const authHeader = this._oauth.toHeader(
      this._oauth.authorize(requestData, token)
    );

    return {
      url,
      headers: {
        Authorization: authHeader.Authorization,
        'Content-Type': 'application/json'
      }
    };
  }

  /**
   * Validate OAuth credentials by making test API call
   */
  async validateCredentials(tenantId: string): Promise<boolean> {
    try {
      const authHeader = await this.getAuthorizationHeader(
        tenantId,
        'GET',
        'https://api.twitter.com/2/users/me'
      );

      const response = await axios.get('https://api.twitter.com/2/users/me', {
        headers: {
          Authorization: authHeader
        }
      });

      logOAuthEvent('credentials_validated', tenantId, {
        userId: response.data.data?.id
      });

      return response.status === 200;
    } catch (error: any) {
      logger.error('OAuth validation failed', {
        tenantId,
        error: error.message,
        status: error.response?.status
      });
      return false;
    }
  }

  /**
   * Get credentials for tenant
   */
  async getCredentials(tenantId: string): Promise<OAuthConfig | null> {
    const credentials = await this._vaultClient.getOAuthCredentials(tenantId);

    if (!credentials) {
      return null;
    }

    return {
      apiKey: credentials.apiKey || this._consumerKey,
      apiSecret: credentials.apiSecret || this._consumerSecret,
      accessToken: credentials.accessToken,
      accessTokenSecret: credentials.accessTokenSecret
    };
  }

  /**
   * Delete credentials for tenant
   */
  async deleteCredentials(tenantId: string): Promise<void> {
    await this._vaultClient.deleteCredentials(tenantId);
    logOAuthEvent('credentials_deleted', tenantId);
  }
}
