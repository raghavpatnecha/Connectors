/**
 * OAuth proxy for transparent authentication injection
 * Connectors Platform - Automatic OAuth handling for MCP requests
 */

import axios, { AxiosInstance } from 'axios';
import { createLogger } from 'winston';
import { VaultClient } from './vault-client';
import { RefreshScheduler, RefreshCallback } from './refresh-scheduler';
import {
  MCPRequest,
  MCPResponse,
  OAuthCredentials,
  OAuthTokenResponse,
  OAuthClientConfig
} from './types';
import {
  OAuthError,
  TokenExpiredError,
  TokenRefreshError,
  RateLimitError
} from '../errors/oauth-errors';

const logger = createLogger({
  defaultMeta: { service: 'oauth-proxy' }
});

/**
 * OAuthProxy provides transparent OAuth credential injection for MCP requests
 *
 * Features:
 * - Automatic credential retrieval from Vault
 * - Transparent auth header injection
 * - Automatic token refresh on 401
 * - Rate limit handling
 * - Integration with RefreshScheduler
 */
export class OAuthProxy {
  private readonly _vault: VaultClient;
  private readonly _scheduler: RefreshScheduler;
  private readonly _mcpClient: AxiosInstance;
  private readonly _oauthConfigs: Map<string, OAuthClientConfig>;

  constructor(
    vault: VaultClient,
    mcpBaseUrl: string,
    oauthConfigs: Map<string, OAuthClientConfig> = new Map()
  ) {
    this._vault = vault;
    this._oauthConfigs = oauthConfigs;

    // Create MCP client
    this._mcpClient = axios.create({
      baseURL: mcpBaseUrl,
      timeout: 30000
    });

    // Create refresh callback
    const refreshCallback: RefreshCallback = async (
      _tenantId,
      integration,
      refreshToken
    ) => {
      return this._performRefresh(integration, refreshToken);
    };

    // Initialize scheduler
    this._scheduler = new RefreshScheduler(vault, refreshCallback);

    // Set up event listeners
    this._setupEventListeners();

    logger.info('OAuthProxy initialized', { mcpBaseUrl });
  }

  /**
   * Start the OAuth proxy and refresh scheduler
   */
  start(): void {
    this._scheduler.start();
    logger.info('OAuthProxy started');
  }

  /**
   * Stop the OAuth proxy and refresh scheduler
   */
  stop(): void {
    this._scheduler.stop();
    logger.info('OAuthProxy stopped');
  }

  /**
   * Register OAuth configuration for an integration
   *
   * @param integration - Integration name
   * @param config - OAuth client configuration
   */
  registerOAuthConfig(integration: string, config: OAuthClientConfig): void {
    this._oauthConfigs.set(integration, config);
    logger.info('Registered OAuth config', { integration });
  }

  /**
   * Proxy an MCP request with automatic OAuth injection
   *
   * Flow:
   * 1. Get valid credentials from Vault (auto-refreshed)
   * 2. Inject auth header
   * 3. Forward to MCP server
   * 4. Handle auth errors (401) with token refresh
   * 5. Handle rate limits (429)
   *
   * @param req - MCP request
   * @returns MCP response
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    const { tenantId, integration, method, path, body } = req;
    const startTime = Date.now();

    try {
      // 1. Get valid credentials from Vault
      const creds = await this._vault.getCredentials(tenantId, integration);

      // Check if token is already expired
      if (creds.expiresAt.getTime() <= Date.now()) {
        logger.warn('Token already expired, forcing refresh', {
          tenantId,
          integration,
          expiresAt: creds.expiresAt
        });

        await this._forceRefresh(tenantId, integration);
        // Retry with new token (prevent infinite loop with _retry flag)
        if (!req._retry) {
          return this.proxyRequest({ ...req, _retry: true });
        }

        throw new TokenExpiredError(
          'Token expired and refresh failed',
          integration,
          tenantId,
          creds.expiresAt
        );
      }

      // 2. Inject auth header
      const headers = {
        ...req.headers,
        'Authorization': `${creds.tokenType} ${creds.accessToken}`
      };

      // 3. Forward to MCP server
      const response = await this._mcpClient.request({
        method,
        url: `/integrations/${integration}${path}`,
        headers,
        data: body
      });

      const duration = Date.now() - startTime;
      logger.debug('MCP request proxied successfully', {
        tenantId,
        integration,
        method,
        path,
        status: response.status,
        duration
      });

      return {
        status: response.status,
        headers: response.headers as Record<string, string>,
        data: response.data
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Re-throw OAuth-specific errors without wrapping
      if (error instanceof TokenExpiredError || error instanceof TokenRefreshError) {
        throw error;
      }

      // 4. Handle auth errors (token expired despite our check)
      if (error.response?.status === 401) {
        logger.warn('Received 401 Unauthorized, attempting token refresh', {
          tenantId,
          integration,
          duration
        });

        // Only retry once to prevent infinite loops
        if (!req._retry) {
          try {
            await this._forceRefresh(tenantId, integration);
            return this.proxyRequest({ ...req, _retry: true });
          } catch (refreshError) {
            throw new TokenRefreshError(
              'Failed to refresh token after 401',
              integration,
              tenantId,
              false,
              refreshError instanceof Error ? refreshError : undefined
            );
          }
        }

        throw new TokenExpiredError(
          'Token refresh failed on retry',
          integration,
          tenantId,
          new Date()
        );
      }

      // 5. Handle rate limits
      if (error.response?.status === 429) {
        const resetTime = error.response.headers['x-ratelimit-reset'];
        const remaining = error.response.headers['x-ratelimit-remaining'];

        logger.warn('Rate limit exceeded', {
          tenantId,
          integration,
          resetTime,
          remaining
        });

        throw new RateLimitError(
          'OAuth provider rate limit exceeded',
          integration,
          tenantId,
          resetTime ? parseInt(resetTime) : Date.now() / 1000 + 3600,
          remaining ? parseInt(remaining) : 0
        );
      }

      // Generic error
      logger.error('MCP request failed', {
        tenantId,
        integration,
        method,
        path,
        status: error.response?.status,
        error: error.message,
        duration
      });

      throw new OAuthError(
        `MCP request failed: ${error.message}`,
        integration,
        tenantId,
        error
      );
    }
  }

  /**
   * Store initial OAuth credentials and schedule refresh
   * Called after OAuth flow completion
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   * @param tokenResponse - OAuth token response from provider
   */
  async storeInitialCredentials(
    tenantId: string,
    integration: string,
    tokenResponse: OAuthTokenResponse
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    const creds: OAuthCredentials = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || '',
      expiresAt,
      scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : [],
      tokenType: tokenResponse.token_type,
      integration
    };

    // Store in Vault
    await this._vault.storeCredentials(tenantId, integration, creds);

    // Schedule auto-refresh
    this._scheduler.scheduleRefresh(tenantId, integration, expiresAt);

    logger.info('Stored initial OAuth credentials', {
      tenantId,
      integration,
      expiresAt
    });
  }

  /**
   * Revoke OAuth credentials
   * Removes from Vault and cancels scheduled refresh
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   */
  async revokeCredentials(tenantId: string, integration: string): Promise<void> {
    // Cancel scheduled refresh
    this._scheduler.cancelRefresh(tenantId, integration);

    // Delete from Vault
    await this._vault.deleteCredentials(tenantId, integration);

    logger.info('Revoked OAuth credentials', { tenantId, integration });
  }

  /**
   * Force refresh of OAuth token
   * Used when token is expired or 401 received
   */
  private async _forceRefresh(tenantId: string, integration: string): Promise<void> {
    const creds = await this._vault.getCredentials(tenantId, integration);
    const tokenResponse = await this._performRefresh(integration, creds.refreshToken);

    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    const newCreds: OAuthCredentials = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || creds.refreshToken,
      expiresAt,
      scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : creds.scopes,
      tokenType: tokenResponse.token_type,
      integration
    };

    await this._vault.storeCredentials(tenantId, integration, newCreds);
    this._scheduler.scheduleRefresh(tenantId, integration, expiresAt);

    logger.info('Forced OAuth token refresh', { tenantId, integration, expiresAt });
  }

  /**
   * Perform OAuth token refresh with provider
   */
  private async _performRefresh(
    integration: string,
    refreshToken: string
  ): Promise<OAuthTokenResponse> {
    const config = this._oauthConfigs.get(integration);

    if (!config) {
      throw new OAuthError(
        `No OAuth config found for integration: ${integration}`,
        integration,
        'unknown'
      );
    }

    try {
      // Use HTTP Basic Auth for client credentials (RFC 6749 Section 2.3.1)
      // This is more secure than sending client_secret in POST body
      const basicAuth = Buffer.from(
        `${config.clientId}:${config.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        config.tokenEndpoint,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('OAuth token refresh failed', {
        integration,
        status: error.response?.status,
        error: error.message
      });

      throw new TokenRefreshError(
        `OAuth refresh failed: ${error.message}`,
        integration,
        'unknown',
        error.response?.status !== 400, // Retryable unless bad request
        error
      );
    }
  }

  /**
   * Set up event listeners for scheduler
   */
  private _setupEventListeners(): void {
    this._scheduler.on('refresh-success', ({ tenantId, integration, expiresAt }) => {
      logger.info('Scheduled refresh succeeded', { tenantId, integration, expiresAt });
    });

    this._scheduler.on('refresh-failed', ({ tenantId, integration, error }) => {
      logger.error('Scheduled refresh failed', { tenantId, integration, error });
    });

    this._scheduler.on('refresh-retry', ({ tenantId, integration, retryCount }) => {
      logger.warn('Scheduled refresh retry', { tenantId, integration, retryCount });
    });
  }

  /**
   * Initialize OAuth proxy
   */
  async initialize(): Promise<void> {
    logger.info('Initializing OAuth proxy');
    await this._vault.healthCheck();
    await this._scheduler.start();
    logger.info('OAuth proxy initialized');
  }

  /**
   * Health check for readiness probe
   */
  async healthCheck(): Promise<boolean> {
    try {
      const vaultHealthy = await this._vault.healthCheck();
      return vaultHealthy;
    } catch (error) {
      logger.error('OAuthProxy health check failed', { error });
      return false;
    }
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    logger.info('Closing OAuth proxy');
    await this._scheduler.stop();
  }
}
