# TypeScript SDK - MCP Registry

The MCP Registry API provides methods to deploy, manage, and interact with MCP servers.

## Overview

The MCP Registry is accessed via the `mcp` property of the Connectors client:

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({ baseURL: 'http://localhost:3000' });

// Get server instance
const github = connectors.mcp.get('github');
const pr = await github.call('createPullRequest', { ... });

// List all servers
const servers = await connectors.mcp.list();

// Deploy custom server
const deployment = await connectors.mcp.add({
  name: 'my-server',
  source: { type: 'github', url: 'https://github.com/user/mcp-server' },
  category: 'custom'
});
```

## Methods

### `get(name: string): MCPServerInstance`

Gets a bound instance of an MCP server for direct tool invocation.

#### Parameters

- `name: string` - Server name (e.g., 'github', 'gmail', 'notion')

#### Returns

```typescript
interface MCPServerInstance {
  name: string;
  call(toolName: string, params: Record<string, any>): Promise<any>;
  listTools(): Promise<Tool[]>;
  getInfo(): Promise<ServerInfo>;
}
```

#### Examples

**Basic usage:**
```typescript
const github = connectors.mcp.get('github');

// Call tool on the server
const pr = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'New feature',
  head: 'feature',
  base: 'main'
});

console.log('PR created:', pr.url);
```

**List server tools:**
```typescript
const github = connectors.mcp.get('github');
const tools = await github.listTools();

console.log(`GitHub has ${tools.length} tools:`);
tools.forEach(tool => {
  console.log(`- ${tool.name}: ${tool.description}`);
});
```

**Get server info:**
```typescript
const github = connectors.mcp.get('github');
const info = await github.getInfo();

console.log(`Server: ${info.name}`);
console.log(`Version: ${info.version}`);
console.log(`Status: ${info.status}`);
console.log(`Tools: ${info.toolCount}`);
```

### `list(options?: ListOptions): Promise<MCPServer[]>`

Lists all registered MCP servers.

#### Parameters

```typescript
interface ListOptions {
  category?: string;            // Filter by category
  status?: 'active' | 'inactive' | 'error';
  includeCustom?: boolean;      // Include custom-deployed servers (default: true)
}
```

#### Returns

```typescript
interface MCPServer {
  name: string;
  category: string;
  status: 'active' | 'inactive' | 'error';
  toolCount: number;
  url: string;
  version: string;
  deployedAt?: Date;            // For custom servers
  isCustom: boolean;
}
```

#### Examples

**List all servers:**
```typescript
const servers = await connectors.mcp.list();

servers.forEach(server => {
  console.log(`${server.name} (${server.category}): ${server.toolCount} tools`);
});
```

**Filter by category:**
```typescript
const codeServers = await connectors.mcp.list({ category: 'code' });
const commServers = await connectors.mcp.list({ category: 'communication' });
```

**Filter by status:**
```typescript
const activeServers = await connectors.mcp.list({ status: 'active' });
const errorServers = await connectors.mcp.list({ status: 'error' });

if (errorServers.length > 0) {
  console.error('Servers with errors:', errorServers.map(s => s.name));
}
```

**Built-in servers only:**
```typescript
const builtInServers = await connectors.mcp.list({ includeCustom: false });
```

### `add(config: MCPDeploymentConfig): Promise<MCPDeployment>`

Deploys a custom MCP server from various sources (GitHub, STDIO, HTTP, Docker).

#### Parameters

```typescript
interface MCPDeploymentConfig {
  name: string;                 // Unique server name
  source: DeploymentSource;     // Source configuration
  category: string;             // Category for semantic routing
  description?: string;         // Server description
  env?: Record<string, string>; // Environment variables
  resources?: ResourceLimits;   // CPU/memory limits
}

type DeploymentSource =
  | GitHubSource
  | StdioSource
  | HttpSource
  | DockerSource;

interface GitHubSource {
  type: 'github';
  url: string;                  // GitHub repo URL
  branch?: string;              // Branch/tag (default: 'main')
  token?: string;               // Auth token for private repos
  buildCommand?: string;        // Custom build command
}

interface StdioSource {
  type: 'stdio';
  command: string;              // Command to run
  args?: string[];              // Command arguments
  cwd?: string;                 // Working directory
}

interface HttpSource {
  type: 'http';
  url: string;                  // HTTP endpoint URL
  headers?: Record<string, string>;
}

interface DockerSource {
  type: 'docker';
  image: string;                // Docker image
  tag?: string;                 // Image tag (default: 'latest')
  registry?: string;            // Custom registry
}
```

#### Returns

```typescript
interface MCPDeployment {
  id: string;
  name: string;
  status: 'pending' | 'building' | 'deploying' | 'ready' | 'failed';
  source: DeploymentSource;
  createdAt: Date;
  updatedAt: Date;
  error?: string;

  // Methods
  waitUntilReady(options?: WaitOptions): Promise<void>;
  getStatus(): Promise<DeploymentStatus>;
  getLogs(): Promise<string[]>;
  cancel(): Promise<void>;
}
```

#### Examples

**Deploy from GitHub:**
```typescript
const deployment = await connectors.mcp.add({
  name: 'custom-mcp',
  source: {
    type: 'github',
    url: 'https://github.com/user/my-mcp-server',
    branch: 'main'
  },
  category: 'productivity',
  description: 'Custom productivity tools'
});

console.log('Deployment started:', deployment.id);

// Wait for deployment to complete
await deployment.waitUntilReady({ timeout: 300000 }); // 5 minutes

console.log('Deployment ready!');
```

**Deploy from GitHub (private repo):**
```typescript
const deployment = await connectors.mcp.add({
  name: 'private-mcp',
  source: {
    type: 'github',
    url: 'https://github.com/company/private-mcp',
    token: process.env.GITHUB_TOKEN,
    branch: 'production'
  },
  category: 'custom',
  env: {
    API_KEY: process.env.CUSTOM_API_KEY
  }
});
```

**Deploy from Docker:**
```typescript
const deployment = await connectors.mcp.add({
  name: 'docker-mcp',
  source: {
    type: 'docker',
    image: 'company/mcp-server',
    tag: 'v1.2.3',
    registry: 'registry.company.com'
  },
  category: 'productivity',
  resources: {
    cpu: '500m',
    memory: '512Mi'
  }
});
```

**Deploy STDIO server:**
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

**Deploy HTTP server:**
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

### `remove(name: string): Promise<void>`

Removes a deployed MCP server.

#### Parameters

- `name: string` - Server name to remove

#### Examples

```typescript
await connectors.mcp.remove('custom-mcp');
console.log('Server removed');
```

### `getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>`

Gets the current status of a deployment.

#### Parameters

- `deploymentId: string` - Deployment ID from `mcp.add()`

#### Returns

```typescript
interface DeploymentStatus {
  id: string;
  name: string;
  status: 'pending' | 'building' | 'deploying' | 'ready' | 'failed';
  progress: number;             // 0-100
  message: string;              // Status message
  error?: string;               // Error details if failed
  logs: string[];               // Recent log entries
  startedAt: Date;
  completedAt?: Date;
  duration?: number;            // Seconds
}
```

#### Examples

```typescript
const deployment = await connectors.mcp.add({ ... });

// Poll for status
setInterval(async () => {
  const status = await connectors.mcp.getDeploymentStatus(deployment.id);
  console.log(`Status: ${status.status} (${status.progress}%)`);
  console.log(`Message: ${status.message}`);

  if (status.status === 'ready' || status.status === 'failed') {
    clearInterval(intervalId);
  }
}, 5000);
```

### `waitForDeployment(deploymentId: string, options?: WaitOptions): Promise<void>`

Waits for a deployment to complete (ready or failed).

#### Parameters

```typescript
interface WaitOptions {
  timeout?: number;             // Max wait time in ms (default: 300000)
  pollInterval?: number;        // Polling interval in ms (default: 5000)
  onProgress?: (status: DeploymentStatus) => void;
}
```

#### Examples

**Basic wait:**
```typescript
const deployment = await connectors.mcp.add({ ... });
await connectors.mcp.waitForDeployment(deployment.id);
console.log('Deployment complete!');
```

**With progress callback:**
```typescript
const deployment = await connectors.mcp.add({ ... });

await connectors.mcp.waitForDeployment(deployment.id, {
  timeout: 600000, // 10 minutes
  pollInterval: 3000, // Check every 3 seconds
  onProgress: (status) => {
    console.log(`[${status.progress}%] ${status.message}`);
  }
});
```

**Error handling:**
```typescript
try {
  await connectors.mcp.waitForDeployment(deployment.id, { timeout: 300000 });
  console.log('Success!');
} catch (error) {
  if (error instanceof DeploymentTimeoutError) {
    console.error('Deployment timed out after 5 minutes');
  } else if (error instanceof DeploymentFailedError) {
    console.error('Deployment failed:', error.message);
    console.error('Logs:', error.logs);
  }
}
```

## MCPDeployment Class

The `MCPDeployment` object returned by `mcp.add()` provides convenience methods:

### `waitUntilReady(options?: WaitOptions): Promise<void>`

Waits until the deployment is ready or fails.

```typescript
const deployment = await connectors.mcp.add({ ... });

// Simple wait
await deployment.waitUntilReady();

// With options
await deployment.waitUntilReady({
  timeout: 600000,
  onProgress: (status) => console.log(status.message)
});
```

### `getStatus(): Promise<DeploymentStatus>`

Gets the current deployment status.

```typescript
const deployment = await connectors.mcp.add({ ... });
const status = await deployment.getStatus();

console.log(`Status: ${status.status}`);
console.log(`Progress: ${status.progress}%`);
```

### `getLogs(): Promise<string[]>`

Gets deployment logs.

```typescript
const deployment = await connectors.mcp.add({ ... });
const logs = await deployment.getLogs();

logs.forEach(log => console.log(log));
```

### `cancel(): Promise<void>`

Cancels an in-progress deployment.

```typescript
const deployment = await connectors.mcp.add({ ... });

// Cancel after 30 seconds if not complete
setTimeout(async () => {
  const status = await deployment.getStatus();
  if (status.status !== 'ready' && status.status !== 'failed') {
    await deployment.cancel();
    console.log('Deployment cancelled');
  }
}, 30000);
```

## Deployment Pipeline

When you deploy a custom MCP server, it goes through these stages:

1. **Pending** - Deployment accepted, queued for processing
2. **Building** - Source code cloned, dependencies installed, build executed
3. **Deploying** - Container image created, deployed to Kubernetes
4. **Ready** - Server is live and accepting requests
5. **Failed** - Deployment failed (check logs for details)

### Typical Timeline

- **GitHub Source**: 2-5 minutes (clone + build + deploy)
- **Docker Source**: 1-2 minutes (pull + deploy)
- **STDIO Source**: < 1 minute (direct execution)
- **HTTP Source**: < 30 seconds (registration only)

## Error Handling

```typescript
import {
  DeploymentError,
  DeploymentTimeoutError,
  DeploymentFailedError,
  ServerNotFoundError
} from '@connectors/sdk';

// Deployment errors
try {
  const deployment = await connectors.mcp.add({ ... });
  await deployment.waitUntilReady();
} catch (error) {
  if (error instanceof DeploymentTimeoutError) {
    console.error('Deployment timed out');
  } else if (error instanceof DeploymentFailedError) {
    console.error('Deployment failed:', error.message);
    console.error('Logs:', error.logs);
  } else if (error instanceof DeploymentError) {
    console.error('Deployment error:', error.message);
  }
}

// Server not found
try {
  const server = connectors.mcp.get('nonexistent');
} catch (error) {
  if (error instanceof ServerNotFoundError) {
    console.error('Server not found:', error.serverName);
    console.error('Available servers:', error.availableServers);
  }
}
```

## Best Practices

### 1. Check Server Status Before Use

```typescript
const servers = await connectors.mcp.list();
const github = servers.find(s => s.name === 'github');

if (github?.status !== 'active') {
  throw new Error('GitHub server is not active');
}

const githubServer = connectors.mcp.get('github');
```

### 2. Set Deployment Timeouts

```typescript
// Short timeout for simple deployments
await deployment.waitUntilReady({ timeout: 60000 }); // 1 minute

// Long timeout for complex builds
await deployment.waitUntilReady({ timeout: 600000 }); // 10 minutes
```

### 3. Monitor Deployment Progress

```typescript
const deployment = await connectors.mcp.add({ ... });

await deployment.waitUntilReady({
  onProgress: (status) => {
    // Update UI, log to monitoring, etc.
    console.log(`[${new Date().toISOString()}] ${status.message}`);

    if (status.status === 'building') {
      // Show build progress
    } else if (status.status === 'deploying') {
      // Show deployment progress
    }
  }
});
```

### 4. Handle Deployment Failures Gracefully

```typescript
try {
  const deployment = await connectors.mcp.add({ ... });
  await deployment.waitUntilReady();
} catch (error) {
  if (error instanceof DeploymentFailedError) {
    // Log error details
    console.error('Deployment failed');
    console.error('Reason:', error.message);

    // Get logs for debugging
    const logs = await deployment.getLogs();
    console.error('Build logs:', logs.join('\n'));

    // Notify operations team
    await notifyOps({ error, logs });
  }
}
```

### 5. Clean Up Failed Deployments

```typescript
const deployment = await connectors.mcp.add({ ... });

try {
  await deployment.waitUntilReady({ timeout: 300000 });
} catch (error) {
  // Remove failed deployment
  await connectors.mcp.remove(deployment.name);
  throw error;
}
```

## Examples

### Deploy and Use Custom Server

```typescript
async function deployAndUse() {
  // Deploy custom server
  const deployment = await connectors.mcp.add({
    name: 'my-analytics',
    source: {
      type: 'github',
      url: 'https://github.com/company/analytics-mcp'
    },
    category: 'analytics',
    env: {
      API_KEY: process.env.ANALYTICS_API_KEY,
      DATABASE_URL: process.env.DATABASE_URL
    }
  });

  console.log('Deploying...');
  await deployment.waitUntilReady({
    onProgress: (status) => console.log(`[${status.progress}%] ${status.message}`)
  });

  console.log('Deployment complete!');

  // Use the server
  const analytics = connectors.mcp.get('my-analytics');
  const report = await analytics.call('generateReport', {
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });

  console.log('Report generated:', report);
}
```

### Deploy Multiple Servers Concurrently

```typescript
async function deployMultiple() {
  const deployments = await Promise.all([
    connectors.mcp.add({
      name: 'server-1',
      source: { type: 'github', url: 'https://github.com/user/server1' },
      category: 'tools'
    }),
    connectors.mcp.add({
      name: 'server-2',
      source: { type: 'github', url: 'https://github.com/user/server2' },
      category: 'data'
    }),
    connectors.mcp.add({
      name: 'server-3',
      source: { type: 'github', url: 'https://github.com/user/server3' },
      category: 'communication'
    })
  ]);

  console.log(`Deploying ${deployments.length} servers...`);

  // Wait for all to complete
  await Promise.all(deployments.map(d => d.waitUntilReady()));

  console.log('All servers deployed!');
}
```

### Auto-Retry Failed Deployments

```typescript
async function deployWithRetry(config: MCPDeploymentConfig, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Deployment attempt ${attempt}/${maxRetries}`);

      const deployment = await connectors.mcp.add(config);
      await deployment.waitUntilReady({ timeout: 300000 });

      console.log('Deployment successful!');
      return deployment;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        throw new Error(`Deployment failed after ${maxRetries} attempts`);
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2 ** attempt * 1000));
    }
  }
}
```

## Next Steps

- **[Error Handling](error-handling.md)** - Error types and recovery
- **[Deployment Guide](../../deployment/mcp-add-overview.md)** - Detailed deployment documentation
- **[Examples](../examples.md)** - More usage patterns

---

**[← Back to TypeScript SDK](./)**
