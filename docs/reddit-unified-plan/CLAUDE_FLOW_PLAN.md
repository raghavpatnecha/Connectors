# Reddit Unified MCP Server - Claude Flow Implementation Plan

**Date:** 2025-11-13
**Pattern:** Based on successful LinkedIn implementation
**Strategy:** Parallel agent coordination for maximum efficiency
**Target:** Complete implementation in single session

---

## 🚀 Claude Flow Strategy

### **Golden Rule: "1 MESSAGE = ALL RELATED OPERATIONS"**

**CRITICAL PRINCIPLES:**
1. **Spawn ALL agents in ONE message** (not sequential)
2. **Batch ALL file operations** in ONE message
3. **Each agent gets COMPLETE instructions** (cannot ask questions mid-execution)
4. **TodoWrite tracks ALL tasks in ONE call** (5-10+ todos minimum)

**Learned from LinkedIn:** This approach achieved 100% implementation in ~4.5 hours with 10 parallel agents.

---

## 📋 Implementation Phases

### **Phase 1: Foundation Components (6 Agents in Parallel)**
**Duration:** ~2-3 hours
**Approach:** Spawn all 6 agents simultaneously in single message

### **Phase 2: Tool Implementation (9 Agents in Parallel)**
**Duration:** ~2-3 hours
**Approach:** Spawn all 9 tool agents simultaneously in single message

### **Phase 3: Integration & Testing (5 Agents in Parallel)**
**Duration:** ~1-2 hours
**Approach:** Spawn all 5 agents simultaneously in single message

### **Phase 4: Documentation & Polish (3 Agents in Parallel)**
**Duration:** ~30 minutes
**Approach:** Spawn all 3 agents simultaneously in single message

---

## 🎯 PHASE 1: Foundation Components

### **Single Message - Spawn 6 Agents Concurrently**

```
[SINGLE MESSAGE WITH 6 TASK TOOL CALLS]:

Task 1: OAuth Manager Agent
Task 2: Vault Client Agent
Task 3: Session Manager Agent
Task 4: Reddit Client Agent (Snoowrap wrapper)
Task 5: Rate Limiter Agent
Task 6: Cache Manager Agent

PLUS: TodoWrite with ALL Phase 1 tasks
```

---

### **Agent 1: OAuth Manager**
**File:** `src/auth/oauth-manager.ts`
**Lines:** ~300
**Duration:** ~30 minutes

**Agent Instructions:**
```
Create Reddit OAuth 2.0 Manager (src/auth/oauth-manager.ts) following this EXACT specification:

REQUIREMENTS:
- Reddit OAuth 2.0 Authorization Code Flow
- Application type: Web App (can keep secret)
- Token expiry: 1 hour (refresh at 55 min)
- Support duration=permanent for refresh tokens
- State validation (10 min expiry)
- Per-tenant credential management

INTERFACES:
interface RedditOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  duration: 'temporary' | 'permanent';
}

interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string[];
}

CLASS METHODS REQUIRED:
1. generateAuthUrl(tenantId: string, scopes?: string[]): string
   - Create Reddit authorization URL
   - Include state parameter (tenantId:timestamp:random)
   - Set duration=permanent for refresh tokens
   - Default scopes: identity, read, history, mysubreddits, submit, edit, vote

2. handleCallback(code: string, state: string): Promise<TokenSet>
   - Validate state parameter (check expiry < 10 min)
   - Exchange code for access_token + refresh_token
   - POST to https://www.reddit.com/api/v1/access_token
   - Use HTTP Basic Auth (client_id:client_secret)
   - Store in Vault via vaultClient

3. refreshToken(tenantId: string): Promise<TokenSet>
   - Retrieve refresh_token from Vault
   - POST to https://www.reddit.com/api/v1/access_token
   - grant_type=refresh_token
   - Update stored credentials

4. getValidToken(tenantId: string): Promise<string>
   - Get token from Vault
   - Check if expires in < 5 minutes
   - Auto-refresh if needed
   - Return valid access_token

5. scheduleTokenRefresh(tenantId: string, expiresAt: Date): void
   - Schedule refresh at 55 min mark (5 min before expiry)
   - Use setTimeout with cleanup on shutdown

ERROR HANDLING:
- RedditAuthError for OAuth failures
- State validation errors
- Token refresh failures
- Network errors with retry (3 attempts, exponential backoff)

LOGGING:
- Winston structured logging
- Log all OAuth events (auth start, callback, refresh, errors)
- NEVER log credentials or tokens

DEPENDENCIES:
- axios for HTTP requests
- winston for logging
- VaultClient for credential storage

Follow LinkedIn OAuth Manager pattern EXACTLY.
Return complete 300-line TypeScript implementation.
```

---

### **Agent 2: Vault Client**
**File:** `src/auth/vault-client.ts`
**Lines:** ~220
**Duration:** ~25 minutes

**Agent Instructions:**
```
Create HashiCorp Vault Client (src/auth/vault-client.ts) for Reddit credentials:

REQUIREMENTS:
- Per-tenant credential encryption (Transit engine)
- KV v2 storage
- Automatic transit key creation
- Health monitoring

CLASS METHODS:
1. constructor(vaultAddr: string, vaultToken: string, namespace: string)
   - Initialize node-vault client
   - Set namespace for multi-tenancy

2. healthCheck(): Promise<boolean>
   - Check Vault status
   - Return true if healthy and unsealed

3. ensureTransitKey(tenantId: string): Promise<void>
   - Create transit encryption key for tenant
   - Key path: transit/keys/${tenantId}
   - Skip if already exists

4. storeCredentials(tenantId: string, creds: TokenSet): Promise<void>
   - Encrypt access_token and refresh_token with transit key
   - Store in secret/data/${tenantId}/reddit
   - Include metadata (created_at, username, scopes)

5. getCredentials(tenantId: string): Promise<TokenSet>
   - Retrieve from secret/data/${tenantId}/reddit
   - Decrypt with transit key
   - Parse and return TokenSet

6. deleteCredentials(tenantId: string): Promise<void>
   - Delete secret/data/${tenantId}/reddit
   - For logout/revoke scenarios

ERROR HANDLING:
- VaultError for connection failures
- Sealed vault detection
- Key not found errors
- Encryption/decryption failures

LOGGING:
- Log all Vault operations (store, retrieve, delete)
- NEVER log decrypted credentials

DEPENDENCIES:
- node-vault
- winston

Follow LinkedIn Vault Client pattern EXACTLY.
Return complete 220-line TypeScript implementation.
```

---

### **Agent 3: Session Manager**
**File:** `src/auth/session-manager.ts`
**Lines:** ~200
**Duration:** ~25 minutes

**Agent Instructions:**
```
Create Session Manager (src/auth/session-manager.ts) for Reddit sessions:

REQUIREMENTS:
- Session persistence across restarts
- Encrypted session storage
- Automatic cleanup on shutdown
- Support for multiple tenants

CLASS METHODS:
1. constructor(oauthManager: OAuthManager, encryptionKey: string)
   - Initialize with OAuth manager
   - Setup encryption for session data

2. createSession(tenantId: string, tokens: TokenSet): Promise<void>
   - Store session data
   - Include username, scopes, created_at
   - Encrypt sensitive data

3. getSession(tenantId: string): Promise<SessionData | null>
   - Retrieve session for tenant
   - Decrypt if needed
   - Return null if not found

4. refreshSession(tenantId: string): Promise<void>
   - Refresh OAuth tokens
   - Update session data
   - Maintain session continuity

5. closeSession(tenantId?: string): Promise<void>
   - Close specific tenant session OR all sessions
   - Cleanup resources
   - Graceful shutdown

6. listActiveSessions(): Promise<string[]>
   - Return list of active tenant IDs
   - For monitoring/debugging

TYPES:
interface SessionData {
  tenantId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  username?: string;
  scopes: string[];
  createdAt: Date;
  lastAccessed: Date;
}

ERROR HANDLING:
- Session not found errors
- Encryption/decryption errors
- OAuth refresh failures

DEPENDENCIES:
- OAuthManager
- crypto (for encryption)
- winston

Follow LinkedIn Session Manager pattern.
Return complete 200-line TypeScript implementation.
```

---

### **Agent 4: Reddit Client (Snoowrap Wrapper)**
**File:** `src/clients/reddit-client.ts`
**Lines:** ~800
**Duration:** ~45 minutes

**Agent Instructions:**
```
Create Reddit API Client (src/clients/reddit-client.ts) wrapping Snoowrap:

REQUIREMENTS:
- Snoowrap integration
- Rate limiting (100 QPM for OAuth)
- Smart caching (50MB, 5 min TTL)
- Retry logic with exponential backoff
- User-agent management

CLASS METHODS (map to all 26 core tools):

BROWSE & DISCOVERY:
1. browseFrontpage(params: { limit, sort }): Promise<Submission[]>
2. browseSubreddit(params: { subreddit, sort, time, limit }): Promise<Submission[]>
3. browseSubredditNew(subreddit, limit): Promise<Submission[]>
4. browseSubredditTop(subreddit, time, limit): Promise<Submission[]>
5. browseSubredditRising(subreddit, limit): Promise<Submission[]>
6. browseSubredditControversial(subreddit, time, limit): Promise<Submission[]>
7. getTrendingSubreddits(): Promise<Subreddit[]>
8. browsePopular(limit): Promise<Submission[]>

SEARCH:
9. searchPosts(params: { query, subreddit?, sort, time, author, flair, limit }): Promise<Submission[]>
10. searchSubreddits(query, limit): Promise<Subreddit[]>

POSTS:
11. getPost(identifier: string | { id, subreddit }): Promise<Submission>
12. getPostByUrl(url): Promise<Submission>
13. getPostById(id): Promise<Submission>
14. getUserPosts(username, sort, limit): Promise<Submission[]>

COMMENTS:
15. getPostComments(postId, sort, limit, depth): Promise<Comment[]>
16. getUserComments(username, sort, limit): Promise<Comment[]>

SUBREDDIT INFO:
17. getSubredditInfo(subreddit): Promise<Subreddit>
18. getSubredditStats(subreddit): Promise<SubredditStats>

USER INFO:
19. getUserInfo(username): Promise<RedditUser>
20. getUserTrophies(username): Promise<Trophy[]>
21. getUserKarma(username): Promise<KarmaBreakdown>

AUTHENTICATED OPERATIONS (require OAuth):
22. whoAmI(): Promise<RedditUser>
23. createPost(subreddit, title, content, options): Promise<Submission>
24. postComment(postId, content): Promise<Comment>
25. replyToPost(postId, content): Promise<Comment>
26. replyToComment(commentId, content): Promise<Comment>

INITIALIZATION:
- constructor(tenantId, oauthManager, rateLimiter, cache)
- async initialize(): Initialize Snoowrap with OAuth tokens
- Configure rate limiting and retry logic
- Set user-agent: 'RedditUnifiedMCP/1.0.0'

CACHING:
- Cache GET requests (frontpage, browse, search, get_post, user_info)
- Cache key format: `${method}_${params_hash}`
- TTL: 5 minutes
- Invalidate on write operations

RATE LIMITING:
- Use injected RateLimiter
- Await rateLimiter.acquire() before each API call
- Handle 429 errors gracefully

ERROR HANDLING:
- RedditAPIError for API failures
- RedditNotFoundError for 404s
- RedditRateLimitError for 429s
- Retry on 5xx errors (3 attempts, exponential backoff)

DEPENDENCIES:
- snoowrap
- RateLimiter (injected)
- CacheManager (injected)
- OAuthManager (injected)
- winston

TYPES:
- Import from snoowrap: Submission, Comment, Subreddit, RedditUser
- Define custom types for stats, karma breakdown

Follow the architecture specified in ARCHITECTURE.md.
Return complete 800-line TypeScript implementation with all 26 methods.
```

---

### **Agent 5: Rate Limiter**
**File:** `src/clients/rate-limiter.ts`
**Lines:** ~150
**Duration:** ~20 minutes

**Agent Instructions:**
```
Create Token Bucket Rate Limiter (src/clients/rate-limiter.ts):

REQUIREMENTS:
- Token bucket algorithm
- 100 requests per minute (for OAuth)
- Smooth rate limiting (no bursts)
- Async/await support

CLASS METHODS:
1. constructor(requestsPerMinute: number)
   - Initialize token bucket
   - Set refill rate (tokens per second)
   - maxTokens = requestsPerMinute
   - tokens = requestsPerMinute (start full)

2. async acquire(): Promise<void>
   - Refill tokens based on time passed
   - If tokens < 1, wait until enough tokens available
   - Decrement token count
   - Return when slot acquired

3. refill(): void
   - Calculate tokens to add based on time passed
   - tokens = min(maxTokens, tokens + timePassed * refillRate)
   - Update lastRefill timestamp

4. getAvailableTokens(): number
   - Return current token count (for monitoring)

5. getRemainingWaitTime(): number
   - Calculate milliseconds until next token available
   - Return 0 if tokens available

ERROR HANDLING:
- No errors expected (internal logic)

LOGGING:
- Optional debug logging for rate limit events

DEPENDENCIES:
- None (pure TypeScript)

Follow the architecture specified in ARCHITECTURE.md EXACTLY.
Return complete 150-line TypeScript implementation.
```

---

### **Agent 6: Cache Manager**
**File:** `src/clients/cache-manager.ts`
**Lines:** ~200
**Duration:** ~25 minutes

**Agent Instructions:**
```
Create Smart Cache Manager (src/clients/cache-manager.ts):

REQUIREMENTS:
- LRU eviction policy
- Max size: 50MB
- TTL: 5 minutes (configurable)
- Size tracking
- Automatic cleanup

TYPES:
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  size: number;
}

interface CacheOptions {
  maxSize: number;  // bytes
  ttl: number;      // seconds
}

CLASS METHODS:
1. constructor(options: CacheOptions)
   - Initialize Map for storage
   - Set max size and TTL
   - currentSize = 0

2. get<T>(key: string): T | null
   - Check if key exists
   - Check if expired (delete if yes)
   - Return value or null

3. set<T>(key: string, value: T): void
   - Calculate size: JSON.stringify(value).length
   - Evict oldest entries if needed (LRU)
   - Store entry with expiry timestamp
   - Update currentSize

4. delete(key: string): void
   - Remove entry
   - Update currentSize

5. clear(): void
   - Clear all entries
   - Reset currentSize to 0

6. getStats(): CacheStats
   - Return { size: currentSize, entries: cache.size, hitRate }
   - Track hits/misses for hit rate calculation

7. startCleanup(): NodeJS.Timer
   - Setinterval to remove expired entries
   - Run every 1 minute
   - Return timer for cleanup

8. stopCleanup(timer): void
   - Clear interval timer

EVICTION LOGIC:
- When currentSize + newEntrySize > maxSize:
  - Remove oldest entry (first in Map)
  - Repeat until space available
  - Use Map iteration order (insertion order)

ERROR HANDLING:
- None expected (internal logic)

LOGGING:
- Optional debug logging for cache events

DEPENDENCIES:
- None (pure TypeScript)

Follow the architecture specified in ARCHITECTURE.md.
Return complete 200-line TypeScript implementation.
```

---

## 🎯 PHASE 2: Tool Implementation

### **Single Message - Spawn 9 Agents Concurrently**

```
[SINGLE MESSAGE WITH 9 TASK TOOL CALLS]:

Task 1: Browse Tools Agent (8 tools)
Task 2: Search Tools Agent (2 tools)
Task 3: Post Tools Agent (4 tools)
Task 4: Comment Tools Agent (3 tools)
Task 5: Subreddit Tools Agent (2 tools)
Task 6: User Tools Agent (3 tools)
Task 7: Utility Tools Agent (1 tool)
Task 8: Authenticated Tools Agent (6 tools)
Task 9: Tool Registry Helper Agent

PLUS: TodoWrite with ALL Phase 2 tasks
```

---

### **Agent 7-14: Tool Agents**

Each tool agent receives:
- **Tool count** to implement
- **RedditClient methods** to call
- **Zod schemas** for input validation
- **Output format** specification
- **Error handling** requirements

**Common Instructions for All Tool Agents:**
```
Create [CATEGORY] tools (src/tools/[category]-tools.ts):

PATTERN (for each tool):
registry.registerTool(
  'tool_name',
  'Tool description for LLM',
  z.object({
    // Parameters with descriptions
    param1: z.string().describe('Parameter description'),
    param2: z.number().min(1).max(100).default(25),
    tenantId: z.string()  // ALWAYS required
  }),
  async (params: any) => {
    logger.info('tool_name called', { tenantId: params.tenantId, params });

    try {
      const client = getClient(params.tenantId);
      const result = await client.methodName(params);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            // Structured output
          }, null, 2)
        }]
      };
    } catch (error) {
      logger.error('tool_name failed', { error, tenantId: params.tenantId });
      throw new Error(`Failed to [action]: ${(error as Error).message}`);
    }
  }
);

REQUIREMENTS:
- Import ToolRegistry from utils/tool-registry-helper
- Export single function: register[Category]Tools(registry, getClient)
- Follow Zod schema patterns
- Comprehensive error handling
- Structured logging
- Return MCP-compliant responses

Return complete [XXX]-line TypeScript implementation.
```

**Tool Counts:**
- Browse Tools: 8 tools, ~400 lines
- Search Tools: 2 tools, ~150 lines
- Post Tools: 4 tools, ~250 lines
- Comment Tools: 3 tools, ~200 lines
- Subreddit Tools: 2 tools, ~150 lines
- User Tools: 3 tools, ~200 lines
- Utility Tools: 1 tool, ~100 lines
- Authenticated Tools: 6 tools, ~300 lines

---

### **Agent 15: Tool Registry Helper**
**File:** `src/utils/tool-registry-helper.ts`
**Lines:** ~170

**Agent Instructions:**
```
Create Tool Registry Helper (src/utils/tool-registry-helper.ts):

THIS IS IDENTICAL TO LINKEDIN IMPLEMENTATION.

Copy LinkedIn's tool-registry-helper.ts EXACTLY:
- Handles tools/list request
- Handles tools/call request
- Zod to JSON schema conversion
- Error handling
- Logging

REQUIREMENTS:
- Support for zodToJsonSchema conversion
- MCP SDK 0.5.0 integration
- Comprehensive logging

Return the complete 170-line implementation from LinkedIn.
```

---

## 🎯 PHASE 3: Integration & Testing

### **Single Message - Spawn 5 Agents Concurrently**

```
[SINGLE MESSAGE WITH 5 TASK TOOL CALLS]:

Task 1: Main Server Agent (index.ts)
Task 2: Test Suite Agent (auth tests)
Task 3: Test Suite Agent (client tests)
Task 4: Test Suite Agent (tool tests)
Task 5: Integration Test Agent (e2e tests)

PLUS: TodoWrite with ALL Phase 3 tasks
```

---

### **Agent 16: Main Server**
**File:** `src/index.ts`
**Lines:** ~450
**Duration:** ~40 minutes

**Agent Instructions:**
```
Create Main Server (src/index.ts):

THIS FOLLOWS LINKEDIN PATTERN EXACTLY.

REQUIREMENTS:
1. Express server for OAuth callbacks (port 3001)
   - GET /oauth/authorize?tenant_id=X
   - GET /oauth/callback?code=X&state=Y
   - DELETE /oauth/revoke?tenant_id=X
   - GET /health

2. MCP server with stdio transport
   - Register all 26+ tools
   - Error handling
   - Graceful shutdown

3. Service initialization
   - Validate environment variables
   - Initialize Vault client
   - Create OAuth manager
   - Create session manager
   - Create rate limiter
   - Create cache manager
   - Setup Reddit client getter function

4. Tool registration
   - Create ToolRegistry
   - Register all tool categories:
     * Browse tools (8)
     * Search tools (2)
     * Post tools (4)
     * Comment tools (3)
     * Subreddit tools (2)
     * User tools (3)
     * Utility tools (1)
     * Authenticated tools (6)
   - Setup MCP server handlers

5. Graceful shutdown
   - SIGINT/SIGTERM handlers
   - Close session manager
   - Close HTTP server
   - Close MCP server

ERROR HANDLING:
- Startup errors (missing env vars, Vault unavailable)
- OAuth callback errors
- Tool execution errors
- Uncaught exceptions/rejections

LOGGING:
- Startup events
- OAuth events
- Tool calls
- Errors
- Shutdown events

DEPENDENCIES:
- @modelcontextprotocol/sdk
- express
- All auth components
- All clients
- All tool registrations
- winston

Follow LinkedIn's index.ts structure EXACTLY.
Return complete 450-line TypeScript implementation.
```

---

### **Agent 17-20: Test Suite Agents**

Each test agent implements comprehensive tests for their domain.

**Test Coverage Requirements:**
- Auth tests: OAuth flow, token refresh, Vault operations
- Client tests: Reddit API calls, rate limiting, caching
- Tool tests: Input validation, output formatting, error handling
- Integration tests: End-to-end OAuth, multi-tenant, full workflows

**Target:** 85%+ overall coverage

---

## 🎯 PHASE 4: Documentation & Polish

### **Single Message - Spawn 3 Agents Concurrently**

```
[SINGLE MESSAGE WITH 3 TASK TOOL CALLS]:

Task 1: README Agent
Task 2: OAuth Setup Guide Agent
Task 3: Troubleshooting Guide Agent

PLUS: TodoWrite with Phase 4 tasks
```

---

## 📊 Implementation Timeline

### **Estimated Total Time: 6-8 hours**

| Phase | Agents | Duration | Concurrent |
|-------|--------|----------|-----------|
| **Phase 1: Foundation** | 6 | 2-3 hours | ✅ Yes |
| **Phase 2: Tools** | 9 | 2-3 hours | ✅ Yes |
| **Phase 3: Integration** | 5 | 1-2 hours | ✅ Yes |
| **Phase 4: Documentation** | 3 | 30 min | ✅ Yes |

**Total Agents:** 23 parallel agents across 4 phases

---

## ✅ Success Criteria

### **Code Quality:**
- [ ] 0 TypeScript compilation errors
- [ ] 85%+ test coverage
- [ ] All 26 core tools implemented
- [ ] All tests passing (unit + integration + e2e)

### **Feature Completeness:**
- [ ] 100% coverage of all 5 source repos
- [ ] Multi-tenant OAuth working
- [ ] Rate limiting enforced (100 QPM)
- [ ] Smart caching operational
- [ ] Vault integration secure

### **Documentation:**
- [ ] README (user guide)
- [ ] OAuth setup instructions
- [ ] Troubleshooting guide
- [ ] API coverage documentation

### **Production Readiness:**
- [ ] Error handling comprehensive
- [ ] Logging structured and complete
- [ ] Security best practices followed
- [ ] Performance targets met

---

## 🎯 Execution Command

### **Phase 1 Execution (Example):**

```
I'm implementing Phase 1 of the Reddit Unified MCP server. I'll spawn 6 agents concurrently to build all foundation components.

[TodoWrite with all Phase 1 tasks]

[Task Tool Call 1: OAuth Manager Agent]
Description: Implement Reddit OAuth Manager
Prompt: [Complete Agent 1 instructions from above]
Subagent: coder

[Task Tool Call 2: Vault Client Agent]
Description: Implement Vault Client
Prompt: [Complete Agent 2 instructions from above]
Subagent: coder

[Task Tool Call 3: Session Manager Agent]
Description: Implement Session Manager
Prompt: [Complete Agent 3 instructions from above]
Subagent: coder

[Task Tool Call 4: Reddit Client Agent]
Description: Implement Snoowrap wrapper
Prompt: [Complete Agent 4 instructions from above]
Subagent: coder

[Task Tool Call 5: Rate Limiter Agent]
Description: Implement Rate Limiter
Prompt: [Complete Agent 5 instructions from above]
Subagent: coder

[Task Tool Call 6: Cache Manager Agent]
Description: Implement Cache Manager
Prompt: [Complete Agent 6 instructions from above]
Subagent: coder
```

**Repeat for Phases 2, 3, and 4 with their respective agents.**

---

## 📝 Critical Reminders

### **From LinkedIn Success:**

1. **Never assume** - Always fact-check Reddit API capabilities
2. **Complete instructions** - Agents can't ask questions mid-execution
3. **Single message spawns** - All related agents in ONE message
4. **TodoWrite batching** - Track ALL tasks in ONE call
5. **Follow patterns** - LinkedIn architecture is proven and tested

### **Reddit-Specific Considerations:**

1. **Rate limits are strict** - 100 QPM with OAuth, enforce it
2. **No OpenAPI spec** - Must manually map all endpoints
3. **Mature content restricted** - Limited NSFW access since July 2023
4. **1,000 post ceiling** - Cannot retrieve more than ~1,000 posts per listing
5. **User agent required** - Must use unique, descriptive user agent

---

**Status:** Implementation plan complete and ready for execution

**Next Step:** Execute Phase 1 with 6 concurrent agents
