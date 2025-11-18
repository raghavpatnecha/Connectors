# TypeScript SDK - Error Handling

The Connectors SDK provides typed errors for different failure scenarios, making it easy to handle errors appropriately.

## Error Hierarchy

```
ConnectorsError (base)
├── NetworkError
├── AuthenticationError
├── RateLimitError
├── ToolSelectionError
├── ToolInvocationError
├── ToolNotFoundError
├── ServerNotFoundError
├── DeploymentError
│   ├── DeploymentTimeoutError
│   └── DeploymentFailedError
└── ValidationError
```

## Base Error

### `ConnectorsError`

Base class for all SDK errors.

```typescript
class ConnectorsError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'ConnectorsError';
  }
}
```

## Network Errors

### `NetworkError`

Thrown when network communication with the gateway fails.

```typescript
class NetworkError extends ConnectorsError {
  constructor(
    message: string,
    public readonly url: string,
    public readonly cause?: Error
  ) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}
```

**Examples:**
```typescript
try {
  const tools = await connectors.tools.select('query');
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error connecting to:', error.url);
    console.error('Cause:', error.cause?.message);

    // Retry logic
    await wait(5000);
    return await connectors.tools.select('query');
  }
}
```

## Authentication Errors

### `AuthenticationError`

Thrown when authentication fails (invalid API key, expired token, etc.).

```typescript
class AuthenticationError extends ConnectorsError {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}
```

**Examples:**
```typescript
try {
  const tools = await connectors.tools.select('query');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed');
    console.error('Status:', error.statusCode); // 401 or 403

    // Update API key
    connectors.setApiKey(await getNewApiKey());

    // Retry
    return await connectors.tools.select('query');
  }
}
```

## Rate Limit Errors

### `RateLimitError`

Thrown when rate limits are exceeded.

```typescript
class RateLimitError extends ConnectorsError {
  constructor(
    message: string,
    public readonly retryAfter: number, // Seconds until retry allowed
    public readonly limit: number,      // Rate limit
    public readonly remaining: number   // Requests remaining
  ) {
    super(message, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}
```

**Examples:**
```typescript
try {
  const result = await connectors.tools.invoke('github.createPR', params);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error(`Rate limit exceeded. Retry after ${error.retryAfter} seconds`);
    console.error(`Limit: ${error.limit}, Remaining: ${error.remaining}`);

    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
    return await connectors.tools.invoke('github.createPR', params);
  }
}
```

## Tool Selection Errors

### `ToolSelectionError`

Thrown when tool selection fails.

```typescript
class ToolSelectionError extends ConnectorsError {
  constructor(
    message: string,
    public readonly query: string,
    public readonly availableCategories: string[]
  ) {
    super(message, 'TOOL_SELECTION_ERROR');
    this.name = 'ToolSelectionError';
  }
}
```

**Examples:**
```typescript
try {
  const tools = await connectors.tools.select('invalid query');
} catch (error) {
  if (error instanceof ToolSelectionError) {
    console.error('Tool selection failed for query:', error.query);
    console.error('Available categories:', error.availableCategories);

    // Fallback: use default tools
    return await connectors.tools.list({ category: 'code', limit: 5 });
  }
}
```

## Tool Invocation Errors

### `ToolInvocationError`

Thrown when tool invocation fails (validation errors, API errors, etc.).

```typescript
class ToolInvocationError extends ConnectorsError {
  constructor(
    message: string,
    public readonly toolId: string,
    public readonly params: Record<string, any>,
    public readonly validationErrors?: ValidationError[]
  ) {
    super(message, 'TOOL_INVOCATION_ERROR');
    this.name = 'ToolInvocationError';
  }
}
```

**Examples:**
```typescript
try {
  const result = await connectors.tools.invoke('github.createPullRequest', {
    repo: 'owner/repo',
    title: 'PR'
    // Missing required fields
  });
} catch (error) {
  if (error instanceof ToolInvocationError) {
    console.error('Invocation failed for tool:', error.toolId);
    console.error('Params:', error.params);

    if (error.validationErrors) {
      console.error('Validation errors:');
      error.validationErrors.forEach(e => {
        console.error(`- ${e.field}: ${e.message}`);
      });
    }
  }
}
```

## Tool Not Found Errors

### `ToolNotFoundError`

Thrown when a requested tool doesn't exist.

```typescript
class ToolNotFoundError extends ConnectorsError {
  constructor(
    message: string,
    public readonly toolId: string,
    public readonly suggestions: string[]
  ) {
    super(message, 'TOOL_NOT_FOUND');
    this.name = 'ToolNotFoundError';
  }
}
```

**Examples:**
```typescript
try {
  const tool = await connectors.tools.get('github.invalidTool');
} catch (error) {
  if (error instanceof ToolNotFoundError) {
    console.error('Tool not found:', error.toolId);
    console.error('Did you mean:', error.suggestions);

    // Use suggested tool
    if (error.suggestions.length > 0) {
      const tool = await connectors.tools.get(error.suggestions[0]);
      return tool;
    }
  }
}
```

## Server Not Found Errors

### `ServerNotFoundError`

Thrown when a requested MCP server doesn't exist.

```typescript
class ServerNotFoundError extends ConnectorsError {
  constructor(
    message: string,
    public readonly serverName: string,
    public readonly availableServers: string[]
  ) {
    super(message, 'SERVER_NOT_FOUND');
    this.name = 'ServerNotFoundError';
  }
}
```

**Examples:**
```typescript
try {
  const server = connectors.mcp.get('nonexistent');
} catch (error) {
  if (error instanceof ServerNotFoundError) {
    console.error('Server not found:', error.serverName);
    console.error('Available servers:', error.availableServers);
  }
}
```

## Deployment Errors

### `DeploymentError`

Base class for deployment-related errors.

```typescript
class DeploymentError extends ConnectorsError {
  constructor(
    message: string,
    public readonly deploymentId: string,
    code?: string
  ) {
    super(message, code || 'DEPLOYMENT_ERROR');
    this.name = 'DeploymentError';
  }
}
```

### `DeploymentTimeoutError`

Thrown when deployment times out.

```typescript
class DeploymentTimeoutError extends DeploymentError {
  constructor(
    message: string,
    deploymentId: string,
    public readonly timeout: number
  ) {
    super(message, deploymentId, 'DEPLOYMENT_TIMEOUT');
    this.name = 'DeploymentTimeoutError';
  }
}
```

**Examples:**
```typescript
try {
  const deployment = await connectors.mcp.add({ ... });
  await deployment.waitUntilReady({ timeout: 300000 });
} catch (error) {
  if (error instanceof DeploymentTimeoutError) {
    console.error('Deployment timed out after', error.timeout, 'ms');
    console.error('Deployment ID:', error.deploymentId);

    // Get current status
    const status = await connectors.mcp.getDeploymentStatus(error.deploymentId);
    console.error('Current status:', status.status);
  }
}
```

### `DeploymentFailedError`

Thrown when deployment fails.

```typescript
class DeploymentFailedError extends DeploymentError {
  constructor(
    message: string,
    deploymentId: string,
    public readonly reason: string,
    public readonly logs: string[]
  ) {
    super(message, deploymentId, 'DEPLOYMENT_FAILED');
    this.name = 'DeploymentFailedError';
  }
}
```

**Examples:**
```typescript
try {
  const deployment = await connectors.mcp.add({ ... });
  await deployment.waitUntilReady();
} catch (error) {
  if (error instanceof DeploymentFailedError) {
    console.error('Deployment failed');
    console.error('Reason:', error.reason);
    console.error('Logs:');
    error.logs.forEach(log => console.error(log));

    // Remove failed deployment
    await connectors.mcp.remove(deployment.name);
  }
}
```

## Validation Errors

### `ValidationError`

Thrown when input validation fails.

```typescript
interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: string[];
}
```

**Examples:**
```typescript
try {
  const result = await connectors.tools.invoke('github.createPR', {
    repo: 'invalid',
    title: ''
  });
} catch (error) {
  if (error instanceof ToolInvocationError && error.validationErrors) {
    error.validationErrors.forEach(ve => {
      console.error(`Field "${ve.field}": ${ve.message}`);
      console.error(`  Value: ${ve.value}`);
      console.error(`  Constraints: ${ve.constraints?.join(', ')}`);
    });
  }
}
```

## Error Handling Patterns

### 1. Retry with Exponential Backoff

```typescript
async function selectToolsWithRetry(
  query: string,
  maxRetries = 3
): Promise<ToolSelection[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await connectors.tools.select(query);
    } catch (error) {
      if (error instanceof NetworkError && attempt < maxRetries) {
        const delay = Math.min(1000 * 2 ** attempt, 10000);
        console.warn(`Retry attempt ${attempt} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}
```

### 2. Graceful Degradation

```typescript
async function getToolsWithFallback(query: string): Promise<Tool[]> {
  try {
    // Try semantic selection first
    const selections = await connectors.tools.select(query);
    return selections.map(s => s.tool);
  } catch (error) {
    if (error instanceof ToolSelectionError) {
      console.warn('Semantic selection failed, using default tools');

      // Fallback: return top tools from primary category
      return await connectors.tools.list({
        category: 'code',
        limit: 5
      });
    }

    throw error;
  }
}
```

### 3. Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000; // 1 minute
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private resetTimer?: NodeJS.Timeout;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();

      // Success: reset failures
      this.failures = 0;
      if (this.state === 'half-open') {
        this.state = 'closed';
      }

      return result;
    } catch (error) {
      this.failures++;

      if (this.failures >= this.threshold) {
        this.state = 'open';
        this.resetTimer = setTimeout(() => {
          this.state = 'half-open';
          this.failures = 0;
        }, this.resetTimeout);
      }

      throw error;
    }
  }
}

// Usage
const breaker = new CircuitBreaker();

try {
  const tools = await breaker.execute(() =>
    connectors.tools.select('query')
  );
} catch (error) {
  console.error('Circuit breaker tripped or request failed');
}
```

### 4. Logging and Monitoring

```typescript
import { Logger } from './logger';
import { Metrics } from './metrics';

async function selectToolsWithObservability(query: string) {
  const startTime = Date.now();

  try {
    const tools = await connectors.tools.select(query);

    // Log success
    Logger.info('Tool selection succeeded', {
      query,
      toolCount: tools.length,
      duration: Date.now() - startTime
    });

    // Record metrics
    Metrics.increment('tool_selection.success');
    Metrics.timing('tool_selection.duration', Date.now() - startTime);

    return tools;
  } catch (error) {
    // Log error with context
    Logger.error('Tool selection failed', {
      query,
      error: error.message,
      errorType: error.constructor.name,
      duration: Date.now() - startTime
    });

    // Record metrics
    Metrics.increment('tool_selection.error', {
      errorType: error.constructor.name
    });

    throw error;
  }
}
```

### 5. Error Recovery

```typescript
async function invokeToolWithRecovery(
  toolId: string,
  params: Record<string, any>
) {
  try {
    return await connectors.tools.invoke(toolId, params);
  } catch (error) {
    if (error instanceof ToolInvocationError) {
      // Try to fix validation errors automatically
      if (error.validationErrors) {
        const fixedParams = await fixValidationErrors(params, error.validationErrors);
        console.log('Retrying with fixed parameters...');
        return await connectors.tools.invoke(toolId, fixedParams);
      }
    }

    if (error instanceof RateLimitError) {
      // Wait and retry
      console.log(`Waiting ${error.retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
      return await connectors.tools.invoke(toolId, params);
    }

    throw error;
  }
}

async function fixValidationErrors(
  params: Record<string, any>,
  errors: ValidationError[]
): Promise<Record<string, any>> {
  const fixed = { ...params };

  for (const error of errors) {
    if (error.constraints?.includes('required')) {
      // Set default value for required field
      fixed[error.field] = getDefaultValue(error.field);
    }
  }

  return fixed;
}
```

## Best Practices

### 1. Always Catch Specific Errors

```typescript
// ✅ Good: Catch specific errors
try {
  const tools = await connectors.tools.select('query');
} catch (error) {
  if (error instanceof ToolSelectionError) {
    // Handle selection errors
  } else if (error instanceof NetworkError) {
    // Handle network errors
  } else {
    // Handle unexpected errors
    throw error;
  }
}

// ❌ Bad: Catch all errors generically
try {
  const tools = await connectors.tools.select('query');
} catch (error) {
  console.error('Something went wrong');
}
```

### 2. Provide Context in Error Messages

```typescript
try {
  const result = await connectors.tools.invoke('github.createPR', params);
} catch (error) {
  throw new Error(
    `Failed to create PR for repo ${params.repo}: ${error.message}`,
    { cause: error }
  );
}
```

### 3. Don't Swallow Errors

```typescript
// ✅ Good: Re-throw or handle properly
try {
  await connectors.tools.invoke('tool', params);
} catch (error) {
  console.error('Error:', error);
  throw error; // Re-throw for caller to handle
}

// ❌ Bad: Swallow errors
try {
  await connectors.tools.invoke('tool', params);
} catch (error) {
  // Silent failure
}
```

### 4. Use Error Boundaries in Frontend Apps

```typescript
// React error boundary
class ConnectorsErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (error instanceof NetworkError) {
      // Show network error UI
    } else if (error instanceof AuthenticationError) {
      // Redirect to login
    }

    // Log to monitoring service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### 5. Test Error Scenarios

```typescript
describe('Tool Selection', () => {
  it('should handle network errors', async () => {
    // Mock network error
    mockGateway.mockImplementationOnce(() => {
      throw new NetworkError('Connection refused', 'http://localhost:3000');
    });

    await expect(connectors.tools.select('query'))
      .rejects
      .toThrow(NetworkError);
  });

  it('should handle tool selection errors', async () => {
    mockGateway.mockImplementationOnce(() => {
      throw new ToolSelectionError('No tools found', 'invalid query', ['code']);
    });

    await expect(connectors.tools.select('invalid query'))
      .rejects
      .toThrow(ToolSelectionError);
  });
});
```

## Next Steps

- **[Connectors Client](connectors-client.md)** - Main client API
- **[Tools API](tools-api.md)** - Tool selection and invocation
- **[MCP Registry](mcp-registry.md)** - Server deployment
- **[Examples](../examples.md)** - Error handling examples

---

**[← Back to TypeScript SDK](./)**
