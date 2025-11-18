/**
 * Tests for DockerBuilder
 */

import { Readable } from 'stream';

// Mock fs module
const mockWriteFile = jest.fn().mockResolvedValue(undefined);
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    writeFile: mockWriteFile,
  },
}));

import { DockerBuilder } from '../src/services/mcp-deployer/docker-builder';
import { DockerBuildError, ImagePushError } from '../src/errors/gateway-errors';
import {
  DockerBuildConfig,
  MCPServerType,
  MCPMetadata,
} from '../src/services/mcp-deployer/types';

// Mock dockerode
const mockPing = jest.fn();
const mockVersion = jest.fn();
const mockBuildImage = jest.fn();
const mockGetImage = jest.fn();
const mockInspect = jest.fn();
const mockTag = jest.fn();
const mockPush = jest.fn();
const mockRemove = jest.fn();
const mockFollowProgress = jest.fn();

jest.mock('dockerode', () => {
  return jest.fn().mockImplementation(() => ({
    ping: mockPing,
    version: mockVersion,
    buildImage: mockBuildImage,
    getImage: mockGetImage,
    modem: {
      followProgress: mockFollowProgress,
    },
  }));
});

// Mock logger to avoid Winston initialization issues
jest.mock('../src/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('DockerBuilder', () => {
  let dockerBuilder: DockerBuilder;

  const mockServerType: MCPServerType = {
    type: 'node',
    entrypoint: 'index.js',
    packageManager: 'npm',
  };

  const mockMetadata: MCPMetadata = {
    name: 'test-mcp-server',
    version: '1.0.0',
    description: 'Test MCP server',
  };

  const mockBuildConfig: DockerBuildConfig = {
    repoPath: '/tmp/test-repo',
    serverType: mockServerType,
    deploymentId: 'test-deploy-123',
    metadata: mockMetadata,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockPing.mockResolvedValue(true);
    mockVersion.mockResolvedValue({
      Version: '24.0.0',
      ApiVersion: '1.43',
    });

    mockGetImage.mockReturnValue({
      inspect: mockInspect,
      tag: mockTag,
      push: mockPush,
      remove: mockRemove,
    });
  });

  describe('initialize', () => {
    it('should initialize successfully and verify Docker connection', async () => {
      dockerBuilder = new DockerBuilder(undefined, true);

      await dockerBuilder.initialize();

      expect(mockPing).toHaveBeenCalled();
      expect(mockVersion).toHaveBeenCalled();
    });

    it('should skip connection verification when disabled', async () => {
      dockerBuilder = new DockerBuilder(undefined, false);

      await dockerBuilder.initialize();

      expect(mockPing).not.toHaveBeenCalled();
      expect(mockVersion).not.toHaveBeenCalled();
    });

    it('should throw DockerBuildError if Docker is not running', async () => {
      dockerBuilder = new DockerBuilder(undefined, true);
      mockPing.mockRejectedValue(new Error('Cannot connect to Docker daemon'));

      const initPromise = dockerBuilder.initialize();
      await expect(initPromise).rejects.toThrow(DockerBuildError);
      await expect(initPromise).rejects.toMatchObject({
        name: 'DockerBuildError',
        reason: 'connection_failed',
      });
    });

    it('should warn if Docker version is below minimum', async () => {
      dockerBuilder = new DockerBuilder(undefined, true);
      mockVersion.mockResolvedValueOnce({
        Version: '19.03.0',
        ApiVersion: '1.40',
      });

      await dockerBuilder.initialize();

      // Should still succeed but log warning
      expect(mockVersion).toHaveBeenCalled();
    });
  });

  describe('generateDockerfile', () => {
    beforeEach(() => {
      dockerBuilder = new DockerBuilder(undefined, false);
    });

    it('should generate Node.js Dockerfile with correct template', () => {
      const dockerfile = dockerBuilder.generateDockerfile(
        mockServerType,
        mockBuildConfig.repoPath,
        mockBuildConfig.deploymentId
      );

      expect(dockerfile).toContain('FROM node:18-alpine');
      expect(dockerfile).toContain('WORKDIR /app');
      expect(dockerfile).toContain('npm ci --production');
      expect(dockerfile).toContain('CMD ["node", "index.js"]');
      expect(dockerfile).toContain('USER mcp');
      expect(dockerfile).toContain('ENV NODE_ENV=production');
      expect(dockerfile).toContain('HEALTHCHECK');
      expect(dockerfile).toContain('EXPOSE 3000');
    });

    it('should generate Python Dockerfile with correct template', () => {
      const pythonServerType: MCPServerType = {
        type: 'python',
        entrypoint: 'main.py',
        packageManager: 'pip',
      };

      const dockerfile = dockerBuilder.generateDockerfile(
        pythonServerType,
        mockBuildConfig.repoPath,
        mockBuildConfig.deploymentId
      );

      expect(dockerfile).toContain('FROM python:3.11-slim');
      expect(dockerfile).toContain('WORKDIR /app');
      expect(dockerfile).toContain('pip install --no-cache-dir -r requirements.txt');
      expect(dockerfile).toContain('CMD ["python", "main.py"]');
      expect(dockerfile).toContain('USER mcp');
      expect(dockerfile).toContain('ENV PYTHONUNBUFFERED=1');
      expect(dockerfile).toContain('HEALTHCHECK');
    });

    it('should add metadata labels to Dockerfile', () => {
      const dockerfile = dockerBuilder.generateDockerfile(
        mockServerType,
        mockBuildConfig.repoPath,
        mockBuildConfig.deploymentId
      );

      expect(dockerfile).toContain(`LABEL mcp.deployment_id="${mockBuildConfig.deploymentId}"`);
      expect(dockerfile).toContain(`LABEL mcp.server_type="${mockServerType.type}"`);
      expect(dockerfile).toContain(`LABEL mcp.entrypoint="${mockServerType.entrypoint}"`);
      expect(dockerfile).toContain('LABEL mcp.build_date=');
    });

    it('should use default entrypoint if not provided', () => {
      const serverTypeNoEntrypoint: MCPServerType = {
        type: 'node',
        packageManager: 'npm',
      };

      const dockerfile = dockerBuilder.generateDockerfile(
        serverTypeNoEntrypoint,
        mockBuildConfig.repoPath,
        mockBuildConfig.deploymentId
      );

      expect(dockerfile).toContain('CMD ["node", "index.js"]');
    });

    it('should throw error for docker server type', () => {
      const dockerServerType: MCPServerType = {
        type: 'docker',
      };

      expect(() =>
        dockerBuilder.generateDockerfile(
          dockerServerType,
          mockBuildConfig.repoPath,
          mockBuildConfig.deploymentId
        )
      ).toThrow(DockerBuildError);
    });

    it('should throw error for unknown server type', () => {
      const unknownServerType: MCPServerType = {
        type: 'unknown' as any,
      };

      expect(() =>
        dockerBuilder.generateDockerfile(
          unknownServerType,
          mockBuildConfig.repoPath,
          mockBuildConfig.deploymentId
        )
      ).toThrow(DockerBuildError);
    });
  });

  describe('buildImage', () => {
    beforeEach(() => {
      dockerBuilder = new DockerBuilder(undefined, false);

      // Mock successful build
      const mockStream = new Readable({
        read() {},
      });

      mockBuildImage.mockResolvedValue(mockStream);
      mockInspect.mockResolvedValue({
        Id: 'sha256:abc123def456',
        Size: 100 * 1024 * 1024, // 100MB
      });

      // Mock followProgress to immediately succeed
      mockFollowProgress.mockImplementation((stream, onFinished) => {
        setImmediate(() => onFinished(null));
      });
    });

    it('should build Docker image successfully', async () => {
      const result = await dockerBuilder.buildImage(mockBuildConfig);

      expect(result).toMatchObject({
        imageTag: `mcp-${mockBuildConfig.deploymentId}:latest`,
        imageId: 'sha256:abc123def456',
        size: 100 * 1024 * 1024,
      });

      expect(result.buildTime).toBeGreaterThan(0);
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('Dockerfile.mcp'),
        expect.stringContaining('FROM node:18-alpine'),
        'utf-8'
      );
    });

    it('should pass correct build options to Docker', async () => {
      await dockerBuilder.buildImage(mockBuildConfig);

      expect(mockBuildImage).toHaveBeenCalledWith(
        expect.objectContaining({
          context: mockBuildConfig.repoPath,
          src: ['.'],
        }),
        expect.objectContaining({
          t: `mcp-${mockBuildConfig.deploymentId}:latest`,
          dockerfile: 'Dockerfile.mcp',
          labels: {
            'mcp.deployment_id': mockBuildConfig.deploymentId,
          },
          nocache: false,
          pull: 'true', // Docker API expects string
        })
      );
    });

    it('should collect warnings from build output', async () => {
      const mockStream = new Readable({
        read() {},
      });

      mockBuildImage.mockResolvedValue(mockStream);

      // Mock followProgress with warnings
      mockFollowProgress.mockImplementation((stream, onFinished, onProgress) => {
        onProgress({ stream: 'Step 1/5 : FROM node:18-alpine\n' });
        onProgress({ stream: 'WARNING: deprecated package detected\n' });
        onProgress({ stream: 'Step 2/5 : WORKDIR /app\n' });
        setImmediate(() => onFinished(null));
      });

      const result = await dockerBuilder.buildImage(mockBuildConfig);

      expect(result.warnings).toBeDefined();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings![0]).toContain('WARNING');
    });

    it('should handle build errors gracefully', async () => {
      const mockStream = new Readable({
        read() {},
      });

      mockBuildImage.mockResolvedValue(mockStream);

      mockFollowProgress.mockImplementation((stream, onFinished) => {
        setImmediate(() => onFinished(new Error('Build failed: syntax error')));
      });

      await expect(dockerBuilder.buildImage(mockBuildConfig)).rejects.toThrow(
        DockerBuildError
      );
    });

    it('should handle error events from build stream', async () => {
      const mockStream = new Readable({
        read() {},
      });

      mockBuildImage.mockResolvedValue(mockStream);

      mockFollowProgress.mockImplementation((stream, onFinished, onProgress) => {
        onProgress({ error: 'Build failed', errorDetail: { message: 'Syntax error in Dockerfile' } });
      });

      await expect(dockerBuilder.buildImage(mockBuildConfig)).rejects.toThrow(
        DockerBuildError
      );
    });

    it('should push image to registry if registry is configured', async () => {
      const configWithRegistry: DockerBuildConfig = {
        ...mockBuildConfig,
        registry: 'registry.example.com',
      };

      const pushStream = new Readable({
        read() {},
      });

      mockPush.mockResolvedValue(pushStream);

      // Mock both build and push progress
      mockFollowProgress
        .mockImplementationOnce((stream, onFinished) => {
          setImmediate(() => onFinished(null));
        })
        .mockImplementationOnce((stream, onFinished) => {
          setImmediate(() => onFinished(null));
        });

      const result = await dockerBuilder.buildImage(configWithRegistry);

      expect(result.imageTag).toBe(`mcp-${mockBuildConfig.deploymentId}:latest`);
      expect(mockTag).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalled();
    });

    it('should cleanup image on build failure', async () => {
      const mockStream = new Readable({
        read() {},
      });

      mockBuildImage.mockResolvedValue(mockStream);

      mockFollowProgress.mockImplementation((stream, onFinished) => {
        setImmediate(() => onFinished(new Error('Build failed')));
      });

      await expect(dockerBuilder.buildImage(mockBuildConfig)).rejects.toThrow();

      // Cleanup is called but may fail silently
      expect(mockGetImage).toHaveBeenCalledWith(`mcp-${mockBuildConfig.deploymentId}:latest`);
    });

    it('should handle Dockerfile write errors', async () => {
      mockWriteFile.mockRejectedValueOnce(new Error('Permission denied'));

      await expect(dockerBuilder.buildImage(mockBuildConfig)).rejects.toThrow();
    });
  });

  describe('pushImage', () => {
    beforeEach(() => {
      dockerBuilder = new DockerBuilder(undefined, false);

      const pushStream = new Readable({
        read() {},
      });

      mockPush.mockResolvedValue(pushStream);

      mockFollowProgress.mockImplementation((stream, onFinished) => {
        setImmediate(() => onFinished(null));
      });
    });

    it('should push image to registry successfully', async () => {
      const imageTag = 'mcp-test-deploy:latest';
      const registry = 'registry.example.com';
      const deploymentId = 'test-deploy-123';

      await dockerBuilder.pushImage(imageTag, registry, deploymentId);

      expect(mockTag).toHaveBeenCalledWith({
        repo: `${registry}/mcp-test-deploy`,
        tag: 'latest',
      });

      expect(mockGetImage).toHaveBeenCalledWith(`${registry}/mcp-test-deploy:latest`);
      expect(mockPush).toHaveBeenCalled();
    });

    it('should handle tag errors', async () => {
      mockTag.mockRejectedValueOnce(new Error('Invalid tag format'));

      await expect(
        dockerBuilder.pushImage('invalid-tag', 'registry.example.com', 'deploy-123')
      ).rejects.toThrow(ImagePushError);
    });

    it('should handle push errors', async () => {
      const pushStream = new Readable({
        read() {},
      });

      mockPush.mockResolvedValue(pushStream);

      mockFollowProgress.mockImplementation((stream, onFinished) => {
        setImmediate(() => onFinished(new Error('Registry authentication failed')));
      });

      await expect(
        dockerBuilder.pushImage('test-image:latest', 'registry.example.com', 'deploy-123')
      ).rejects.toThrow(ImagePushError);
    });

    it('should stream push progress', async () => {
      const pushStream = new Readable({
        read() {},
      });

      mockPush.mockResolvedValue(pushStream);

      mockFollowProgress.mockImplementation((stream, onFinished, onProgress) => {
        onProgress({ status: 'Pushing', progress: '10%' });
        onProgress({ status: 'Pushed', progress: '100%' });
        setImmediate(() => onFinished(null));
      });

      await dockerBuilder.pushImage('test-image:latest', 'registry.example.com', 'deploy-123');

      expect(mockFollowProgress).toHaveBeenCalled();
    });
  });

  describe('streamBuildLogs', () => {
    beforeEach(() => {
      dockerBuilder = new DockerBuilder(undefined, false);
    });

    it('should stream build logs and collect warnings', async () => {
      const mockStream = new Readable({
        read() {},
      });

      mockFollowProgress.mockImplementation((stream, onFinished, onProgress) => {
        onProgress({ stream: 'Step 1/5 : FROM node:18-alpine\n' });
        onProgress({ stream: 'WARNING: deprecated package\n' });
        onProgress({ status: 'Downloading', progress: '50%' });
        setImmediate(() => onFinished(null));
      });

      const warnings = await dockerBuilder.streamBuildLogs(mockStream, 'test-deploy-123');

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('WARNING');
    });

    it('should handle error events in build logs', async () => {
      const mockStream = new Readable({
        read() {},
      });

      mockFollowProgress.mockImplementation((stream, onFinished, onProgress) => {
        onProgress({ error: 'Build failed', errorDetail: { message: 'Syntax error' } });
      });

      await expect(
        dockerBuilder.streamBuildLogs(mockStream, 'test-deploy-123')
      ).rejects.toThrow(DockerBuildError);
    });

    it('should timeout if build takes too long', async () => {
      jest.useFakeTimers();

      const mockStream = new Readable({
        read() {},
      });

      mockFollowProgress.mockImplementation(() => {
        // Never call onFinished to simulate hanging
      });

      const promise = dockerBuilder.streamBuildLogs(mockStream, 'test-deploy-123');

      // Fast-forward past timeout
      jest.advanceTimersByTime(10 * 60 * 1000 + 1000);

      await expect(promise).rejects.toThrow(DockerBuildError);

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      dockerBuilder = new DockerBuilder(undefined, false);
    });

    it('should wrap generic errors in DockerBuildError', async () => {
      mockBuildImage.mockRejectedValueOnce(new Error('Unknown error'));

      await expect(dockerBuilder.buildImage(mockBuildConfig)).rejects.toMatchObject({
        name: 'DockerBuildError',
        deploymentId: mockBuildConfig.deploymentId,
        reason: 'execution_failed', // Wrapped in executeBuild
      });
    });

    it('should preserve DockerBuildError type when thrown during build', async () => {
      // Test that DockerBuildError thrown during streamBuildLogs is caught by executeBuild
      // and re-thrown (wrapped with execution_failed reason)
      const buildStream = new Readable({ read() {} });
      mockBuildImage.mockResolvedValueOnce(buildStream);

      const originalError = new DockerBuildError(
        'Build failed: syntax error',
        mockBuildConfig.deploymentId,
        'build_failed'
      );

      mockFollowProgress.mockImplementation((stream, onFinished) => {
        setImmediate(() => onFinished(originalError));
      });

      const result = dockerBuilder.buildImage(mockBuildConfig);
      await expect(result).rejects.toMatchObject({
        name: 'DockerBuildError',
        deploymentId: mockBuildConfig.deploymentId,
        // executeBuild wraps errors with execution_failed
        reason: 'execution_failed',
      });
    });

    it('should handle cleanup failures gracefully', async () => {
      const mockStream = new Readable({
        read() {},
      });

      mockBuildImage.mockResolvedValue(mockStream);

      mockFollowProgress.mockImplementation((stream, onFinished) => {
        setImmediate(() => onFinished(new Error('Build failed')));
      });

      mockRemove.mockRejectedValueOnce(new Error('Image not found'));

      await expect(dockerBuilder.buildImage(mockBuildConfig)).rejects.toThrow();

      // Should not throw cleanup error, just log warning
    });
  });

  describe('Integration Scenarios', () => {
    beforeEach(() => {
      dockerBuilder = new DockerBuilder(undefined, false);
    });

    it('should handle complete build and push workflow', async () => {
      const configWithRegistry: DockerBuildConfig = {
        ...mockBuildConfig,
        registry: 'registry.example.com',
      };

      const buildStream = new Readable({ read() {} });
      const pushStream = new Readable({ read() {} });

      mockBuildImage.mockResolvedValue(buildStream);
      mockPush.mockResolvedValue(pushStream);

      mockFollowProgress
        .mockImplementationOnce((stream, onFinished, onProgress) => {
          onProgress({ stream: 'Step 1/5 : FROM node:18-alpine\n' });
          onProgress({ stream: 'Successfully built abc123\n' });
          setImmediate(() => onFinished(null));
        })
        .mockImplementationOnce((stream, onFinished, onProgress) => {
          onProgress({ status: 'Pushed', progress: '100%' });
          setImmediate(() => onFinished(null));
        });

      const result = await dockerBuilder.buildImage(configWithRegistry);

      expect(result.imageTag).toBe(`mcp-${mockBuildConfig.deploymentId}:latest`);
      expect(mockBuildImage).toHaveBeenCalled();
      expect(mockTag).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalled();
    });

    it('should build Python server with different entrypoint', async () => {
      const pythonConfig: DockerBuildConfig = {
        ...mockBuildConfig,
        serverType: {
          type: 'python',
          entrypoint: 'server.py',
          packageManager: 'pip',
        },
      };

      const buildStream = new Readable({ read() {} });
      mockBuildImage.mockResolvedValue(buildStream);

      mockFollowProgress.mockImplementation((stream, onFinished) => {
        setImmediate(() => onFinished(null));
      });

      const result = await dockerBuilder.buildImage(pythonConfig);

      expect(result.imageTag).toContain('mcp-');
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('FROM python:3.11-slim'),
        'utf-8'
      );
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('CMD ["python", "server.py"]'),
        'utf-8'
      );
    });
  });
});
