/**
 * Tests for ConnectorsProvider
 */

import { Connectors, Tool, ToolInvocationResponse } from '@connectors/sdk';
import OpenAI from 'openai';
import { ConnectorsProvider } from '../src/ConnectorsProvider';
import type { ConnectorsProviderConfig } from '../src/types';

// Mock dependencies
jest.mock('@connectors/sdk');
jest.mock('openai');

describe('ConnectorsProvider', () => {
  let provider: ConnectorsProvider;
  let mockConnectors: jest.Mocked<Connectors>;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let config: ConnectorsProviderConfig;

  beforeEach(() => {
    // Setup config
    config = {
      connectors: {
        baseURL: 'http://localhost:3000',
        tenantId: 'test-tenant',
        apiKey: 'test-api-key',
      },
      openai: {
        apiKey: 'test-openai-key',
        organization: 'test-org',
      },
    };

    // Create mocked instances with proper jest.fn() types
    const selectMock = jest.fn() as jest.MockedFunction<any>;
    const listMock = jest.fn() as jest.MockedFunction<any>;
    const invokeMock = jest.fn() as jest.MockedFunction<any>;
    const testConnectionMock = jest.fn() as jest.MockedFunction<any>;

    mockConnectors = {
      tools: {
        select: selectMock,
        list: listMock,
        invoke: invokeMock,
      },
      testConnection: testConnectionMock,
    } as unknown as jest.Mocked<Connectors>;

    const modelsListMock = jest.fn() as jest.MockedFunction<any>;
    const assistantsCreateMock = jest.fn() as jest.MockedFunction<any>;
    const assistantsUpdateMock = jest.fn() as jest.MockedFunction<any>;
    const assistantsDelMock = jest.fn() as jest.MockedFunction<any>;

    mockOpenAI = {
      models: {
        list: modelsListMock,
      },
      beta: {
        assistants: {
          create: assistantsCreateMock,
          update: assistantsUpdateMock,
          del: assistantsDelMock,
        },
      },
    } as unknown as jest.Mocked<OpenAI>;

    // Mock constructors
    (Connectors as jest.MockedClass<typeof Connectors>).mockImplementation(
      () => mockConnectors
    );
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () => mockOpenAI
    );

    // Create provider
    provider = new ConnectorsProvider(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize Connectors SDK with config', () => {
      expect(Connectors).toHaveBeenCalledWith(config.connectors);
    });

    it('should initialize OpenAI client with config', () => {
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: config.openai.apiKey,
        organization: config.openai.organization,
        baseURL: undefined,
        timeout: undefined,
        maxRetries: undefined,
      });
    });

    it('should expose connectors instance', () => {
      expect(provider.connectors).toBe(mockConnectors);
    });

    it('should expose openai instance', () => {
      expect(provider.openai).toBe(mockOpenAI);
    });

    it('should expose config', () => {
      expect(provider.config).toEqual(config);
    });
  });

  describe('selectTools', () => {
    const mockTools: Tool[] = [
      {
        id: 'github.createPR',
        name: 'Create PR',
        description: 'Create a pull request',
        integration: 'github',
        category: 'code',
        parameters: {
          type: 'object',
          properties: {
            repo: { type: 'string' },
          },
        },
      },
      {
        id: 'slack.sendMessage',
        name: 'Send Message',
        description: 'Send a Slack message',
        integration: 'slack',
        category: 'communication',
        parameters: {
          type: 'object',
          properties: {
            channel: { type: 'string' },
            text: { type: 'string' },
          },
        },
      },
    ];

    it('should select tools using Connectors and convert to OpenAI format', async () => {
      (mockConnectors.tools.select as jest.MockedFunction<any>).mockResolvedValue(mockTools);

      const result = await provider.selectTools('create a PR and send message');

      expect(mockConnectors.tools.select).toHaveBeenCalledWith(
        'create a PR and send message',
        {
          maxTools: 10,
          categories: undefined,
          tokenBudget: undefined,
          context: undefined,
        }
      );

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('function');
      expect(result[0].function.name).toBe('github.createPR');
      expect(result[1].function.name).toBe('slack.sendMessage');
    });

    it('should pass custom options to Connectors', async () => {
      (mockConnectors.tools.select as jest.MockedFunction<any>).mockResolvedValue(mockTools);

      await provider.selectTools('test query', {
        maxTools: 5,
        categories: ['code', 'communication'],
        tokenBudget: 2000,
        context: { foo: 'bar' },
      });

      expect(mockConnectors.tools.select).toHaveBeenCalledWith('test query', {
        maxTools: 5,
        categories: ['code', 'communication'],
        tokenBudget: 2000,
        context: { foo: 'bar' },
      });
    });

    it('should use default maxTools if not provided', async () => {
      (mockConnectors.tools.select as jest.MockedFunction<any>).mockResolvedValue([]);

      await provider.selectTools('test query');

      expect(mockConnectors.tools.select).toHaveBeenCalledWith('test query', {
        maxTools: 10,
        categories: undefined,
        tokenBudget: undefined,
        context: undefined,
      });
    });

    it('should handle empty tool results', async () => {
      (mockConnectors.tools.select as jest.MockedFunction<any>).mockResolvedValue([]);

      const result = await provider.selectTools('test query');

      expect(result).toEqual([]);
    });

    it('should propagate errors from Connectors', async () => {
      const error = new Error('API error');
      (mockConnectors.tools.select as jest.MockedFunction<any>).mockRejectedValue(error);

      await expect(provider.selectTools('test query')).rejects.toThrow('API error');
    });
  });

  describe('getIntegrationTools', () => {
    const mockGitHubTools: Tool[] = [
      {
        id: 'github.createPR',
        name: 'Create PR',
        description: 'Create a pull request',
        integration: 'github',
        category: 'code',
      },
      {
        id: 'github.mergePR',
        name: 'Merge PR',
        description: 'Merge a pull request',
        integration: 'github',
        category: 'code',
      },
    ];

    it('should get all tools from integration', async () => {
      (mockConnectors.tools.list as jest.MockedFunction<any>).mockResolvedValue(mockGitHubTools);

      const result = await provider.getIntegrationTools('github');

      expect(mockConnectors.tools.list).toHaveBeenCalledWith({
        integration: 'github',
      });

      expect(result).toHaveLength(2);
      expect(result[0].function.name).toBe('github.createPR');
      expect(result[1].function.name).toBe('github.mergePR');
    });

    it('should handle empty integration', async () => {
      (mockConnectors.tools.list as jest.MockedFunction<any>).mockResolvedValue([]);

      const result = await provider.getIntegrationTools('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getMultipleIntegrationTools', () => {
    it('should fetch tools from multiple integrations in parallel', async () => {
      const githubTools: Tool[] = [
        {
          id: 'github.createPR',
          name: 'Create PR',
          description: 'Create PR',
          integration: 'github',
          category: 'code',
        },
      ];

      const slackTools: Tool[] = [
        {
          id: 'slack.sendMessage',
          name: 'Send Message',
          description: 'Send message',
          integration: 'slack',
          category: 'communication',
        },
      ];

      (mockConnectors.tools.list as jest.MockedFunction<any>)
        .mockResolvedValueOnce(githubTools)
        .mockResolvedValueOnce(slackTools);

      const result = await provider.getMultipleIntegrationTools([
        'github',
        'slack',
      ]);

      expect(mockConnectors.tools.list).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0].function.name).toBe('github.createPR');
      expect(result[1].function.name).toBe('slack.sendMessage');
    });

    it('should handle empty integration list', async () => {
      const result = await provider.getMultipleIntegrationTools([]);

      expect(result).toEqual([]);
    });
  });

  describe('executeToolCall', () => {
    const mockToolCall: OpenAI.ChatCompletionMessageToolCall = {
      id: 'call_123',
      type: 'function',
      function: {
        name: 'github.createPR',
        arguments: JSON.stringify({
          repo: 'owner/repo',
          title: 'Test PR',
        }),
      },
    };

    it('should execute tool call and return data on success', async () => {
      const mockResponse: ToolInvocationResponse = {
        success: true,
        data: { pr_number: 123, url: 'https://github.com/owner/repo/pull/123' },
      };

      (mockConnectors.tools.invoke as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

      const result = await provider.executeToolCall(mockToolCall);

      expect(mockConnectors.tools.invoke).toHaveBeenCalledWith(
        'github.createPR',
        {
          repo: 'owner/repo',
          title: 'Test PR',
        }
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failed execution', async () => {
      const mockResponse: ToolInvocationResponse = {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'API request failed',
        },
      };

      (mockConnectors.tools.invoke as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

      await expect(provider.executeToolCall(mockToolCall)).rejects.toThrow(
        'Tool execution failed: API request failed'
      );
    });

    it('should handle execution error without message', async () => {
      const mockResponse: ToolInvocationResponse = {
        success: false,
        error: {
          code: 'UNKNOWN',
          message: '',
        },
      };

      (mockConnectors.tools.invoke as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

      await expect(provider.executeToolCall(mockToolCall)).rejects.toThrow(
        'Tool execution failed: Unknown error'
      );
    });

    it('should parse JSON arguments correctly', async () => {
      const complexArgs = {
        repo: 'owner/repo',
        metadata: {
          tags: ['tag1', 'tag2'],
          priority: 'high',
        },
      };

      const toolCall: OpenAI.ChatCompletionMessageToolCall = {
        id: 'call_123',
        type: 'function',
        function: {
          name: 'test.tool',
          arguments: JSON.stringify(complexArgs),
        },
      };

      (mockConnectors.tools.invoke as jest.MockedFunction<any>).mockResolvedValue({
        success: true,
        data: {},
      });

      await provider.executeToolCall(toolCall);

      expect(mockConnectors.tools.invoke).toHaveBeenCalledWith(
        'test.tool',
        complexArgs
      );
    });
  });

  describe('executeToolCalls', () => {
    it('should execute multiple tool calls in parallel', async () => {
      const toolCalls: OpenAI.ChatCompletionMessageToolCall[] = [
        {
          id: 'call_1',
          type: 'function',
          function: {
            name: 'tool1',
            arguments: '{}',
          },
        },
        {
          id: 'call_2',
          type: 'function',
          function: {
            name: 'tool2',
            arguments: '{}',
          },
        },
      ];

      (mockConnectors.tools.invoke as jest.MockedFunction<any>)
        .mockResolvedValueOnce({ success: true, data: 'result1' })
        .mockResolvedValueOnce({ success: true, data: 'result2' });

      const results = await provider.executeToolCalls(toolCalls);

      expect(results).toEqual(['result1', 'result2']);
      expect(mockConnectors.tools.invoke).toHaveBeenCalledTimes(2);
    });
  });

  describe('createAgent', () => {
    it('should create agent with semantic tool selection', async () => {
      const mockTools: Tool[] = [
        {
          id: 'github.createPR',
          name: 'Create PR',
          description: 'Create PR',
          integration: 'github',
          category: 'code',
        },
      ];

      (mockConnectors.tools.select as jest.MockedFunction<any>).mockResolvedValue(mockTools);

      const mockAssistant = {
        id: 'asst_123',
        name: 'Test Agent',
        model: 'gpt-4-turbo-preview',
        tools: [],
      } as any;

      (mockOpenAI.beta.assistants.create as jest.MockedFunction<any>).mockResolvedValue(mockAssistant);

      const result = await provider.createAgent({
        name: 'Test Agent',
        instructions: 'Test instructions',
        toolQuery: 'GitHub operations',
      });

      expect(mockConnectors.tools.select).toHaveBeenCalledWith(
        'GitHub operations',
        {
          maxTools: 10,
          categories: undefined,
          tokenBudget: undefined,
          context: undefined,
        }
      );

      expect(mockOpenAI.beta.assistants.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Agent',
          instructions: 'Test instructions',
          model: 'gpt-4-turbo-preview',
        })
      );

      expect(result).toEqual(mockAssistant);
    });

    it('should create agent with specific integrations', async () => {
      const githubTools: Tool[] = [
        {
          id: 'github.createPR',
          name: 'Create PR',
          description: 'Create PR',
          integration: 'github',
          category: 'code',
        },
      ];

      const slackTools: Tool[] = [
        {
          id: 'slack.sendMessage',
          name: 'Send Message',
          description: 'Send message',
          integration: 'slack',
          category: 'communication',
        },
      ];

      (mockConnectors.tools.list as jest.MockedFunction<any>)
        .mockResolvedValueOnce(githubTools)
        .mockResolvedValueOnce(slackTools);

      const mockAssistant = {
        id: 'asst_123',
        name: 'Multi Agent',
      } as any;

      (mockOpenAI.beta.assistants.create as jest.MockedFunction<any>).mockResolvedValue(mockAssistant);

      await provider.createAgent({
        name: 'Multi Agent',
        instructions: 'Test',
        integrations: ['github', 'slack'],
      });

      expect(mockConnectors.tools.list).toHaveBeenCalledTimes(2);
    });

    it('should create agent without tools if no query or integrations', async () => {
      const mockAssistant = {
        id: 'asst_123',
        name: 'No Tools Agent',
      } as any;

      (mockOpenAI.beta.assistants.create as jest.MockedFunction<any>).mockResolvedValue(mockAssistant);

      await provider.createAgent({
        name: 'No Tools Agent',
        instructions: 'Test',
      });

      expect(mockOpenAI.beta.assistants.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: [],
        })
      );
    });
  });

  describe('updateAgentTools', () => {
    it('should update agent with new tools', async () => {
      const mockTools: Tool[] = [
        {
          id: 'new.tool',
          name: 'New Tool',
          description: 'New tool',
          integration: 'test',
          category: 'test',
        },
      ];

      (mockConnectors.tools.select as jest.MockedFunction<any>).mockResolvedValue(mockTools);

      const mockAssistant = {
        id: 'asst_123',
        name: 'Updated Agent',
      } as any;

      (mockOpenAI.beta.assistants.update as jest.MockedFunction<any>).mockResolvedValue(mockAssistant);

      const result = await provider.updateAgentTools('asst_123', 'new tools');

      expect(mockConnectors.tools.select).toHaveBeenCalledWith(
        'new tools',
        {
          maxTools: 10,
          categories: undefined,
          tokenBudget: undefined,
          context: undefined,
        }
      );

      expect(mockOpenAI.beta.assistants.update).toHaveBeenCalledWith(
        'asst_123',
        expect.objectContaining({
          tools: expect.any(Array),
        })
      );

      expect(result).toEqual(mockAssistant);
    });
  });

  describe('testConnection', () => {
    it('should test both Connectors and OpenAI connections', async () => {
      (mockConnectors.testConnection as jest.MockedFunction<any>).mockResolvedValue(true);
      (mockOpenAI.models.list as jest.MockedFunction<any>).mockResolvedValue({} as any);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connectors: true,
        openai: true,
      });
    });

    it('should handle Connectors connection failure', async () => {
      (mockConnectors.testConnection as jest.MockedFunction<any>).mockResolvedValue(false);
      (mockOpenAI.models.list as jest.MockedFunction<any>).mockResolvedValue({} as any);

      const result = await provider.testConnection();

      expect(result.connectors).toBe(false);
      expect(result.openai).toBe(true);
    });

    it('should handle OpenAI connection failure', async () => {
      (mockConnectors.testConnection as jest.MockedFunction<any>).mockResolvedValue(true);
      (mockOpenAI.models.list as jest.MockedFunction<any>).mockRejectedValue(new Error('API error'));

      const result = await provider.testConnection();

      expect(result.connectors).toBe(true);
      expect(result.openai).toBe(false);
    });

    it('should handle both connections failing', async () => {
      (mockConnectors.testConnection as jest.MockedFunction<any>).mockResolvedValue(false);
      (mockOpenAI.models.list as jest.MockedFunction<any>).mockRejectedValue(new Error('API error'));

      const result = await provider.testConnection();

      expect(result).toEqual({
        connectors: false,
        openai: false,
      });
    });
  });
});
