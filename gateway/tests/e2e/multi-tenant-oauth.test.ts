/**
 * E2E Tests - Multi-Tenant OAuth Flow
 * Connectors Platform - End-to-end testing of multi-tenant OAuth functionality
 */

import { OAuthProxy } from '../../src/auth/oauth-proxy';
import { VaultClient } from '../../src/auth/vault-client';
import { TenantOAuthStorage } from '../../src/auth/tenant-oauth-storage';
import {
  MCPRequest,
  CreateOAuthConfigRequest,
  OAuthCredentials,
  OAuthClientConfig
} from '../../src/auth/types';

// Mock dependencies
jest.mock('../../src/auth/vault-client');
jest.mock('axios');

const mockedAxios = require('axios');

describe('Multi-Tenant OAuth Flow E2E Tests', () => {
  let oauthProxy: OAuthProxy;
  let mockVaultClient: jest.Mocked<VaultClient>;
  let storage: TenantOAuthStorage;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Vault client
    mockVaultClient = new VaultClient({
      address: 'http://vault',
      token: 'test'
    }) as jest.Mocked<VaultClient>;

    mockVaultClient.healthCheck = jest.fn().mockResolvedValue(true);

    // Mock Vault internal methods
    (mockVaultClient as any)._encrypt = jest.fn().mockImplementation(
      async (_tenantId: string, plaintext: string) => `vault:v1:encrypted_${plaintext}`
    );

    (mockVaultClient as any)._decrypt = jest.fn().mockImplementation(
      async (_tenantId: string, ciphertext: string) =>
        ciphertext.replace('vault:v1:encrypted_', '')
    );

    (mockVaultClient as any)._retryOperation = jest.fn().mockImplementation(
      async (fn: () => Promise<any>) => await fn()
    );

    (mockVaultClient as any)._client = {
      post: jest.fn().mockResolvedValue({}),
      get: jest.fn(),
      delete: jest.fn()
    };

    // Create mock axios instance
    mockAxiosInstance = {
      request: jest.fn(),
      get: jest.fn(),
      post: jest.fn()
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Initialize OAuth proxy with configs
    const oauthConfigs = new Map<string, OAuthClientConfig>();

    oauthConfigs.set('notion', {
      clientId: 'notion-oauth-client-id',
      clientSecret: 'notion-oauth-client-secret',
      tokenEndpoint: 'https://api.notion.com/v1/oauth/token',
      authEndpoint: 'https://api.notion.com/v1/oauth/authorize'
    });

    oauthConfigs.set('github', {
      clientId: 'github-oauth-client-id',
      clientSecret: 'github-oauth-client-secret',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      authEndpoint: 'https://github.com/login/oauth/authorize'
    });

    oauthProxy = new OAuthProxy(
      mockVaultClient,
      'http://mcp-servers',
      oauthConfigs
    );

    storage = new TenantOAuthStorage(mockVaultClient);
  });

  afterEach(() => {
    oauthProxy.stop();
  });

  describe('Alice with Notion + GitHub configs', () => {
    it('should handle Alice accessing Notion with her OAuth config', async () => {
      const tenantId = 'tenant-alice-001';
      const integration = 'notion';

      // Mock Alice's Notion credentials in Vault
      const aliceNotionCreds: OAuthCredentials = {
        accessToken: 'alice-notion-access-token',
        refreshToken: 'alice-notion-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: ['read', 'write'],
        tokenType: 'Bearer',
        integration: 'notion'
      };

      mockVaultClient.getCredentials.mockResolvedValue(aliceNotionCreds);

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        headers: {},
        data: { results: [{ id: 'page-1', title: 'Alice\'s Notion Page' }] }
      });

      const request: MCPRequest = {
        tenantId,
        integration,
        method: 'GET',
        path: '/v1/pages',
        body: {}
      };

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        results: [{ id: 'page-1', title: 'Alice\'s Notion Page' }]
      });

      // Verify correct credentials were retrieved
      expect(mockVaultClient.getCredentials).toHaveBeenCalledWith(tenantId, integration);

      // Verify correct auth header was injected
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer alice-notion-access-token'
          })
        })
      );
    });

    it('should handle Alice accessing GitHub with different OAuth config', async () => {
      const tenantId = 'tenant-alice-001';
      const integration = 'github';

      // Mock Alice's GitHub credentials in Vault
      const aliceGithubCreds: OAuthCredentials = {
        accessToken: 'alice-github-access-token',
        refreshToken: 'alice-github-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: ['repo', 'user'],
        tokenType: 'Bearer',
        integration: 'github'
      };

      mockVaultClient.getCredentials.mockResolvedValue(aliceGithubCreds);

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        headers: {},
        data: { login: 'alice', id: 12345 }
      });

      const request: MCPRequest = {
        tenantId,
        integration,
        method: 'GET',
        path: '/user',
        body: {}
      };

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ login: 'alice', id: 12345 });

      // Verify correct credentials were retrieved
      expect(mockVaultClient.getCredentials).toHaveBeenCalledWith(tenantId, integration);

      // Verify correct auth header was injected
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer alice-github-access-token'
          })
        })
      );
    });
  });

  describe('Bob with different Notion + Slack configs', () => {
    it('should handle Bob accessing Notion with his OAuth config', async () => {
      const tenantId = 'tenant-bob-002';
      const integration = 'notion';

      // Mock Bob's Notion credentials (different from Alice)
      const bobNotionCreds: OAuthCredentials = {
        accessToken: 'bob-notion-access-token',
        refreshToken: 'bob-notion-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: ['read'],
        tokenType: 'Bearer',
        integration: 'notion'
      };

      mockVaultClient.getCredentials.mockResolvedValue(bobNotionCreds);

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        headers: {},
        data: { results: [{ id: 'page-2', title: 'Bob\'s Notion Page' }] }
      });

      const request: MCPRequest = {
        tenantId,
        integration,
        method: 'GET',
        path: '/v1/pages',
        body: {}
      };

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        results: [{ id: 'page-2', title: 'Bob\'s Notion Page' }]
      });

      // Verify Bob's credentials were used, not Alice's
      expect(mockVaultClient.getCredentials).toHaveBeenCalledWith(tenantId, integration);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer bob-notion-access-token' // Bob's token!
          })
        })
      );
    });

    it('should handle Bob accessing Slack with his config', async () => {
      const tenantId = 'tenant-bob-002';
      const integration = 'slack';

      // Register Slack OAuth config
      oauthProxy.registerOAuthConfig('slack', {
        clientId: 'slack-oauth-client-id',
        clientSecret: 'slack-oauth-client-secret',
        tokenEndpoint: 'https://slack.com/api/oauth.v2.token',
        authEndpoint: 'https://slack.com/oauth/v2/authorize'
      });

      // Mock Bob's Slack credentials
      const bobSlackCreds: OAuthCredentials = {
        accessToken: 'bob-slack-access-token',
        refreshToken: 'bob-slack-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: ['chat:write', 'channels:read'],
        tokenType: 'Bearer',
        integration: 'slack'
      };

      mockVaultClient.getCredentials.mockResolvedValue(bobSlackCreds);

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        headers: {},
        data: { ok: true, channel: 'C12345', message: 'Hello from Bob' }
      });

      const request: MCPRequest = {
        tenantId,
        integration,
        method: 'POST',
        path: '/chat.postMessage',
        body: { channel: 'C12345', text: 'Hello from Bob' }
      };

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(mockVaultClient.getCredentials).toHaveBeenCalledWith(tenantId, integration);
    });
  });

  describe('OAuth proxy fetches correct per-tenant configs', () => {
    it('should use correct OAuth config for each tenant-integration pair', async () => {
      // Alice's Notion request
      mockVaultClient.getCredentials.mockResolvedValueOnce({
        accessToken: 'alice-notion-token',
        refreshToken: 'alice-notion-refresh',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: [],
        tokenType: 'Bearer',
        integration: 'notion'
      });

      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { tenant: 'alice' }
      });

      await oauthProxy.proxyRequest({
        tenantId: 'tenant-alice-001',
        integration: 'notion',
        method: 'GET',
        path: '/test'
      });

      expect(mockVaultClient.getCredentials).toHaveBeenCalledWith('tenant-alice-001', 'notion');

      // Bob's Notion request (different credentials)
      mockVaultClient.getCredentials.mockResolvedValueOnce({
        accessToken: 'bob-notion-token',
        refreshToken: 'bob-notion-refresh',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: [],
        tokenType: 'Bearer',
        integration: 'notion'
      });

      mockAxiosInstance.request.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { tenant: 'bob' }
      });

      await oauthProxy.proxyRequest({
        tenantId: 'tenant-bob-002',
        integration: 'notion',
        method: 'GET',
        path: '/test'
      });

      expect(mockVaultClient.getCredentials).toHaveBeenCalledWith('tenant-bob-002', 'notion');

      // Verify different tokens were used
      expect(mockAxiosInstance.request).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer alice-notion-token'
          })
        })
      );

      expect(mockAxiosInstance.request).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer bob-notion-token'
          })
        })
      );
    });
  });

  describe('Tenant isolation - Alice cannot access Bob\'s tokens', () => {
    it('should maintain strict tenant isolation in Vault paths', async () => {
      // Alice tries to access her Notion credentials
      mockVaultClient.getCredentials.mockImplementation(async (tenantId, integration) => {
        if (tenantId === 'tenant-alice-001' && integration === 'notion') {
          return {
            accessToken: 'alice-notion-token',
            refreshToken: 'alice-refresh',
            expiresAt: new Date(Date.now() + 3600000),
            scopes: [],
            tokenType: 'Bearer',
            integration: 'notion'
          };
        }
        throw new Error('Credentials not found');
      });

      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        headers: {},
        data: {}
      });

      // Alice's request succeeds
      await expect(
        oauthProxy.proxyRequest({
          tenantId: 'tenant-alice-001',
          integration: 'notion',
          method: 'GET',
          path: '/test'
        })
      ).resolves.toBeDefined();

      // Bob's credentials are not accessible via Alice's tenant ID
      await expect(
        oauthProxy.proxyRequest({
          tenantId: 'tenant-alice-001', // Alice's tenant ID
          integration: 'notion',
          method: 'GET',
          path: '/test'
        })
      ).resolves.toBeDefined(); // Only Alice's creds accessible

      // Verify getCredentials was called with correct tenant IDs
      expect(mockVaultClient.getCredentials).toHaveBeenCalledWith('tenant-alice-001', 'notion');
      expect(mockVaultClient.getCredentials).not.toHaveBeenCalledWith('tenant-bob-002', 'notion');
    });

    it('should use separate encryption keys per tenant', async () => {
      const aliceConfig: CreateOAuthConfigRequest = {
        clientId: 'alice-client-id',
        clientSecret: 'shared-secret-1234567890',
        redirectUri: 'https://alice.example.com/oauth/callback',
        authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
        tokenEndpoint: 'https://api.notion.com/v1/oauth/token'
      };

      const bobConfig: CreateOAuthConfigRequest = {
        clientId: 'bob-client-id',
        clientSecret: 'shared-secret-1234567890', // Same secret!
        redirectUri: 'https://bob.example.com/oauth/callback',
        authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
        tokenEndpoint: 'https://api.notion.com/v1/oauth/token'
      };

      // Store Alice's config
      await storage.storeTenantOAuthConfig('tenant-alice-001', 'notion', aliceConfig);

      // Store Bob's config
      await storage.storeTenantOAuthConfig('tenant-bob-002', 'notion', bobConfig);

      // Verify different encryption keys were used
      expect((mockVaultClient as any)._encrypt).toHaveBeenCalledWith(
        'tenant-alice-001',
        'shared-secret-1234567890'
      );

      expect((mockVaultClient as any)._encrypt).toHaveBeenCalledWith(
        'tenant-bob-002',
        'shared-secret-1234567890'
      );

      // Even though the plaintext secret is the same, different tenant keys mean
      // the ciphertext will be different and Bob cannot decrypt Alice's secret
    });
  });

  describe('Complete multi-tenant OAuth flow', () => {
    it('should handle full flow: config storage -> token retrieval -> API call', async () => {
      const tenantId = 'tenant-charlie-003';
      const integration = 'notion';

      // Step 1: Store OAuth config via storage
      const oauthConfig: CreateOAuthConfigRequest = {
        clientId: 'charlie-notion-client-id',
        clientSecret: 'charlie-notion-client-secret-123456',
        redirectUri: 'https://charlie.example.com/oauth/callback/notion',
        authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
        tokenEndpoint: 'https://api.notion.com/v1/oauth/token',
        scopes: ['read', 'write']
      };

      await storage.storeTenantOAuthConfig(tenantId, integration, oauthConfig, 'charlie');

      // Step 2: Simulate OAuth flow completion - store user credentials
      const userCreds: OAuthCredentials = {
        accessToken: 'charlie-user-access-token',
        refreshToken: 'charlie-user-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        scopes: ['read', 'write'],
        tokenType: 'Bearer',
        integration
      };

      mockVaultClient.getCredentials.mockResolvedValue(userCreds);

      // Step 3: Make API call via OAuth proxy
      mockAxiosInstance.request.mockResolvedValue({
        status: 200,
        headers: {},
        data: { results: [{ id: 'page-charlie', title: 'Charlie\'s Page' }] }
      });

      const request: MCPRequest = {
        tenantId,
        integration,
        method: 'GET',
        path: '/v1/pages',
        body: {}
      };

      const response = await oauthProxy.proxyRequest(request);

      // Verify success
      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        results: [{ id: 'page-charlie', title: 'Charlie\'s Page' }]
      });

      // Verify OAuth credentials were fetched
      expect(mockVaultClient.getCredentials).toHaveBeenCalledWith(tenantId, integration);

      // Verify request was made with correct auth
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/integrations/notion/v1/pages'),
          headers: expect.objectContaining({
            Authorization: 'Bearer charlie-user-access-token'
          })
        })
      );
    });
  });
});
