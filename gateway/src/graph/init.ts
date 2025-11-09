/**
 * GraphRAG Initialization Script
 * Sets up Neo4j schema, indexes, and seed data
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { Neo4jConnectionPool, initializeFromEnv } from './config';
import { logger } from '../logging/logger';

/**
 * Initialize Neo4j graph database
 */
export async function initializeGraphDB(): Promise<void> {
  logger.info('Initializing Neo4j GraphRAG database...');

  // Initialize connection from environment
  initializeFromEnv();

  const pool = Neo4jConnectionPool.getInstance();

  // Verify connectivity
  const isConnected = await pool.verifyConnectivity();
  if (!isConnected) {
    throw new Error('Failed to connect to Neo4j. Check connection settings.');
  }

  logger.info('✓ Neo4j connection established');

  // Run schema initialization
  await runSchemaInit(pool);

  // Run seed data
  await runSeedData(pool);

  logger.info('✓ Neo4j GraphRAG initialization complete');
}

/**
 * Run schema.cypher to create constraints and indexes
 */
async function runSchemaInit(pool: Neo4jConnectionPool): Promise<void> {
  logger.info('Creating schema constraints and indexes...');

  const schemaPath = join(__dirname, 'schema.cypher');
  const schemaContent = await fs.readFile(schemaPath, 'utf-8');

  // Split by statements (separated by semicolons)
  const statements = schemaContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('//'));

  const session = pool.getSession();

  try {
    for (const statement of statements) {
      if (statement.includes('CREATE CONSTRAINT') || statement.includes('CREATE INDEX')) {
        try {
          await session.run(statement);
          logger.info(`  ✓ Executed: ${statement.substring(0, 60)}...`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error instanceof Error && error.message.includes('already exists')) {
            logger.info(`  - Skipped (exists): ${statement.substring(0, 60)}...`);
          } else {
            throw error;
          }
        }
      }
    }

    logger.info('✓ Schema initialization complete');
  } finally {
    await session.close();
  }
}

/**
 * Run seed-data.cypher to populate initial tools and relationships
 */
async function runSeedData(pool: Neo4jConnectionPool): Promise<void> {
  logger.info('Loading seed data...');

  const seedPath = join(__dirname, 'seed-data.cypher');
  const seedContent = await fs.readFile(seedPath, 'utf-8');

  // Split by statements (separated by semicolons or blank lines)
  const statements = seedContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('//'));

  const session = pool.getSession();

  try {
    for (const statement of statements) {
      if (statement.startsWith('MERGE') || statement.startsWith('MATCH')) {
        await session.run(statement);
      }
    }

    // Verify data loaded
    const result = await session.run('MATCH (t:Tool) RETURN count(t) AS toolCount');
    const toolCount = result.records[0]?.get('toolCount') || 0;

    logger.info(`✓ Seed data loaded: ${toolCount} tools created`);
  } finally {
    await session.close();
  }
}

/**
 * Reset database (WARNING: Deletes all data)
 */
export async function resetGraphDB(): Promise<void> {
  logger.info('WARNING: Resetting Neo4j database (deleting all data)...');

  const pool = Neo4jConnectionPool.getInstance();
  const session = pool.getSession();

  try {
    // Delete all nodes and relationships
    await session.run('MATCH (n) DETACH DELETE n');

    logger.info('✓ Database reset complete');
  } finally {
    await session.close();
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const command = process.argv[2];

  (async () => {
    try {
      if (command === 'reset') {
        await resetGraphDB();
        await initializeGraphDB();
      } else {
        await initializeGraphDB();
      }

      process.exit(0);
    } catch (error) {
      logger.error('Initialization failed:', error);
      process.exit(1);
    }
  })();
}
