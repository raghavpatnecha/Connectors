/**
 * Custom error classes for gateway operations
 */

export class GatewayError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'GatewayError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ToolSelectionError extends GatewayError {
  constructor(
    message: string,
    public readonly query: string,
    public readonly context?: unknown,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'ToolSelectionError';
  }
}

export class EmbeddingError extends GatewayError {
  constructor(
    message: string,
    public readonly text: string,
    public readonly model?: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'EmbeddingError';
  }
}

export class FAISSError extends GatewayError {
  constructor(
    message: string,
    public readonly operation: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'FAISSError';
  }
}

export class TokenBudgetExceededError extends GatewayError {
  constructor(
    message: string,
    public readonly requested: number,
    public readonly budget: number
  ) {
    super(message);
    this.name = 'TokenBudgetExceededError';
  }
}

export class CacheError extends GatewayError {
  constructor(
    message: string,
    public readonly key: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'CacheError';
  }
}

export class OAuthError extends GatewayError {
  constructor(
    message: string,
    public readonly integration: string,
    public readonly tenantId: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'OAuthError';
  }
}

export class RateLimitError extends GatewayError {
  constructor(
    message: string,
    public readonly metadata: {
      resetTime?: number;
      remaining?: number;
      limit?: number;
    }
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class MCPError extends GatewayError {
  constructor(
    message: string,
    public readonly metadata?: {
      status?: number;
      endpoint?: string;
      integration?: string;
    }
  ) {
    super(message);
    this.name = 'MCPError';
  }
}
