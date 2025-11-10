/**
 * End-to-End Gateway Tests
 * Tests complete flow: Query → Semantic Router → GraphRAG → OAuth → MCP Response
 */

import { SemanticRouter } from '../../src/routing/semantic-router';
import { GraphRAGService } from '../../src/graph/graphrag-service';
import { OAuthProxy } from '../../src/auth/oauth-proxy';
import { VaultClient } from '../../src/auth/vault-client';
import { EmbeddingService } from '../../src/routing/embedding-service';
import { RedisCache } from '../../src/caching/redis-cache';
import {
  QueryContext,
  ToolEmbedding,
  CategoryEmbedding,
  ToolSelection
} from '../../src/types/routing.types';
import { ToolNode } from '../../src/graph/types';
import { OAuthCredentials, MCPRequest } from '../../src/auth/types';

// Mock all external dependencies
jest.mock('../../src/routing/faiss-index');
jest.mock('../../src/routing/embedding-service');
jest.mock('../../src/caching/redis-cache');
jest.mock('../../src/auth/vault-client');
jest.mock('axios');
jest.mock('neo4j-driver');

const axios = require('axios');

describe('Full Gateway End-to-End Tests', () => {
  let semanticRouter: SemanticRouter;
  let graphRAG: GraphRAGService;
  let oauthProxy: OAuthProxy;
  let mockVault: jest.Mocked<VaultClient>;
  let mockEmbeddingService: jest.Mocked<EmbeddingService>;
  let mockCache: jest.Mocked<RedisCache>;

  const testTenantId = 'tenant-e2e-test';

  // Mock tool catalog
  const mockCategories: CategoryEmbedding[] = [
    {
      category: 'code',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: 50,
      description: 'Code management (GitHub, GitLab)'
    },
    {
      category: 'communication',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: 30,
      description: 'Communication (Slack, Teams)'
    }
  ];

  const mockTools: ToolEmbedding[] = [
    {
      toolId: 'github.createPullRequest',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'code',
      metadata: {
        name: 'Create Pull Request',
        description: 'Create a new pull request on GitHub',
        usageCount: 1000
      }
    },
    {
      toolId: 'slack.sendMessage',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'communication',
      metadata: {
        name: 'Send Slack Message',
        description: 'Send a message to a Slack channel',
        usageCount: 1200
      }
    },
    {
      toolId: 'github.mergePullRequest',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'code',
      metadata: {
        name: 'Merge Pull Request',
        description: 'Merge a pull request',
        usageCount: 800
      }
    }
  ];

  const mockGraphTools: ToolNode[] = mockTools.map(t => ({
    id: t.toolId,
    name: t.metadata.name,
    category: t.category,
    description: t.metadata.description,
    usageCount: t.metadata.usageCount
  }));

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

    mockVault.getCredentials = jest.fn().mockResolvedValue({
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
      expiresAt: new Date(Date.now() + 3600 * 1000),
      scopes: ['repo', 'user'],
      tokenType: 'Bearer',
      integration: 'github'
    } as OAuthCredentials);
    mockVault.storeCredentials = jest.fn().mockResolvedValue(undefined);

    // Setup Semantic Router
    semanticRouter = new SemanticRouter(
      './test-categories.faiss',
      './test-tools.faiss',
      mockEmbeddingService,
      mockCache
    );

    const mockCategoryIndex = semanticRouter['_categoryIndex'] as any;
    const mockToolIndex = semanticRouter['_toolIndex'] as any;

    mockCategoryIndex.initialize = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.initialize = jest.fn().mockResolvedValue(undefined);
    mockCategoryIndex.add = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.add = jest.fn().mockResolvedValue(undefined);
    mockCategoryIndex.save = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.save = jest.fn().mockResolvedValue(undefined);
    mockCategoryIndex.search = jest.fn();
    mockToolIndex.search = jest.fn();
    mockCategoryIndex.size = mockCategories.length;
    mockToolIndex.size = mockTools.length;

    await semanticRouter.initialize();
    await semanticRouter.indexCategories(mockCategories);
    await semanticRouter.indexTools(mockTools);

    // Setup GraphRAG
    const mockSession = {
      run: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined)
    };

    const mockPool = {
      getSession: jest.fn().mockReturnValue(mockSession),
      close: jest.fn().mockResolvedValue(undefined)
    };

    graphRAG = new GraphRAGService(mockPool as any);

    // Mock axios for MCP calls BEFORE creating OAuthProxy
    axios.create = jest.fn().mockReturnValue({
      request: jest.fn().mockResolvedValue({
        status: 200,
        headers: {},
        data: { success: true }
      })
    });

    // Setup OAuth Proxy (axios.create already mocked)
    oauthProxy = new OAuthProxy(mockVault, 'http://localhost:3000', new Map([
      ['github', {
        clientId: 'test-client',
        clientSecret: 'test-secret',
        authEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
        scopes: ['repo', 'user']
      }]
    ]));

    oauthProxy.start();
  });

  afterEach(() => {
    oauthProxy.stop();
  });

  describe('Complete Gateway Flow', () => {
    it('should execute full flow: Query → Router → GraphRAG → OAuth → MCP', async () => {
      const testStartTime = Date.now();

      // Step 1: Semantic Router selects tools
      const mockCategoryIndex = semanticRouter['_categoryIndex'] as any;
      const mockToolIndex = semanticRouter['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.92, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 }
      ]);

      const query = 'create a pull request on GitHub';
      const context: QueryContext = {
        tenantId: testTenantId,
        tokenBudget: 2000
      };

      const selectedTools = await semanticRouter.selectTools(query, context);

      console.log('Step 1 - Semantic Router:', {
        query,
        toolsSelected: selectedTools.length,
        topTool: selectedTools[0]?.toolId
      });

      // Verify semantic router results
      expect(selectedTools.length).toBeGreaterThan(0);
      expect(selectedTools[0].toolId).toBe('github.createPullRequest');

      // Step 2: GraphRAG enhances with relationships
      const mockSession = (graphRAG as any)._connectionPool.getSession();
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'slack.sendMessage',
                name: 'Send Slack Message',
                category: 'communication',
                description: 'Notify team',
                usageCount: 1200
              }
            })
          }
        ]
      });

      const toolsForGraph: ToolNode[] = selectedTools.map(t => ({
        id: t.toolId,
        name: t.name,
        category: t.category,
        description: t.description,
        usageCount: 0
      }));

      const enhancedTools = await graphRAG.enhanceWithRelationships(toolsForGraph, context);

      console.log('Step 2 - GraphRAG Enhancement:', {
        originalTools: toolsForGraph.length,
        enhancedTools: enhancedTools.length,
        relatedToolsAdded: enhancedTools.length - toolsForGraph.length
      });

      // Verify GraphRAG enhancement
      expect(enhancedTools.length).toBeGreaterThanOrEqual(selectedTools.length);

      // Step 3: OAuth Proxy handles authentication and makes MCP request
      const mcpRequest: MCPRequest = {
        tenantId: testTenantId,
        integration: 'github',
        method: 'POST',
        path: '/pulls',
        headers: {},
        body: {
          title: 'Test PR',
          head: 'feature',
          base: 'main',
          body: 'Test description'
        }
      };

      const mcpResponse = await oauthProxy.proxyRequest(mcpRequest);

      console.log('Step 3 - OAuth + MCP:', {
        integration: mcpRequest.integration,
        method: mcpRequest.method,
        path: mcpRequest.path,
        status: mcpResponse.status,
        authenticated: true
      });

      // Verify OAuth and MCP execution
      expect(mockVault.getCredentials).toHaveBeenCalledWith(testTenantId, 'github');
      expect(mcpResponse.status).toBe(200);

      const totalLatency = Date.now() - testStartTime;

      console.log('E2E Flow Complete:', {
        totalLatency: `${totalLatency}ms`,
        steps: 3,
        success: true
      });

      // Verify end-to-end latency
      expect(totalLatency).toBeLessThan(500); // Target: <500ms for full flow
    });

    it('should handle multi-tool workflow with notifications', async () => {
      // Scenario: Create PR + Notify team on Slack

      // Step 1: Router selects both code and communication tools
      const mockCategoryIndex = semanticRouter['_categoryIndex'] as any;
      const mockToolIndex = semanticRouter['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.90, distance: 0.1 },
        { id: 'communication', score: 0.80, distance: 0.2 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 },
        { id: 'slack.sendMessage', score: 0.85, distance: 0.15 }
      ]);

      const query = 'create a PR and notify the team on Slack';
      const selectedTools = await semanticRouter.selectTools(query, {
        tenantId: testTenantId
      });

      expect(selectedTools.length).toBe(2);
      expect(selectedTools.map(t => t.toolId)).toContain('github.createPullRequest');
      expect(selectedTools.map(t => t.toolId)).toContain('slack.sendMessage');

      // Step 2: Execute both tools with OAuth
      mockVault.getCredentials
        .mockResolvedValueOnce({
          accessToken: 'github-token',
          refreshToken: 'github-refresh',
          expiresAt: new Date(Date.now() + 3600 * 1000),
          scopes: ['repo'],
          tokenType: 'Bearer',
          integration: 'github'
        } as OAuthCredentials)
        .mockResolvedValueOnce({
          accessToken: 'slack-token',
          refreshToken: 'slack-refresh',
          expiresAt: new Date(Date.now() + 3600 * 1000),
          scopes: ['chat:write'],
          tokenType: 'Bearer',
          integration: 'slack'
        } as OAuthCredentials);

      // Execute GitHub PR creation
      const prResponse = await oauthProxy.proxyRequest({
        tenantId: testTenantId,
        integration: 'github',
        method: 'POST',
        path: '/pulls',
        headers: {},
        body: { title: 'Feature PR' }
      });

      // Execute Slack notification
      const slackResponse = await oauthProxy.proxyRequest({
        tenantId: testTenantId,
        integration: 'slack',
        method: 'POST',
        path: '/chat.postMessage',
        headers: {},
        body: { channel: 'general', text: 'PR created!' }
      });

      expect(prResponse.status).toBe(200);
      expect(slackResponse.status).toBe(200);
      expect(mockVault.getCredentials).toHaveBeenCalledTimes(2);
    });

    it('should handle token reduction across full flow', async () => {
      // Mock large tool catalog (100 tools)
      const largeCatalog = Array.from({ length: 100 }, (_, i) => ({
        toolId: `tool-${i}`,
        embedding: Array(1536).fill(0).map(() => Math.random()),
        category: 'code',
        metadata: {
          name: `Tool ${i}`,
          description: `Description ${i}`,
          usageCount: Math.floor(Math.random() * 1000)
        }
      }));

      await semanticRouter.indexTools(largeCatalog);

      const mockToolIndex = semanticRouter['_toolIndex'] as any;
      mockToolIndex.size = largeCatalog.length;
      mockToolIndex.search.mockResolvedValue([
        { id: 'tool-0', score: 0.95, distance: 0.05 },
        { id: 'tool-1', score: 0.90, distance: 0.10 },
        { id: 'tool-2', score: 0.85, distance: 0.15 }
      ]);

      const mockCategoryIndex = semanticRouter['_categoryIndex'] as any;
      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      const selectedTools = await semanticRouter.selectTools('test query', {
        tokenBudget: 2000
      });

      const tokenOptimizer = (semanticRouter as any)._tokenOptimizer;
      const actualTokens = tokenOptimizer.calculateTotalCost(selectedTools);
      const savings = tokenOptimizer.calculateSavings(selectedTools, 100, 500);

      console.log('Token Reduction E2E:', {
        catalogSize: largeCatalog.length,
        toolsSelected: selectedTools.length,
        fullLoadTokens: savings.fullLoadTokens,
        actualTokens,
        reduction: `${savings.savingsPercent.toFixed(2)}%`
      });

      expect(selectedTools.length).toBeLessThanOrEqual(5);
      expect(actualTokens).toBeLessThanOrEqual(2000);
      expect(savings.savingsPercent).toBeGreaterThanOrEqual(95);
    });

    it('should handle errors gracefully throughout the flow', async () => {
      // Scenario: GraphRAG fails, but flow continues

      const mockCategoryIndex = semanticRouter['_categoryIndex'] as any;
      const mockToolIndex = semanticRouter['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 }
      ]);

      // Step 1: Router succeeds
      const selectedTools = await semanticRouter.selectTools('create PR', {});
      expect(selectedTools.length).toBeGreaterThan(0);

      // Step 2: GraphRAG fails
      const mockSession = (graphRAG as any)._connectionPool.getSession();
      mockSession.run.mockRejectedValue(new Error('Neo4j connection failed'));

      const toolsForGraph: ToolNode[] = selectedTools.map(t => ({
        id: t.toolId,
        name: t.name,
        category: t.category,
        description: t.description,
        usageCount: 0
      }));

      const enhancedTools = await graphRAG.enhanceWithRelationships(toolsForGraph, {});

      // GraphRAG should gracefully degrade
      expect(enhancedTools).toEqual(toolsForGraph);

      // Step 3: OAuth still works
      const mcpResponse = await oauthProxy.proxyRequest({
        tenantId: testTenantId,
        integration: 'github',
        method: 'GET',
        path: '/user',
        headers: {},
        body: {}
      });

      expect(mcpResponse.status).toBe(200);

      console.log('Graceful degradation verified: Flow completed despite GraphRAG failure');
    });

    it('should cache and reuse results for repeated queries', async () => {
      const query = 'create a pull request';
      const context: QueryContext = { tokenBudget: 2000 };

      // First call: cache miss
      const mockCategoryIndex = semanticRouter['_categoryIndex'] as any;
      const mockToolIndex = semanticRouter['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 }
      ]);

      // Reset and set up cache mock
      mockCache.getToolSelection.mockReset();
      mockCache.getToolSelection.mockResolvedValueOnce(null); // First call: cache miss

      const result1 = await semanticRouter.selectTools(query, context);

      expect(mockCache.setToolSelection).toHaveBeenCalledWith(query, context, result1);

      // Second call: cache hit - reset cache mock and return result1
      mockCache.getToolSelection.mockReset();
      mockCache.getToolSelection.mockResolvedValue(result1);

      // Clear embedding service call count before second call
      mockEmbeddingService.generateEmbedding.mockClear();

      const result2 = await semanticRouter.selectTools(query, context);

      expect(result2).toEqual(result1);
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledTimes(0); // Should not be called on cache hit
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete full E2E flow in <500ms', async () => {
      const iterations = 5;
      const latencies: number[] = [];

      const mockCategoryIndex = semanticRouter['_categoryIndex'] as any;
      const mockToolIndex = semanticRouter['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 }
      ]);

      const mockSession = (graphRAG as any)._connectionPool.getSession();
      mockSession.run.mockResolvedValue({ records: [] });

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        // Full flow
        const tools = await semanticRouter.selectTools(`query ${i}`, {});
        const toolNodes: ToolNode[] = tools.map(t => ({
          id: t.toolId,
          name: t.name,
          category: t.category,
          description: t.description,
          usageCount: 0
        }));
        await graphRAG.enhanceWithRelationships(toolNodes, {});
        await oauthProxy.proxyRequest({
          tenantId: testTenantId,
          integration: 'github',
          method: 'GET',
          path: '/user',
          headers: {},
          body: {}
        });

        latencies.push(Date.now() - start);
      }

      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);

      console.log('E2E Performance:', {
        iterations,
        avgLatency: `${avgLatency.toFixed(2)}ms`,
        maxLatency: `${maxLatency}ms`,
        target: '500ms'
      });

      expect(avgLatency).toBeLessThan(500);
      expect(maxLatency).toBeLessThan(750);
    });
  });
});
