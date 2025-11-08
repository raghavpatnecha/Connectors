/**
 * Semantic router with two-level retrieval (Category → Tools)
 * Implements intelligent tool selection using FAISS vector search
 */

import { FAISSIndex } from './faiss-index';
import { EmbeddingService } from './embedding-service';
import { ProgressiveLoader } from '../optimization/progressive-loader';
import { TokenOptimizer } from '../optimization/token-optimizer';
import { RedisCache } from '../caching/redis-cache';
import { ToolSelectionError } from '../errors/gateway-errors';
import { logger, logToolSelectionMetrics } from '../logging/logger';
import {
  QueryContext,
  ToolSelection,
  TieredToolSet,
  ToolEmbedding,
  CategoryEmbedding,
  RoutingMetrics
} from '../types/routing.types';

// Configuration constants
const MAX_TOOLS_PER_QUERY = 5;
const CATEGORY_THRESHOLD = 0.7;
const TOOL_THRESHOLD = 0.5;
const MAX_CATEGORIES = 3;

export class SemanticRouter {
  private readonly _categoryIndex: FAISSIndex;
  private readonly _toolIndex: FAISSIndex;
  private readonly _embeddingService: EmbeddingService;
  private readonly _progressiveLoader: ProgressiveLoader;
  private readonly _tokenOptimizer: TokenOptimizer;
  private readonly _cache: RedisCache;

  private _categoryEmbeddings: Map<string, CategoryEmbedding> = new Map();
  private _toolEmbeddings: Map<string, ToolEmbedding> = new Map();
  private _toolsByCategory: Map<string, Set<string>> = new Map();

  constructor(
    categoryIndexPath: string,
    toolIndexPath: string,
    embeddingService: EmbeddingService,
    cache?: RedisCache
  ) {
    this._categoryIndex = new FAISSIndex({
      indexPath: categoryIndexPath,
      dimension: embeddingService.dimensions,
      indexType: 'Flat'
    });

    this._toolIndex = new FAISSIndex({
      indexPath: toolIndexPath,
      dimension: embeddingService.dimensions,
      indexType: 'Flat'
    });

    this._embeddingService = embeddingService;
    this._tokenOptimizer = new TokenOptimizer();
    this._progressiveLoader = new ProgressiveLoader(this._tokenOptimizer);
    this._cache = cache || new RedisCache();
  }

  /**
   * Initialize the semantic router
   */
  async initialize(): Promise<void> {
    logger.info('Initializing semantic router');

    await Promise.all([
      this._categoryIndex.initialize(),
      this._toolIndex.initialize(),
      this._cache.connect()
    ]);

    logger.info('Semantic router initialized', {
      categoryVectors: this._categoryIndex.size,
      toolVectors: this._toolIndex.size
    });
  }

  /**
   * Two-level tool selection: category → tools
   * Implements Tool-to-Agent retrieval pattern for better accuracy
   */
  async selectTools(
    query: string,
    context: QueryContext = {}
  ): Promise<ToolSelection[]> {
    const startTime = Date.now();
    let faissLatency = 0;

    try {
      // Check cache first
      const cached = await this._cache.getToolSelection(query, context);
      if (cached) {
        const metrics: RoutingMetrics = {
          query,
          categoriesFound: 0,
          toolsSelected: cached.length,
          faissLatency: 0,
          totalLatency: Date.now() - startTime,
          tokenCost: this._tokenOptimizer.calculateTotalCost(cached),
          tokenReductionPct: 95,
          cacheHit: true
        };

        logToolSelectionMetrics(metrics);
        return cached;
      }

      // Step 1: Category selection (coarse-grained)
      const faissStart = Date.now();
      const categories = await this._selectCategories(query, context, MAX_CATEGORIES);
      faissLatency += Date.now() - faissStart;

      if (categories.length === 0) {
        logger.warn('No categories found, using fallback', { query });
        return await this._fallbackToolSelection(context);
      }

      // Step 2: Tool selection within categories (fine-grained)
      const faissStart2 = Date.now();
      const tools = await this._selectWithinCategories(
        categories,
        query,
        context,
        MAX_TOOLS_PER_QUERY
      );
      faissLatency += Date.now() - faissStart2;

      // Step 3: Token optimization
      const optimized = this._tokenOptimizer.optimize(
        tools,
        context.tokenBudget || 3000
      );

      // Cache the result
      await this._cache.setToolSelection(query, context, optimized);

      // Log metrics
      const totalLatency = Date.now() - startTime;
      const tokenCost = this._tokenOptimizer.calculateTotalCost(optimized);
      const savings = this._tokenOptimizer.calculateSavings(optimized, 500, 500);

      const metrics: RoutingMetrics = {
        query,
        categoriesFound: categories.length,
        toolsSelected: optimized.length,
        faissLatency,
        totalLatency,
        tokenCost,
        tokenReductionPct: savings.savingsPercent,
        cacheHit: false
      };

      logToolSelectionMetrics(metrics);

      return optimized;
    } catch (error) {
      throw new ToolSelectionError(
        'Failed to select tools',
        query,
        context,
        error as Error
      );
    }
  }

  /**
   * Select tools with progressive loading (tiered schemas)
   */
  async selectToolsWithTiers(
    query: string,
    context: QueryContext = {}
  ): Promise<TieredToolSet> {
    const tools = await this.selectTools(query, context);
    return this._progressiveLoader.loadTiered(tools, context.tokenBudget);
  }

  /**
   * Index category embeddings
   */
  async indexCategories(categories: CategoryEmbedding[]): Promise<void> {
    logger.info('Indexing categories', { count: categories.length });

    const embeddings = categories.map(c => c.embedding);
    const ids = categories.map(c => c.category);

    await this._categoryIndex.add(embeddings, ids);
    await this._categoryIndex.save();

    // Store in memory map
    categories.forEach(cat => {
      this._categoryEmbeddings.set(cat.category, cat);
    });

    logger.info('Categories indexed', {
      count: categories.length,
      totalVectors: this._categoryIndex.size
    });
  }

  /**
   * Index tool embeddings
   */
  async indexTools(tools: ToolEmbedding[]): Promise<void> {
    logger.info('Indexing tools', { count: tools.length });

    const embeddings = tools.map(t => t.embedding);
    const ids = tools.map(t => t.toolId);

    await this._toolIndex.add(embeddings, ids);
    await this._toolIndex.save();

    // Store in memory maps
    tools.forEach(tool => {
      this._toolEmbeddings.set(tool.toolId, tool);

      // Build category → tools mapping
      if (!this._toolsByCategory.has(tool.category)) {
        this._toolsByCategory.set(tool.category, new Set());
      }
      this._toolsByCategory.get(tool.category)!.add(tool.toolId);
    });

    logger.info('Tools indexed', {
      count: tools.length,
      totalVectors: this._toolIndex.size,
      categories: this._toolsByCategory.size
    });
  }

  /**
   * Select categories for the query
   */
  private async _selectCategories(
    query: string,
    context: QueryContext,
    maxCategories: number
  ): Promise<string[]> {
    // Check if categories are pre-specified in context
    if (context.allowedCategories && context.allowedCategories.length > 0) {
      logger.debug('Using pre-specified categories', {
        categories: context.allowedCategories
      });
      return context.allowedCategories;
    }

    // Generate query embedding
    const embedding = await this._embeddingService.generateEmbedding(query);

    // Search category index
    const results = await this._categoryIndex.search(
      embedding,
      maxCategories,
      CATEGORY_THRESHOLD
    );

    const categories = results.map(r => r.id);

    logger.debug('Categories selected', {
      query,
      categories,
      scores: results.map(r => r.score.toFixed(3))
    });

    return categories;
  }

  /**
   * Select tools within specific categories
   */
  private async _selectWithinCategories(
    categories: string[],
    query: string,
    _context: QueryContext,
    maxTools: number
  ): Promise<ToolSelection[]> {
    // Get all tool IDs in these categories
    const candidateToolIds = new Set<string>();
    categories.forEach(category => {
      const tools = this._toolsByCategory.get(category);
      if (tools) {
        tools.forEach(toolId => candidateToolIds.add(toolId));
      }
    });

    if (candidateToolIds.size === 0) {
      logger.warn('No tools found in categories', { categories });
      return [];
    }

    // Generate query embedding
    const embedding = await this._embeddingService.generateEmbedding(query);

    // Search tool index (broader search, then filter by category)
    const searchResults = await this._toolIndex.search(
      embedding,
      maxTools * 3, // Search more, then filter
      TOOL_THRESHOLD
    );

    // Filter by candidate tools and convert to ToolSelection
    const selections: ToolSelection[] = [];

    for (const result of searchResults) {
      if (!candidateToolIds.has(result.id)) {
        continue;
      }

      const toolEmbed = this._toolEmbeddings.get(result.id);
      if (!toolEmbed) {
        continue;
      }

      const selection: ToolSelection = {
        toolId: toolEmbed.toolId,
        name: toolEmbed.metadata.name,
        description: toolEmbed.metadata.description,
        category: toolEmbed.category,
        score: result.score,
        tokenCost: 0, // Will be calculated by optimizer
        tier: 1,
        schema: {
          name: toolEmbed.metadata.name,
          description: toolEmbed.metadata.description
        }
      };

      // Estimate token cost
      selection.tokenCost = this._tokenOptimizer.estimateTokenCost(selection);

      selections.push(selection);

      if (selections.length >= maxTools) {
        break;
      }
    }

    logger.debug('Tools selected within categories', {
      categories,
      toolsFound: selections.length,
      avgScore: (selections.reduce((sum, s) => sum + s.score, 0) / selections.length).toFixed(3)
    });

    return selections;
  }

  /**
   * Fallback tool selection when semantic search fails
   * Returns top tools from primary category or most popular tools
   */
  private async _fallbackToolSelection(context: QueryContext): Promise<ToolSelection[]> {
    logger.warn('Using fallback tool selection');

    const category = context.primaryCategory || 'code'; // Default to code
    const toolIds = this._toolsByCategory.get(category);

    if (!toolIds || toolIds.size === 0) {
      return [];
    }

    // Get top 5 tools from category (by usage count)
    const tools = Array.from(toolIds)
      .map(id => this._toolEmbeddings.get(id))
      .filter((t): t is ToolEmbedding => t !== undefined)
      .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
      .slice(0, MAX_TOOLS_PER_QUERY);

    const selections: ToolSelection[] = tools.map(tool => ({
      toolId: tool.toolId,
      name: tool.metadata.name,
      description: tool.metadata.description,
      category: tool.category,
      score: 0.5, // Fallback score
      tokenCost: 0,
      tier: 1,
      schema: {
        name: tool.metadata.name,
        description: tool.metadata.description
      }
    }));

    // Calculate token costs
    selections.forEach(s => {
      s.tokenCost = this._tokenOptimizer.estimateTokenCost(s);
    });

    return selections;
  }

  /**
   * Get metrics for monitoring
   */
  getMetrics(): {
    categoryCount: number;
    toolCount: number;
    categoriesWithTools: number;
    avgToolsPerCategory: number;
  } {
    const categoriesWithTools = Array.from(this._toolsByCategory.values())
      .filter(tools => tools.size > 0).length;

    const totalTools = Array.from(this._toolsByCategory.values())
      .reduce((sum, tools) => sum + tools.size, 0);

    return {
      categoryCount: this._categoryEmbeddings.size,
      toolCount: this._toolEmbeddings.size,
      categoriesWithTools,
      avgToolsPerCategory: categoriesWithTools > 0 ? totalTools / categoriesWithTools : 0
    };
  }
}
