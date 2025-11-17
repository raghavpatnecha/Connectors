/**
 * Types for MCP Deployer Service
 * Handles custom MCP server deployments from various sources
 */

/**
 * MCP server source types
 */
export type MCPSourceType = 'github' | 'stdio' | 'http' | 'docker';

/**
 * Deployment status
 */
export type DeploymentStatus = 'pending' | 'deploying' | 'running' | 'failed' | 'stopped';

/**
 * GitHub MCP configuration
 */
export interface GitHubMCPConfig {
  type: 'github';
  url: string;
  branch?: string;
  auth?: {
    type: 'token';
    token: string;
  };
}

/**
 * STDIO MCP configuration
 */
export interface STDIOMCPConfig {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

/**
 * HTTP/SSE MCP configuration
 */
export interface HTTPMCPConfig {
  type: 'http';
  url: string;
  headers?: Record<string, string>;
}

/**
 * Docker MCP configuration
 */
export interface DockerMCPConfig {
  type: 'docker';
  image: string;
  env?: Record<string, string>;
  port?: number;
}

/**
 * Union type for all MCP source configurations
 */
export type MCPSourceConfig = GitHubMCPConfig | STDIOMCPConfig | HTTPMCPConfig | DockerMCPConfig;

/**
 * Request to add a new MCP server
 */
export interface AddMCPServerRequest {
  name: string;
  source: MCPSourceConfig;
  category: string;
  description?: string;
  tenantId?: string;
}

/**
 * Deployment progress tracking
 */
export interface DeploymentProgress {
  clone?: 'pending' | 'in_progress' | 'completed' | 'failed';
  build?: 'pending' | 'in_progress' | 'completed' | 'failed';
  deploy?: 'pending' | 'in_progress' | 'completed' | 'failed';
  discovery?: 'pending' | 'in_progress' | 'completed' | 'failed';
  embeddings?: 'pending' | 'in_progress' | 'completed' | 'failed';
}

/**
 * Deployment information
 */
export interface Deployment {
  deploymentId: string;
  name: string;
  category: string;
  source: MCPSourceConfig;
  status: DeploymentStatus;
  progress: DeploymentProgress;
  createdAt: Date;
  updatedAt: Date;
  endpoint?: string;
  toolsDiscovered?: number;
  error?: string;
  tenantId?: string;
}

/**
 * Custom server information
 */
export interface CustomServerInfo {
  name: string;
  category: string;
  toolCount: number;
  status: DeploymentStatus;
  source: string;
  deployedAt: Date;
  tenantId?: string;
}

/**
 * Deployment status response
 */
export interface DeploymentStatusResponse {
  deploymentId: string;
  status: DeploymentStatus;
  progress: DeploymentProgress;
  toolsDiscovered?: number;
  endpoint?: string;
  error?: string;
  estimatedTime?: string;
}

/**
 * Add MCP server response
 */
export interface AddMCPServerResponse {
  deploymentId: string;
  status: DeploymentStatus;
  estimatedTime: string;
}
