# Google Workspace Utilities

Shared utility modules for all Google Workspace MCP servers.

## Overview

This package provides:
- **Error Mapping**: Standardized Google API error handling
- **Batch Operations**: Efficient batch request processing
- **Rate Limiting**: Per-service quota management
- **Logging**: Structured logging with Winston
- **TypeScript Types**: Shared types for all services

## Modules

### 1. Error Mapper

Maps Google API errors to standardized error types.

```typescript
import { mapGoogleAPIError, isRetryableError, getRetryDelay } from '@connectors/google-utils';

try {
  await gmail.users.messages.list({ userId: 'me' });
} catch (error: any) {
  const mappedError = mapGoogleAPIError(error, 'gmail');

  if (mappedError instanceof RateLimitError) {
    console.log('Rate limited, retry after:', mappedError.retryAfter);
  }

  if (isRetryableError(mappedError)) {
    const delay = getRetryDelay(mappedError, attemptNumber);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
```

**Error Types:**
- `GoogleAPIError` - Base error
- `RateLimitError` - 429 rate limit
- `QuotaExceededError` - 403 quota exceeded
- `AuthenticationError` - 401 auth failed
- `PermissionDeniedError` - 403 permission denied
- `NotFoundError` - 404 not found
- `InvalidRequestError` - 400 bad request
- `OAuthError` - OAuth flow errors
- `VaultError` - Vault storage errors

### 2. Batch Helper

Process multiple requests efficiently with concurrency control.

```typescript
import { executeBatch, retryWithBackoff, parallelBatch } from '@connectors/google-utils';

// Batch API calls
const requests = emails.map((email, index) => ({
  id: `email-${index}`,
  execute: () => gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: email.raw }
  })
}));

const results = await executeBatch(requests, {
  maxBatchSize: 100,
  concurrency: 10,
  delayBetweenBatches: 1000,
  continueOnError: true
});

// Retry with exponential backoff
const data = await retryWithBackoff(
  () => drive.files.get({ fileId: 'abc123' }),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 16000,
    shouldRetry: (error) => isRetryableError(error)
  }
);

// Parallel batch processing
const fileResults = await parallelBatch(
  fileIds,
  async (fileId) => drive.files.get({ fileId }),
  { concurrency: 5 }
);
```

**Functions:**
- `executeBatch<T>()` - Execute batch with concurrency
- `retryWithBackoff<T>()` - Retry with exponential backoff
- `parallelBatch<T, R>()` - Process array in parallel batches
- `rateLimitedMap<T, R>()` - Map with rate limiting
- `chunk<T>()` - Split array into chunks
- `delay()` - Promise-based delay

### 3. Rate Limiter

Implements token bucket algorithm for Google API quotas.

```typescript
import { globalRateLimiter, RateLimiter, rateLimit } from '@connectors/google-utils';

// Use global rate limiter
await globalRateLimiter.acquire('gmail');
const messages = await gmail.users.messages.list({ userId: 'me' });

// Check rate limit status
const status = globalRateLimiter.getStatus('gmail');
console.log('Tokens available:', status.tokensAvailable);
console.log('Minute usage:', status.minuteCountUsed);
console.log('Day usage:', status.dayCountUsed);

// Create custom rate limiter
const customLimiter = new RateLimiter({
  gmail: {
    requestsPerSecond: 50,
    requestsPerMinute: 500,
    requestsPerDay: 10_000_000,
    burstSize: 100
  }
});

// Use as decorator
class GmailService {
  @rateLimit('gmail')
  async sendEmail(to: string, subject: string, body: string) {
    // Rate limit automatically applied
    return gmail.users.messages.send({ /* ... */ });
  }
}
```

**Default Rate Limits:**

| Service  | Req/Sec | Req/Min | Req/Day     | Burst |
|----------|---------|---------|-------------|-------|
| Gmail    | 25      | 250     | 1,000,000,000 | 50    |
| Drive    | 10      | 1,000   | 20,000      | 20    |
| Calendar | 5       | 500     | 1,000,000   | 10    |
| Sheets   | 10      | 500     | 500         | 20    |
| Docs     | 5       | 300     | -           | 10    |
| Slides   | 5       | 300     | -           | 10    |
| Forms    | 5       | 300     | -           | 10    |
| Tasks    | 5       | 500     | -           | 10    |
| Chat     | 1       | 60      | -           | 5     |
| People   | 10      | 600     | -           | 20    |
| Admin    | 5       | 1,500   | 100,000     | 10    |

### 4. Logger

Structured logging with Winston.

```typescript
import {
  logger,
  logAPIRequest,
  logAPIResponse,
  logAPIError,
  logOAuthEvent,
  measureExecutionTime
} from '@connectors/google-utils';

// Standard logging
logger.info('Processing email batch', { count: 50, tenantId: 'tenant-123' });
logger.error('Failed to fetch file', { fileId: 'abc123', error: error.message });

// API logging
logAPIRequest('gmail', 'users.messages.list', { maxResults: 10 });
logAPIResponse('gmail', 'users.messages.list', 200, 145);
logAPIError('gmail', 'users.messages.send', error, { to: 'user@example.com' });

// OAuth logging
logOAuthEvent('token_refreshed', 'tenant-123', { expiresIn: 3600 });

// Performance measurement
const messages = await measureExecutionTime(
  'gmail.listMessages',
  () => gmail.users.messages.list({ userId: 'me', maxResults: 100 }),
  { tenantId: 'tenant-123' }
);

// Create child logger with context
const gmailLogger = createChildLogger({ service: 'gmail', tenantId: 'tenant-123' });
gmailLogger.info('Sending email');
```

**Log Output:**
```json
{
  "timestamp": "2024-11-14 22:30:15",
  "level": "info",
  "service": "google-workspace-mcp",
  "message": "Google API response",
  "method": "users.messages.list",
  "statusCode": 200,
  "latency": 145
}
```

### 5. TypeScript Types

Shared types for all Google Workspace services.

```typescript
import {
  TenantContext,
  MCPToolResult,
  PaginatedResponse,
  GmailMessageMetadata,
  DriveFileMetadata,
  CalendarEventMetadata,
  BatchOperationResult
} from '@connectors/google-utils';

// MCP tool result
const result: MCPToolResult<GmailMessageMetadata[]> = {
  success: true,
  data: messages,
  metadata: {
    service: 'gmail',
    operation: 'listMessages',
    timestamp: new Date().toISOString()
  }
};

// Paginated response
const response: PaginatedResponse<DriveFileMetadata> = {
  items: files,
  nextPageToken: 'abc123',
  totalItems: 1500
};

// Batch operation result
const batchResult: BatchOperationResult = {
  totalProcessed: 100,
  successCount: 95,
  errorCount: 5,
  results: [/* ... */]
};
```

**Available Types:**
- `TenantContext` - Tenant information
- `MCPToolResult<T>` - Standardized tool response
- `PaginatedResponse<T>` - Paginated data
- `BatchOperationResult<T>` - Batch operation results
- `GmailMessageMetadata` - Gmail message info
- `DriveFileMetadata` - Drive file info
- `CalendarEventMetadata` - Calendar event info
- `SpreadsheetMetadata` - Sheets metadata
- `DocumentMetadata` - Docs metadata
- `SharingSettings` - File sharing config
- `QuotaInfo` - API quota information
- `HealthCheckResult` - Service health
- And 15+ more...

## Usage Pattern

Typical MCP server implementation:

```typescript
import {
  GoogleClientFactory,
  OAuthManager,
  VaultClient
} from '@connectors/google-auth';

import {
  logger,
  globalRateLimiter,
  mapGoogleAPIError,
  executeBatch,
  MCPToolResult,
  GmailMessageMetadata
} from '@connectors/google-utils';

class GmailMCPServer {
  constructor(
    private clientFactory: GoogleClientFactory,
    private rateLimiter = globalRateLimiter
  ) {}

  async listMessages(
    tenantId: string,
    maxResults: number = 10
  ): Promise<MCPToolResult<GmailMessageMetadata[]>> {
    try {
      // Rate limit
      await this.rateLimiter.acquire('gmail');

      // Get authenticated client
      const gmail = await this.clientFactory.getGmailClient(tenantId);

      // API call
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults
      });

      logger.info('Messages listed', { count: response.data.messages?.length });

      return {
        success: true,
        data: response.data.messages as GmailMessageMetadata[],
        metadata: {
          service: 'gmail',
          operation: 'listMessages',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      const mappedError = mapGoogleAPIError(error, 'gmail');
      logger.error('Failed to list messages', { error: mappedError.message });

      return {
        success: false,
        error: {
          message: mappedError.message,
          code: mappedError.errorCode
        },
        metadata: {
          service: 'gmail',
          operation: 'listMessages',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}
```

## Environment Variables

```bash
# Logging
LOG_LEVEL=info  # debug | info | warn | error
NODE_ENV=production  # development | production
```

## Dependencies

```json
{
  "winston": "^3.11.0",
  "gaxios": "^6.1.0"
}
```

## License

MIT
