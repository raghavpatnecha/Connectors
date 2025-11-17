/**
 * Tests for MCPRegistry
 */

import { MCPRegistry, MCPServer, MCPToolError, MCPConfigError } from '../src/MCPRegistry';
import { HTTPClient } from '../src/utils/http-client';
import type { ConnectorsConfig } from '../src/types/config';
import type {
  MCPIntegration,
  MCPDeploymentConfig,
  MCPDeployment,
  DeploymentStatus,
  StandardMCPConfig,
} from '../src/types/mcp';
import type { Tool, ToolInvocationResponse } from '../src/types/tools';
import { mockFetchSuccess, mockFetchError } from './setup';

describe('MCPRegistry', () => {
  let httpClient: HTTPClient;
  let config: ConnectorsConfig;
  let registry: MCPRegistry;

  beforeEach(() => {
    config = {
      baseURL: 'http://localhost:3000',
      tenantId: 'test-tenant',
      apiKey: 'test-key',
    };

    httpClient = new HTTPClient({
      baseURL: config.baseURL,
      headers: {
        'X-Tenant-ID': config.tenantId!,
        'X-API-Key': config.apiKey!,
      },
    });

    registry = new MCPRegistry(httpClient, config);
  });

  describe('get()', () => {
    it('should return MCPServer instance for integration', async () => {
      const server = await registry.get('github');

      expect(server).toBeInstanceOf(MCPServer);
      expect(server.name).toBe('github');
    });

    it('should return different instances for different integrations', async () => {
      const github = await registry.get('github');
      const slack = await registry.get('slack');

      expect(github.name).toBe('github');
      expect(slack.name).toBe('slack');
      expect(github).not.toBe(slack);
    });

    it('should create server without API call', async () => {
      await registry.get('github');

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('list()', () => {
    it('should return list of integrations', async () => {
      const mockIntegrations: MCPIntegration[] = [
        {
          name: 'github',
          category: 'code',
          toolCount: 15,
          tools: [
            { id: 'github.createPR', name: 'createPullRequest', description: 'Create a PR' },
            { id: 'github.mergePR', name: 'mergePullRequest', description: 'Merge a PR' },
          ],
        },
        {
          name: 'slack',
          category: 'communication',
          toolCount: 10,
          tools: [
            { id: 'slack.sendMessage', name: 'sendMessage', description: 'Send message' },
          ],
        },
      ];

      mockFetchSuccess({ integrations: mockIntegrations });

      const integrations = await registry.list();

      expect(integrations).toEqual(mockIntegrations);
      expect(integrations).toHaveLength(2);
      expect(integrations[0]!.name).toBe('github');
      expect(integrations[0]!.toolCount).toBe(15);
      expect(integrations[0]!.tools).toHaveLength(2);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/list',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should return empty array if no integrations', async () => {
      mockFetchSuccess({ integrations: [] });

      const integrations = await registry.list();

      expect(integrations).toEqual([]);
    });

    it('should handle missing integrations field', async () => {
      mockFetchSuccess({});

      const integrations = await registry.list();

      expect(integrations).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockFetchError(500, 'Internal Server Error');

      await expect(registry.list()).rejects.toThrow();
    });
  });

  describe('add()', () => {
    it('should add GitHub source MCP server', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'my-custom-mcp',
        source: {
          type: 'github',
          url: 'https://github.com/user/mcp-server',
          ref: 'main',
        },
        category: 'custom',
        description: 'My custom MCP server',
      };

      const mockDeployment: MCPDeployment = {
        deploymentId: 'deploy-123',
        name: 'my-custom-mcp',
        status: 'pending',
        estimatedTime: '2-3 minutes',
      };

      mockFetchSuccess(mockDeployment);

      const deployment = await registry.add(deploymentConfig);

      expect(deployment).toEqual(mockDeployment);
      expect(deployment.deploymentId).toBe('deploy-123');
      expect(deployment.status).toBe('pending');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/mcp/add',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'my-custom-mcp',
            source: {
              type: 'github',
              url: 'https://github.com/user/mcp-server',
              ref: 'main',
            },
            category: 'custom',
            description: 'My custom MCP server',
            tenantId: 'test-tenant',
            autoDiscover: true,
          }),
        })
      );
    });

    it('should add STDIO source MCP server', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'stdio-server',
        source: {
          type: 'stdio',
          command: 'node',
          args: ['dist/index.js'],
          env: { API_KEY: 'secret' },
        },
        category: 'custom',
      };

      const mockDeployment: MCPDeployment = {
        deploymentId: 'deploy-456',
        name: 'stdio-server',
        status: 'pending',
      };

      mockFetchSuccess(mockDeployment);

      const deployment = await registry.add(deploymentConfig);

      expect(deployment.deploymentId).toBe('deploy-456');

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body
      );
      expect(callBody.source.type).toBe('stdio');
      expect(callBody.source.command).toBe('node');
      expect(callBody.source.args).toEqual(['dist/index.js']);
    });

    it('should add HTTP source MCP server', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'http-server',
        source: {
          type: 'http',
          url: 'http://localhost:8080',
        },
        category: 'custom',
      };

      const mockDeployment: MCPDeployment = {
        deploymentId: 'deploy-789',
        name: 'http-server',
        status: 'running',
      };

      mockFetchSuccess(mockDeployment);

      const deployment = await registry.add(deploymentConfig);

      expect(deployment.deploymentId).toBe('deploy-789');
      expect(deployment.status).toBe('running');
    });

    it('should add Docker source MCP server', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'docker-server',
        source: {
          type: 'docker',
          image: 'mcp-server',
          tag: 'latest',
        },
        category: 'custom',
      };

      const mockDeployment: MCPDeployment = {
        deploymentId: 'deploy-docker',
        name: 'docker-server',
        status: 'deploying',
      };

      mockFetchSuccess(mockDeployment);

      const deployment = await registry.add(deploymentConfig);

      expect(deployment.deploymentId).toBe('deploy-docker');
    });

    it('should use config tenantId if not provided', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'test-server',
        source: { type: 'http', url: 'http://localhost:8080' },
        category: 'custom',
      };

      mockFetchSuccess({ deploymentId: 'deploy-1', name: 'test-server', status: 'pending' });

      await registry.add(deploymentConfig);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.tenantId).toBe('test-tenant');
    });

    it('should override tenantId if provided in config', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'test-server',
        source: { type: 'http', url: 'http://localhost:8080' },
        category: 'custom',
        tenantId: 'override-tenant',
      };

      mockFetchSuccess({ deploymentId: 'deploy-1', name: 'test-server', status: 'pending' });

      await registry.add(deploymentConfig);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.tenantId).toBe('override-tenant');
    });

    it('should set autoDiscover to true by default', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'test-server',
        source: { type: 'http', url: 'http://localhost:8080' },
        category: 'custom',
      };

      mockFetchSuccess({ deploymentId: 'deploy-1', name: 'test-server', status: 'pending' });

      await registry.add(deploymentConfig);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.autoDiscover).toBe(true);
    });

    it('should respect autoDiscover false', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'test-server',
        source: { type: 'http', url: 'http://localhost:8080' },
        category: 'custom',
        autoDiscover: false,
      };

      mockFetchSuccess({ deploymentId: 'deploy-1', name: 'test-server', status: 'pending' });

      await registry.add(deploymentConfig);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.autoDiscover).toBe(false);
    });

    it('should throw error on API failure', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'test-server',
        source: { type: 'http', url: 'http://localhost:8080' },
        category: 'custom',
      };

      mockFetchError(400, 'Invalid deployment configuration');

      await expect(registry.add(deploymentConfig)).rejects.toThrow();
    });
  });

  describe('addFromConfig()', () => {
    it('should convert STDIO config and add server', async () => {
      const standardConfig: StandardMCPConfig = {
        mcpServers: {
          'my-server': {
            command: 'node',
            args: ['dist/index.js'],
            env: { API_KEY: 'secret' },
            transport: 'stdio',
          },
        },
      };

      const mockDeployment: MCPDeployment = {
        deploymentId: 'deploy-std-1',
        name: 'my-server',
        status: 'pending',
      };

      mockFetchSuccess(mockDeployment);

      const deployment = await registry.addFromConfig(standardConfig);

      expect(deployment.deploymentId).toBe('deploy-std-1');

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.name).toBe('my-server');
      expect(callBody.source.type).toBe('stdio');
      expect(callBody.source.command).toBe('node');
      expect(callBody.source.args).toEqual(['dist/index.js']);
      expect(callBody.source.env).toEqual({ API_KEY: 'secret' });
    });

    it('should convert HTTP config and add server', async () => {
      const standardConfig: StandardMCPConfig = {
        mcpServers: {
          'http-server': {
            url: 'http://localhost:8080',
            transport: 'http',
          },
        },
      };

      const mockDeployment: MCPDeployment = {
        deploymentId: 'deploy-http-1',
        name: 'http-server',
        status: 'pending',
      };

      mockFetchSuccess(mockDeployment);

      const deployment = await registry.addFromConfig(standardConfig);

      expect(deployment.deploymentId).toBe('deploy-http-1');

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.source.type).toBe('http');
      expect(callBody.source.url).toBe('http://localhost:8080');
    });

    it('should convert SSE config to HTTP', async () => {
      const standardConfig: StandardMCPConfig = {
        mcpServers: {
          'sse-server': {
            url: 'http://localhost:9000/sse',
            transport: 'sse',
          },
        },
      };

      mockFetchSuccess({ deploymentId: 'deploy-sse-1', name: 'sse-server', status: 'pending' });

      await registry.addFromConfig(standardConfig);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.source.type).toBe('http');
      expect(callBody.source.url).toBe('http://localhost:9000/sse');
    });

    it('should throw error for empty config', async () => {
      const standardConfig: StandardMCPConfig = {
        mcpServers: {},
      };

      await expect(registry.addFromConfig(standardConfig)).rejects.toThrow(MCPConfigError);
      await expect(registry.addFromConfig(standardConfig)).rejects.toThrow(
        'No servers found in MCP configuration'
      );
    });

    it('should throw error for invalid config (no url or command)', async () => {
      const standardConfig: StandardMCPConfig = {
        mcpServers: {
          'invalid-server': {
            // No url or command
          },
        },
      };

      await expect(registry.addFromConfig(standardConfig)).rejects.toThrow(MCPConfigError);
    });

    it('should use first server if multiple servers in config', async () => {
      const standardConfig: StandardMCPConfig = {
        mcpServers: {
          'server-1': {
            command: 'node',
            args: ['server1.js'],
          },
          'server-2': {
            command: 'node',
            args: ['server2.js'],
          },
        },
      };

      mockFetchSuccess({ deploymentId: 'deploy-1', name: 'server-1', status: 'pending' });

      await registry.addFromConfig(standardConfig);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.name).toBe('server-1');
    });
  });

  describe('remove()', () => {
    it('should remove custom MCP server', async () => {
      mockFetchSuccess({});

      await registry.remove('my-custom-server');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/mcp/custom/my-custom-server?tenantId=test-tenant',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should remove server without tenantId if not in config', async () => {
      const configWithoutTenant: ConnectorsConfig = {
        baseURL: 'http://localhost:3000',
      };

      const registryWithoutTenant = new MCPRegistry(
        new HTTPClient({ baseURL: configWithoutTenant.baseURL }),
        configWithoutTenant
      );

      mockFetchSuccess({});

      await registryWithoutTenant.remove('my-custom-server');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/mcp/custom/my-custom-server',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should throw error on API failure', async () => {
      mockFetchError(404, 'Server not found');

      await expect(registry.remove('nonexistent-server')).rejects.toThrow();
    });
  });

  describe('getDeploymentStatus()', () => {
    it('should return deployment status', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-123',
        name: 'my-server',
        status: 'running',
        message: 'Deployment successful',
        toolsDiscovered: 25,
        endpoint: 'http://localhost:8080',
        progress: 100,
        updatedAt: new Date().toISOString(),
      };

      mockFetchSuccess(mockStatus);

      const status = await registry.getDeploymentStatus('deploy-123');

      expect(status).toEqual(mockStatus);
      expect(status.status).toBe('running');
      expect(status.toolsDiscovered).toBe(25);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/mcp/deployments/deploy-123',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should return deploying status with progress', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-456',
        name: 'my-server',
        status: 'deploying',
        progress: 50,
        updatedAt: new Date().toISOString(),
      };

      mockFetchSuccess(mockStatus);

      const status = await registry.getDeploymentStatus('deploy-456');

      expect(status.status).toBe('deploying');
      expect(status.progress).toBe(50);
    });

    it('should return failed status with error', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-789',
        name: 'my-server',
        status: 'failed',
        error: {
          code: 'BUILD_FAILED',
          message: 'Build failed: syntax error',
          details: { line: 42 },
        },
        updatedAt: new Date().toISOString(),
      };

      mockFetchSuccess(mockStatus);

      const status = await registry.getDeploymentStatus('deploy-789');

      expect(status.status).toBe('failed');
      expect(status.error).toBeDefined();
      expect(status.error?.code).toBe('BUILD_FAILED');
    });

    it('should throw error on API failure', async () => {
      mockFetchError(404, 'Deployment not found');

      await expect(registry.getDeploymentStatus('nonexistent')).rejects.toThrow();
    });
  });
});

describe('MCPServer', () => {
  let httpClient: HTTPClient;
  let config: ConnectorsConfig;
  let server: MCPServer;

  beforeEach(() => {
    config = {
      baseURL: 'http://localhost:3000',
      tenantId: 'test-tenant',
      apiKey: 'test-key',
    };

    httpClient = new HTTPClient({
      baseURL: config.baseURL,
      headers: {
        'X-Tenant-ID': config.tenantId!,
        'X-API-Key': config.apiKey!,
      },
    });

    server = new MCPServer('github', httpClient, config);
  });

  describe('call()', () => {
    it('should call tool with auto-filled integration', async () => {
      const mockResponse: ToolInvocationResponse = {
        success: true,
        data: {
          number: 123,
          url: 'https://github.com/owner/repo/pull/123',
        },
      };

      mockFetchSuccess(mockResponse);

      const result = await server.call('createPullRequest', {
        repo: 'owner/repo',
        title: 'New PR',
        head: 'feature',
        base: 'main',
      });

      expect(result).toEqual(mockResponse.data);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/invoke',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            toolId: 'github.createPullRequest',
            integration: 'github',
            parameters: {
              repo: 'owner/repo',
              title: 'New PR',
              head: 'feature',
              base: 'main',
            },
            tenantId: 'test-tenant',
          }),
        })
      );
    });

    it('should throw MCPToolError on invocation failure', async () => {
      const mockResponse: ToolInvocationResponse = {
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: 'Missing required parameter: repo',
          details: { param: 'repo' },
        },
      };

      mockFetchSuccess(mockResponse);

      await expect(
        server.call('createPullRequest', { title: 'PR' })
      ).rejects.toThrow(MCPToolError);
    });

    it('should handle tool execution with complex response', async () => {
      const mockResponse: ToolInvocationResponse = {
        success: true,
        data: {
          issues: [
            { id: 1, title: 'Bug fix' },
            { id: 2, title: 'Feature request' },
          ],
          total: 2,
        },
      };

      mockFetchSuccess(mockResponse);

      const result = await server.call<{ issues: Array<{ id: number; title: string }>; total: number }>('listIssues', {
        repo: 'owner/repo',
        state: 'open',
      });

      expect(result).toEqual(mockResponse.data);
      expect(result.issues).toHaveLength(2);
    });

    it('should work with different integrations', async () => {
      const slackServer = new MCPServer('slack', httpClient, config);

      const mockResponse: ToolInvocationResponse = {
        success: true,
        data: { ts: '1234567890.123456' },
      };

      mockFetchSuccess(mockResponse);

      await slackServer.call('sendMessage', {
        channel: '#general',
        text: 'Hello',
      });

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.toolId).toBe('slack.sendMessage');
      expect(callBody.integration).toBe('slack');
    });
  });

  describe('listTools()', () => {
    it('should list all tools for integration', async () => {
      const mockTools: Tool[] = [
        {
          id: 'github.createPullRequest',
          name: 'createPullRequest',
          description: 'Create a pull request',
          integration: 'github',
          category: 'code',
          parameters: { type: 'object', properties: {} },
        },
        {
          id: 'github.mergePullRequest',
          name: 'mergePullRequest',
          description: 'Merge a pull request',
          integration: 'github',
          category: 'code',
        },
      ];

      mockFetchSuccess({ tools: mockTools });

      const tools = await server.listTools();

      expect(tools).toEqual(mockTools);
      expect(tools).toHaveLength(2);
      expect(tools[0]!.id).toBe('github.createPullRequest');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/tools/list?integration=github',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should return empty array if no tools', async () => {
      mockFetchSuccess({ tools: [] });

      const tools = await server.listTools();

      expect(tools).toEqual([]);
    });

    it('should handle missing tools field', async () => {
      mockFetchSuccess({});

      const tools = await server.listTools();

      expect(tools).toEqual([]);
    });
  });

  describe('name', () => {
    it('should return integration name', () => {
      expect(server.name).toBe('github');
    });
  });
});
