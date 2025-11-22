/**
 * Input validation utilities
 * Comprehensive validation to prevent injection attacks, DoS, and data corruption
 */

import { createLogger } from 'winston';

const logger = createLogger({
  defaultMeta: { service: 'validation' }
});

/**
 * Validation error thrown when input fails validation
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * String validation options
 */
export interface StringValidationOptions {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowEmpty?: boolean;
  noControlChars?: boolean;
}

/**
 * Number validation options
 */
export interface NumberValidationOptions {
  min?: number;
  max?: number;
  integer?: boolean;
}

/**
 * Array validation options
 */
export interface ArrayValidationOptions {
  minLength?: number;
  maxLength?: number;
  uniqueItems?: boolean;
}

/**
 * Object validation options
 */
export interface ObjectValidationOptions {
  maxDepth?: number;
  maxKeys?: number;
  allowedKeys?: string[];
}

/**
 * Validate string input
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param options - Validation options
 * @throws ValidationError if validation fails
 */
export function validateString(
  value: any,
  fieldName: string,
  options: StringValidationOptions = {}
): string {
  // Check type
  if (typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} must be a string`,
      fieldName,
      value
    );
  }

  // Check empty
  if (!options.allowEmpty && value.length === 0) {
    throw new ValidationError(
      `${fieldName} cannot be empty`,
      fieldName,
      value
    );
  }

  // Check length
  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.minLength} characters`,
      fieldName,
      value
    );
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.maxLength} characters (got ${value.length})`,
      fieldName
    );
  }

  // Check for control characters (prevent injection)
  if (options.noControlChars) {
    const controlCharsRegex = /[\x00-\x1F\x7F]/;
    if (controlCharsRegex.test(value)) {
      throw new ValidationError(
        `${fieldName} contains invalid control characters`,
        fieldName
      );
    }
  }

  // Check pattern
  if (options.pattern && !options.pattern.test(value)) {
    throw new ValidationError(
      `${fieldName} does not match required pattern`,
      fieldName
    );
  }

  return value;
}

/**
 * Validate number input
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param options - Validation options
 * @throws ValidationError if validation fails
 */
export function validateNumber(
  value: any,
  fieldName: string,
  options: NumberValidationOptions = {}
): number {
  // Check type
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof num !== 'number' || isNaN(num)) {
    throw new ValidationError(
      `${fieldName} must be a valid number`,
      fieldName,
      value
    );
  }

  // Check integer
  if (options.integer && !Number.isInteger(num)) {
    throw new ValidationError(
      `${fieldName} must be an integer`,
      fieldName,
      num
    );
  }

  // Check range
  if (options.min !== undefined && num < options.min) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.min}`,
      fieldName,
      num
    );
  }

  if (options.max !== undefined && num > options.max) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.max}`,
      fieldName,
      num
    );
  }

  return num;
}

/**
 * Validate array input
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param options - Validation options
 * @throws ValidationError if validation fails
 */
export function validateArray(
  value: any,
  fieldName: string,
  options: ArrayValidationOptions = {}
): any[] {
  // Check type
  if (!Array.isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an array`,
      fieldName,
      value
    );
  }

  // Check length
  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(
      `${fieldName} must have at least ${options.minLength} items`,
      fieldName,
      value.length
    );
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(
      `${fieldName} must have at most ${options.maxLength} items (got ${value.length})`,
      fieldName
    );
  }

  // Check unique items
  if (options.uniqueItems) {
    const uniqueSet = new Set(value.map(v => JSON.stringify(v)));
    if (uniqueSet.size !== value.length) {
      throw new ValidationError(
        `${fieldName} must contain only unique items`,
        fieldName
      );
    }
  }

  return value;
}

/**
 * Validate object input
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param options - Validation options
 * @throws ValidationError if validation fails
 */
export function validateObject(
  value: any,
  fieldName: string,
  options: ObjectValidationOptions = {}
): Record<string, any> {
  // Check type
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(
      `${fieldName} must be an object`,
      fieldName,
      value
    );
  }

  // Check max keys
  const keys = Object.keys(value);
  if (options.maxKeys !== undefined && keys.length > options.maxKeys) {
    throw new ValidationError(
      `${fieldName} must have at most ${options.maxKeys} keys (got ${keys.length})`,
      fieldName
    );
  }

  // Check allowed keys
  if (options.allowedKeys) {
    const allowedSet = new Set(options.allowedKeys);
    for (const key of keys) {
      if (!allowedSet.has(key)) {
        throw new ValidationError(
          `${fieldName} contains invalid key: ${key}`,
          fieldName,
          key
        );
      }
    }
  }

  // Check max depth (prevent DoS from deeply nested objects)
  if (options.maxDepth !== undefined) {
    const checkDepth = (obj: any, depth: number): number => {
      if (depth > options.maxDepth!) {
        throw new ValidationError(
          `${fieldName} exceeds maximum depth of ${options.maxDepth}`,
          fieldName
        );
      }

      if (typeof obj !== 'object' || obj === null) {
        return depth;
      }

      let maxChildDepth = depth;
      for (const value of Object.values(obj)) {
        if (typeof value === 'object' && value !== null) {
          maxChildDepth = Math.max(maxChildDepth, checkDepth(value, depth + 1));
        }
      }

      return maxChildDepth;
    };

    checkDepth(value, 0);
  }

  return value;
}

/**
 * Validate UUID format
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @throws ValidationError if validation fails
 */
export function validateUUID(value: any, fieldName: string): string {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const str = validateString(value, fieldName, {
    pattern: uuidPattern,
    maxLength: 36
  });

  return str;
}

/**
 * Validate tool ID format
 * Pattern: alphanumeric, dots, hyphens, underscores only
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @throws ValidationError if validation fails
 */
export function validateToolId(value: any, fieldName: string): string {
  const toolIdPattern = /^[a-zA-Z0-9._-]+$/;

  const str = validateString(value, fieldName, {
    pattern: toolIdPattern,
    maxLength: 256,
    noControlChars: true
  });

  return str;
}

/**
 * Validate integration name
 * Pattern: lowercase alphanumeric and hyphens only
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @param allowedIntegrations - Optional whitelist of allowed integrations
 * @throws ValidationError if validation fails
 */
export function validateIntegration(
  value: any,
  fieldName: string,
  allowedIntegrations?: string[]
): string {
  const integrationPattern = /^[a-z0-9-]+$/;

  const str = validateString(value, fieldName, {
    pattern: integrationPattern,
    maxLength: 64,
    noControlChars: true
  });

  // Check whitelist if provided
  if (allowedIntegrations && !allowedIntegrations.includes(str)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedIntegrations.join(', ')}`,
      fieldName,
      str
    );
  }

  return str;
}

/**
 * Validate category name
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @throws ValidationError if validation fails
 */
export function validateCategory(value: any, fieldName: string): string {
  const categoryPattern = /^[a-z0-9_-]+$/;

  const str = validateString(value, fieldName, {
    pattern: categoryPattern,
    maxLength: 64,
    noControlChars: true
  });

  return str;
}

/**
 * Sanitize error messages to prevent information leakage
 *
 * @param error - Error to sanitize
 * @param includeDetails - Whether to include detailed error info (dev mode)
 * @returns Sanitized error message
 */
export function sanitizeError(error: any, includeDetails: boolean = false): {
  message: string;
  details?: any;
} {
  if (error instanceof ValidationError) {
    return {
      message: error.message,
      details: includeDetails ? { field: error.field } : undefined
    };
  }

  // Don't expose internal error details in production
  if (!includeDetails) {
    return {
      message: 'An error occurred while processing your request'
    };
  }

  return {
    message: error.message || 'Unknown error',
    details: {
      name: error.name,
      stack: error.stack
    }
  };
}

/**
 * Log validation errors for security monitoring
 *
 * @param error - Validation error
 * @param request - Request metadata
 */
export function logValidationError(
  error: ValidationError,
  request: { path: string; method: string; ip?: string }
): void {
  logger.warn('Input validation failed', {
    path: request.path,
    method: request.method,
    ip: request.ip,
    field: error.field,
    error: error.message
  });
}
