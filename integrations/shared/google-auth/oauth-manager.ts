/**
 * OAuth 2.0 Manager for Google Workspace authentication
 * Supports all Google Workspace services with unified OAuth flow
 */

import { OAuth2Client, Credentials } from 'google-auth-library';
import crypto from 'crypto';
import { logger } from '../../shared/google-utils/logger.js';
import { OAuthError } from '../../shared/google-utils/error-mapper.js';
import { VaultClient, StoredCredentials } from './vault-client.js';
import { GOOGLE_OAUTH_CONFIG } from './oauth-config.js';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type: string;
  scope: string;
}

export class OAuthManager {
  private config: OAuthConfig;
  private vaultClient: VaultClient;
  private oauth2Clients: Map<string, OAuth2Client> = new Map(); // tenantId -> OAuth2Client
  private pendingStates: Map<string, string> = new Map(); // state -> tenantId

  constructor(config: OAuthConfig, vaultClient: VaultClient) {
    this.config = config;
    this.vaultClient = vaultClient;

    logger.info('Google OAuth manager initialized', {
      clientId: config.clientId,
      scopes: config.scopes.length,
      redirectUri: config.redirectUri,
    });
  }

  /**
   * Generate OAuth authorization URL for Google Workspace
   */
  generateAuthUrl(tenantId: string, additionalScopes: string[] = []): string {
    // Generate state with embedded tenant ID for security
    const state = this.generateState(tenantId);

    // Store state for optional server-side validation
    this.pendingStates.set(state, tenantId);

    // Clean up state after 10 minutes
    setTimeout(() => this.pendingStates.delete(state), 10 * 60 * 1000);

    // Get or create OAuth2Client for this tenant
    const oauth2Client = this.getOAuth2Client(tenantId);

    // Combine default scopes with any additional requested scopes
    const allScopes = [...new Set([...this.config.scopes, ...additionalScopes])];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required for refresh token
      scope: allScopes,
      state,
      prompt: 'consent', // Force consent to ensure refresh token
    });

    logger.info('Generated Google OAuth authorization URL', {
      tenantId,
      state,
      scopeCount: allScopes.length,
    });

    return authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  async handleCallback(code: string, tenantId: string): Promise<void> {
    try {
      logger.info('Processing Google OAuth callback', { tenantId });

      const oauth2Client = this.getOAuth2Client(tenantId);

      // Exchange authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.access_token) {
        throw new Error('No access token received from Google');
      }

      // Set credentials in OAuth2Client
      oauth2Client.setCredentials(tokens);

      // Store credentials in Vault
      const credentials: StoredCredentials = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date
          ? Math.floor(tokens.expiry_date / 1000)
          : undefined,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope || this.config.scopes.join(' '),
      };

      await this.vaultClient.storeCredentials(tenantId, credentials);

      logger.info('Google OAuth authentication successful', {
        tenantId,
        hasRefreshToken: !!tokens.refresh_token,
        expiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date).toISOString()
          : 'never',
        scopeCount: tokens.scope?.split(' ').length || 0,
      });
    } catch (error: any) {
      logger.error('Google OAuth callback failed', {
        tenantId,
        error: error.message,
        stack: error.stack,
      });
      throw new OAuthError(`Google OAuth callback failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(tenantId: string): Promise<void> {
    try {
      logger.info('Refreshing Google access token', { tenantId });

      // Get current credentials
      const currentCredentials = await this.vaultClient.getCredentials(tenantId);

      if (!currentCredentials) {
        throw new OAuthError('No credentials found for tenant');
      }

      if (!currentCredentials.refresh_token) {
        throw new OAuthError('No refresh token available - user must re-authenticate');
      }

      const oauth2Client = this.getOAuth2Client(tenantId);

      // Set current credentials (including refresh token)
      oauth2Client.setCredentials({
        access_token: currentCredentials.access_token,
        refresh_token: currentCredentials.refresh_token,
        expiry_date: currentCredentials.expires_at
          ? currentCredentials.expires_at * 1000
          : undefined,
        token_type: currentCredentials.token_type,
        scope: currentCredentials.scope,
      });

      // Refresh the access token
      const { credentials: newTokens } = await oauth2Client.refreshAccessToken();

      if (!newTokens.access_token) {
        throw new Error('No access token received after refresh');
      }

      // Update stored credentials
      const newCredentials: StoredCredentials = {
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || currentCredentials.refresh_token,
        expires_at: newTokens.expiry_date
          ? Math.floor(newTokens.expiry_date / 1000)
          : undefined,
        token_type: newTokens.token_type || currentCredentials.token_type,
        scope: newTokens.scope || currentCredentials.scope,
      };

      await this.vaultClient.storeCredentials(tenantId, newCredentials);

      logger.info('Google token refresh successful', {
        tenantId,
        expiresAt: newTokens.expiry_date
          ? new Date(newTokens.expiry_date).toISOString()
          : 'unknown',
      });
    } catch (error: any) {
      logger.error('Google token refresh failed', {
        tenantId,
        error: error.message,
      });
      throw new OAuthError(`Google token refresh failed: ${error.message}`);
    }
  }

  /**
   * Get valid OAuth2Client with automatically refreshed credentials
   */
  async getAuthenticatedClient(tenantId: string): Promise<OAuth2Client> {
    const credentials = await this.vaultClient.getCredentials(tenantId);

    if (!credentials) {
      throw new OAuthError(
        'No credentials found for tenant. Please authenticate first.'
      );
    }

    const oauth2Client = this.getOAuth2Client(tenantId);

    // Set credentials
    oauth2Client.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      expiry_date: credentials.expires_at
        ? credentials.expires_at * 1000
        : undefined,
      token_type: credentials.token_type,
      scope: credentials.scope,
    });

    // Check if token is expired (with 5 minute buffer)
    if (this.vaultClient.isTokenExpired(credentials)) {
      logger.info('Token expired, refreshing...', { tenantId });
      await this.refreshToken(tenantId);

      // Get new credentials and update OAuth2Client
      const newCredentials = await this.vaultClient.getCredentials(tenantId);
      if (!newCredentials) {
        throw new OAuthError('Failed to retrieve refreshed credentials');
      }

      oauth2Client.setCredentials({
        access_token: newCredentials.access_token,
        refresh_token: newCredentials.refresh_token,
        expiry_date: newCredentials.expires_at
          ? newCredentials.expires_at * 1000
          : undefined,
        token_type: newCredentials.token_type,
        scope: newCredentials.scope,
      });
    }

    return oauth2Client;
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidToken(tenantId: string): Promise<string> {
    const oauth2Client = await this.getAuthenticatedClient(tenantId);
    const credentials = oauth2Client.credentials;

    if (!credentials.access_token) {
      throw new OAuthError('No access token available');
    }

    return credentials.access_token;
  }

  /**
   * Revoke credentials for a tenant
   */
  async revokeCredentials(tenantId: string): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client(tenantId);
      const credentials = await this.vaultClient.getCredentials(tenantId);

      if (credentials?.access_token) {
        // Revoke token with Google
        await oauth2Client.revokeToken(credentials.access_token);
      }

      // Delete from Vault
      await this.vaultClient.deleteCredentials(tenantId);

      // Remove from cache
      this.oauth2Clients.delete(tenantId);

      logger.info('Google credentials revoked', { tenantId });
    } catch (error: any) {
      logger.error('Failed to revoke Google credentials', {
        tenantId,
        error: error.message,
      });
      throw new OAuthError(`Failed to revoke credentials: ${error.message}`);
    }
  }

  /**
   * Get or create OAuth2Client for a tenant
   */
  private getOAuth2Client(tenantId: string): OAuth2Client {
    if (!this.oauth2Clients.has(tenantId)) {
      const client = new OAuth2Client({
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        redirectUri: this.config.redirectUri,
      });

      this.oauth2Clients.set(tenantId, client);
      logger.debug('Created new OAuth2Client', { tenantId });
    }

    return this.oauth2Clients.get(tenantId)!;
  }

  /**
   * Generate state parameter with embedded tenant ID
   * Format: tenantId:timestamp:random
   * This allows extracting tenant ID from state in callback without server-side storage
   */
  private generateState(tenantId: string): string {
    const random = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now().toString(36);
    return `${tenantId}:${timestamp}:${random}`;
  }

  /**
   * Extract tenant ID from state parameter
   */
  extractTenantIdFromState(state: string): string | null {
    const parts = state.split(':');
    return parts.length >= 3 ? parts[0] : null;
  }

  /**
   * Validate OAuth credentials (check if valid and not expired)
   */
  async validateCredentials(tenantId: string): Promise<boolean> {
    try {
      const credentials = await this.vaultClient.getCredentials(tenantId);

      if (!credentials) {
        return false;
      }

      // If expired but has refresh token, try to refresh
      if (this.vaultClient.isTokenExpired(credentials)) {
        if (!credentials.refresh_token) {
          return false;
        }

        await this.refreshToken(tenantId);
        return true;
      }

      return true;
    } catch (error: any) {
      logger.error('Credential validation failed', {
        tenantId,
        error: error.message,
      });
      return false;
    }
  }
}
