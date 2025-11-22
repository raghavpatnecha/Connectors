/**
 * Custom error classes for gateway operations
 *
 * NOTE: OAuth-specific errors are defined in oauth-errors.ts
 * and re-exported here for backward compatibility
 */

import {
  OAuthError as OAuthErrorBase,
  RateLimitError as RateLimitErrorBase,
  TokenRefreshError,
  TokenExpiredError,
  CredentialNotFoundError,
  VaultError,
  VaultEncryptionError,
  InvalidOAuthConfigError
} from './oauth-errors';

// Re-export OAuth errors for backward compatibility
export {
  OAuthErrorBase as OAuthError,
  RateLimitErrorBase as RateLimitError,
  TokenRefreshError,
  TokenExpiredError,
  CredentialNotFoundError,
  VaultError,
  VaultEncryptionError,
  InvalidOAuthConfigError
};

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

// NOTE: OAuthError and RateLimitError are now imported from oauth-errors.ts
// and re-exported above to avoid duplication

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

export class InvalidRelationshipTypeError extends GatewayError {
  constructor(
    message: string,
    public readonly attemptedType: string
  ) {
    super(message);
    this.name = 'InvalidRelationshipTypeError';
  }
}

export class RateLimitExceededError extends GatewayError {
  constructor(
    message: string,
    public readonly scope: 'global' | 'tenant' | 'endpoint',
    public readonly limit: number,
    public readonly window: number,
    public readonly resetAt: Date
  ) {
    super(message);
    this.name = 'RateLimitExceededError';
  }
}

export class AuthenticationError extends GatewayError {
  constructor(
    message: string,
    public readonly code: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends GatewayError {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * MCP Deployer Errors
 */
export class GitCloneError extends GatewayError {
  constructor(
    message: string,
    public readonly url: string,
    public readonly reason: 'not_found' | 'auth_failure' | 'timeout' | 'network_error' | 'unknown',
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'GitCloneError';
  }
}

export class DependencyInstallError extends GatewayError {
  constructor(
    message: string,
    public readonly packageManager: string,
    public readonly repoPath: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'DependencyInstallError';
  }
}

export class InvalidMCPServerError extends GatewayError {
  constructor(
    message: string,
    public readonly repoPath: string,
    public readonly reason: string
  ) {
    super(message);
    this.name = 'InvalidMCPServerError';
  }
}

export class DiskQuotaError extends GatewayError {
  constructor(
    message: string,
    public readonly required: number,
    public readonly available: number
  ) {
    super(message);
    this.name = 'DiskQuotaError';
  }
}

export class DockerBuildError extends GatewayError {
  constructor(
    message: string,
    public readonly deploymentId: string,
    public readonly reason: 'connection_failed' | 'build_failed' | 'execution_failed' | 'timeout' | 'invalid_type' | 'unsupported_type' | 'dockerfile_generation_failed' | 'unknown',
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'DockerBuildError';
  }
}

export class ImagePushError extends GatewayError {
  constructor(
    message: string,
    public readonly imageTag: string,
    public readonly registry: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'ImagePushError';
  }
}

/**
 * Kubernetes Deployment Errors
 */
export class K8sDeploymentError extends GatewayError {
  constructor(
    message: string,
    public readonly deploymentId: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'K8sDeploymentError';
  }
}

export class PodNotReadyError extends GatewayError {
  constructor(
    message: string,
    public readonly deploymentName: string,
    public readonly reason: 'timeout' | 'failed' | 'image_pull_error' | 'crash_loop'
  ) {
    super(message);
    this.name = 'PodNotReadyError';
  }
}

export class K8sConnectionError extends GatewayError {
  constructor(
    message: string,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'K8sConnectionError';
  }
}
