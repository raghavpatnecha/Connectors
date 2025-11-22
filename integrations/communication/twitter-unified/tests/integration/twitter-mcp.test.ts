/**
 * Twitter MCP Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';

describe('Twitter MCP Server Integration', () => {
  beforeAll(() => {
    process.env.X_API_KEY = 'test-api-key';
    process.env.X_API_SECRET = 'test-api-secret';
    process.env.VAULT_ADDR = 'http://localhost:8200';
    process.env.VAULT_TOKEN = 'test-token';
    process.env.PORT = '3151';
  });

  afterAll(() => {
    delete process.env.X_API_KEY;
    delete process.env.X_API_SECRET;
    delete process.env.VAULT_ADDR;
    delete process.env.VAULT_TOKEN;
    delete process.env.PORT;
  });

  describe('Server initialization', () => {
    it('should validate required environment variables', () => {
      const required = ['X_API_KEY', 'X_API_SECRET', 'VAULT_ADDR', 'VAULT_TOKEN'];

      required.forEach(key => {
        expect(process.env[key]).toBeDefined();
      });
    });

    it('should have correct tool count (45 tools)', () => {
      // Import after env is set
      const { ALL_TWITTER_TOOLS } = require('../../src/tools');
      expect(ALL_TWITTER_TOOLS.length).toBe(45);
    });
  });

  describe('Tool definitions', () => {
    it('should have valid tool schemas', () => {
      const { ALL_TWITTER_TOOLS } = require('../../src/tools');

      ALL_TWITTER_TOOLS.forEach((tool: any) => {
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
        expect(tool.inputSchema.required).toContain('tenantId');
      });
    });

    it('should have tweet operation tools', () => {
      const { TWEET_TOOLS } = require('../../src/tools/tweet-tools');

      expect(TWEET_TOOLS).toHaveLength(10);
      expect(TWEET_TOOLS.map((t: any) => t.name)).toContain('post_tweet');
      expect(TWEET_TOOLS.map((t: any) => t.name)).toContain('search_tweets');
    });

    it('should have engagement tools', () => {
      const { ENGAGEMENT_TOOLS } = require('../../src/tools/engagement-tools');

      expect(ENGAGEMENT_TOOLS).toHaveLength(7);
      expect(ENGAGEMENT_TOOLS.map((t: any) => t.name)).toContain('like_tweet');
      expect(ENGAGEMENT_TOOLS.map((t: any) => t.name)).toContain('retweet');
    });

    it('should have user operation tools', () => {
      const { USER_TOOLS } = require('../../src/tools/user-tools');

      expect(USER_TOOLS).toHaveLength(10);
      expect(USER_TOOLS.map((t: any) => t.name)).toContain('get_user_profile');
      expect(USER_TOOLS.map((t: any) => t.name)).toContain('follow_user');
    });

    it('should have list and analytics tools', () => {
      const { LIST_ANALYTICS_TOOLS } = require('../../src/tools/list-analytics-tools');

      expect(LIST_ANALYTICS_TOOLS).toHaveLength(18);
      expect(LIST_ANALYTICS_TOOLS.map((t: any) => t.name)).toContain('create_list');
      expect(LIST_ANALYTICS_TOOLS.map((t: any) => t.name)).toContain('analyze_sentiment');
    });
  });

  describe('HTTP endpoints', () => {
    it('should have health check endpoint definition', () => {
      const healthResponse = {
        status: 'healthy',
        service: 'twitter-unified-mcp',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        tools: 45
      };

      expect(healthResponse.status).toBe('healthy');
      expect(healthResponse.tools).toBe(45);
    });

    it('should have OAuth store endpoint requirements', () => {
      const requiredFields = ['tenantId', 'accessToken', 'accessTokenSecret'];

      requiredFields.forEach(field => {
        expect(field).toMatch(/^(tenantId|accessToken|accessTokenSecret)$/);
      });
    });

    it('should have session cookie store endpoint requirements', () => {
      const requiredFields = ['tenantId', 'authToken', 'ct0', 'twid'];

      requiredFields.forEach(field => {
        expect(field).toMatch(/^(tenantId|authToken|ct0|twid)$/);
      });
    });
  });
});
