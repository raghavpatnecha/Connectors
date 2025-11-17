/**
 * MCP server information
 */
export interface MCPServerInfo {
  /**
   * Unique server name/ID
   */
  name: string;

  /**
   * Server category
   */
  category: string;

  /**
   * Server description
   */
  description?: string;

  /**
   * Server source type
   */
  source: 'built-in' | 'github' | 'stdio' | 'http' | 'docker';

  /**
   * Server endpoint (for custom servers)
   */
  endpoint?: string;

  /**
   * Number of tools provided by this server
   */
  toolCount?: number;

  /**
   * Server status
   */
  status?: 'running' | 'stopped' | 'deploying' | 'error';

  /**
   * Server metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Deployment source configuration
 */
export type DeploymentSource =
  | { type: 'github'; url: string; ref?: string }
  | { type: 'stdio'; command: string; args?: string[] }
  | { type: 'http'; url: string }
  | { type: 'docker'; image: string; tag?: string };

/**
 * MCP server deployment request
 */
export interface MCPDeploymentRequest {
  /**
   * Unique name for the server
   */
  name: string;

  /**
   * Deployment source
   */
  source: DeploymentSource;

  /**
   * Server category
   */
  category: string;

  /**
   * Server description
   */
  description?: string;

  /**
   * Environment variables
   */
  env?: Record<string, string>;

  /**
   * Resource limits
   */
  resources?: {
    cpu?: string;
    memory?: string;
  };

  /**
   * Auto-discover tools after deployment
   * @default true
   */
  autoDiscover?: boolean;
}

/**
 * Deployment status
 */
export interface DeploymentStatus {
  /**
   * Deployment ID
   */
  deploymentId: string;

  /**
   * Server name
   */
  name: string;

  /**
   * Current status
   */
  status: 'pending' | 'cloning' | 'building' | 'deploying' | 'running' | 'failed';

  /**
   * Status message
   */
  message?: string;

  /**
   * Number of tools discovered (if completed)
   */
  toolsDiscovered?: number;

  /**
   * Server endpoint (if running)
   */
  endpoint?: string;

  /**
   * Error information (if failed)
   */
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };

  /**
   * Deployment progress (0-100)
   */
  progress?: number;

  /**
   * Timestamp of last update
   */
  updatedAt: string;
}

/**
 * MCP server list response
 */
export interface MCPServerListResponse {
  servers: MCPServerInfo[];
  total: number;
  custom: number;
  builtin: number;
}

/**
 * GitHub source configuration
 */
export interface GitHubSource {
  type: 'github';
  url: string;
  ref?: string;
  branch?: string;
}

/**
 * STDIO source configuration
 */
export interface STDIOSource {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

/**
 * HTTP source configuration
 */
export interface HTTPSource {
  type: 'http';
  url: string;
}

/**
 * Docker source configuration
 */
export interface DockerSource {
  type: 'docker';
  image: string;
  tag?: string;
}

/**
 * MCP deployment configuration
 */
export interface MCPDeploymentConfig {
  name: string;
  source: GitHubSource | STDIOSource | HTTPSource | DockerSource;
  category: string;
  description?: string;
  tenantId?: string;
  env?: Record<string, string>;
  autoDiscover?: boolean;
}

/**
 * Standard MCP server configuration (from mcp.json format)
 */
export interface StandardMCPConfig {
  mcpServers: {
    [name: string]: {
      command?: string;
      args?: string[];
      env?: Record<string, string>;
      url?: string;
      transport?: 'stdio' | 'sse' | 'http';
    };
  };
}

/**
 * MCP deployment response
 */
export interface MCPDeployment {
  deploymentId: string;
  name: string;
  status: 'pending' | 'deploying' | 'running' | 'failed';
  estimatedTime?: string;
  message?: string;
}

/**
 * MCP integration summary
 */
export interface MCPIntegration {
  name: string;
  category: string;
  toolCount: number;
  tools: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}
