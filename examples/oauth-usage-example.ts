/**
 * OAuth Integration Usage Examples
 * Connectors Platform - Example implementations
 */

import { VaultClient } from '../gateway/src/auth/vault-client';
import { OAuthProxy } from '../gateway/src/auth/oauth-proxy';
import {
  OAuthCredentials,
  OAuthClientConfig,
  MCPRequest
} from '../gateway/src/auth/types';

// ============================================================================
// Example 1: Setting up OAuth for GitHub Integration
// ============================================================================

async function setupGitHubOAuth(): Promise<void> {
  console.log('Example 1: Setting up GitHub OAuth\n');

  // 1. Initialize Vault client
  const vault = new VaultClient({
    address: process.env.VAULT_ADDR || 'http://localhost:8200',
    token: process.env.VAULT_TOKEN || 'dev-root-token',
    transitEngine: 'transit',
    kvEngine: 'secret',
    timeout: 5000,
    maxRetries: 3
  });

  // 2. Configure OAuth for GitHub
  const githubConfig: OAuthClientConfig = {
    clientId: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    authEndpoint: 'https://github.com/login/oauth/authorize',
    redirectUri: 'http://localhost:3000/oauth/callback/github'
  };

  // 3. Initialize OAuth proxy
  const proxy = new OAuthProxy(
    vault,
    'http://localhost:3000', // MCP servers base URL
    new Map([['github', githubConfig]])
  );

  // 4. Start auto-refresh scheduler
  proxy.start();

  console.log('✅ OAuth proxy started with GitHub configuration');

  // 5. Simulate OAuth callback (user completed OAuth flow)
  const tokenResponse = {
    access_token: 'gho_example_access_token_abc123',
    refresh_token: 'ghr_example_refresh_token_xyz789',
    expires_in: 3600, // 1 hour
    token_type: 'Bearer',
    scope: 'repo user'
  };

  // 6. Store credentials and schedule refresh
  await proxy.storeInitialCredentials(
    'tenant-acme-corp',
    'github',
    tokenResponse
  );

  console.log('✅ GitHub credentials stored and refresh scheduled');
  console.log('   - Tenant: tenant-acme-corp');
  console.log('   - Integration: github');
  console.log('   - Expires in: 1 hour');
  console.log('   - Refresh scheduled: 55 minutes from now\n');

  // Cleanup
  proxy.stop();
}

// ============================================================================
// Example 2: Making MCP Requests with Automatic OAuth
// ============================================================================

async function makeGitHubRequest(): Promise<void> {
  console.log('Example 2: Making GitHub API request via MCP\n');

  const vault = new VaultClient({
    address: 'http://localhost:8200',
    token: 'dev-root-token'
  });

  const githubConfig: OAuthClientConfig = {
    clientId: process.env.GITHUB_CLIENT_ID || 'client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'client-secret',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    authEndpoint: 'https://github.com/login/oauth/authorize'
  };

  const proxy = new OAuthProxy(
    vault,
    'http://localhost:3000',
    new Map([['github', githubConfig]])
  );

  proxy.start();

  // Make MCP request - OAuth automatically injected
  const request: MCPRequest = {
    tenantId: 'tenant-acme-corp',
    integration: 'github',
    method: 'POST',
    path: '/repos/acme-corp/backend/pulls',
    body: {
      title: 'Add new feature',
      head: 'feature-branch',
      base: 'main',
      body: 'This PR adds the new authentication feature'
    }
  };

  try {
    const response = await proxy.proxyRequest(request);

    console.log('✅ Pull request created successfully!');
    console.log('   - PR Number:', response.data.number);
    console.log('   - URL:', response.data.url);
    console.log('   - Status:', response.status);
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }

  proxy.stop();
}

// ============================================================================
// Example 3: Handling Token Expiration and Refresh
// ============================================================================

async function handleTokenExpiration(): Promise<void> {
  console.log('Example 3: Automatic token refresh on expiration\n');

  const vault = new VaultClient({
    address: 'http://localhost:8200',
    token: 'dev-root-token'
  });

  const slackConfig: OAuthClientConfig = {
    clientId: 'slack-client-id',
    clientSecret: 'slack-client-secret',
    tokenEndpoint: 'https://slack.com/api/oauth.v2.access',
    authEndpoint: 'https://slack.com/oauth/v2/authorize'
  };

  const proxy = new OAuthProxy(
    vault,
    'http://localhost:3000',
    new Map([['slack', slackConfig]])
  );

  // Listen to refresh events
  proxy['_scheduler'].on('refresh-success', ({ tenantId, integration, expiresAt }) => {
    console.log(`✅ Token refreshed for ${tenantId}/${integration}`);
    console.log(`   New expiration: ${expiresAt}`);
  });

  proxy['_scheduler'].on('refresh-failed', ({ tenantId, integration, error }) => {
    console.error(`❌ Refresh failed for ${tenantId}/${integration}: ${error}`);
    // Alert user to re-authenticate
  });

  proxy['_scheduler'].on('refresh-retry', ({ tenantId, integration, retryCount }) => {
    console.warn(`⚠️  Retrying refresh for ${tenantId}/${integration} (attempt ${retryCount})`);
  });

  proxy.start();

  console.log('📊 Monitoring token refresh events...\n');

  // Simulate making a request (token will auto-refresh if expired)
  const request: MCPRequest = {
    tenantId: 'tenant-xyz',
    integration: 'slack',
    method: 'POST',
    path: '/chat.postMessage',
    body: {
      channel: '#general',
      text: 'Hello from Connectors Platform!'
    }
  };

  try {
    const response = await proxy.proxyRequest(request);
    console.log('✅ Slack message sent:', response.data);
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
  }

  // Keep running to see scheduled refreshes
  console.log('\n⏳ Scheduler running... (Ctrl+C to stop)');
  await new Promise(() => {}); // Keep alive
}

// ============================================================================
// Example 4: Multi-Tenant OAuth Management
// ============================================================================

async function multiTenantExample(): Promise<void> {
  console.log('Example 4: Managing OAuth for multiple tenants\n');

  const vault = new VaultClient({
    address: 'http://localhost:8200',
    token: 'dev-root-token'
  });

  // Store credentials for multiple tenants
  const tenants = [
    { id: 'tenant-acme', integration: 'github' },
    { id: 'tenant-globex', integration: 'github' },
    { id: 'tenant-initech', integration: 'slack' }
  ];

  for (const tenant of tenants) {
    const credentials: OAuthCredentials = {
      accessToken: `token_${tenant.id}_${tenant.integration}`,
      refreshToken: `refresh_${tenant.id}_${tenant.integration}`,
      expiresAt: new Date(Date.now() + 3600000),
      scopes: ['read', 'write'],
      tokenType: 'Bearer',
      integration: tenant.integration
    };

    await vault.storeCredentials(tenant.id, tenant.integration, credentials);
    console.log(`✅ Stored credentials: ${tenant.id}/${tenant.integration}`);
  }

  // List integrations for a tenant
  console.log('\n📋 Listing integrations for tenant-acme:');
  const integrations = await vault.listIntegrations('tenant-acme');
  console.log('   Integrations:', integrations);

  // Check if credentials exist
  const hasGitHub = await vault.hasCredentials('tenant-acme', 'github');
  const hasSlack = await vault.hasCredentials('tenant-acme', 'slack');

  console.log(`\n🔍 Credential status for tenant-acme:`);
  console.log(`   GitHub: ${hasGitHub ? '✅ Connected' : '❌ Not connected'}`);
  console.log(`   Slack: ${hasSlack ? '✅ Connected' : '❌ Not connected'}`);
}

// ============================================================================
// Example 5: Error Handling
// ============================================================================

async function errorHandlingExample(): Promise<void> {
  console.log('Example 5: Error handling patterns\n');

  const vault = new VaultClient({
    address: 'http://localhost:8200',
    token: 'dev-root-token'
  });

  const proxy = new OAuthProxy(
    vault,
    'http://localhost:3000',
    new Map([
      ['github', {
        clientId: 'github-id',
        clientSecret: 'github-secret',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
        authEndpoint: 'https://github.com/login/oauth/authorize'
      }]
    ])
  );

  proxy.start();

  const request: MCPRequest = {
    tenantId: 'tenant-demo',
    integration: 'github',
    method: 'GET',
    path: '/user'
  };

  try {
    await proxy.proxyRequest(request);
  } catch (error) {
    // Handle different error types
    if (error.name === 'CredentialNotFoundError') {
      console.log('❌ Credentials not found');
      console.log('   Action: Redirect user to OAuth flow');
      console.log('   URL: /oauth/connect/github');
    } else if (error.name === 'TokenExpiredError') {
      console.log('❌ Token expired and refresh failed');
      console.log('   Action: Redirect user to re-authenticate');
      console.log(`   Expired at: ${error.expiredAt}`);
    } else if (error.name === 'RateLimitError') {
      console.log('❌ Rate limit exceeded');
      console.log(`   Retry after: ${error.getWaitTimeMs()}ms`);
      console.log(`   Reset time: ${error.getResetDate()}`);
    } else if (error.name === 'TokenRefreshError') {
      console.log('❌ Token refresh failed');
      console.log(`   Retryable: ${error.retryable}`);
      if (error.retryable) {
        console.log('   Action: Retry with exponential backoff');
      } else {
        console.log('   Action: User re-authentication required');
      }
    } else if (error.name === 'VaultError') {
      console.log('❌ Vault operation failed');
      console.log(`   Operation: ${error.operation}`);
      console.log(`   Path: ${error.path}`);
      console.log('   Action: Check Vault connectivity and permissions');
    } else {
      console.log('❌ Unknown error:', error.message);
    }
  }

  proxy.stop();
}

// ============================================================================
// Example 6: Vault Health Monitoring
// ============================================================================

async function vaultHealthMonitoring(): Promise<void> {
  console.log('Example 6: Vault health monitoring\n');

  const vault = new VaultClient({
    address: 'http://localhost:8200',
    token: 'dev-root-token'
  });

  // Periodic health checks
  const checkInterval = setInterval(async () => {
    const isHealthy = await vault.healthCheck();

    if (isHealthy) {
      console.log('✅ Vault is healthy');
    } else {
      console.error('❌ Vault is unhealthy - activating fallback mode');
      // Implement graceful degradation:
      // - Use cached credentials
      // - Queue requests for retry
      // - Alert operations team
    }
  }, 10000); // Check every 10 seconds

  // Run for 30 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('\n✅ Health monitoring stopped');
  }, 30000);
}

// ============================================================================
// Run Examples
// ============================================================================

async function runExamples(): Promise<void> {
  console.log('='.repeat(70));
  console.log('OAuth Integration Examples - Connectors Platform');
  console.log('='.repeat(70));
  console.log();

  try {
    // Uncomment to run individual examples:

    // await setupGitHubOAuth();
    // await makeGitHubRequest();
    // await handleTokenExpiration(); // Runs indefinitely
    // await multiTenantExample();
    // await errorHandlingExample();
    // await vaultHealthMonitoring();

    console.log('\n💡 Uncomment examples in runExamples() to test');
    console.log('📖 See docs/oauth-implementation-guide.md for full documentation');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runExamples();
}

export {
  setupGitHubOAuth,
  makeGitHubRequest,
  handleTokenExpiration,
  multiTenantExample,
  errorHandlingExample,
  vaultHealthMonitoring
};
