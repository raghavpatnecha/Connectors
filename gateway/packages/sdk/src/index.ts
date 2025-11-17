/**
 * Connectors SDK - TypeScript SDK for the Connectors Platform
 *
 * @packageDocumentation
 */

// Main client
export { Connectors } from './Connectors';

// Type exports
export type {
  // Config types
  ConnectorsConfig,
  HealthStatus,
  // Tool types
  Tool,
  ToolSelectionRequest,
  ToolSelectionResponse,
  ToolInvocationRequest,
  ToolInvocationResponse,
  ToolListRequest,
  ToolListResponse,
  // MCP types
  MCPServerInfo,
  DeploymentSource,
  MCPDeploymentRequest,
  DeploymentStatus,
  MCPServerListResponse,
} from './types';

// Error exports
export {
  HTTPError,
  TimeoutError,
  RetryableError,
} from './utils/http-client';

export { ValidationError } from './utils/validation';

// Version
export const VERSION = '0.1.0';
