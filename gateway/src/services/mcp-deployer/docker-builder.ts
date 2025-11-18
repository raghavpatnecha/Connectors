/**
 * Docker Builder for MCP Deployer
 * Builds Docker images from MCP server repositories and pushes to registry
 */

import Docker from 'dockerode';
import { promises as fs } from 'fs';
import { join } from 'path';
import { logger } from '../../logging/logger';
import { DockerBuildError, ImagePushError } from '../../errors/gateway-errors';
import {
  DockerBuildConfig,
  BuildResult,
  BuildOutput,
  MCPServerType,
} from './types';

const BUILD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const PUSH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const DOCKER_MIN_VERSION = '20.10';

/**
 * Dockerfile template for Node.js MCP servers
 */
const NODE_DOCKERFILE_TEMPLATE = `FROM node:18-alpine

# Set working directory
WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 -S mcp && adduser -S mcp -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production && npm cache clean --force

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Set environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "{{entrypoint}}"]
`;

/**
 * Dockerfile template for Python MCP servers
 */
const PYTHON_DOCKERFILE_TEMPLATE = `FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Add non-root user
RUN groupadd -g 1001 mcp && useradd -r -u 1001 -g mcp mcp

# Copy requirements file
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R mcp:mcp /app

# Switch to non-root user
USER mcp

# Set environment
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3000/health').getcode()" || exit 1

# Expose port
EXPOSE 3000

# Start server
CMD ["python", "{{entrypoint}}"]
`;

/**
 * Docker build progress event
 */
interface BuildProgressEvent {
  stream?: string;
  status?: string;
  progress?: string;
  error?: string;
  errorDetail?: {
    message: string;
  };
}

/**
 * Docker Builder Service
 */
export class DockerBuilder {
  private readonly _docker: Docker;
  private readonly _verifyConnection: boolean;

  constructor(docker?: Docker, verifyConnection: boolean = true) {
    this._docker = docker || new Docker({
      socketPath: process.env.DOCKER_HOST || '/var/run/docker.sock',
    });
    this._verifyConnection = verifyConnection;
  }

  /**
   * Initialize Docker builder and verify connection
   */
  async initialize(): Promise<void> {
    if (!this._verifyConnection) {
      logger.info('DockerBuilder initialized (skipping connection verification)');
      return;
    }

    try {
      // Verify Docker is running
      await this._docker.ping();

      // Check Docker version
      const version = await this._docker.version();
      const versionString = version.Version || '0.0.0';

      logger.info('DockerBuilder initialized', {
        version: versionString,
        apiVersion: version.ApiVersion,
      });

      // Verify minimum version
      if (!this._isVersionSupported(versionString)) {
        logger.warn('Docker version may not be fully supported', {
          current: versionString,
          minimum: DOCKER_MIN_VERSION,
        });
      }
    } catch (error) {
      throw new DockerBuildError(
        `Failed to connect to Docker daemon: ${(error as Error).message}. ` +
        'Ensure Docker is running and accessible.',
        'unknown',
        'connection_failed',
        error as Error
      );
    }
  }

  /**
   * Build Docker image from MCP server repository
   */
  async buildImage(config: DockerBuildConfig): Promise<BuildResult> {
    const startTime = Date.now();
    const imageTag = `mcp-${config.deploymentId}:latest`;

    logger.info('Building Docker image', {
      deploymentId: config.deploymentId,
      serverType: config.serverType.type,
      repoPath: config.repoPath,
      imageTag,
    });

    try {
      // Generate Dockerfile
      const dockerfileContent = this.generateDockerfile(
        config.serverType,
        config.repoPath,
        config.deploymentId
      );

      // Write Dockerfile to repository
      const dockerfilePath = join(config.repoPath, 'Dockerfile.mcp');
      await fs.writeFile(dockerfilePath, dockerfileContent, 'utf-8');

      logger.debug('Dockerfile generated', {
        deploymentId: config.deploymentId,
        path: dockerfilePath,
      });

      // Execute Docker build
      const buildOutput = await this.executeBuild(
        config.repoPath,
        imageTag,
        config.deploymentId,
        dockerfilePath
      );

      // Build success result
      const buildTime = Date.now() - startTime;
      const result: BuildResult = {
        imageTag,
        imageId: buildOutput.imageId,
        size: buildOutput.size,
        buildTime,
        warnings: buildOutput.warnings.length > 0 ? buildOutput.warnings : undefined,
      };

      logger.info('Docker image built successfully', {
        deploymentId: config.deploymentId,
        imageTag: result.imageTag,
        imageId: result.imageId.slice(0, 12),
        size: Math.round(result.size / 1024 / 1024) + 'MB',
        buildTime_ms: result.buildTime,
        warnings: result.warnings?.length || 0,
      });

      // Push to registry if configured
      if (config.registry) {
        await this.pushImage(imageTag, config.registry, config.deploymentId);
      }

      return result;
    } catch (error) {
      logger.error('Docker build failed', {
        deploymentId: config.deploymentId,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      // Cleanup on failure
      await this._cleanupImage(imageTag);

      // Re-throw DockerBuildError without wrapping
      if (error instanceof DockerBuildError) {
        throw error;
      }

      // Re-throw ImagePushError without wrapping
      if (error instanceof ImagePushError) {
        throw error;
      }

      throw new DockerBuildError(
        `Docker build failed: ${(error as Error).message}`,
        config.deploymentId,
        'build_failed',
        error as Error
      );
    }
  }

  /**
   * Push Docker image to registry
   */
  async pushImage(
    imageTag: string,
    registry: string,
    deploymentId: string
  ): Promise<void> {
    logger.info('Pushing Docker image to registry', {
      deploymentId,
      imageTag,
      registry,
    });

    const startTime = Date.now();

    try {
      // Extract image name from tag
      const imageName = imageTag.split(':')[0];
      const version = imageTag.split(':')[1] || 'latest';

      // Build registry tag
      const registryTag = `${registry}/${imageName}:${version}`;

      // Tag image for registry
      const image = this._docker.getImage(imageTag);
      await image.tag({
        repo: `${registry}/${imageName}`,
        tag: version,
      });

      logger.debug('Image tagged for registry', {
        deploymentId,
        originalTag: imageTag,
        registryTag,
      });

      // Push to registry
      const registryImage = this._docker.getImage(registryTag);
      const stream = await registryImage.push({
        // Auth config would go here if needed
      });

      // Stream push progress
      await this._streamPushLogs(stream, deploymentId);

      const pushTime = Date.now() - startTime;

      logger.info('Image pushed to registry successfully', {
        deploymentId,
        registryTag,
        pushTime_ms: pushTime,
      });
    } catch (error) {
      throw new ImagePushError(
        `Failed to push image to registry: ${(error as Error).message}`,
        imageTag,
        registry,
        error as Error
      );
    }
  }

  /**
   * Generate Dockerfile based on server type
   */
  generateDockerfile(
    serverType: MCPServerType,
    repoPath: string,
    deploymentId: string
  ): string {
    logger.debug('Generating Dockerfile', {
      deploymentId,
      type: serverType.type,
      entrypoint: serverType.entrypoint,
    });

    let template: string;

    switch (serverType.type) {
      case 'node':
        template = NODE_DOCKERFILE_TEMPLATE;
        break;

      case 'python':
        template = PYTHON_DOCKERFILE_TEMPLATE;
        break;

      case 'docker':
        // If a Dockerfile already exists, we don't need to generate one
        throw new DockerBuildError(
          'Server type is already Docker-based, no Dockerfile generation needed',
          deploymentId,
          'invalid_type'
        );

      default:
        throw new DockerBuildError(
          `Unsupported server type for Dockerfile generation: ${serverType.type}`,
          deploymentId,
          'unsupported_type'
        );
    }

    // Replace entrypoint placeholder
    const entrypoint = serverType.entrypoint || this._getDefaultEntrypoint(serverType.type);
    let dockerfile = template.replace(/\{\{entrypoint\}\}/g, entrypoint);

    // Add metadata labels
    const labels = [
      `LABEL mcp.deployment_id="${deploymentId}"`,
      `LABEL mcp.server_type="${serverType.type}"`,
      `LABEL mcp.entrypoint="${entrypoint}"`,
      `LABEL mcp.build_date="${new Date().toISOString()}"`,
    ];

    // Insert labels before CMD
    dockerfile = dockerfile.replace(
      /# Start server/,
      labels.join('\n') + '\n\n# Start server'
    );

    return dockerfile;
  }

  /**
   * Execute Docker build
   */
  private async executeBuild(
    repoPath: string,
    imageTag: string,
    deploymentId: string,
    _dockerfilePath: string
  ): Promise<BuildOutput> {
    logger.debug('Executing Docker build', {
      deploymentId,
      repoPath,
      imageTag,
      dockerfile: _dockerfilePath,
    });

    try {
      // Create build stream
      const stream = await this._docker.buildImage(
        {
          context: repoPath,
          src: ['.'], // Build entire directory context
        },
        {
          t: imageTag,
          dockerfile: 'Dockerfile.mcp',
          buildargs: {},
          labels: {
            'mcp.deployment_id': deploymentId,
          },
          nocache: false,
          pull: 'true', // Pull base image if needed - must be string
        }
      );

      // Stream build logs and collect warnings
      const warnings = await this.streamBuildLogs(stream, deploymentId);

      // Get image info
      const image = this._docker.getImage(imageTag);
      const imageInfo = await image.inspect();

      return {
        imageId: imageInfo.Id,
        size: imageInfo.Size,
        warnings,
      };
    } catch (error) {
      throw new DockerBuildError(
        `Docker build execution failed: ${(error as Error).message}`,
        deploymentId,
        'execution_failed',
        error as Error
      );
    }
  }

  /**
   * Stream Docker build logs
   */
  async streamBuildLogs(
    stream: any,
    deploymentId: string
  ): Promise<string[]> {
    const warnings: string[] = [];

    return new Promise((resolve, reject) => {
      const onFinished = (err: Error | null) => {
        if (err) {
          reject(
            new DockerBuildError(
              `Build failed: ${err.message}`,
              deploymentId,
              'build_failed',
              err
            )
          );
        } else {
          resolve(warnings);
        }
      };

      const onProgress = (event: BuildProgressEvent) => {
        try {
          // Handle error events
          if (event.error) {
            const errorMsg = event.errorDetail?.message || event.error;
            logger.error('Docker build error', {
              deploymentId,
              error: errorMsg,
            });
            reject(
              new DockerBuildError(
                `Build failed: ${errorMsg}`,
                deploymentId,
                'build_failed'
              )
            );
            return;
          }

          // Handle stream output (build steps)
          if (event.stream) {
            const line = event.stream.trim();
            if (line) {
              logger.debug('Docker build progress', {
                deploymentId,
                output: line,
              });

              // Detect warnings
              if (line.toLowerCase().includes('warning')) {
                warnings.push(line);
              }
            }
          }

          // Handle status updates
          if (event.status) {
            logger.debug('Docker build status', {
              deploymentId,
              status: event.status,
              progress: event.progress,
            });
          }
        } catch (parseError) {
          logger.warn('Error parsing build event', {
            deploymentId,
            error: (parseError as Error).message,
          });
        }
      };

      this._docker.modem.followProgress(stream, onFinished, onProgress);

      // Add timeout
      const timeout = setTimeout(() => {
        reject(
          new DockerBuildError(
            `Build timeout after ${BUILD_TIMEOUT_MS / 1000} seconds`,
            deploymentId,
            'timeout'
          )
        );
      }, BUILD_TIMEOUT_MS);

      // Clear timeout on finish
      stream.on('end', () => clearTimeout(timeout));
    });
  }

  /**
   * Stream Docker push logs
   */
  private async _streamPushLogs(
    stream: any,
    deploymentId: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const onFinished = (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      };

      const onProgress = (event: any) => {
        if (event.error) {
          logger.error('Docker push error', {
            deploymentId,
            error: event.error,
          });
          return;
        }

        if (event.status) {
          logger.debug('Docker push progress', {
            deploymentId,
            status: event.status,
            progress: event.progress,
          });
        }
      };

      this._docker.modem.followProgress(stream, onFinished, onProgress);

      // Add timeout
      const timeout = setTimeout(() => {
        reject(new Error(`Push timeout after ${PUSH_TIMEOUT_MS / 1000} seconds`));
      }, PUSH_TIMEOUT_MS);

      stream.on('end', () => clearTimeout(timeout));
    });
  }

  /**
   * Cleanup Docker image
   */
  private async _cleanupImage(imageTag: string): Promise<void> {
    try {
      const image = this._docker.getImage(imageTag);
      await image.remove({ force: true });
      logger.debug('Cleaned up Docker image', { imageTag });
    } catch (error) {
      logger.warn('Failed to cleanup Docker image', {
        imageTag,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Check if Docker version is supported
   */
  private _isVersionSupported(version: string): boolean {
    try {
      const [major, minor] = version.split('.').map((v) => parseInt(v, 10));
      const [minMajor, minMinor] = DOCKER_MIN_VERSION.split('.').map((v) => parseInt(v, 10));

      return major > minMajor || (major === minMajor && minor >= minMinor);
    } catch (error) {
      logger.warn('Failed to parse Docker version', { version });
      return true; // Assume supported if we can't parse
    }
  }

  /**
   * Get default entrypoint for server type
   */
  private _getDefaultEntrypoint(type: 'node' | 'python'): string {
    switch (type) {
      case 'node':
        return 'index.js';
      case 'python':
        return 'main.py';
      default:
        return 'index.js';
    }
  }
}
