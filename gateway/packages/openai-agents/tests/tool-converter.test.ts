/**
 * Tests for tool-converter utilities
 */

import { Tool } from '@connectors/sdk';
import {
  convertToOpenAITool,
  convertToolsToOpenAI,
  convertParameters,
} from '../src/tool-converter';

describe('tool-converter', () => {
  describe('convertToOpenAITool', () => {
    it('should convert basic tool with simple parameters', () => {
      const tool: Tool = {
        id: 'github.createPullRequest',
        name: 'Create Pull Request',
        description: 'Create a new pull request on GitHub',
        integration: 'github',
        category: 'code',
        parameters: {
          type: 'object',
          properties: {
            repo: {
              type: 'string',
              description: 'Repository name (owner/repo)',
            },
            title: {
              type: 'string',
              description: 'PR title',
            },
            head: {
              type: 'string',
              description: 'Source branch',
            },
            base: {
              type: 'string',
              description: 'Target branch',
            },
          },
          required: ['repo', 'title', 'head', 'base'],
        },
      };

      const result = convertToOpenAITool(tool);

      expect(result).toEqual({
        type: 'function',
        function: {
          name: 'github.createPullRequest',
          description: 'Create a new pull request on GitHub',
          parameters: {
            type: 'object',
            properties: {
              repo: {
                type: 'string',
                description: 'Repository name (owner/repo)',
              },
              title: {
                type: 'string',
                description: 'PR title',
              },
              head: {
                type: 'string',
                description: 'Source branch',
              },
              base: {
                type: 'string',
                description: 'Target branch',
              },
            },
            required: ['repo', 'title', 'head', 'base'],
          },
        },
      });
    });

    it('should handle tool without description', () => {
      const tool: Tool = {
        id: 'test.tool',
        name: 'Test Tool',
        description: '',
        integration: 'test',
        category: 'test',
      };

      const result = convertToOpenAITool(tool);

      expect(result.function.description).toBe('Test Tool tool');
    });

    it('should handle tool without parameters', () => {
      const tool: Tool = {
        id: 'test.noParams',
        name: 'No Params',
        description: 'A tool with no parameters',
        integration: 'test',
        category: 'test',
      };

      const result = convertToOpenAITool(tool);

      expect(result.function.parameters).toEqual({
        type: 'object',
        properties: {},
      });
    });

    it('should preserve all tool metadata in conversion', () => {
      const tool: Tool = {
        id: 'slack.sendMessage',
        name: 'Send Message',
        description: 'Send a message to a Slack channel',
        integration: 'slack',
        category: 'communication',
        parameters: {
          type: 'object',
          properties: {
            channel: { type: 'string' },
            text: { type: 'string' },
          },
          required: ['channel', 'text'],
        },
        tokenCost: 150,
      };

      const result = convertToOpenAITool(tool);

      expect(result.type).toBe('function');
      expect(result.function.name).toBe('slack.sendMessage');
      expect(result.function.description).toBe('Send a message to a Slack channel');
    });
  });

  describe('convertParameters', () => {
    it('should convert JSON Schema parameters as-is', () => {
      const params = {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'User name',
          },
          age: {
            type: 'number',
            description: 'User age',
          },
        },
        required: ['name'],
      };

      const result = convertParameters(params);

      expect(result).toEqual(params);
    });

    it('should handle parameters with enums', () => {
      const params = {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Status value',
            enum: ['open', 'closed', 'pending'],
          },
        },
      };

      const result = convertParameters(params);

      expect(result).toEqual(params);
    });

    it('should handle nested object parameters', () => {
      const params = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name'],
          },
        },
      };

      const result = convertParameters(params);

      expect(result).toEqual(params);
    });

    it('should handle array parameters', () => {
      const params = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of tags',
          },
        },
      };

      const result = convertParameters(params);

      expect(result).toEqual(params);
    });

    it('should handle array of objects', () => {
      const params = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
      };

      const result = convertParameters(params);

      expect(result).toEqual(params);
    });

    it('should handle all JSON Schema types', () => {
      const params = {
        type: 'object',
        properties: {
          stringField: { type: 'string' },
          numberField: { type: 'number' },
          integerField: { type: 'integer' },
          booleanField: { type: 'boolean' },
          arrayField: { type: 'array', items: { type: 'string' } },
          objectField: {
            type: 'object',
            properties: { nested: { type: 'string' } },
          },
        },
      };

      const result = convertParameters(params);

      expect(result).toEqual(params);
    });

    it('should handle optional and required parameters', () => {
      const params = {
        type: 'object',
        properties: {
          required1: { type: 'string' },
          required2: { type: 'string' },
          optional1: { type: 'string' },
          optional2: { type: 'string' },
        },
        required: ['required1', 'required2'],
      };

      const result = convertParameters(params);

      expect(result.required).toEqual(['required1', 'required2']);
    });

    it('should handle empty parameters', () => {
      const result = convertParameters({});

      expect(result).toEqual({
        type: 'object',
        properties: {},
      });
    });

    it('should handle parameters with descriptions', () => {
      const params = {
        type: 'object',
        properties: {
          repo: {
            type: 'string',
            description: 'Repository name in owner/repo format',
          },
        },
      };

      const result = convertParameters(params);

      expect((result.properties as any).repo.description).toBe(
        'Repository name in owner/repo format'
      );
    });
  });

  describe('convertToolsToOpenAI', () => {
    it('should convert multiple tools', () => {
      const tools: Tool[] = [
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

      const result = convertToolsToOpenAI(tools);

      expect(result).toHaveLength(2);
      expect(result[0].function.name).toBe('github.createPR');
      expect(result[1].function.name).toBe('slack.sendMessage');
      expect(result[0].type).toBe('function');
      expect(result[1].type).toBe('function');
    });

    it('should handle empty tool array', () => {
      const result = convertToolsToOpenAI([]);

      expect(result).toEqual([]);
    });

    it('should maintain tool order', () => {
      const tools: Tool[] = [
        {
          id: 'tool1',
          name: 'Tool 1',
          description: 'First tool',
          integration: 'test',
          category: 'test',
        },
        {
          id: 'tool2',
          name: 'Tool 2',
          description: 'Second tool',
          integration: 'test',
          category: 'test',
        },
        {
          id: 'tool3',
          name: 'Tool 3',
          description: 'Third tool',
          integration: 'test',
          category: 'test',
        },
      ];

      const result = convertToolsToOpenAI(tools);

      expect(result.map((t) => t.function.name)).toEqual([
        'tool1',
        'tool2',
        'tool3',
      ]);
    });

    it('should handle tools with various parameter complexity', () => {
      const tools: Tool[] = [
        {
          id: 'simple',
          name: 'Simple',
          description: 'Simple tool',
          integration: 'test',
          category: 'test',
          parameters: {
            type: 'object',
            properties: {
              param: { type: 'string' },
            },
          },
        },
        {
          id: 'complex',
          name: 'Complex',
          description: 'Complex tool',
          integration: 'test',
          category: 'test',
          parameters: {
            type: 'object',
            properties: {
              nested: {
                type: 'object',
                properties: {
                  deep: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      ];

      const result = convertToolsToOpenAI(tools);

      expect(result).toHaveLength(2);
      expect((result[0].function.parameters as any).properties).toHaveProperty('param');
      expect((result[1].function.parameters as any).properties).toHaveProperty('nested');
    });
  });

  describe('ToolParameter format conversion', () => {
    it('should convert ToolParameter format to JSON Schema', () => {
      // This tests the non-JSON-Schema path (lines 68-75)
      const params = {
        repo: {
          name: 'repo',
          type: 'string',
          description: 'Repository name',
          required: true,
        },
        optional: {
          name: 'optional',
          type: 'string',
          description: 'Optional param',
          required: false,
        },
      };

      const result = convertParameters(params);

      expect(result.type).toBe('object');
      expect((result.properties as any).repo).toHaveProperty('type', 'string');
      expect((result.properties as any).repo).toHaveProperty(
        'description',
        'Repository name'
      );
      expect(result.required).toEqual(['repo']);
    });

    it('should handle ToolParameter with enum', () => {
      const params = {
        status: {
          name: 'status',
          type: 'string',
          description: 'Status',
          enum: ['open', 'closed'],
          required: true,
        },
      };

      const result = convertParameters(params);

      expect((result.properties as any).status).toHaveProperty('enum', [
        'open',
        'closed',
      ]);
    });

    it('should handle ToolParameter with array items', () => {
      const params = {
        tags: {
          name: 'tags',
          type: 'array',
          items: {
            name: 'tag',
            type: 'string',
          },
        },
      };

      const result = convertParameters(params);

      expect((result.properties as any).tags.type).toBe('array');
      expect((result.properties as any).tags.items).toHaveProperty(
        'type',
        'string'
      );
    });

    it('should handle ToolParameter with nested object', () => {
      const params = {
        user: {
          name: 'user',
          type: 'object',
          properties: {
            name: {
              name: 'name',
              type: 'string',
              required: true,
            },
            email: {
              name: 'email',
              type: 'string',
            },
          },
        },
      };

      const result = convertParameters(params);

      expect((result.properties as any).user.type).toBe('object');
      expect((result.properties as any).user.properties).toHaveProperty('name');
      expect((result.properties as any).user.properties).toHaveProperty('email');
      expect((result.properties as any).user.required).toEqual(['name']);
    });

    it('should handle mixed parameter formats', () => {
      // Mix of ToolParameter and direct properties
      const params = {
        toolParam: {
          name: 'toolParam',
          type: 'string',
          required: true,
        },
        directProp: {
          type: 'number',
          description: 'Direct property',
        },
      };

      const result = convertParameters(params);

      expect((result.properties as any).toolParam).toBeDefined();
      expect((result.properties as any).directProp).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle tool with very long description', () => {
      const longDescription = 'A'.repeat(1000);
      const tool: Tool = {
        id: 'test.long',
        name: 'Long Description Tool',
        description: longDescription,
        integration: 'test',
        category: 'test',
      };

      const result = convertToOpenAITool(tool);

      expect(result.function.description).toBe(longDescription);
    });

    it('should handle tool with special characters in name', () => {
      const tool: Tool = {
        id: 'test.special-chars_123',
        name: 'Special & Characters! Tool',
        description: 'Tool with special characters',
        integration: 'test',
        category: 'test',
      };

      const result = convertToOpenAITool(tool);

      expect(result.function.name).toBe('test.special-chars_123');
    });

    it('should handle parameters with null values', () => {
      const params = {
        type: 'object',
        properties: {
          nullable: {
            type: ['string', 'null'],
            description: 'Nullable field',
          },
        },
      };

      const result = convertParameters(params);

      expect(result).toEqual(params);
    });

    it('should handle deeply nested parameters', () => {
      const params = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: {
                    type: 'object',
                    properties: {
                      value: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = convertParameters(params);

      expect(result).toEqual(params);
    });
  });
});
