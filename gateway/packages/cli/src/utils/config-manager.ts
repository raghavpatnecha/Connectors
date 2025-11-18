import Conf from 'conf';
import { CLIConfig } from '../types';

/**
 * Configuration manager for CLI settings
 * Uses conf package to store config in user's home directory
 */
export class ConfigManager {
  private _config: Conf;

  constructor() {
    this._config = new Conf({
      projectName: 'connectors',
      defaults: {}
    });
  }

  /**
   * Get configuration value by key
   */
  get(key: string): any {
    return this._config.get(key);
  }

  /**
   * Set configuration value
   */
  set(key: string, value: any): void {
    this._config.set(key, value);
  }

  /**
   * Check if configuration key exists
   */
  has(key: string): boolean {
    return this._config.has(key);
  }

  /**
   * Delete configuration key
   */
  delete(key: string): void {
    this._config.delete(key);
  }

  /**
   * Clear all configuration
   */
  clear(): void {
    this._config.clear();
  }

  /**
   * Get all configuration as object
   */
  getAll(): Record<string, any> {
    return this._config.store;
  }

  /**
   * Get CLI configuration (baseURL, tenantId, apiKey)
   */
  getCLIConfig(): CLIConfig | null {
    if (!this.has('baseURL') || !this.has('tenantId')) {
      return null;
    }

    return {
      baseURL: this.get('baseURL'),
      tenantId: this.get('tenantId'),
      apiKey: this.get('apiKey')
    };
  }

  /**
   * Get configuration file path
   */
  getConfigPath(): string {
    return this._config.path;
  }
}
