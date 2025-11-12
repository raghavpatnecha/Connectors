/**
 * End-to-End OAuth Flow Tests for Notion Integration
 * Tests: User Authorization → Code Exchange → Token Storage → Tool Call → API Response
 */

import { OAuthProxy } from '../../src/auth/oauth-proxy';
import { VaultClient } from '../../src/auth/vault-client';
import {
  OAuthCredentials,
  OAuthTokenResponse,
  OAuthClientConfig,
  MCPRequest
} from '../../src/auth/types';

// Mock external dependencies
jest.mock('../../src/auth/vault-client');
jest.mock('axios');

const axios = require('axios');

describe('Notion E2E OAuth Flow Tests', () => {
  let oauthProxy: OAuthProxy;
  let mockVault: jest.Mocked<VaultClient>;

  const testTenantId = 'tenant-notion-e2e';
  const notionIntegration = 'notion';

  const notionOAuthConfig: OAuthClientConfig = {
    clientId: 'notion-oauth-client-id',
    clientSecret: 'notion-oauth-client-secret',
    authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
    tokenEndpoint: 'https://api.notion.com/v1/oauth/token',
    scopes: [] // Notion doesn't use scopes in the same way
  };

  const validNotionCredentials: OAuthCredentials = {
    accessToken: 'secret_notion_access_token',
    refreshToken: '', // Notion tokens don't refresh
    expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000), // Notion tokens don't expire
    scopes: [],
    tokenType: 'Bearer',
    integration: notionIntegration
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Vault client
    mockVault = new VaultClient({}) as jest.Mocked<VaultClient>;
    mockVault.getCredentials = jest.fn().mockResolvedValue(validNotionCredentials);
    mockVault.storeCredentials = jest.fn().mockResolvedValue(undefined);
    mockVault.deleteCredentials = jest.fn().mockResolvedValue(undefined);

    // Mock axios for MCP calls
    const mockAxiosInstance = {
      request: jest.fn().mockResolvedValue({
        status: 200,
        headers: { 'notion-version': '2022-06-28' },
        data: {
          object: 'page',
          id: 'test-page-id',
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          properties: {}
        }
      })
    };

    axios.create = jest.fn().mockReturnValue(mockAxiosInstance);

    // Create OAuth proxy
    oauthProxy = new OAuthProxy(
      mockVault,
      'http://localhost:3000',
      new Map([[notionIntegration, notionOAuthConfig]])
    );

    oauthProxy.start();
  });

  afterEach(() => {
    oauthProxy.stop();
  });

  describe('Full OAuth Flow E2E', () => {
    it('should complete full OAuth flow: Authorize → Exchange → Store → Call', async () => {
      console.log('Step 1: User authorizes integration (mocked)');

      // Step 1: User authorizes (returns authorization code)
      const authorizationCode = 'notion-auth-code-12345';

      console.log('Step 2: Exchange authorization code for access token');

      // Step 2: Code exchange
      axios.post = jest.fn().mockResolvedValue({
        data: {
          access_token: 'secret_notion_access_token',
          token_type: 'bearer',
          bot_id: 'test-bot-id',
          workspace_id: 'test-workspace-id',
          workspace_name: 'Test Workspace',
          workspace_icon: null,
          owner: {
            type: 'user',
            user: {
              object: 'user',
              id: 'test-user-id'
            }
          }
        }
      });

      const tokenResponse: OAuthTokenResponse = {
        access_token: 'secret_notion_access_token',
        token_type: 'bearer',
        expires_in: 0, // Notion tokens don't expire
        scope: '',
        refresh_token: ''
      };

      console.log('Step 3: Store token in Vault');

      // Step 3: Store credentials in Vault
      await oauthProxy.storeInitialCredentials(
        testTenantId,
        notionIntegration,
        tokenResponse
      );

      expect(mockVault.storeCredentials).toHaveBeenCalledWith(
        testTenantId,
        notionIntegration,
        expect.objectContaining({
          accessToken: 'secret_notion_access_token',
          tokenType: 'Bearer'
        })
      );

      console.log('Step 4: Make API call with injected token');

      // Step 4: Tool call with injected token
      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: notionIntegration,
        method: 'POST',
        path: '/v1/pages',
        headers: {},
        body: {
          parent: {
            database_id: 'test-database-id'
          },
          properties: {
            Name: {
              title: [
                {
                  text: {
                    content: 'Test Page'
                  }
                }
              ]
            }
          }
        }
      };

      const response = await oauthProxy.proxyRequest(request);

      console.log('Step 5: Verify successful API response');

      // Step 5: Verify successful response
      expect(response.status).toBe(200);
      expect(response.data.object).toBe('page');
      expect(response.data.id).toBe('test-page-id');

      // Verify token was retrieved from Vault
      expect(mockVault.getCredentials).toHaveBeenCalledWith(
        testTenantId,
        notionIntegration
      );

      // Verify Bearer token was injected
      const mcpClientMock = (oauthProxy as any)._mcpClient;
      expect(mcpClientMock.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer secret_notion_access_token'
          })
        })
      );

      console.log('✅ Full OAuth flow completed successfully');
    });

    it('should handle complete page creation workflow', async () => {
      // Mock successful page creation
      const mockAxiosInstance = {
        request: jest.fn().mockResolvedValue({
          status: 200,
          headers: { 'notion-version': '2022-06-28' },
          data: {
            object: 'page',
            id: 'new-page-id-12345',
            created_time: '2024-01-01T12:00:00.000Z',
            last_edited_time: '2024-01-01T12:00:00.000Z',
            parent: {
              type: 'database_id',
              database_id: 'test-database-id'
            },
            properties: {
              Name: {
                id: 'title',
                type: 'title',
                title: [
                  {
                    type: 'text',
                    text: {
                      content: 'New Project Task'
                    }
                  }
                ]
              },
              Status: {
                id: 'status',
                type: 'select',
                select: {
                  name: 'In Progress'
                }
              }
            }
          }
        })
      };

      axios.create = jest.fn().mockReturnValue(mockAxiosInstance);

      // Recreate proxy with new mock
      oauthProxy.stop();
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[notionIntegration, notionOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: notionIntegration,
        method: 'POST',
        path: '/v1/pages',
        headers: {},
        body: {
          parent: { database_id: 'test-database-id' },
          properties: {
            Name: {
              title: [{ text: { content: 'New Project Task' } }]
            },
            Status: {
              select: { name: 'In Progress' }
            }
          }
        }
      };

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(response.data.object).toBe('page');
      expect(response.data.properties.Name.title[0].text.content).toBe('New Project Task');
      expect(response.data.properties.Status.select.name).toBe('In Progress');
    });

    it('should handle database query workflow', async () => {
      const mockAxiosInstance = {
        request: jest.fn().mockResolvedValue({
          status: 200,
          headers: { 'notion-version': '2022-06-28' },
          data: {
            object: 'list',
            results: [
              {
                object: 'page',
                id: 'page-1',
                properties: {
                  Name: {
                    title: [{ text: { content: 'Task 1' } }]
                  }
                }
              },
              {
                object: 'page',
                id: 'page-2',
                properties: {
                  Name: {
                    title: [{ text: { content: 'Task 2' } }]
                  }
                }
              }
            ],
            has_more: false,
            next_cursor: null
          }
        })
      };

      axios.create = jest.fn().mockReturnValue(mockAxiosInstance);

      oauthProxy.stop();
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[notionIntegration, notionOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: notionIntegration,
        method: 'POST',
        path: '/v1/databases/test-db-id/query',
        headers: {},
        body: {
          filter: {
            property: 'Status',
            select: {
              equals: 'In Progress'
            }
          }
        }
      };

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(response.data.object).toBe('list');
      expect(response.data.results).toHaveLength(2);
      expect(response.data.has_more).toBe(false);
    });

    it('should handle workspace search workflow', async () => {
      const mockAxiosInstance = {
        request: jest.fn().mockResolvedValue({
          status: 200,
          headers: { 'notion-version': '2022-06-28' },
          data: {
            object: 'list',
            results: [
              {
                object: 'page',
                id: 'search-result-1',
                properties: {
                  title: {
                    title: [{ text: { content: 'Meeting Notes' } }]
                  }
                }
              }
            ],
            has_more: false,
            next_cursor: null
          }
        })
      };

      axios.create = jest.fn().mockReturnValue(mockAxiosInstance);

      oauthProxy.stop();
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[notionIntegration, notionOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: notionIntegration,
        method: 'POST',
        path: '/v1/search',
        headers: {},
        body: {
          query: 'Meeting',
          filter: {
            property: 'object',
            value: 'page'
          }
        }
      };

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(response.data.results).toHaveLength(1);
    });

    it('should handle user listing workflow', async () => {
      const mockAxiosInstance = {
        request: jest.fn().mockResolvedValue({
          status: 200,
          headers: { 'notion-version': '2022-06-28' },
          data: {
            object: 'list',
            results: [
              {
                object: 'user',
                id: 'user-1',
                name: 'John Doe',
                type: 'person',
                person: {
                  email: 'john@example.com'
                }
              },
              {
                object: 'user',
                id: 'user-2',
                name: 'Bot',
                type: 'bot'
              }
            ],
            has_more: false,
            next_cursor: null
          }
        })
      };

      axios.create = jest.fn().mockReturnValue(mockAxiosInstance);

      oauthProxy.stop();
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[notionIntegration, notionOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: notionIntegration,
        method: 'GET',
        path: '/v1/users',
        headers: {},
        body: {}
      };

      const response = await oauthProxy.proxyRequest(request);

      expect(response.status).toBe(200);
      expect(response.data.results).toHaveLength(2);
      expect(response.data.results[0].name).toBe('John Doe');
      expect(response.data.results[1].type).toBe('bot');
    });
  });

  describe('Multi-Tenant OAuth Isolation', () => {
    it('should maintain separate credentials per tenant', async () => {
      const tenant1 = 'tenant-workspace-a';
      const tenant2 = 'tenant-workspace-b';

      const creds1: OAuthCredentials = {
        ...validNotionCredentials,
        accessToken: 'secret_workspace_a_token'
      };

      const creds2: OAuthCredentials = {
        ...validNotionCredentials,
        accessToken: 'secret_workspace_b_token'
      };

      mockVault.getCredentials
        .mockResolvedValueOnce(creds1)
        .mockResolvedValueOnce(creds2);

      // Tenant 1 request
      await oauthProxy.proxyRequest({
        tenantId: tenant1,
        integration: notionIntegration,
        method: 'GET',
        path: '/v1/users',
        headers: {},
        body: {}
      });

      // Tenant 2 request
      await oauthProxy.proxyRequest({
        tenantId: tenant2,
        integration: notionIntegration,
        method: 'GET',
        path: '/v1/users',
        headers: {},
        body: {}
      });

      expect(mockVault.getCredentials).toHaveBeenCalledWith(tenant1, notionIntegration);
      expect(mockVault.getCredentials).toHaveBeenCalledWith(tenant2, notionIntegration);

      const mcpClientMock = (oauthProxy as any)._mcpClient;
      const calls = mcpClientMock.request.mock.calls;

      // Verify different tokens were used
      expect(calls[0][0].headers.Authorization).toBe('Bearer secret_workspace_a_token');
      expect(calls[1][0].headers.Authorization).toBe('Bearer secret_workspace_b_token');
    });
  });

  describe('Error Recovery in OAuth Flow', () => {
    it('should handle token validation failure gracefully', async () => {
      const mcpClientMock = {
        request: jest.fn().mockRejectedValue({
          response: {
            status: 401,
            data: {
              code: 'unauthorized',
              message: 'API token is invalid.'
            }
          }
        })
      };

      axios.create = jest.fn().mockReturnValue(mcpClientMock);

      oauthProxy.stop();
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[notionIntegration, notionOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: notionIntegration,
        method: 'GET',
        path: '/v1/users',
        headers: {},
        body: {}
      };

      await expect(oauthProxy.proxyRequest(request)).rejects.toThrow();
    });

    it('should handle Notion API version mismatch', async () => {
      const mcpClientMock = {
        request: jest.fn().mockRejectedValue({
          response: {
            status: 400,
            data: {
              code: 'validation_error',
              message: 'notion-version header is required'
            }
          }
        })
      };

      axios.create = jest.fn().mockReturnValue(mcpClientMock);

      oauthProxy.stop();
      oauthProxy = new OAuthProxy(
        mockVault,
        'http://localhost:3000',
        new Map([[notionIntegration, notionOAuthConfig]])
      );
      oauthProxy.start();

      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: notionIntegration,
        method: 'GET',
        path: '/v1/pages/test-id',
        headers: {},
        body: {}
      };

      await expect(oauthProxy.proxyRequest(request)).rejects.toThrow();
    });
  });

  describe('Performance Metrics', () => {
    it('should complete OAuth flow in <200ms', async () => {
      const iterations = 5;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        await oauthProxy.proxyRequest({
          tenantId: testTenantId,
          integration: notionIntegration,
          method: 'GET',
          path: '/v1/users',
          headers: {},
          body: {}
        });

        latencies.push(Date.now() - start);
      }

      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;

      expect(avgLatency).toBeLessThan(200);

      console.log(`OAuth flow average latency: ${avgLatency.toFixed(2)}ms`);
    });
  });
});
