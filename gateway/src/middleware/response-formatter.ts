/**
 * Response Formatter Middleware
 *
 * Extends Express Response with helper methods for consistent API responses.
 * All responses follow the StandardResponse format with success/error structure.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type {
  StandardSuccessResponse,
  StandardErrorResponse,
  ResponseMetadata,
} from '../types/api-responses';

/**
 * Extend Express Response with formatting helpers
 */
declare global {
  namespace Express {
    interface Response {
      /**
       * Send a successful response with standardized format
       *
       * @param data - The response data
       * @param statusCode - HTTP status code (default: 200)
       */
      sendSuccess<T>(data: T, statusCode?: number): void;

      /**
       * Send an error response with standardized format
       *
       * @param code - Error code for programmatic handling
       * @param message - Human-readable error message
       * @param context - Additional error context
       * @param statusCode - HTTP status code (default: 400)
       */
      sendError(
        code: string,
        message: string,
        context?: Record<string, any>,
        statusCode?: number
      ): void;
    }
  }
}

/**
 * Response formatting middleware
 *
 * Adds sendSuccess() and sendError() helper methods to Express Response.
 * Automatically generates request IDs and includes metadata in all responses.
 */
export function responseFormatterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate or retrieve request ID
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();

  // Store request ID for logging
  (req as any).requestId = requestId;

  /**
   * Send success response
   */
  res.sendSuccess = function <T>(data: T, statusCode: number = 200): void {
    const response: StandardSuccessResponse<T> = {
      success: true,
      data,
      metadata: createMetadata(requestId),
    };
    this.status(statusCode).json(response);
  };

  /**
   * Send error response
   */
  res.sendError = function (
    code: string,
    message: string,
    context?: Record<string, any>,
    statusCode: number = 400
  ): void {
    const response: StandardErrorResponse = {
      success: false,
      error: {
        code,
        message,
        context,
      },
      metadata: createMetadata(requestId),
    };
    this.status(statusCode).json(response);
  };

  next();
}

/**
 * Create response metadata
 */
function createMetadata(requestId: string): ResponseMetadata {
  return {
    timestamp: new Date().toISOString(),
    requestId,
    version: '1.0.0',
  };
}
