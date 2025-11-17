/**
 * Standard API response formats for consistency across all endpoints
 *
 * All API responses follow a unified structure with:
 * - success: boolean flag indicating success/failure
 * - data/error: response payload or error details
 * - metadata: request tracking and version information
 */

/**
 * Standard success response wrapper
 */
export interface StandardSuccessResponse<T = any> {
  success: true;
  data: T;
  metadata: ResponseMetadata;
}

/**
 * Standard error response wrapper
 */
export interface StandardErrorResponse {
  success: false;
  error: ErrorDetails;
  metadata: ResponseMetadata;
}

/**
 * Error details structure
 */
export interface ErrorDetails {
  /** Error code for programmatic handling (e.g., "TOOL_SELECTION_FAILED") */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional context about the error */
  context?: Record<string, any>;
}

/**
 * Response metadata included in all responses
 */
export interface ResponseMetadata {
  /** ISO timestamp of when the response was generated */
  timestamp: string;
  /** Unique request ID for tracing */
  requestId?: string;
  /** API version */
  version?: string;
}

/**
 * Union type for all standard responses
 */
export type StandardResponse<T = any> = StandardSuccessResponse<T> | StandardErrorResponse;

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: StandardResponse<T>
): response is StandardSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: StandardResponse
): response is StandardErrorResponse {
  return response.success === false;
}

/**
 * Helper function to create success response
 */
export function createSuccessResponse<T>(
  data: T,
  metadata: Partial<ResponseMetadata> = {}
): StandardSuccessResponse<T> {
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...metadata,
    },
  };
}

/**
 * Helper function to create error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  context?: Record<string, any>,
  metadata: Partial<ResponseMetadata> = {}
): StandardErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      context,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...metadata,
    },
  };
}
