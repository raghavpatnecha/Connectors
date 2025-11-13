/**
 * Reddit Unified MCP - OAuth Manager
 *
 * Manages Reddit OAuth 2.0 authentication flow with support for:
 * - Authorization code flow
 * - Token refresh
 * - Automatic token rotation
 * - Multi-tenant credential management
 *
 * @module auth/oauth-manager
 */

import axios, { AxiosInstance } from 'axios';
import type {
  RedditOAuthConfig,
  RedditOAuthTokens,
  OAuthCredentials,
  TokenRefreshResult,
  OAuthErrorResponse
} from './types';
import { VaultClient } from './vault-client';
import { logger } from '../utils/logger';

export class OAuthManager {
  private readonly _config: RedditOAuthConfig;
  private readonly _vault: VaultClient;
  private readonly _httpClient: AxiosInstance;
  private readonly _integration: string = 'reddit';

  // Reddit OAuth endpoints
  private readonly _authorizationUrl = 'https://www.reddit.com/api/v1/authorize';
  private readonly _tokenUrl = 'https://www.reddit.com/api/v1/access_token';
  private readonly _revokeUrl = 'https://www.reddit.com/api/v1/revoke_token';

  constructor(config: RedditOAuthConfig, vault: VaultClient) {
    this._config = config;
    this._vault = vault;

    // Create HTTP client with basic auth for token requests
    const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    this._httpClient = axios.create({
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'User-Agent': config.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    logger.info('OAuthManager initialized', {
      clientId: config.clientId.substring(0, 8) + '...',
      scopes: config.scopes,
      redirectUri: config.redirectUri
    });
  }

  /**
   * Generate authorization URL for OAuth flow
   *
   * @param tenantId - Unique tenant identifier
   * @param state - CSRF protection state parameter
   * @param duration - Token duration (temporary or permanent)
   * @returns Authorization URL
   */
  getAuthorizationUrl(
    tenantId: string,
    state: string,
    duration: 'temporary' | 'permanent' = 'permanent'
  ): string {
    const params = new URLSearchParams({
      client_id: this._config.clientId,
      response_type: 'code',
      state: `${tenantId}:${state}`,
      redirect_uri: this._config.redirectUri,
      duration,
      scope: this._config.scopes.join(' ')
    });

    const url = `${this._authorizationUrl}?${params.toString()}`;
    logger.info('Generated authorization URL', { tenantId, duration, scopes: this._config.scopes });

    return url;
  }

  /**
   * Exchange authorization code for access token
   *
   * @param tenantId - Unique tenant identifier
   * @param code - Authorization code from OAuth callback
   * @returns OAuth credentials
   */
  async exchangeCodeForToken(tenantId: string, code: string): Promise<OAuthCredentials> {
    try {
      logger.info('Exchanging authorization code for token', { tenantId });

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this._config.redirectUri
      });

      const response = await this._httpClient.post<RedditOAuthTokens>(
        this._tokenUrl,
        params.toString()
      );

      const tokens = response.data;
      const credentials = this._tokensToCredentials(tokens);

      logger.info('Successfully exchanged code for token', {
        tenantId,
        expiresAt: credentials.expiresAt.toISOString(),
        hasRefreshToken: !!credentials.refreshToken,
        scopes: credentials.scopes
      });

      // Store in Vault
      await this._vault.storeCredentials(tenantId, this._integration, credentials);

      return credentials;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as OAuthErrorResponse;
        logger.error('OAuth code exchange failed', {
          tenantId,
          error: errorData.error,
          description: errorData.error_description
        });
        throw new Error(`OAuth code exchange failed: ${errorData.error_description || errorData.error}`);
      }

      logger.error('OAuth code exchange failed', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   *
   * @param tenantId - Unique tenant identifier
   * @returns Refreshed credentials
   */
  async refreshToken(tenantId: string): Promise<TokenRefreshResult> {
    try {
      logger.info('Refreshing access token', { tenantId });

      // Get current credentials from Vault
      const currentCredentials = await this._vault.getCredentials(tenantId, this._integration);

      if (!currentCredentials.refreshToken) {
        logger.error('No refresh token available', { tenantId });
        return {
          success: false,
          error: 'No refresh token available'
        };
      }

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: currentCredentials.refreshToken
      });

      const response = await this._httpClient.post<RedditOAuthTokens>(
        this._tokenUrl,
        params.toString()
      );

      const tokens = response.data;
      const newCredentials = this._tokensToCredentials(tokens);

      // If no new refresh token, keep the old one
      if (!newCredentials.refreshToken) {
        newCredentials.refreshToken = currentCredentials.refreshToken;
      }

      logger.info('Token refreshed successfully', {
        tenantId,
        expiresAt: newCredentials.expiresAt.toISOString()
      });

      // Update in Vault
      await this._vault.updateCredentials(tenantId, this._integration, newCredentials);

      return {
        success: true,
        credentials: newCredentials
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as OAuthErrorResponse;
        logger.error('Token refresh failed', {
          tenantId,
          error: errorData.error,
          description: errorData.error_description
        });
        return {
          success: false,
          error: `Token refresh failed: ${errorData.error_description || errorData.error}`
        };
      }

      logger.error('Token refresh failed', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get valid access token, refreshing if necessary
   *
   * @param tenantId - Unique tenant identifier
   * @returns Valid OAuth credentials
   */
  async getValidToken(tenantId: string): Promise<OAuthCredentials> {
    try {
      logger.debug('Getting valid token', { tenantId });

      // Get credentials from Vault
      const credentials = await this._vault.getCredentials(tenantId, this._integration);

      // Check if token is expired or about to expire (within 5 minutes)
      const now = new Date();
      const expiresAt = new Date(credentials.expiresAt);
      const bufferMs = 5 * 60 * 1000; // 5 minutes

      if (expiresAt.getTime() - now.getTime() > bufferMs) {
        logger.debug('Token is still valid', {
          tenantId,
          expiresAt: expiresAt.toISOString(),
          expiresIn: Math.round((expiresAt.getTime() - now.getTime()) / 1000) + 's'
        });
        return credentials;
      }

      // Token expired or about to expire, refresh it
      logger.info('Token expired or about to expire, refreshing', {
        tenantId,
        expiresAt: expiresAt.toISOString()
      });

      const refreshResult = await this.refreshToken(tenantId);

      if (!refreshResult.success || !refreshResult.credentials) {
        throw new Error(`Failed to refresh token: ${refreshResult.error}`);
      }

      return refreshResult.credentials;
    } catch (error) {
      logger.error('Failed to get valid token', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Revoke access token (disconnect user)
   *
   * @param tenantId - Unique tenant identifier
   * @param revokeRefreshToken - Also revoke refresh token
   */
  async revokeToken(tenantId: string, revokeRefreshToken = true): Promise<void> {
    try {
      logger.info('Revoking access token', { tenantId, revokeRefreshToken });

      const credentials = await this._vault.getCredentials(tenantId, this._integration);

      // Revoke access token
      const accessTokenParams = new URLSearchParams({
        token: credentials.accessToken,
        token_type_hint: 'access_token'
      });

      await this._httpClient.post(this._revokeUrl, accessTokenParams.toString());
      logger.info('Access token revoked', { tenantId });

      // Revoke refresh token if requested and available
      if (revokeRefreshToken && credentials.refreshToken) {
        const refreshTokenParams = new URLSearchParams({
          token: credentials.refreshToken,
          token_type_hint: 'refresh_token'
        });

        await this._httpClient.post(this._revokeUrl, refreshTokenParams.toString());
        logger.info('Refresh token revoked', { tenantId });
      }

      // Delete from Vault
      await this._vault.deleteCredentials(tenantId, this._integration);
      logger.info('Credentials deleted from Vault', { tenantId });
    } catch (error) {
      logger.error('Failed to revoke token', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Check if tenant has valid credentials
   *
   * @param tenantId - Unique tenant identifier
   * @returns True if valid credentials exist
   */
  async hasValidCredentials(tenantId: string): Promise<boolean> {
    try {
      const hasCredentials = await this._vault.hasCredentials(tenantId, this._integration);
      if (!hasCredentials) {
        return false;
      }

      const credentials = await this._vault.getCredentials(tenantId, this._integration);
      const now = new Date();
      const expiresAt = new Date(credentials.expiresAt);

      // Consider valid if not expired or has refresh token
      return expiresAt > now || !!credentials.refreshToken;
    } catch (error) {
      logger.error('Failed to check credentials', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Convert Reddit OAuth tokens to internal credentials format
   *
   * @param tokens - Reddit OAuth tokens
   * @returns OAuth credentials
   */
  private _tokensToCredentials(tokens: RedditOAuthTokens): OAuthCredentials {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + tokens.expires_in * 1000);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      scopes: tokens.scope.split(' '),
      tokenType: tokens.token_type
    };
  }

  /**
   * Validate OAuth configuration
   *
   * @returns True if configuration is valid
   */
  validateConfig(): boolean {
    const issues: string[] = [];

    if (!this._config.clientId) {
      issues.push('Client ID is required');
    }

    if (!this._config.clientSecret) {
      issues.push('Client Secret is required');
    }

    if (!this._config.redirectUri) {
      issues.push('Redirect URI is required');
    }

    if (!this._config.userAgent) {
      issues.push('User-Agent is required');
    }

    if (this._config.scopes.length === 0) {
      issues.push('At least one scope is required');
    }

    if (issues.length > 0) {
      logger.error('OAuth configuration invalid', { issues });
      return false;
    }

    logger.info('OAuth configuration valid');
    return true;
  }

  /**
   * Get current configuration (sanitized)
   *
   * @returns Sanitized configuration object
   */
  getConfig(): Partial<RedditOAuthConfig> {
    return {
      clientId: this._config.clientId.substring(0, 8) + '...',
      redirectUri: this._config.redirectUri,
      userAgent: this._config.userAgent,
      scopes: this._config.scopes
    };
  }
}
