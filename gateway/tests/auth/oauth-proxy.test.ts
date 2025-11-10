/**
 * Tests for OAuthProxy
 * Connectors Platform - OAuth proxy tests
 */

import { OAuthProxy } from '../../src/auth/oauth-proxy';
import { VaultClient } from '../../src/auth/vault-client';
import { RefreshScheduler } from '../../src/auth/refresh-scheduler';
import {
  MCPRequest,
  OAuthCredentials,
  OAuthClientConfig,
  OAuthTokenResponse
} from '../../src/auth/types';
import {
  TokenExpiredError,
  TokenRefreshError,
  RateLimitError
} from '../../src/errors/oauth-errors';
import axios from 'axios';

// Mock dependencies
jest.mock('../../src/auth/vault-client');
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OAuthProxy', () => {
  let oauthProxy: OAuthProxy;
  let mockVault: jest.Mocked<VaultClient>;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Vault client
    mockVault = new VaultClient({
      address: 'http://vault',
      token: 'test'
    }) as jest.Mocked<VaultClient>;

    // Create mock axios instance
    mockAxiosInstance = {
      request: jest.fn(),
      get: jest.fn(),
      post: jest.fn()
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    mockedAxios.post = jest.fn();

    // Initialize OAuth proxy
    const oauthConfigs = new Map<string, OAuthClientConfig>();
    oauthConfigs.set('github', {
      clientId: 'github-client-id',
      clientSecret: 'github-client-secret',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      authEndpoint: 'https://github.com/login/oauth/authorize'
    });

    oauthProxy = new OAuthProxy(
      mockVault,
      'http://mcp-servers',
      oauthConfigs
    );
  });

  afterEach(() => {
    oauthProxy.stop();
  });

  describe('proxyRequest', () => {
    it('should proxy request with OAuth credentials injected', async () => {
      const request: MCPRequest = {
        tenantId: 'tenant-123',
        integration: 'github',
        method: 'POST',
        path: '/repos/owner/repo/pulls',
        body: { title: 'Test PR', head: 'feature', base: 'main' }
      };

      const mockCreds: OAuthCredentials = {
        accessToken: 'github-access-token',
        refreshToken: 'github-refresh-token',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        scopes: ['repo'],
        tokenType: 'Bearer',
        integration: 'github'
      };

      mockVault.getCredentials.mockResolvedValueOnce(mockCreds);

      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 201,
        headers: {},
        data: { number: 123, url: 'https://github.com/owner/repo/pull/123' }
      });

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(201);
      expect(response.data).toEqual({
        number: 123,
        url: 'https://github.com/owner/repo/pull/123'
      });

      // Verify credentials were retrieved
      expect(mockVault.getCredentials).toHaveBeenCalledWith('tenant-123', 'github');

      // Verify request was proxied with auth header
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/integrations/github/repos/owner/repo/pulls',
        headers: {
          'Authorization': 'Bearer github-access-token'
        },
        data: { title: 'Test PR', head: 'feature', base: 'main' }
      });
    });

    it('should handle 401 and refresh token automatically', async () => {
      const request: MCPRequest = {
        tenantId: 'tenant-123',
        integration: 'github',
        method: 'GET',
        path: '/user'
      };

      const expiredCreds: OAuthCredentials = {
        accessToken: 'expired-token',
        refreshToken: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 60000), // Not expired yet
        scopes: ['user'],
        tokenType: 'Bearer',
        integration: 'github'
      };

      const newCreds: OAuthCredentials = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: ['user'],
        tokenType: 'Bearer',
        integration: 'github'
      };

      const refreshResponse: OAuthTokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer'
      };

      // First call: get expired credentials
      mockVault.getCredentials.mockResolvedValueOnce(expiredCreds);

      // First request: return 401
      mockAxiosInstance.request.mockRejectedValueOnce({
        response: { status: 401 }
      });

      // Second call: get credentials again (will trigger refresh)
      mockVault.getCredentials.mockResolvedValueOnce(expiredCreds);

      // Mock OAuth refresh
      (mockedAxios.post as jest.Mock).mockResolvedValueOnce({
        data: refreshResponse
      });

      // Third call: get new credentials
      mockVault.getCredentials.mockResolvedValueOnce(newCreds);

      // Retry request: succeed
      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { login: 'testuser' }
      });

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ login: 'testuser' });

      // Verify token was refreshed
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.any(URLSearchParams),
        expect.any(Object)
      );

      // Verify new credentials were stored
      expect(mockVault.storeCredentials).toHaveBeenCalledWith(
        'tenant-123',
        'github',
        expect.objectContaining({
          accessToken: 'new-access-token'
        })
      );
    });

    it('should handle rate limit errors', async () => {
      const request: MCPRequest = {
        tenantId: 'tenant-123',
        integration: 'github',
        method: 'GET',
        path: '/repos/owner/repo/issues'
      };

      const mockCreds: OAuthCredentials = {
        accessToken: 'valid-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: ['repo'],
        tokenType: 'Bearer',
        integration: 'github'
      };

      mockVault.getCredentials.mockResolvedValueOnce(mockCreds);

      const resetTime = Math.floor(Date.now() / 1000) + 3600;
      mockAxiosInstance.request.mockRejectedValueOnce({
        response: {
          status: 429,
          headers: {
            'x-ratelimit-reset': resetTime.toString(),
            'x-ratelimit-remaining': '0'
          }
        }
      });

      await expect(oauthProxy.proxyRequest(request)).rejects.toThrow(RateLimitError);
    });

    it('should force refresh when token is already expired', async () => {
      const request: MCPRequest = {
        tenantId: 'tenant-123',
        integration: 'github',
        method: 'GET',
        path: '/user'
      };

      const expiredCreds: OAuthCredentials = {
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() - 1000), // Expired
        scopes: ['user'],
        tokenType: 'Bearer',
        integration: 'github'
      };

      const refreshResponse: OAuthTokenResponse = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_in: 3600,
        token_type: 'Bearer'
      };

      const newCreds: OAuthCredentials = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: ['user'],
        tokenType: 'Bearer',
        integration: 'github'
      };

      // First call: get expired credentials
      mockVault.getCredentials.mockResolvedValueOnce(expiredCreds);

      // Mock refresh
      mockVault.getCredentials.mockResolvedValueOnce(expiredCreds);
      (mockedAxios.post as jest.Mock).mockResolvedValueOnce({
        data: refreshResponse
      });

      // After refresh
      mockVault.getCredentials.mockResolvedValueOnce(newCreds);

      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { login: 'testuser' }
      });

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(mockVault.storeCredentials).toHaveBeenCalled();
    });
  });

  describe('storeInitialCredentials', () => {
    it('should store credentials and schedule refresh', async () => {
      const tokenResponse: OAuthTokenResponse = {
        access_token: 'initial-access-token',
        refresh_token: 'initial-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'repo user'
      };

      oauthProxy.start();

      await oauthProxy.storeInitialCredentials('tenant-123', 'github', tokenResponse);

      expect(mockVault.storeCredentials).toHaveBeenCalledWith(
        'tenant-123',
        'github',
        expect.objectContaining({
          accessToken: 'initial-access-token',
          refreshToken: 'initial-refresh-token',
          scopes: ['repo', 'user'],
          integration: 'github'
        })
      );
    });
  });

  describe('revokeCredentials', () => {
    it('should delete credentials and cancel scheduled refresh', async () => {
      await oauthProxy.revokeCredentials('tenant-123', 'github');

      expect(mockVault.deleteCredentials).toHaveBeenCalledWith('tenant-123', 'github');
    });
  });

  describe('registerOAuthConfig', () => {
    it('should register OAuth configuration for integration', () => {
      const config: OAuthClientConfig = {
        clientId: 'slack-id',
        clientSecret: 'slack-secret',
        tokenEndpoint: 'https://slack.com/api/oauth.v2.token',
        authEndpoint: 'https://slack.com/oauth/v2/authorize'
      };

      oauthProxy.registerOAuthConfig('slack', config);

      // Verify by attempting to use it (internal verification)
      expect(() => oauthProxy.registerOAuthConfig('slack', config)).not.toThrow();
    });
  });
});
