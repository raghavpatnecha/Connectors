/**
 * MCP Registry - Manage MCP servers and integrations
 */

import { HTTPClient } from './utils/http-client';
import type { ConnectorsConfig } from './types/config';
import type {
  MCPIntegration,
  MCPDeploymentConfig,
  StandardMCPConfig,
  DeploymentStatus,
  GitHubSource,
  STDIOSource,
  HTTPSource,
  DockerSource,
  WaitOptions,
  DeploymentData,
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
 * MCPDeployment - Represents a deployment of a custom MCP server
 *
 * Provides methods to wait for deployment completion and check status.
 *
 * @example
 * ```typescript
 * const deployment = await mcp.add({
 *   name: 'my-server',
 *   source: { type: 'github', url: '...' },
 *   category: 'custom'
 * });
 *
 * // Wait for deployment to complete
 * await deployment.waitUntilReady({
 *   timeout: 600000, // 10 minutes
 *   onProgress: (status) => {
 *     console.log(`Status: ${status.status}`);
 *   }
 * });
 *
 * console.log('Deployment complete!');
 * ```
 */
export class MCPDeploymentClass {
  readonly deploymentId: string;
  readonly name: string;
  status: 'pending' | 'deploying' | 'running' | 'failed';
  estimatedTime?: string;
  message?: string;

  constructor(
    data: DeploymentData,
    private readonly registry: MCPRegistry
  ) {
    this.deploymentId = data.deploymentId;
    this.name = data.name;
    this.status = data.status;
    this.estimatedTime = data.estimatedTime;
    this.message = data.message;
  }

  /**
   * Wait until deployment is ready or fails
   *
   * This method polls the deployment status until it reaches a terminal state
   * ('running' or 'failed'). Uses exponential backoff with jitter for polling.
   *
   * @param options - Wait options (timeout, polling interval, progress callback)
   * @throws {DeploymentTimeoutError} If deployment doesn't complete within timeout
   * @throws {DeploymentFailedError} If deployment fails
   *
   * @example
   * ```typescript
   * const deployment = await mcp.add(config);
   *
   * await deployment.waitUntilReady({
   *   timeout: 600000, // 10 minutes
   *   pollInterval: 2000, // 2 seconds
   *   onProgress: (status) => {
   *     console.log(`Progress: ${status.progress}%`);
   *     console.log(`Status: ${status.status}`);
   *   }
   * });
   * ```
   */
  async waitUntilReady(options?: WaitOptions): Promise<void> {
    const finalStatus = await this.registry.waitForDeployment(
      this.deploymentId,
      options
    );

    // Update own status
    this.status = finalStatus.status as 'pending' | 'deploying' | 'running' | 'failed';
    this.message = finalStatus.message;

    // If deployment failed, throw error
    if (finalStatus.status === 'failed') {
      throw new DeploymentFailedError(
        `Deployment ${this.deploymentId} failed: ${finalStatus.error?.message || 'Unknown error'}`,
        this.deploymentId,
        finalStatus.error?.message
      );
    }
  }

  /**
   * Refresh deployment status from the server
   *
   * Updates the internal status fields with latest data from the server.
   *
   * @example
   * ```typescript
   * const deployment = await mcp.add(config);
   *
   * // Later, refresh status
   * await deployment.refresh();
   * console.log(`Current status: ${deployment.status}`);
   * ```
   */
  async refresh(): Promise<void> {
    const status = await this.registry.getDeploymentStatus(this.deploymentId);
    this.status = status.status as 'pending' | 'deploying' | 'running' | 'failed';
    this.message = status.message;
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
   * @returns MCPDeploymentClass instance with waitUntilReady() method
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
   * // Wait for deployment to complete
   * await deployment.waitUntilReady({
   *   timeout: 600000,
   *   onProgress: (status) => console.log(status.status)
   * });
   * ```
   */
  async add(config: MCPDeploymentConfig): Promise<MCPDeploymentClass> {
    const requestBody = {
      name: config.name,
      source: config.source,
      category: config.category,
      description: config.description,
      tenantId: config.tenantId || this.config.tenantId,
      env: config.env,
      autoDiscover: config.autoDiscover !== false, // Default true
    };

    const response = await this.httpClient.post<{
      deploymentId: string;
      name: string;
      status: 'pending' | 'deploying' | 'running' | 'failed';
      estimatedTime?: string;
      message?: string;
    }>('/api/v1/mcp/add', requestBody);

    // Return enhanced deployment object with waitUntilReady() method
    return new MCPDeploymentClass(
      {
        deploymentId: response.data.deploymentId,
        name: response.data.name,
        status: response.data.status,
        estimatedTime: response.data.estimatedTime,
        message: response.data.message,
      },
      this
    );
  }

  /**
   * Add MCP server from standard MCP configuration format
   *
   * Converts standard MCP config (mcp.json format) to Connectors deployment format.
   * Supports STDIO, SSE, and HTTP transports.
   *
   * @param config - Standard MCP configuration
   * @returns MCPDeploymentClass instance for the first server in config
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
   * await deployment.waitUntilReady();
   * ```
   */
  async addFromConfig(config: StandardMCPConfig): Promise<MCPDeploymentClass> {
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
   * Wait for deployment to complete with polling
   *
   * Polls the deployment status endpoint until the deployment reaches a terminal
   * state ('running' or 'failed'). Uses exponential backoff with jitter to avoid
   * overwhelming the server.
   *
   * @param deploymentId - Deployment ID to wait for
   * @param options - Wait options (timeout, polling interval, progress callback)
   * @returns Final deployment status
   * @throws {DeploymentTimeoutError} If deployment doesn't complete within timeout
   * @throws {DeploymentFailedError} If deployment fails
   *
   * @example
   * ```typescript
   * const deployment = await mcp.add(config);
   * const finalStatus = await mcp.waitForDeployment(
   *   deployment.deploymentId,
   *   {
   *     timeout: 600000, // 10 minutes
   *     onProgress: (status) => {
   *       console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
   *     }
   *   }
   * );
   * ```
   */
  async waitForDeployment(
    deploymentId: string,
    options?: WaitOptions
  ): Promise<DeploymentStatus> {
    const timeout = options?.timeout ?? 300000; // 5 minutes default
    const pollInterval = options?.pollInterval ?? 2000; // 2 seconds default

    return this._pollDeploymentStatus(
      deploymentId,
      timeout,
      pollInterval,
      options?.onProgress
    );
  }

  /**
   * Poll deployment status until ready or timeout (internal)
   *
   * Implements exponential backoff with jitter:
   * - Initial interval: pollInterval (default 2s)
   * - Max interval: 10s
   * - Formula: min(currentInterval * 1.5 + random(0, 1000), 10000)
   *
   * @param deploymentId - Deployment ID to poll
   * @param timeout - Maximum wait time in milliseconds
   * @param pollInterval - Initial polling interval in milliseconds
   * @param onProgress - Optional progress callback
   * @returns Final deployment status
   * @throws {DeploymentTimeoutError} If timeout is exceeded
   * @throws {DeploymentFailedError} If deployment fails
   * @internal
   */
  private async _pollDeploymentStatus(
    deploymentId: string,
    timeout: number,
    pollInterval: number,
    onProgress?: (status: DeploymentStatus) => void
  ): Promise<DeploymentStatus> {
    const startTime = Date.now();
    let currentInterval = pollInterval;
    let attempt = 0;

    while (true) {
      // Get current status
      const status = await this.getDeploymentStatus(deploymentId);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check terminal states
      if (status.status === 'running') {
        return status;
      }

      if (status.status === 'failed') {
        throw new DeploymentFailedError(
          `Deployment ${deploymentId} failed: ${status.error?.message || 'Unknown error'}`,
          deploymentId,
          status.error?.message
        );
      }

      // Check timeout
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        throw new DeploymentTimeoutError(
          `Deployment ${deploymentId} timed out after ${timeout}ms (current status: ${status.status})`,
          deploymentId,
          timeout
        );
      }

      // Calculate time remaining
      const timeRemaining = timeout - elapsed;

      // Don't sleep longer than remaining time
      const sleepTime = Math.min(currentInterval, timeRemaining);

      // Wait with exponential backoff + jitter
      await this._sleep(sleepTime);

      // Update interval with exponential backoff + jitter
      // Formula: min(currentInterval * 1.5 + random(0, 1000), 10000)
      currentInterval = Math.min(
        currentInterval * 1.5 + Math.random() * 1000,
        10000
      );

      attempt++;
    }
  }

  /**
   * Sleep utility for polling delays
   * @internal
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

/**
 * Error thrown when deployment times out
 */
export class DeploymentTimeoutError extends Error {
  constructor(
    message: string,
    public readonly deploymentId: string,
    public readonly timeout: number
  ) {
    super(message);
    this.name = 'DeploymentTimeoutError';
  }
}

/**
 * Error thrown when deployment fails
 */
export class DeploymentFailedError extends Error {
  constructor(
    message: string,
    public readonly deploymentId: string,
    public readonly reason?: string
  ) {
    super(message);
    this.name = 'DeploymentFailedError';
  }
}
