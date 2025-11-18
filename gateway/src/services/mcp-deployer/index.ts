/**
 * MCP Deployer Service
 * Handles deployment of custom MCP servers from various sources
 *
 * Wave 1: API structure and status tracking (this implementation)
 * Wave 2: Actual GitHub cloning, Docker building, K8s deployment (agents 5-8)
 */

import { randomUUID } from 'crypto';
import { logger } from '../../logging/logger';
import { DeploymentTracker } from './deployment-tracker';
import { GitHubService } from './github-service';
import { DockerBuilder } from './docker-builder';
import { K8sDeployer } from './k8s-deployer';
import { STDIOWrapper } from '../../wrappers/stdio-to-http';
import { STDIOHTTPServer } from '../../wrappers/stdio-http-server';
import { PortAllocator } from '../../wrappers/port-allocator';
import {
  AddMCPServerRequest,
  AddMCPServerResponse,
  Deployment,
  DeploymentStatusResponse,
  CustomServerInfo,
  GitHubMCPConfig,
  STDIOMCPConfig,
  HTTPMCPConfig,
  DockerMCPConfig,
} from './types';

/**
 * Main MCP Deployer Service
 */
export class MCPDeployer {
  private readonly _tracker: DeploymentTracker;
  private readonly _githubService: GitHubService;
  private readonly _dockerBuilder: DockerBuilder;
  private readonly _k8sDeployer: K8sDeployer;
  private readonly _portAllocator: PortAllocator;
  private readonly _stdioWrappers = new Map<string, { wrapper: STDIOWrapper; httpServer: STDIOHTTPServer; port: number }>();

  constructor(tracker?: DeploymentTracker, githubService?: GitHubService, dockerBuilder?: DockerBuilder, k8sDeployer?: K8sDeployer, portAllocator?: PortAllocator) {
    this._tracker = tracker || new DeploymentTracker();
    this._githubService = githubService || new GitHubService();
    this._dockerBuilder = dockerBuilder || new DockerBuilder();
    this._k8sDeployer = k8sDeployer || new K8sDeployer();
    this._portAllocator = portAllocator || PortAllocator.getInstance();
  }

  /**
   * Initialize the deployer service
   */
  async initialize(): Promise<void> {
    await this._tracker.connect();
    await this._githubService.initialize();
    await this._dockerBuilder.initialize();
    await this._k8sDeployer.initialize();
    logger.info('MCPDeployer service initialized');
  }

  /**
   * Cleanup and shutdown
   */
  async close(): Promise<void> {
    // Stop all STDIO wrappers
    for (const [deploymentId, { wrapper, httpServer, port }] of this._stdioWrappers.entries()) {
      try {
        await httpServer.stop();
        await wrapper.stop();
        this._portAllocator.release(port);
        logger.info('STDIO wrapper stopped', { deploymentId });
      } catch (error) {
        logger.error('Failed to stop STDIO wrapper', {
          deploymentId,
          error: (error as Error).message,
        });
      }
    }

    this._stdioWrappers.clear();

    await this._tracker.disconnect();
    logger.info('MCPDeployer service closed');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return await this._tracker.healthCheck();
  }

  /**
   * Add a new MCP server
   */
  async addMCPServer(request: AddMCPServerRequest): Promise<AddMCPServerResponse> {
    // Validate request
    this._validateAddRequest(request);

    // Check if server name already exists
    const exists = await this._tracker.hasCustomServer(request.name);
    if (exists) {
      throw new Error(`MCP server with name '${request.name}' already exists`);
    }

    // Create deployment ID
    const deploymentId = `dep-${randomUUID()}`;

    logger.info('Starting MCP server deployment', {
      deploymentId,
      name: request.name,
      sourceType: request.source.type,
      category: request.category,
    });

    // Create initial deployment record
    const deployment: Deployment = {
      deploymentId,
      name: request.name,
      category: request.category,
      source: request.source,
      status: 'deploying',
      progress: {
        clone: 'pending',
        build: 'pending',
        deploy: 'pending',
        discovery: 'pending',
        embeddings: 'pending',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      tenantId: request.tenantId,
    };

    // Store initial deployment status
    await this._tracker.setDeployment(deployment);

    // Dispatch deployment based on source type
    // Note: In Wave 1, these are placeholder implementations
    // Wave 2 will implement actual deployment logic
    this._dispatchDeployment(deployment).catch((error) => {
      logger.error('Deployment failed', {
        deploymentId,
        error: (error as Error).message,
      });
      this._tracker.updateStatus(deploymentId, 'failed', undefined, (error as Error).message);
    });

    return {
      deploymentId,
      status: 'deploying',
      estimatedTime: this._estimateDeploymentTime(request.source.type),
    };
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatusResponse | null> {
    const deployment = await this._tracker.getDeployment(deploymentId);

    if (!deployment) {
      return null;
    }

    return {
      deploymentId: deployment.deploymentId,
      status: deployment.status,
      progress: deployment.progress,
      toolsDiscovered: deployment.toolsDiscovered,
      endpoint: deployment.endpoint,
      error: deployment.error,
      estimatedTime: this._estimateRemainingTime(deployment),
    };
  }

  /**
   * List all custom servers
   */
  async listCustomServers(tenantId?: string): Promise<CustomServerInfo[]> {
    return await this._tracker.listCustomServers(tenantId);
  }

  /**
   * Remove a custom server
   */
  async removeCustomServer(name: string): Promise<boolean> {
    const exists = await this._tracker.hasCustomServer(name);

    if (!exists) {
      logger.warn('Attempted to remove non-existent custom server', { name });
      return false;
    }

    // Find and stop STDIO wrapper if it exists
    for (const [deploymentId, wrapperInfo] of this._stdioWrappers.entries()) {
      const deployment = await this._tracker.getDeployment(deploymentId);
      if (deployment && deployment.name === name) {
        try {
          await wrapperInfo.httpServer.stop();
          await wrapperInfo.wrapper.stop();
          this._portAllocator.release(wrapperInfo.port);
          this._stdioWrappers.delete(deploymentId);
          logger.info('STDIO wrapper stopped for removal', { name, deploymentId });
        } catch (error) {
          logger.error('Failed to stop STDIO wrapper', {
            name,
            deploymentId,
            error: (error as Error).message,
          });
        }
        break;
      }
    }

    // TODO Wave 2: Implement actual K8s deployment cleanup for other types

    const removed = await this._tracker.removeCustomServer(name);

    if (removed) {
      logger.info('Custom MCP server removed', { name });
    }

    return removed;
  }

  /**
   * Deploy from GitHub URL
   */
  async deployFromGitHub(config: GitHubMCPConfig, deployment: Deployment): Promise<Deployment> {
    const { deploymentId } = deployment;

    logger.info('Deploying from GitHub', {
      deploymentId,
      url: config.url,
      branch: config.branch,
    });

    try {
      // Step 1: Clone repository
      await this._tracker.updateStatus(deploymentId, 'deploying', { clone: 'in_progress' });

      const cloneResult = await this._githubService.cloneRepository({
        url: config.url,
        branch: config.branch,
        auth: config.auth,
        deploymentId,
      });

      await this._tracker.updateStatus(deploymentId, 'deploying', { clone: 'completed' });

      logger.info('Repository cloned', {
        deploymentId,
        commitHash: cloneResult.commitHash,
        branch: cloneResult.branch,
        size: Math.round(cloneResult.size / 1024 / 1024) + 'MB',
      });

      // Step 2: Detect MCP server type
      await this._tracker.updateStatus(deploymentId, 'deploying', { build: 'in_progress' });

      const serverType = await this._githubService.detectMCPType(cloneResult.repoPath);
      const metadata = await this._githubService.extractMetadata(cloneResult.repoPath);

      logger.info('MCP server detected', {
        deploymentId,
        type: serverType.type,
        packageManager: serverType.packageManager,
        metadata,
      });

      // Update deployment with metadata
      deployment.toolsDiscovered = 0; // Will be set during discovery phase
      await this._tracker.setDeployment(deployment);

      // Step 3: Build Docker image
      await this._tracker.updateStatus(deploymentId, 'deploying', { build: 'in_progress' });

      const buildResult = await this._dockerBuilder.buildImage({
        repoPath: cloneResult.repoPath,
        serverType,
        deploymentId,
        metadata,
        // registry: Optional registry URL for pushing images
      });

      logger.info('Docker image built successfully', {
        deploymentId,
        imageTag: buildResult.imageTag,
        imageId: buildResult.imageId.slice(0, 12),
        size: Math.round(buildResult.size / 1024 / 1024) + 'MB',
        buildTime: buildResult.buildTime + 'ms',
        warnings: buildResult.warnings?.length || 0,
      });

      await this._tracker.updateStatus(deploymentId, 'deploying', { build: 'completed' });

      // Step 4: Deploy to Kubernetes
      await this._tracker.updateStatus(deploymentId, 'deploying', { deploy: 'in_progress' });

      const deploymentResult = await this._k8sDeployer.deployMCPServer({
        name: deployment.name,
        deploymentId,
        imageTag: buildResult.imageTag,
        metadata,
      });

      await this._tracker.updateEndpoint(deploymentId, deploymentResult.endpoint);
      await this._tracker.updateStatus(deploymentId, 'deploying', { deploy: 'completed' });

      logger.info('K8s deployment completed', {
        deploymentId,
        endpoint: deploymentResult.endpoint,
        podIP: deploymentResult.podIP,
      });

      // Step 5: Tool discovery (placeholder - will be implemented by discovery agent)
      await this._tracker.updateStatus(deploymentId, 'deploying', { discovery: 'in_progress' });
      await this._sleep(300);
      await this._tracker.updateStatus(deploymentId, 'deploying', { discovery: 'completed' });
      await this._tracker.updateToolsDiscovered(deploymentId, 12); // Placeholder count

      // Step 6: Generate embeddings (placeholder - will be implemented by embedding agent)
      await this._tracker.updateStatus(deploymentId, 'deploying', { embeddings: 'in_progress' });
      await this._sleep(300);
      await this._tracker.updateStatus(deploymentId, 'deploying', { embeddings: 'completed' });

      // Mark as running
      const updatedDeployment = await this._tracker.getDeployment(deploymentId);
      if (updatedDeployment) {
        updatedDeployment.status = 'running';
        updatedDeployment.endpoint = deploymentResult.endpoint;
        await this._tracker.setDeployment(updatedDeployment);

        // Add to custom servers registry
        await this._tracker.addCustomServer({
          name: deployment.name,
          category: deployment.category,
          toolCount: 12,
          status: 'running',
          source: config.url,
          deployedAt: new Date(),
          tenantId: deployment.tenantId,
        });
      }

      logger.info('GitHub deployment completed', { deploymentId });

      return deployment;
    } catch (error) {
      logger.error('GitHub deployment failed', {
        deploymentId,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      await this._tracker.updateStatus(deploymentId, 'failed', undefined, (error as Error).message);

      throw error;
    }
  }

  /**
   * Deploy from STDIO configuration
   */
  async deployFromSTDIO(config: STDIOMCPConfig, deployment: Deployment): Promise<Deployment> {
    const { deploymentId } = deployment;

    logger.info('Deploying from STDIO', {
      deploymentId,
      command: config.command,
      args: config.args,
    });

    try {
      // Step 1: Create STDIO wrapper
      await this._tracker.updateStatus(deploymentId, 'deploying', { deploy: 'in_progress' });

      const wrapper = new STDIOWrapper({
        command: config.command,
        args: config.args || [],
        env: config.env || {},
      });

      // Start the STDIO process
      await wrapper.start();

      // Step 2: Discover tools
      await this._tracker.updateStatus(deploymentId, 'deploying', {
        deploy: 'completed',
        discovery: 'in_progress',
      });

      const tools = await wrapper.listTools();
      await this._tracker.updateToolsDiscovered(deploymentId, tools.length);

      logger.info('Tools discovered from STDIO server', {
        deploymentId,
        count: tools.length,
      });

      await this._tracker.updateStatus(deploymentId, 'deploying', { discovery: 'completed' });

      // Step 3: Start HTTP server
      const port = this._portAllocator.allocate();
      const httpServer = new STDIOHTTPServer(wrapper);

      await httpServer.start(port);

      const endpoint = `http://localhost:${port}`;

      // Update deployment endpoint
      const updatedDeployment = await this._tracker.getDeployment(deploymentId);
      if (updatedDeployment) {
        updatedDeployment.endpoint = endpoint;
        await this._tracker.setDeployment(updatedDeployment);
      }

      logger.info('STDIO HTTP server started', {
        deploymentId,
        endpoint,
        port,
      });

      // Step 4: Generate embeddings (placeholder for now)
      await this._tracker.updateStatus(deploymentId, 'deploying', { embeddings: 'in_progress' });
      // TODO: Integrate with embedding service
      await this._sleep(300);
      await this._tracker.updateStatus(deploymentId, 'deploying', { embeddings: 'completed' });

      // Mark as running
      await this._tracker.updateStatus(deploymentId, 'running');

      // Store wrapper and server for lifecycle management
      this._stdioWrappers.set(deploymentId, { wrapper, httpServer, port });

      // Add to custom servers registry
      await this._tracker.addCustomServer({
        name: deployment.name,
        category: deployment.category,
        toolCount: tools.length,
        status: 'running',
        source: this._formatSourceString(deployment.source),
        deployedAt: new Date(),
        tenantId: deployment.tenantId,
      });

      logger.info('STDIO deployment completed successfully', {
        deploymentId,
        toolCount: tools.length,
        endpoint,
      });

      return deployment;
    } catch (error) {
      logger.error('STDIO deployment failed', {
        deploymentId,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      await this._tracker.updateStatus(deploymentId, 'failed', undefined, (error as Error).message);

      // Cleanup on failure
      const wrapperInfo = this._stdioWrappers.get(deploymentId);
      if (wrapperInfo) {
        try {
          await wrapperInfo.httpServer.stop();
          await wrapperInfo.wrapper.stop();
          this._portAllocator.release(wrapperInfo.port);
          this._stdioWrappers.delete(deploymentId);
        } catch (cleanupError) {
          logger.error('Failed to cleanup after deployment failure', {
            deploymentId,
            error: (cleanupError as Error).message,
          });
        }
      }

      throw error;
    }
  }

  /**
   * Deploy remote HTTP/SSE server
   * Note: Wave 1 placeholder - actual implementation in Wave 2
   */
  async deployRemoteHTTP(config: HTTPMCPConfig, deployment: Deployment): Promise<Deployment> {
    logger.info('Registering remote HTTP server (placeholder)', {
      deploymentId: deployment.deploymentId,
      url: config.url,
    });

    // Wave 1: Placeholder implementation
    // Wave 2: Will implement:
    // 1. Validate remote endpoint
    // 2. Register in service registry (no K8s deployment needed)
    // 3. Discover tools from remote
    // 4. Generate embeddings

    await this._simulateDeploymentSteps(deployment, true);

    return deployment;
  }

  /**
   * Deploy from Docker image
   * Note: Wave 1 placeholder - actual implementation in Wave 2
   */
  async deployFromDocker(config: DockerMCPConfig, deployment: Deployment): Promise<Deployment> {
    logger.info('Deploying from Docker image (placeholder)', {
      deploymentId: deployment.deploymentId,
      image: config.image,
    });

    // Wave 1: Placeholder implementation
    // Wave 2: Will implement:
    // 1. Pull Docker image
    // 2. Deploy to K8s
    // 3. Discover tools
    // 4. Generate embeddings

    await this._simulateDeploymentSteps(deployment);

    return deployment;
  }

  /**
   * Dispatch deployment to appropriate handler
   */
  private async _dispatchDeployment(deployment: Deployment): Promise<void> {
    try {
      switch (deployment.source.type) {
        case 'github':
          await this.deployFromGitHub(deployment.source, deployment);
          break;
        case 'stdio':
          await this.deployFromSTDIO(deployment.source, deployment);
          break;
        case 'http':
          await this.deployRemoteHTTP(deployment.source, deployment);
          break;
        case 'docker':
          await this.deployFromDocker(deployment.source, deployment);
          break;
        default:
          throw new Error(`Unknown source type: ${(deployment.source as any).type}`);
      }
    } catch (error) {
      logger.error('Deployment dispatch failed', {
        deploymentId: deployment.deploymentId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Validate add MCP server request
   */
  private _validateAddRequest(request: AddMCPServerRequest): void {
    if (!request.name || typeof request.name !== 'string') {
      throw new Error('Server name is required and must be a string');
    }

    if (!request.category || typeof request.category !== 'string') {
      throw new Error('Category is required and must be a string');
    }

    if (!request.source || typeof request.source !== 'object') {
      throw new Error('Source configuration is required');
    }

    // Validate source-specific fields
    switch (request.source.type) {
      case 'github':
        if (!request.source.url) {
          throw new Error('GitHub URL is required');
        }
        break;
      case 'stdio':
        if (!request.source.command) {
          throw new Error('STDIO command is required');
        }
        break;
      case 'http':
        if (!request.source.url) {
          throw new Error('HTTP URL is required');
        }
        break;
      case 'docker':
        if (!request.source.image) {
          throw new Error('Docker image is required');
        }
        break;
      default:
        throw new Error(`Unknown source type: ${(request.source as any).type}`);
    }
  }

  /**
   * Estimate deployment time based on source type
   */
  private _estimateDeploymentTime(sourceType: string): string {
    switch (sourceType) {
      case 'github':
        return '3-5 minutes';
      case 'stdio':
        return '2-3 minutes';
      case 'http':
        return '30-60 seconds';
      case 'docker':
        return '1-2 minutes';
      default:
        return '2-5 minutes';
    }
  }

  /**
   * Estimate remaining time for deployment
   */
  private _estimateRemainingTime(deployment: Deployment): string {
    if (deployment.status === 'running') {
      return '0 seconds';
    }

    if (deployment.status === 'failed') {
      return 'N/A';
    }

    // Simple estimation based on progress
    const totalSteps = 5;
    const completedSteps = Object.values(deployment.progress).filter(
      (status) => status === 'completed'
    ).length;

    const remainingSteps = totalSteps - completedSteps;
    const avgTimePerStep = 30; // seconds

    return `${remainingSteps * avgTimePerStep} seconds`;
  }

  /**
   * Simulate deployment steps for Wave 1
   * This will be replaced with actual implementation in Wave 2
   */
  private async _simulateDeploymentSteps(
    deployment: Deployment,
    skipBuild: boolean = false
  ): Promise<void> {
    const { deploymentId } = deployment;

    // Simulate clone step (not needed for HTTP)
    if (!skipBuild && deployment.source.type !== 'http') {
      await this._tracker.updateStatus(deploymentId, 'deploying', { clone: 'in_progress' });
      await this._sleep(500);
      await this._tracker.updateStatus(deploymentId, 'deploying', { clone: 'completed' });
    }

    // Simulate build step (not needed for HTTP)
    if (!skipBuild) {
      await this._tracker.updateStatus(deploymentId, 'deploying', { build: 'in_progress' });
      await this._sleep(500);
      await this._tracker.updateStatus(deploymentId, 'deploying', { build: 'completed' });
    }

    // Simulate deploy step
    await this._tracker.updateStatus(deploymentId, 'deploying', { deploy: 'in_progress' });
    await this._sleep(500);
    await this._tracker.updateStatus(deploymentId, 'deploying', { deploy: 'completed' });

    // Simulate tool discovery
    await this._tracker.updateStatus(deploymentId, 'deploying', { discovery: 'in_progress' });
    await this._sleep(300);
    await this._tracker.updateStatus(deploymentId, 'deploying', { discovery: 'completed' });
    await this._tracker.updateToolsDiscovered(deploymentId, 12); // Placeholder count

    // Simulate embeddings generation
    await this._tracker.updateStatus(deploymentId, 'deploying', { embeddings: 'in_progress' });
    await this._sleep(300);
    await this._tracker.updateStatus(deploymentId, 'deploying', { embeddings: 'completed' });

    // Mark as running
    const updatedDeployment = await this._tracker.getDeployment(deploymentId);
    if (updatedDeployment) {
      updatedDeployment.status = 'running';
      updatedDeployment.endpoint = `http://${deployment.name}.mcp.svc.cluster.local:3000`;
      await this._tracker.setDeployment(updatedDeployment);

      // Add to custom servers registry
      await this._tracker.addCustomServer({
        name: deployment.name,
        category: deployment.category,
        toolCount: 12,
        status: 'running',
        source: this._formatSourceString(deployment.source),
        deployedAt: new Date(),
        tenantId: deployment.tenantId,
      });
    }

    logger.info('Deployment simulation completed', { deploymentId });
  }

  /**
   * Format source configuration as string
   */
  private _formatSourceString(source: any): string {
    switch (source.type) {
      case 'github':
        return source.url;
      case 'stdio':
        return `stdio:${source.command}`;
      case 'http':
        return source.url;
      case 'docker':
        return source.image;
      default:
        return 'unknown';
    }
  }

  /**
   * Sleep utility
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Export types and services
 */
export * from './types';
export { DeploymentTracker } from './deployment-tracker';
export { GitHubService } from './github-service';
export { DockerBuilder } from './docker-builder';
export { K8sDeployer } from './k8s-deployer';
