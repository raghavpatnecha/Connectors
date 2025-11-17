# Cypher Injection Vulnerabilities - Quick Reference

## Critical Issues Found

### Issue 1: `createRelationship()` - Line 310
**File**: `/home/user/Connectors/gateway/src/graph/graphrag-service.ts`

```typescript
MERGE (t1)-[r:${type}]->(t2)  // VULNERABLE
```

**Problem**: `type` parameter string-interpolated into relationship type  
**Fix**: Use whitelist validation + query builder pattern  
**Severity**: HIGH (CVSS 8.6)

---

### Issue 2: `batchCreateRelationships()` - Line 350
**File**: `/home/user/Connectors/gateway/src/graph/graphrag-service.ts`

```typescript
MERGE (t1)-[r:${type}]->(t2)  // VULNERABLE
```

**Problem**: Same as Issue 1, in batch operation  
**Fix**: Same approach as Issue 1  
**Severity**: HIGH (CVSS 8.6)

---

### Issue 3: Query Templates - Lines 45, 236
**File**: `/home/user/Connectors/gateway/src/graph/queries.ts`

```typescript
MERGE (t1)-[r:${`$type`}]->(t2)  // WRONG APPROACH
```

**Problem**: Template literals don't work for Neo4j relationship types  
**Fix**: Remove these templates, use dynamic query builder  
**Severity**: MEDIUM

---

## One-Line Fixes

### Quick Win (Temporary)
Add this validation before query execution:

```typescript
if (!['OFTEN_USED_WITH', 'DEPENDS_ON', 'BELONGS_TO', 'ALTERNATIVE_TO', 'REPLACES', 'PRECEDES'].includes(type)) {
  throw new Error(`Invalid relationship type: ${type}`);
}
```

### Proper Fix (Recommended)
Create `/home/user/Connectors/gateway/src/graph/query-builder.ts`:

```typescript
import { RelationshipType } from './types';

export class RelationshipQueryBuilder {
  static createRelationshipQuery(type: RelationshipType): string {
    const typeMap: Record<RelationshipType, string> = {
      'OFTEN_USED_WITH': 'OFTEN_USED_WITH',
      'DEPENDS_ON': 'DEPENDS_ON',
      'BELONGS_TO': 'BELONGS_TO',
      'ALTERNATIVE_TO': 'ALTERNATIVE_TO',
      'REPLACES': 'REPLACES',
      'PRECEDES': 'PRECEDES'
    };

    const safeType = typeMap[type];
    return `
      MATCH (t1:Tool {id: $fromToolId})
      MATCH (t2:Tool {id: $toToolId})
      MERGE (t1)-[r:${safeType}]->(t2)
      SET r.confidence = $confidence, r.updatedAt = datetime()
      RETURN t1, r, t2
    `;
  }
}
```

Then update methods to use:
```typescript
const query = RelationshipQueryBuilder.createRelationshipQuery(type);
```

---

## Attack Example

```typescript
// Malicious input
{
  type: "OFTEN_USED_WITH]->(x:Tool) SET x.hacked=true //"
}

// Results in executed query:
MERGE (t1)-[r:OFTEN_USED_WITH]->(x:Tool) SET x.hacked=true //]->(t2)
```

---

## Files to Review

1. `/home/user/Connectors/gateway/src/graph/graphrag-service.ts` - Lines 310, 350
2. `/home/user/Connectors/gateway/src/graph/queries.ts` - Lines 45, 236
3. `/home/user/Connectors/gateway/src/graph/types.ts` - RelationshipType enum

---

## Full Analysis

See: `/home/user/Connectors/.claude/docs/security-analysis-cypher-injection.md`

---

## Timeline to Fix

- **CRITICAL** (1 hour): Add validation
- **HIGH** (4 hours): Implement query builder  
- **MEDIUM** (2 hours): Update templates
- **MEDIUM** (3 hours): Add security tests

Total: ~10 hours of focused security work
