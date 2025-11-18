/**
 * Tests for ConnectorsTool
 */

import { ConnectorsTool } from '../src/ConnectorsTool';
import type { Connectors, Tool } from '@connectors/sdk';

// Mock Connectors SDK
const mockConnectors = {
  tools: {
    invoke: jest.fn()
  }
} as unknown as Connectors;

describe('ConnectorsTool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create tool with basic properties', () => {
      const tool: Tool = {
        id: 'github.createPullRequest',
        name: "test",
        category: "test",
        description: 'Create a pull request',
        integration: 'github',
        // parameters: undefined
      };

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);

      expect(connectorsTool.name).toBe('github_createPullRequest');
      expect(connectorsTool.description).toBe('Create a pull request');
    });

    it('should sanitize tool name', () => {
      const tool: Tool = {
        id: 'github.create-pull-request@v1',
        name: "test",
        category: "test",
        description: 'Create PR',
        integration: 'github',
        // parameters: undefined
      };

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);

      expect(connectorsTool.name).toBe('github_create_pull_request_v1');
    });

    it('should create schema from parameters', () => {
      const tool: Tool = {
        id: 'slack.postMessage',
        name: "test",
        category: "test",
        description: 'Post message',
        integration: 'slack',
        parameters: { properties: { channel: { type: 'string', description: 'Channel ID' } }, required: ['channel'] }
      };

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);

      expect(connectorsTool.schema.shape).toHaveProperty('channel');
      expect(connectorsTool.schema.shape).toHaveProperty('message');
    });

    it('should handle missing description', () => {
      const tool: Tool = {
        id: 'test.tool',
        name: "test",
        category: "test",
        integration: 'test',
        // parameters: undefined
      };

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);

      expect(connectorsTool.description).toBe('Execute test.tool');
    });
  });

  describe('_call', () => {
    it('should execute tool successfully', async () => {
      const tool: Tool = {
        id: 'github.createPullRequest',
        name: "test",
        category: "test",
        description: 'Create PR',
        integration: 'github',
        parameters: { properties: { repo: { type: 'string', description: 'Repository' } }, required: ['repo'] }
      };

      const mockResult = {
        number: 123,
        url: 'https://github.com/owner/repo/pull/123'
      };

      (mockConnectors.tools.invoke as jest.Mock).mockResolvedValue(mockResult);

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);
      const result = await connectorsTool._call({ repo: 'owner/repo' });
      const parsed = JSON.parse(result);

      expect(parsed.success).toBe(true);
      expect(parsed.data).toEqual(mockResult);
      expect(parsed.metadata.toolId).toBe('github.createPullRequest');
      expect(parsed.metadata.integration).toBe('github');
      expect(parsed.metadata.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle execution errors', async () => {
      const tool: Tool = {
        id: 'github.createPullRequest',
        name: "test",
        category: "test",
        description: 'Create PR',
        integration: 'github',
        parameters: { properties: { repo: { type: 'string', description: 'Repository' } }, required: ['repo'] }
      };

      const error = new Error('API error');
      (mockConnectors.tools.invoke as jest.Mock).mockRejectedValue(error);

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);
      const result = await connectorsTool._call({ repo: 'owner/repo' });
      const parsed = JSON.parse(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error).toBe('API error');
      expect(parsed.metadata.toolId).toBe('github.createPullRequest');
      expect(parsed.metadata.errorType).toBe('Error');
    });

    it('should validate input against schema', async () => {
      const tool: Tool = {
        id: 'test.tool',
        name: "test",
        category: "test",
        description: 'Test tool',
        integration: 'test',
        parameters: { properties: { required: { type: 'string', description: 'Required field' } }, required: ['required'] }
      };

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);
      const result = await connectorsTool._call({});
      const parsed = JSON.parse(result);

      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain('Required');
    });

    it('should pass validated input to SDK', async () => {
      const tool: Tool = {
        id: 'test.tool',
        name: "test",
        category: "test",
        description: 'Test tool',
        integration: 'test',
        parameters: { properties: { value: { type: 'integer', description: 'Integer value' } }, required: ['value'] }
      };

      (mockConnectors.tools.invoke as jest.Mock).mockResolvedValue({ ok: true });

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);
      await connectorsTool._call({ value: 42 });

      expect(mockConnectors.tools.invoke).toHaveBeenCalledWith('test.tool', { value: 42 });
    });

    it('should measure execution time', async () => {
      const tool: Tool = {
        id: 'test.tool',
        name: "test",
        category: "test",
        description: 'Test tool',
        integration: 'test',
        // parameters: undefined
      };

      (mockConnectors.tools.invoke as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 50))
      );

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);
      const result = await connectorsTool._call({});
      const parsed = JSON.parse(result);

      expect(parsed.metadata.executionTime).toBeGreaterThanOrEqual(50);
    });
  });

  describe('fromConnectorsTool', () => {
    it('should create ConnectorsTool from Tool', () => {
      const tool: Tool = {
        id: 'github.createPullRequest',
        name: "test",
        category: "test",
        description: 'Create PR',
        integration: 'github',
        // parameters: undefined
      };

      const connectorsTool = ConnectorsTool.fromConnectorsTool(tool, mockConnectors);

      expect(connectorsTool).toBeInstanceOf(ConnectorsTool);
      expect(connectorsTool.name).toBe('github_createPullRequest');
    });
  });

  describe('getMetadata', () => {
    it('should return tool metadata', () => {
      const tool: Tool = {
        id: 'github.createPullRequest',
        name: "test",
        category: "test",
        description: 'Create PR',
        integration: 'github',
        parameters: { properties: { repo: { type: 'string', description: 'Repository' } }, required: ['repo'] }
      };

      const connectorsTool = new ConnectorsTool(tool, mockConnectors);
      const metadata = connectorsTool.getMetadata();

      expect(metadata.name).toBe('github_createPullRequest');
      expect(metadata.description).toBe('Create PR');
      expect(metadata.toolId).toBe('github.createPullRequest');
      expect(metadata.integration).toBe('github');
      expect(metadata.schema).toHaveProperty('repo');
    });
  });
});
