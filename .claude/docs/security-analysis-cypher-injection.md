# Cypher Injection Vulnerability Analysis - GraphRAG Service

## Executive Summary

**Severity**: HIGH 🔴

The GraphRAG service contains **critical Cypher injection vulnerabilities** in two methods that dynamically construct relationship type parameters without validation. The `type` parameter (representing Neo4j relationship labels) is directly string-interpolated into Cypher queries, bypassing parameterization.

---

## Vulnerability Details

### Root Cause

Neo4j Cypher has a fundamental limitation: **relationship types cannot be parameterized** like regular query parameters. Unlike node properties or values which can use `$paramName` syntax, relationship types must be hardcoded in the query string.

Current code incorrectly attempts to use string interpolation (`${type}`) which:
1. Bypasses Neo4j's parameter sanitization
2. Is vulnerable to injection attacks
3. Violates secure coding practices

---

## Vulnerable Code Locations

### 🔴 VULNERABILITY #1: `createRelationship` Method (Line 301-320)

**File**: `/home/user/Connectors/gateway/src/graph/graphrag-service.ts`

**Lines**: 307-316

```typescript
async createRelationship(payload: CreateRelationshipPayload): Promise<void> {
  const { fromToolId, toToolId, type, confidence } = payload;

  const session = this._connectionPool.getSession();

  try {
    const query = `
      MATCH (t1:Tool {id: $fromToolId})
      MATCH (t2:Tool {id: $toToolId})
      MERGE (t1)-[r:${type}]->(t2)          // ❌ VULNERABLE: Line 310
      SET r.confidence = $confidence,
          r.updatedAt = datetime()
      RETURN t1, r, t2
    `;

    await session.run(query, { fromToolId, toToolId, confidence });
  } finally {
    await session.close();
  }
}
```

**Vulnerability Type**: Cypher Injection via Relationship Type

**Input Parameter**: `type` from `CreateRelationshipPayload`

**Attack Vector Example**:
```typescript
// Malicious input
const payload = {
  fromToolId: "github.createPR",
  toToolId: "github.mergePR",
  type: "OFTEN_USED_WITH]->(dummy:Tool), MATCH (x:Tool)-[r:ANY]-(y:Tool) WHERE true //"
  // Result query:
  // MERGE (t1)-[r:OFTEN_USED_WITH]->(dummy:Tool), MATCH (x:Tool)-[r:ANY]-(y:Tool) WHERE true //]->(t2)
  // This breaks the query structure and allows arbitrary Cypher injection
}
```

---

### 🔴 VULNERABILITY #2: `batchCreateRelationships` Method (Line 339-361)

**File**: `/home/user/Connectors/gateway/src/graph/graphrag-service.ts`

**Lines**: 346-356

```typescript
async batchCreateRelationships(
  relationships: Array<{ from: string; to: string; confidence: number }>,
  type: RelationshipType                      // ❌ Parameter comes from caller
): Promise<number> {
  const session = this._connectionPool.getSession();

  try {
    const query = `
      UNWIND $relationships AS rel
      MATCH (t1:Tool {id: rel.from})
      MATCH (t2:Tool {id: rel.to})
      MERGE (t1)-[r:${type}]->(t2)            // ❌ VULNERABLE: Line 350
      SET r.confidence = rel.confidence,
          r.updatedAt = datetime()
      RETURN count(r) AS relationshipsCreated
    `;

    const result = await session.run(query, { relationships });
    return result.records[0]?.get('relationshipsCreated') || 0;
  } finally {
    await session.close();
  }
}
```

**Vulnerability Type**: Cypher Injection via Relationship Type

**Input Parameter**: `type` parameter (RelationshipType enum, but still vulnerable if circumvented)

---

### 🟡 RELATED ISSUES: Query Templates (queries.ts)

**File**: `/home/user/Connectors/gateway/src/graph/queries.ts`

**Locations**:
- Line 45: `CREATE_TOOL_RELATIONSHIP`
- Line 236: `BATCH_CREATE_RELATIONSHIPS`

```typescript
// Line 42-49
export const CREATE_TOOL_RELATIONSHIP = `
  MATCH (t1:Tool {id: $fromToolId})
  MATCH (t2:Tool {id: $toToolId})
  MERGE (t1)-[r:${`$type`}]->(t2)          // ❌ Incorrect template literal attempt
  SET r.confidence = $confidence,
      r.updatedAt = datetime()
  RETURN t1, r, t2
`;

// Line 232-240
export const BATCH_CREATE_RELATIONSHIPS = `
  UNWIND $relationships AS rel
  MATCH (t1:Tool {id: rel.from})
  MATCH (t2:Tool {id: rel.to})
  MERGE (t1)-[r:${`$type`}]->(t2)          // ❌ Incorrect template literal attempt
  SET r.confidence = rel.confidence,
      r.updatedAt = datetime()
  RETURN count(r) AS relationshipsCreated
`;
```

**Issue**: Uses `${`$type`}` which is a template literal of a string - ineffective and confusing.

---

## Impact Analysis

### Potential Attack Scenarios

#### Scenario 1: Unauthorized Data Disclosure
```typescript
// Attacker could inject query to bypass filters
type: "OFTEN_USED_WITH]->(dummy:Tool) RETURN * WHERE true//"
// Injects arbitrary RETURN clauses to expose all properties
```

#### Scenario 2: Data Modification/Deletion
```typescript
// Attacker could create arbitrary relationships or modify data
type: "OFTEN_USED_WITH]->(x:Tool) SET x.compromised=true//"
// Modifies tool properties
```

#### Scenario 3: Privilege Escalation
```typescript
// Could potentially access other tenant data if tenant isolation is weak
type: "OFTEN_USED_WITH]->(x:Tool {tenantId: 'different-tenant'}) SET x.data//"
```

### Risk Rating

| Factor | Rating | Details |
|--------|--------|---------|
| **Likelihood** | HIGH | `type` parameter may come from external APIs, user input, or untrusted sources |
| **Impact** | HIGH | Can access, modify, or delete Neo4j data; bypass authorization |
| **Exploitability** | MEDIUM | Requires understanding of Cypher syntax, but templates are available |
| **Overall CVSS** | 8.6 | High severity - requires immediate remediation |

---

## Current Validation Analysis

### ✅ What's Present

```typescript
// types.ts - RelationshipType enum defines allowed values
export enum RelationshipType {
  OFTEN_USED_WITH = 'OFTEN_USED_WITH',
  DEPENDS_ON = 'DEPENDS_ON',
  BELONGS_TO = 'BELONGS_TO',
  ALTERNATIVE_TO = 'ALTERNATIVE_TO',
  REPLACES = 'REPLACES',
  PRECEDES = 'PRECEDES'
}

// graphrag-service.ts - Type parameter uses enum
type: RelationshipType;
```

### ❌ What's Missing

1. **No runtime validation** - TypeScript types are stripped at runtime
2. **No whitelist enforcement** - Enum values aren't checked at runtime
3. **No input sanitization** - No validation function for the type parameter
4. **Parameterization bypass** - Direct string interpolation ignores Neo4j's safe parameter handling

---

## Recommended Fixes

### Fix Approach #1: Whitelist Validation (BEST - Immediate)

Create a validation function that enforces only allowed relationship types:

```typescript
// gateway/src/graph/validators.ts
const ALLOWED_RELATIONSHIP_TYPES = new Set<string>([
  'OFTEN_USED_WITH',
  'DEPENDS_ON',
  'BELONGS_TO',
  'ALTERNATIVE_TO',
  'REPLACES',
  'PRECEDES'
]);

export function validateRelationshipType(type: unknown): type is RelationshipType {
  if (typeof type !== 'string') {
    return false;
  }
  
  if (!ALLOWED_RELATIONSHIP_TYPES.has(type)) {
    throw new Error(
      `Invalid relationship type: ${type}. Allowed types: ${Array.from(ALLOWED_RELATIONSHIP_TYPES).join(', ')}`
    );
  }
  
  return true;
}

// Export allowed types for reference
export const RELATIONSHIP_TYPES = Array.from(ALLOWED_RELATIONSHIP_TYPES);
```

### Fix Approach #2: Dynamic Query Selection (SAFER - Recommended)

Create separate validated query templates for each relationship type:

```typescript
// gateway/src/graph/queries-by-type.ts
import { RelationshipType } from './types';

// Mapping of relationship types to pre-built, safe queries
const RELATIONSHIP_QUERY_MAP: Record<RelationshipType, string> = {
  [RelationshipType.OFTEN_USED_WITH]: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:OFTEN_USED_WITH]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  
  [RelationshipType.DEPENDS_ON]: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:DEPENDS_ON]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  
  [RelationshipType.BELONGS_TO]: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:BELONGS_TO]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  
  [RelationshipType.ALTERNATIVE_TO]: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:ALTERNATIVE_TO]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  
  [RelationshipType.REPLACES]: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:REPLACES]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `,
  
  [RelationshipType.PRECEDES]: `
    MATCH (t1:Tool {id: $fromToolId})
    MATCH (t2:Tool {id: $toToolId})
    MERGE (t1)-[r:PRECEDES]->(t2)
    SET r.confidence = $confidence,
        r.updatedAt = datetime()
    RETURN t1, r, t2
  `
};

export function getRelationshipQuery(type: RelationshipType): string {
  const query = RELATIONSHIP_QUERY_MAP[type];
  if (!query) {
    throw new Error(`Invalid relationship type: ${type}`);
  }
  return query;
}
```

### Fix Approach #3: Enum-based Safe Builder (TYPE-SAFE)

```typescript
// gateway/src/graph/query-builder.ts
import { RelationshipType } from './types';

export class RelationshipQueryBuilder {
  /**
   * Build a safe relationship creation query
   * Only accepts valid RelationshipType enum values
   */
  static createRelationshipQuery(type: RelationshipType): string {
    // Compile-time exhaustiveness check
    const typeMap: Record<RelationshipType, string> = {
      [RelationshipType.OFTEN_USED_WITH]: 'OFTEN_USED_WITH',
      [RelationshipType.DEPENDS_ON]: 'DEPENDS_ON',
      [RelationshipType.BELONGS_TO]: 'BELONGS_TO',
      [RelationshipType.ALTERNATIVE_TO]: 'ALTERNATIVE_TO',
      [RelationshipType.REPLACES]: 'REPLACES',
      [RelationshipType.PRECEDES]: 'PRECEDES'
    };

    const safeType = typeMap[type]; // Lookup via map (safe enumeration)
    
    return `
      MATCH (t1:Tool {id: $fromToolId})
      MATCH (t2:Tool {id: $toToolId})
      MERGE (t1)-[r:${safeType}]->(t2)
      SET r.confidence = $confidence,
          r.updatedAt = datetime()
      RETURN t1, r, t2
    `;
  }

  /**
   * Build a safe batch relationship creation query
   */
  static batchCreateRelationshipQuery(type: RelationshipType): string {
    const typeMap: Record<RelationshipType, string> = {
      [RelationshipType.OFTEN_USED_WITH]: 'OFTEN_USED_WITH',
      [RelationshipType.DEPENDS_ON]: 'DEPENDS_ON',
      [RelationshipType.BELONGS_TO]: 'BELONGS_TO',
      [RelationshipType.ALTERNATIVE_TO]: 'ALTERNATIVE_TO',
      [RelationshipType.REPLACES]: 'REPLACES',
      [RelationshipType.PRECEDES]: 'PRECEDES'
    };

    const safeType = typeMap[type];

    return `
      UNWIND $relationships AS rel
      MATCH (t1:Tool {id: rel.from})
      MATCH (t2:Tool {id: rel.to})
      MERGE (t1)-[r:${safeType}]->(t2)
      SET r.confidence = rel.confidence,
          r.updatedAt = datetime()
      RETURN count(r) AS relationshipsCreated
    `;
  }
}
```

---

## Before/After Code Examples

### Example 1: `createRelationship` Method Fix

**BEFORE (Vulnerable)**:
```typescript
async createRelationship(payload: CreateRelationshipPayload): Promise<void> {
  const { fromToolId, toToolId, type, confidence } = payload;
  const session = this._connectionPool.getSession();

  try {
    const query = `
      MATCH (t1:Tool {id: $fromToolId})
      MATCH (t2:Tool {id: $toToolId})
      MERGE (t1)-[r:${type}]->(t2)  // ❌ VULNERABLE
      SET r.confidence = $confidence,
          r.updatedAt = datetime()
      RETURN t1, r, t2
    `;

    await session.run(query, { fromToolId, toToolId, confidence });
  } finally {
    await session.close();
  }
}
```

**AFTER (Fixed - Option A: Validation)**:
```typescript
async createRelationship(payload: CreateRelationshipPayload): Promise<void> {
  const { fromToolId, toToolId, type, confidence } = payload;
  
  // Validate type parameter
  if (!validateRelationshipType(type)) {
    throw new Error(`Invalid relationship type: ${type}`);
  }

  const session = this._connectionPool.getSession();

  try {
    const query = RelationshipQueryBuilder.createRelationshipQuery(type);
    await session.run(query, { fromToolId, toToolId, confidence });
    
    logger.info('Relationship created', {
      fromToolId,
      toToolId,
      type,
      confidence
    });
  } catch (error) {
    logger.error('Failed to create relationship', {
      fromToolId,
      toToolId,
      type,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  } finally {
    await session.close();
  }
}
```

**AFTER (Fixed - Option B: Query Map)**:
```typescript
async createRelationship(payload: CreateRelationshipPayload): Promise<void> {
  const { fromToolId, toToolId, type, confidence } = payload;
  const session = this._connectionPool.getSession();

  try {
    // Get pre-built safe query for the relationship type
    const query = getRelationshipQuery(type); // Throws if type is invalid
    
    await session.run(query, { fromToolId, toToolId, confidence });
    
    logger.info('Relationship created', {
      fromToolId,
      toToolId,
      type,
      confidence
    });
  } catch (error) {
    logger.error('Failed to create relationship', {
      fromToolId,
      toToolId,
      type,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  } finally {
    await session.close();
  }
}
```

### Example 2: `batchCreateRelationships` Method Fix

**BEFORE (Vulnerable)**:
```typescript
async batchCreateRelationships(
  relationships: Array<{ from: string; to: string; confidence: number }>,
  type: RelationshipType
): Promise<number> {
  const session = this._connectionPool.getSession();

  try {
    const query = `
      UNWIND $relationships AS rel
      MATCH (t1:Tool {id: rel.from})
      MATCH (t2:Tool {id: rel.to})
      MERGE (t1)-[r:${type}]->(t2)  // ❌ VULNERABLE
      SET r.confidence = rel.confidence,
          r.updatedAt = datetime()
      RETURN count(r) AS relationshipsCreated
    `;

    const result = await session.run(query, { relationships });
    return result.records[0]?.get('relationshipsCreated') || 0;
  } finally {
    await session.close();
  }
}
```

**AFTER (Fixed)**:
```typescript
async batchCreateRelationships(
  relationships: Array<{ from: string; to: string; confidence: number }>,
  type: RelationshipType
): Promise<number> {
  // Validate type parameter
  if (!validateRelationshipType(type)) {
    throw new Error(`Invalid relationship type: ${type}`);
  }

  const session = this._connectionPool.getSession();

  try {
    // Get pre-built safe query
    const query = RelationshipQueryBuilder.batchCreateRelationshipQuery(type);

    const result = await session.run(query, { relationships });
    const relationshipsCreated = result.records[0]?.get('relationshipsCreated') || 0;
    
    logger.info('Batch relationships created', {
      count: relationshipsCreated,
      type,
      relationshipCount: relationships.length
    });
    
    return relationshipsCreated;
  } catch (error) {
    logger.error('Failed to batch create relationships', {
      type,
      count: relationships.length,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  } finally {
    await session.close();
  }
}
```

### Example 3: Validation Function Usage

**NEW FILE**: `/home/user/Connectors/gateway/src/graph/validators.ts`

```typescript
/**
 * GraphRAG Input Validators
 * Provides runtime validation for Neo4j query parameters
 */

import { RelationshipType } from './types';
import { logger } from '../logging/logger';

// Whitelist of allowed relationship types
const ALLOWED_RELATIONSHIP_TYPES = new Set<string>([
  RelationshipType.OFTEN_USED_WITH,
  RelationshipType.DEPENDS_ON,
  RelationshipType.BELONGS_TO,
  RelationshipType.ALTERNATIVE_TO,
  RelationshipType.REPLACES,
  RelationshipType.PRECEDES
]);

/**
 * Validate relationship type is in allowed list
 * Prevents Cypher injection via relationship type parameter
 * 
 * @param type - Relationship type to validate
 * @returns true if valid, throws otherwise
 * @throws Error if type is not in whitelist
 */
export function validateRelationshipType(type: unknown): type is RelationshipType {
  // Check type is string
  if (typeof type !== 'string') {
    logger.warn('Invalid relationship type format', { type, typeOf: typeof type });
    return false;
  }

  // Check against whitelist
  if (!ALLOWED_RELATIONSHIP_TYPES.has(type)) {
    logger.warn('Relationship type not in whitelist', {
      type,
      allowed: Array.from(ALLOWED_RELATIONSHIP_TYPES)
    });
    return false;
  }

  return true;
}

/**
 * Validate tool ID format (basic validation)
 * Prevents basic injection via tool IDs (though they're parameterized)
 */
export function validateToolId(toolId: unknown): toolId is string {
  if (typeof toolId !== 'string') {
    return false;
  }

  // Allow alphanumeric, dots, hyphens, underscores
  const toolIdRegex = /^[a-zA-Z0-9._-]+$/;
  return toolIdRegex.test(toolId);
}

/**
 * Validate category name
 */
export function validateCategory(category: unknown): category is string {
  if (typeof category !== 'string') {
    return false;
  }

  // Allow alphanumeric and spaces, hyphens
  const categoryRegex = /^[a-zA-Z0-9\s-]+$/;
  if (!categoryRegex.test(category)) {
    return false;
  }

  // Enforce length limits
  return category.length > 0 && category.length <= 255;
}

/**
 * Export whitelist for reference
 */
export const RELATIONSHIP_TYPES = Array.from(ALLOWED_RELATIONSHIP_TYPES) as RelationshipType[];
```

---

## Testing for the Vulnerability

### Test Case 1: Injection Attempt (Should Fail)

```typescript
// gateway/tests/security/cypher-injection.test.ts

describe('Cypher Injection Prevention', () => {
  let graphRAG: GraphRAGService;

  beforeEach(() => {
    graphRAG = new GraphRAGService();
  });

  it('should reject invalid relationship types', async () => {
    const maliciousPayload = {
      fromToolId: 'github.createPR',
      toToolId: 'github.mergePR',
      type: "OFTEN_USED_WITH]->(dummy:Tool), MATCH (x:Tool)-[r:ANY]-(y:Tool) WHERE true //" as any,
      confidence: 0.8
    };

    // Should throw error or reject
    await expect(graphRAG.createRelationship(maliciousPayload))
      .rejects.toThrow(/Invalid relationship type/i);
  });

  it('should accept only enum-defined relationship types', async () => {
    const validPayload: CreateRelationshipPayload = {
      fromToolId: 'github.createPR',
      toToolId: 'github.mergePR',
      type: RelationshipType.OFTEN_USED_WITH,
      confidence: 0.8
    };

    // Should succeed
    await expect(graphRAG.createRelationship(validPayload)).resolves.not.toThrow();
  });

  it('should reject relationship types not in whitelist', async () => {
    const invalidPayload = {
      fromToolId: 'github.createPR',
      toToolId: 'github.mergePR',
      type: 'CUSTOM_RELATIONSHIP' as any, // Not in enum
      confidence: 0.8
    };

    await expect(graphRAG.createRelationship(invalidPayload))
      .rejects.toThrow(/Invalid relationship type/i);
  });

  it('should sanitize batch relationship types', async () => {
    const validRelationships = [
      { from: 'github.createPR', to: 'github.mergePR', confidence: 0.8 }
    ];

    const maliciousType = "OFTEN_USED_WITH]->(x:Tool) SET x.hacked=true //" as any;

    await expect(
      graphRAG.batchCreateRelationships(validRelationships, maliciousType)
    ).rejects.toThrow(/Invalid relationship type/i);
  });

  it('should log security violations', async () => {
    const logSpy = jest.spyOn(logger, 'warn');

    try {
      await graphRAG.createRelationship({
        fromToolId: 'github.createPR',
        toToolId: 'github.mergePR',
        type: 'MALICIOUS_TYPE' as any,
        confidence: 0.8
      });
    } catch {}

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid relationship type'),
      expect.any(Object)
    );
  });
});
```

---

## Remediation Priority & Timeline

| Priority | Action | Timeline | Impact |
|----------|--------|----------|--------|
| **CRITICAL** | Add input validation to `createRelationship` & `batchCreateRelationships` | IMMEDIATE (1 hour) | Prevents injection attacks |
| **HIGH** | Implement query builder or query map pattern | 4 hours | Long-term maintainability |
| **HIGH** | Update queries.ts templates | 2 hours | Fix template issues |
| **MEDIUM** | Add comprehensive security tests | 3 hours | Prevent regression |
| **MEDIUM** | Add toolId/category validation | 2 hours | Defense in depth |

---

## Deployment Checklist

- [ ] Implement validators.ts with whitelist validation
- [ ] Add query builder or query map (choose one approach)
- [ ] Update graphrag-service.ts with validation checks
- [ ] Update/remove problematic query templates in queries.ts
- [ ] Add logging for validation failures
- [ ] Write security tests covering injection attempts
- [ ] Run full test suite to ensure no regressions
- [ ] Code review by security team
- [ ] Deploy to staging for penetration testing
- [ ] Deploy to production with monitoring
- [ ] Add CHANGELOG entry documenting security fix

---

## References

**CWE-943**: Improper Neutralization of Special Elements in Data Query Logic ('Cypher Injection')  
https://cwe.mitre.org/data/definitions/943.html

**OWASP**: SQL/NoSQL Injection (applies to Cypher)  
https://owasp.org/www-community/attacks/SQL_Injection

**Neo4j Security**: Parameterized Queries  
https://neo4j.com/docs/developer-manual/current/drivers-apis/

