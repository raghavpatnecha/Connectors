/**
 * Embedding generation service supporting OpenAI and local models
 */

import { OpenAI } from 'openai';
import { EmbeddingError } from '../errors/gateway-errors';
import { logger, logEmbeddingMetrics } from '../logging/logger';
import { EmbeddingOptions } from '../types/routing.types';

const DEFAULT_OPENAI_MODEL = 'text-embedding-3-small';
const DEFAULT_DIMENSIONS = 1536;
const DEFAULT_BATCH_SIZE = 100;

export class EmbeddingService {
  private readonly _options: Required<EmbeddingOptions>;
  private _openaiClient?: OpenAI;

  constructor(options: EmbeddingOptions = {}) {
    this._options = {
      model: options.model || 'openai',
      openaiModel: options.openaiModel || DEFAULT_OPENAI_MODEL,
      dimensions: options.dimensions || DEFAULT_DIMENSIONS,
      batchSize: options.batchSize || DEFAULT_BATCH_SIZE
    };

    if (this._options.model === 'openai') {
      this._initializeOpenAI();
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const startTime = Date.now();

    try {
      let embeddings: number[][];

      if (this._options.model === 'openai') {
        embeddings = await this._generateOpenAIEmbeddings(texts);
      } else {
        embeddings = await this._generateLocalEmbeddings(texts);
      }

      const latency = Date.now() - startTime;

      logEmbeddingMetrics({
        textCount: texts.length,
        model: this._options.model,
        latency,
        cacheHit: false
      });

      return embeddings;
    } catch (error) {
      throw new EmbeddingError(
        'Failed to generate embeddings',
        texts.join(', ').substring(0, 100),
        this._options.model,
        error as Error
      );
    }
  }

  /**
   * Generate single embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0];
  }

  /**
   * Get embedding dimensions
   */
  get dimensions(): number {
    return this._options.dimensions;
  }

  /**
   * Initialize OpenAI client
   */
  private _initializeOpenAI(): void {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new EmbeddingError(
        'OPENAI_API_KEY environment variable is required for OpenAI embeddings',
        '',
        'openai'
      );
    }

    this._openaiClient = new OpenAI({ apiKey });
  }

  /**
   * Generate embeddings using OpenAI API
   */
  private async _generateOpenAIEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this._openaiClient) {
      throw new EmbeddingError(
        'OpenAI client not initialized',
        '',
        'openai'
      );
    }

    const embeddings: number[][] = [];

    // Process in batches to respect API limits
    for (let i = 0; i < texts.length; i += this._options.batchSize) {
      const batch = texts.slice(i, i + this._options.batchSize);

      const response = await this._openaiClient.embeddings.create({
        model: this._options.openaiModel,
        input: batch,
        dimensions: this._options.dimensions
      });

      const batchEmbeddings = response.data.map((item: { embedding: number[] }) => item.embedding);
      embeddings.push(...batchEmbeddings);
    }

    return embeddings;
  }

  /**
   * Generate embeddings using local model
   * TODO: Implement using sentence-transformers or similar
   */
  private async _generateLocalEmbeddings(texts: string[]): Promise<number[][]> {
    // Placeholder: Generate random embeddings for now
    // In production, use sentence-transformers via Python bridge or TensorFlow.js
    logger.warn('Local embeddings not implemented, using random vectors');

    return texts.map(() => {
      const embedding = new Array(this._options.dimensions);
      for (let i = 0; i < this._options.dimensions; i++) {
        embedding[i] = Math.random() * 2 - 1;
      }
      // Normalize
      const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      return embedding.map(val => val / norm);
    });
  }

  /**
   * Create embedding from tool metadata
   */
  createToolEmbeddingText(tool: {
    name: string;
    description: string;
    category: string;
  }): string {
    return `${tool.category}: ${tool.name} - ${tool.description}`;
  }

  /**
   * Create embedding from category metadata
   */
  createCategoryEmbeddingText(category: {
    name: string;
    description: string;
    examples?: string[];
  }): string {
    const examples = category.examples?.join(', ') || '';
    return `Category: ${category.name} - ${category.description}. Examples: ${examples}`;
  }
}
