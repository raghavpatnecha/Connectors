/**
 * CLI Configuration types
 */

export interface CLIConfig {
  baseURL: string;
  tenantId: string;
  apiKey?: string;
}

export interface MCPAddOptions {
  name?: string;
  source?: 'github' | 'stdio' | 'http' | 'docker';
  url?: string;
  category?: string;
}

export interface MCPListOptions {
  category?: string;
}

export interface ToolsSearchOptions {
  max: string;
}

export interface ConfigOptions {
  show?: boolean;
  edit?: boolean;
}

export interface DeploymentProgress {
  phase: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
}
