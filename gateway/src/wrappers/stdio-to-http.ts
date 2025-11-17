/**
 * STDIO-to-HTTP Wrapper for MCP Servers
 *
 * Wraps MCP servers that use stdio transport with JSON-RPC 2.0 protocol.
 * Provides HTTP interface for integration with the gateway.
 *
 * Features:
 * - Process lifecycle management (spawn, monitor, restart)
 * - JSON-RPC 2.0 protocol handling
 * - Request/response matching
 * - Auto-restart on crash (with backoff)
 * - Heartbeat monitoring
 * - Tool discovery and caching
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { logger } from '../logging/logger';
import { Tool } from '../types';
import {
  STDIOConfig,
  JSONRPCRequest,
  JSONRPCResponse,
  ProcessStatus,
  PendingRequest,
  MCPToolsListResponse,
  MCPToolDefinition,
} from './types';
import {
  ProcessCrashedError,
  JSONRPCProtocolError,
  TimeoutError,
  InvalidResponseError,
  MaxRestartsExceededError,
} from '../errors/stdio-errors';

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RESTARTS = 3;
const DEFAULT_HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RESTART_BACKOFF_MS = 1000; // 1 second between restarts

/**
 * STDIO wrapper for MCP servers
 */
export class STDIOWrapper extends EventEmitter {
  private readonly _config: Required<STDIOConfig>;
  private _process: (ChildProcess & { pid?: number }) | null = null;
  private _requestIdCounter = 0;
  private _pendingRequests = new Map<number, PendingRequest>();
  private _buffer = '';
  private _startTime: Date | null = null;
  private _requestCount = 0;
  private _errorCount = 0;
  private _restartCount = 0;
  private _lastRestart: Date | null = null;
  private _heartbeatTimer: NodeJS.Timeout | null = null;
  private _lastHeartbeat: Date | null = null;
  private _toolsCache: Tool[] | null = null;
  private _stopping = false;

  constructor(config: STDIOConfig) {
    super();

    // Set defaults
    this._config = {
      command: config.command,
      args: config.args || [],
      env: config.env || {},
      cwd: config.cwd || process.cwd(),
      timeout: config.timeout || DEFAULT_TIMEOUT,
      maxRestarts: config.maxRestarts ?? DEFAULT_MAX_RESTARTS,
      heartbeatInterval: config.heartbeatInterval || DEFAULT_HEARTBEAT_INTERVAL,
    };

    this._validateConfig();
  }

  /**
   * Start the STDIO process
   */
  async start(): Promise<void> {
    if (this._process) {
      logger.warn('STDIO process already running', { command: this._config.command });
      return;
    }

    this._stopping = false;
    await this._startProcess();
    this._startHeartbeat();

    logger.info('STDIO wrapper started', {
      command: this._config.command,
      args: this._config.args,
      pid: (this._process as any)?.pid,
    });
  }

  /**
   * Stop the STDIO process
   */
  async stop(): Promise<void> {
    this._stopping = true;
    this._stopHeartbeat();

    if (this._process) {
      // Reject all pending requests
      for (const [id, pending] of this._pendingRequests.entries()) {
        clearTimeout(pending.timeoutHandle);
        pending.reject(new Error('Process stopped'));
        this._pendingRequests.delete(id);
      }

      // Kill process
      this._process.kill('SIGTERM');

      // Wait for process to exit (with timeout)
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (this._process) {
            this._process.kill('SIGKILL');
          }
          resolve();
        }, 5000);

        if (this._process) {
          this._process.once('exit', () => {
            clearTimeout(timeout);
            resolve();
          });
        } else {
          clearTimeout(timeout);
          resolve();
        }
      });

      this._process = null;
    }

    this._toolsCache = null;

    logger.info('STDIO wrapper stopped', { command: this._config.command });
  }

  /**
   * Call a method via JSON-RPC
   */
  async call(method: string, params?: unknown): Promise<unknown> {
    if (!this._process || !this._process.stdin) {
      throw new ProcessCrashedError('Process is not running');
    }

    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: ++this._requestIdCounter,
      method,
      params,
    };

    return await this._sendRequest(request);
  }

  /**
   * List all available tools
   */
  async listTools(): Promise<Tool[]> {
    // Return cached tools if available
    if (this._toolsCache) {
      logger.debug('Returning cached tools', { count: this._toolsCache.length });
      return this._toolsCache;
    }

    try {
      const response = await this.call('tools/list') as MCPToolsListResponse;

      if (!response || !Array.isArray(response.tools)) {
        throw new InvalidResponseError('Invalid tools/list response format');
      }

      // Convert MCP tool definitions to our Tool format
      const tools = response.tools.map((mcpTool) => this._convertMCPTool(mcpTool));

      // Cache the results
      this._toolsCache = tools;

      logger.info('Tools discovered', { count: tools.length });

      return tools;
    } catch (error) {
      logger.error('Failed to list tools', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Get process status
   */
  getStatus(): ProcessStatus {
    const uptime = this._startTime
      ? Math.floor((Date.now() - this._startTime.getTime()) / 1000)
      : 0;

    return {
      running: this._process !== null && !this._process.killed,
      uptime,
      requestCount: this._requestCount,
      errorCount: this._errorCount,
      lastRestart: this._lastRestart || undefined,
      restartCount: this._restartCount,
      pid: this._process?.pid,
      lastHeartbeat: this._lastHeartbeat || undefined,
    };
  }

  /**
   * Start the child process
   */
  private async _startProcess(): Promise<void> {
    try {
      // Spawn the process
      const proc = spawn(this._config.command, this._config.args, {
        cwd: this._config.cwd,
        env: { ...process.env, ...this._config.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      }) as ChildProcess & { pid?: number };

      this._process = proc;
      this._startTime = new Date();
      this._buffer = '';

      // Set up event handlers
      this._setupProcessHandlers();

      logger.info('STDIO process started', {
        command: this._config.command,
        pid: proc.pid,
      });

    } catch (error) {
      logger.error('Failed to start STDIO process', {
        command: this._config.command,
        error: (error as Error).message,
      });
      throw new ProcessCrashedError(`Failed to start process: ${(error as Error).message}`);
    }
  }

  /**
   * Set up process event handlers
   */
  private _setupProcessHandlers(): void {
    if (!this._process) return;

    // Handle stdout data
    this._process.stdout?.on('data', (data: Buffer) => {
      this._handleStdout(data);
    });

    // Handle stderr data
    this._process.stderr?.on('data', (data: Buffer) => {
      this._handleStderr(data);
    });

    // Handle process exit
    this._process.on('exit', (code, signal) => {
      logger.warn('STDIO process exited', {
        command: this._config.command,
        code,
        signal,
      });

      this._handleProcessExit(code, signal);
    });

    // Handle process error
    this._process.on('error', (error) => {
      logger.error('STDIO process error', {
        command: this._config.command,
        error: error.message,
      });

      this._errorCount++;
      this.emit('error', error);
    });
  }

  /**
   * Handle stdout data
   */
  private _handleStdout(data: Buffer): void {
    this._buffer += data.toString();

    // Process complete JSON-RPC messages (newline-delimited)
    const lines = this._buffer.split('\n');

    // Keep the last incomplete line in the buffer
    this._buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line) as JSONRPCResponse;
          this._handleResponse(message);
        } catch (error) {
          logger.error('Failed to parse JSON-RPC response', {
            error: (error as Error).message,
            line,
          });
        }
      }
    }
  }

  /**
   * Handle stderr data
   */
  private _handleStderr(data: Buffer): void {
    const message = data.toString().trim();

    if (message) {
      logger.debug('STDIO process stderr', {
        command: this._config.command,
        message,
      });
    }
  }

  /**
   * Handle JSON-RPC response
   */
  private _handleResponse(response: JSONRPCResponse): void {
    // Check if this is a notification (no ID)
    if (!('id' in response)) {
      logger.debug('Received JSON-RPC notification', { response });
      this.emit('notification', response);
      return;
    }

    const pending = this._pendingRequests.get(response.id);

    if (!pending) {
      logger.warn('Received response for unknown request ID', { id: response.id });
      return;
    }

    // Clear timeout
    clearTimeout(pending.timeoutHandle);
    this._pendingRequests.delete(response.id);

    // Handle response
    if (response.error) {
      const error = new JSONRPCProtocolError(
        response.error.message,
        response.error.code,
        response.error.data
      );
      pending.reject(error);
    } else {
      pending.resolve(response.result);
    }

    // Update heartbeat on successful response
    this._lastHeartbeat = new Date();
  }

  /**
   * Handle process exit
   */
  private _handleProcessExit(code: number | null, signal: NodeJS.Signals | null): void {
    this._process = null;

    // Reject all pending requests
    for (const [id, pending] of this._pendingRequests.entries()) {
      clearTimeout(pending.timeoutHandle);
      pending.reject(new ProcessCrashedError('Process exited unexpectedly'));
      this._pendingRequests.delete(id);
    }

    // Clear tools cache
    this._toolsCache = null;

    // Emit exit event
    this.emit('exit', code, signal);

    // Attempt restart if not explicitly stopped
    if (!this._stopping) {
      this._attemptRestart();
    }
  }

  /**
   * Attempt to restart the process
   */
  private async _attemptRestart(): Promise<void> {
    if (this._restartCount >= this._config.maxRestarts) {
      const error = new MaxRestartsExceededError(
        `Maximum restart attempts (${this._config.maxRestarts}) exceeded`,
        this._config.maxRestarts
      );
      logger.error('Max restarts exceeded', {
        command: this._config.command,
        restartCount: this._restartCount,
      });
      this.emit('error', error);
      return;
    }

    this._restartCount++;
    this._lastRestart = new Date();

    logger.info('Attempting to restart process', {
      command: this._config.command,
      attempt: this._restartCount,
      maxAttempts: this._config.maxRestarts,
    });

    // Wait before restarting (backoff)
    await new Promise(resolve => setTimeout(resolve, RESTART_BACKOFF_MS * this._restartCount));

    try {
      await this._startProcess();
      this.emit('restart', this._restartCount);

      logger.info('Process restarted successfully', {
        command: this._config.command,
        restartCount: this._restartCount,
      });
    } catch (error) {
      logger.error('Failed to restart process', {
        command: this._config.command,
        error: (error as Error).message,
      });
      this.emit('error', error);
    }
  }

  /**
   * Send JSON-RPC request
   */
  private async _sendRequest(request: JSONRPCRequest): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this._process || !this._process.stdin) {
        reject(new ProcessCrashedError('Process is not running'));
        return;
      }

      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        this._pendingRequests.delete(request.id);
        this._errorCount++;
        reject(new TimeoutError(`Request timed out after ${this._config.timeout}ms`));
      }, this._config.timeout);

      // Store pending request
      const pending: PendingRequest = {
        id: request.id,
        resolve,
        reject,
        timestamp: new Date(),
        timeoutHandle,
      };

      this._pendingRequests.set(request.id, pending);

      // Send request
      try {
        const message = JSON.stringify(request) + '\n';
        this._process.stdin.write(message, (error) => {
          if (error) {
            clearTimeout(timeoutHandle);
            this._pendingRequests.delete(request.id);
            this._errorCount++;
            reject(new ProcessCrashedError(`Failed to write to stdin: ${error.message}`));
          } else {
            this._requestCount++;
          }
        });
      } catch (error) {
        clearTimeout(timeoutHandle);
        this._pendingRequests.delete(request.id);
        this._errorCount++;
        reject(new ProcessCrashedError(`Failed to send request: ${(error as Error).message}`));
      }
    });
  }

  /**
   * Start heartbeat monitoring
   */
  private _startHeartbeat(): void {
    this._heartbeatTimer = setInterval(() => {
      // Check if process is still running
      if (!this._process || this._process.killed) {
        logger.warn('Heartbeat detected dead process', {
          command: this._config.command,
        });
        return;
      }

      // Update heartbeat timestamp
      this._lastHeartbeat = new Date();

      logger.debug('Heartbeat check', {
        command: this._config.command,
        pid: this._process.pid,
      });
    }, this._config.heartbeatInterval);
  }

  /**
   * Stop heartbeat monitoring
   */
  private _stopHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }

  /**
   * Validate configuration
   */
  private _validateConfig(): void {
    if (!this._config.command) {
      throw new Error('STDIO command is required');
    }

    // Security: Prevent shell injection
    if (this._config.command.includes('&&') ||
        this._config.command.includes('||') ||
        this._config.command.includes(';') ||
        this._config.command.includes('|')) {
      throw new Error('STDIO command contains invalid characters (shell injection prevention)');
    }

    // Validate environment variables
    if (this._config.env) {
      for (const [key, value] of Object.entries(this._config.env)) {
        if (typeof key !== 'string' || typeof value !== 'string') {
          throw new Error('Environment variables must be string key-value pairs');
        }
      }
    }
  }

  /**
   * Convert MCP tool definition to our Tool format
   */
  private _convertMCPTool(mcpTool: MCPToolDefinition): Tool {
    return {
      id: `stdio-${mcpTool.name}`,
      name: mcpTool.name,
      description: mcpTool.description,
      category: 'custom',
      integration: 'stdio',
      parameters: {
        type: 'object',
        properties: mcpTool.inputSchema.properties as any || {},
        required: mcpTool.inputSchema.required || [],
      },
      tokenCost: this._estimateTokenCost(mcpTool),
    };
  }

  /**
   * Estimate token cost for a tool
   */
  private _estimateTokenCost(mcpTool: MCPToolDefinition): number {
    // Rough estimation: ~4 chars per token
    const schemaJson = JSON.stringify(mcpTool);
    return Math.ceil(schemaJson.length / 4);
  }
}
