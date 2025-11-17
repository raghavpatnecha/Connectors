/**
 * Connectors SDK - TypeScript SDK for the Connectors Platform
 *
 * @packageDocumentation
 */

// Main client
export { Connectors } from './Connectors';

// API classes
export { ToolsAPI } from './ToolsAPI';
export type {
  ToolSelectionOptions,
  ToolListFilters,
  InvokeOptions,
} from './ToolsAPI';

export { MCPRegistry, MCPServer, MCPToolError, MCPConfigError } from './MCPRegistry';

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
  GitHubSource,
  STDIOSource,
  HTTPSource,
  DockerSource,
  MCPDeploymentConfig,
  StandardMCPConfig,
  MCPDeployment,
  MCPIntegration,
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
