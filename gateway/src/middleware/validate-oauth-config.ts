/**
 * OAuth Configuration Validation Middleware
 * Connectors Platform - Input validation for tenant OAuth configs
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../logging/logger';
import { CreateOAuthConfigRequest } from '../auth/types';

/**
 * Validation error response
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate OAuth configuration request body
 *
 * Checks:
 * - Required fields are present
 * - URLs are valid
 * - Client credentials are non-empty
 * - Scopes are valid strings
 */
export function validateOAuthConfig(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors: ValidationError[] = [];
  const config = req.body as Partial<CreateOAuthConfigRequest>;

  // Check required fields
  const requiredFields: Array<keyof CreateOAuthConfigRequest> = [
    'clientId',
    'clientSecret',
    'redirectUri',
    'authEndpoint',
    'tokenEndpoint'
  ];

  for (const field of requiredFields) {
    if (!config[field] || typeof config[field] !== 'string' || config[field]!.trim() === '') {
      errors.push({
        field,
        message: `${field} is required and must be a non-empty string`
      });
    }
  }

  // If required fields are missing, return early
  if (errors.length > 0) {
    logger.warn('OAuth config validation failed', {
      errors,
      tenantId: req.params.tenantId,
      integration: req.params.integration
    });

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
    return;
  }

  // Validate URLs
  const urlFields: Array<keyof CreateOAuthConfigRequest> = [
    'redirectUri',
    'authEndpoint',
    'tokenEndpoint'
  ];

  for (const field of urlFields) {
    const value = config[field];
    if (value && typeof value === 'string') {
      try {
        const url = new URL(value);
        // Check for valid protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push({
            field,
            message: `${field} must use http or https protocol`
          });
        }
      } catch {
        errors.push({
          field,
          message: `${field} must be a valid URL`
        });
      }
    }
  }

  // Validate client credentials length
  if (config.clientId && config.clientId.length < 8) {
    errors.push({
      field: 'clientId',
      message: 'clientId must be at least 8 characters'
    });
  }

  if (config.clientSecret && config.clientSecret.length < 16) {
    errors.push({
      field: 'clientSecret',
      message: 'clientSecret must be at least 16 characters'
    });
  }

  // Validate scopes (if provided)
  if (config.scopes !== undefined) {
    if (!Array.isArray(config.scopes)) {
      errors.push({
        field: 'scopes',
        message: 'scopes must be an array of strings'
      });
    } else {
      const invalidScopes = config.scopes.filter(
        scope => typeof scope !== 'string' || scope.trim() === ''
      );
      if (invalidScopes.length > 0) {
        errors.push({
          field: 'scopes',
          message: 'All scopes must be non-empty strings'
        });
      }
    }
  }

  // Validate additionalParams (if provided)
  if (config.additionalParams !== undefined) {
    if (typeof config.additionalParams !== 'object' || config.additionalParams === null) {
      errors.push({
        field: 'additionalParams',
        message: 'additionalParams must be an object'
      });
    } else {
      // Check all values are strings
      const invalidParams = Object.entries(config.additionalParams).filter(
        ([_, value]) => typeof value !== 'string'
      );
      if (invalidParams.length > 0) {
        errors.push({
          field: 'additionalParams',
          message: 'All additionalParams values must be strings'
        });
      }
    }
  }

  // Sanitize inputs (trim whitespace, remove potentially dangerous characters)
  if (errors.length === 0) {
    config.clientId = config.clientId?.trim();
    config.clientSecret = config.clientSecret?.trim();
    config.redirectUri = config.redirectUri?.trim();
    config.authEndpoint = config.authEndpoint?.trim();
    config.tokenEndpoint = config.tokenEndpoint?.trim();

    if (config.scopes) {
      config.scopes = config.scopes.map(scope => scope.trim());
    }

    // Update request body with sanitized config
    req.body = config;
  }

  // Return errors if any
  if (errors.length > 0) {
    logger.warn('OAuth config validation failed', {
      errors,
      tenantId: req.params.tenantId,
      integration: req.params.integration
    });

    res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
    return;
  }

  // Validation passed
  logger.debug('OAuth config validation passed', {
    tenantId: req.params.tenantId,
    integration: req.params.integration
  });

  next();
}

/**
 * Validate tenant ID parameter
 */
export function validateTenantId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { tenantId } = req.params;

  if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
    logger.warn('Invalid tenant ID', { tenantId });
    res.status(400).json({
      success: false,
      error: 'Invalid tenant ID',
      message: 'Tenant ID is required and must be a non-empty string'
    });
    return;
  }

  // Validate format (alphanumeric, hyphens, underscores only)
  if (!/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
    logger.warn('Invalid tenant ID format', { tenantId });
    res.status(400).json({
      success: false,
      error: 'Invalid tenant ID format',
      message: 'Tenant ID must contain only alphanumeric characters, hyphens, and underscores'
    });
    return;
  }

  next();
}

/**
 * Validate integration name parameter
 */
export function validateIntegration(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { integration } = req.params;

  if (!integration || typeof integration !== 'string' || integration.trim() === '') {
    logger.warn('Invalid integration name', { integration });
    res.status(400).json({
      success: false,
      error: 'Invalid integration name',
      message: 'Integration name is required and must be a non-empty string'
    });
    return;
  }

  // Validate format (lowercase alphanumeric and hyphens only)
  if (!/^[a-z0-9-]+$/.test(integration)) {
    logger.warn('Invalid integration name format', { integration });
    res.status(400).json({
      success: false,
      error: 'Invalid integration name format',
      message: 'Integration name must contain only lowercase alphanumeric characters and hyphens'
    });
    return;
  }

  next();
}

/**
 * Combined validation middleware for tenant and integration
 */
export const validateTenantAndIntegration = [
  validateTenantId,
  validateIntegration
];
