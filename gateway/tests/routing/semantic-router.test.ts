/**
 * Tests for SemanticRouter
 */

import { SemanticRouter } from '../../src/routing/semantic-router';
import { EmbeddingService } from '../../src/routing/embedding-service';
import { FAISSIndex } from '../../src/routing/faiss-index';
import { RedisCache } from '../../src/caching/redis-cache';
import { ToolEmbedding, CategoryEmbedding, QueryContext } from '../../src/types/routing.types';

// Mock dependencies
jest.mock('../../src/routing/faiss-index');
jest.mock('../../src/routing/embedding-service');
jest.mock('../../src/caching/redis-cache');

describe('SemanticRouter', () => {
  let router: SemanticRouter;
  let mockEmbeddingService: jest.Mocked<EmbeddingService>;
  let mockCache: jest.Mocked<RedisCache>;

  const mockCategories: CategoryEmbedding[] = [
    {
      category: 'code',
      embedding: Array(10).fill(0.1),
      toolCount: 50,
      description: 'Code management tools (GitHub, GitLab)'
    },
    {
      category: 'communication',
      embedding: Array(10).fill(0.2),
      toolCount: 30,
      description: 'Communication tools (Slack, Email)'
    }
  ];

  const mockTools: ToolEmbedding[] = [
    {
      toolId: 'github.createPullRequest',
      embedding: Array(10).fill(0.15),
      category: 'code',
      metadata: {
        name: 'Create Pull Request',
        description: 'Create a new pull request on GitHub',
        usageCount: 1000
      }
    },
    {
      toolId: 'github.mergePullRequest',
      embedding: Array(10).fill(0.12),
      category: 'code',
      metadata: {
        name: 'Merge Pull Request',
        description: 'Merge a pull request on GitHub',
        usageCount: 800
      }
    },
    {
      toolId: 'slack.sendMessage',
      embedding: Array(10).fill(0.25),
      category: 'communication',
      metadata: {
        name: 'Send Slack Message',
        description: 'Send a message to a Slack channel',
        usageCount: 1200
      }
    }
  ];

  beforeEach(async () => {
    // Create mocks
    mockEmbeddingService = new EmbeddingService({ dimensions: 10 }) as jest.Mocked<EmbeddingService>;
    mockCache = new RedisCache() as jest.Mocked<RedisCache>;

    mockEmbeddingService.generateEmbedding = jest.fn().mockResolvedValue(Array(10).fill(0.1));
    mockEmbeddingService.dimensions = 10;

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

    // Mock FAISS index methods
    const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
    const mockToolIndex = router['_toolIndex'] as jest.Mocked<FAISSIndex>;

    mockCategoryIndex.initialize = jest.fn().mockResolvedValue(undefined);
    mockToolIndex.initialize = jest.fn().mockResolvedValue(undefined);
    mockCategoryIndex.size = mockCategories.length;
    mockToolIndex.size = mockTools.length;

    mockCategoryIndex.search = jest.fn().mockResolvedValue([
      { id: 'code', score: 0.92, distance: 0.1 }
    ]);

    mockToolIndex.search = jest.fn().mockResolvedValue([
      { id: 'github.createPullRequest', score: 0.95, distance: 0.05 },
      { id: 'github.mergePullRequest', score: 0.78, distance: 0.2 }
    ]);

    await router.initialize();
    await router.indexCategories(mockCategories);
    await router.indexTools(mockTools);
  });

  describe('selectTools', () => {
    it('should select tools using two-level retrieval', async () => {
      const query = 'create a pull request on GitHub';
      const context: QueryContext = {
        allowedCategories: undefined,
        tokenBudget: 2000
      };

      const result = await router.selectTools(query, context);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].toolId).toBe('github.createPullRequest');
      expect(mockEmbeddingService.generateEmbedding).toHaveBeenCalled();
    });

    it('should use cached results when available', async () => {
      const query = 'test query';
      const context: QueryContext = {};
      const cachedTools = [
        {
          toolId: 'test.tool',
          name: 'Test Tool',
          description: 'Test',
          category: 'test',
          score: 0.9,
          tokenCost: 100,
          tier: 1 as const
        }
      ];

      mockCache.getToolSelection = jest.fn().mockResolvedValue(cachedTools);

      const result = await router.selectTools(query, context);

      expect(result).toEqual(cachedTools);
      expect(mockEmbeddingService.generateEmbedding).not.toHaveBeenCalled();
    });

    it('should respect token budget in tool selection', async () => {
      const query = 'complex query';
      const context: QueryContext = { tokenBudget: 500 };

      const result = await router.selectTools(query, context);

      const totalTokens = result.reduce((sum, tool) => sum + tool.tokenCost, 0);
      expect(totalTokens).toBeLessThanOrEqual(500);
    });

    it('should use pre-specified categories when provided', async () => {
      const query = 'send message';
      const context: QueryContext = {
        allowedCategories: ['communication']
      };

      await router.selectTools(query, context);

      // Should not search category index
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      expect(mockCategoryIndex.search).not.toHaveBeenCalled();
    });

    it('should use fallback when no categories found', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as jest.Mocked<FAISSIndex>;
      mockCategoryIndex.search = jest.fn().mockResolvedValue([]);

      const query = 'unknown query';
      const context: QueryContext = { primaryCategory: 'code' };

      const result = await router.selectTools(query, context);

      expect(result).toBeDefined();
      // Should return popular tools from primary category
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('selectToolsWithTiers', () => {
    it('should return tiered tool set with progressive loading', async () => {
      const query = 'create pull request';
      const context: QueryContext = { tokenBudget: 2000 };

      const result = await router.selectToolsWithTiers(query, context);

      expect(result).toBeDefined();
      expect(result.tier1).toBeDefined();
      expect(result.tier2).toBeDefined();
      expect(result.tier3).toBeDefined();
      expect(result.totalTokens).toBeLessThanOrEqual(2000);
      expect(result.reductionPercentage).toBeGreaterThan(0);
    });
  });

  describe('indexing', () => {
    it('should index categories correctly', async () => {
      const newCategories: CategoryEmbedding[] = [
        {
          category: 'data',
          embedding: Array(10).fill(0.3),
          toolCount: 20,
          description: 'Data tools'
        }
      ];

      await router.indexCategories(newCategories);

      const metrics = router.getMetrics();
      expect(metrics.categoryCount).toBeGreaterThan(0);
    });

    it('should index tools correctly', async () => {
      const newTools: ToolEmbedding[] = [
        {
          toolId: 'test.tool',
          embedding: Array(10).fill(0.5),
          category: 'code',
          metadata: {
            name: 'Test Tool',
            description: 'Test',
            usageCount: 10
          }
        }
      ];

      await router.indexTools(newTools);

      const metrics = router.getMetrics();
      expect(metrics.toolCount).toBeGreaterThan(0);
    });
  });

  describe('getMetrics', () => {
    it('should return correct metrics', () => {
      const metrics = router.getMetrics();

      expect(metrics.categoryCount).toBe(mockCategories.length);
      expect(metrics.toolCount).toBe(mockTools.length);
      expect(metrics.categoriesWithTools).toBeGreaterThan(0);
      expect(metrics.avgToolsPerCategory).toBeGreaterThan(0);
    });
  });
});
