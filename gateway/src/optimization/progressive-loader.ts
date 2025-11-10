/**
 * Progressive schema loading (Less-is-More pattern)
 * Three-tier loading: minimal → medium → full
 */

import { ToolSelection, TieredToolSet, ToolSchema } from '../types/routing.types';
import { TokenOptimizer } from './token-optimizer';
import { logger } from '../logging/logger';

const TIER1_MAX_TOOLS = 3;
const TIER2_MAX_TOOLS = 5;

export class ProgressiveLoader {
  private readonly _tokenOptimizer: TokenOptimizer;

  constructor(tokenOptimizer?: TokenOptimizer) {
    this._tokenOptimizer = tokenOptimizer || new TokenOptimizer();
  }

  /**
   * Create tiered tool set with progressive loading
   * Tier 1: Top 3 tools with minimal schema (name + description only)
   * Tier 2: Next 5 tools with medium schema (+ parameters, no examples)
   * Tier 3: Remaining tools with lazy loading (ID + load URL only)
   */
  loadTiered(tools: ToolSelection[], tokenBudget?: number): TieredToolSet {
    // Sort by score descending
    const sorted = [...tools].sort((a, b) => b.score - a.score);

    // Tier 1: Essential tools (minimal schema)
    const tier1 = sorted.slice(0, TIER1_MAX_TOOLS).map(tool => ({
      ...tool,
      tier: 1 as const,
      schema: {
        name: tool.name,
        description: tool.description
      } as ToolSchema,
      tokenCost: this._tokenOptimizer.estimateTokenCost({
        ...tool,
        tier: 1,
        schema: {
          name: tool.name,
          description: tool.description
        }
      })
    }));

    // Tier 2: Contextual tools (medium schema)
    const tier2 = sorted.slice(TIER1_MAX_TOOLS, TIER1_MAX_TOOLS + TIER2_MAX_TOOLS).map(tool => ({
      ...tool,
      tier: 2 as const,
      schema: tool.schema ? {
        name: tool.schema.name,
        description: tool.schema.description,
        parameters: tool.schema.parameters,
        requiresAuth: tool.schema.requiresAuth,
        rateLimit: tool.schema.rateLimit,
        examples: [] // Omit examples in tier 2
      } as ToolSchema : undefined,
      tokenCost: this._tokenOptimizer.estimateTokenCost({
        ...tool,
        tier: 2,
        schema: tool.schema ? {
          ...tool.schema,
          examples: []
        } : undefined
      })
    }));

    // Tier 3: Lazy-loaded tools (ID + URL only)
    const tier3 = sorted.slice(TIER1_MAX_TOOLS + TIER2_MAX_TOOLS).map(tool => ({
      ...tool,
      tier: 3 as const,
      schema: undefined, // No schema in tier 3
      loadUrl: `/tools/${tool.toolId}/full-schema`,
      tokenCost: this._tokenOptimizer.estimateTokenCost({
        ...tool,
        tier: 3,
        schema: undefined
      })
    }));

    // Calculate total tokens (tier1 + tier2 only, tier3 is lazy)
    const totalTokens = this._tokenOptimizer.calculateTotalCost([...tier1, ...tier2]);

    // Calculate token reduction
    const fullLoadTokens = tools.length * 500; // Assume avg 500 tokens per full tool
    const reductionPercentage = ((fullLoadTokens - totalTokens) / fullLoadTokens) * 100;

    const result: TieredToolSet = {
      tier1,
      tier2,
      tier3,
      totalTokens,
      reductionPercentage
    };

    logger.info('Progressive loading completed', {
      tier1Count: tier1.length,
      tier2Count: tier2.length,
      tier3Count: tier3.length,
      totalTokens,
      reductionPct: reductionPercentage.toFixed(1),
      tokenBudget: tokenBudget || 'none'
    });

    // Apply token budget if specified
    if (tokenBudget && totalTokens > tokenBudget) {
      return this._applyTokenBudget(result, tokenBudget);
    }

    return result;
  }

  /**
   * Load full schema for a tier 3 tool (lazy loading)
   */
  async loadFullSchema(toolId: string): Promise<ToolSchema> {
    // TODO: Implement actual schema loading from tool registry
    // For now, return placeholder
    logger.info('Loading full schema for tool', { toolId });

    return {
      name: toolId,
      description: 'Full schema loaded on demand',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    };
  }

  /**
   * Apply token budget by downgrading tiers if needed
   */
  private _applyTokenBudget(tieredSet: TieredToolSet, budget: number): TieredToolSet {
    let currentTokens = tieredSet.totalTokens;

    // Start by removing tier 2 tools if needed
    const optimizedTier2: ToolSelection[] = [];

    for (const tool of tieredSet.tier2) {
      if (currentTokens <= budget) {
        optimizedTier2.push(tool);
      } else {
        // Move to tier 3 (lazy load)
        tieredSet.tier3.push({
          ...tool,
          tier: 3,
          schema: undefined,
          loadUrl: `/tools/${tool.toolId}/full-schema`,
          tokenCost: this._tokenOptimizer.estimateTokenCost({
            ...tool,
            tier: 3,
            schema: undefined
          })
        });
        currentTokens -= tool.tokenCost;
      }
    }

    // If still over budget, downgrade tier 1 tools
    const optimizedTier1: ToolSelection[] = [];

    for (const tool of tieredSet.tier1) {
      if (currentTokens <= budget) {
        optimizedTier1.push(tool);
      } else {
        // Keep at tier 1 but remove from immediate load
        // This shouldn't happen often as tier 1 is minimal
        logger.warn('Token budget very restrictive, limiting tier 1 tools', {
          budget,
          currentTokens
        });
      }
    }

    const newTotalTokens = this._tokenOptimizer.calculateTotalCost([
      ...optimizedTier1,
      ...optimizedTier2
    ]);

    return {
      tier1: optimizedTier1,
      tier2: optimizedTier2,
      tier3: tieredSet.tier3,
      totalTokens: newTotalTokens,
      reductionPercentage: tieredSet.reductionPercentage
    };
  }

  /**
   * Get schema tier for a tool based on its rank
   */
  getTierForRank(rank: number): 1 | 2 | 3 {
    if (rank < TIER1_MAX_TOOLS) {
      return 1;
    } else if (rank < TIER1_MAX_TOOLS + TIER2_MAX_TOOLS) {
      return 2;
    } else {
      return 3;
    }
  }

  /**
   * Estimate token savings from progressive loading
   */
  estimateSavings(toolCount: number): {
    tier1Tokens: number;
    tier2Tokens: number;
    tier3Tokens: number;
    totalImmediate: number;
    fullLoadTokens: number;
    savings: number;
    savingsPercent: number;
  } {
    const tier1Count = Math.min(toolCount, TIER1_MAX_TOOLS);
    const tier2Count = Math.min(Math.max(0, toolCount - TIER1_MAX_TOOLS), TIER2_MAX_TOOLS);
    const tier3Count = Math.max(0, toolCount - TIER1_MAX_TOOLS - TIER2_MAX_TOOLS);

    // Estimate tokens per tier
    const tier1Tokens = tier1Count * 50; // Name + description only
    const tier2Tokens = tier2Count * 150; // + parameters
    const tier3Tokens = tier3Count * 30; // Just ID + URL
    const totalImmediate = tier1Tokens + tier2Tokens;

    const fullLoadTokens = toolCount * 500; // Full schema for all
    const savings = fullLoadTokens - totalImmediate;
    const savingsPercent = (savings / fullLoadTokens) * 100;

    return {
      tier1Tokens,
      tier2Tokens,
      tier3Tokens,
      totalImmediate,
      fullLoadTokens,
      savings,
      savingsPercent
    };
  }
}
