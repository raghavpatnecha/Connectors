/**
 * Neo4j Configuration and Connection Management
 */

import neo4j, { Driver, Session, auth } from 'neo4j-driver';
import { logger } from '../logging/logger';

/**
 * Neo4j connection configuration
 */
export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database?: string;
  maxConnectionPoolSize?: number;
  connectionAcquisitionTimeout?: number;
  connectionTimeout?: number;
  maxTransactionRetryTime?: number;
  encrypted?: boolean;
}

/**
 * Default Neo4j configuration
 */
export const DEFAULT_NEO4J_CONFIG: Partial<Neo4jConfig> = {
  database: 'neo4j',
  maxConnectionPoolSize: 50,
  connectionAcquisitionTimeout: 60000, // 60 seconds
  connectionTimeout: 30000, // 30 seconds
  maxTransactionRetryTime: 30000, // 30 seconds
  encrypted: false
};

/**
 * Neo4j Connection Pool Manager
 */
export class Neo4jConnectionPool {
  private static _instance: Neo4jConnectionPool;
  private _driver: Driver | null = null;
  private _config: Neo4jConfig | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): Neo4jConnectionPool {
    if (!Neo4jConnectionPool._instance) {
      Neo4jConnectionPool._instance = new Neo4jConnectionPool();
    }
    return Neo4jConnectionPool._instance;
  }

  /**
   * Initialize connection pool
   */
  initialize(config: Neo4jConfig): void {
    if (this._driver) {
      throw new Error('Neo4j connection pool already initialized');
    }

    this._config = { ...DEFAULT_NEO4J_CONFIG, ...config } as Neo4jConfig;

    this._driver = neo4j.driver(
      this._config.uri,
      auth.basic(this._config.username, this._config.password),
      {
        maxConnectionPoolSize: this._config.maxConnectionPoolSize,
        connectionAcquisitionTimeout: this._config.connectionAcquisitionTimeout,
        connectionTimeout: this._config.connectionTimeout,
        maxTransactionRetryTime: this._config.maxTransactionRetryTime,
        encrypted: this._config.encrypted ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
        disableLosslessIntegers: true // Use native JavaScript numbers
      }
    );
  }

  /**
   * Get Neo4j driver
   */
  getDriver(): Driver {
    if (!this._driver) {
      throw new Error('Neo4j connection pool not initialized. Call initialize() first.');
    }
    return this._driver;
  }

  /**
   * Create a new session
   */
  getSession(database?: string): Session {
    const driver = this.getDriver();
    return driver.session({
      database: database || this._config?.database || 'neo4j',
      defaultAccessMode: neo4j.session.WRITE
    });
  }

  /**
   * Verify connectivity
   */
  async verifyConnectivity(): Promise<boolean> {
    const driver = this.getDriver();
    try {
      await driver.verifyConnectivity();
      return true;
    } catch (error) {
      logger.error('Neo4j connectivity check failed', { error });
      return false;
    }
  }

  /**
   * Get connection pool metrics
   */
  async getMetrics(): Promise<Record<string, unknown>> {
    // Note: Neo4j driver doesn't expose detailed metrics by default
    // This is a placeholder for future custom metrics implementation
    return {
      isConnected: await this.verifyConnectivity(),
      config: {
        uri: this._config?.uri,
        database: this._config?.database,
        maxPoolSize: this._config?.maxConnectionPoolSize
      }
    };
  }

  /**
   * Close connection pool
   */
  async close(): Promise<void> {
    if (this._driver) {
      await this._driver.close();
      this._driver = null;
      this._config = null;
    }
  }

  /**
   * Execute query with automatic session management
   */
  async executeQuery<T>(
    query: string,
    params: Record<string, unknown> = {},
    database?: string
  ): Promise<T[]> {
    const session = this.getSession(database);
    try {
      const result = await session.run(query, params);
      return result.records.map(record => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  /**
   * Execute write transaction with retry logic
   */
  async executeWriteTransaction<T>(
    work: (txc: any) => Promise<T>,
    database?: string
  ): Promise<T> {
    const session = this.getSession(database);
    try {
      return await session.executeWrite(work);
    } finally {
      await session.close();
    }
  }

  /**
   * Execute read transaction
   */
  async executeReadTransaction<T>(
    work: (txc: any) => Promise<T>,
    database?: string
  ): Promise<T> {
    const session = this.getSession(database);
    try {
      return await session.executeRead(work);
    } finally {
      await session.close();
    }
  }
}

/**
 * Initialize Neo4j from environment variables
 */
export function initializeFromEnv(): void {
  // Require password to be set explicitly - no weak defaults
  const password = process.env.NEO4J_PASSWORD;
  if (!password) {
    throw new Error(
      'NEO4J_PASSWORD environment variable is required. ' +
      'Do not use weak default passwords in production.'
    );
  }

  const config: Neo4jConfig = {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password,
    database: process.env.NEO4J_DATABASE || 'neo4j',
    encrypted: process.env.NEO4J_ENCRYPTED === 'true'
  };

  Neo4jConnectionPool.getInstance().initialize(config);
}

/**
 * Get Neo4j connection pool instance
 */
export function getConnectionPool(): Neo4jConnectionPool {
  return Neo4jConnectionPool.getInstance();
}
