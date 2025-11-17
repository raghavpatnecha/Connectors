/**
 * Tenant Authorization Middleware
 *
 * Ensures that authenticated requests can only access resources for their own tenant.
 * Prevents cross-tenant data access.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../logging/logger';
import { AuthorizationError } from '../errors/gateway-errors';

/**
 * Middleware to authorize tenant access
 *
 * Validates that the authenticated user (req.auth.tenantId) matches
 * the tenantId in the request (from params or body).
 *
 * Usage:
 *   router.post('/tenants/:tenantId/oauth', authorizeTenant, handler);
 *   router.post('/tools/invoke', authorizeTenant, handler);
 */
export function authorizeTenant(req: Request, res: Response, next: NextFunction): void {
  try {
    // Ensure authentication has occurred
    if (!req.auth) {
      throw new AuthorizationError(
        'Authentication required. This endpoint requires a valid API key.',
        'AUTH_REQUIRED',
        { path: req.path }
      );
    }

    const authenticatedTenantId = req.auth.tenantId;

    // Extract tenant ID from request (check params, body, and query)
    const requestTenantId =
      req.params.tenantId ||
      (req.body && req.body.tenantId) ||
      (req.query && req.query.tenantId as string);

    // If no tenantId in request, allow (might be a global endpoint)
    if (!requestTenantId) {
      logger.debug('No tenant ID in request, skipping tenant authorization', {
        path: req.path,
        authenticatedTenantId,
      });
      next();
      return;
    }

    // Validate tenant ID match
    if (authenticatedTenantId !== requestTenantId) {
      logger.warn('Tenant authorization failed - cross-tenant access attempt', {
        authenticatedTenantId,
        requestedTenantId: requestTenantId,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      throw new AuthorizationError(
        `Access denied. You do not have permission to access resources for tenant: ${requestTenantId}`,
        'CROSS_TENANT_ACCESS_DENIED',
        {
          authenticatedTenantId,
          requestedTenantId: requestTenantId,
          path: req.path,
        }
      );
    }

    logger.debug('Tenant authorization succeeded', {
      tenantId: authenticatedTenantId,
      path: req.path,
    });

    next();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          type: 'AuthorizationError',
          context: error.context,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    } else {
      logger.error('Unexpected error during tenant authorization', {
        error: error instanceof Error ? error.message : String(error),
        path: req.path,
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during authorization',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

/**
 * Middleware factory to require specific scopes
 *
 * @param requiredScopes - Scopes required to access the endpoint
 * @returns Express middleware
 *
 * Usage:
 *   router.post('/admin/users', requireScopes('admin', 'users.write'), handler);
 */
export function requireScopes(...requiredScopes: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Ensure authentication has occurred
      if (!req.auth) {
        throw new AuthorizationError(
          'Authentication required. This endpoint requires a valid API key.',
          'AUTH_REQUIRED',
          { path: req.path }
        );
      }

      const userScopes = req.auth.scopes || [];

      // Check if user has all required scopes
      const missingScopes = requiredScopes.filter(scope => !userScopes.includes(scope));

      if (missingScopes.length > 0) {
        logger.warn('Scope authorization failed - missing required scopes', {
          tenantId: req.auth.tenantId,
          userScopes,
          requiredScopes,
          missingScopes,
          path: req.path,
        });

        throw new AuthorizationError(
          `Access denied. Missing required scopes: ${missingScopes.join(', ')}`,
          'INSUFFICIENT_SCOPES',
          {
            requiredScopes,
            userScopes,
            missingScopes,
          }
        );
      }

      logger.debug('Scope authorization succeeded', {
        tenantId: req.auth.tenantId,
        requiredScopes,
        path: req.path,
      });

      next();
    } catch (error) {
      if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            type: 'AuthorizationError',
            context: error.context,
          },
          metadata: {
            timestamp: new Date().toISOString(),
            path: req.path,
          },
        });
      } else {
        logger.error('Unexpected error during scope authorization', {
          error: error instanceof Error ? error.message : String(error),
          path: req.path,
        });

        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred during authorization',
          },
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  };
}
