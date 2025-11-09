/**
 * Token budget optimization for tool schemas
 */

import { ToolSelection } from '../types/routing.types';
import { TokenBudgetExceededError } from '../errors/gateway-errors';
import { logger } from '../logging/logger';

const DEFAULT_TOKEN_BUDGET = 3000;
const AVERAGE_TOKENS_PER_CHAR = 0.25; // Rough estimate

export class TokenOptimizer {
  /**
   * Optimize tool selections to fit within token budget
   */
  optimize(
    tools: ToolSelection[],
    tokenBudget: number = DEFAULT_TOKEN_BUDGET
  ): ToolSelection[] {
    // Sort by score descending (highest quality first)
    const sorted = [...tools].sort((a, b) => b.score - a.score);

    const optimized: ToolSelection[] = [];
    let currentTokens = 0;

    for (const tool of sorted) {
      const toolTokens = tool.tokenCost;

      if (currentTokens + toolTokens <= tokenBudget) {
        optimized.push(tool);
        currentTokens += toolTokens;
      } else {
        // Check if we can downgrade the tier
        const downgraded = this._downgradeTier(tool);

        if (downgraded && currentTokens + downgraded.tokenCost <= tokenBudget) {
          optimized.push(downgraded);
          currentTokens += downgraded.tokenCost;
        } else {
          // Skip this tool
          logger.debug('Tool skipped due to token budget', {
            toolId: tool.toolId,
            requiredTokens: toolTokens,
            remainingBudget: tokenBudget - currentTokens
          });
        }
      }
    }

    logger.info('Token optimization completed', {
      originalCount: tools.length,
      optimizedCount: optimized.length,
      tokenBudget,
      tokensUsed: currentTokens,
      utilizationPct: ((currentTokens / tokenBudget) * 100).toFixed(1)
    });

    return optimized;
  }

  /**
   * Estimate token cost for a tool based on schema size
   */
  estimateTokenCost(tool: ToolSelection): number {
    if (!tool.schema) {
      // Minimal schema (tier 3 lazy load)
      return this._estimateTextTokens(tool.name + tool.description);
    }

    let totalChars = 0;

    // Basic info
    totalChars += tool.name.length + tool.description.length;

    // Parameters
    if (tool.schema.parameters) {
      totalChars += JSON.stringify(tool.schema.parameters).length;
    }

    // Examples (tier 2 doesn't include examples)
    if (tool.schema.examples && tool.tier === 3) {
      totalChars += JSON.stringify(tool.schema.examples).length;
    }

    return Math.ceil(totalChars * AVERAGE_TOKENS_PER_CHAR);
  }

  /**
   * Calculate total token cost for tool set
   */
  calculateTotalCost(tools: ToolSelection[]): number {
    return tools.reduce((sum, tool) => sum + tool.tokenCost, 0);
  }

  /**
   * Check if tools fit within budget
   */
  fitsInBudget(tools: ToolSelection[], budget: number): boolean {
    return this.calculateTotalCost(tools) <= budget;
  }

  /**
   * Validate token budget is not exceeded
   */
  validateBudget(tools: ToolSelection[], budget: number): void {
    const totalCost = this.calculateTotalCost(tools);

    if (totalCost > budget) {
      throw new TokenBudgetExceededError(
        `Token budget exceeded: ${totalCost} > ${budget}`,
        totalCost,
        budget
      );
    }
  }

  /**
   * Downgrade tool tier to reduce token cost
   */
  private _downgradeTier(tool: ToolSelection): ToolSelection | null {
    if (tool.tier === 1) {
      // Already minimal
      return null;
    }

    const downgraded = { ...tool };

    if (tool.tier === 3) {
      // Downgrade to tier 2 (remove examples)
      downgraded.tier = 2;
      if (downgraded.schema) {
        downgraded.schema = {
          ...downgraded.schema,
          examples: []
        };
      }
    } else if (tool.tier === 2) {
      // Downgrade to tier 1 (minimal schema)
      downgraded.tier = 1;
      downgraded.schema = undefined;
      downgraded.loadUrl = `/tools/${tool.toolId}/full-schema`;
    }

    // Recalculate token cost
    downgraded.tokenCost = this.estimateTokenCost(downgraded);

    return downgraded;
  }

  /**
   * Estimate tokens from character count
   */
  private _estimateTextTokens(text: string): number {
    return Math.ceil(text.length * AVERAGE_TOKENS_PER_CHAR);
  }

  /**
   * Get tier distribution for tool set
   */
  getTierDistribution(tools: ToolSelection[]): {
    tier1: number;
    tier2: number;
    tier3: number;
  } {
    return {
      tier1: tools.filter(t => t.tier === 1).length,
      tier2: tools.filter(t => t.tier === 2).length,
      tier3: tools.filter(t => t.tier === 3).length
    };
  }

  /**
   * Calculate token savings vs loading all tools at tier 3
   */
  calculateSavings(
    optimizedTools: ToolSelection[],
    allToolsCount: number,
    averageFullToolTokens: number = 500
  ): {
    optimizedTokens: number;
    fullLoadTokens: number;
    savingsTokens: number;
    savingsPercent: number;
  } {
    const optimizedTokens = this.calculateTotalCost(optimizedTools);
    const fullLoadTokens = allToolsCount * averageFullToolTokens;
    const savingsTokens = fullLoadTokens - optimizedTokens;
    const savingsPercent = ((savingsTokens / fullLoadTokens) * 100);

    return {
      optimizedTokens,
      fullLoadTokens,
      savingsTokens,
      savingsPercent
    };
  }
}
