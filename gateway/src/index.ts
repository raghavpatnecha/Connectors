/**
 * Main entry point for MCP Gateway with Semantic Routing
 */

export { SemanticRouter } from './routing/semantic-router';
export { FAISSIndex } from './routing/faiss-index';
export { EmbeddingService } from './routing/embedding-service';
export { ProgressiveLoader } from './optimization/progressive-loader';
export { TokenOptimizer } from './optimization/token-optimizer';
export { RedisCache } from './caching/redis-cache';

export * from './types/routing.types';
export * from './errors/gateway-errors';
export { logger } from './logging/logger';
