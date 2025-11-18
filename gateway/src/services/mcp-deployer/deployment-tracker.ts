/**
 * Deployment Tracker Service
 * Redis-based status tracking for MCP server deployments
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from '../../logging/logger';
import {
  Deployment,
  DeploymentStatus,
  DeploymentProgress,
  CustomServerInfo,
} from './types';

const DEPLOYMENT_KEY_PREFIX = 'mcp:deployment:';
const CUSTOM_SERVERS_KEY = 'mcp:custom-servers';
const DEFAULT_TTL = 86400 * 7; // 7 days

/**
 * Deployment tracker using Redis for persistent state
 */
export class DeploymentTracker {
  private _client: RedisClientType | null = null;
  private readonly _redisUrl: string;

  constructor(redisUrl?: string) {
    this._redisUrl = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    try {
      this._client = createClient({ url: this._redisUrl });

      this._client.on('error', (err) => {
        logger.error('DeploymentTracker Redis error', { error: err.message });
      });

      await this._client.connect();
      logger.info('DeploymentTracker connected to Redis', { url: this._redisUrl });
    } catch (error) {
      logger.error('Failed to connect DeploymentTracker to Redis', {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.quit();
      this._client = null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this._client) {
      return false;
    }

    try {
      await this._client.ping();
      return true;
    } catch (error) {
      logger.error('DeploymentTracker health check failed', { error });
      return false;
    }
  }

  /**
   * Store deployment status
   */
  async setDeployment(deployment: Deployment): Promise<void> {
    if (!this._client) {
      throw new Error('DeploymentTracker not connected to Redis');
    }

    const key = this._getDeploymentKey(deployment.deploymentId);

    try {
      await this._client.setEx(
        key,
        DEFAULT_TTL,
        JSON.stringify({
          ...deployment,
          updatedAt: new Date().toISOString(),
        })
      );

      logger.debug('Deployment status updated', {
        deploymentId: deployment.deploymentId,
        status: deployment.status,
      });
    } catch (error) {
      logger.error('Failed to store deployment', {
        deploymentId: deployment.deploymentId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  async getDeployment(deploymentId: string): Promise<Deployment | null> {
    if (!this._client) {
      throw new Error('DeploymentTracker not connected to Redis');
    }

    const key = this._getDeploymentKey(deploymentId);

    try {
      const data = await this._client.get(key);

      if (!data) {
        return null;
      }

      const deployment = JSON.parse(data) as Deployment;

      // Convert date strings back to Date objects
      deployment.createdAt = new Date(deployment.createdAt);
      deployment.updatedAt = new Date(deployment.updatedAt);

      return deployment;
    } catch (error) {
      logger.error('Failed to get deployment', {
        deploymentId,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * Update deployment status
   */
  async updateStatus(
    deploymentId: string,
    status: DeploymentStatus,
    progress?: DeploymentProgress,
    error?: string
  ): Promise<void> {
    const deployment = await this.getDeployment(deploymentId);

    if (!deployment) {
      logger.warn('Attempted to update non-existent deployment', { deploymentId });
      return;
    }

    deployment.status = status;
    if (progress) {
      deployment.progress = { ...deployment.progress, ...progress };
    }
    if (error) {
      deployment.error = error;
    }

    await this.setDeployment(deployment);
  }

  /**
   * Update tools discovered count
   */
  async updateToolsDiscovered(deploymentId: string, count: number): Promise<void> {
    const deployment = await this.getDeployment(deploymentId);

    if (!deployment) {
      logger.warn('Attempted to update tools for non-existent deployment', { deploymentId });
      return;
    }

    deployment.toolsDiscovered = count;
    await this.setDeployment(deployment);
  }

  /**
   * Add custom server to registry
   */
  async addCustomServer(serverInfo: CustomServerInfo): Promise<void> {
    if (!this._client) {
      throw new Error('DeploymentTracker not connected to Redis');
    }

    try {
      await this._client.hSet(
        CUSTOM_SERVERS_KEY,
        serverInfo.name,
        JSON.stringify({
          ...serverInfo,
          deployedAt: new Date().toISOString(),
        })
      );

      logger.info('Custom server added to registry', { name: serverInfo.name });
    } catch (error) {
      logger.error('Failed to add custom server', {
        name: serverInfo.name,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * List all custom servers
   */
  async listCustomServers(tenantId?: string): Promise<CustomServerInfo[]> {
    if (!this._client) {
      throw new Error('DeploymentTracker not connected to Redis');
    }

    try {
      const servers = await this._client.hGetAll(CUSTOM_SERVERS_KEY);
      const serverList: CustomServerInfo[] = [];

      for (const [_name, data] of Object.entries(servers)) {
        const server = JSON.parse(data) as CustomServerInfo;
        server.deployedAt = new Date(server.deployedAt);

        // Filter by tenant if specified
        if (tenantId && server.tenantId !== tenantId) {
          continue;
        }

        serverList.push(server);
      }

      return serverList;
    } catch (error) {
      logger.error('Failed to list custom servers', {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Remove custom server from registry
   */
  async removeCustomServer(name: string): Promise<boolean> {
    if (!this._client) {
      throw new Error('DeploymentTracker not connected to Redis');
    }

    try {
      const result = await this._client.hDel(CUSTOM_SERVERS_KEY, name);

      if (result > 0) {
        logger.info('Custom server removed from registry', { name });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to remove custom server', {
        name,
        error: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Check if custom server exists
   */
  async hasCustomServer(name: string): Promise<boolean> {
    if (!this._client) {
      throw new Error('DeploymentTracker not connected to Redis');
    }

    try {
      return await this._client.hExists(CUSTOM_SERVERS_KEY, name);
    } catch (error) {
      logger.error('Failed to check custom server existence', {
        name,
        error: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Generate deployment key
   */
  private _getDeploymentKey(deploymentId: string): string {
    return `${DEPLOYMENT_KEY_PREFIX}${deploymentId}`;
  }
}
