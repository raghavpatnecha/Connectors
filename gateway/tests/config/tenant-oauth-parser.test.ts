/**
 * Config File Tests - Tenant OAuth Parser
 * Connectors Platform - Test YAML parsing and validation
 */

import { TenantOAuthParser } from '../../src/config/tenant-oauth-parser';

// Mock child_process to avoid yq dependency
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

const mockedExecSync = require('child_process').execSync as jest.MockedFunction<typeof import('child_process').execSync>;

describe('TenantOAuthParser', () => {
  let parser: TenantOAuthParser;

  beforeEach(() => {
    parser = new TenantOAuthParser();
    mockedExecSync.mockReset();
  });

  describe('Environment variable substitution', () => {
    it('should substitute environment variables correctly', async () => {
      process.env.TEST_CLIENT_ID = 'test-id-123';
      process.env.TEST_CLIENT_SECRET = 'test-secret-456';

      const mockConfig = {
        tenant_id: 'test-tenant',
        integrations: {
          notion: {
            client_id: '${TEST_CLIENT_ID}',
            client_secret: '${TEST_CLIENT_SECRET}',
            redirect_uri: 'https://example.com/callback'
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      expect(result.config!.integrations.notion.client_id).toBe('test-id-123');
      expect(result.config!.integrations.notion.client_secret).toBe('test-secret-456');

      delete process.env.TEST_CLIENT_ID;
      delete process.env.TEST_CLIENT_SECRET;
    });

    it('should detect missing environment variables', async () => {
      const mockConfig = {
        tenant_id: 'test-tenant',
        integrations: {
          notion: {
            client_id: '${MISSING_VAR}',
            client_secret: '${ANOTHER_MISSING}',
            redirect_uri: 'https://example.com/callback'
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      expect(result.success).toBe(false);
      expect(result.missingCredentials).toHaveLength(2);
      expect(result.missingCredentials).toContainEqual({
        integration: 'notion',
        field: 'client_id',
        envVar: 'MISSING_VAR',
        value: '${MISSING_VAR}'
      });
    });
  });

  describe('Schema validation', () => {
    it('should reject config without tenant_id', async () => {
      const mockConfig = {
        integrations: {
          notion: {
            client_id: 'id',
            client_secret: 'secret',
            redirect_uri: 'https://example.com'
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.message.includes('tenant_id'))).toBe(true);
    });

    it('should reject invalid tenant_id format', async () => {
      const mockConfig = {
        tenant_id: 'Invalid_ID!',
        integrations: {
          notion: {
            client_id: 'id',
            client_secret: 'secret',
            redirect_uri: 'https://example.com'
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.message.includes('tenant_id format'))).toBe(true);
    });

    it('should reject config without integrations', async () => {
      const mockConfig = {
        tenant_id: 'test-tenant',
        integrations: {}
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.message.includes('integration'))).toBe(true);
    });
  });

  describe('Field validation', () => {
    it('should require client_id', async () => {
      const mockConfig = {
        tenant_id: 'test-tenant',
        integrations: {
          notion: {
            client_secret: 'secret',
            redirect_uri: 'https://example.com'
            // missing client_id
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      // The parser should detect missing client_id
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require client_secret', async () => {
      const mockConfig = {
        tenant_id: 'test-tenant',
        integrations: {
          notion: {
            client_id: 'id',
            redirect_uri: 'https://example.com'
            // missing client_secret - this will be undefined
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      // The parser should detect missing client_secret
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate redirect_uri format', async () => {
      const mockConfig = {
        tenant_id: 'test-tenant',
        integrations: {
          notion: {
            client_id: 'id',
            client_secret: 'secret',
            redirect_uri: 'not-a-url'
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      // The parser should reject invalid URL format
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Valid configurations', () => {
    it('should accept valid single integration', async () => {
      const mockConfig = {
        tenant_id: 'test-tenant-001',
        integrations: {
          notion: {
            client_id: 'notion-client',
            client_secret: 'notion-secret',
            redirect_uri: 'https://example.com/callback'
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.config!.tenant_id).toBe('test-tenant-001');
      expect(result.config!.integrations.notion).toBeDefined();
    });

    it('should accept multiple integrations', async () => {
      const mockConfig = {
        tenant_id: 'multi-tenant',
        integrations: {
          notion: {
            client_id: 'notion-id',
            client_secret: 'notion-secret',
            redirect_uri: 'https://example.com/notion'
          },
          github: {
            client_id: 'github-id',
            client_secret: 'github-secret',
            redirect_uri: 'https://example.com/github',
            scopes: ['repo', 'user']
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      expect(result.success).toBe(true);
      expect(Object.keys(result.config!.integrations)).toHaveLength(2);
      expect(result.config!.integrations.notion).toBeDefined();
      expect(result.config!.integrations.github).toBeDefined();
      expect(result.config!.integrations.github.scopes).toEqual(['repo', 'user']);
    });
  });

  describe('Warnings', () => {
    it('should warn about disabled integrations', async () => {
      const mockConfig = {
        tenant_id: 'test-tenant',
        integrations: {
          notion: {
            client_id: 'id',
            client_secret: 'secret',
            redirect_uri: 'https://example.com',
            enabled: false
          }
        }
      };

      mockedExecSync.mockReturnValue(JSON.stringify(mockConfig));

      const result = await parser.parse('/fake/path.yaml');

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.type === 'disabled_integration')).toBe(true);
    });
  });

  describe('Format result', () => {
    it('should format successful result', async () => {
      const result = {
        success: true,
        config: {
          tenant_id: 'test-tenant',
          integrations: { notion: {} as any }
        } as any,
        errors: [],
        warnings: [],
        missingCredentials: []
      };

      const formatted = TenantOAuthParser.formatResult(result);

      expect(formatted).toContain('✅ Configuration valid');
      expect(formatted).toContain('test-tenant');
      expect(formatted).toContain('notion');
    });

    it('should format error result', async () => {
      const result = {
        success: false,
        errors: [
          { type: 'schema', message: 'Missing tenant_id' } as any
        ],
        warnings: [],
        missingCredentials: []
      };

      const formatted = TenantOAuthParser.formatResult(result);

      expect(formatted).toContain('❌ Configuration invalid');
      expect(formatted).toContain('Errors:');
      expect(formatted).toContain('Missing tenant_id');
    });
  });
});
