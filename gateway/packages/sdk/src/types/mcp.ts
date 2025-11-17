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
