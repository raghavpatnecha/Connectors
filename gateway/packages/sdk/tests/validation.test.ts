/**
 * Tests for validation utilities
 */

import {
  ValidationError,
  validateURL,
  validateNonEmptyString,
  validatePositiveNumber,
  validateObject,
  validateConfig,
  validateToolSelectionRequest,
  validateToolInvocationRequest,
  validateDeploymentRequest,
} from '../src/utils/validation';

describe('Validation utilities', () => {
  describe('validateURL', () => {
    it('should accept valid URLs', () => {
      expect(() => validateURL('http://localhost:3000')).not.toThrow();
      expect(() => validateURL('https://example.com')).not.toThrow();
      expect(() => validateURL('http://example.com:8080/path')).not.toThrow();
    });

    it('should throw ValidationError for invalid URLs', () => {
      expect(() => validateURL('not-a-url')).toThrow(ValidationError);
      expect(() => validateURL('')).toThrow(ValidationError);
      expect(() => validateURL('ftp://example.com')).not.toThrow(); // FTP is valid
    });
  });

  describe('validateNonEmptyString', () => {
    it('should accept non-empty strings', () => {
      expect(() => validateNonEmptyString('hello', 'field')).not.toThrow();
      expect(() => validateNonEmptyString('  hello  ', 'field')).not.toThrow();
    });

    it('should throw ValidationError for empty strings', () => {
      expect(() => validateNonEmptyString('', 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString('   ', 'field')).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-strings', () => {
      expect(() => validateNonEmptyString(123 as any, 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString(null as any, 'field')).toThrow(ValidationError);
      expect(() => validateNonEmptyString(undefined as any, 'field')).toThrow(ValidationError);
    });
  });

  describe('validatePositiveNumber', () => {
    it('should accept positive numbers', () => {
      expect(() => validatePositiveNumber(1, 'field')).not.toThrow();
      expect(() => validatePositiveNumber(100.5, 'field')).not.toThrow();
      expect(() => validatePositiveNumber(0.001, 'field')).not.toThrow();
    });

    it('should throw ValidationError for zero or negative', () => {
      expect(() => validatePositiveNumber(0, 'field')).toThrow(ValidationError);
      expect(() => validatePositiveNumber(-1, 'field')).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-numbers', () => {
      expect(() => validatePositiveNumber('123' as any, 'field')).toThrow(ValidationError);
      expect(() => validatePositiveNumber(NaN, 'field')).toThrow(ValidationError);
      expect(() => validatePositiveNumber(Infinity, 'field')).toThrow(ValidationError);
    });
  });

  describe('validateObject', () => {
    it('should accept objects', () => {
      expect(() => validateObject({}, 'field')).not.toThrow();
      expect(() => validateObject({ key: 'value' }, 'field')).not.toThrow();
    });

    it('should throw ValidationError for non-objects', () => {
      expect(() => validateObject(null, 'field')).toThrow(ValidationError);
      expect(() => validateObject([], 'field')).toThrow(ValidationError);
      expect(() => validateObject('string', 'field')).toThrow(ValidationError);
      expect(() => validateObject(123, 'field')).toThrow(ValidationError);
    });
  });

  describe('validateConfig', () => {
    it('should accept valid config', () => {
      expect(() =>
        validateConfig({
          baseURL: 'http://localhost:3000',
          apiKey: 'test-key',
          tenantId: 'test-tenant',
        })
      ).not.toThrow();
    });

    it('should accept minimal config', () => {
      expect(() =>
        validateConfig({
          baseURL: 'http://localhost:3000',
        })
      ).not.toThrow();
    });

    it('should accept config with optional fields', () => {
      expect(() =>
        validateConfig({
          baseURL: 'http://localhost:3000',
          timeout: 5000,
          maxRetries: 3,
          headers: { 'X-Custom': 'value' },
        })
      ).not.toThrow();
    });

    it('should throw ValidationError for missing baseURL', () => {
      expect(() => validateConfig({})).toThrow(ValidationError);
      expect(() => validateConfig({})).toThrow('baseURL is required');
    });

    it('should throw ValidationError for invalid baseURL', () => {
      expect(() =>
        validateConfig({
          baseURL: 'not-a-url',
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty apiKey', () => {
      expect(() =>
        validateConfig({
          baseURL: 'http://localhost:3000',
          apiKey: '',
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid timeout', () => {
      expect(() =>
        validateConfig({
          baseURL: 'http://localhost:3000',
          timeout: -1,
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid maxRetries', () => {
      expect(() =>
        validateConfig({
          baseURL: 'http://localhost:3000',
          maxRetries: -1,
        })
      ).toThrow(ValidationError);

      expect(() =>
        validateConfig({
          baseURL: 'http://localhost:3000',
          maxRetries: 1.5,
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid headers', () => {
      expect(() =>
        validateConfig({
          baseURL: 'http://localhost:3000',
          headers: 'not-an-object' as any,
        })
      ).toThrow(ValidationError);
    });
  });

  describe('validateToolSelectionRequest', () => {
    it('should accept valid request', () => {
      expect(() =>
        validateToolSelectionRequest({
          query: 'create a PR',
          maxTools: 5,
          categories: ['code'],
          tokenBudget: 3000,
        })
      ).not.toThrow();
    });

    it('should accept minimal request', () => {
      expect(() =>
        validateToolSelectionRequest({
          query: 'create a PR',
        })
      ).not.toThrow();
    });

    it('should throw ValidationError for missing query', () => {
      expect(() => validateToolSelectionRequest({})).toThrow(ValidationError);
      expect(() => validateToolSelectionRequest({})).toThrow('query is required');
    });

    it('should throw ValidationError for empty query', () => {
      expect(() =>
        validateToolSelectionRequest({
          query: '',
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid maxTools', () => {
      expect(() =>
        validateToolSelectionRequest({
          query: 'test',
          maxTools: -1,
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid categories', () => {
      expect(() =>
        validateToolSelectionRequest({
          query: 'test',
          categories: 'not-an-array' as any,
        })
      ).toThrow(ValidationError);
    });
  });

  describe('validateToolInvocationRequest', () => {
    it('should accept valid request', () => {
      expect(() =>
        validateToolInvocationRequest({
          toolId: 'github.createPR',
          parameters: { repo: 'test' },
        })
      ).not.toThrow();
    });

    it('should throw ValidationError for missing toolId', () => {
      expect(() =>
        validateToolInvocationRequest({
          parameters: {},
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing parameters', () => {
      expect(() =>
        validateToolInvocationRequest({
          toolId: 'test',
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid parameters', () => {
      expect(() =>
        validateToolInvocationRequest({
          toolId: 'test',
          parameters: 'not-an-object' as any,
        })
      ).toThrow(ValidationError);
    });
  });

  describe('validateDeploymentRequest', () => {
    it('should accept valid GitHub deployment', () => {
      expect(() =>
        validateDeploymentRequest({
          name: 'my-server',
          source: { type: 'github', url: 'https://github.com/user/repo' },
          category: 'productivity',
        })
      ).not.toThrow();
    });

    it('should accept valid STDIO deployment', () => {
      expect(() =>
        validateDeploymentRequest({
          name: 'my-server',
          source: { type: 'stdio', command: 'npx server' },
          category: 'productivity',
        })
      ).not.toThrow();
    });

    it('should throw ValidationError for missing name', () => {
      expect(() =>
        validateDeploymentRequest({
          source: { type: 'github' },
          category: 'test',
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing source', () => {
      expect(() =>
        validateDeploymentRequest({
          name: 'test',
          category: 'test',
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing source.type', () => {
      expect(() =>
        validateDeploymentRequest({
          name: 'test',
          source: { url: 'test' },
          category: 'test',
        })
      ).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing category', () => {
      expect(() =>
        validateDeploymentRequest({
          name: 'test',
          source: { type: 'github' },
        })
      ).toThrow(ValidationError);
    });
  });
});
