/**
 * Tests for MCPRegistry
 */

import {
  MCPRegistry,
  MCPServer,
  MCPDeploymentClass,
  MCPToolError,
  MCPConfigError,
  DeploymentTimeoutError,
  DeploymentFailedError,
} from '../src/MCPRegistry';
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
    it('should add GitHub source MCP server and return MCPDeploymentClass', async () => {
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

      expect(deployment).toBeInstanceOf(MCPDeploymentClass);
      expect(deployment.deploymentId).toBe('deploy-123');
      expect(deployment.name).toBe('my-custom-mcp');
      expect(deployment.status).toBe('pending');
      expect(deployment.estimatedTime).toBe('2-3 minutes');

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

  describe('waitForDeployment()', () => {
    it('should wait for deployment to complete successfully', async () => {
      const mockStatuses: DeploymentStatus[] = [
        {
          deploymentId: 'deploy-123',
          name: 'my-server',
          status: 'pending',
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-123',
          name: 'my-server',
          status: 'cloning',
          progress: 25,
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-123',
          name: 'my-server',
          status: 'building',
          progress: 50,
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-123',
          name: 'my-server',
          status: 'running',
          progress: 100,
          toolsDiscovered: 25,
          endpoint: 'http://localhost:8080',
          updatedAt: new Date().toISOString(),
        },
      ];

      let statusIndex = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        const status = mockStatuses[statusIndex++];
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(status),
        });
      });

      const progressCallback = jest.fn();
      const finalStatus = await registry.waitForDeployment('deploy-123', {
        timeout: 60000,
        pollInterval: 10, // Short interval for fast tests
        onProgress: progressCallback,
      });

      expect(finalStatus.status).toBe('running');
      expect(finalStatus.toolsDiscovered).toBe(25);
      expect(progressCallback).toHaveBeenCalledTimes(mockStatuses.length);
      expect(progressCallback).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'running' })
      );
    });

    it('should throw DeploymentFailedError when deployment fails', async () => {
      const mockStatuses: DeploymentStatus[] = [
        {
          deploymentId: 'deploy-failed',
          name: 'my-server',
          status: 'pending',
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-failed',
          name: 'my-server',
          status: 'failed',
          error: {
            code: 'BUILD_FAILED',
            message: 'Build failed: syntax error',
          },
          updatedAt: new Date().toISOString(),
        },
      ];

      let statusIndex = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        const status = mockStatuses[statusIndex++];
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(status),
        });
      });

      try {
        await registry.waitForDeployment('deploy-failed', {
          timeout: 60000,
          pollInterval: 10,
        });
        fail('Expected DeploymentFailedError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DeploymentFailedError);
        expect((error as Error).message).toContain('Build failed: syntax error');
      }
    });

    it('should throw DeploymentTimeoutError when timeout is exceeded', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-timeout',
        name: 'my-server',
        status: 'building',
        progress: 50,
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockImplementation(() => {
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(mockStatus),
        });
      });

      await expect(
        registry.waitForDeployment('deploy-timeout', {
          timeout: 50, // Very short timeout
          pollInterval: 10,
        })
      ).rejects.toThrow(DeploymentTimeoutError);
    });

    it('should use default timeout and polling interval', async () => {
      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-defaults',
        name: 'my-server',
        status: 'running',
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockImplementation(() => {
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(mockStatus),
        });
      });

      const finalStatus = await registry.waitForDeployment('deploy-defaults');

      expect(finalStatus.status).toBe('running');
    });

    it('should implement exponential backoff with jitter', async () => {
      const mockStatuses: DeploymentStatus[] = [
        {
          deploymentId: 'deploy-backoff',
          name: 'my-server',
          status: 'building',
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-backoff',
          name: 'my-server',
          status: 'building',
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-backoff',
          name: 'my-server',
          status: 'running',
          updatedAt: new Date().toISOString(),
        },
      ];

      let statusIndex = 0;
      const fetchCallTimes: number[] = [];
      (global.fetch as jest.Mock).mockImplementation(() => {
        fetchCallTimes.push(Date.now());
        const status = mockStatuses[statusIndex++];
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(status),
        });
      });

      await registry.waitForDeployment('deploy-backoff', {
        timeout: 60000,
        pollInterval: 10,
      });

      // Verify that fetch was called multiple times (with backoff)
      expect(fetchCallTimes.length).toBe(3);
    });

    it('should call onProgress callback on each status check', async () => {
      const mockStatuses: DeploymentStatus[] = [
        {
          deploymentId: 'deploy-progress',
          name: 'my-server',
          status: 'pending',
          progress: 0,
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-progress',
          name: 'my-server',
          status: 'cloning',
          progress: 33,
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-progress',
          name: 'my-server',
          status: 'building',
          progress: 66,
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-progress',
          name: 'my-server',
          status: 'running',
          progress: 100,
          toolsDiscovered: 15,
          updatedAt: new Date().toISOString(),
        },
      ];

      let statusIndex = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        const status = mockStatuses[statusIndex++];
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(status),
        });
      });

      const progressCallback = jest.fn();
      await registry.waitForDeployment('deploy-progress', {
        timeout: 60000,
        pollInterval: 10,
        onProgress: progressCallback,
      });

      expect(progressCallback).toHaveBeenCalledTimes(4);
      expect(progressCallback).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ status: 'pending', progress: 0 })
      );
      expect(progressCallback).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ status: 'cloning', progress: 33 })
      );
      expect(progressCallback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ status: 'building', progress: 66 })
      );
      expect(progressCallback).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({ status: 'running', progress: 100 })
      );
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

describe('MCPDeploymentClass', () => {
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

  describe('constructor', () => {
    it('should create deployment instance with all properties', () => {
      const deployment = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-123',
          name: 'my-server',
          status: 'pending',
          estimatedTime: '2-3 minutes',
          message: 'Initializing deployment',
        },
        registry
      );

      expect(deployment.deploymentId).toBe('deploy-123');
      expect(deployment.name).toBe('my-server');
      expect(deployment.status).toBe('pending');
      expect(deployment.estimatedTime).toBe('2-3 minutes');
      expect(deployment.message).toBe('Initializing deployment');
    });
  });

  describe('waitUntilReady()', () => {
    it('should wait until deployment is running', async () => {
      const deployment = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-ready',
          name: 'my-server',
          status: 'pending',
        },
        registry
      );

      const mockStatuses: DeploymentStatus[] = [
        {
          deploymentId: 'deploy-ready',
          name: 'my-server',
          status: 'deploying',
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-ready',
          name: 'my-server',
          status: 'running',
          message: 'Deployment complete',
          toolsDiscovered: 10,
          updatedAt: new Date().toISOString(),
        },
      ];

      let statusIndex = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        const status = mockStatuses[statusIndex++];
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(status),
        });
      });

      await deployment.waitUntilReady({
        timeout: 60000,
        pollInterval: 10,
      });

      expect(deployment.status).toBe('running');
      expect(deployment.message).toBe('Deployment complete');
    });

    it('should throw DeploymentFailedError when deployment fails', async () => {
      const deployment = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-fail',
          name: 'my-server',
          status: 'pending',
        },
        registry
      );

      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-fail',
        name: 'my-server',
        status: 'failed',
        error: {
          code: 'BUILD_FAILED',
          message: 'Build error',
        },
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockImplementation(() => {
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(mockStatus),
        });
      });

      await expect(deployment.waitUntilReady()).rejects.toThrow(DeploymentFailedError);
      await expect(deployment.waitUntilReady()).rejects.toThrow(/Build error/);
    });

    it('should update internal status after waiting', async () => {
      const deployment = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-update',
          name: 'my-server',
          status: 'pending',
        },
        registry
      );

      expect(deployment.status).toBe('pending');

      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-update',
        name: 'my-server',
        status: 'running',
        message: 'All done',
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockImplementation(() => {
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(mockStatus),
        });
      });

      await deployment.waitUntilReady();

      expect(deployment.status).toBe('running');
      expect(deployment.message).toBe('All done');
    });

    it('should support progress callback', async () => {
      const deployment = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-progress',
          name: 'my-server',
          status: 'pending',
        },
        registry
      );

      const mockStatuses: DeploymentStatus[] = [
        {
          deploymentId: 'deploy-progress',
          name: 'my-server',
          status: 'cloning',
          progress: 25,
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-progress',
          name: 'my-server',
          status: 'building',
          progress: 50,
          updatedAt: new Date().toISOString(),
        },
        {
          deploymentId: 'deploy-progress',
          name: 'my-server',
          status: 'running',
          progress: 100,
          updatedAt: new Date().toISOString(),
        },
      ];

      let statusIndex = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        const status = mockStatuses[statusIndex++];
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () => Promise.resolve(status),
        });
      });

      const progressCallback = jest.fn();
      await deployment.waitUntilReady({
        timeout: 60000,
        pollInterval: 10,
        onProgress: progressCallback,
      });

      expect(progressCallback).toHaveBeenCalledTimes(3);
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ progress: 25 })
      );
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ progress: 50 })
      );
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({ progress: 100 })
      );
    });
  });

  describe('refresh()', () => {
    it('should refresh deployment status from server', async () => {
      const deployment = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-refresh',
          name: 'my-server',
          status: 'pending',
        },
        registry
      );

      expect(deployment.status).toBe('pending');

      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-refresh',
        name: 'my-server',
        status: 'running',
        message: 'Deployment successful',
        toolsDiscovered: 20,
        updatedAt: new Date().toISOString(),
      };

      mockFetchSuccess(mockStatus);

      await deployment.refresh();

      expect(deployment.status).toBe('running');
      expect(deployment.message).toBe('Deployment successful');
    });

    it('should update status to failed on refresh', async () => {
      const deployment = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-refresh-fail',
          name: 'my-server',
          status: 'deploying',
        },
        registry
      );

      const mockStatus: DeploymentStatus = {
        deploymentId: 'deploy-refresh-fail',
        name: 'my-server',
        status: 'failed',
        message: 'Build failed',
        error: {
          code: 'BUILD_ERROR',
          message: 'Syntax error',
        },
        updatedAt: new Date().toISOString(),
      };

      mockFetchSuccess(mockStatus);

      await deployment.refresh();

      expect(deployment.status).toBe('failed');
      expect(deployment.message).toBe('Build failed');
    });
  });

  describe('integration with add()', () => {
    it('should return MCPDeploymentClass from add() with working methods', async () => {
      const deploymentConfig: MCPDeploymentConfig = {
        name: 'integration-test',
        source: {
          type: 'github',
          url: 'https://github.com/user/mcp-server',
        },
        category: 'custom',
      };

      const mockAddResponse = {
        deploymentId: 'deploy-integration',
        name: 'integration-test',
        status: 'pending' as const,
        estimatedTime: '2-3 minutes',
      };

      mockFetchSuccess(mockAddResponse);

      const deployment = await registry.add(deploymentConfig);

      expect(deployment).toBeInstanceOf(MCPDeploymentClass);
      expect(deployment.deploymentId).toBe('deploy-integration');
      expect(deployment.name).toBe('integration-test');
      expect(deployment.status).toBe('pending');

      // Test that waitUntilReady is available
      expect(typeof deployment.waitUntilReady).toBe('function');
      expect(typeof deployment.refresh).toBe('function');
    });
  });

  describe('concurrent deployments', () => {
    it('should handle multiple deployments waiting in parallel', async () => {
      const deployment1 = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-1',
          name: 'server-1',
          status: 'pending',
        },
        registry
      );

      const deployment2 = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-2',
          name: 'server-2',
          status: 'pending',
        },
        registry
      );

      const deployment3 = new MCPDeploymentClass(
        {
          deploymentId: 'deploy-3',
          name: 'server-3',
          status: 'pending',
        },
        registry
      );

      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        const deploymentId = url.split('/').pop();
        const headers = new Map([['content-type', 'application/json']]);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () =>
            Promise.resolve({
              deploymentId,
              name: `server-${deploymentId?.split('-')[1]}`,
              status: 'running',
              updatedAt: new Date().toISOString(),
            }),
        });
      });

      await Promise.all([
        deployment1.waitUntilReady({ timeout: 60000, pollInterval: 10 }),
        deployment2.waitUntilReady({ timeout: 60000, pollInterval: 10 }),
        deployment3.waitUntilReady({ timeout: 60000, pollInterval: 10 }),
      ]);

      expect(deployment1.status).toBe('running');
      expect(deployment2.status).toBe('running');
      expect(deployment3.status).toBe('running');
    });
  });
});
