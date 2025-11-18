# mcp.add() Overview - Deploy Custom MCP Servers

The `mcp.add()` method allows you to deploy custom MCP servers to the Connectors platform from various sources.

## Overview

With `mcp.add()`, you can:

- **Deploy from GitHub**: Clone, build, and deploy from GitHub repositories
- **Deploy from Docker**: Use pre-built Docker images
- **Deploy from STDIO**: Run local command-line MCP servers
- **Deploy from HTTP**: Connect to remote HTTP-based MCP servers
- **Auto-scaling**: Automatic Kubernetes deployment with health checks
- **Monitoring**: Real-time logs and deployment status

## Deployment Pipeline

```
Source → Build → Containerize → Deploy to K8s → Health Check → Ready
```

### Pipeline Stages

1. **Pending** - Deployment accepted, queued
2. **Building** - Source cloned, dependencies installed, built
3. **Deploying** - Container created, deployed to Kubernetes
4. **Ready** - Server live and accepting requests
5. **Failed** - Deployment failed (check logs)

### Typical Timeline

- **GitHub Source**: 2-5 minutes (clone + build + deploy)
- **Docker Source**: 1-2 minutes (pull + deploy)
- **STDIO Source**: < 1 minute (direct execution)
- **HTTP Source**: < 30 seconds (registration only)

## Deployment Sources

### 1. GitHub Source

Deploy from GitHub repositories (public or private).

```typescript
const deployment = await connectors.mcp.add({
  name: 'my-mcp',
  source: {
    type: 'github',
    url: 'https://github.com/user/mcp-server',
    branch: 'main',         // Optional: default 'main'
    token: 'ghp_...'        // Optional: for private repos
  },
  category: 'productivity'
});
```

**Requirements:**
- Repository must contain MCP server code
- Must have `package.json` (Node.js) or `requirements.txt` (Python)
- Optional: Custom build command in `package.json` scripts

[Full documentation →](github-source.md)

### 2. Docker Source

Deploy from Docker images.

```typescript
const deployment = await connectors.mcp.add({
  name: 'docker-mcp',
  source: {
    type: 'docker',
    image: 'company/mcp-server',
    tag: 'v1.2.3',          // Optional: default 'latest'
    registry: 'registry.company.com'  // Optional: custom registry
  },
  category: 'data'
});
```

**Requirements:**
- Image must expose MCP server on port 3000
- Must respond to health checks at `/health`

[Full documentation →](docker-source.md)

### 3. STDIO Source

Deploy local command-line MCP servers.

```typescript
const deployment = await connectors.mcp.add({
  name: 'stdio-mcp',
  source: {
    type: 'stdio',
    command: 'node',
    args: ['dist/index.js'],
    cwd: '/path/to/server'
  },
  category: 'tools'
});
```

**Requirements:**
- Command must be executable on the gateway server
- MCP server communicates via stdin/stdout

[Full documentation →](stdio-source.md)

### 4. HTTP Source

Connect to remote HTTP-based MCP servers.

```typescript
const deployment = await connectors.mcp.add({
  name: 'http-mcp',
  source: {
    type: 'http',
    url: 'https://mcp.example.com',
    headers: {
      'Authorization': 'Bearer token123'
    }
  },
  category: 'external'
});
```

**Requirements:**
- URL must be accessible from the gateway
- Server must implement MCP protocol over HTTP

[Full documentation →](http-source.md)

## Configuration Options

### Basic Configuration

```typescript
interface MCPDeploymentConfig {
  name: string;                 // Unique server name
  source: DeploymentSource;     // Source configuration
  category: string;             // Category for semantic routing
  description?: string;         // Server description
  env?: Record<string, string>; // Environment variables
  resources?: ResourceLimits;   // CPU/memory limits
}
```

### Environment Variables

Pass secrets and configuration:

```typescript
const deployment = await connectors.mcp.add({
  name: 'my-mcp',
  source: { type: 'github', url: '...' },
  category: 'productivity',
  env: {
    API_KEY: process.env.CUSTOM_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    LOG_LEVEL: 'debug'
  }
});
```

### Resource Limits

Set CPU and memory limits:

```typescript
const deployment = await connectors.mcp.add({
  name: 'my-mcp',
  source: { type: 'github', url: '...' },
  category: 'productivity',
  resources: {
    cpu: '500m',        // 0.5 CPU cores
    memory: '512Mi'     // 512 MB RAM
  }
});
```

## Monitoring Deployments

### Wait for Deployment

```typescript
const deployment = await connectors.mcp.add({ ... });

// Simple wait
await deployment.waitUntilReady();

// With progress tracking
await deployment.waitUntilReady({
  timeout: 600000,  // 10 minutes
  pollInterval: 3000,  // Check every 3 seconds
  onProgress: (status) => {
    console.log(`[${status.progress}%] ${status.message}`);
  }
});
```

### Check Status

```typescript
const status = await deployment.getStatus();

console.log(`Status: ${status.status}`);
console.log(`Progress: ${status.progress}%`);
console.log(`Message: ${status.message}`);

if (status.status === 'failed') {
  console.error('Error:', status.error);
}
```

### View Logs

```typescript
const logs = await deployment.getLogs();

logs.forEach(log => console.log(log));
```

### Cancel Deployment

```typescript
await deployment.cancel();
console.log('Deployment cancelled');
```

## Using Deployed Servers

Once deployed, use the server like any built-in integration:

```typescript
// Wait for deployment
const deployment = await connectors.mcp.add({ ... });
await deployment.waitUntilReady();

// Get server instance
const myServer = connectors.mcp.get('my-mcp');

// Call tools
const result = await myServer.call('customTool', {
  param1: 'value1',
  param2: 'value2'
});

// List server tools
const tools = await myServer.listTools();
```

## Examples

### Deploy and Use

```typescript
async function deployAndUse() {
  // Deploy
  const deployment = await connectors.mcp.add({
    name: 'analytics-mcp',
    source: {
      type: 'github',
      url: 'https://github.com/company/analytics-mcp'
    },
    category: 'analytics',
    env: {
      API_KEY: process.env.ANALYTICS_API_KEY
    }
  });

  // Wait for ready
  console.log('Deploying...');
  await deployment.waitUntilReady({
    onProgress: (s) => console.log(`[${s.progress}%] ${s.message}`)
  });

  // Use server
  const analytics = connectors.mcp.get('analytics-mcp');
  const report = await analytics.call('generateReport', {
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });

  console.log('Report:', report);
}
```

### Deploy Multiple Servers

```typescript
async function deployMultiple() {
  const configs = [
    {
      name: 'server-1',
      source: { type: 'github', url: 'https://github.com/user/server1' },
      category: 'tools'
    },
    {
      name: 'server-2',
      source: { type: 'docker', image: 'company/server2' },
      category: 'data'
    },
    {
      name: 'server-3',
      source: { type: 'http', url: 'https://mcp.example.com' },
      category: 'external'
    }
  ];

  // Deploy all in parallel
  const deployments = await Promise.all(
    configs.map(config => connectors.mcp.add(config))
  );

  console.log(`Deploying ${deployments.length} servers...`);

  // Wait for all to complete
  await Promise.all(deployments.map(d => d.waitUntilReady()));

  console.log('All servers deployed!');
}
```

### Auto-Retry Failed Deployments

```typescript
async function deployWithRetry(
  config: MCPDeploymentConfig,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}`);

      const deployment = await connectors.mcp.add(config);
      await deployment.waitUntilReady({ timeout: 300000 });

      console.log('Deployment successful!');
      return deployment;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts`);
      }

      // Exponential backoff
      const delay = 2 ** attempt * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Error Handling

```typescript
import {
  DeploymentError,
  DeploymentTimeoutError,
  DeploymentFailedError
} from '@connectors/sdk';

try {
  const deployment = await connectors.mcp.add({ ... });
  await deployment.waitUntilReady();
} catch (error) {
  if (error instanceof DeploymentTimeoutError) {
    console.error('Deployment timed out');
    // Increase timeout and retry
  } else if (error instanceof DeploymentFailedError) {
    console.error('Deployment failed:', error.message);
    console.error('Logs:', error.logs);
    // Check logs for specific error
  } else if (error instanceof DeploymentError) {
    console.error('Deployment error:', error.message);
  }
}
```

## Best Practices

### 1. Set Appropriate Timeouts

```typescript
// Short timeout for simple deployments
await deployment.waitUntilReady({ timeout: 60000 }); // 1 minute

// Long timeout for complex builds
await deployment.waitUntilReady({ timeout: 600000 }); // 10 minutes
```

### 2. Monitor Progress

```typescript
await deployment.waitUntilReady({
  onProgress: (status) => {
    // Update UI, log to monitoring, etc.
    console.log(`[${status.progress}%] ${status.message}`);

    if (status.status === 'building') {
      // Show build logs
    } else if (status.status === 'deploying') {
      // Show deployment progress
    }
  }
});
```

### 3. Clean Up Failed Deployments

```typescript
try {
  await deployment.waitUntilReady();
} catch (error) {
  // Remove failed deployment
  await connectors.mcp.remove(deployment.name);
  throw error;
}
```

### 4. Use Resource Limits

```typescript
const deployment = await connectors.mcp.add({
  name: 'my-mcp',
  source: { ... },
  category: 'tools',
  resources: {
    cpu: '500m',      // Prevent CPU hogging
    memory: '512Mi'   // Prevent memory leaks
  }
});
```

### 5. Secure Environment Variables

```typescript
// ✅ Good: Use environment variables
const deployment = await connectors.mcp.add({
  name: 'my-mcp',
  source: { ... },
  env: {
    API_KEY: process.env.API_KEY
  }
});

// ❌ Bad: Hardcode secrets
const deployment = await connectors.mcp.add({
  name: 'my-mcp',
  source: { ... },
  env: {
    API_KEY: 'hardcoded-secret'
  }
});
```

## Architecture

### Kubernetes Deployment

Each deployed MCP server gets:

- **Deployment**: 1-3 replicas with auto-scaling
- **Service**: Load balancer for traffic distribution
- **ConfigMap**: Environment variables and configuration
- **Secret**: Sensitive data (API keys, tokens)
- **Ingress**: External access (if needed)

### Health Checks

Servers must respond to health checks:

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});
```

### Auto-Scaling

Servers automatically scale based on:
- CPU usage (target: 70%)
- Memory usage (target: 80%)
- Request rate (target: 100 req/s)

Scaling configuration:
- Min replicas: 1
- Max replicas: 10
- Scale-up delay: 30 seconds
- Scale-down delay: 5 minutes

## Troubleshooting

### Deployment Stuck in "Building"

**Cause**: Build taking too long or hanging

**Solution**:
1. Check logs: `await deployment.getLogs()`
2. Verify build command in `package.json`
3. Increase timeout
4. Check for missing dependencies

### Deployment Fails with "Image Pull Error"

**Cause**: Docker image not found or authentication failed

**Solution**:
1. Verify image name and tag
2. Check registry authentication
3. Ensure image is publicly accessible or credentials provided

### Server Not Responding to Health Checks

**Cause**: Server not exposing `/health` endpoint

**Solution**:
1. Add health check endpoint to server
2. Ensure server listens on port 3000
3. Check server logs for errors

### High Memory Usage

**Cause**: Memory leak or insufficient resources

**Solution**:
1. Set resource limits
2. Monitor logs for memory issues
3. Optimize server code
4. Increase memory limit if needed

## Next Steps

- **[GitHub Source](github-source.md)** - Deploy from GitHub repos
- **[Docker Source](docker-source.md)** - Deploy from Docker images
- **[STDIO Source](stdio-source.md)** - Deploy local servers
- **[HTTP Source](http-source.md)** - Connect to remote servers
- **[Kubernetes](kubernetes.md)** - Production K8s deployment

---

**[← Back to Deployment](./)**
