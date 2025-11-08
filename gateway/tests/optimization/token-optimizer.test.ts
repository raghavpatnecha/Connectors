/**
 * Tests for TokenOptimizer
 */

import { TokenOptimizer } from '../../src/optimization/token-optimizer';
import { ToolSelection } from '../../src/types/routing.types';

describe('TokenOptimizer', () => {
  let optimizer: TokenOptimizer;

  beforeEach(() => {
    optimizer = new TokenOptimizer();
  });

  const createMockTool = (id: string, score: number, tier: 1 | 2 | 3): ToolSelection => ({
    toolId: id,
    name: `Tool ${id}`,
    description: `Description for ${id}`,
    category: 'test',
    score,
    tokenCost: tier === 1 ? 50 : tier === 2 ? 150 : 500,
    tier,
    schema: tier < 3 ? {
      name: `Tool ${id}`,
      description: `Description for ${id}`
    } : undefined
  });

  describe('optimize', () => {
    it('should select tools within token budget', () => {
      const tools: ToolSelection[] = [
        createMockTool('1', 0.9, 2),
        createMockTool('2', 0.8, 2),
        createMockTool('3', 0.7, 2),
        createMockTool('4', 0.6, 2)
      ];

      const result = optimizer.optimize(tools, 300);

      expect(result.length).toBeLessThanOrEqual(tools.length);
      const totalCost = optimizer.calculateTotalCost(result);
      expect(totalCost).toBeLessThanOrEqual(300);
    });

    it('should prioritize higher-scored tools', () => {
      const tools: ToolSelection[] = [
        createMockTool('low', 0.5, 2),
        createMockTool('high', 0.95, 2),
        createMockTool('medium', 0.7, 2)
      ];

      const result = optimizer.optimize(tools, 500);

      expect(result[0].toolId).toBe('high');
      expect(result[result.length - 1].score).toBeLessThan(result[0].score);
    });

    it('should downgrade tiers to fit budget', () => {
      const tools: ToolSelection[] = [
        createMockTool('1', 0.9, 3), // 500 tokens
        createMockTool('2', 0.8, 3)  // 500 tokens
      ];

      const result = optimizer.optimize(tools, 600);

      // Should keep one at tier 3, downgrade another
      expect(result.length).toBeGreaterThan(0);
      const totalCost = optimizer.calculateTotalCost(result);
      expect(totalCost).toBeLessThanOrEqual(600);
    });
  });

  describe('estimateTokenCost', () => {
    it('should estimate minimal cost for tier 1 tools', () => {
      const tool = createMockTool('test', 0.9, 1);
      const cost = optimizer.estimateTokenCost(tool);

      expect(cost).toBeLessThan(100);
    });

    it('should estimate medium cost for tier 2 tools', () => {
      const tool = createMockTool('test', 0.9, 2);
      tool.schema = {
        name: 'Test',
        description: 'Test',
        parameters: {
          type: 'object',
          properties: {
            param1: { type: 'string', description: 'Param 1' }
          }
        }
      };

      const cost = optimizer.estimateTokenCost(tool);

      expect(cost).toBeGreaterThan(50);
      expect(cost).toBeLessThan(300);
    });
  });

  describe('calculateTotalCost', () => {
    it('should sum token costs correctly', () => {
      const tools: ToolSelection[] = [
        createMockTool('1', 0.9, 1), // 50
        createMockTool('2', 0.8, 2), // 150
        createMockTool('3', 0.7, 3)  // 500
      ];

      const total = optimizer.calculateTotalCost(tools);

      expect(total).toBe(700);
    });
  });

  describe('fitsInBudget', () => {
    it('should return true when tools fit in budget', () => {
      const tools: ToolSelection[] = [
        createMockTool('1', 0.9, 1),
        createMockTool('2', 0.8, 1)
      ];

      expect(optimizer.fitsInBudget(tools, 200)).toBe(true);
    });

    it('should return false when tools exceed budget', () => {
      const tools: ToolSelection[] = [
        createMockTool('1', 0.9, 3),
        createMockTool('2', 0.8, 3)
      ];

      expect(optimizer.fitsInBudget(tools, 500)).toBe(false);
    });
  });

  describe('getTierDistribution', () => {
    it('should count tools per tier correctly', () => {
      const tools: ToolSelection[] = [
        createMockTool('1', 0.9, 1),
        createMockTool('2', 0.8, 1),
        createMockTool('3', 0.7, 2),
        createMockTool('4', 0.6, 3)
      ];

      const distribution = optimizer.getTierDistribution(tools);

      expect(distribution.tier1).toBe(2);
      expect(distribution.tier2).toBe(1);
      expect(distribution.tier3).toBe(1);
    });
  });

  describe('calculateSavings', () => {
    it('should calculate token savings correctly', () => {
      const optimized: ToolSelection[] = [
        createMockTool('1', 0.9, 1),
        createMockTool('2', 0.8, 2)
      ];

      const savings = optimizer.calculateSavings(optimized, 100, 500);

      expect(savings.optimizedTokens).toBe(200);
      expect(savings.fullLoadTokens).toBe(50000);
      expect(savings.savingsTokens).toBe(49800);
      expect(savings.savingsPercent).toBeGreaterThan(99);
    });
  });
});
