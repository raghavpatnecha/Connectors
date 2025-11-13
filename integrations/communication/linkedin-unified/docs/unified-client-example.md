# Unified Client - Smart Routing Example

## Overview

The UnifiedClient intelligently routes requests between the API Client (fast, reliable) and Browser Client (comprehensive, fallback).

## Routing Strategy

```
┌─────────────────┐
│ UnifiedClient   │
└────────┬────────┘
         │
   ┌─────┴─────┐
   ▼           ▼
┌──────┐   ┌─────────┐
│ API  │   │ Browser │
│Client│   │ Client  │
└──────┘   └─────────┘
```

## Method Routing Logic

### 1. searchPeople()
**Strategy**: API First → Browser Fallback

```typescript
const results = await unifiedClient.searchPeople({
  keywords: 'software engineer',
  location: 'San Francisco'
});

// Flow:
// 1. Try API Client (LinkedIn REST API)
// 2. If API fails (rate limit, 404, 503, etc.) → Browser Client
// 3. Return results from whichever succeeded
// lastUsedMethod: 'api' or 'browser'
```

### 2. getProfile()
**Strategy**: API for Basic → Browser for Comprehensive

```typescript
// Basic profile (uses API)
const basicProfile = await unifiedClient.getProfile('john-doe');

// Comprehensive profile (uses Browser)
const fullProfile = await unifiedClient.getProfile('john-doe', true);

// Flow:
// - If comprehensive=true → Browser directly
// - If profileUrl provided → Browser directly
// - Otherwise: Try API → Browser fallback
```

### 3. searchJobs()
**Strategy**: API Only (no browser fallback)

```typescript
const jobs = await unifiedClient.searchJobs({
  keywords: 'React developer',
  location: 'Remote'
});

// Uses: API Client only
```

### 4. browseFeed()
**Strategy**: Browser Only

```typescript
const posts = await unifiedClient.browseFeed(20);

// Uses: Browser Client (no API equivalent)
```

### 5. likePost()
**Strategy**: Browser Only

```typescript
const result = await unifiedClient.likePost('https://linkedin.com/feed/update/...');

// Uses: Browser Client (no API equivalent)
```

### 6. sendMessage()
**Strategy**: API Only

```typescript
const result = await unifiedClient.sendMessage('recipient-id', 'Hello!');

// Uses: API Client (more reliable than browser)
```

### 7. applyToJob()
**Strategy**: Browser Only

```typescript
const result = await unifiedClient.applyToJob('job-id-123', 'Cover letter...');

// Uses: Browser Client (no API equivalent)
```

## Fallback Decision Logic

```typescript
private shouldFallbackToBrowser(error: any): boolean {
  // Don't fallback if apiOnly option is set
  if (this.options.apiOnly) return false;

  // Fallback on these API errors:
  if (error instanceof LinkedInAPIError) {
    return error.statusCode === 429 ||  // Rate limit
           error.statusCode === 404 ||  // Not found
           error.statusCode === 503 ||  // Service unavailable
           error.statusCode === 500 ||  // Internal server error
           error.statusCode === 502;    // Bad gateway
  }

  // Never fallback on auth errors (need re-authentication)
  if (error instanceof LinkedInAuthError) return false;

  // Fallback on unknown errors
  return true;
}
```

## Complete Usage Example

```typescript
import { UnifiedClient } from './clients/unified-client';
import { OAuthManager } from './auth/oauth-manager';
import { SessionManager } from './auth/session-manager';

// Initialize clients
const oauthManager = new OAuthManager(config, vaultClient);
const sessionManager = new SessionManager(oauthManager, encryptionKey);

// Create unified client
const client = new UnifiedClient(
  'tenant-123',
  oauthManager,
  sessionManager,
  {
    preferBrowser: false,  // Use API when possible
    apiOnly: false         // Allow browser fallback
  }
);

// Search for people (API → Browser fallback)
try {
  const people = await client.searchPeople({
    keywords: 'AI engineer',
    location: 'New York',
    currentCompany: ['Google', 'Meta']
  });

  console.log(`Found ${people.length} profiles`);
  console.log(`Method used: ${client.getLastUsedMethod()}`); // 'api' or 'browser'

} catch (error) {
  console.error('Search failed:', error);
}

// Get comprehensive profile (uses Browser)
const profile = await client.getProfile('john-doe', true);
console.log(`Profile: ${profile.firstName} ${profile.lastName}`);
console.log(`Experience: ${profile.positions?.length} positions`);
console.log(`Education: ${profile.educations?.length} schools`);

// Browse feed (Browser only)
const feedPosts = await client.browseFeed(10);
console.log(`Feed: ${feedPosts.length} posts`);

// Like a post (Browser only)
await client.likePost('https://linkedin.com/feed/update/urn:li:activity:123');

// Send message (API only)
await client.sendMessage('recipient-urn', 'Hello from unified client!');

// Apply to job (Browser only)
const applied = await client.applyToJob('job-123', 'Cover letter text...');
console.log(`Application: ${applied.success ? 'Success' : 'Failed'}`);

// Cleanup
await client.close();
```

## Benefits of Smart Routing

1. **Performance**: API calls are faster than browser automation
2. **Reliability**: Browser provides fallback when API fails
3. **Comprehensive Data**: Browser scraping gets data not in API
4. **Rate Limit Handling**: Automatic fallback when rate limited
5. **Transparent**: Single interface, automatic routing
6. **Debugging**: Track which method was used via `getLastUsedMethod()`

## Error Scenarios

### Scenario 1: API Rate Limited
```
User: searchPeople()
  → UnifiedClient tries API
  → API returns 429 (Rate Limit)
  → UnifiedClient falls back to Browser
  → Browser returns results
  → lastUsedMethod = 'browser'
```

### Scenario 2: Both API and Browser Fail
```
User: searchPeople()
  → UnifiedClient tries API
  → API fails (503)
  → UnifiedClient tries Browser
  → Browser fails (timeout)
  → Throw error to user
```

### Scenario 3: Auth Error
```
User: searchPeople()
  → UnifiedClient tries API
  → API returns LinkedInAuthError (invalid token)
  → No fallback (auth needs fixing)
  → Throw error to user
```

## Configuration Options

```typescript
// Option 1: Default (smart routing)
const client = new UnifiedClient(tenantId, oauth, session);

// Option 2: Force browser for everything
const client = new UnifiedClient(tenantId, oauth, session, {
  preferBrowser: true
});

// Option 3: API only (no browser fallback)
const client = new UnifiedClient(tenantId, oauth, session, {
  apiOnly: true
});
```
