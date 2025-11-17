/**
 * ToolsAPI - Tool selection, listing, and invocation
 */

import { HTTPClient } from './utils/http-client';
import { ValidationError } from './utils/validation';
import type { ConnectorsConfig } from './types/config';
import type {
  Tool,
  ToolSelectionRequest,
  ToolSelectionResponse,
  ToolListResponse,
  ToolInvocationRequest,
  ToolInvocationResponse,
} from './types/tools';

/**
 * Options for tool selection
 */
export interface ToolSelectionOptions {
  /**
   * Maximum number of tools to select
   * @default 5
   */
  maxTools?: number;

  /**
   * Filter by specific categories
   */
  categories?: string[];

  /**
   * Token budget for tool schemas
   * @default 3000
   */
  tokenBudget?: number;

  /**
   * Additional context for selection
   */
  context?: Record<string, unknown>;
}

/**
 * Filters for listing tools
 */
export interface ToolListFilters {
  /**
   * Filter by category
   */
  category?: string;

  /**
   * Filter by integration
   */
  integration?: string;

  /**
   * Search query
   */
  search?: string;

  /**
   * Page number (1-indexed)
   * @default 1
   */
  page?: number;

  /**
   * Items per page
   * @default 50
   */
  limit?: number;
}

/**
 * Options for tool invocation
 */
export interface InvokeOptions {
  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Override tenant ID from config
   */
  tenantId?: string;

  /**
   * Override integration name (auto-detected from toolId)
   */
  integration?: string;
}

/**
 * ToolsAPI - Manage tool selection and invocation
 *
 * @example
 * ```typescript
 * const connectors = new Connectors({ ... });
 *
 * // Select tools semantically
 * const tools = await connectors.tools.select('create a pull request', {
 *   maxTools: 5,
 *   categories: ['code']
 * });
 *
 * // List all GitHub tools
 * const githubTools = await connectors.tools.list({
 *   integration: 'github'
 * });
 *
 * // Invoke a tool
 * const result = await connectors.tools.invoke('github.createPullRequest', {
 *   repo: 'owner/repo',
 *   title: 'Feature',
 *   head: 'feature-branch',
 *   base: 'main'
 * });
 * ```
 */
export class ToolsAPI {
  private readonly _httpClient: HTTPClient;
  private readonly _config: ConnectorsConfig;

  constructor(httpClient: HTTPClient, config: ConnectorsConfig) {
    this._httpClient = httpClient;
    this._config = config;
  }

  /**
   * Select tools using semantic search
   *
   * Uses the gateway's FAISS semantic router and GraphRAG to select
   * the most relevant tools for a given query.
   *
   * @param query - Natural language query describing the task
   * @param options - Tool selection options
   * @returns Array of selected tools (flattened from tiered response)
   * @throws {ValidationError} If query is invalid
   * @throws {HTTPError} If the request fails
   *
   * @example
   * ```typescript
   * const tools = await connectors.tools.select(
   *   'create a pull request and notify the team',
   *   {
   *     maxTools: 5,
   *     categories: ['code', 'communication'],
   *     tokenBudget: 2000
   *   }
   * );
   *
   * console.log(`Selected ${tools.length} tools`);
   * tools.forEach(tool => {
   *   console.log(`- ${tool.name}: ${tool.description}`);
   * });
   * ```
   */
  async select(query: string, options?: ToolSelectionOptions): Promise<Tool[]> {
    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new ValidationError('query must be a non-empty string', 'query', query);
    }

    // Validate options
    if (options) {
      if (options.maxTools !== undefined) {
        if (
          typeof options.maxTools !== 'number' ||
          options.maxTools <= 0 ||
          !Number.isFinite(options.maxTools)
        ) {
          throw new ValidationError(
            'maxTools must be a positive number',
            'maxTools',
            options.maxTools
          );
        }
      }

      if (options.tokenBudget !== undefined) {
        if (
          typeof options.tokenBudget !== 'number' ||
          options.tokenBudget <= 0 ||
          !Number.isFinite(options.tokenBudget)
        ) {
          throw new ValidationError(
            'tokenBudget must be a positive number',
            'tokenBudget',
            options.tokenBudget
          );
        }
      }

      if (options.categories !== undefined && !Array.isArray(options.categories)) {
        throw new ValidationError(
          'categories must be an array',
          'categories',
          options.categories
        );
      }
    }

    // Build request body
    const requestBody: ToolSelectionRequest = {
      query: query.trim(),
      maxTools: options?.maxTools,
      categories: options?.categories,
      tokenBudget: options?.tokenBudget,
      context: options?.context,
    };

    // Make API request
    const response = await this._httpClient.post<ToolSelectionResponse>(
      '/api/v1/tools/select',
      requestBody
    );

    // Return flattened tools array
    return response.data.tools || [];
  }

  /**
   * List tools with optional filters
   *
   * @param filters - Filters to apply (category, integration, search)
   * @returns Array of matching tools
   * @throws {HTTPError} If the request fails
   *
   * @example
   * ```typescript
   * // List all GitHub tools
   * const githubTools = await connectors.tools.list({
   *   integration: 'github'
   * });
   *
   * // List all code tools
   * const codeTools = await connectors.tools.list({
   *   category: 'code'
   * });
   *
   * // Search for PR-related tools
   * const prTools = await connectors.tools.list({
   *   search: 'pull request'
   * });
   *
   * // Paginated listing
   * const page1 = await connectors.tools.list({
   *   page: 1,
   *   limit: 20
   * });
   * ```
   */
  async list(filters?: ToolListFilters): Promise<Tool[]> {
    // Validate filters
    if (filters) {
      if (filters.page !== undefined) {
        if (
          typeof filters.page !== 'number' ||
          filters.page < 1 ||
          !Number.isInteger(filters.page)
        ) {
          throw new ValidationError(
            'page must be a positive integer',
            'page',
            filters.page
          );
        }
      }

      if (filters.limit !== undefined) {
        if (
          typeof filters.limit !== 'number' ||
          filters.limit < 1 ||
          !Number.isInteger(filters.limit)
        ) {
          throw new ValidationError(
            'limit must be a positive integer',
            'limit',
            filters.limit
          );
        }
      }

      if (filters.category !== undefined && typeof filters.category !== 'string') {
        throw new ValidationError(
          'category must be a string',
          'category',
          filters.category
        );
      }

      if (filters.integration !== undefined && typeof filters.integration !== 'string') {
        throw new ValidationError(
          'integration must be a string',
          'integration',
          filters.integration
        );
      }

      if (filters.search !== undefined && typeof filters.search !== 'string') {
        throw new ValidationError(
          'search must be a string',
          'search',
          filters.search
        );
      }
    }

    // Build query parameters
    const queryParams = new URLSearchParams();

    if (filters?.category) {
      queryParams.append('category', filters.category);
    }

    if (filters?.integration) {
      queryParams.append('integration', filters.integration);
    }

    if (filters?.search) {
      queryParams.append('search', filters.search);
    }

    if (filters?.page) {
      queryParams.append('page', filters.page.toString());
    }

    if (filters?.limit) {
      queryParams.append('limit', filters.limit.toString());
    }

    // Build URL with query parameters
    const url = `/api/v1/tools/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    // Make API request
    const response = await this._httpClient.get<ToolListResponse>(url);

    // Return tools array
    return response.data.tools || [];
  }

  /**
   * Invoke a tool with parameters
   *
   * Automatically extracts integration name from toolId (e.g., 'github.createPR')
   * and uses tenantId from SDK config.
   *
   * @param toolId - Tool identifier (e.g., 'github.createPullRequest')
   * @param parameters - Tool parameters as key-value pairs
   * @param options - Invocation options (timeout, tenantId override)
   * @returns Tool execution result
   * @throws {ValidationError} If toolId or parameters are invalid
   * @throws {HTTPError} If the request fails
   *
   * @example
   * ```typescript
   * // Invoke GitHub createPullRequest tool
   * const result = await connectors.tools.invoke(
   *   'github.createPullRequest',
   *   {
   *     repo: 'owner/repo',
   *     title: 'Add new feature',
   *     head: 'feature-branch',
   *     base: 'main',
   *     body: 'This PR adds a new feature'
   *   }
   * );
   *
   * if (result.success) {
   *   console.log('PR created:', result.data);
   * } else {
   *   console.error('Failed:', result.error);
   * }
   *
   * // With custom timeout
   * const result2 = await connectors.tools.invoke(
   *   'slack.sendMessage',
   *   { channel: '#general', text: 'Hello!' },
   *   { timeout: 10000 }
   * );
   * ```
   */
  async invoke<T = unknown>(
    toolId: string,
    parameters: Record<string, unknown>,
    options?: InvokeOptions
  ): Promise<ToolInvocationResponse<T>> {
    // Validate toolId
    if (!toolId || typeof toolId !== 'string' || toolId.trim().length === 0) {
      throw new ValidationError('toolId must be a non-empty string', 'toolId', toolId);
    }

    // Validate parameters
    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      throw new ValidationError(
        'parameters must be an object',
        'parameters',
        parameters
      );
    }

    // Extract integration from toolId (e.g., 'github.createPR' -> 'github')
    const integration = options?.integration || this._extractIntegration(toolId);

    // Use tenantId from options or config
    const tenantId = options?.tenantId || this._config.tenantId;

    // Build request body
    const requestBody: ToolInvocationRequest = {
      toolId: toolId.trim(),
      integration,
      parameters,
      tenantId,
    };

    // Make API request with optional timeout
    const requestOptions = options?.timeout ? { timeout: options.timeout } : {};

    const response = await this._httpClient.post<ToolInvocationResponse<T>>(
      '/api/v1/tools/invoke',
      requestBody,
      requestOptions
    );

    return response.data;
  }

  /**
   * Extract integration name from toolId
   *
   * @param toolId - Tool identifier (e.g., 'github.createPR', 'slack.sendMessage')
   * @returns Integration name (e.g., 'github', 'slack')
   * @throws {ValidationError} If toolId format is invalid
   *
   * @internal
   */
  private _extractIntegration(toolId: string): string {
    const parts = toolId.split('.');

    if (parts.length < 2 || !parts[0]) {
      throw new ValidationError(
        `Invalid toolId format. Expected 'integration.toolName', got '${toolId}'`,
        'toolId',
        toolId
      );
    }

    return parts[0];
  }
}
