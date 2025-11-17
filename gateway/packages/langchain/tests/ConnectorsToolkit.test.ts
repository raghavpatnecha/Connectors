/**
 * Tests for ConnectorsToolkit
 */

import { ConnectorsToolkit } from '../src/ConnectorsToolkit';
import { ConnectorsTool } from '../src/ConnectorsTool';
import type { Connectors, Tool } from '@connectors/sdk';

// Mock Connectors SDK
jest.mock('@connectors/sdk', () => {
  return {
    Connectors: jest.fn().mockImplementation(() => ({
      tools: {
        select: jest.fn(),
        invoke: jest.fn()
      },
      mcp: {
        get: jest.fn()
      }
    }))
  };
});

describe('ConnectorsToolkit', () => {
  let mockConnectors: jest.Mocked<Connectors>;

  beforeEach(() => {
    jest.clearAllMocks();
    const { Connectors: MockedConnectors } = require('@connectors/sdk');
    mockConnectors = new MockedConnectors() as jest.Mocked<Connectors>;
  });

  describe('constructor', () => {
    it('should create toolkit with configuration', () => {
      const toolkit = new ConnectorsToolkit({
        connectors: {
          baseURL: 'http://localhost:3000',
          tenantId: 'test-tenant'
        },
        integrations: ['github']
      });

      expect(toolkit).toBeInstanceOf(ConnectorsToolkit);
    });
  });

  describe('getToolsFromQuery', () => {
    it('should select tools using semantic query', async () => {
      const mockTools: Tool[] = [
        {
          id: 'github.createPullRequest',
        name: "test",
        category: "test",
          description: 'Create PR',
          integration: 'github',
          // parameters: undefined
        },
        {
          id: 'github.mergePullRequest',
        name: "test",
        category: "test",
          description: 'Merge PR',
          integration: 'github',
          // parameters: undefined
        }
      ];

      mockConnectors.tools.select = jest.fn().mockResolvedValue(mockTools);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'GitHub operations'
      });

      const tools = await toolkit.getToolsFromQuery('GitHub operations');

      expect(tools).toHaveLength(2);
      expect(tools[0]).toBeInstanceOf(ConnectorsTool);
      expect(tools[0].name).toBe('github_createPullRequest');
      expect(mockConnectors.tools.select).toHaveBeenCalledWith(
        'GitHub operations',
        expect.objectContaining({
          maxTools: 10,
          minScore: 0.7
        })
      );
    });

    it('should respect maxTools option', async () => {
      mockConnectors.tools.select = jest.fn().mockResolvedValue([]);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'test'
      });

      await toolkit.getToolsFromQuery('test query', { maxTools: 5 });

      expect(mockConnectors.tools.select).toHaveBeenCalledWith(
        'test query',
        expect.objectContaining({ maxTools: 5 })
      );
    });

    it('should filter by categories', async () => {
      mockConnectors.tools.select = jest.fn().mockResolvedValue([]);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'test'
      });

      await toolkit.getToolsFromQuery('test query', {
        categories: ['code', 'communication']
      });

      expect(mockConnectors.tools.select).toHaveBeenCalledWith(
        'test query',
        expect.objectContaining({
          categories: ['code', 'communication']
        })
      );
    });

    it('should use custom minScore', async () => {
      mockConnectors.tools.select = jest.fn().mockResolvedValue([]);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'test'
      });

      await toolkit.getToolsFromQuery('test query', { minScore: 0.85 });

      expect(mockConnectors.tools.select).toHaveBeenCalledWith(
        'test query',
        expect.objectContaining({ minScore: 0.85 })
      );
    });
  });

  describe('getToolsFromIntegration', () => {
    it('should get all tools from integration', async () => {
      const mockTools: Tool[] = [
        {
          id: 'github.createPullRequest',
        name: "test",
        category: "test",
          description: 'Create PR',
          // parameters: undefined
        },
        {
          id: 'github.mergePullRequest',
        name: "test",
        category: "test",
          description: 'Merge PR',
          // parameters: undefined
        }
      ];

      const mockMCPServer = {
        listTools: jest.fn().mockResolvedValue(mockTools)
      };

      mockConnectors.mcp.get = jest.fn().mockReturnValue(mockMCPServer);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        integrations: ['github']
      });

      const tools = await toolkit.getToolsFromIntegration('github');

      expect(tools).toHaveLength(2);
      expect(tools[0]).toBeInstanceOf(ConnectorsTool);
      expect(mockConnectors.mcp.get).toHaveBeenCalledWith('github');
      expect(mockMCPServer.listTools).toHaveBeenCalled();
    });

    it('should throw error for unknown integration', async () => {
      mockConnectors.mcp.get = jest.fn().mockReturnValue(null);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        integrations: ['github']
      });

      await expect(toolkit.getToolsFromIntegration('unknown')).rejects.toThrow(
        "Integration 'unknown' not found"
      );
    });
  });

  describe('getToolsByCategory', () => {
    it('should get tools by category', async () => {
      const mockTools: Tool[] = [
        {
          id: 'github.createPullRequest',
        name: "test",
        category: "test",
          description: 'Create PR',
          integration: 'github',
          // parameters: undefined
        }
      ];

      mockConnectors.tools.select = jest.fn().mockResolvedValue(mockTools);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'test'
      });

      const tools = await toolkit.getToolsByCategory('code');

      expect(tools).toHaveLength(1);
      expect(mockConnectors.tools.select).toHaveBeenCalledWith(
        '',
        expect.objectContaining({
          categories: ['code'],
          maxTools: 50
        })
      );
    });
  });

  describe('getTools', () => {
    it('should initialize tools from integrations', async () => {
      const mockTools: Tool[] = [
        {
          id: 'github.createPullRequest',
        name: "test",
        category: "test",
          description: 'Create PR',
          // parameters: undefined
        }
      ];

      const mockMCPServer = {
        listTools: jest.fn().mockResolvedValue(mockTools)
      };

      mockConnectors.mcp.get = jest.fn().mockReturnValue(mockMCPServer);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        integrations: ['github']
      });

      const tools = await toolkit.getTools();

      expect(tools).toHaveLength(1);
      expect(tools[0]).toBeInstanceOf(ConnectorsTool);
    });

    it('should initialize tools from toolQuery', async () => {
      const mockTools: Tool[] = [
        {
          id: 'slack.postMessage',
        name: "test",
        category: "test",
          description: 'Post message',
          integration: 'slack',
          // parameters: undefined
        }
      ];

      mockConnectors.tools.select = jest.fn().mockResolvedValue(mockTools);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'Slack messaging'
      });

      const tools = await toolkit.getTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('slack_postMessage');
    });

    it('should cache initialized tools', async () => {
      const mockTools: Tool[] = [
        {
          id: 'github.createPullRequest',
        name: "test",
        category: "test",
          description: 'Create PR',
          // parameters: undefined
        }
      ];

      mockConnectors.tools.select = jest.fn().mockResolvedValue(mockTools);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'test'
      });

      await toolkit.getTools();
      await toolkit.getTools();

      // Should only call once due to caching
      expect(mockConnectors.tools.select).toHaveBeenCalledTimes(1);
    });

    it('should throw error if no configuration provided', async () => {
      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' }
      });

      await expect(toolkit.getTools()).rejects.toThrow(
        'ConnectorsToolkit requires either "integrations" or "toolQuery" in configuration'
      );
    });

    it('should handle multiple integrations', async () => {
      const mockGitHubTools: Tool[] = [
        {
          id: 'github.createPR',
        name: "test",
        category: "test",
          description: 'Create PR',
          // parameters: undefined
        }
      ];

      const mockSlackTools: Tool[] = [
        {
          id: 'slack.postMessage',
        name: "test",
        category: "test",
          description: 'Post message',
          // parameters: undefined
        }
      ];

      const mockGitHubServer = {
        listTools: jest.fn().mockResolvedValue(mockGitHubTools)
      };

      const mockSlackServer = {
        listTools: jest.fn().mockResolvedValue(mockSlackTools)
      };

      mockConnectors.mcp.get = jest
        .fn()
        .mockImplementation((integration: string) => {
          if (integration === 'github') return mockGitHubServer;
          if (integration === 'slack') return mockSlackServer;
          return null;
        });

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        integrations: ['github', 'slack']
      });

      const tools = await toolkit.getTools();

      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('github_createPR');
      expect(tools[1].name).toBe('slack_postMessage');
    });
  });

  describe('refresh', () => {
    it('should refresh tools', async () => {
      const mockTools: Tool[] = [
        {
          id: 'test.tool',
        name: "test",
        category: "test",
          description: 'Test tool',
          // parameters: undefined
        }
      ];

      mockConnectors.tools.select = jest.fn().mockResolvedValue(mockTools);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'test'
      });

      await toolkit.getTools();
      await toolkit.refresh();

      // Should call twice (initial + refresh)
      expect(mockConnectors.tools.select).toHaveBeenCalledTimes(2);
    });
  });

  describe('getMetadata', () => {
    it('should return toolkit metadata', async () => {
      const mockTools: Tool[] = [
        {
          id: 'github.createPR',
        name: "test",
        category: "test",
          description: 'Create PR',
          integration: 'github',
          // parameters: undefined
        }
      ];

      mockConnectors.tools.select = jest.fn().mockResolvedValue(mockTools);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        integrations: ['github'],
        toolQuery: 'GitHub operations'
      });

      await toolkit.getTools();
      const metadata = toolkit.getMetadata();

      expect(metadata.toolCount).toBe(1);
      expect(metadata.integrations).toEqual(['github']);
      expect(metadata.toolQuery).toBe('GitHub operations');
      expect(metadata.initialized).toBe(true);
      expect(metadata.tools).toHaveLength(1);
    });
  });

  describe('filterToolsByName', () => {
    it('should filter tools by name pattern', async () => {
      const mockTools: Tool[] = [
        {
          id: 'github.createPR',
        name: "test",
        category: "test",
          description: 'Create PR',
          // parameters: undefined
        },
        {
          id: 'github.mergePR',
        name: "test",
        category: "test",
          description: 'Merge PR',
          // parameters: undefined
        },
        {
          id: 'slack.postMessage',
        name: "test",
        category: "test",
          description: 'Post message',
          // parameters: undefined
        }
      ];

      mockConnectors.tools.select = jest.fn().mockResolvedValue(mockTools);

      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'test'
      });

      await toolkit.getTools();
      const filtered = toolkit.filterToolsByName(/^github_/);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].name).toMatch(/^github_/);
      expect(filtered[1].name).toMatch(/^github_/);
    });
  });

  describe('getConnectors', () => {
    it('should return Connectors SDK instance', () => {
      const toolkit = new ConnectorsToolkit({
        connectors: { baseURL: 'http://localhost:3000' },
        toolQuery: 'test'
      });

      const connectors = toolkit.getConnectors();

      expect(connectors).toBeDefined();
      expect(connectors.tools).toBeDefined();
      expect(connectors.mcp).toBeDefined();
    });
  });
});
