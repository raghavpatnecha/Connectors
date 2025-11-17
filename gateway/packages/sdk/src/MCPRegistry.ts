/**
 * MCP Registry - Manage MCP servers and integrations
 */

import { HTTPClient } from './utils/http-client';
import type { ConnectorsConfig } from './types/config';
import type {
  MCPIntegration,
  MCPDeploymentConfig,
  StandardMCPConfig,
  MCPDeployment,
  DeploymentStatus,
  GitHubSource,
  STDIOSource,
  HTTPSource,
  DockerSource,
} from './types/mcp';
import type { Tool, ToolInvocationResponse } from './types/tools';

/**
 * MCPServer - Bound instance for a specific integration
 *
 * @example
 * ```typescript
 * const github = await mcp.get('github');
 * const result = await github.call('createPullRequest', {
 *   repo: 'owner/repo',
 *   title: 'New PR',
 *   head: 'feature',
 *   base: 'main'
 * });
 * ```
 */
export class MCPServer {
  constructor(
    private readonly integration: string,
    private readonly httpClient: HTTPClient,
    private readonly config: ConnectorsConfig
  ) {}

  /**
   * Call a tool from this MCP server
   *
   * @param toolName - Tool name (without integration prefix)
   * @param parameters - Tool parameters
   * @returns Tool execution result
   *
   * @example
   * ```typescript
   * const github = await mcp.get('github');
   * const pr = await github.call('createPullRequest', {
   *   repo: 'owner/repo',
   *   title: 'New PR'
   * });
   * ```
   */
  async call<T = unknown>(
    toolName: string,
    parameters: Record<string, unknown>
  ): Promise<T> {
    const toolId = `${this.integration}.${toolName}`;

    const response = await this.httpClient.post<ToolInvocationResponse<T>>(
      '/api/v1/tools/invoke',
      {
        toolId,
        integration: this.integration,
        parameters,
        tenantId: this.config.tenantId,
      }
    );

    if (!response.data.success) {
      throw new MCPToolError(
        `Tool invocation failed: ${response.data.error?.message || 'Unknown error'}`,
        toolId,
        response.data.error
      );
    }

    return response.data.data as T;
  }

  /**
   * List all tools available in this MCP server
   *
   * @returns Array of tools
   *
   * @example
   * ```typescript
   * const github = await mcp.get('github');
   * const tools = await github.listTools();
   * console.log(tools.map(t => t.name));
   * ```
   */
  async listTools(): Promise<Tool[]> {
    const response = await this.httpClient.get<{ tools: Tool[] }>(
      `/api/v1/tools/list?integration=${this.integration}`
    );

    return response.data.tools || [];
  }

  /**
   * Get integration name
   */
  get name(): string {
    return this.integration;
  }
}

/**
 * MCPRegistry - Manage MCP servers and integrations
 *
 * @example
 * ```typescript
 * import { Connectors } from '@connectors/sdk';
 *
 * const connectors = new Connectors({
 *   baseURL: 'http://localhost:3000',
 *   tenantId: 'my-tenant'
 * });
 *
 * // List all integrations
 * const integrations = await connectors.mcp.list();
 *
 * // Get specific integration
 * const github = await connectors.mcp.get('github');
 * const pr = await github.call('createPullRequest', {...});
 *
 * // Add custom MCP server
 * const deployment = await connectors.mcp.add({
 *   name: 'my-custom-server',
 *   source: { type: 'github', url: 'https://github.com/user/mcp-server' },
 *   category: 'custom'
 * });
 * ```
 */
export class MCPRegistry {
  constructor(
    private readonly httpClient: HTTPClient,
    private readonly config: ConnectorsConfig
  ) {}

  /**
   * Get a bound MCPServer instance for a specific integration
   *
   * This method does not make an API call - it simply creates a wrapper
   * that automatically fills in the integration name for tool calls.
   *
   * @param integration - Integration name (e.g., 'github', 'slack')
   * @returns Bound MCPServer instance
   *
   * @example
   * ```typescript
   * const github = await mcp.get('github');
   * const pr = await github.call('createPullRequest', {
   *   repo: 'owner/repo',
   *   title: 'New PR'
   * });
   * ```
   */
  async get(integration: string): Promise<MCPServer> {
    return new MCPServer(integration, this.httpClient, this.config);
  }

  /**
   * List all available MCP integrations
   *
   * @returns Array of integrations with tool counts
   *
   * @example
   * ```typescript
   * const integrations = await mcp.list();
   * integrations.forEach(integration => {
   *   console.log(`${integration.name}: ${integration.toolCount} tools`);
   *   integration.tools.forEach(tool => {
   *     console.log(`  - ${tool.name}: ${tool.description}`);
   *   });
   * });
   * ```
   */
  async list(): Promise<MCPIntegration[]> {
    const response = await this.httpClient.get<{
      integrations: MCPIntegration[];
    }>('/api/v1/tools/list');

    return response.data.integrations || [];
  }

  /**
   * Add a custom MCP server
   *
   * Supports 4 source types:
   * - github: Deploy from GitHub repository
   * - stdio: Run as local process
   * - http: Connect to HTTP MCP server
   * - docker: Deploy as Docker container
   *
   * @param config - Deployment configuration
   * @returns Deployment object with deploymentId for tracking
   *
   * @example
   * ```typescript
   * // Deploy from GitHub
   * const deployment = await mcp.add({
   *   name: 'my-mcp-server',
   *   source: {
   *     type: 'github',
   *     url: 'https://github.com/user/mcp-server',
   *     ref: 'main'
   *   },
   *   category: 'custom',
   *   description: 'My custom MCP server'
   * });
   *
   * // Check deployment status
   * const status = await mcp.getDeploymentStatus(deployment.deploymentId);
   * ```
   */
  async add(config: MCPDeploymentConfig): Promise<MCPDeployment> {
    const requestBody = {
      name: config.name,
      source: config.source,
      category: config.category,
      description: config.description,
      tenantId: config.tenantId || this.config.tenantId,
      env: config.env,
      autoDiscover: config.autoDiscover !== false, // Default true
    };

    const response = await this.httpClient.post<MCPDeployment>(
      '/api/v1/mcp/add',
      requestBody
    );

    return response.data;
  }

  /**
   * Add MCP server from standard MCP configuration format
   *
   * Converts standard MCP config (mcp.json format) to Connectors deployment format.
   * Supports STDIO, SSE, and HTTP transports.
   *
   * @param config - Standard MCP configuration
   * @returns Deployment object for the first server in config
   *
   * @example
   * ```typescript
   * const config = {
   *   mcpServers: {
   *     'my-server': {
   *       command: 'node',
   *       args: ['dist/index.js'],
   *       env: { API_KEY: 'secret' },
   *       transport: 'stdio'
   *     }
   *   }
   * };
   *
   * const deployment = await mcp.addFromConfig(config);
   * ```
   */
  async addFromConfig(config: StandardMCPConfig): Promise<MCPDeployment> {
    // Get first server from config
    const serverNames = Object.keys(config.mcpServers);
    if (serverNames.length === 0) {
      throw new MCPConfigError('No servers found in MCP configuration');
    }

    const serverName = serverNames[0]!; // Safe: checked length > 0
    const serverConfig = config.mcpServers[serverName]!; // Safe: comes from Object.keys

    // Convert to Connectors deployment format
    const deploymentConfig = this._convertStandardConfig(
      serverName,
      serverConfig
    );

    return this.add(deploymentConfig);
  }

  /**
   * Remove a custom MCP server
   *
   * @param name - Server name to remove
   *
   * @example
   * ```typescript
   * await mcp.remove('my-custom-server');
   * ```
   */
  async remove(name: string): Promise<void> {
    const tenantId = this.config.tenantId;
    const url = `/api/v1/mcp/custom/${name}${tenantId ? `?tenantId=${tenantId}` : ''}`;

    await this.httpClient.delete(url);
  }

  /**
   * Get deployment status for a custom MCP server
   *
   * @param deploymentId - Deployment ID from add() response
   * @returns Deployment status with progress tracking
   *
   * @example
   * ```typescript
   * const deployment = await mcp.add({...});
   * const status = await mcp.getDeploymentStatus(deployment.deploymentId);
   *
   * console.log(`Status: ${status.status}`);
   * console.log(`Progress: clone=${status.progress?.clone}`);
   * console.log(`Tools discovered: ${status.toolsDiscovered}`);
   * ```
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    const response = await this.httpClient.get<DeploymentStatus>(
      `/api/v1/mcp/deployments/${deploymentId}`
    );

    return response.data;
  }

  /**
   * Convert standard MCP config to Connectors deployment config
   * @internal
   */
  private _convertStandardConfig(
    name: string,
    serverConfig: {
      command?: string;
      args?: string[];
      env?: Record<string, string>;
      url?: string;
      transport?: 'stdio' | 'sse' | 'http';
    }
  ): MCPDeploymentConfig {
    // Determine source type based on config
    let source: GitHubSource | STDIOSource | HTTPSource | DockerSource;

    if (serverConfig.url) {
      // HTTP or SSE transport
      source = {
        type: 'http',
        url: serverConfig.url,
      };
    } else if (serverConfig.command) {
      // STDIO transport
      source = {
        type: 'stdio',
        command: serverConfig.command,
        args: serverConfig.args,
        env: serverConfig.env,
      };
    } else {
      throw new MCPConfigError(
        `Invalid MCP server configuration for ${name}: must specify either 'url' or 'command'`
      );
    }

    return {
      name,
      source,
      category: 'custom',
      description: `Custom MCP server: ${name}`,
      env: serverConfig.env,
      autoDiscover: true,
    };
  }
}

/**
 * Error thrown when MCP tool invocation fails
 */
export class MCPToolError extends Error {
  constructor(
    message: string,
    public readonly toolId: string,
    public readonly details?: {
      code: string;
      message: string;
      details?: Record<string, unknown>;
    }
  ) {
    super(message);
    this.name = 'MCPToolError';
  }
}

/**
 * Error thrown when MCP configuration is invalid
 */
export class MCPConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MCPConfigError';
  }
}
