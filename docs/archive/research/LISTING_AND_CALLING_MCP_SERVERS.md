# Listing and Calling MCP Servers Directly

**Date:** 2025-11-11
**Topic:** Direct MCP server interaction and discovery

---

## Overview

The Connectors Platform provides multiple ways to interact with MCP servers:

1. **List all registered MCP servers** - See what's available
2. **List tools by server** - See what each server provides
3. **Call specific MCP servers directly** - Bypass semantic routing
4. **Register new MCP servers** - Add servers dynamically

---

## Method 1: List All MCP Servers

### API Endpoint

**Not yet implemented in current version**, but here's the planned API:

```bash
# Get all registered MCP servers
GET /api/v1/servers
```

**Response:**
```json
{
  "servers": [
    {
      "id": "github-repos-32",
      "name": "GitHub v3 REST API - Repos",
      "integration": "github",
      "category": "code",
      "version": "1.0.0",
      "url": "http://localhost:4000/github-repos",
      "toolCount": 52,
      "status": "active"
    },
    {
      "id": "slack-messaging",
      "name": "Slack Messaging MCP",
      "integration": "slack",
      "category": "communication",
      "version": "2.1.0",
      "url": "http://localhost:4001/slack",
      "toolCount": 18,
      "status": "active"
    }
  ],
  "total": 44,
  "byCategory": {
    "code": 20,
    "communication": 10,
    "project_management": 8,
    "cloud": 4,
    "data": 2
  }
}
```

### Workaround: Use List Tools by Category

**Currently available:**

```bash
# List all tools (which shows their servers)
curl http://localhost:3000/api/v1/tools/list

# Filter by category
curl http://localhost:3000/api/v1/tools/list?category=code

# Filter by integration
curl http://localhost:3000/api/v1/tools/list?integration=github
```

**Response:**
```json
{
  "tools": [
    {
      "id": "github.createPullRequest",
      "name": "createPullRequest",
      "description": "Create a pull request in a repository",
      "category": "code",
      "integration": "github",
      "server": "github-v3-rest-api---pulls-42",
      "tokenCost": 250
    },
    {
      "id": "github.listRepositories",
      "name": "listRepositories",
      "description": "List repositories for the authenticated user",
      "category": "code",
      "integration": "github",
      "server": "github-v3-rest-api---repos-32",
      "tokenCost": 180
    }
  ],
  "total": 1111,
  "page": 1,
  "limit": 100
}
```

---

## Method 2: Get Tools from Specific MCP Server

### List Tools by Integration

```bash
# Get all GitHub tools
curl http://localhost:3000/api/v1/tools/list?integration=github

# Get all Slack tools
curl http://localhost:3000/api/v1/tools/list?integration=slack

# Paginate results
curl http://localhost:3000/api/v1/tools/list?integration=github&limit=50&offset=0
```

### Group by Server

```python
import requests

def get_tools_by_server(integration=None):
    """Get all tools grouped by MCP server."""
    url = 'http://localhost:3000/api/v1/tools/list'
    params = {'limit': 1000}

    if integration:
        params['integration'] = integration

    response = requests.get(url, params=params)
    tools = response.json()['tools']

    # Group by server
    servers = {}
    for tool in tools:
        server_id = tool.get('server', 'unknown')
        if server_id not in servers:
            servers[server_id] = {
                'server_id': server_id,
                'integration': tool['integration'],
                'category': tool['category'],
                'tools': []
            }
        servers[server_id]['tools'].append(tool)

    return servers

# Usage
servers = get_tools_by_server('github')
for server_id, server_info in servers.items():
    print(f"\n{server_id}")
    print(f"  Integration: {server_info['integration']}")
    print(f"  Tools: {len(server_info['tools'])}")
    for tool in server_info['tools'][:3]:
        print(f"    - {tool['name']}")
```

**Output:**
```
github-v3-rest-api---repos-32
  Integration: github
  Tools: 52
    - createRepository
    - deleteRepository
    - listRepositories

github-v3-rest-api---pulls-42
  Integration: github
  Tools: 28
    - createPullRequest
    - mergePullRequest
    - listPullRequests
```

---

## Method 3: Call Specific MCP Server Directly

### Option A: Through Gateway (Recommended)

Specify the exact tool and integration:

```bash
# Call specific tool on specific server
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "github.createPullRequest",
    "integration": "github",
    "tenantId": "user-123",
    "parameters": {
      "owner": "facebook",
      "repo": "react",
      "title": "Fix bug",
      "head": "feature",
      "base": "main"
    }
  }'
```

The gateway will:
1. Look up which MCP server has this tool (`github-v3-rest-api---pulls-42`)
2. Inject OAuth credentials from Vault
3. Route the request to that specific server
4. Return the result

### Option B: Direct MCP Server Call (Bypass Gateway)

If you want to call an MCP server **directly** without the gateway:

**1. Find the server's URL:**
```bash
# In docker-compose setup
# github-repos server runs on: http://localhost:4032
# github-pulls server runs on: http://localhost:4042
# slack server runs on: http://localhost:4100
```

**2. Call the MCP server using standard MCP protocol:**

```python
import requests

def call_mcp_server_directly(server_url, tool_name, parameters, access_token=None):
    """
    Call an MCP server directly using standard MCP protocol.

    Args:
        server_url: URL of the MCP server (e.g., "http://localhost:4042")
        tool_name: Name of the tool to call (e.g., "createPullRequest")
        parameters: Tool parameters
        access_token: OAuth token (if required)
    """
    headers = {'Content-Type': 'application/json'}

    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'

    # Standard MCP protocol
    response = requests.post(
        f'{server_url}/tools/call',
        json={
            'name': tool_name,
            'arguments': parameters
        },
        headers=headers
    )

    return response.json()

# Usage
result = call_mcp_server_directly(
    'http://localhost:4042',  # GitHub pulls MCP server
    'createPullRequest',
    {
        'owner': 'facebook',
        'repo': 'react',
        'title': 'Fix bug',
        'head': 'feature',
        'base': 'main'
    },
    access_token='ghp_your_token_here'
)

print(result)
```

**3. List tools from specific MCP server:**

```python
def list_mcp_server_tools(server_url):
    """List all tools available on an MCP server."""
    response = requests.post(
        f'{server_url}/tools/list',
        json={}
    )
    return response.json()

# Usage
tools = list_mcp_server_tools('http://localhost:4042')
print(f"Available tools: {[t['name'] for t in tools['tools']]}")
```

---

## Method 4: Dynamic Server Discovery

### Get Server Info from Tool Metadata

```python
class ConnectorsClient:
    def get_server_for_tool(self, tool_id):
        """Find which MCP server hosts a specific tool."""
        # Query gateway
        response = requests.get(
            f'{self.base_url}/api/v1/tools/list',
            params={'limit': 1000}
        )

        tools = response.json()['tools']
        for tool in tools:
            if tool['id'] == tool_id:
                return {
                    'server_id': tool.get('server'),
                    'integration': tool['integration'],
                    'category': tool['category'],
                    'url': self._get_server_url(tool.get('server'))
                }

        return None

    def _get_server_url(self, server_id):
        """Map server ID to URL (based on docker-compose config)."""
        # This would come from a registry in production
        server_map = {
            'github-v3-rest-api---pulls-42': 'http://localhost:4042',
            'github-v3-rest-api---repos-32': 'http://localhost:4032',
            'slack-messaging': 'http://localhost:4100',
        }
        return server_map.get(server_id)

# Usage
client = ConnectorsClient()
server_info = client.get_server_for_tool('github.createPullRequest')
print(f"Tool hosted on: {server_info['server_id']}")
print(f"Server URL: {server_info['url']}")
```

---

## Method 5: MCP Server Registry (Future Feature)

**Planned API endpoints** for v2.0:

### Register a New MCP Server

```bash
POST /api/v1/servers/register
```

```json
{
  "serverId": "custom-api-server",
  "name": "My Custom API",
  "integration": "custom",
  "category": "data",
  "url": "http://localhost:5000",
  "auth": {
    "type": "api-key",
    "vaultPath": "secret/tenants/{tenant_id}/custom"
  },
  "autoDiscover": true
}
```

**Gateway will:**
1. Call `http://localhost:5000/tools/list`
2. Parse tool definitions
3. Generate embeddings
4. Add to FAISS index
5. Register in Neo4j GraphRAG

### Unregister an MCP Server

```bash
DELETE /api/v1/servers/{serverId}
```

### Update Server Status

```bash
PATCH /api/v1/servers/{serverId}
```

```json
{
  "status": "inactive",
  "reason": "maintenance"
}
```

---

## Current File Structure

The platform organizes MCP servers like this:

```
integrations/
├── code/
│   ├── github-v3-rest-api---repos-32/
│   │   ├── src/index.ts          # MCP server implementation
│   │   ├── package.json
│   │   └── tests/
│   ├── github-v3-rest-api---pulls-42/
│   ├── github-v3-rest-api---issues-16/
│   └── ... (44 GitHub servers total)
│
├── communication/
│   ├── slack-messaging/
│   └── discord-bot/
│
└── project_management/
    ├── jira-cloud/
    └── asana-tasks/
```

### Access Server Metadata from Filesystem

```python
import os
import json

def discover_local_mcp_servers(base_path='./integrations'):
    """Discover MCP servers from filesystem."""
    servers = []

    for category in os.listdir(base_path):
        category_path = os.path.join(base_path, category)
        if not os.path.isdir(category_path):
            continue

        for server_dir in os.listdir(category_path):
            server_path = os.path.join(category_path, server_dir)
            package_json = os.path.join(server_path, 'package.json')

            if os.path.exists(package_json):
                with open(package_json) as f:
                    pkg = json.load(f)
                    servers.append({
                        'id': server_dir,
                        'name': pkg.get('name'),
                        'version': pkg.get('version'),
                        'category': category,
                        'path': server_path
                    })

    return servers

# Usage
servers = discover_local_mcp_servers()
print(f"Found {len(servers)} MCP servers:")
for server in servers[:5]:
    print(f"  - {server['id']} ({server['category']})")
```

**Output:**
```
Found 44 MCP servers:
  - github-v3-rest-api---repos-32 (code)
  - github-v3-rest-api---pulls-42 (code)
  - github-v3-rest-api---issues-16 (code)
  - github-v3-rest-api---actions-21 (code)
  - github-v3-rest-api---gists-14 (code)
```

---

## Complete Python Example

```python
#!/usr/bin/env python3
"""
Complete example: List and call MCP servers
"""

import requests
from typing import Dict, List, Optional

class MCPServerManager:
    def __init__(self, gateway_url='http://localhost:3000'):
        self.gateway_url = gateway_url

    def list_all_tools(self, integration: Optional[str] = None) -> List[Dict]:
        """List all tools, optionally filtered by integration."""
        params = {'limit': 1000}
        if integration:
            params['integration'] = integration

        response = requests.get(f'{self.gateway_url}/api/v1/tools/list', params=params)
        return response.json()['tools']

    def group_by_server(self, tools: List[Dict]) -> Dict:
        """Group tools by their MCP server."""
        servers = {}
        for tool in tools:
            server_id = tool.get('server', 'unknown')
            if server_id not in servers:
                servers[server_id] = {
                    'server_id': server_id,
                    'integration': tool['integration'],
                    'category': tool['category'],
                    'tools': []
                }
            servers[server_id]['tools'].append({
                'id': tool['id'],
                'name': tool['name'],
                'description': tool['description']
            })
        return servers

    def get_server_stats(self) -> Dict:
        """Get statistics about available MCP servers."""
        tools = self.list_all_tools()
        servers = self.group_by_server(tools)

        return {
            'total_servers': len(servers),
            'total_tools': len(tools),
            'by_category': self._count_by_category(servers),
            'by_integration': self._count_by_integration(servers),
            'servers': servers
        }

    def _count_by_category(self, servers: Dict) -> Dict:
        counts = {}
        for server in servers.values():
            category = server['category']
            counts[category] = counts.get(category, 0) + 1
        return counts

    def _count_by_integration(self, servers: Dict) -> Dict:
        counts = {}
        for server in servers.values():
            integration = server['integration']
            counts[integration] = counts.get(integration, 0) + 1
        return counts

    def call_tool_on_server(
        self,
        tool_id: str,
        integration: str,
        parameters: Dict,
        tenant_id: str = 'default'
    ) -> Dict:
        """Call a specific tool (gateway routes to correct server)."""
        response = requests.post(
            f'{self.gateway_url}/api/v1/tools/invoke',
            json={
                'toolId': tool_id,
                'integration': integration,
                'tenantId': tenant_id,
                'parameters': parameters
            }
        )
        return response.json()


# Example Usage
if __name__ == '__main__':
    manager = MCPServerManager()

    # Get all server statistics
    print("📊 MCP Server Statistics")
    print("=" * 60)
    stats = manager.get_server_stats()

    print(f"Total MCP Servers: {stats['total_servers']}")
    print(f"Total Tools: {stats['total_tools']}")

    print("\n📂 Servers by Category:")
    for category, count in stats['by_category'].items():
        print(f"  {category}: {count} servers")

    print("\n🔌 Servers by Integration:")
    for integration, count in stats['by_integration'].items():
        print(f"  {integration}: {count} servers")

    # List GitHub servers
    print("\n\n🐙 GitHub MCP Servers:")
    print("=" * 60)
    github_tools = manager.list_all_tools(integration='github')
    github_servers = manager.group_by_server(github_tools)

    for server_id, server_info in list(github_servers.items())[:5]:
        print(f"\n{server_id}")
        print(f"  Category: {server_info['category']}")
        print(f"  Tools: {len(server_info['tools'])}")
        print("  Sample tools:")
        for tool in server_info['tools'][:3]:
            print(f"    - {tool['name']}: {tool['description'][:60]}...")

    # Call a specific tool
    print("\n\n🚀 Calling Specific Tool:")
    print("=" * 60)
    print("Calling: github.listRepositories")

    result = manager.call_tool_on_server(
        'github.listRepositories',
        'github',
        {'type': 'all', 'sort': 'updated'},
        tenant_id='demo-user'
    )

    if result.get('success'):
        print("✅ Success!")
        print(f"Result: {result.get('result', {})}")
    else:
        print("❌ Failed")
        print(f"Error: {result.get('error')}")
```

---

## Summary: Three Ways to Access MCP Servers

| Method | Use Case | Complexity | OAuth Handling |
|--------|----------|------------|----------------|
| **Via Gateway (Semantic)** | AI agents, natural language queries | Easy | Automatic |
| **Via Gateway (Direct)** | Know exact tool/server | Easy | Automatic |
| **Direct MCP Call** | Bypass gateway, custom logic | Medium | Manual |

**Recommended:** Use the gateway for most cases - it handles OAuth, routing, and optimization automatically!

---

## Next Steps

1. **Use `/api/v1/tools/list`** to discover available MCP servers and tools
2. **Group by server** to see which servers host which tools
3. **Call via gateway** using `/api/v1/tools/invoke` for automatic OAuth
4. **Direct calls** only if you need custom logic or bypassing

The gateway abstracts away the complexity while giving you full access to all 500+ tools across 44+ MCP servers!

---

**Last Updated:** 2025-11-11
