#!/usr/bin/env python3
"""
List and Call MCP Servers - Complete Example

Demonstrates:
1. Listing all MCP servers
2. Grouping tools by server
3. Getting server statistics
4. Calling specific servers directly
"""

import requests
from typing import Dict, List, Optional
from collections import defaultdict


class MCPServerManager:
    """Manager for discovering and interacting with MCP servers."""

    def __init__(self, gateway_url='http://localhost:3000'):
        self.gateway_url = gateway_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers['Content-Type'] = 'application/json'

    def list_all_tools(self, integration: Optional[str] = None, category: Optional[str] = None) -> List[Dict]:
        """
        List all available tools.

        Args:
            integration: Filter by integration (e.g., 'github', 'slack')
            category: Filter by category (e.g., 'code', 'communication')

        Returns:
            List of tool definitions
        """
        params = {'limit': 1000}
        if integration:
            params['integration'] = integration
        if category:
            params['category'] = category

        response = self.session.get(f'{self.gateway_url}/api/v1/tools/list', params=params)
        response.raise_for_status()
        return response.json()['tools']

    def list_categories(self) -> List[str]:
        """Get all available categories."""
        response = self.session.get(f'{self.gateway_url}/api/v1/categories')
        response.raise_for_status()
        return response.json()['categories']

    def group_by_server(self, tools: List[Dict]) -> Dict:
        """
        Group tools by their MCP server.

        Returns:
            Dict mapping server_id to server info with tools
        """
        servers = {}
        for tool in tools:
            # Extract server ID from tool metadata (if available)
            # In current implementation, we'll infer from integration + category
            server_id = self._infer_server_id(tool)

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
                'description': tool.get('description', ''),
                'tokenCost': tool.get('tokenCost', 0)
            })

        return servers

    def _infer_server_id(self, tool: Dict) -> str:
        """Infer server ID from tool metadata."""
        # In real implementation, this would come from tool metadata
        # For now, use integration-category as identifier
        return f"{tool['integration']}-{tool['category']}"

    def get_server_stats(self) -> Dict:
        """Get comprehensive statistics about MCP servers."""
        tools = self.list_all_tools()
        servers = self.group_by_server(tools)

        # Count by category
        by_category = defaultdict(int)
        by_integration = defaultdict(int)

        for server in servers.values():
            by_category[server['category']] += 1
            by_integration[server['integration']] += 1

        return {
            'total_servers': len(servers),
            'total_tools': len(tools),
            'by_category': dict(by_category),
            'by_integration': dict(by_integration),
            'servers': servers
        }

    def print_server_info(self, server_id: str, server_info: Dict, max_tools: int = 5):
        """Pretty print server information."""
        print(f"\n{'='*70}")
        print(f"Server: {server_id}")
        print(f"{'='*70}")
        print(f"Integration: {server_info['integration']}")
        print(f"Category: {server_info['category']}")
        print(f"Total Tools: {len(server_info['tools'])}")

        print(f"\nTools (showing {min(max_tools, len(server_info['tools']))}):")
        for tool in server_info['tools'][:max_tools]:
            print(f"  📦 {tool['name']}")
            if tool['description']:
                desc = tool['description'][:60] + '...' if len(tool['description']) > 60 else tool['description']
                print(f"     {desc}")
            print(f"     Token cost: {tool['tokenCost']}")

    def call_tool(
        self,
        tool_id: str,
        integration: str,
        parameters: Dict,
        tenant_id: str = 'demo-user'
    ) -> Dict:
        """
        Call a specific tool (gateway automatically routes to correct server).

        Args:
            tool_id: Tool identifier (e.g., 'github.createPullRequest')
            integration: Integration name (e.g., 'github')
            parameters: Tool parameters
            tenant_id: Tenant/user identifier

        Returns:
            Tool execution result
        """
        response = self.session.post(
            f'{self.gateway_url}/api/v1/tools/invoke',
            json={
                'toolId': tool_id,
                'integration': integration,
                'tenantId': tenant_id,
                'parameters': parameters
            }
        )
        response.raise_for_status()
        return response.json()


def main():
    """Run examples."""
    print("="*70)
    print("MCP Server Discovery and Management")
    print("="*70)

    # Initialize manager
    try:
        manager = MCPServerManager()
        # Test connection
        manager.session.get(f'{manager.gateway_url}/health')
        print("✅ Connected to Connectors Gateway")
    except Exception as e:
        print(f"❌ Cannot connect to gateway: {e}")
        print("\nPlease start the gateway first:")
        print("  cd gateway && npm run dev")
        return

    # Example 1: List all categories
    print("\n" + "="*70)
    print("Example 1: List All Categories")
    print("="*70)
    categories = manager.list_categories()
    print(f"Found {len(categories)} categories:")
    for category in categories:
        print(f"  - {category}")

    # Example 2: Get server statistics
    print("\n" + "="*70)
    print("Example 2: Server Statistics")
    print("="*70)
    stats = manager.get_server_stats()
    print(f"Total MCP Servers: {stats['total_servers']}")
    print(f"Total Tools: {stats['total_tools']}")

    print("\n📂 Servers by Category:")
    for category, count in sorted(stats['by_category'].items()):
        print(f"  {category}: {count} servers")

    print("\n🔌 Servers by Integration:")
    for integration, count in sorted(stats['by_integration'].items()):
        print(f"  {integration}: {count} servers")

    # Example 3: List GitHub servers
    print("\n" + "="*70)
    print("Example 3: GitHub MCP Servers")
    print("="*70)
    github_tools = manager.list_all_tools(integration='github')
    github_servers = manager.group_by_server(github_tools)

    print(f"Found {len(github_servers)} GitHub MCP servers")
    print(f"Total GitHub tools: {len(github_tools)}")

    # Show first 3 servers
    for i, (server_id, server_info) in enumerate(list(github_servers.items())[:3]):
        manager.print_server_info(server_id, server_info, max_tools=3)

    # Example 4: List specific category tools
    print("\n" + "="*70)
    print("Example 4: Communication Tools")
    print("="*70)
    comm_tools = manager.list_all_tools(category='communication')
    comm_servers = manager.group_by_server(comm_tools)

    print(f"Found {len(comm_servers)} communication servers")
    print(f"Total communication tools: {len(comm_tools)}")

    for server_id, server_info in comm_servers.items():
        manager.print_server_info(server_id, server_info, max_tools=2)

    # Example 5: Call a specific tool
    print("\n" + "="*70)
    print("Example 5: Call Specific Tool")
    print("="*70)

    # This will work if you have OAuth configured
    # For demo, we'll just show the structure
    print("Example call to: github.listRepositories")
    print("\nCode:")
    print("""
    result = manager.call_tool(
        'github.listRepositories',
        'github',
        {'type': 'all', 'sort': 'updated', 'per_page': 10},
        tenant_id='demo-user'
    )
    """)

    print("\n⚠️  Note: Actual execution requires OAuth setup in Vault")
    print("See: docs/OAUTH_IMPLEMENTATION_SUMMARY.md")

    # Example 6: Find tool by name
    print("\n" + "="*70)
    print("Example 6: Search for Specific Tools")
    print("="*70)

    search_term = "pull request"
    print(f"Searching for tools containing '{search_term}'...")

    all_tools = manager.list_all_tools()
    matching_tools = [
        tool for tool in all_tools
        if search_term.lower() in tool.get('name', '').lower()
        or search_term.lower() in tool.get('description', '').lower()
    ]

    print(f"\nFound {len(matching_tools)} matching tools:")
    for tool in matching_tools[:5]:
        print(f"\n  🔧 {tool['id']}")
        print(f"     Integration: {tool['integration']}")
        print(f"     Description: {tool.get('description', 'N/A')[:80]}...")

    # Example 7: Server health check
    print("\n" + "="*70)
    print("Example 7: Gateway Health Check")
    print("="*70)

    health = manager.session.get(f'{manager.gateway_url}/health').json()
    print(f"Status: {health['status']}")
    print(f"Uptime: {health['uptime']:.2f} seconds")
    print(f"Memory: {health['memory']['heapUsed'] / 1024 / 1024:.2f} MB")

    print("\n" + "="*70)
    print("✅ All examples completed!")
    print("="*70)


if __name__ == '__main__':
    main()
