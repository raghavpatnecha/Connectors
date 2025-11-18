/**
 * Tests for ToolsAPI
 */

import { ToolsAPI } from '../src/ToolsAPI';
import { HTTPClient } from '../src/utils/http-client';
import { ValidationError } from '../src/utils/validation';
import { HTTPError } from '../src/utils/http-client';
import { mockFetchSuccess, mockFetchError } from './setup';
import type { ConnectorsConfig } from '../src/types/config';
import type {
  Tool,
  ToolSelectionResponse,
  ToolListResponse,
  ToolInvocationResponse,
} from '../src/types/tools';

describe('ToolsAPI', () => {
  let toolsAPI: ToolsAPI;
  let httpClient: HTTPClient;
  let config: ConnectorsConfig;

  beforeEach(() => {
    config = {
      baseURL: 'http://localhost:3000',
      apiKey: 'test-api-key',
      tenantId: 'test-tenant',
    };

    httpClient = new HTTPClient({
      baseURL: config.baseURL,
      headers: {
        'X-API-Key': config.apiKey!,
        'X-Tenant-ID': config.tenantId!,
      },
    });

    toolsAPI = new ToolsAPI(httpClient, config);
  });

  describe('constructor', () => {
    it('should create ToolsAPI instance', () => {
      expect(toolsAPI).toBeInstanceOf(ToolsAPI);
    });

    it('should accept HTTPClient and config', () => {
      const api = new ToolsAPI(httpClient, config);
      expect(api).toBeInstanceOf(ToolsAPI);
    });
  });

  describe('select()', () => {
    const mockTools: Tool[] = [
      {
        id: 'github.createPullRequest',
        name: 'Create Pull Request',
        description: 'Create a new pull request',
        integration: 'github',
        category: 'code',
        tokenCost: 250,
      },
      {
        id: 'github.mergePullRequest',
        name: 'Merge Pull Request',
        description: 'Merge an existing pull request',
        integration: 'github',
        category: 'code',
        tokenCost: 200,
      },
    ];

    const mockResponse: ToolSelectionResponse = {
      tier1: [mockTools[0]!],
      tier2: [mockTools[1]!],
      tier3: [],
      totalTokens: 450,
      tools: mockTools,
      metadata: {
        categoriesUsed: ['code'],
        selectionLatency: 45,
      },
    };

    it('should select tools with query only', async () => {
      mockFetchSuccess(mockResponse);

      const result = await toolsAPI.select('create a pull request');

      expect(result).toEqual(mockTools);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/select',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            query: 'create a pull request',
          }),
        })
      );
    });

    it('should select tools with all options', async () => {
      mockFetchSuccess(mockResponse);

      const result = await toolsAPI.select('create a PR', {
        maxTools: 5,
        categories: ['code', 'communication'],
        tokenBudget: 2000,
        context: { priority: 'high' },
      });

      expect(result).toEqual(mockTools);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/select',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            query: 'create a PR',
            maxTools: 5,
            categories: ['code', 'communication'],
            tokenBudget: 2000,
            context: { priority: 'high' },
          }),
        })
      );
    });

    it('should trim whitespace from query', async () => {
      mockFetchSuccess(mockResponse);

      await toolsAPI.select('  create PR  ');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            query: 'create PR',
          }),
        })
      );
    });

    it('should handle empty tools response', async () => {
      mockFetchSuccess({
        tier1: [],
        tier2: [],
        tier3: [],
        totalTokens: 0,
        tools: [],
      });

      const result = await toolsAPI.select('nonexistent query');

      expect(result).toEqual([]);
    });

    it('should validate query is non-empty string', async () => {
      await expect(toolsAPI.select('')).rejects.toThrow(ValidationError);
      await expect(toolsAPI.select('   ')).rejects.toThrow(ValidationError);
      await expect(toolsAPI.select(null as any)).rejects.toThrow(ValidationError);
      await expect(toolsAPI.select(undefined as any)).rejects.toThrow(ValidationError);
      await expect(toolsAPI.select(123 as any)).rejects.toThrow(ValidationError);
    });

    it('should validate maxTools is positive number', async () => {
      await expect(
        toolsAPI.select('query', { maxTools: 0 })
      ).rejects.toThrow(ValidationError);

      await expect(
        toolsAPI.select('query', { maxTools: -5 })
      ).rejects.toThrow(ValidationError);

      await expect(
        toolsAPI.select('query', { maxTools: Infinity })
      ).rejects.toThrow(ValidationError);

      await expect(
        toolsAPI.select('query', { maxTools: 'five' as any })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate tokenBudget is positive number', async () => {
      await expect(
        toolsAPI.select('query', { tokenBudget: 0 })
      ).rejects.toThrow(ValidationError);

      await expect(
        toolsAPI.select('query', { tokenBudget: -1000 })
      ).rejects.toThrow(ValidationError);

      await expect(
        toolsAPI.select('query', { tokenBudget: NaN })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate categories is array', async () => {
      await expect(
        toolsAPI.select('query', { categories: 'code' as any })
      ).rejects.toThrow(ValidationError);

      await expect(
        toolsAPI.select('query', { categories: {} as any })
      ).rejects.toThrow(ValidationError);
    });

    it('should handle HTTP errors', async () => {
      mockFetchError(404, 'Not Found');

      await expect(toolsAPI.select('query')).rejects.toThrow(HTTPError);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(toolsAPI.select('query')).rejects.toThrow(Error);
    });
  });

  describe('list()', () => {
    const mockTools: Tool[] = [
      {
        id: 'github.createPullRequest',
        name: 'Create Pull Request',
        description: 'Create a new pull request',
        integration: 'github',
        category: 'code',
      },
      {
        id: 'github.createIssue',
        name: 'Create Issue',
        description: 'Create a new issue',
        integration: 'github',
        category: 'code',
      },
    ];

    const mockResponse: ToolListResponse = {
      tools: mockTools,
      total: 2,
      page: 1,
      limit: 50,
      hasMore: false,
    };

    it('should list all tools without filters', async () => {
      mockFetchSuccess(mockResponse);

      const result = await toolsAPI.list();

      expect(result).toEqual(mockTools);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/list',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should list tools with category filter', async () => {
      mockFetchSuccess(mockResponse);

      const result = await toolsAPI.list({ category: 'code' });

      expect(result).toEqual(mockTools);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/list?category=code',
        expect.any(Object)
      );
    });

    it('should list tools with integration filter', async () => {
      mockFetchSuccess(mockResponse);

      const result = await toolsAPI.list({ integration: 'github' });

      expect(result).toEqual(mockTools);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/list?integration=github',
        expect.any(Object)
      );
    });

    it('should list tools with search query', async () => {
      mockFetchSuccess(mockResponse);

      const result = await toolsAPI.list({ search: 'pull request' });

      expect(result).toEqual(mockTools);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/list?search=pull+request',
        expect.any(Object)
      );
    });

    it('should list tools with pagination', async () => {
      mockFetchSuccess(mockResponse);

      const result = await toolsAPI.list({ page: 2, limit: 20 });

      expect(result).toEqual(mockTools);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/list?page=2&limit=20',
        expect.any(Object)
      );
    });

    it('should list tools with all filters', async () => {
      mockFetchSuccess(mockResponse);

      const result = await toolsAPI.list({
        category: 'code',
        integration: 'github',
        search: 'pull request',
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(mockTools);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/list?category=code&integration=github&search=pull+request&page=1&limit=10',
        expect.any(Object)
      );
    });

    it('should handle empty results', async () => {
      mockFetchSuccess({
        tools: [],
        total: 0,
        page: 1,
        limit: 50,
        hasMore: false,
      });

      const result = await toolsAPI.list({ search: 'nonexistent' });

      expect(result).toEqual([]);
    });

    it('should validate page is positive integer', async () => {
      await expect(toolsAPI.list({ page: 0 })).rejects.toThrow(ValidationError);
      await expect(toolsAPI.list({ page: -1 })).rejects.toThrow(ValidationError);
      await expect(toolsAPI.list({ page: 1.5 })).rejects.toThrow(ValidationError);
      await expect(toolsAPI.list({ page: 'one' as any })).rejects.toThrow(
        ValidationError
      );
    });

    it('should validate limit is positive integer', async () => {
      await expect(toolsAPI.list({ limit: 0 })).rejects.toThrow(ValidationError);
      await expect(toolsAPI.list({ limit: -10 })).rejects.toThrow(
        ValidationError
      );
      await expect(toolsAPI.list({ limit: 5.5 })).rejects.toThrow(
        ValidationError
      );
    });

    it('should validate category is string', async () => {
      await expect(toolsAPI.list({ category: 123 as any })).rejects.toThrow(
        ValidationError
      );
      await expect(toolsAPI.list({ category: [] as any })).rejects.toThrow(
        ValidationError
      );
    });

    it('should validate integration is string', async () => {
      await expect(
        toolsAPI.list({ integration: 123 as any })
      ).rejects.toThrow(ValidationError);
      await expect(
        toolsAPI.list({ integration: {} as any })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate search is string', async () => {
      await expect(toolsAPI.list({ search: 123 as any })).rejects.toThrow(
        ValidationError
      );
      await expect(toolsAPI.list({ search: null as any })).rejects.toThrow(
        ValidationError
      );
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Internal Server Error' }),
      } as Response);

      // Will retry and eventually fail
      await expect(toolsAPI.list()).rejects.toThrow();
    });
  });

  describe('invoke()', () => {
    const mockSuccessResponse: ToolInvocationResponse = {
      success: true,
      data: {
        number: 123,
        url: 'https://github.com/owner/repo/pull/123',
      },
      metadata: {
        executionTime: 250,
        tokensUsed: 150,
      },
    };

    const mockErrorResponse: ToolInvocationResponse = {
      success: false,
      error: {
        code: 'INVALID_PARAMETERS',
        message: 'Missing required parameter: repo',
        details: { parameter: 'repo' },
      },
    };

    it('should invoke tool with basic parameters', async () => {
      mockFetchSuccess(mockSuccessResponse);

      const result = await toolsAPI.invoke('github.createPullRequest', {
        repo: 'owner/repo',
        title: 'Feature',
        head: 'feature',
        base: 'main',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        number: 123,
        url: 'https://github.com/owner/repo/pull/123',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/invoke',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            toolId: 'github.createPullRequest',
            integration: 'github',
            parameters: {
              repo: 'owner/repo',
              title: 'Feature',
              head: 'feature',
              base: 'main',
            },
            tenantId: 'test-tenant',
          }),
        })
      );
    });

    it('should extract integration from toolId', async () => {
      mockFetchSuccess(mockSuccessResponse);

      await toolsAPI.invoke('slack.sendMessage', {
        channel: '#general',
        text: 'Hello',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"integration":"slack"'),
        })
      );
    });

    it('should use custom integration from options', async () => {
      mockFetchSuccess(mockSuccessResponse);

      await toolsAPI.invoke(
        'customTool',
        { param: 'value' },
        { integration: 'customIntegration' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"integration":"customIntegration"'),
        })
      );
    });

    it('should use tenantId from config', async () => {
      mockFetchSuccess(mockSuccessResponse);

      await toolsAPI.invoke('github.createIssue', { title: 'Bug' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"tenantId":"test-tenant"'),
        })
      );
    });

    it('should override tenantId with option', async () => {
      mockFetchSuccess(mockSuccessResponse);

      await toolsAPI.invoke(
        'github.createIssue',
        { title: 'Bug' },
        { tenantId: 'override-tenant' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"tenantId":"override-tenant"'),
        })
      );
    });

    it('should use custom timeout', async () => {
      mockFetchSuccess(mockSuccessResponse);

      // We can't directly test the timeout is passed, but we can verify the call succeeds
      const result = await toolsAPI.invoke(
        'github.createIssue',
        { title: 'Bug' },
        { timeout: 10000 }
      );

      expect(result.success).toBe(true);
    });

    it('should handle failed invocation', async () => {
      mockFetchSuccess(mockErrorResponse);

      const result = await toolsAPI.invoke('github.createPullRequest', {
        title: 'Feature',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('INVALID_PARAMETERS');
    });

    it('should trim whitespace from toolId', async () => {
      mockFetchSuccess(mockSuccessResponse);

      await toolsAPI.invoke('  github.createIssue  ', { title: 'Bug' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"toolId":"github.createIssue"'),
        })
      );
    });

    it('should validate toolId is non-empty string', async () => {
      await expect(toolsAPI.invoke('', {})).rejects.toThrow(ValidationError);
      await expect(toolsAPI.invoke('   ', {})).rejects.toThrow(ValidationError);
      await expect(toolsAPI.invoke(null as any, {})).rejects.toThrow(
        ValidationError
      );
      await expect(toolsAPI.invoke(undefined as any, {})).rejects.toThrow(
        ValidationError
      );
      await expect(toolsAPI.invoke(123 as any, {})).rejects.toThrow(
        ValidationError
      );
    });

    it('should validate toolId has integration prefix', async () => {
      await expect(toolsAPI.invoke('invalidToolId', {})).rejects.toThrow(
        ValidationError
      );

      await expect(toolsAPI.invoke('noperiod', {})).rejects.toThrow(
        ValidationError
      );
    });

    it('should validate parameters is object', async () => {
      await expect(
        toolsAPI.invoke('github.createIssue', null as any)
      ).rejects.toThrow(ValidationError);

      await expect(
        toolsAPI.invoke('github.createIssue', [] as any)
      ).rejects.toThrow(ValidationError);

      await expect(
        toolsAPI.invoke('github.createIssue', 'string' as any)
      ).rejects.toThrow(ValidationError);

      await expect(
        toolsAPI.invoke('github.createIssue', 123 as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Not Found' }),
      } as Response);

      await expect(
        toolsAPI.invoke('github.createIssue', { title: 'Bug' })
      ).rejects.toThrow(HTTPError);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        toolsAPI.invoke('github.createIssue', { title: 'Bug' })
      ).rejects.toThrow(Error);
    });

    it('should handle complex nested parameters', async () => {
      mockFetchSuccess(mockSuccessResponse);

      const complexParams = {
        repo: 'owner/repo',
        config: {
          branch: 'main',
          settings: {
            autoMerge: true,
            reviewers: ['user1', 'user2'],
          },
        },
        labels: ['bug', 'high-priority'],
      };

      const result = await toolsAPI.invoke(
        'github.createPullRequest',
        complexParams
      );

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            toolId: 'github.createPullRequest',
            integration: 'github',
            parameters: complexParams,
            tenantId: 'test-tenant',
          }),
        })
      );
    });
  });
});
