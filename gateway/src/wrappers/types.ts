/**
 * Type definitions for STDIO-to-HTTP wrapper
 * Handles JSON-RPC 2.0 protocol over stdin/stdout
 */

import type { Tool } from '../types';

// Re-export Tool type for use in wrapper
export type { Tool };

/**
 * STDIO wrapper configuration
 */
export interface STDIOConfig {
  /** Command to execute (e.g., "node", "python") */
  command: string;

  /** Command arguments (e.g., ["server.js", "--port", "3000"]) */
  args: string[];

  /** Environment variables */
  env?: Record<string, string>;

  /** Working directory for the process */
  cwd?: string;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Maximum number of restart attempts */
  maxRestarts?: number;

  /** Heartbeat check interval in milliseconds */
  heartbeatInterval?: number;
}

/**
 * JSON-RPC 2.0 request
 */
export interface JSONRPCRequest {
  /** JSON-RPC version (always "2.0") */
  jsonrpc: '2.0';

  /** Request ID for matching responses */
  id: number;

  /** Method name to invoke */
  method: string;

  /** Method parameters */
  params?: unknown;
}

/**
 * JSON-RPC 2.0 response
 */
export interface JSONRPCResponse {
  /** JSON-RPC version (always "2.0") */
  jsonrpc: '2.0';

  /** Request ID this response corresponds to */
  id: number;

  /** Result data (present if successful) */
  result?: unknown;

  /** Error details (present if failed) */
  error?: JSONRPCError;
}

/**
 * JSON-RPC 2.0 error
 */
export interface JSONRPCError {
  /** Error code */
  code: number;

  /** Error message */
  message: string;

  /** Additional error data */
  data?: unknown;
}

/**
 * JSON-RPC 2.0 notification (no response expected)
 */
export interface JSONRPCNotification {
  /** JSON-RPC version (always "2.0") */
  jsonrpc: '2.0';

  /** Method name */
  method: string;

  /** Method parameters */
  params?: unknown;
}

/**
 * Standard JSON-RPC error codes
 */
export enum JSONRPCErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}

/**
 * Process status information
 */
export interface ProcessStatus {
  /** Whether the process is currently running */
  running: boolean;

  /** Process uptime in seconds */
  uptime: number;

  /** Total number of requests sent */
  requestCount: number;

  /** Total number of errors encountered */
  errorCount: number;

  /** Last restart timestamp (if any) */
  lastRestart?: Date;

  /** Number of times the process has been restarted */
  restartCount: number;

  /** Process ID */
  pid?: number;

  /** Last heartbeat timestamp */
  lastHeartbeat?: Date;
}

/**
 * Pending request tracker
 */
export interface PendingRequest {
  /** Request ID */
  id: number;

  /** Promise resolve function */
  resolve: (value: unknown) => void;

  /** Promise reject function */
  reject: (reason: Error) => void;

  /** Request timestamp */
  timestamp: Date;

  /** Timeout handle */
  timeoutHandle: NodeJS.Timeout;
}

/**
 * MCP tool list response format
 */
export interface MCPToolsListResponse {
  tools: MCPToolDefinition[];
}

/**
 * MCP tool definition format
 */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * MCP tool call request format
 */
export interface MCPToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * MCP tool call response format
 */
export interface MCPToolCallResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}
