/**
 * OAuth 2.0 Manager for GitHub authentication
 */

import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { OAuthError } from '../utils/error-handler.js';
import { VaultClient, StoredCredentials } from './vault-client.js';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope: string;
}

export class OAuthManager {
  private config: OAuthConfig;
  private vaultClient: VaultClient;
  private pendingStates: Map<string, string> = new Map(); // state -> tenantId

  constructor(config: OAuthConfig, vaultClient: VaultClient) {
    this.config = config;
    this.vaultClient = vaultClient;

    logger.info('OAuth manager initialized', {
      clientId: config.clientId,
      scopes: config.scopes,
    });
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(tenantId: string): string {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    this.pendingStates.set(state, tenantId);

    // Clean up state after 10 minutes
    setTimeout(() => this.pendingStates.delete(state), 10 * 60 * 1000);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state,
      response_type: 'code',
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

    logger.info('Generated OAuth authorization URL', { tenantId, state });

    return authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(code: string, tenantId: string): Promise<void> {
    try {
      logger.info('Processing OAuth callback', { tenantId });

      // Exchange authorization code for access token
      const tokenResponse = await this.exchangeCodeForToken(code);

      // Calculate expiry timestamp
      const expiresAt = tokenResponse.expires_in
        ? Math.floor(Date.now() / 1000) + tokenResponse.expires_in
        : undefined;

      // Store credentials in Vault
      const credentials: StoredCredentials = {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_at: expiresAt,
        token_type: tokenResponse.token_type,
        scope: tokenResponse.scope,
      };

      await this.vaultClient.storeCredentials(tenantId, credentials);

      logger.info('OAuth authentication successful', {
        tenantId,
        hasRefreshToken: !!tokenResponse.refresh_token,
        expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : 'never',
      });
    } catch (error: any) {
      logger.error('OAuth callback failed', {
        tenantId,
        error: error.message,
        stack: error.stack,
      });
      throw new OAuthError(`OAuth callback failed: ${error.message}`);
    }
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.data.error) {
        throw new Error(
          response.data.error_description || response.data.error
        );
      }

      return response.data as TokenResponse;
    } catch (error: any) {
      logger.error('Token exchange failed', {
        error: error.message,
        response: error.response?.data,
      });
      throw new OAuthError(`Token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(tenantId: string): Promise<void> {
    try {
      logger.info('Refreshing access token', { tenantId });

      // Get current credentials
      const currentCredentials = await this.vaultClient.getCredentials(tenantId);

      if (!currentCredentials) {
        throw new OAuthError('No credentials found for tenant');
      }

      if (!currentCredentials.refresh_token) {
        throw new OAuthError('No refresh token available');
      }

      // Exchange refresh token for new access token
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: currentCredentials.refresh_token,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (response.data.error) {
        throw new Error(
          response.data.error_description || response.data.error
        );
      }

      const tokenResponse = response.data as TokenResponse;

      // Calculate new expiry
      const expiresAt = tokenResponse.expires_in
        ? Math.floor(Date.now() / 1000) + tokenResponse.expires_in
        : undefined;

      // Update stored credentials
      const newCredentials: StoredCredentials = {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token || currentCredentials.refresh_token,
        expires_at: expiresAt,
        token_type: tokenResponse.token_type,
        scope: tokenResponse.scope,
      };

      await this.vaultClient.storeCredentials(tenantId, newCredentials);

      logger.info('Token refresh successful', { tenantId });
    } catch (error: any) {
      logger.error('Token refresh failed', {
        tenantId,
        error: error.message,
      });
      throw new OAuthError(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidToken(tenantId: string): Promise<string> {
    const credentials = await this.vaultClient.getCredentials(tenantId);

    if (!credentials) {
      throw new OAuthError('No credentials found for tenant. Please authenticate first.');
    }

    // Check if token is expired
    if (this.vaultClient.isTokenExpired(credentials)) {
      logger.info('Token expired, refreshing...', { tenantId });
      await this.refreshToken(tenantId);

      // Get new credentials
      const newCredentials = await this.vaultClient.getCredentials(tenantId);
      if (!newCredentials) {
        throw new OAuthError('Failed to retrieve refreshed credentials');
      }

      return newCredentials.access_token;
    }

    return credentials.access_token;
  }

  /**
   * Revoke credentials for a tenant
   */
  async revokeCredentials(tenantId: string): Promise<void> {
    await this.vaultClient.deleteCredentials(tenantId);
    logger.info('Credentials revoked', { tenantId });
  }
}
