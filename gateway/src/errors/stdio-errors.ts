/**
 * Error classes for STDIO wrapper operations
 */

import { GatewayError } from './gateway-errors';

/**
 * Process crashed or failed to start
 */
export class ProcessCrashedError extends GatewayError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'ProcessCrashedError';
  }
}

/**
 * JSON-RPC protocol error from MCP server
 */
export class JSONRPCProtocolError extends GatewayError {
  constructor(
    message: string,
    public readonly code: number,
    public readonly data?: unknown,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'JSONRPCProtocolError';
  }
}

/**
 * Request timeout error
 */
export class TimeoutError extends GatewayError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'TimeoutError';
  }
}

/**
 * Invalid or malformed JSON-RPC response
 */
export class InvalidResponseError extends GatewayError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'InvalidResponseError';
  }
}

/**
 * Maximum restart attempts exceeded
 */
export class MaxRestartsExceededError extends GatewayError {
  constructor(
    message: string,
    public readonly maxRestarts: number,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'MaxRestartsExceededError';
  }
}

/**
 * Port allocation failed
 */
export class PortAllocationError extends GatewayError {
  constructor(
    message: string,
    public readonly requestedPort?: number,
    cause?: Error
  ) {
    super(message, cause);
    this.name = 'PortAllocationError';
  }
}
