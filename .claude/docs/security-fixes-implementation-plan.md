# Security Vulnerabilities - Implementation Plan
**Created:** 2025-11-21
**Status:** In Progress
**Priority:** CRITICAL - Production Blocker

---

## 📋 OVERVIEW

This plan addresses 8 security vulnerabilities identified in the security audit:
- **3 Critical** vulnerabilities (RCE, Auth Bypass, DDoS)
- **2 High** vulnerabilities (Credential Exposure)
- **3 Medium** vulnerabilities (Token Exposure, Injection Prevention, Cache Security)

**Timeline:** 2-3 days for critical fixes, 1 week for complete implementation

---

## 🎯 PHASE 1: CRITICAL FIXES (Day 1 - IMMEDIATE)

### 1.1 Command Injection Fix (RCE Prevention)
**File:** `gateway/src/config/tenant-oauth-parser.ts`
**Line:** 198
**Priority:** 🚨 CRITICAL
**Estimated Time:** 30 minutes

**Current Code:**
```typescript
const jsonStr = execSync(`yq eval -o=json '.' "${configPath}"`, {
  encoding: 'utf-8',
  maxBuffer: 10 * 1024 * 1024,
});
```

**Fix Implementation:**
```typescript
import { spawnSync } from 'child_process';

private async _loadYaml(configPath: string): Promise<TenantOAuthConfig | null> {
  try {
    // SECURITY: Use spawn with array args to prevent command injection
    const result = spawnSync('yq', ['eval', '-o=json', '.', configPath], {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      shell: false, // Explicitly disable shell
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      logger.error('yq command failed', {
        stderr: result.stderr,
        status: result.status,
      });
      throw new Error(`yq command failed: ${result.stderr}`);
    }

    return JSON.parse(result.stdout) as TenantOAuthConfig;
  } catch (error) {
    // Fallback to JSON parsing
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content) as TenantOAuthConfig;
    } catch {
      return null;
    }
  }
}
```

**Testing:**
- Test with normal YAML files
- Test with malicious filenames: `$(whoami).yaml`, `\`id\`.yaml`
- Verify shell metacharacters are not executed
- Test fallback JSON parsing

---

### 1.2 OAuth Token Type Injection Fix
**File:** `gateway/src/auth/oauth-proxy.ts`
**Line:** 164
**Priority:** 🚨 CRITICAL
**Estimated Time:** 45 minutes

**Current Code:**
```typescript
const headers = {
  ...req.headers,
  'Authorization': `${creds.tokenType} ${creds.accessToken}`
};
```

**Fix Implementation:**

1. Add constant for valid token types:
```typescript
// Add at top of file after imports
const VALID_TOKEN_TYPES = new Set(['Bearer', 'bearer', 'MAC', 'mac']);
const DEFAULT_TOKEN_TYPE = 'Bearer';
```

2. Add validation function:
```typescript
/**
 * Validate and normalize token type to prevent injection
 * @param tokenType - Token type from credentials
 * @returns Normalized token type
 * @throws OAuthError if invalid
 */
private _validateTokenType(tokenType: string | undefined, integration: string, tenantId: string): string {
  // Default to Bearer if not specified
  if (!tokenType) {
    return DEFAULT_TOKEN_TYPE;
  }

  // Normalize to title case for comparison
  const normalized = tokenType.charAt(0).toUpperCase() + tokenType.slice(1).toLowerCase();

  // Validate against whitelist
  if (!VALID_TOKEN_TYPES.has(normalized) && !VALID_TOKEN_TYPES.has(tokenType)) {
    logger.error('Invalid token type attempted', {
      tokenType,
      integration,
      tenantId,
      allowed: Array.from(VALID_TOKEN_TYPES),
    });

    throw new OAuthError(
      `Invalid token type: ${tokenType}. Allowed types: ${Array.from(VALID_TOKEN_TYPES).join(', ')}`,
      integration,
      tenantId
    );
  }

  return normalized;
}
```

3. Update header injection (line 161-165):
```typescript
// 2. Validate and inject auth header
const validatedTokenType = this._validateTokenType(creds.tokenType, integration, tenantId);
const headers = {
  ...req.headers,
  'Authorization': `${validatedTokenType} ${creds.accessToken}`
};
```

**Testing:**
- Test with valid token types: 'Bearer', 'bearer', 'MAC'
- Test with invalid token types: 'Basic', '${INJECTION}', 'Bearer; rm -rf'
- Test with undefined token type (should default to 'Bearer')
- Test with malformed token types

---

### 1.3 Rate Limiter Bypass Fix
**File:** `gateway/src/middleware/rate-limiter.ts`
**Line:** 184-188
**Priority:** 🔴 HIGH
**Estimated Time:** 1 hour

**Current Code:**
```typescript
skip: (req: Request) => {
  const tenantId = extractTenantId(req);
  return !tenantId || isExemptPath(req.path);
}
```

**Fix Implementation:**

1. Update tenant rate limiter to apply global default:
```typescript
export function createTenantRateLimiter(): RequestHandler {
  const store = createRedisStore(`${KEY_PREFIX}tenant:`);

  const limiter = rateLimit({
    windowMs: 60000, // 1 minute window
    max: TENANT_RATE_LIMIT,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    skip: (req: Request) => {
      // Only skip exempt paths (health checks, monitoring)
      // DO NOT skip on missing tenantId - apply default limits
      return isExemptPath(req.path);
    },
    handler: (req: Request, res: Response) => {
      (req as any).rateLimitScope = 'tenant';
      rateLimitHandler(req, res);
    },
    keyGenerator: (req: Request) => {
      const tenantId = extractTenantId(req);
      // If no tenant ID, use IP address for rate limiting
      // This prevents bypass through tenantId omission
      if (!tenantId) {
        const ip = req.ip || 'unknown';
        logger.warn('Request without tenant ID, using IP-based rate limiting', {
          ip,
          path: req.path,
          method: req.method,
        });
        return `no-tenant:${ip}`;
      }
      return tenantId;
    },
  });

  return limiter;
}
```

2. Add configuration for anonymous request limits:
```typescript
// Add at top of file
const ANONYMOUS_RATE_LIMIT = parseInt(process.env.RATE_LIMIT_ANONYMOUS_RPS || '10', 10);

// Update createTenantRateLimiter to use different limits
max: (req: Request) => {
  const tenantId = extractTenantId(req);
  // Lower limit for anonymous requests
  return tenantId ? TENANT_RATE_LIMIT : ANONYMOUS_RATE_LIMIT;
}
```

**Testing:**
- Test with valid tenant ID
- Test without tenant ID (should use IP-based limiting)
- Test with multiple requests from same IP without tenant ID
- Test exempt paths still work
- Test rate limit headers are correct

---

## 🎯 PHASE 2: HIGH PRIORITY FIXES (Day 1-2)

### 2.1 Hardcoded Credentials Fix
**File:** `docker-compose.yml`
**Lines:** 28, 88, 123
**Priority:** 🔴 HIGH
**Estimated Time:** 1 hour

**Fix Implementation:**

1. Create `.env.example` file:
```bash
# Vault Configuration
VAULT_DEV_ROOT_TOKEN_ID=your-secure-vault-token-here

# Neo4j Configuration
NEO4J_PASSWORD=your-secure-neo4j-password-here

# Redis Configuration (optional)
REDIS_PASSWORD=your-secure-redis-password-here
```

2. Update `docker-compose.yml`:
```yaml
vault:
  environment:
    - VAULT_DEV_ROOT_TOKEN_ID=${VAULT_DEV_ROOT_TOKEN_ID}

neo4j:
  environment:
    - NEO4J_AUTH=neo4j/${NEO4J_PASSWORD}

gateway:
  environment:
    - NEO4J_PASSWORD=${NEO4J_PASSWORD}
```

3. Create setup script `.claude/docs/security-setup.md`:
```markdown
# Security Setup

## Initial Configuration

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Generate secure credentials:
   ```bash
   # Vault token (32 random characters)
   echo "VAULT_DEV_ROOT_TOKEN_ID=$(openssl rand -hex 16)" >> .env

   # Neo4j password (24 random characters)
   echo "NEO4J_PASSWORD=$(openssl rand -base64 24)" >> .env
   ```

3. Update `.gitignore` to exclude `.env`:
   ```
   .env
   .env.local
   .env.*.local
   ```
```

4. Update `.gitignore`:
```
# Environment variables
.env
.env.local
.env.*.local
.env.production
.env.staging
```

**Testing:**
- Verify services start with environment variables
- Verify `.env` is not committed to git
- Test with missing environment variables (should fail gracefully)

---

## 🎯 PHASE 3: MEDIUM PRIORITY FIXES (Day 2-3)

### 3.1 Vault Token Exposure Fix
**File:** `gateway/src/auth/vault-client.ts`
**Lines:** 62-65
**Priority:** 🟡 MEDIUM
**Estimated Time:** 1 hour

**Fix Implementation:**

1. Add response interceptor to sanitize errors:
```typescript
constructor(config: VaultConfig) {
  // ... existing code ...

  // Request interceptor (existing)
  this._client.interceptors.request.use((requestConfig) => {
    requestConfig.headers['X-Vault-Token'] = this._vaultToken;
    return requestConfig;
  });

  // SECURITY: Add response interceptor to sanitize errors
  this._client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Sanitize Vault token from error responses
      if (error.config?.headers) {
        error.config.headers = this._sanitizeHeaders(error.config.headers);
      }
      if (error.request?.headers) {
        error.request.headers = this._sanitizeHeaders(error.request.headers);
      }
      return Promise.reject(error);
    }
  );

  logger.info('VaultClient initialized', {
    address: config.address,
    transitEngine: this._transitEngine,
    kvEngine: this._kvEngine,
  });
}

/**
 * Sanitize headers to remove sensitive tokens
 * @private
 */
private _sanitizeHeaders(headers: any): any {
  if (!headers) return headers;

  const sanitized = { ...headers };
  if (sanitized['X-Vault-Token']) {
    sanitized['X-Vault-Token'] = '[REDACTED]';
  }
  if (sanitized['x-vault-token']) {
    sanitized['x-vault-token'] = '[REDACTED]';
  }
  return sanitized;
}
```

2. Add token rotation reminder:
```typescript
/**
 * TODO: Implement token rotation
 * - Create new Vault token before expiration
 * - Update _vaultToken atomically
 * - Schedule periodic rotation (e.g., every 24 hours)
 */
private async _rotateToken(): Promise<void> {
  throw new Error('Token rotation not yet implemented');
}
```

**Testing:**
- Trigger Vault errors and verify tokens are redacted in logs
- Test with valid and invalid Vault tokens
- Verify normal operations still work

---

### 3.2 Cypher Query Parameterization
**File:** `gateway/src/graph/graphrag-service.ts`
**Lines:** 344, 402
**Priority:** 🟡 MEDIUM
**Estimated Time:** 1.5 hours

**Fix Implementation:**

1. Create parameterized query map:
```typescript
/**
 * Parameterized Cypher queries by relationship type
 * SECURITY: Using parameterized queries instead of string interpolation
 */
const RELATIONSHIP_QUERIES = {
  OFTEN_USED_WITH: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:OFTEN_USED_WITH]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  DEPENDS_ON: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:DEPENDS_ON]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  ALTERNATIVE_TO: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:ALTERNATIVE_TO]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  REPLACES: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:REPLACES]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  PRECEDES: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:PRECEDES]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  BELONGS_TO: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:BELONGS_TO]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
} as const;

type RelationshipQueryType = keyof typeof RELATIONSHIP_QUERIES;
```

2. Update `createRelationship` method:
```typescript
async createRelationship(payload: CreateRelationshipPayload): Promise<void> {
  const { fromToolId, toToolId, type, confidence } = payload;

  // SECURITY: Validate relationship type to prevent injection
  validateRelationshipType(type);

  // Get parameterized query for this relationship type
  const query = RELATIONSHIP_QUERIES[type as RelationshipQueryType];

  if (!query) {
    throw new InvalidRelationshipTypeError(
      `No query defined for relationship type: ${type}`,
      type
    );
  }

  const session = this._connectionPool.getSession();

  try {
    await session.run(query, { fromToolId, toToolId, confidence });

    logger.info('Relationship created', {
      fromToolId,
      toToolId,
      type,
      confidence,
    });
  } catch (error) {
    logger.error('Failed to create relationship', {
      fromToolId,
      toToolId,
      type,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    await session.close();
  }
}
```

3. Update `batchCreateRelationships` method similarly

**Testing:**
- Test all relationship types work correctly
- Verify no SQL injection possible
- Test with invalid relationship types
- Benchmark performance impact

---

### 3.3 Timing Attack Fix
**File:** `gateway/src/middleware/authenticate-api-key.ts`
**Line:** 153-158
**Priority:** 🟡 MEDIUM
**Estimated Time:** 45 minutes

**Fix Implementation:**

1. Add crypto.timingSafeEqual utility:
```typescript
import { timingSafeEqual } from 'crypto';

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function constantTimeEqual(a: string, b: string): boolean {
  try {
    // Convert to buffers for constant-time comparison
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');

    // If lengths differ, still compare to maintain constant time
    // Pad shorter buffer to match longer one
    const maxLen = Math.max(bufA.length, bufB.length);
    const paddedA = Buffer.alloc(maxLen);
    const paddedB = Buffer.alloc(maxLen);

    bufA.copy(paddedA);
    bufB.copy(paddedB);

    return timingSafeEqual(paddedA, paddedB) && a.length === b.length;
  } catch {
    return false;
  }
}
```

2. Update validation logic:
```typescript
middleware() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AuthenticationError(
          'Missing Authorization header. Please provide an API key using: Authorization: Bearer <api-key>',
          'MISSING_AUTH_HEADER'
        );
      }

      // Validate Bearer token format
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new AuthenticationError(
          'Invalid Authorization header format. Expected: Authorization: Bearer <api-key>',
          'INVALID_AUTH_FORMAT'
        );
      }

      const apiKey = parts[1];

      // SECURITY: Use constant-time comparison for length check
      // Validate minimum length without revealing exact length
      const MIN_KEY_LENGTH = 32;
      const isValidLength = apiKey && apiKey.length >= MIN_KEY_LENGTH;

      if (!isValidLength) {
        // Don't reveal actual length in error message
        throw new AuthenticationError(
          'Invalid API key format.',
          'INVALID_API_KEY_FORMAT'
        );
      }

      // ... rest of validation
    }
  }
}
```

**Testing:**
- Test with valid API keys of various lengths
- Test with short API keys
- Measure timing to verify constant time

---

### 3.4 Secure API Key Cache
**File:** `gateway/src/middleware/authenticate-api-key.ts`
**Lines:** 89-95
**Priority:** 🟡 MEDIUM
**Estimated Time:** 2 hours

**Fix Implementation:**

1. Use crypto for cache key hashing:
```typescript
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * APIKeyAuthenticator with encrypted cache storage
 */
export class APIKeyAuthenticator {
  private readonly _vault: VaultClient;
  private readonly _cache: Map<string, CacheEntry>;
  private readonly _cacheEncryptionKey: Buffer;
  private _cleanupInterval: NodeJS.Timeout | null = null;

  constructor(vaultClient: VaultClient, cacheEncryptionKey?: Buffer) {
    this._vault = vaultClient;
    this._cache = new Map<string, CacheEntry>();

    // Generate or use provided encryption key for cache
    this._cacheEncryptionKey = cacheEncryptionKey || randomBytes(32);

    this._startCleanupInterval();

    logger.info('APIKeyAuthenticator initialized with encrypted cache');
  }

  /**
   * Hash API key for cache lookup (prevents plain storage)
   */
  private _hashAPIKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Encrypt auth context for cache storage
   */
  private _encryptAuthContext(context: AuthContext): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this._cacheEncryptionKey, iv);

    const plaintext = JSON.stringify(context);
    let encrypted = cipher.update(plaintext, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return IV + authTag + encrypted data
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
  }

  /**
   * Decrypt auth context from cache
   */
  private _decryptAuthContext(encrypted: string): AuthContext {
    const iv = Buffer.from(encrypted.slice(0, 32), 'hex');
    const authTag = Buffer.from(encrypted.slice(32, 64), 'hex');
    const ciphertext = encrypted.slice(64);

    const decipher = createDecipheriv('aes-256-gcm', this._cacheEncryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return JSON.parse(decrypted) as AuthContext;
  }

  /**
   * Get API key from cache (with encryption)
   */
  private _getFromCache(apiKey: string): AuthContext | null {
    const hashedKey = this._hashAPIKey(apiKey);
    const entry = this._cache.get(hashedKey);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this._cache.delete(hashedKey);
      return null;
    }

    try {
      return this._decryptAuthContext(entry.encryptedContext);
    } catch (error) {
      logger.error('Failed to decrypt cached auth context', { error });
      this._cache.delete(hashedKey);
      return null;
    }
  }

  /**
   * Add API key to cache (with encryption)
   */
  private _addToCache(apiKey: string, authContext: AuthContext): void {
    const hashedKey = this._hashAPIKey(apiKey);
    const encryptedContext = this._encryptAuthContext(authContext);

    this._cache.set(hashedKey, {
      encryptedContext,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }
}

/**
 * Updated cache entry interface
 */
interface CacheEntry {
  encryptedContext: string;
  expiresAt: number;
}
```

**Testing:**
- Test cache encryption/decryption
- Test with memory inspection (keys should be hashed)
- Test performance impact
- Test cache expiration

---

## 🧪 PHASE 4: TESTING & VALIDATION (Day 3)

### 4.1 Security Test Suite
**Location:** `gateway/tests/security/`
**Priority:** HIGH
**Estimated Time:** 3 hours

Create comprehensive security tests:

1. **Command Injection Tests** (`command-injection.test.ts`)
2. **OAuth Token Injection Tests** (`oauth-token-injection.test.ts`)
3. **Rate Limiter Tests** (`rate-limiter-bypass.test.ts`)
4. **Cypher Injection Tests** (`cypher-injection.test.ts`)
5. **Timing Attack Tests** (`timing-attack.test.ts`)
6. **Cache Security Tests** (`cache-security.test.ts`)

---

## 📝 PHASE 5: DOCUMENTATION (Day 3)

### 5.1 Security Documentation
**Location:** `.claude/docs/security-improvements.md`

Document all fixes, security best practices, and future recommendations.

---

## ✅ COMPLETION CHECKLIST

- [ ] All critical fixes implemented and tested
- [ ] All high priority fixes implemented and tested
- [ ] All medium priority fixes implemented and tested
- [ ] Security test suite created and passing
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Changes committed to feature branch
- [ ] Pull request created with security details
- [ ] Security audit re-run to verify fixes

---

## 🚀 DEPLOYMENT PLAN

1. **Staging Deployment**
   - Deploy to staging environment
   - Run security tests
   - Perform manual penetration testing
   - Verify no regressions

2. **Production Deployment**
   - Create detailed deployment plan
   - Backup all data
   - Deploy during maintenance window
   - Monitor for issues
   - Rollback plan ready

---

**Next Steps:** Begin implementation of Phase 1 critical fixes immediately.
