/**
 * Integration tests for Notion MCP Integration
 * Tests: Tool Registration → Semantic Routing → OAuth Integration → Error Handling
 */

import { SemanticRouter } from '../../src/routing/semantic-router';
import { EmbeddingService } from '../../src/routing/embedding-service';
import { FAISSIndex } from '../../src/routing/faiss-index';
import { RedisCache } from '../../src/caching/redis-cache';
import { OAuthProxy } from '../../src/auth/oauth-proxy';
import { VaultClient } from '../../src/auth/vault-client';
import {
  QueryContext,
  ToolEmbedding,
  CategoryEmbedding,
  ToolSelection
} from '../../src/types/routing.types';
import { OAuthCredentials, MCPRequest } from '../../src/auth/types';

// Mock external dependencies
jest.mock('../../src/routing/faiss-index');
jest.mock('../../src/routing/embedding-service');
jest.mock('../../src/caching/redis-cache');
jest.mock('../../src/auth/vault-client');
jest.mock('axios');

const axios = require('axios');

describe('Notion MCP Integration Tests', () => {
  let router: SemanticRouter;
  let oauthProxy: OAuthProxy;
  let mockEmbeddingService: jest.Mocked<EmbeddingService>;
  let mockCache: jest.Mocked<RedisCache>;
  let mockVault: jest.Mocked<VaultClient>;

  const testTenantId = 'tenant-notion-test';
  const notionIntegration = 'notion';

  // Mock Notion tools - All 19 tools from Notion API
  const notionTools: ToolEmbedding[] = [
    {
      toolId: 'notion.createPage',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Create Page',
        description: 'Create a new page in Notion workspace',
        usageCount: 950
      }
    },
    {
      toolId: 'notion.retrievePage',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Retrieve Page',
        description: 'Retrieve a Notion page by ID',
        usageCount: 850
      }
    },
    {
      toolId: 'notion.updatePage',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Update Page',
        description: 'Update properties of a Notion page',
        usageCount: 780
      }
    },
    {
      toolId: 'notion.archivePage',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Archive Page',
        description: 'Archive a Notion page',
        usageCount: 320
      }
    },
    {
      toolId: 'notion.queryDatabase',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Query Database',
        description: 'Query a Notion database with filters and sorts',
        usageCount: 1100
      }
    },
    {
      toolId: 'notion.retrieveDatabase',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Retrieve Database',
        description: 'Retrieve a Notion database by ID',
        usageCount: 680
      }
    },
    {
      toolId: 'notion.createDatabase',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Create Database',
        description: 'Create a new database in Notion',
        usageCount: 420
      }
    },
    {
      toolId: 'notion.updateDatabase',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Update Database',
        description: 'Update database properties and schema',
        usageCount: 380
      }
    },
    {
      toolId: 'notion.retrieveBlock',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Retrieve Block',
        description: 'Retrieve a specific block from a page',
        usageCount: 620
      }
    },
    {
      toolId: 'notion.updateBlock',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Update Block',
        description: 'Update content of a Notion block',
        usageCount: 540
      }
    },
    {
      toolId: 'notion.deleteBlock',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Delete Block',
        description: 'Delete a block from a page',
        usageCount: 280
      }
    },
    {
      toolId: 'notion.appendBlocks',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Append Blocks',
        description: 'Append blocks to a page or block',
        usageCount: 720
      }
    },
    {
      toolId: 'notion.retrieveBlockChildren',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Retrieve Block Children',
        description: 'Get all child blocks of a parent block',
        usageCount: 490
      }
    },
    {
      toolId: 'notion.listUsers',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'List Users',
        description: 'List all users in Notion workspace',
        usageCount: 560
      }
    },
    {
      toolId: 'notion.retrieveUser',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Retrieve User',
        description: 'Get details of a specific user',
        usageCount: 430
      }
    },
    {
      toolId: 'notion.retrieveBot',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Retrieve Bot',
        description: 'Get bot user information',
        usageCount: 210
      }
    },
    {
      toolId: 'notion.search',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Search',
        description: 'Search across Notion workspace',
        usageCount: 890
      }
    },
    {
      toolId: 'notion.createComment',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Create Comment',
        description: 'Add a comment to a page or discussion',
        usageCount: 340
      }
    },
    {
      toolId: 'notion.retrieveComments',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'productivity',
      metadata: {
        name: 'Retrieve Comments',
        description: 'Get all comments for a page or discussion',
        usageCount: 270
      }
    }
  ];

  const mockCategories: CategoryEmbedding[] = [
    {
      category: 'productivity',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: 19,
      description: 'Productivity tools (Notion, Airtable, Coda)'
    },
    {
      category: 'code',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: 50,
      description: 'Code management (GitHub, GitLab)'
    }
  ];

  const validNotionCredentials: OAuthCredentials = {
    accessToken: 'notion-test-token',
    refreshToken: 'notion-refresh-token',
    expiresAt: new Date(Date.now() + 86400 * 1000), // Notion tokens don't expire, but we set 24h
    scopes: [],
    tokenType: 'Bearer',
    integration: notionIntegration
  };

  const notionOAuthConfig = {
    clientId: 'notion-client-id',
    clientSecret: 'notion-client-secret',
    authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
    tokenEndpoint: 'https://api.notion.com/v1/oauth/token',
    scopes: []
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup mocks
    mockEmbeddingService = new EmbeddingService({ dimensions: 1536 }) as jest.Mocked<EmbeddingService>;
    mockCache = new RedisCache() as jest.Mocked<RedisCache>;
    mockVault = new VaultClient({}) as jest.Mocked<VaultClient>;

    mockEmbeddingService.generateEmbedding = jest.fn().mockResolvedValue(
      Array(1536).fill(0).map(() => Math.random())
    );
    mockEmbeddingService.dimensions = 1536;

    mockCache.connect = jest.fn().mockResolvedValue(undefined);
    mockCache.getToolSelection = jest.fn().mockResolvedValue(null);
    mockCache.setToolSelection = jest.fn().mockResolvedValue(undefined);

    mockVault.getCredentials = jest.fn().mockResolvedValue(validNotionCredentials);
    mockVault.storeCredentials = jest.fn().mockResolvedValue(undefined);
    mockVault.deleteCredentials = jest.fn().mockResolvedValue(undefined);

    // Setup Semantic Router
    router = new SemanticRouter(
      './test-categories.faiss',
      './test-tools.faiss',
      mockEmbeddingService,
      mockCache
    );

    const mockCategoryIndex = router['_categoryIndex'] as any;
    const mockToolIndex = router['_toolIndex'] as any;

    mockCategoryIndex.initialize = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.initialize = jest.fn().mockResolvedValue(undefined);
    mockCategoryIndex.add = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.add = jest.fn().mockResolvedValue(undefined);
    mockCategoryIndex.save = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.save = jest.fn().mockResolvedValue(undefined);
    mockCategoryIndex.search = jest.fn();
    mockToolIndex.search = jest.fn();
    mockCategoryIndex.size = mockCategories.length;
    mockToolIndex.size = notionTools.length;

    await router.initialize();
    await router.indexCategories(mockCategories);
    await router.indexTools(notionTools);

    // Setup OAuth Proxy
    const mockAxiosInstance = {
      request: jest.fn().mockResolvedValue({
        status: 200,
        headers: { 'notion-version': '2022-06-28' },
        data: { success: true }
      })
    };

    axios.create = jest.fn().mockReturnValue(mockAxiosInstance);

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

  describe('Tool Registration', () => {
    it('should register all 19 Notion tools correctly', async () => {
      const metrics = router.getMetrics();

      expect(metrics.toolCount).toBeGreaterThanOrEqual(19);

      // Verify all tool IDs are registered
      const expectedToolIds = [
        'notion.createPage',
        'notion.retrievePage',
        'notion.updatePage',
        'notion.archivePage',
        'notion.queryDatabase',
        'notion.retrieveDatabase',
        'notion.createDatabase',
        'notion.updateDatabase',
        'notion.retrieveBlock',
        'notion.updateBlock',
        'notion.deleteBlock',
        'notion.appendBlocks',
        'notion.retrieveBlockChildren',
        'notion.listUsers',
        'notion.retrieveUser',
        'notion.retrieveBot',
        'notion.search',
        'notion.createComment',
        'notion.retrieveComments'
      ];

      expectedToolIds.forEach(toolId => {
        const tool = notionTools.find(t => t.toolId === toolId);
        expect(tool).toBeDefined();
        expect(tool?.metadata.name).toBeDefined();
        expect(tool?.metadata.description).toBeDefined();
      });
    });

    it('should have complete tool metadata for all tools', () => {
      notionTools.forEach(tool => {
        expect(tool.toolId).toMatch(/^notion\./);
        expect(tool.category).toBe('productivity');
        expect(tool.metadata.name).toBeTruthy();
        expect(tool.metadata.description).toBeTruthy();
        expect(tool.metadata.usageCount).toBeGreaterThanOrEqual(0);
        expect(tool.embedding).toHaveLength(1536);
      });
    });

    it('should generate embeddings for all tools', async () => {
      // Verify embeddings exist
      notionTools.forEach(tool => {
        expect(tool.embedding).toBeDefined();
        expect(Array.isArray(tool.embedding)).toBe(true);
        expect(tool.embedding.length).toBe(1536);
      });
    });
  });

  describe('Semantic Routing', () => {
    it('should route "create a notion page" to notion.createPage', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'productivity', score: 0.95, distance: 0.05 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'notion.createPage', score: 0.98, distance: 0.02 }
      ]);

      const query = 'create a notion page';
      const result = await router.selectTools(query, {});

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].toolId).toBe('notion.createPage');
      expect(result[0].category).toBe('productivity');
      expect(result[0].score).toBeGreaterThan(0.9);
    });

    it('should route "search my workspace" to notion.search', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'productivity', score: 0.92, distance: 0.08 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'notion.search', score: 0.96, distance: 0.04 }
      ]);

      const query = 'search my workspace';
      const result = await router.selectTools(query, {});

      expect(result[0].toolId).toBe('notion.search');
    });

    it('should route "list all users" to notion.listUsers', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'productivity', score: 0.90, distance: 0.10 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'notion.listUsers', score: 0.94, distance: 0.06 }
      ]);

      const query = 'list all users';
      const result = await router.selectTools(query, {});

      expect(result[0].toolId).toBe('notion.listUsers');
    });

    it('should route "query database" to notion.queryDatabase', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'productivity', score: 0.93, distance: 0.07 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'notion.queryDatabase', score: 0.97, distance: 0.03 }
      ]);

      const query = 'query database';
      const result = await router.selectTools(query, {});

      expect(result[0].toolId).toBe('notion.queryDatabase');
      expect(result[0].score).toBeGreaterThan(0.95);
    });

    it('should select multiple related tools for complex queries', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'productivity', score: 0.94, distance: 0.06 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'notion.createPage', score: 0.96, distance: 0.04 },
        { id: 'notion.appendBlocks', score: 0.88, distance: 0.12 },
        { id: 'notion.updatePage', score: 0.82, distance: 0.18 }
      ]);

      const query = 'create a new notion page with content';
      const result = await router.selectTools(query, {});

      expect(result.length).toBeGreaterThan(1);
      expect(result.map(t => t.toolId)).toContain('notion.createPage');
    });
  });

  describe('OAuth Integration', () => {
    it('should fetch token from Vault for Notion requests', async () => {
      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: notionIntegration,
        method: 'POST',
        path: '/v1/pages',
        headers: {},
        body: {
          parent: { database_id: 'test-db' },
          properties: {}
        }
      };

      await oauthProxy.proxyRequest(request);

      expect(mockVault.getCredentials).toHaveBeenCalledWith(
        testTenantId,
        notionIntegration
      );
    });

    it('should inject Bearer token in Authorization header', async () => {
      const request: MCPRequest = {
        tenantId: testTenantId,
        integration: notionIntegration,
        method: 'GET',
        path: '/v1/databases/test-db',
        headers: {},
        body: {}
      };

      await oauthProxy.proxyRequest(request);

      const mcpClientMock = (oauthProxy as any)._mcpClient;
      expect(mcpClientMock.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${validNotionCredentials.accessToken}`
          })
        })
      );
    });

    it('should support multi-tenant isolation', async () => {
      const tenant1 = 'tenant-1';
      const tenant2 = 'tenant-2';

      const creds1: OAuthCredentials = {
        ...validNotionCredentials,
        accessToken: 'tenant-1-token'
      };

      const creds2: OAuthCredentials = {
        ...validNotionCredentials,
        accessToken: 'tenant-2-token'
      };

      mockVault.getCredentials
        .mockResolvedValueOnce(creds1)
        .mockResolvedValueOnce(creds2);

      await oauthProxy.proxyRequest({
        tenantId: tenant1,
        integration: notionIntegration,
        method: 'GET',
        path: '/v1/users',
        headers: {},
        body: {}
      });

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
    });

    it('should handle token refresh (simulated)', async () => {
      const expiredCreds: OAuthCredentials = {
        ...validNotionCredentials,
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      };

      mockVault.getCredentials
        .mockResolvedValueOnce(expiredCreds)
        .mockResolvedValueOnce({
          ...validNotionCredentials,
          accessToken: 'refreshed-token'
        });

      // Mock refresh endpoint
      axios.post = jest.fn().mockResolvedValue({
        data: {
          access_token: 'refreshed-token',
          token_type: 'Bearer'
        }
      });

      axios.create = jest.fn().mockReturnValue({
        request: jest.fn().mockResolvedValue({
          status: 200,
          headers: {},
          data: { success: true }
        }),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      // Recreate proxy
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
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized and trigger re-auth', async () => {
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
      axios.post = jest.fn().mockResolvedValue({
        data: {
          access_token: 'new-token',
          token_type: 'Bearer'
        }
      });

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
      expect(mcpClientMock.request).toHaveBeenCalledTimes(2); // Original + retry
    });

    it('should handle 429 rate limit with proper error', async () => {
      const resetTime = Math.floor(Date.now() / 1000) + 60; // 1 minute

      const mcpClientMock = {
        request: jest.fn().mockRejectedValue({
          response: {
            status: 429,
            headers: {
              'retry-after': '60'
            },
            data: {
              message: 'Rate limited'
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
        method: 'POST',
        path: '/v1/pages',
        headers: {},
        body: {}
      };

      await expect(oauthProxy.proxyRequest(request)).rejects.toThrow();
    });

    it('should handle 404 not found gracefully', async () => {
      const mcpClientMock = {
        request: jest.fn().mockRejectedValue({
          response: {
            status: 404,
            data: {
              message: 'Page not found'
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
        path: '/v1/pages/invalid-id',
        headers: {},
        body: {}
      };

      await expect(oauthProxy.proxyRequest(request)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const mcpClientMock = {
        request: jest.fn().mockRejectedValue(new Error('Network error'))
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

    it('should handle malformed API responses', async () => {
      const mcpClientMock = {
        request: jest.fn().mockResolvedValue({
          status: 200,
          headers: {},
          data: null // Malformed response
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

      const response = await oauthProxy.proxyRequest(request);
      expect(response.status).toBe(200);
      expect(response.data).toBeNull();
    });
  });

  describe('Performance and Caching', () => {
    it('should complete tool selection in <100ms', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'productivity', score: 0.9, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'notion.createPage', score: 0.95, distance: 0.05 }
      ]);

      const start = Date.now();
      await router.selectTools('create a notion page', {});
      const latency = Date.now() - start;

      expect(latency).toBeLessThan(100);
    });

    it('should cache tool selections for repeated queries', async () => {
      const query = 'search notion workspace';
      const context: QueryContext = { tokenBudget: 2000 };

      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'productivity', score: 0.9, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'notion.search', score: 0.96, distance: 0.04 }
      ]);

      // Reset cache mock
      mockCache.getToolSelection.mockReset();
      mockCache.getToolSelection.mockResolvedValueOnce(null); // First call: cache miss

      const result1 = await router.selectTools(query, context);

      expect(mockCache.setToolSelection).toHaveBeenCalledWith(query, context, result1);

      // Second call should hit cache
      mockCache.getToolSelection.mockReset();
      mockCache.getToolSelection.mockResolvedValue(result1);
      mockEmbeddingService.generateEmbedding.mockClear();

      const result2 = await router.selectTools(query, context);

      expect(result2).toEqual(result1);
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledTimes(0);
    });
  });

  describe('Token Budget Optimization', () => {
    it('should respect token budget constraints', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'productivity', score: 0.9, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'notion.createPage', score: 0.95, distance: 0.05 },
        { id: 'notion.queryDatabase', score: 0.90, distance: 0.10 },
        { id: 'notion.search', score: 0.85, distance: 0.15 }
      ]);

      const strictBudget = 500;
      const result = await router.selectTools('notion operations', {
        tokenBudget: strictBudget
      });

      const totalTokens = result.reduce((sum, tool) => sum + tool.tokenCost, 0);
      expect(totalTokens).toBeLessThanOrEqual(strictBudget);
    });
  });
});
