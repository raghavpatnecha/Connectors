/**
 * GitHub Service for MCP Deployer
 * Handles cloning, type detection, and metadata extraction from GitHub repositories
 */

import simpleGit, { SimpleGit, GitError } from 'simple-git';
import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../../logging/logger';
import {
  GitCloneError,
  DependencyInstallError,
  InvalidMCPServerError,
  DiskQuotaError,
} from '../../errors/gateway-errors';
import {
  GitHubCloneConfig,
  CloneResult,
  MCPServerType,
  MCPMetadata,
} from './types';

const execAsync = promisify(exec);

const CLONE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const INSTALL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const DEPLOYMENT_BASE_DIR = process.env.MCP_DEPLOYMENT_DIR || '/tmp/mcp-deployments';
const MIN_DISK_SPACE_MB = 500; // 500MB minimum free space
const MAX_REPO_SIZE_MB = 1000; // 1GB maximum repository size

/**
 * GitHub service for cloning and analyzing MCP servers
 */
export class GitHubService {
  private readonly _git: SimpleGit;
  private readonly _deploymentBaseDir: string;

  constructor(deploymentBaseDir?: string) {
    this._deploymentBaseDir = deploymentBaseDir || DEPLOYMENT_BASE_DIR;
    this._git = simpleGit();
  }

  /**
   * Initialize the GitHub service
   */
  async initialize(): Promise<void> {
    // Ensure deployment directory exists
    await fs.mkdir(this._deploymentBaseDir, { recursive: true });
    logger.info('GitHubService initialized', {
      deploymentBaseDir: this._deploymentBaseDir,
    });
  }

  /**
   * Clone a GitHub repository
   */
  async cloneRepository(config: GitHubCloneConfig): Promise<CloneResult> {
    const startTime = Date.now();

    // Validate GitHub URL
    const validatedUrl = this._validateAndSanitizeUrl(config.url);

    // Check disk space before cloning
    await this._checkDiskSpace();

    // Determine target path
    const repoPath = join(this._deploymentBaseDir, config.deploymentId);

    logger.info('Cloning GitHub repository', {
      url: validatedUrl,
      branch: config.branch,
      deploymentId: config.deploymentId,
      targetPath: repoPath,
    });

    try {
      // Build clone options
      const cloneUrl = this._buildAuthenticatedUrl(validatedUrl, config.auth);
      const branch = config.branch || 'main';

      // Clone with timeout
      await this._cloneWithTimeout(cloneUrl, repoPath, branch);

      // Get commit hash and branch info
      const git = simpleGit(repoPath);
      const log = await git.log({ maxCount: 1 });
      const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);

      // Calculate repository size
      const size = await this._calculateDirectorySize(repoPath);

      // Verify size constraints
      if (size > MAX_REPO_SIZE_MB * 1024 * 1024) {
        await this._cleanupRepository(repoPath);
        throw new GitCloneError(
          `Repository size (${Math.round(size / 1024 / 1024)}MB) exceeds maximum allowed size (${MAX_REPO_SIZE_MB}MB)`,
          validatedUrl,
          'unknown'
        );
      }

      const result: CloneResult = {
        repoPath,
        commitHash: log.latest?.hash || 'unknown',
        branch: currentBranch.trim(),
        size,
      };

      const latency = Date.now() - startTime;
      logger.info('Repository cloned successfully', {
        deploymentId: config.deploymentId,
        commitHash: result.commitHash,
        branch: result.branch,
        size: Math.round(size / 1024 / 1024) + 'MB',
        latency_ms: latency,
      });

      return result;
    } catch (error) {
      // Cleanup on failure
      await this._cleanupRepository(repoPath);

      // Map error to appropriate type
      throw this._handleCloneError(error as Error | GitError, validatedUrl);
    }
  }

  /**
   * Detect MCP server type from repository
   */
  async detectMCPType(repoPath: string): Promise<MCPServerType> {
    logger.debug('Detecting MCP server type', { repoPath });

    try {
      // Check for various file patterns
      const [
        hasPackageJson,
        hasRequirementsTxt,
        hasPyprojectToml,
        hasDockerfile,
        hasYarnLock,
        hasPoetryLock,
      ] = await Promise.all([
        this._fileExists(join(repoPath, 'package.json')),
        this._fileExists(join(repoPath, 'requirements.txt')),
        this._fileExists(join(repoPath, 'pyproject.toml')),
        this._fileExists(join(repoPath, 'Dockerfile')),
        this._fileExists(join(repoPath, 'yarn.lock')),
        this._fileExists(join(repoPath, 'poetry.lock')),
      ]);

      // Docker takes precedence if Dockerfile is present
      if (hasDockerfile) {
        logger.info('Detected Docker-based MCP server', { repoPath });
        return {
          type: 'docker',
          entrypoint: 'Dockerfile',
        };
      }

      // Node.js detection
      if (hasPackageJson) {
        const packageJson = await this._readPackageJson(repoPath);
        const hasMCPSDK = this._checkForMCPSDK(packageJson);

        if (!hasMCPSDK) {
          logger.warn('package.json found but no MCP SDK detected', { repoPath });
        }

        const entrypoint = this._findNodeEntrypoint(packageJson);
        const packageManager = hasYarnLock ? 'yarn' : 'npm';

        logger.info('Detected Node.js MCP server', {
          repoPath,
          entrypoint,
          packageManager,
          hasMCPSDK,
        });

        return {
          type: 'node',
          entrypoint,
          packageManager: packageManager as 'npm' | 'yarn',
        };
      }

      // Python detection
      if (hasRequirementsTxt || hasPyprojectToml) {
        const hasFastMCP = await this._checkForFastMCP(repoPath, hasPyprojectToml);

        if (!hasFastMCP) {
          logger.warn('Python project found but no FastMCP detected', { repoPath });
        }

        const entrypoint = await this._findPythonEntrypoint(repoPath);
        const packageManager = hasPoetryLock ? 'poetry' : 'pip';

        logger.info('Detected Python MCP server', {
          repoPath,
          entrypoint,
          packageManager,
          hasFastMCP,
        });

        return {
          type: 'python',
          entrypoint,
          packageManager: packageManager as 'pip' | 'poetry',
        };
      }

      // No recognized MCP server type found
      logger.error('No MCP server type detected', { repoPath });
      throw new InvalidMCPServerError(
        'Could not detect MCP server type. Repository must contain package.json, requirements.txt, pyproject.toml, or Dockerfile',
        repoPath,
        'no_mcp_indicators'
      );
    } catch (error) {
      if (error instanceof InvalidMCPServerError) {
        throw error;
      }

      logger.error('Error detecting MCP server type', {
        repoPath,
        error: (error as Error).message,
      });

      throw new InvalidMCPServerError(
        `Failed to detect MCP server type: ${(error as Error).message}`,
        repoPath,
        'detection_error'
      );
    }
  }

  /**
   * Extract metadata from repository
   */
  async extractMetadata(repoPath: string): Promise<MCPMetadata> {
    logger.debug('Extracting repository metadata', { repoPath });

    try {
      // Try package.json first (Node.js)
      if (await this._fileExists(join(repoPath, 'package.json'))) {
        return await this._extractNodeMetadata(repoPath);
      }

      // Try pyproject.toml (Python with Poetry)
      if (await this._fileExists(join(repoPath, 'pyproject.toml'))) {
        return await this._extractPythonTomlMetadata(repoPath);
      }

      // Try requirements.txt with README fallback (Python)
      if (await this._fileExists(join(repoPath, 'requirements.txt'))) {
        return await this._extractPythonRequirementsMetadata(repoPath);
      }

      // Fallback to README parsing
      return await this._extractReadmeMetadata(repoPath);
    } catch (error) {
      logger.error('Error extracting metadata', {
        repoPath,
        error: (error as Error).message,
      });

      // Return minimal metadata as fallback
      return {
        name: repoPath.split('/').pop() || 'unknown',
        description: 'MCP server (metadata extraction failed)',
      };
    }
  }

  /**
   * Install dependencies for the repository
   */
  private async installDependencies(
    repoPath: string,
    type: MCPServerType
  ): Promise<void> {
    logger.info('Installing dependencies', {
      repoPath,
      type: type.type,
      packageManager: type.packageManager,
    });

    const startTime = Date.now();

    try {
      let command: string;

      switch (type.type) {
        case 'node':
          command = type.packageManager === 'yarn' ? 'yarn install' : 'npm install';
          break;

        case 'python':
          if (type.packageManager === 'poetry') {
            command = 'poetry install';
          } else {
            command = 'pip install -r requirements.txt';
          }
          break;

        case 'docker':
          // Docker build handled separately
          logger.debug('Skipping dependency install for Docker type');
          return;

        default:
          logger.warn('Unknown MCP type, skipping dependency install', { type });
          return;
      }

      logger.debug('Running dependency install command', { command, repoPath });

      // Execute with timeout
      const { stdout, stderr } = await execAsync(command, {
        cwd: repoPath,
        timeout: INSTALL_TIMEOUT_MS,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      const latency = Date.now() - startTime;

      logger.info('Dependencies installed successfully', {
        repoPath,
        latency_ms: latency,
        command,
      });

      if (stderr) {
        logger.debug('Dependency install stderr output', { stderr: stderr.slice(0, 1000) });
      }
    } catch (error) {
      const err = error as Error & { code?: string; killed?: boolean };

      let reason = 'unknown';
      if (err.killed) {
        reason = 'timeout';
      } else if (err.code === 'ENOENT') {
        reason = 'package_manager_not_found';
      }

      throw new DependencyInstallError(
        `Failed to install dependencies: ${err.message}`,
        type.packageManager || 'unknown',
        repoPath,
        err
      );
    }
  }

  /**
   * Cleanup repository directory
   */
  private async _cleanupRepository(repoPath: string): Promise<void> {
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
      logger.debug('Cleaned up repository', { repoPath });
    } catch (error) {
      logger.warn('Failed to cleanup repository', {
        repoPath,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Validate and sanitize GitHub URL
   */
  private _validateAndSanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);

      // Allow github.com and enterprise GitHub instances
      if (!parsed.hostname.includes('github')) {
        throw new Error('URL must be a GitHub repository');
      }

      // Prevent path traversal
      if (parsed.pathname.includes('..')) {
        throw new Error('Invalid URL: path traversal detected');
      }

      // Ensure HTTPS
      if (parsed.protocol !== 'https:') {
        parsed.protocol = 'https:';
      }

      return parsed.toString();
    } catch (error) {
      throw new GitCloneError(
        `Invalid GitHub URL: ${(error as Error).message}`,
        url,
        'unknown'
      );
    }
  }

  /**
   * Build authenticated URL if token provided
   */
  private _buildAuthenticatedUrl(
    url: string,
    auth?: { type: 'token'; token: string }
  ): string {
    if (!auth || auth.type !== 'token') {
      return url;
    }

    try {
      const parsed = new URL(url);
      // Format: https://x-access-token:TOKEN@github.com/owner/repo.git
      parsed.username = 'x-access-token';
      parsed.password = auth.token;
      return parsed.toString();
    } catch (error) {
      logger.warn('Failed to build authenticated URL, using original', {
        error: (error as Error).message,
      });
      return url;
    }
  }

  /**
   * Clone with timeout protection
   */
  private async _cloneWithTimeout(
    url: string,
    targetPath: string,
    branch: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new GitCloneError(
            `Clone operation timed out after ${CLONE_TIMEOUT_MS / 1000} seconds`,
            url,
            'timeout'
          )
        );
      }, CLONE_TIMEOUT_MS);

      this._git
        .clone(url, targetPath, ['--depth', '1', '--branch', branch, '--single-branch'])
        .then(() => {
          clearTimeout(timeout);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Check available disk space
   */
  private async _checkDiskSpace(): Promise<void> {
    try {
      const { stdout } = await execAsync(`df -m ${this._deploymentBaseDir} | tail -1 | awk '{print $4}'`);
      const availableMB = parseInt(stdout.trim(), 10);

      if (availableMB < MIN_DISK_SPACE_MB) {
        throw new DiskQuotaError(
          `Insufficient disk space. Required: ${MIN_DISK_SPACE_MB}MB, Available: ${availableMB}MB`,
          MIN_DISK_SPACE_MB * 1024 * 1024,
          availableMB * 1024 * 1024
        );
      }

      logger.debug('Disk space check passed', {
        availableMB,
        requiredMB: MIN_DISK_SPACE_MB,
      });
    } catch (error) {
      if (error instanceof DiskQuotaError) {
        throw error;
      }

      logger.warn('Failed to check disk space, continuing', {
        error: (error as Error).message,
      });
    }
  }

  /**
   * Calculate directory size
   */
  private async _calculateDirectorySize(dirPath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(`du -sb ${dirPath} | cut -f1`);
      return parseInt(stdout.trim(), 10);
    } catch (error) {
      logger.warn('Failed to calculate directory size', {
        dirPath,
        error: (error as Error).message,
      });
      return 0;
    }
  }

  /**
   * Handle clone errors
   */
  private _handleCloneError(error: Error | GitError, url: string): GitCloneError {
    const message = error.message.toLowerCase();

    if (message.includes('not found') || message.includes('repository not found')) {
      return new GitCloneError('Repository not found', url, 'not_found', error);
    }

    if (message.includes('authentication') || message.includes('permission denied')) {
      return new GitCloneError('Authentication failed', url, 'auth_failure', error);
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return new GitCloneError('Clone operation timed out', url, 'timeout', error);
    }

    if (message.includes('network') || message.includes('connection')) {
      return new GitCloneError('Network error during clone', url, 'network_error', error);
    }

    return new GitCloneError(`Clone failed: ${error.message}`, url, 'unknown', error);
  }

  /**
   * Check if file exists
   */
  private async _fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read and parse package.json
   */
  private async _readPackageJson(repoPath: string): Promise<any> {
    const packageJsonPath = join(repoPath, 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Check for MCP SDK in package.json
   */
  private _checkForMCPSDK(packageJson: any): boolean {
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    return '@modelcontextprotocol/sdk' in deps;
  }

  /**
   * Find Node.js entrypoint
   */
  private _findNodeEntrypoint(packageJson: any): string {
    // Check for main field
    if (packageJson.main) {
      return packageJson.main;
    }

    // Check for bin field
    if (packageJson.bin) {
      if (typeof packageJson.bin === 'string') {
        return packageJson.bin;
      }
      return Object.values(packageJson.bin)[0] as string;
    }

    // Default patterns
    return 'index.js';
  }

  /**
   * Check for FastMCP in Python project
   */
  private async _checkForFastMCP(
    repoPath: string,
    hasPyproject: boolean
  ): Promise<boolean> {
    if (hasPyproject) {
      const pyprojectPath = join(repoPath, 'pyproject.toml');
      const content = await fs.readFile(pyprojectPath, 'utf-8');
      return content.includes('fastmcp');
    }

    const requirementsPath = join(repoPath, 'requirements.txt');
    if (await this._fileExists(requirementsPath)) {
      const content = await fs.readFile(requirementsPath, 'utf-8');
      return content.includes('fastmcp');
    }

    return false;
  }

  /**
   * Find Python entrypoint
   */
  private async _findPythonEntrypoint(repoPath: string): Promise<string> {
    // Common entrypoint patterns
    const patterns = ['main.py', 'server.py', 'app.py', '__main__.py'];

    for (const pattern of patterns) {
      if (await this._fileExists(join(repoPath, pattern))) {
        return pattern;
      }
    }

    return 'main.py';
  }

  /**
   * Extract metadata from Node.js package.json
   */
  private async _extractNodeMetadata(repoPath: string): Promise<MCPMetadata> {
    const packageJson = await this._readPackageJson(repoPath);

    const dependencies = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {}),
    ];

    return {
      name: packageJson.name || 'unknown',
      version: packageJson.version,
      description: packageJson.description,
      author: this._formatAuthor(packageJson.author),
      license: packageJson.license,
      dependencies,
    };
  }

  /**
   * Extract metadata from Python pyproject.toml
   */
  private async _extractPythonTomlMetadata(repoPath: string): Promise<MCPMetadata> {
    const tomlPath = join(repoPath, 'pyproject.toml');
    const content = await fs.readFile(tomlPath, 'utf-8');

    // Simple TOML parsing (for basic fields)
    const metadata: MCPMetadata = {
      name: this._extractTomlField(content, 'name') || 'unknown',
      version: this._extractTomlField(content, 'version'),
      description: this._extractTomlField(content, 'description'),
      license: this._extractTomlField(content, 'license'),
    };

    return metadata;
  }

  /**
   * Extract metadata from Python requirements.txt with README fallback
   */
  private async _extractPythonRequirementsMetadata(repoPath: string): Promise<MCPMetadata> {
    const requirementsPath = join(repoPath, 'requirements.txt');
    const content = await fs.readFile(requirementsPath, 'utf-8');

    const dependencies = content
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#'))
      .map((line) => line.split('==')[0].trim());

    // Use directory name as fallback name
    const name = repoPath.split('/').pop() || 'unknown';

    // Try to get description from README
    const readmeMetadata = await this._extractReadmeMetadata(repoPath);

    return {
      name,
      description: readmeMetadata.description,
      dependencies,
    };
  }

  /**
   * Extract metadata from README.md
   */
  private async _extractReadmeMetadata(repoPath: string): Promise<MCPMetadata> {
    const readmePatterns = ['README.md', 'readme.md', 'README', 'readme.txt'];

    for (const pattern of readmePatterns) {
      const readmePath = join(repoPath, pattern);
      if (await this._fileExists(readmePath)) {
        const content = await fs.readFile(readmePath, 'utf-8');

        // Extract first heading as name
        const nameMatch = content.match(/^#\s+(.+)$/m);
        const name = nameMatch ? nameMatch[1].trim() : repoPath.split('/').pop() || 'unknown';

        // Extract first paragraph as description
        const descMatch = content.match(/\n\n([^\n]+)\n/);
        const description = descMatch ? descMatch[1].trim() : undefined;

        return { name, description };
      }
    }

    // Fallback to directory name without description
    return {
      name: repoPath.split('/').pop() || 'unknown',
      description: undefined,
    };
  }

  /**
   * Format author field
   */
  private _formatAuthor(author: any): string | undefined {
    if (typeof author === 'string') {
      return author;
    }

    if (typeof author === 'object' && author.name) {
      return author.name;
    }

    return undefined;
  }

  /**
   * Extract field from TOML content
   */
  private _extractTomlField(content: string, field: string): string | undefined {
    const regex = new RegExp(`^${field}\\s*=\\s*"([^"]+)"`, 'm');
    const match = content.match(regex);
    return match ? match[1] : undefined;
  }
}
