/**
 * Integration tests for OAuth Flow
 * Tests: Credential Storage → Retrieval → Injection → Refresh → Auto-Rotation
 */

import { OAuthProxy } from '../../src/auth/oauth-proxy';
import { VaultClient } from '../../src/auth/vault-client';
import { RefreshScheduler } from '../../src/auth/refresh-scheduler';
import {
  OAuthCredentials,
  OAuthTokenResponse,
  OAuthClientConfig,
  MCPRequest
} from '../../src/auth/types';
import {
  OAuthError,
  TokenExpiredError,
  TokenRefreshError,
  RateLimitError
} from '../../src/errors/oauth-errors';

// Mock external dependencies
jest.mock('../../src/auth/vault-client');
jest.mock('axios');

const axios = require('axios');

describe('OAuth Flow Integration Tests', () => {
  let oauthProxy: OAuthProxy;
  let mockVault: jest.Mocked<VaultClient>;

  const testTenantId = 'tenant-123';
  const testIntegration = 'github';

  const validCredentials: OAuthCredentials = {
    accessToken: 'valid-access-token',
    refreshToken: 'valid-refresh-token',
    expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
    scopes: ['repo', 'user'],
    tokenType: 'Bearer',
    integration: testIntegration
  };

  const githubOAuthConfig: OAuthClientConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    authEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    scopes: ['repo', 'user']
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock axios.create BEFORE creating OAuthProxy
    const mockAxiosInstance = {
      request: jest.fn().mockResolvedValue({
        status: 200,
        headers: {},
        data: { success: true, pr: { number: 123 } }
      })
    };

    axios.create = jest.fn().mockReturnValue(mockAxiosInstance);

    // Create mock Vault client
    mockVault = new VaultClient({}) as jest.Mocked<VaultClient>;

    mockVault.getCredentials = jest.fn().mockResolvedValue(validCredentials);
    mockVault.storeCredentials = jest.fn().mockResolvedValue(undefined);
    mockVault.deleteCredentials = jest.fn().mockResolvedValue(undefined);

    // Create OAuth proxy (axios.create is already mocked)
    oauthProxy = new OAuthProxy(
      mockVault,
      'http://localhost:3000',
      new Map([[testIntegration, githubOAuthConfig]])
    );

    oauthProxy.start();
  });

  afterEach(() => {
    oauthProxy.stop();
  });

  describe('Full OAuth Flow: Store → Retrieve → Inject', () => {
    it('should complete full OAuth flow for MCP request', async () => {
      // axios.create is already mocked in beforeEach

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: testIntegration,
        method: 'POST',
        path: '/pulls',
        headers: {},
        body: {
          title: 'Test PR',
          head: 'feature',
          base: 'main'
        }
      };

      const response = await oauthProxy.proxyRequest(request);

      // Verify credentials retrieved from Vault
      expect(mockVault.getCredentials).toHaveBeenCalledWith(
        testTenantId,
        testIntegration
      );

      // Verify successful response
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      // Verify auth header was injected
      const mcpClientMock = (oauthProxy as any)._mcpClient;
      expect(mcpClientMock.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${validCredentials.accessToken}`
          })
        })
      );
    });

    it('should store initial credentials and schedule refresh', async () => {
      const tokenResponse: OAuthTokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        scope: 'repo user',
        token_type: 'Bearer'
      };

      await oauthProxy.storeInitialCredentials(
        testTenantId,
        testIntegration,
        tokenResponse
      );

      // Verify stored in Vault
      expect(mockVault.storeCredentials).toHaveBeenCalledWith(
        testTenantId,
        testIntegration,
        expect.objectContaining({
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          scopes: ['repo', 'user'],
          tokenType: 'Bearer'
        })
      );

      // Verify refresh scheduled
      const scheduler = (oauthProxy as any)._scheduler as RefreshScheduler;
      expect(scheduler).toBeDefined();
    });
  });

  describe('Token Refresh Scenarios', () => {
    it('should handle 401 and automatically refresh token', async () => {
      // First request: 401 Unauthorized
      const mcpClientMock = {
        request: jest.fn()
          .mockRejectedValueOnce({
            response: { status: 401 }
          })
          .mockResolvedValueOnce({
            status: 200,
            headers: {},
            data: { success: true }
          })
      };

      axios.create = jest.fn().mockReturnValue(mcpClientMock);

      // Mock token refresh
      axios.post = jest.fn().mockResolvedValue({
        data: {
          access_token: 'refreshed-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'repo user'
        }
      });

      // Recreate proxy with new axios mock
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[testIntegration, githubOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: testIntegration,
        method: 'GET',
        path: '/user',
        headers: {},
        body: {}
      };

      const response = await oauthProxy.proxyRequest(request);

      // Verify refresh was called
      expect(axios.post).toHaveBeenCalledWith(
        githubOAuthConfig.tokenEndpoint,
        expect.any(URLSearchParams),
        expect.any(Object)
      );

      // Verify new credentials stored
      expect(mockVault.storeCredentials).toHaveBeenCalledWith(
        testTenantId,
        testIntegration,
        expect.objectContaining({
          accessToken: 'refreshed-access-token'
        })
      );

      // Verify retry succeeded
      expect(response.status).toBe(200);
      expect(mcpClientMock.request).toHaveBeenCalledTimes(2); // Original + retry
    });

    it('should handle expired token before request', async () => {
      // Token already expired
      const expiredCredentials: OAuthCredentials = {
        ...validCredentials,
        expiresAt: new Date(Date.now() - 1000) // 1 second ago
      };

      mockVault.getCredentials = jest.fn().mockResolvedValue(expiredCredentials);

      // Mock refresh
      axios.post = jest.fn().mockResolvedValue({
        data: {
          access_token: 'refreshed-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'repo user'
        }
      });

      axios.create = jest.fn().mockReturnValue({
        request: jest.fn().mockResolvedValue({
          status: 200,
          headers: {},
          data: { success: true }
        })
      });

      // Recreate proxy
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[testIntegration, githubOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: testIntegration,
        method: 'GET',
        path: '/user',
        headers: {},
        body: {}
      };

      const response = await oauthProxy.proxyRequest(request);

      // Verify refresh was triggered
      expect(axios.post).toHaveBeenCalled();

      // Verify new credentials stored
      expect(mockVault.storeCredentials).toHaveBeenCalledWith(
        testTenantId,
        testIntegration,
        expect.objectContaining({
          accessToken: 'refreshed-token'
        })
      );

      expect(response.status).toBe(200);
    });

    it('should fail after retry limit on 401', async () => {
      const mcpClientMock = {
        request: jest.fn().mockRejectedValue({
          response: { status: 401 }
        })
      };

      axios.create = jest.fn().mockReturnValue(mcpClientMock);

      axios.post = jest.fn().mockResolvedValue({
        data: {
          access_token: 'new-token',
          refresh_token: 'new-refresh',
          expires_in: 3600,
          token_type: 'Bearer'
        }
      });

      // Recreate proxy
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[testIntegration, githubOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: testIntegration,
        method: 'GET',
        path: '/user',
        headers: {},
        body: {}
      };

      await expect(oauthProxy.proxyRequest(request))
        .rejects.toThrow(TokenExpiredError);

      // Should have retried once
      expect(mcpClientMock.request).toHaveBeenCalledTimes(2);
    });

    it('should handle refresh token failure', async () => {
      const expiredCredentials: OAuthCredentials = {
        ...validCredentials,
        expiresAt: new Date(Date.now() - 1000)
      };

      mockVault.getCredentials = jest.fn().mockResolvedValue(expiredCredentials);

      // Mock refresh failure
      axios.post = jest.fn().mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'invalid_grant' }
        },
        message: 'Bad Request'
      });

      axios.create = jest.fn().mockReturnValue({
        request: jest.fn().mockResolvedValue({ status: 200 })
      });

      // Recreate proxy
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[testIntegration, githubOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: testIntegration,
        method: 'GET',
        path: '/user',
        headers: {},
        body: {}
      };

      await expect(oauthProxy.proxyRequest(request))
        .rejects.toThrow(TokenExpiredError);
    });
  });

  describe('Rate Limit Handling', () => {
    it('should detect and throw RateLimitError on 429', async () => {
      const resetTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      const mcpClientMock = {
        request: jest.fn().mockRejectedValue({
          response: {
            status: 429,
            headers: {
              'x-ratelimit-reset': resetTime.toString(),
              'x-ratelimit-remaining': '0'
            }
          }
        })
      };

      axios.create = jest.fn().mockReturnValue(mcpClientMock);

      // Recreate proxy
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[testIntegration, githubOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: testIntegration,
        method: 'GET',
        path: '/user',
        headers: {},
        body: {}
      };

      try {
        await oauthProxy.proxyRequest(request);
        fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.resetTime).toBe(resetTime);
          expect(error.remaining).toBe(0);
        }
      }
    });
  });

  describe('Credential Lifecycle Management', () => {
    it('should revoke credentials and cancel refresh', async () => {
      await oauthProxy.revokeCredentials(testTenantId, testIntegration);

      // Verify deleted from Vault
      expect(mockVault.deleteCredentials).toHaveBeenCalledWith(
        testTenantId,
        testIntegration
      );

      // Verify refresh canceled
      const scheduler = (oauthProxy as any)._scheduler as RefreshScheduler;
      expect(scheduler).toBeDefined();
    });

    it('should handle multiple OAuth configs for different integrations', async () => {
      const slackConfig: OAuthClientConfig = {
        clientId: 'slack-client-id',
        clientSecret: 'slack-client-secret',
        authEndpoint: 'https://slack.com/oauth/v2/authorize',
        tokenEndpoint: 'https://slack.com/api/oauth.v2.access',
        scopes: ['chat:write', 'channels:read']
      };

      oauthProxy.registerOAuthConfig('slack', slackConfig);

      const slackCredentials: OAuthCredentials = {
        accessToken: 'slack-access-token',
        refreshToken: 'slack-refresh-token',
        expiresAt: new Date(Date.now() + 3600 * 1000),
        scopes: ['chat:write', 'channels:read'],
        tokenType: 'Bearer',
        integration: 'slack'
      };

      mockVault.getCredentials = jest.fn()
        .mockResolvedValueOnce(validCredentials) // GitHub
        .mockResolvedValueOnce(slackCredentials); // Slack

      axios.create = jest.fn().mockReturnValue({
        request: jest.fn().mockResolvedValue({
          status: 200,
          headers: {},
          data: { ok: true }
        })
      });

      // Recreate proxy with both configs
      const configMap = new Map([
        [testIntegration, githubOAuthConfig],
        ['slack', slackConfig]
      ]);

      oauthProxy = new OAuthProxy(mockVault, 'http://localhost:3000', configMap);
      oauthProxy.start();

      // Request for GitHub
      await oauthProxy.proxyRequest({
        tenantId: testTenantId,
        integration: 'github',
        method: 'GET',
        path: '/user',
        headers: {},
        body: {}
      });

      // Request for Slack
      await oauthProxy.proxyRequest({
        tenantId: testTenantId,
        integration: 'slack',
        method: 'POST',
        path: '/chat.postMessage',
        headers: {},
        body: { channel: 'general', text: 'Hello' }
      });

      expect(mockVault.getCredentials).toHaveBeenCalledWith(testTenantId, 'github');
      expect(mockVault.getCredentials).toHaveBeenCalledWith(testTenantId, 'slack');
    });
  });

  describe('Error Handling', () => {
    it('should throw OAuthError on network failure', async () => {
      const mcpClientMock = {
        request: jest.fn().mockRejectedValue(new Error('Network error'))
      };

      axios.create = jest.fn().mockReturnValue(mcpClientMock);

      // Recreate proxy
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[testIntegration, githubOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: testIntegration,
        method: 'GET',
        path: '/user',
        headers: {},
        body: {}
      };

      await expect(oauthProxy.proxyRequest(request))
        .rejects.toThrow(OAuthError);
    });

    it('should throw OAuthError when config not found', async () => {
      const expiredCreds = {
        ...validCredentials,
        expiresAt: new Date(Date.now() - 1000)
      };

      mockVault.getCredentials = jest.fn().mockResolvedValue(expiredCreds);

      // Proxy without config for integration
      const emptyProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map() // No configs
      );
      emptyProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: 'unknown-integration',
        method: 'GET',
        path: '/test',
        headers: {},
        body: {}
      };

      await expect(emptyProxy.proxyRequest(request))
        .rejects.toThrow(OAuthError);

      emptyProxy.stop();
    });
  });
});
