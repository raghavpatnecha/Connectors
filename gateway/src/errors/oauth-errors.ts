/**
 * OAuth-specific error classes for MCP Gateway
 * Connectors Platform - Error Handling
 */

/**
 * Base OAuth error
 */
export class OAuthError extends Error {
  constructor(
    message: string,
    public readonly integration: string,
    public readonly tenantId: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'OAuthError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      integration: this.integration,
      tenantId: this.tenantId,
      cause: this.cause?.message,
      stack: this.stack
    };
  }
}

/**
 * Token refresh failed
 */
export class TokenRefreshError extends OAuthError {
  constructor(
    message: string,
    integration: string,
    tenantId: string,
    public readonly retryable: boolean = true,
    cause?: Error
  ) {
    super(message, integration, tenantId, cause);
    this.name = 'TokenRefreshError';
  }
}

/**
 * Token expired and refresh failed
 */
export class TokenExpiredError extends OAuthError {
  constructor(
    message: string,
    integration: string,
    tenantId: string,
    public readonly expiredAt: Date,
    cause?: Error
  ) {
    super(message, integration, tenantId, cause);
    this.name = 'TokenExpiredError';
  }
}

/**
 * Vault operation failed
 */
export class VaultError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly path: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'VaultError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      operation: this.operation,
      path: this.path,
      cause: this.cause?.message,
      stack: this.stack
    };
  }
}

/**
 * Vault encryption/decryption failed
 */
export class VaultEncryptionError extends VaultError {
  constructor(
    message: string,
    operation: 'encrypt' | 'decrypt',
    public readonly keyName: string,
    cause?: Error
  ) {
    super(message, operation, `transit/${operation}/${keyName}`, cause);
    this.name = 'VaultEncryptionError';
  }
}

/**
 * Credential not found in Vault
 */
export class CredentialNotFoundError extends OAuthError {
  constructor(
    integration: string,
    tenantId: string,
    public readonly path: string
  ) {
    super(
      `OAuth credentials not found for integration '${integration}' and tenant '${tenantId}'`,
      integration,
      tenantId
    );
    this.name = 'CredentialNotFoundError';
  }
}

/**
 * Rate limit error from OAuth provider
 */
export class RateLimitError extends OAuthError {
  constructor(
    message: string,
    integration: string,
    tenantId: string,
    public readonly resetTime: number,
    public readonly remaining: number = 0
  ) {
    super(message, integration, tenantId);
    this.name = 'RateLimitError';
  }

  getResetDate(): Date {
    return new Date(this.resetTime * 1000);
  }

  getWaitTimeMs(): number {
    return Math.max(0, this.resetTime * 1000 - Date.now());
  }
}

/**
 * Invalid OAuth configuration
 */
export class InvalidOAuthConfigError extends OAuthError {
  constructor(
    message: string,
    integration: string,
    public readonly missingFields: string[]
  ) {
    super(message, integration, 'unknown');
    this.name = 'InvalidOAuthConfigError';
  }
}
