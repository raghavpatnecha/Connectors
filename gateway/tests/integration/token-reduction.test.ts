/**
 * Token Reduction Validation Tests
 * Measures: 250K tokens (500 tools) → 1-3K tokens (95%+ reduction)
 */

import { SemanticRouter } from '../../src/routing/semantic-router';
import { TokenOptimizer } from '../../src/optimization/token-optimizer';
import { ProgressiveLoader } from '../../src/optimization/progressive-loader';
import { EmbeddingService } from '../../src/routing/embedding-service';
import { RedisCache } from '../../src/caching/redis-cache';
import { ToolEmbedding, CategoryEmbedding, QueryContext, ToolSelection } from '../../src/types/routing.types';

jest.mock('../../src/routing/faiss-index');
jest.mock('../../src/routing/embedding-service');
jest.mock('../../src/caching/redis-cache');

describe('Token Reduction Validation Tests', () => {
  let tokenOptimizer: TokenOptimizer;
  let progressiveLoader: ProgressiveLoader;
  let router: SemanticRouter;

  // Simulate 500 tools across 5 categories (100 tools each)
  const TOTAL_TOOLS = 500;
  const CATEGORIES = ['code', 'communication', 'project-management', 'cloud', 'data'];
  const TOOLS_PER_CATEGORY = 100;
  const AVERAGE_TOOL_TOKENS_FULL = 500; // Full schema
  const EXPECTED_FULL_LOAD_TOKENS = TOTAL_TOOLS * AVERAGE_TOOL_TOKENS_FULL; // 250,000

  const generateMockTools = (count: number): ToolEmbedding[] => {
    const tools: ToolEmbedding[] = [];

    for (let i = 0; i < count; i++) {
      const categoryIndex = Math.floor(i / TOOLS_PER_CATEGORY);
      const category = CATEGORIES[categoryIndex] || 'other';

      tools.push({
        toolId: `tool-${category}-${i}`,
        embedding: Array(1536).fill(0).map(() => Math.random()),
        category,
        metadata: {
          name: `Tool ${i}`,
          description: `Description for tool ${i} in ${category} category`,
          usageCount: Math.floor(Math.random() * 1000)
        }
      });
    }

    return tools;
  };

  const generateMockCategories = (): CategoryEmbedding[] => {
    return CATEGORIES.map(cat => ({
      category: cat,
      embedding: Array(1536).fill(0).map(() => Math.random()),
      toolCount: TOOLS_PER_CATEGORY,
      description: `${cat} tools and integrations`
    }));
  };

  beforeEach(async () => {
    tokenOptimizer = new TokenOptimizer();
    progressiveLoader = new ProgressiveLoader(tokenOptimizer);

    const mockEmbeddingService = new EmbeddingService({ dimensions: 1536 }) as jest.Mocked<EmbeddingService>;
    const mockCache = new RedisCache() as jest.Mocked<RedisCache>;

    mockEmbeddingService.generateEmbedding = jest.fn().mockResolvedValue(
      Array(1536).fill(0).map(() => Math.random())
    );
    mockEmbeddingService.dimensions = 1536;

    mockCache.connect = jest.fn().mockResolvedValue(undefined);
    mockCache.getToolSelection = jest.fn().mockResolvedValue(null);
    mockCache.setToolSelection = jest.fn().mockResolvedValue(undefined);

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

    // Initialize with full catalog
    const allCategories = generateMockCategories();
    const allTools = generateMockTools(TOTAL_TOOLS);

    mockCategoryIndex.size = allCategories.length;
    mockToolIndex.size = allTools.length;

    await router.initialize();
    await router.indexCategories(allCategories);
    await router.indexTools(allTools);
  });

  describe('Token Reduction Measurement', () => {
    it('should achieve 95%+ token reduction (250K → 1-3K)', async () => {
      // Mock semantic router to return 5 tools
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.92, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'tool-code-0', score: 0.95, distance: 0.05 },
        { id: 'tool-code-1', score: 0.90, distance: 0.10 },
        { id: 'tool-code-2', score: 0.85, distance: 0.15 },
        { id: 'tool-code-3', score: 0.80, distance: 0.20 },
        { id: 'tool-code-4', score: 0.75, distance: 0.25 }
      ]);

      const query = 'create a pull request on GitHub';
      const context: QueryContext = {
        tokenBudget: 3000
      };

      const selectedTools = await router.selectTools(query, context);

      // Calculate token metrics
      const actualTokens = tokenOptimizer.calculateTotalCost(selectedTools);
      const savings = tokenOptimizer.calculateSavings(
        selectedTools,
        TOTAL_TOOLS,
        AVERAGE_TOOL_TOKENS_FULL
      );

      console.log('Token Reduction Metrics:', {
        totalToolsInCatalog: TOTAL_TOOLS,
        toolsSelected: selectedTools.length,
        fullLoadTokens: savings.fullLoadTokens,
        optimizedTokens: savings.optimizedTokens,
        savingsTokens: savings.savingsTokens,
        savingsPercent: `${savings.savingsPercent.toFixed(2)}%`,
        targetReduction: '95%'
      });

      // Assertions
      expect(selectedTools.length).toBeLessThanOrEqual(5);
      expect(actualTokens).toBeGreaterThanOrEqual(1000);
      expect(actualTokens).toBeLessThanOrEqual(3000);

      // Key metric: 95%+ reduction
      expect(savings.savingsPercent).toBeGreaterThanOrEqual(95);

      // Verify baseline
      expect(savings.fullLoadTokens).toBe(EXPECTED_FULL_LOAD_TOKENS);

      // Verify actual savings
      const expectedMaxTokens = 3000;
      const minSavings = EXPECTED_FULL_LOAD_TOKENS - expectedMaxTokens;
      expect(savings.savingsTokens).toBeGreaterThanOrEqual(minSavings);
    });

    it('should validate token reduction with different token budgets', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'tool-code-0', score: 0.95, distance: 0.05 },
        { id: 'tool-code-1', score: 0.90, distance: 0.10 },
        { id: 'tool-code-2', score: 0.85, distance: 0.15 }
      ]);

      const budgets = [1000, 2000, 3000, 5000];
      const results: Array<{ budget: number; actual: number; reduction: number }> = [];

      for (const budget of budgets) {
        const tools = await router.selectTools('test query', { tokenBudget: budget });
        const actual = tokenOptimizer.calculateTotalCost(tools);
        const savings = tokenOptimizer.calculateSavings(tools, TOTAL_TOOLS, AVERAGE_TOOL_TOKENS_FULL);

        results.push({
          budget,
          actual,
          reduction: savings.savingsPercent
        });

        // Verify budget respected
        expect(actual).toBeLessThanOrEqual(budget);

        // Verify reduction always high
        expect(savings.savingsPercent).toBeGreaterThanOrEqual(95);
      }

      console.log('Token Budget Analysis:', results);
    });

    it('should measure tiered loading token savings', async () => {
      const mockCategoryIndex = router['_categoryIndex'] as any;
      const mockToolIndex = router['_toolIndex'] as any;

      mockCategoryIndex.search.mockResolvedValue([
        { id: 'code', score: 0.9, distance: 0.1 }
      ]);

      mockToolIndex.search.mockResolvedValue([
        { id: 'tool-code-0', score: 0.95, distance: 0.05 },
        { id: 'tool-code-1', score: 0.90, distance: 0.10 },
        { id: 'tool-code-2', score: 0.85, distance: 0.15 },
        { id: 'tool-code-3', score: 0.80, distance: 0.20 },
        { id: 'tool-code-4', score: 0.75, distance: 0.25 },
        { id: 'tool-code-5', score: 0.70, distance: 0.30 },
        { id: 'tool-code-6', score: 0.65, distance: 0.35 },
        { id: 'tool-code-7', score: 0.60, distance: 0.40 }
      ]);

      const tieredResult = await router.selectToolsWithTiers('complex query', {
        tokenBudget: 2000
      });

      console.log('Tiered Loading Metrics:', {
        tier1Count: tieredResult.tier1.length,
        tier2Count: tieredResult.tier2.length,
        tier3Count: tieredResult.tier3.length,
        totalTokens: tieredResult.totalTokens,
        reductionPercentage: `${tieredResult.reductionPercentage.toFixed(2)}%`,
        tier1AvgTokens: tieredResult.tier1.length > 0
          ? Math.round(tieredResult.tier1.reduce((sum, t) => sum + t.tokenCost, 0) / tieredResult.tier1.length)
          : 0
      });

      // Verify tiered structure
      expect(tieredResult.tier1.length).toBeGreaterThan(0);
      expect(tieredResult.totalTokens).toBeLessThanOrEqual(2000);
      expect(tieredResult.reductionPercentage).toBeGreaterThanOrEqual(95);

      // Verify tier 1 has minimal tokens
      if (tieredResult.tier1.length > 0) {
        const tier1AvgTokens = tieredResult.tier1.reduce((sum, t) => sum + t.tokenCost, 0) / tieredResult.tier1.length;
        expect(tier1AvgTokens).toBeLessThan(150); // Minimal schema
      }
    });
  });

  describe('Token Optimizer Unit Tests', () => {
    it('should optimize tools to fit strict budget', () => {
      const tools: ToolSelection[] = [
        {
          toolId: 'tool1',
          name: 'Tool 1',
          description: 'Test',
          category: 'code',
          score: 0.95,
          tokenCost: 300,
          tier: 2,
          schema: {
            name: 'Tool 1',
            description: 'Test',
            parameters: { type: 'object', properties: {} }
          }
        },
        {
          toolId: 'tool2',
          name: 'Tool 2',
          description: 'Test',
          category: 'code',
          score: 0.90,
          tokenCost: 250,
          tier: 2,
          schema: {
            name: 'Tool 2',
            description: 'Test',
            parameters: { type: 'object', properties: {} }
          }
        },
        {
          toolId: 'tool3',
          name: 'Tool 3',
          description: 'Test',
          category: 'code',
          score: 0.85,
          tokenCost: 200,
          tier: 2,
          schema: {
            name: 'Tool 3',
            description: 'Test',
            parameters: { type: 'object', properties: {} }
          }
        }
      ];

      const budget = 400;
      const optimized = tokenOptimizer.optimize(tools, budget);

      const totalCost = tokenOptimizer.calculateTotalCost(optimized);

      expect(totalCost).toBeLessThanOrEqual(budget);
      expect(optimized.length).toBeGreaterThan(0);

      // Should prioritize higher scores
      expect(optimized[0].score).toBeGreaterThanOrEqual(optimized[optimized.length - 1].score);
    });

    it('should downgrade tiers to fit budget', () => {
      const tools: ToolSelection[] = [
        {
          toolId: 'tool1',
          name: 'Tool 1',
          description: 'Large tool with examples',
          category: 'code',
          score: 0.95,
          tokenCost: 800,
          tier: 3,
          schema: {
            name: 'Tool 1',
            description: 'Large tool',
            parameters: { type: 'object', properties: {} },
            examples: [{ description: 'Example', input: {} }]
          }
        }
      ];

      const budget = 300;
      const optimized = tokenOptimizer.optimize(tools, budget);

      expect(optimized.length).toBe(1);
      expect(optimized[0].tier).toBeLessThan(3); // Downgraded
      expect(optimized[0].tokenCost).toBeLessThanOrEqual(budget);
    });

    it('should calculate accurate token savings', () => {
      const selectedTools: ToolSelection[] = [
        {
          toolId: 'tool1',
          name: 'Tool 1',
          description: 'Test',
          category: 'code',
          score: 0.9,
          tokenCost: 150,
          tier: 1
        },
        {
          toolId: 'tool2',
          name: 'Tool 2',
          description: 'Test',
          category: 'code',
          score: 0.85,
          tokenCost: 200,
          tier: 2
        }
      ];

      const savings = tokenOptimizer.calculateSavings(selectedTools, 500, 500);

      expect(savings.optimizedTokens).toBe(350);
      expect(savings.fullLoadTokens).toBe(250000);
      expect(savings.savingsTokens).toBe(249650);
      expect(savings.savingsPercent).toBeCloseTo(99.86, 1);
    });
  });

  describe('Progressive Loader Tests', () => {
    it('should create tiered tool set with correct token distribution', () => {
      const tools: ToolSelection[] = Array.from({ length: 10 }, (_, i) => ({
        toolId: `tool-${i}`,
        name: `Tool ${i}`,
        description: 'Test tool',
        category: 'code',
        score: 0.9 - (i * 0.05),
        tokenCost: 0,
        tier: 3,
        schema: {
          name: `Tool ${i}`,
          description: 'Test',
          parameters: { type: 'object' },
          examples: []
        }
      }));

      const tiered = progressiveLoader.loadTiered(tools, 2000);

      console.log('Tiered Distribution:', {
        tier1: tiered.tier1.length,
        tier2: tiered.tier2.length,
        tier3: tiered.tier3.length,
        totalTokens: tiered.totalTokens
      });

      expect(tiered.tier1.length).toBeGreaterThan(0);
      expect(tiered.totalTokens).toBeLessThanOrEqual(2000);
      expect(tiered.reductionPercentage).toBeGreaterThan(0);

      // Verify tier assignment
      tiered.tier1.forEach(t => expect(t.tier).toBe(1));
      tiered.tier2.forEach(t => expect(t.tier).toBe(2));
      tiered.tier3.forEach(t => expect(t.tier).toBe(3));
    });
  });

  describe('Performance Benchmarks', () => {
    it('should process large tool sets efficiently', () => {
      const largeToolSet: ToolSelection[] = Array.from({ length: 100 }, (_, i) => ({
        toolId: `tool-${i}`,
        name: `Tool ${i}`,
        description: `Description for tool ${i}`,
        category: 'code',
        score: Math.random(),
        tokenCost: Math.floor(Math.random() * 500) + 100,
        tier: 2
      }));

      const start = Date.now();
      const optimized = tokenOptimizer.optimize(largeToolSet, 3000);
      const duration = Date.now() - start;

      console.log(`Optimized 100 tools in ${duration}ms`);

      expect(duration).toBeLessThan(50); // Should be fast
      expect(optimized.length).toBeGreaterThan(0);
      expect(tokenOptimizer.calculateTotalCost(optimized)).toBeLessThanOrEqual(3000);
    });
  });
});
