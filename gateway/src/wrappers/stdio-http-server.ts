/**
 * HTTP Server Wrapper for STDIO MCP Servers
 *
 * Exposes STDIO wrapper via HTTP REST API for gateway integration.
 *
 * Routes:
 * - POST /invoke - Call a tool
 * - GET /tools - List available tools
 * - GET /status - Get process status
 * - GET /health - Health check
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import { STDIOWrapper } from './stdio-to-http';
import { logger } from '../logging/logger';
import { MCPToolCallRequest } from './types';
import { ProcessCrashedError, JSONRPCProtocolError, TimeoutError } from '../errors/stdio-errors';

/**
 * HTTP server wrapper for STDIO MCP servers
 */
export class STDIOHTTPServer {
  private readonly _wrapper: STDIOWrapper;
  private _app: Express | null = null;
  private _server: Server | null = null;
  private _port: number | null = null;

  constructor(wrapper: STDIOWrapper) {
    this._wrapper = wrapper;
  }

  /**
   * Start the HTTP server
   */
  async start(port: number): Promise<void> {
    if (this._server) {
      logger.warn('HTTP server already running', { port: this._port });
      return;
    }

    this._port = port;
    this._app = express();

    // Middleware
    this._setupMiddleware();

    // Routes
    this._setupRoutes();

    // Error handler
    this._setupErrorHandler();

    // Start server
    return new Promise((resolve, reject) => {
      this._server = this._app!.listen(port, () => {
        logger.info('STDIO HTTP server started', { port });
        resolve();
      });

      this._server.on('error', (error) => {
        logger.error('HTTP server error', { error: error.message, port });
        reject(error);
      });
    });
  }

  /**
   * Stop the HTTP server
   */
  async stop(): Promise<void> {
    if (!this._server) {
      return;
    }

    return new Promise((resolve) => {
      this._server!.close(() => {
        logger.info('STDIO HTTP server stopped', { port: this._port });
        this._server = null;
        this._app = null;
        this._port = null;
        resolve();
      });
    });
  }

  /**
   * Get server port
   */
  getPort(): number | null {
    return this._port;
  }

  /**
   * Setup middleware
   */
  private _setupMiddleware(): void {
    if (!this._app) return;

    // Body parser
    this._app.use(express.json({ limit: '10mb' }));

    // Request logging
    this._app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.debug('HTTP request', {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration,
        });
      });

      next();
    });
  }

  /**
   * Setup routes
   */
  private _setupRoutes(): void {
    if (!this._app) return;

    /**
     * POST /invoke
     * Invoke a tool via JSON-RPC
     */
    this._app.post('/invoke', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { method, params } = req.body;

        if (!method || typeof method !== 'string') {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Method is required and must be a string',
            },
          });
          return;
        }

        logger.debug('Invoking tool', { method, params });

        const result = await this._wrapper.call(method, params);

        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    });

    /**
     * POST /tools/call
     * Call a tool (MCP format)
     */
    this._app.post('/tools/call', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { name, arguments: args } = req.body as MCPToolCallRequest;

        if (!name || typeof name !== 'string') {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Tool name is required and must be a string',
            },
          });
          return;
        }

        logger.debug('Calling tool', { name, args });

        const result = await this._wrapper.call('tools/call', { name, arguments: args });

        res.json({
          success: true,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    });

    /**
     * GET /tools
     * List available tools
     */
    this._app.get('/tools', async (_req: Request, res: Response, next: NextFunction) => {
      try {
        logger.debug('Listing tools');

        const tools = await this._wrapper.listTools();

        res.json({
          success: true,
          data: {
            tools,
            count: tools.length,
          },
        });
      } catch (error) {
        next(error);
      }
    });

    /**
     * GET /status
     * Get process status
     */
    this._app.get('/status', (_req: Request, res: Response) => {
      try {
        const status = this._wrapper.getStatus();

        res.json({
          success: true,
          data: status,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: (error as Error).message,
          },
        });
      }
    });

    /**
     * GET /health
     * Health check
     */
    this._app.get('/health', (_req: Request, res: Response) => {
      const status = this._wrapper.getStatus();

      if (status.running) {
        res.json({
          status: 'healthy',
          uptime: status.uptime,
          pid: status.pid,
        });
      } else {
        res.status(503).json({
          status: 'unhealthy',
          error: 'Process is not running',
        });
      }
    });
  }

  /**
   * Setup error handler
   */
  private _setupErrorHandler(): void {
    if (!this._app) return;

    this._app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
      logger.error('HTTP request error', {
        method: req.method,
        path: req.path,
        error: error.message,
        stack: error.stack,
      });

      // Map error types to HTTP status codes
      let statusCode = 500;
      let errorCode = 'INTERNAL_ERROR';

      if (error instanceof ProcessCrashedError) {
        statusCode = 503;
        errorCode = 'PROCESS_CRASHED';
      } else if (error instanceof TimeoutError) {
        statusCode = 504;
        errorCode = 'TIMEOUT';
      } else if (error instanceof JSONRPCProtocolError) {
        statusCode = 400;
        errorCode = 'JSON_RPC_ERROR';
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: error.message,
          ...(error instanceof JSONRPCProtocolError && {
            rpcCode: error.code,
            rpcData: error.data,
          }),
        },
      });
    });
  }
}
