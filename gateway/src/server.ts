/**
 * Express HTTP Server for MCP Gateway
 *
 * Provides REST API endpoints for:
 * - Health checks and readiness probes
 * - Tool selection via semantic routing
 * - MCP tool invocation with OAuth proxy
 * - Metrics and monitoring
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { SemanticRouter } from './routing/semantic-router';
import { EmbeddingService } from './routing/embedding-service';
import { TokenOptimizer } from './optimization/token-optimizer';
import { ProgressiveLoader } from './optimization/progressive-loader';
import { OAuthProxy } from './auth/oauth-proxy';
import { VaultClient } from './auth/vault-client';
import { RedisCache } from './caching/redis-cache';
import { IntegrationRegistry, createIntegrationRegistry } from './config/integrations';
import { logger } from './logging/logger';
import { ToolSelectionError, OAuthError } from './errors/gateway-errors';
import type { QueryContext } from './types/routing.types';
import { createTenantOAuthRouter } from './routes/tenant-oauth';
import { createMCPManagementRouter } from './routes/mcp-management';
import { MCPDeployer } from './services/mcp-deployer';
import {
  initializeRateLimitRedis,
  closeRateLimitRedis,
  createGlobalRateLimiter,
  createTenantRateLimiter,
  createEndpointLimiters,
  getRateLimitConfig,
} from './middleware/rate-limiter';
import { createAPIKeyMiddleware } from './middleware/authenticate-api-key';
import { authorizeTenant } from './middleware/authorize-tenant';
import { responseFormatterMiddleware } from './middleware/response-formatter';

// Server configuration
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['*'];

/**
 * Request interfaces
 */
interface SelectToolsRequest {
  query: string;
  context?: {
    allowedCategories?: string[];
    tokenBudget?: number;
    tenantId?: string;
    maxTools?: number;
  };
}

interface InvokeToolRequest {
  toolId: string;
  integration: string;
  parameters: Record<string, unknown>;
  tenantId: string;
}

/**
 * MCP Gateway Server
 */
export class MCPGatewayServer {
  private readonly app: Application;
  private readonly semanticRouter: SemanticRouter;
  private readonly tokenOptimizer: TokenOptimizer;
  private readonly progressiveLoader: ProgressiveLoader;
  private readonly oauthProxy: OAuthProxy;
  private readonly integrationRegistry: IntegrationRegistry;
  private readonly vaultClient: VaultClient;
  private readonly mcpDeployer: MCPDeployer;

  constructor() {
    this.app = express();

    // Initialize core services with proper configuration
    const categoryIndexPath = process.env.CATEGORY_INDEX_PATH || 'data/indices/categories.faiss';
    const toolIndexPath = process.env.TOOL_INDEX_PATH || 'data/indices/tools.faiss';

    const embeddingService = new EmbeddingService();
    const cache = new RedisCache();

    this.semanticRouter = new SemanticRouter(
      categoryIndexPath,
      toolIndexPath,
      embeddingService,
      cache
    );

    this.tokenOptimizer = new TokenOptimizer();
    this.progressiveLoader = new ProgressiveLoader(this.tokenOptimizer);

    // Initialize Vault client (single instance for all services)
    this.vaultClient = new VaultClient({
      address: process.env.VAULT_ADDR || 'http://localhost:8200',
      token: process.env.VAULT_TOKEN || 'dev-token',
      transitEngine: 'transit',
      kvEngine: 'secret',
    });

    // Initialize OAuth proxy
    this.oauthProxy = new OAuthProxy(
      this.vaultClient,
      process.env.MCP_BASE_URL || 'http://localhost:4000',
      new Map()
    );

    // Initialize integration registry with all integrations
    this.integrationRegistry = createIntegrationRegistry(
      this.oauthProxy,
      this.semanticRouter
    );

    // Initialize MCP deployer service
    this.mcpDeployer = new MCPDeployer();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  /**
   * Configure Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: NODE_ENV === 'production',
      crossOriginEmbedderPolicy: NODE_ENV === 'production',
    }));

    // CORS configuration
    this.app.use(cors({
      origin: CORS_ORIGINS,
      credentials: true,
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Response formatting (adds sendSuccess/sendError helpers)
    this.app.use(responseFormatterMiddleware);

    // Compression
    this.app.use(compression());

    // Rate limiting middleware (multi-layer)
    const rateLimitConfig = getRateLimitConfig();

    if (rateLimitConfig.globalEnabled) {
      this.app.use(createGlobalRateLimiter());
      logger.info('Global rate limiting enabled', {
        rps: rateLimitConfig.globalRps,
        exemptPaths: rateLimitConfig.exemptPaths
      });
    }

    if (rateLimitConfig.tenantEnabled) {
      this.app.use(createTenantRateLimiter());
      logger.info('Tenant rate limiting enabled', {
        rps: rateLimitConfig.tenantRps
      });
    }

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('http_request', {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration_ms: duration,
          user_agent: req.get('user-agent'),
        });
      });

      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check endpoints (no authentication required)
    this.app.get('/health', this.handleHealth.bind(this));
    this.app.get('/ready', this.handleReadiness.bind(this));

    // API v1 routes
    const apiV1 = express.Router();

    // Apply API key authentication to ALL /api/v1 routes
    const apiKeyMiddleware = createAPIKeyMiddleware(this.vaultClient);
    apiV1.use(apiKeyMiddleware);
    logger.info('API key authentication middleware enabled for /api/v1 routes');

    // Create endpoint-specific rate limiters
    const rateLimitConfig = getRateLimitConfig();
    const endpointLimiters = rateLimitConfig.endpointLimitsEnabled
      ? createEndpointLimiters()
      : {
          toolsSelect: (_req: Request, _res: Response, next: NextFunction) => next(),
          toolsInvoke: (_req: Request, _res: Response, next: NextFunction) => next(),
          toolsList: (_req: Request, _res: Response, next: NextFunction) => next(),
          oauthConfigPost: (_req: Request, _res: Response, next: NextFunction) => next(),
          oauthConfigGet: (_req: Request, _res: Response, next: NextFunction) => next(),
          oauthConfigDelete: (_req: Request, _res: Response, next: NextFunction) => next(),
          integrationsList: (_req: Request, _res: Response, next: NextFunction) => next(),
        };

    // Apply endpoint-specific rate limiters to routes
    // Tool endpoints (require authentication + tenant authorization for invoke)
    apiV1.post('/tools/select', endpointLimiters.toolsSelect, this.handleSelectTools.bind(this));
    apiV1.post('/tools/invoke', endpointLimiters.toolsInvoke, authorizeTenant, this.handleInvokeTool.bind(this));
    apiV1.get('/tools/list', endpointLimiters.toolsList, this.handleListTools.bind(this));
    apiV1.get('/categories', this.handleListCategories.bind(this));
    apiV1.get('/metrics', this.handleMetrics.bind(this));

    // Mount tenant OAuth configuration routes (use single VaultClient instance)
    const tenantOAuthRouter = createTenantOAuthRouter(this.vaultClient);
    apiV1.use('/', tenantOAuthRouter);

    // Mount MCP management routes
    const mcpManagementRouter = createMCPManagementRouter(this.mcpDeployer);
    apiV1.use('/mcp', mcpManagementRouter);

    this.app.use('/api/v1', apiV1);

    // Root endpoint
    this.app.get('/', (_req: Request, res: Response) => {
      res.sendSuccess({
        name: 'MCP Gateway',
        version: '1.0.0',
        status: 'operational',
        endpoints: {
          health: '/health',
          ready: '/ready',
          api: '/api/v1',
          docs: '/api/v1/docs',
        },
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.sendError(
        'ROUTE_NOT_FOUND',
        `Route ${req.method} ${req.path} not found`,
        undefined,
        404
      );
    });
  }

  /**
   * Health check endpoint
   */
  private async handleHealth(_req: Request, res: Response): Promise<void> {
    res.sendSuccess({
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  }

  /**
   * Readiness probe endpoint
   */
  private async handleReadiness(_req: Request, res: Response): Promise<void> {
    try {
      // Check service dependencies
      const checks = await Promise.allSettled([
        this.semanticRouter.healthCheck(),
        this.oauthProxy.healthCheck(),
      ]);

      const allHealthy = checks.every(
        (check) => check.status === 'fulfilled' && check.value === true
      );

      if (allHealthy) {
        res.sendSuccess({
          status: 'ready',
          checks: {
            semanticRouter: 'ok',
            oauthProxy: 'ok',
          },
        });
      } else {
        res.sendError(
          'SERVICE_NOT_READY',
          'One or more services are not ready',
          {
            checks: checks.map((check, idx) => ({
              service: ['semanticRouter', 'oauthProxy'][idx],
              status: check.status === 'fulfilled' ? 'ok' : 'failed',
              error: check.status === 'rejected' ? (check.reason as Error).message : undefined,
            })),
          },
          503
        );
      }
    } catch (error) {
      logger.error('Readiness check failed', { error });
      res.sendError(
        'READINESS_CHECK_FAILED',
        (error as Error).message,
        undefined,
        503
      );
    }
  }

  /**
   * Tool selection endpoint
   * POST /api/v1/tools/select
   */
  private async handleSelectTools(req: Request, res: Response): Promise<void> {
    try {
      const { query, context }: SelectToolsRequest = req.body;

      if (!query || typeof query !== 'string') {
        res.sendError(
          'INVALID_QUERY',
          'Query parameter is required and must be a string'
        );
        return;
      }

      // Build query context
      const queryContext: QueryContext = {
        allowedCategories: context?.allowedCategories || [],
        tokenBudget: context?.tokenBudget || 5000,
        tenantId: context?.tenantId,
      };

      // Select tools using semantic routing
      const startTime = Date.now();
      const selectedTools = await this.semanticRouter.selectTools(query, queryContext);
      const selectionLatency = Date.now() - startTime;

      // Optimize token usage with progressive loading
      const tokenBudget = queryContext.tokenBudget || 5000;
      const optimized = this.tokenOptimizer.optimize(selectedTools, tokenBudget);
      const tiered = await this.progressiveLoader.loadTiered(optimized, tokenBudget);

      // Log performance metrics
      logger.info('tool_selection_completed', {
        query,
        tools_selected: selectedTools.length,
        tools_optimized: optimized.length,
        token_budget: tokenBudget,
        token_usage: tiered.totalTokens,
        latency_ms: selectionLatency,
        token_reduction_pct: ((tokenBudget - tiered.totalTokens) / tokenBudget) * 100,
      });

      res.sendSuccess({
        query,
        tools: {
          tier1: tiered.tier1,
          tier2: tiered.tier2,
          tier3: tiered.tier3,
        },
        performance: {
          totalTools: selectedTools.length,
          tokenUsage: tiered.totalTokens,
          tokenBudget: queryContext.tokenBudget,
          latency_ms: selectionLatency,
        },
      });
    } catch (error) {
      if (error instanceof ToolSelectionError) {
        logger.error('Tool selection failed', {
          query: error.query,
          error: error.message,
        });
        res.sendError(
          'TOOL_SELECTION_FAILED',
          error.message,
          { query: error.query },
          500
        );
      } else {
        throw error; // Pass to error handler
      }
    }
  }

  /**
   * Tool invocation endpoint
   * POST /api/v1/tools/invoke
   */
  private async handleInvokeTool(req: Request, res: Response): Promise<void> {
    try {
      const { toolId, integration, parameters, tenantId }: InvokeToolRequest = req.body;

      if (!toolId || !integration || !tenantId) {
        res.sendError(
          'MISSING_REQUIRED_FIELDS',
          'toolId, integration, and tenantId are required'
        );
        return;
      }

      // Invoke tool via OAuth proxy
      const startTime = Date.now();
      const result = await this.oauthProxy.proxyRequest({
        tenantId,
        integration,
        method: 'POST',
        path: `/tools/${toolId}/invoke`,
        body: parameters,
        headers: {},
      });
      const invocationLatency = Date.now() - startTime;

      logger.info('tool_invocation_completed', {
        toolId,
        integration,
        tenantId,
        latency_ms: invocationLatency,
        success: true,
      });

      res.sendSuccess({
        toolId,
        result: result.data,
        performance: {
          latency_ms: invocationLatency,
        },
      });
    } catch (error) {
      if (error instanceof OAuthError) {
        logger.error('OAuth error during tool invocation', {
          integration: error.integration,
          tenantId: error.tenantId,
          error: error.message,
        });
        res.sendError(
          'OAUTH_AUTHENTICATION_FAILED',
          error.message,
          { integration: error.integration },
          401
        );
      } else {
        throw error; // Pass to error handler
      }
    }
  }

  /**
   * List all available tools
   * GET /api/v1/tools/list
   */
  private async handleListTools(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const limit = parseInt(req.query.limit as string || '100', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);

      const tools = await this.semanticRouter.listAllTools({
        category,
        limit,
        offset,
      });

      res.sendSuccess({
        tools,
        pagination: {
          total: tools.length,
          limit,
          offset,
        },
      });
    } catch (error) {
      throw error; // Pass to error handler
    }
  }

  /**
   * List all categories
   * GET /api/v1/categories
   */
  private async handleListCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.semanticRouter.listCategories();

      res.sendSuccess({ categories });
    } catch (error) {
      throw error; // Pass to error handler
    }
  }

  /**
   * Metrics endpoint
   * GET /api/v1/metrics
   */
  private async handleMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const metrics = {
        requests: {
          total: 0, // TODO: Implement metrics tracking
          success: 0,
          failed: 0,
        },
        latency: {
          p50: 0,
          p95: 0,
          p99: 0,
        },
        tokenUsage: {
          total: 0,
          average: 0,
          reduction: 0,
        },
      };

      res.sendSuccess({ metrics });
    } catch (error) {
      throw error; // Pass to error handler
    }
  }

  /**
   * Setup error handlers
   */
  private setupErrorHandlers(): void {
    this.app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });

      res.sendError(
        'INTERNAL_SERVER_ERROR',
        NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
        NODE_ENV === 'development' ? { stack: err.stack } : undefined,
        500
      );
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Initialize Redis for rate limiting
      await initializeRateLimitRedis();

      // Initialize services
      await this.semanticRouter.initialize();
      await this.oauthProxy.initialize();

      // Initialize all integrations (GitHub, Notion, LinkedIn, Reddit)
      await this.integrationRegistry.initialize();

      // Initialize MCP deployer service
      await this.mcpDeployer.initialize();

      // Start HTTP server
      this.app.listen(PORT, () => {
        const rateLimitConfig = getRateLimitConfig();
        logger.info('MCP Gateway started', {
          port: PORT,
          environment: NODE_ENV,
          cors_origins: CORS_ORIGINS,
          authentication: 'API Key (enabled)',
          rateLimiting: {
            global: rateLimitConfig.globalEnabled ? `${rateLimitConfig.globalRps} req/s` : 'disabled',
            tenant: rateLimitConfig.tenantEnabled ? `${rateLimitConfig.tenantRps} req/s` : 'disabled',
            endpointLimits: rateLimitConfig.endpointLimitsEnabled ? 'enabled' : 'disabled',
          }
        });
        console.log(`🚀 MCP Gateway running on http://localhost:${PORT}`);
        console.log(`📊 Health: http://localhost:${PORT}/health`);
        console.log(`🔧 API: http://localhost:${PORT}/api/v1`);
        console.log(`🔌 Integrations: 4 registered (GitHub, Notion, LinkedIn, Reddit)`);
        console.log(`🔐 Authentication: API Key Required`);
        console.log(`🛡️  Rate Limiting: ${rateLimitConfig.globalEnabled ? 'Enabled' : 'Disabled'}`);
      });
    } catch (error) {
      logger.error('Failed to start server', { error });
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down MCP Gateway...');

    // Close service connections
    await this.integrationRegistry.close();
    await this.semanticRouter.close();
    await this.oauthProxy.close();
    await this.mcpDeployer.close();

    // Close rate limiting Redis connection
    await closeRateLimitRedis();

    logger.info('MCP Gateway shutdown complete');
    process.exit(0);
  }
}

/**
 * Main entry point
 */
async function main() {
  const server = new MCPGatewayServer();

  // Handle shutdown signals
  process.on('SIGTERM', () => server.shutdown());
  process.on('SIGINT', () => server.shutdown());

  // Start server
  await server.start();
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('Fatal error', { error });
    process.exit(1);
  });
}
