/**
 * FAISS index wrapper for vector similarity search
 */

import { IndexFlatL2 } from 'faiss-node';
import { promises as fs } from 'fs';
import { FAISSError } from '../errors/gateway-errors';
import { logger, logFAISSMetrics } from '../logging/logger';
import { SearchResult, FAISSIndexConfig } from '../types/routing.types';

export class FAISSIndex {
  private _index: IndexFlatL2 | null = null;
  private readonly _config: FAISSIndexConfig;
  private _idMap: Map<number, string> = new Map();

  constructor(config: FAISSIndexConfig) {
    this._config = config;
  }

  /**
   * Initialize FAISS index
   * Loads from disk if exists, creates new otherwise
   */
  async initialize(): Promise<void> {
    try {
      const exists = await this._indexFileExists();

      if (exists) {
        await this._loadIndex();
        logger.info('FAISS index loaded', {
          indexPath: this._config.indexPath,
          dimension: this._config.dimension,
          totalVectors: this._index?.ntotal() || 0
        });
      } else {
        await this._createIndex();
        logger.info('FAISS index created', {
          indexPath: this._config.indexPath,
          dimension: this._config.dimension,
          indexType: this._config.indexType || 'Flat'
        });
      }
    } catch (error) {
      throw new FAISSError(
        'Failed to initialize FAISS index',
        'initialize',
        error as Error
      );
    }
  }

  /**
   * Add vectors to the index
   */
  async add(embeddings: number[][], ids: string[]): Promise<void> {
    if (!this._index) {
      throw new FAISSError('Index not initialized', 'add');
    }

    if (embeddings.length !== ids.length) {
      throw new FAISSError(
        'Number of embeddings must match number of IDs',
        'add'
      );
    }

    try {
      const startIdx = this._index.ntotal();

      // Flatten embeddings to flat array as expected by FAISS
      const vectors = embeddings.flat();

      this._index.add(vectors);

      // Update ID mapping
      ids.forEach((id, idx) => {
        this._idMap.set(startIdx + idx, id);
      });

      logger.debug('Added vectors to FAISS index', {
        count: embeddings.length,
        totalVectors: this._index.ntotal()
      });
    } catch (error) {
      throw new FAISSError(
        'Failed to add vectors to index',
        'add',
        error as Error
      );
    }
  }

  /**
   * Search for k nearest neighbors
   */
  async search(
    queryEmbedding: number[],
    k: number = 5,
    threshold?: number
  ): Promise<SearchResult[]> {
    if (!this._index) {
      throw new FAISSError('Index not initialized', 'search');
    }

    const startTime = Date.now();

    try {
      // Perform search (FAISS expects number[])
      const result = this._index.search(queryEmbedding, k);

      const searchResults: SearchResult[] = [];

      for (let i = 0; i < result.labels.length; i++) {
        const idx = result.labels[i];
        const distance = result.distances[i];

        // Skip invalid results
        if (idx === -1) continue;

        // Convert L2 distance to similarity score (0-1)
        const score = this._distanceToScore(distance);

        // Apply threshold if provided
        if (threshold && score < threshold) continue;

        const id = this._idMap.get(idx);
        if (id) {
          searchResults.push({ id, score, distance });
        }
      }

      const latency = Date.now() - startTime;

      logFAISSMetrics({
        operation: 'search',
        queryDimension: queryEmbedding.length,
        k,
        latency,
        resultsFound: searchResults.length
      });

      return searchResults;
    } catch (error) {
      throw new FAISSError(
        'Failed to search FAISS index',
        'search',
        error as Error
      );
    }
  }

  /**
   * Save index to disk
   */
  async save(): Promise<void> {
    if (!this._index) {
      throw new FAISSError('Index not initialized', 'save');
    }

    try {
      // Save FAISS index
      this._index.write(this._config.indexPath);

      // Save ID mapping
      const mapPath = `${this._config.indexPath}.map`;
      const mapData = JSON.stringify(Array.from(this._idMap.entries()));
      await fs.writeFile(mapPath, mapData, 'utf-8');

      logger.info('FAISS index saved', {
        indexPath: this._config.indexPath,
        totalVectors: this._index.ntotal()
      });
    } catch (error) {
      throw new FAISSError(
        'Failed to save FAISS index',
        'save',
        error as Error
      );
    }
  }

  /**
   * Get total number of vectors in index
   */
  get size(): number {
    return this._index?.ntotal() || 0;
  }

  /**
   * Get index dimension
   */
  get dimension(): number {
    return this._config.dimension;
  }

  /**
   * Check if index file exists
   */
  private async _indexFileExists(): Promise<boolean> {
    try {
      await fs.access(this._config.indexPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load index from disk
   */
  private async _loadIndex(): Promise<void> {
    const indexType = this._config.indexType || 'Flat';

    if (indexType === 'Flat') {
      this._index = IndexFlatL2.read(this._config.indexPath);
    } else {
      throw new FAISSError(`Unsupported index type: ${indexType}. Only 'Flat' is currently supported.`, 'load');
    }

    // Load ID mapping
    const mapPath = `${this._config.indexPath}.map`;
    try {
      const mapData = await fs.readFile(mapPath, 'utf-8');
      const entries = JSON.parse(mapData) as [number, string][];
      this._idMap = new Map(entries);
    } catch (error) {
      logger.warn('Failed to load ID mapping, starting with empty map', {
        error: (error as Error).message
      });
      this._idMap = new Map();
    }
  }

  /**
   * Create new index
   */
  private async _createIndex(): Promise<void> {
    const indexType = this._config.indexType || 'Flat';

    if (indexType === 'Flat') {
      this._index = new IndexFlatL2(this._config.dimension);
    } else {
      throw new FAISSError(`Unsupported index type: ${indexType}. Only 'Flat' is currently supported.`, 'create');
    }

    this._idMap = new Map();
  }

  /**
   * Convert L2 distance to similarity score (0-1)
   * Using inverse square root transformation
   */
  private _distanceToScore(distance: number): number {
    return 1 / (1 + Math.sqrt(distance));
  }
}
