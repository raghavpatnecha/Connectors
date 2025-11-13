/**
 * LinkedIn OAuth 2.0 Manager
 *
 * Handles the complete OAuth 2.0 authorization code flow for LinkedIn:
 * 1. Generate authorization URL
 * 2. Handle OAuth callback
 * 3. Exchange code for access token
 * 4. Automatic token refresh
 * 5. Store tokens in Vault (multi-tenant)
 */

import axios from 'axios';
import { logger } from '../utils/logger';
import { VaultClient } from './vault-client';

export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scopes: string[];
  tenantId: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export class OAuthManager {
  private config: OAuthConfig;
  private vaultClient: VaultClient;
  private readonly authUrl = 'https://www.linkedin.com/oauth/v2/authorization';
  private readonly tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';

  constructor(config: OAuthConfig, vaultClient: VaultClient) {
    this.config = config;
    this.vaultClient = vaultClient;
    logger.info('OAuth Manager initialized', { clientId: config.clientId });
  }

  /**
   * Generate OAuth 2.0 authorization URL for user to authenticate
   */
  generateAuthUrl(tenantId: string, state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: state || this.generateState(tenantId)
    });

    const url = `${this.authUrl}?${params.toString()}`;
    logger.info('Generated OAuth authorization URL', { tenantId, url });

    return url;
  }

  /**
   * Handle OAuth callback and exchange authorization code for access token
   */
  async handleCallback(code: string, tenantId: string): Promise<OAuthCredentials> {
    logger.info('Handling OAuth callback', { tenantId, code: code.substring(0, 10) + '...' });

    try {
      // Exchange authorization code for access token
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, refresh_token, expires_in, scope } = response.data;

      const credentials: OAuthCredentials = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + (expires_in * 1000),
        scopes: scope ? scope.split(' ') : this.config.scopes,
        tenantId
      };

      // Store credentials in Vault
      await this.vaultClient.storeCredentials(tenantId, 'linkedin', credentials);

      logger.info('OAuth credentials obtained and stored', {
        tenantId,
        expiresIn: expires_in,
        scopes: credentials.scopes
      });

      return credentials;
    } catch (error: any) {
      logger.error('OAuth callback failed', {
        tenantId,
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`OAuth authentication failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(tenantId: string): Promise<OAuthCredentials> {
    logger.info('Refreshing access token', { tenantId });

    try {
      // Get current credentials from Vault
      const currentCreds = await this.vaultClient.getCredentials(tenantId, 'linkedin');

      if (!currentCreds.refreshToken) {
        throw new Error('No refresh token available - user must re-authenticate');
      }

      // Request new access token
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: currentCreds.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, refresh_token, expires_in, scope } = response.data;

      const newCredentials: OAuthCredentials = {
        accessToken: access_token,
        refreshToken: refresh_token || currentCreds.refreshToken,
        expiresAt: Date.now() + (expires_in * 1000),
        scopes: scope ? scope.split(' ') : currentCreds.scopes,
        tenantId
      };

      // Update credentials in Vault
      await this.vaultClient.storeCredentials(tenantId, 'linkedin', newCredentials);

      logger.info('Access token refreshed successfully', { tenantId });

      return newCredentials;
    } catch (error: any) {
      logger.error('Token refresh failed', {
        tenantId,
        error: error.message
      });
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Get valid access token (refreshes automatically if needed)
   */
  async getValidToken(tenantId: string): Promise<string> {
    const credentials = await this.vaultClient.getCredentials(tenantId, 'linkedin');

    // Check if token is expiring soon (within 5 minutes)
    const isExpiringSoon = credentials.expiresAt - Date.now() < 5 * 60 * 1000;

    if (isExpiringSoon) {
      logger.info('Token expiring soon, refreshing...', { tenantId });
      const refreshed = await this.refreshToken(tenantId);
      return refreshed.accessToken;
    }

    return credentials.accessToken;
  }

  /**
   * Check if tenant has valid credentials
   */
  async hasValidCredentials(tenantId: string): Promise<boolean> {
    try {
      await this.vaultClient.getCredentials(tenantId, 'linkedin');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(tenantId: string): Promise<void> {
    logger.info('Revoking access token', { tenantId });

    try {
      const credentials = await this.vaultClient.getCredentials(tenantId, 'linkedin');

      // LinkedIn doesn't have a revocation endpoint, so we just delete from Vault
      await this.vaultClient.deleteCredentials(tenantId, 'linkedin');

      logger.info('Access token revoked', { tenantId });
    } catch (error: any) {
      logger.error('Token revocation failed', { tenantId, error: error.message });
      throw error;
    }
  }

  /**
   * Generate cryptographically secure state parameter
   */
  private generateState(tenantId: string): string {
    const random = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    return `${tenantId}:${timestamp}:${random}`;
  }

  /**
   * Verify state parameter
   */
  verifyState(state: string, expectedTenantId: string): boolean {
    const parts = state.split(':');
    if (parts.length !== 3) return false;

    const [tenantId, timestamp] = parts;

    // Check if state is for the correct tenant
    if (tenantId !== expectedTenantId) return false;

    // Check if state is not expired (10 minutes)
    const stateAge = Date.now() - parseInt(timestamp, 36);
    if (stateAge > 10 * 60 * 1000) return false;

    return true;
  }
}
