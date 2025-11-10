/**
 * Integration tests for SemanticRouter
 * Tests full flow: Query → Category Selection → Tool Selection → Token Optimization
 */

import { SemanticRouter } from '../../src/routing/semantic-router';
import { EmbeddingService } from '../../src/routing/embedding-service';
import { FAISSIndex } from '../../src/routing/faiss-index';
import { RedisCache } from '../../src/caching/redis-cache';
import { QueryContext, ToolEmbedding, CategoryEmbedding } from '../../src/types/routing.types';

// Use real implementations but with mocked external dependencies
jest.mock('../../src/routing/faiss-index');
jest.mock('../../src/routing/embedding-service');
jest.mock('../../src/caching/redis-cache');

describe('SemanticRouter Integration Tests', () => {
  let router: SemanticRouter;
  let mockEmbeddingService: jest.Mocked<EmbeddingService>;
  let mockCache: jest.Mocked<RedisCache>;

  // Mock data representing a realistic tool catalog
  const mockCategories: CategoryEmbedding[] = [
    {
      category: 'code',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: 50,
      description: 'Code management tools (GitHub, GitLab, Bitbucket)'
    },
    {
      category: 'communication',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: 30,
      description: 'Communication tools (Slack, Teams, Discord)'
    },
    {
      category: 'project-management',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: 40,
      description: 'Project management (Jira, Linear, Asana)'
    },
    {
      category: 'cloud',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: 80,
      description: 'Cloud infrastructure (AWS, Azure, GCP)'
    },
    {
      category: 'data',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: 50,
      description: 'Data platforms (Snowflake, BigQuery, Databricks)'
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
      toolId: 'github.mergePullRequest',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'code',
      metadata: {
        name: 'Merge Pull Request',
        description: 'Merge a pull request on GitHub',
        usageCount: 800
      }
    },
    {
      toolId: 'github.createIssue',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'code',
      metadata: {
        name: 'Create Issue',
        description: 'Create a new issue on GitHub',
        usageCount: 900
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
      toolId: 'jira.createTicket',
      embedding: Array(1536).fill(0).map(() => Math.random()),
      category: 'project-management',
      metadata: {
        name: 'Create Jira Ticket',
        description: 'Create a new ticket in Jira',
        usageCount: 700
      }
    }
  ];

  beforeEach(async () => {
    // Create mocks
    mockEmbeddingService = new EmbeddingService({ dimensions: 1536 }) as jest.Mocked<EmbeddingService>;
    mockCache = new RedisCache() as jest.Mocked<RedisCache>;

    mockEmbeddingService.generateEmbedding = jest.fn().mockResolvedValue(
      Array(1536).fill(0).map(() => Math.random())
    );
    mockEmbeddingService.dimensions = 1536;

    mockCache.connect = jest.fn().mockResolvedValue(undefined);
    mockCache.getToolSelection = jest.fn().mockResolvedValue(null);
    mockCache.setToolSelection = jest.fn().mockResolvedValue(undefined);

    // Create router
    router = new SemanticRouter(
      './test-categories.faiss',
      './test-tools.faiss',
      mockEmbeddingService,
      mockCache
    );

    // Mock FAISS indices
    const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
    const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;

    mockCategoryIndex.initialize = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.initialize = jest.fn().mockResolvedValue(undefined);
    mockCategoryIndex.size = mockCategories.length;
    mockToolIndex.size = mockTools.length;
    mockCategoryIndex.add = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.add = jest.fn().mockResolvedValue(undefined);
    mockCategoryIndex.save = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.save = jest.fn().mockResolvedValue(undefined);

    // Mock search results
    mockCategoryIndex.search = jest.fn();
    mockToolIndex.search = jest.fn();

    // Initialize router
    await router.initialize();
    await router.indexCategories(mockCategories);
    await router.indexTools(mockTools);
  });

  describe('Full Integration: Query → Category → Tool → Optimization', () => {
    it('should complete full routing flow for GitHub PR query', async () => {
      const startTime = Date.now();

      // Mock category search returns 'code' category
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.92, distance: 0.1 }
      ]);

      // Mock tool search returns GitHub tools
      const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;
      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 },
        { id: 'github.mergePullRequest', score: 0.78, distance: 0.2 },
        { id: 'github.createIssue', score: 0.65, distance: 0.3 }
      ]);

      const query = 'create a pull request on GitHub';
      const context: QueryContext = {
        tokenBudget: 2000
      };

      const result = await router.selectTools(query, context);

      const totalLatency = Date.now() - startTime;

      // Assertions
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(5); // MAX_TOOLS_PER_QUERY

      // Verify tool selection quality
      expect(result[0].toolId).toBe('github.createPullRequest');
      expect(result[0].score).toBeGreaterThan(0.9);
      expect(result[0].category).toBe('code');

      // Verify token optimization
      const totalTokens = result.reduce((sum, tool) => sum + tool.tokenCost, 0);
      expect(totalTokens).toBeLessThanOrEqual(2000);

      // Verify latency target (<100ms)
      expect(totalLatency).toBeLessThan(100);

      // Verify caching was attempted
      expect(mockCache.getToolSelection).toHaveBeenCalledWith(query, context);
      expect(mockCache.setToolSelection).toHaveBeenCalledWith(query, context, result);

      // Verify embedding generation
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledWith(query);
    });

    it('should handle multi-category queries (code + communication)', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.88, distance: 0.15 },
        { id: 'communication', score: 0.75, distance: 0.25 }
      ]);

      const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;
      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.90, distance: 0.1 },
        { id: 'slack.sendMessage', score: 0.82, distance: 0.18 },
        { id: 'github.createIssue', score: 0.70, distance: 0.3 }
      ]);

      const query = 'create a PR and notify the team on Slack';
      const result = await router.selectTools(query, {});

      expect(result.length).toBeGreaterThan(0);

      // Should have tools from multiple categories
      const categories = new Set(result.map(t => t.category));
      expect(categories.size).toBeGreaterThanOrEqual(1);

      // Verify both tools are present
      const toolIds = result.map(t => t.toolId);
      expect(toolIds).toContain('github.createPullRequest');
      expect(toolIds).toContain('slack.sendMessage');
    });

    it('should use Redis cache on second query', async () => {
      const query = 'test query';
      const context: QueryContext = { tokenBudget: 1000 };

      const cachedTools = [
        {
          toolId: 'cached.tool',
          name: 'Cached Tool',
          description: 'From cache',
          category: 'test',
          score: 0.9,
          tokenCost: 100,
          tier: 1 as const
        }
      ];

      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;
      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 }
      ]);

      // Reset and setup cache mock for this test
      mockCache.getToolSelection.mockReset();
      mockCache.getToolSelection.mockResolvedValueOnce(null); // First call: cache miss

      await router.selectTools(query, context);

      // Setup cache to return cached tools on second call
      mockCache.getToolSelection.mockReset();
      mockCache.getToolSelection.mockResolvedValue(cachedTools); // Second call: cache hit

      // Clear embedding service call count before second query
      mockEmbeddingService.generateEmbedding.mockClear();

      // Second call should hit cache
      const result = await router.selectTools(query, context);

      expect(result).toEqual(cachedTools);
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalledTimes(0); // Should not be called on cache hit
    });

    it('should respect token budget and downgrade tiers', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;
      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 },
        { id: 'github.mergePullRequest', score: 0.88, distance: 0.12 },
        { id: 'github.createIssue', score: 0.80, distance: 0.2 }
      ]);

      const query = 'GitHub operations';
      const strictBudget = 300; // Very strict budget

      const result = await router.selectTools(query, { tokenBudget: strictBudget });

      const totalTokens = result.reduce((sum, tool) => sum + tool.tokenCost, 0);

      expect(totalTokens).toBeLessThanOrEqual(strictBudget);
      expect(result.length).toBeGreaterThan(0); // Should still return some tools

      // Verify tier distribution
      const tier1Count = result.filter(t => t.tier === 1).length;
      expect(tier1Count).toBeGreaterThan(0); // Should have downgraded some to tier 1
    });

    it('should handle fallback when no categories found', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      mockCategoryIndex.search.mockResolvedValue([]); // No categories found

      const query = 'unknown query with no matches';
      const context: QueryContext = { primaryCategory: 'code' };

      const result = await router.selectTools(query, context);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0); // Fallback should return tools

      // All tools should be from fallback category
      result.forEach(tool => {
        expect(tool.category).toBe('code');
      });

      // Should be sorted by usage count
      if (result.length > 1) {
        const usageCounts = result.map(t => {
          const toolEmbed = mockTools.find(mt => mt.toolId === t.toolId);
          return toolEmbed?.metadata.usageCount || 0;
        });

        // Verify descending order
        for (let i = 1; i < usageCounts.length; i++) {
          expect(usageCounts[i - 1]).toBeGreaterThanOrEqual(usageCounts[i]);
        }
      }
    });

    it('should filter by allowedCategories when provided', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;

      mockToolIndex.search.mockResolvedValue([
        { id: 'slack.sendMessage', score: 0.90, distance: 0.1 }
      ]);

      const query = 'send a message';
      const context: QueryContext = {
        allowedCategories: ['communication'] // Only communication tools
      };

      const result = await router.selectTools(query, context);

      // Should not have searched category index (pre-specified)
      expect(mockCategoryIndex.search).not.toHaveBeenCalled();

      // All results should be from allowed categories
      result.forEach(tool => {
        expect(tool.category).toBe('communication');
      });
    });
  });

  describe('Progressive Loading (Tiered Schemas)', () => {
    it('should return tiered tool set with token reduction', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;
      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 },
        { id: 'github.mergePullRequest', score: 0.88, distance: 0.12 },
        { id: 'github.createIssue', score: 0.80, distance: 0.2 }
      ]);

      const query = 'GitHub operations';
      const result = await router.selectToolsWithTiers(query, { tokenBudget: 2000 });

      expect(result).toBeDefined();
      expect(result.tier1).toBeDefined();
      expect(result.tier2).toBeDefined();
      expect(result.tier3).toBeDefined();

      // Verify token budget
      expect(result.totalTokens).toBeLessThanOrEqual(2000);

      // Verify reduction percentage
      expect(result.reductionPercentage).toBeGreaterThan(0);

      // Tier 1 should have minimal schemas (name + description only)
      result.tier1.forEach(tool => {
        expect(tool.tier).toBe(1);
        expect(tool.schema).toBeDefined();
        expect(tool.schema?.name).toBeDefined();
        expect(tool.schema?.description).toBeDefined();
      });

      // Tier 3 should have load URLs
      result.tier3.forEach(tool => {
        expect(tool.tier).toBe(3);
        expect(tool.loadUrl).toBeDefined();
      });
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete tool selection in <100ms (latency target)', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;
      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 }
      ]);

      const iterations = 10;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await router.selectTools(`test query ${i}`, {});
        latencies.push(Date.now() - start);
      }

      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      const maxLatency = Math.max(...latencies);

      expect(avgLatency).toBeLessThan(100);
      expect(maxLatency).toBeLessThan(150); // Allow some variance

      console.log(`Average latency: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency}ms`);
    });

    it('should handle concurrent queries efficiently', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;
      mockToolIndex.search.mockResolvedValue([
        { id: 'github.createPullRequest', score: 0.95, distance: 0.05 }
      ]);

      const concurrentQueries = 20;
      const queries = Array.from({ length: concurrentQueries }, (_, i) =>
        `query number ${i}`
      );

      const start = Date.now();
      const results = await Promise.all(
        queries.map(q => router.selectTools(q, {}))
      );
      const totalTime = Date.now() - start;

      expect(results).toHaveLength(concurrentQueries);
      results.forEach(r => expect(r.length).toBeGreaterThan(0));

      const avgTimePerQuery = totalTime / concurrentQueries;
      expect(avgTimePerQuery).toBeLessThan(200); // With parallelism

      console.log(`${concurrentQueries} concurrent queries in ${totalTime}ms (avg: ${avgTimePerQuery.toFixed(2)}ms/query)`);
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should track routing metrics correctly', () => {
      const metrics = router.getMetrics();

      expect(metrics.categoryCount).toBe(mockCategories.length);
      expect(metrics.toolCount).toBe(mockTools.length);
      expect(metrics.categoriesWithTools).toBeGreaterThan(0);
      expect(metrics.avgToolsPerCategory).toBeGreaterThan(0);

      console.log('Router metrics:', metrics);
    });
  });
});
