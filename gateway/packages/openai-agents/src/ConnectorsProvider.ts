/**
 * ConnectorsProvider - Main integration class for OpenAI Agents
 */

import { Connectors } from '@connectors/sdk';
import OpenAI from 'openai';
import { convertToolsToOpenAI } from './tool-converter';
import type {
  ConnectorsProviderConfig,
  ToolSelectionOptions,
  AgentConfig,
  OpenAITool,
  OpenAIToolCall,
  OpenAIAssistant,
} from './types';

/**
 * ConnectorsProvider - OpenAI Agents integration for Connectors platform
 *
 * Provides seamless integration between Connectors' semantic tool selection
 * and OpenAI's function calling / assistants API.
 *
 * @example
 * ```typescript
 * const provider = new ConnectorsProvider({
 *   connectors: {
 *     baseURL: 'http://localhost:3000',
 *     tenantId: 'my-company'
 *   },
 *   openai: {
 *     apiKey: process.env.OPENAI_API_KEY!
 *   }
 * });
 *
 * // Select tools semantically
 * const tools = await provider.selectTools('GitHub and Slack operations');
 *
 * // Use with OpenAI chat completion
 * const response = await provider.openai.chat.completions.create({
 *   model: 'gpt-4-turbo-preview',
 *   messages: [...],
 *   tools: tools
 * });
 * ```
 */
export class ConnectorsProvider {
  private readonly _connectors: Connectors;
  private readonly _openai: OpenAI;
  private readonly _config: ConnectorsProviderConfig;

  /**
   * Create a new ConnectorsProvider
   *
   * @param config - Configuration for Connectors and OpenAI
   * @throws {ValidationError} If configuration is invalid
   *
   * @example
   * ```typescript
   * const provider = new ConnectorsProvider({
   *   connectors: {
   *     baseURL: 'http://localhost:3000',
   *     tenantId: 'acme-corp',
   *     apiKey: 'optional-api-key'
   *   },
   *   openai: {
   *     apiKey: process.env.OPENAI_API_KEY!,
   *     organization: 'org-123'
   *   }
   * });
   * ```
   */
  constructor(config: ConnectorsProviderConfig) {
    this._config = config;

    // Initialize Connectors SDK
    this._connectors = new Connectors(config.connectors);

    // Initialize OpenAI client
    this._openai = new OpenAI({
      apiKey: config.openai.apiKey,
      organization: config.openai.organization,
      baseURL: config.openai.baseURL,
      timeout: config.openai.timeout,
      maxRetries: config.openai.maxRetries,
    });
  }

  /**
   * Get Connectors SDK instance
   */
  get connectors(): Connectors {
    return this._connectors;
  }

  /**
   * Get OpenAI client instance
   */
  get openai(): OpenAI {
    return this._openai;
  }

  /**
   * Get provider configuration
   */
  get config(): Readonly<ConnectorsProviderConfig> {
    return { ...this._config };
  }

  /**
   * Select tools using semantic search and convert to OpenAI format
   *
   * Uses Connectors' FAISS semantic router and GraphRAG to intelligently
   * select the most relevant tools for a given query, then converts them
   * to OpenAI's function calling format.
   *
   * @param query - Natural language description of required tools
   * @param options - Tool selection options
   * @returns Array of OpenAI-compatible tool definitions
   * @throws {ValidationError} If query or options are invalid
   * @throws {HTTPError} If the API request fails
   *
   * @example
   * ```typescript
   * // Select tools for GitHub operations
   * const tools = await provider.selectTools('create pull requests and manage issues', {
   *   maxTools: 5,
   *   categories: ['code']
   * });
   *
   * // Use with OpenAI
   * const response = await provider.openai.chat.completions.create({
   *   model: 'gpt-4-turbo-preview',
   *   messages: [{ role: 'user', content: 'Create a PR for my changes' }],
   *   tools: tools,
   *   tool_choice: 'auto'
   * });
   * ```
   */
  async selectTools(
    query: string,
    options?: ToolSelectionOptions
  ): Promise<OpenAITool[]> {
    // Use Connectors semantic tool selection
    const connectorsTools = await this._connectors.tools.select(query, {
      maxTools: options?.maxTools || 10,
      categories: options?.categories,
      tokenBudget: options?.tokenBudget,
      context: options?.context,
    });

    // Convert to OpenAI format
    return convertToolsToOpenAI(connectorsTools);
  }

  /**
   * Get all tools from a specific integration in OpenAI format
   *
   * @param integration - Integration name (e.g., 'github', 'slack')
   * @returns Array of OpenAI-compatible tool definitions
   * @throws {HTTPError} If the API request fails
   *
   * @example
   * ```typescript
   * // Get all GitHub tools
   * const githubTools = await provider.getIntegrationTools('github');
   *
   * // Get all Slack tools
   * const slackTools = await provider.getIntegrationTools('slack');
   * ```
   */
  async getIntegrationTools(integration: string): Promise<OpenAITool[]> {
    // List all tools from the integration
    const connectorsTools = await this._connectors.tools.list({
      integration,
    });

    // Convert to OpenAI format
    return convertToolsToOpenAI(connectorsTools);
  }

  /**
   * Get tools from multiple integrations in OpenAI format
   *
   * @param integrations - Array of integration names
   * @returns Array of OpenAI-compatible tool definitions
   *
   * @example
   * ```typescript
   * const tools = await provider.getMultipleIntegrationTools(['github', 'slack', 'jira']);
   * ```
   */
  async getMultipleIntegrationTools(integrations: string[]): Promise<OpenAITool[]> {
    // Fetch tools from all integrations in parallel
    const toolArrays = await Promise.all(
      integrations.map((integration) => this.getIntegrationTools(integration))
    );

    // Flatten and return
    return toolArrays.flat();
  }

  /**
   * Execute a tool call from OpenAI response
   *
   * Takes an OpenAI tool call and executes it via Connectors SDK,
   * automatically handling parameter parsing and error handling.
   *
   * @param toolCall - OpenAI tool call from completion response
   * @returns Tool execution result
   * @throws {ValidationError} If tool call is invalid
   * @throws {HTTPError} If the tool execution fails
   *
   * @example
   * ```typescript
   * const response = await provider.openai.chat.completions.create({
   *   model: 'gpt-4-turbo-preview',
   *   messages: [...],
   *   tools: tools,
   *   tool_choice: 'auto'
   * });
   *
   * // Execute tool calls
   * if (response.choices[0].message.tool_calls) {
   *   for (const toolCall of response.choices[0].message.tool_calls) {
   *     const result = await provider.executeToolCall(toolCall);
   *     console.log(`Result:`, result);
   *   }
   * }
   * ```
   */
  async executeToolCall(toolCall: OpenAIToolCall): Promise<unknown> {
    // Extract tool ID and parameters
    const toolId = toolCall.function.name;
    const parameters = JSON.parse(toolCall.function.arguments);

    // Execute using Connectors SDK
    const result = await this._connectors.tools.invoke(toolId, parameters);

    // Return data if successful, throw if failed
    if (result.success) {
      return result.data;
    } else {
      throw new Error(
        `Tool execution failed: ${result.error?.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Execute multiple tool calls in parallel
   *
   * @param toolCalls - Array of OpenAI tool calls
   * @returns Array of tool execution results
   *
   * @example
   * ```typescript
   * const results = await provider.executeToolCalls(response.choices[0].message.tool_calls);
   * ```
   */
  async executeToolCalls(toolCalls: OpenAIToolCall[]): Promise<unknown[]> {
    return Promise.all(toolCalls.map((toolCall) => this.executeToolCall(toolCall)));
  }

  /**
   * Create an OpenAI assistant with automatically selected Connectors tools
   *
   * Creates an OpenAI assistant and automatically selects relevant tools
   * based on a semantic query or specific integrations.
   *
   * @param config - Agent configuration
   * @returns OpenAI Assistant instance
   * @throws {ValidationError} If configuration is invalid
   * @throws {HTTPError} If assistant creation fails
   *
   * @example
   * ```typescript
   * // Create agent with semantic tool selection
   * const assistant = await provider.createAgent({
   *   name: 'DevOps Assistant',
   *   instructions: 'You help manage GitHub repos and cloud deployments',
   *   toolQuery: 'GitHub repository management and cloud deployment',
   *   model: 'gpt-4-turbo-preview'
   * });
   *
   * // Create agent with specific integrations
   * const assistant2 = await provider.createAgent({
   *   name: 'Communication Assistant',
   *   instructions: 'You help with team communication',
   *   integrations: ['slack', 'email'],
   *   model: 'gpt-4-turbo-preview'
   * });
   * ```
   */
  async createAgent(config: AgentConfig): Promise<OpenAIAssistant> {
    let tools: OpenAITool[] = [];

    // Select tools based on query or integrations
    if (config.toolQuery) {
      tools = await this.selectTools(config.toolQuery, config.toolSelectionOptions);
    } else if (config.integrations && config.integrations.length > 0) {
      tools = await this.getMultipleIntegrationTools(config.integrations);
    }

    // Create OpenAI assistant
    const assistantParams: OpenAI.Beta.Assistants.AssistantCreateParams = {
      name: config.name,
      instructions: config.instructions,
      model: config.model || 'gpt-4-turbo-preview',
      tools: tools as any, // OpenAI SDK types are compatible but TypeScript needs help
      metadata: config.assistantConfig?.metadata,
      temperature: config.assistantConfig?.temperature,
      top_p: config.assistantConfig?.top_p,
    };

    const assistant = await this._openai.beta.assistants.create(assistantParams);

    return assistant;
  }

  /**
   * Update an existing assistant with new tools
   *
   * @param assistantId - Assistant ID to update
   * @param toolQuery - Semantic query for tool selection
   * @param options - Tool selection options
   * @returns Updated assistant
   *
   * @example
   * ```typescript
   * const updated = await provider.updateAgentTools(
   *   'asst_123',
   *   'GitHub and Slack operations'
   * );
   * ```
   */
  async updateAgentTools(
    assistantId: string,
    toolQuery: string,
    options?: ToolSelectionOptions
  ): Promise<OpenAIAssistant> {
    // Select new tools
    const tools = await this.selectTools(toolQuery, options);

    // Update assistant
    const assistant = await this._openai.beta.assistants.update(assistantId, {
      tools: tools as any, // OpenAI SDK types are compatible but TypeScript needs help
    });

    return assistant;
  }

  /**
   * Test connection to both Connectors and OpenAI
   *
   * @returns Object with connection status for each service
   *
   * @example
   * ```typescript
   * const status = await provider.testConnection();
   * console.log('Connectors:', status.connectors ? 'connected' : 'failed');
   * console.log('OpenAI:', status.openai ? 'connected' : 'failed');
   * ```
   */
  async testConnection(): Promise<{ connectors: boolean; openai: boolean }> {
    const [connectorsOk, openaiOk] = await Promise.all([
      this._connectors.testConnection(),
      this._testOpenAI(),
    ]);

    return {
      connectors: connectorsOk,
      openai: openaiOk,
    };
  }

  /**
   * Test OpenAI connection
   * @internal
   */
  private async _testOpenAI(): Promise<boolean> {
    try {
      await this._openai.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
