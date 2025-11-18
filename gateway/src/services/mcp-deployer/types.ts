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

/**
 * GitHub Service Types
 */

/**
 * GitHub clone configuration
 */
export interface GitHubCloneConfig {
  url: string;
  branch?: string;
  auth?: {
    type: 'token';
    token: string;
  };
  deploymentId: string;
}

/**
 * Clone result
 */
export interface CloneResult {
  repoPath: string;
  commitHash: string;
  branch: string;
  size: number; // bytes
}

/**
 * MCP server type detection result
 */
export interface MCPServerType {
  type: 'node' | 'python' | 'docker' | 'unknown';
  entrypoint?: string;
  packageManager?: 'npm' | 'yarn' | 'pip' | 'poetry';
}

/**
 * MCP server metadata extracted from repository
 */
export interface MCPMetadata {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  license?: string;
  dependencies?: string[];
}

/**
 * Docker Builder Types
 */

/**
 * Docker build configuration
 */
export interface DockerBuildConfig {
  repoPath: string;
  serverType: MCPServerType;
  deploymentId: string;
  metadata: MCPMetadata;
  registry?: string; // Optional: push to registry after build
}

/**
 * Docker build result
 */
export interface BuildResult {
  imageTag: string;
  imageId: string;
  size: number; // bytes
  buildTime: number; // milliseconds
  warnings?: string[];
}

/**
 * Docker build output (internal)
 */
export interface BuildOutput {
  imageId: string;
  size: number;
  warnings: string[];
}

/**
 * Kubernetes Deployment Types
 */

/**
 * K8s deployment configuration
 */
export interface K8sDeploymentConfig {
  name: string;
  deploymentId: string;
  imageTag: string;
  metadata: MCPMetadata;
  replicas?: number; // Default: 1
  resources?: {
    requests?: { memory: string; cpu: string };
    limits?: { memory: string; cpu: string };
  };
  env?: Record<string, string>;
}

/**
 * K8s deployment result
 */
export interface DeploymentResult {
  deploymentName: string;
  serviceName: string;
  namespace: string;
  endpoint: string; // http://mcp-{deploymentId}-svc.mcp-servers.svc.cluster.local
  podIP?: string;
}

/**
 * K8s deployment status
 */
export interface K8sDeploymentStatus {
  status: 'pending' | 'running' | 'failed' | 'terminating';
  readyReplicas: number;
  availableReplicas: number;
  podIP?: string;
  endpoint?: string;
  restartCount?: number;
  lastError?: string;
}
