/**
 * Tests for tool-converter
 */

import { z } from 'zod';
import { convertToZodSchema, validateInput } from '../src/tool-converter';
import type { ToolParameter } from '../src/types';

describe('tool-converter', () => {
  describe('convertToZodSchema', () => {
    it('should handle empty parameters', () => {
      const schema = convertToZodSchema([]);
      expect(schema).toBeInstanceOf(z.ZodObject);
      expect(Object.keys(schema.shape)).toHaveLength(0);
    });

    it('should convert string parameter', () => {
      const params: ToolParameter[] = [
        {
          name: 'message',
          type: 'string',
          description: 'Message to send',
          required: true
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ message: 'Hello' });

      expect(result).toEqual({ message: 'Hello' });
    });

    it('should convert number parameter', () => {
      const params: ToolParameter[] = [
        {
          name: 'count',
          type: 'number',
          description: 'Count value',
          required: true
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ count: 42 });

      expect(result).toEqual({ count: 42 });
    });

    it('should convert integer parameter', () => {
      const params: ToolParameter[] = [
        {
          name: 'age',
          type: 'integer',
          description: 'Age in years',
          required: true
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ age: 25 });

      expect(result).toEqual({ age: 25 });
      expect(() => schema.parse({ age: 25.5 })).toThrow();
    });

    it('should convert boolean parameter', () => {
      const params: ToolParameter[] = [
        {
          name: 'enabled',
          type: 'boolean',
          description: 'Whether enabled',
          required: true
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ enabled: true });

      expect(result).toEqual({ enabled: true });
    });

    it('should handle optional parameters', () => {
      const params: ToolParameter[] = [
        {
          name: 'optional',
          type: 'string',
          description: 'Optional field',
          required: false
        }
      ];

      const schema = convertToZodSchema(params);
      const result1 = schema.parse({});
      const result2 = schema.parse({ optional: 'value' });

      expect(result1).toEqual({});
      expect(result2).toEqual({ optional: 'value' });
    });

    it('should handle enum constraints', () => {
      const params: ToolParameter[] = [
        {
          name: 'status',
          type: 'string',
          description: 'Status value',
          required: true,
          enum: ['active', 'inactive', 'pending']
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ status: 'active' });

      expect(result).toEqual({ status: 'active' });
      expect(() => schema.parse({ status: 'invalid' })).toThrow();
    });

    it('should handle string format constraints', () => {
      const params: ToolParameter[] = [
        {
          name: 'email',
          type: 'string',
          description: 'Email address',
          required: true,
          format: 'email'
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ email: 'user@example.com' });

      expect(result).toEqual({ email: 'user@example.com' });
      expect(() => schema.parse({ email: 'invalid-email' })).toThrow();
    });

    it('should handle URL format constraints', () => {
      const params: ToolParameter[] = [
        {
          name: 'website',
          type: 'string',
          description: 'Website URL',
          required: true,
          format: 'url'
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ website: 'https://example.com' });

      expect(result).toEqual({ website: 'https://example.com' });
      expect(() => schema.parse({ website: 'not-a-url' })).toThrow();
    });

    it('should handle string length constraints', () => {
      const params: ToolParameter[] = [
        {
          name: 'username',
          type: 'string',
          description: 'Username',
          required: true,
          minLength: 3,
          maxLength: 20
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ username: 'john_doe' });

      expect(result).toEqual({ username: 'john_doe' });
      expect(() => schema.parse({ username: 'ab' })).toThrow();
      expect(() => schema.parse({ username: 'a'.repeat(25) })).toThrow();
    });

    it('should handle number range constraints', () => {
      const params: ToolParameter[] = [
        {
          name: 'rating',
          type: 'number',
          description: 'Rating value',
          required: true,
          minimum: 1,
          maximum: 5
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ rating: 4 });

      expect(result).toEqual({ rating: 4 });
      expect(() => schema.parse({ rating: 0 })).toThrow();
      expect(() => schema.parse({ rating: 6 })).toThrow();
    });

    it('should handle array parameters', () => {
      const params: ToolParameter[] = [
        {
          name: 'tags',
          type: 'array',
          description: 'Tag list',
          required: true,
          items: { type: 'string' }
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ tags: ['tag1', 'tag2'] });

      expect(result).toEqual({ tags: ['tag1', 'tag2'] });
    });

    it('should handle array length constraints', () => {
      const params: ToolParameter[] = [
        {
          name: 'items',
          type: 'array',
          description: 'Item list',
          required: true,
          minItems: 1,
          maxItems: 5,
          items: { type: 'string' }
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ items: ['item1', 'item2'] });

      expect(result).toEqual({ items: ['item1', 'item2'] });
      expect(() => schema.parse({ items: [] })).toThrow();
      expect(() => schema.parse({ items: Array(6).fill('item') })).toThrow();
    });

    it('should handle object parameters', () => {
      const params: ToolParameter[] = [
        {
          name: 'config',
          type: 'object',
          description: 'Configuration object',
          required: true
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ config: { key: 'value' } });

      expect(result).toEqual({ config: { key: 'value' } });
    });

    it('should handle structured object parameters', () => {
      const params: ToolParameter[] = [
        {
          name: 'user',
          type: 'object',
          description: 'User object',
          required: true,
          properties: {
            name: { type: 'string' },
            age: { type: 'integer' }
          },
          required: ['name']
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({
        user: { name: 'John', age: 30 }
      });

      expect(result).toEqual({
        user: { name: 'John', age: 30 }
      });
    });

    it('should handle multiple parameters', () => {
      const params: ToolParameter[] = [
        {
          name: 'title',
          type: 'string',
          description: 'Title',
          required: true
        },
        {
          name: 'count',
          type: 'integer',
          description: 'Count',
          required: true
        },
        {
          name: 'enabled',
          type: 'boolean',
          description: 'Enabled flag',
          required: false
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({
        title: 'Test',
        count: 5
      });

      expect(result).toEqual({
        title: 'Test',
        count: 5
      });
    });

    it('should handle pattern constraints', () => {
      const params: ToolParameter[] = [
        {
          name: 'code',
          type: 'string',
          description: 'Code pattern',
          required: true,
          pattern: '^[A-Z]{3}-[0-9]{4}$'
        }
      ];

      const schema = convertToZodSchema(params);
      const result = schema.parse({ code: 'ABC-1234' });

      expect(result).toEqual({ code: 'ABC-1234' });
      expect(() => schema.parse({ code: 'invalid' })).toThrow();
    });
  });

  describe('validateInput', () => {
    it('should validate valid input', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      const result = validateInput(schema, { name: 'John', age: 30 });
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should throw on invalid input', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number()
      });

      expect(() => validateInput(schema, { name: 'John' })).toThrow();
    });
  });
});
