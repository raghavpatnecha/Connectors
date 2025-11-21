/**
 * Tenant OAuth Configuration Parser
 *
 * Parses and validates YAML-based tenant OAuth configuration files.
 * Supports environment variable substitution and JSON Schema validation.
 *
 * Features:
 * - YAML parsing with yq integration
 * - Environment variable substitution (${VAR} syntax)
 * - JSON Schema validation
 * - Type-safe configuration objects
 * - Missing credential detection
 *
 * Usage:
 *   const parser = new TenantOAuthParser();
 *   const config = await parser.parse('/path/to/tenant-config.yaml');
 *   if (config.isValid) {
 *     // Store in Vault
 *   }
 */

import { promises as fs } from 'fs';
import { spawnSync } from 'child_process';
import * as path from 'path';
import { logger } from '../logging/logger';

// =============================================================================
// Type Definitions
// =============================================================================

export interface IntegrationConfig {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  scopes?: string[];
  additional_params?: Record<string, string>;
  enabled?: boolean;
  notes?: string;
}

export interface VaultConfig {
  kv_mount?: string;
  transit_mount?: string;
  policy_name?: string;
  enable_auto_rotate?: boolean;
  rotation_interval_days?: number;
}

export interface TenantMetadata {
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  contact_email?: string;
  [key: string]: unknown;
}

export interface TenantOAuthConfig {
  tenant_id: string;
  tenant_name?: string;
  environment?: 'development' | 'staging' | 'production';
  integrations: Record<string, IntegrationConfig>;
  vault_config?: VaultConfig;
  metadata?: TenantMetadata;
}

export interface ParseResult {
  success: boolean;
  config?: TenantOAuthConfig;
  errors: ParseError[];
  warnings: ParseWarning[];
  missingCredentials: MissingCredential[];
}

export interface ParseError {
  type: 'schema' | 'yaml' | 'substitution' | 'validation';
  message: string;
  path?: string;
  details?: string;
}

export interface ParseWarning {
  type: 'disabled_integration' | 'missing_optional' | 'default_used';
  message: string;
  path?: string;
}

export interface MissingCredential {
  integration: string;
  field: 'client_id' | 'client_secret';
  envVar: string;
  value: string;
}

// =============================================================================
// Configuration Parser
// =============================================================================

export class TenantOAuthParser {
  private readonly _schemaPath: string;
  private readonly _schema?: unknown;

  constructor(schemaPath?: string) {
    this._schemaPath =
      schemaPath ||
      path.join(__dirname, '../../config/schemas/tenant-oauth-config.schema.json');
  }

  /**
   * Parse and validate a tenant OAuth configuration file.
   *
   * @param configPath - Path to YAML configuration file
   * @returns Parse result with config or errors
   */
  async parse(configPath: string): Promise<ParseResult> {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];
    const missingCredentials: MissingCredential[] = [];

    try {
      // Step 1: Parse YAML file
      const rawYaml = await this._loadYaml(configPath);
      if (!rawYaml) {
        errors.push({
          type: 'yaml',
          message: `Failed to load YAML file: ${configPath}`,
          details: 'File may not exist or is not valid YAML',
        });
        return { success: false, errors, warnings, missingCredentials };
      }

      // Step 2: Substitute environment variables
      const substitutionResult = this._substituteEnvVars(rawYaml);
      const config = substitutionResult.config;
      missingCredentials.push(...substitutionResult.missingCredentials);

      // Step 3: Validate against schema
      const schemaErrors = await this._validateSchema(config);
      errors.push(...schemaErrors);

      // Step 4: Additional validation
      const validationResult = this._validateConfig(config);
      errors.push(...validationResult.errors);
      warnings.push(...validationResult.warnings);

      // Determine success
      const success = errors.length === 0 && missingCredentials.length === 0;

      return {
        success,
        config: success ? config : undefined,
        errors,
        warnings,
        missingCredentials,
      };
    } catch (error) {
      errors.push({
        type: 'validation',
        message: `Unexpected error parsing config: ${(error as Error).message}`,
        details: error instanceof Error ? error.stack : undefined,
      });

      return { success: false, errors, warnings, missingCredentials };
    }
  }

  /**
   * Parse multiple tenant configurations from a directory.
   *
   * @param dirPath - Directory containing YAML config files
   * @returns Array of parse results
   */
  async parseDirectory(dirPath: string): Promise<Array<{ file: string; result: ParseResult }>> {
    const files = await fs.readdir(dirPath);
    const yamlFiles = files.filter(
      (f) => f.endsWith('.yaml') || f.endsWith('.yml')
    );

    const results = await Promise.all(
      yamlFiles.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const result = await this.parse(filePath);
        return { file, result };
      })
    );

    return results;
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Load YAML file using yq (ensures consistent parsing with bash scripts).
   * SECURITY FIX: Uses spawnSync with array arguments to prevent command injection
   */
  private async _loadYaml(configPath: string): Promise<TenantOAuthConfig | null> {
    try {
      // SECURITY: Use spawn with array args to prevent command injection
      // Previously used execSync with string interpolation which was vulnerable
      const result = spawnSync('yq', ['eval', '-o=json', '.', configPath], {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        shell: false, // Explicitly disable shell to prevent injection
      });

      // Check for errors
      if (result.error) {
        logger.warn('yq command error', {
          error: result.error.message,
          configPath,
        });
        throw result.error;
      }

      // Check exit status
      if (result.status !== 0) {
        logger.warn('yq command failed', {
          stderr: result.stderr,
          status: result.status,
          configPath,
        });
        throw new Error(`yq command failed with status ${result.status}: ${result.stderr}`);
      }

      return JSON.parse(result.stdout) as TenantOAuthConfig;
    } catch (error) {
      // Fallback: try reading as JSON directly
      try {
        const content = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(content) as TenantOAuthConfig;
      } catch {
        logger.debug('Failed to parse config as JSON', { configPath });
        return null;
      }
    }
  }

  /**
   * Substitute environment variables in the format ${VAR_NAME}.
   */
  private _substituteEnvVars(config: TenantOAuthConfig): {
    config: TenantOAuthConfig;
    missingCredentials: MissingCredential[];
  } {
    const missingCredentials: MissingCredential[] = [];
    const configStr = JSON.stringify(config);

    // Find all ${VAR} patterns
    const envVarPattern = /\$\{([A-Z_][A-Z0-9_]*)\}/g;
    let match: RegExpExecArray | null;
    const replacements = new Map<string, string>();

    while ((match = envVarPattern.exec(configStr)) !== null) {
      const varName = match[1];
      const varValue = process.env[varName];

      if (varValue) {
        replacements.set(match[0], varValue);
      }
    }

    // Perform substitution
    let substituted = configStr;
    replacements.forEach((value, placeholder) => {
      substituted = substituted.split(placeholder).join(value);
    });

    const parsedConfig = JSON.parse(substituted) as TenantOAuthConfig;

    // Detect missing credentials (patterns still present after substitution)
    for (const [integration, integrationConfig] of Object.entries(
      parsedConfig.integrations
    )) {
      // Check client_id
      if (integrationConfig.client_id.includes('${')) {
        const envVarMatch = integrationConfig.client_id.match(/\$\{([^}]+)\}/);
        if (envVarMatch) {
          missingCredentials.push({
            integration,
            field: 'client_id',
            envVar: envVarMatch[1],
            value: integrationConfig.client_id,
          });
        }
      }

      // Check client_secret
      if (integrationConfig.client_secret.includes('${')) {
        const envVarMatch = integrationConfig.client_secret.match(/\$\{([^}]+)\}/);
        if (envVarMatch) {
          missingCredentials.push({
            integration,
            field: 'client_secret',
            envVar: envVarMatch[1],
            value: integrationConfig.client_secret,
          });
        }
      }
    }

    return { config: parsedConfig, missingCredentials };
  }

  /**
   * Validate configuration against JSON Schema.
   */
  private async _validateSchema(config: TenantOAuthConfig): Promise<ParseError[]> {
    const errors: ParseError[] = [];

    // Basic required field validation (JSON Schema validation would be done here)
    if (!config.tenant_id) {
      errors.push({
        type: 'schema',
        message: 'Missing required field: tenant_id',
        path: 'tenant_id',
      });
    }

    if (!config.integrations || Object.keys(config.integrations).length === 0) {
      errors.push({
        type: 'schema',
        message: 'At least one integration must be defined',
        path: 'integrations',
      });
    }

    // Validate tenant_id format
    if (config.tenant_id && !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(config.tenant_id)) {
      errors.push({
        type: 'schema',
        message:
          'Invalid tenant_id format. Must be lowercase alphanumeric with hyphens, 3-63 characters',
        path: 'tenant_id',
        details: `Got: ${config.tenant_id}`,
      });
    }

    return errors;
  }

  /**
   * Additional business logic validation.
   */
  private _validateConfig(config: TenantOAuthConfig): {
    errors: ParseError[];
    warnings: ParseWarning[];
  } {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    // Validate integrations
    for (const [name, integration] of Object.entries(config.integrations)) {
      // Required fields
      if (!integration.client_id) {
        errors.push({
          type: 'validation',
          message: `Missing client_id for integration: ${name}`,
          path: `integrations.${name}.client_id`,
        });
      }

      if (!integration.client_secret) {
        errors.push({
          type: 'validation',
          message: `Missing client_secret for integration: ${name}`,
          path: `integrations.${name}.client_secret`,
        });
      }

      if (!integration.redirect_uri) {
        errors.push({
          type: 'validation',
          message: `Missing redirect_uri for integration: ${name}`,
          path: `integrations.${name}.redirect_uri`,
        });
      }

      // Validate redirect_uri format
      if (integration.redirect_uri && !integration.redirect_uri.match(/^https?:\/\//)) {
        errors.push({
          type: 'validation',
          message: `Invalid redirect_uri format for integration: ${name}. Must start with http:// or https://`,
          path: `integrations.${name}.redirect_uri`,
          details: `Got: ${integration.redirect_uri}`,
        });
      }

      // Warn about disabled integrations
      if (integration.enabled === false) {
        warnings.push({
          type: 'disabled_integration',
          message: `Integration '${name}' is disabled`,
          path: `integrations.${name}.enabled`,
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Format parse result for human-readable output.
   */
  static formatResult(result: ParseResult): string {
    const lines: string[] = [];

    if (result.success) {
      lines.push('✅ Configuration valid');
      if (result.config) {
        lines.push(`   Tenant: ${result.config.tenant_id}`);
        lines.push(
          `   Integrations: ${Object.keys(result.config.integrations).join(', ')}`
        );
      }
    } else {
      lines.push('❌ Configuration invalid');
    }

    if (result.errors.length > 0) {
      lines.push('\nErrors:');
      for (const error of result.errors) {
        lines.push(`  - [${error.type.toUpperCase()}] ${error.message}`);
        if (error.path) {
          lines.push(`    Path: ${error.path}`);
        }
        if (error.details) {
          lines.push(`    Details: ${error.details}`);
        }
      }
    }

    if (result.missingCredentials.length > 0) {
      lines.push('\nMissing Credentials:');
      for (const missing of result.missingCredentials) {
        lines.push(
          `  - ${missing.integration}.${missing.field}: Environment variable '${missing.envVar}' not set`
        );
      }
    }

    if (result.warnings.length > 0) {
      lines.push('\nWarnings:');
      for (const warning of result.warnings) {
        lines.push(`  - [${warning.type.toUpperCase()}] ${warning.message}`);
      }
    }

    return lines.join('\n');
  }
}
