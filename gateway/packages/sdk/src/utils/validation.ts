/**
 * Runtime validation utilities
 */

import type { ConnectorsConfig } from '../types/config';

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate URL format
 */
export function validateURL(url: string, fieldName: string = 'url'): void {
  try {
    new URL(url);
  } catch {
    throw new ValidationError(`Invalid URL format for ${fieldName}`, fieldName, url);
  }
}

/**
 * Validate that a value is a non-empty string
 */
export function validateNonEmptyString(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(
      `${fieldName} must be a non-empty string`,
      fieldName,
      value
    );
  }
}

/**
 * Validate that a value is a positive number
 */
export function validatePositiveNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  if (typeof value !== 'number' || value <= 0 || !Number.isFinite(value)) {
    throw new ValidationError(
      `${fieldName} must be a positive number`,
      fieldName,
      value
    );
  }
}

/**
 * Validate that a value is an object
 */
export function validateObject(
  value: unknown,
  fieldName: string
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`, fieldName, value);
  }
}

/**
 * Validate ConnectorsConfig
 */
export function validateConfig(config: unknown): asserts config is ConnectorsConfig {
  validateObject(config, 'config');

  const cfg = config as Record<string, unknown>;

  // Validate baseURL (required)
  if (!cfg.baseURL) {
    throw new ValidationError('baseURL is required', 'baseURL');
  }
  validateNonEmptyString(cfg.baseURL, 'baseURL');
  validateURL(cfg.baseURL, 'baseURL');

  // Validate optional fields
  if (cfg.apiKey !== undefined) {
    validateNonEmptyString(cfg.apiKey, 'apiKey');
  }

  if (cfg.tenantId !== undefined) {
    validateNonEmptyString(cfg.tenantId, 'tenantId');
  }

  if (cfg.timeout !== undefined) {
    validatePositiveNumber(cfg.timeout, 'timeout');
  }

  if (cfg.maxRetries !== undefined) {
    if (
      typeof cfg.maxRetries !== 'number' ||
      cfg.maxRetries < 0 ||
      !Number.isInteger(cfg.maxRetries)
    ) {
      throw new ValidationError(
        'maxRetries must be a non-negative integer',
        'maxRetries',
        cfg.maxRetries
      );
    }
  }

  if (cfg.headers !== undefined) {
    validateObject(cfg.headers, 'headers');
  }
}

/**
 * Validate tool selection request
 */
export function validateToolSelectionRequest(
  request: unknown
): asserts request is { query: string } {
  validateObject(request, 'request');

  const req = request as Record<string, unknown>;

  if (!req.query) {
    throw new ValidationError('query is required', 'query');
  }
  validateNonEmptyString(req.query, 'query');

  if (req.maxTools !== undefined) {
    validatePositiveNumber(req.maxTools, 'maxTools');
  }

  if (req.tokenBudget !== undefined) {
    validatePositiveNumber(req.tokenBudget, 'tokenBudget');
  }

  if (req.categories !== undefined && !Array.isArray(req.categories)) {
    throw new ValidationError('categories must be an array', 'categories', req.categories);
  }
}

/**
 * Validate tool invocation request
 */
export function validateToolInvocationRequest(
  request: unknown
): asserts request is { toolId: string; parameters: Record<string, unknown> } {
  validateObject(request, 'request');

  const req = request as Record<string, unknown>;

  if (!req.toolId) {
    throw new ValidationError('toolId is required', 'toolId');
  }
  validateNonEmptyString(req.toolId, 'toolId');

  if (!req.parameters) {
    throw new ValidationError('parameters is required', 'parameters');
  }
  validateObject(req.parameters, 'parameters');
}

/**
 * Validate MCP deployment request
 */
export function validateDeploymentRequest(
  request: unknown
): asserts request is { name: string; source: Record<string, unknown>; category: string } {
  validateObject(request, 'request');

  const req = request as Record<string, unknown>;

  if (!req.name) {
    throw new ValidationError('name is required', 'name');
  }
  validateNonEmptyString(req.name, 'name');

  if (!req.source) {
    throw new ValidationError('source is required', 'source');
  }
  validateObject(req.source, 'source');

  const source = req.source as Record<string, unknown>;
  if (!source.type) {
    throw new ValidationError('source.type is required', 'source.type');
  }

  if (!req.category) {
    throw new ValidationError('category is required', 'category');
  }
  validateNonEmptyString(req.category, 'category');
}
