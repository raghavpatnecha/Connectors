"""
Connectors Platform - Python Client Example

Demonstrates how to integrate the Connectors Platform into any Python application.
Works with AI agents, chatbots, automation scripts, or any Python project.
"""

import requests
import json
from typing import Dict, List, Optional, Any


class ConnectorsClient:
    """
    Python client for the Connectors Platform.

    Provides access to 500+ integrations through semantic tool selection
    and automatic OAuth token management.
    """

    def __init__(
        self,
        base_url: str = 'http://localhost:3000',
        tenant_id: str = 'default',
        api_key: Optional[str] = None
    ):
        """
        Initialize the Connectors client.

        Args:
            base_url: Gateway URL (default: http://localhost:3000)
            tenant_id: Your tenant/user identifier
            api_key: Optional API key for authentication (future)
        """
        self.base_url = base_url.rstrip('/')
        self.tenant_id = tenant_id
        self.session = requests.Session()

        if api_key:
            self.session.headers['Authorization'] = f'Bearer {api_key}'

        self.session.headers['Content-Type'] = 'application/json'

    def select_tools(
        self,
        query: str,
        max_tools: int = 5,
        allowed_categories: Optional[List[str]] = None,
        token_budget: int = 5000
    ) -> Dict[str, Any]:
        """
        Get relevant tools for a natural language query using semantic search.

        Args:
            query: Natural language description of what you want to do
            max_tools: Maximum number of tools to return
            allowed_categories: Limit to specific categories (e.g., ['code', 'communication'])
            token_budget: Token budget for tool schemas

        Returns:
            Dict containing selected tools organized by tier

        Example:
            >>> client = ConnectorsClient()
            >>> tools = client.select_tools("create a GitHub pull request")
            >>> print(tools['tools']['tier1'][0]['name'])
            'createPullRequest'
        """
        response = self.session.post(
            f'{self.base_url}/api/v1/tools/select',
            json={
                'query': query,
                'context': {
                    'tenantId': self.tenant_id,
                    'maxTools': max_tools,
                    'allowedCategories': allowed_categories or [],
                    'tokenBudget': token_budget
                }
            }
        )
        response.raise_for_status()
        return response.json()

    def invoke_tool(
        self,
        tool_id: str,
        integration: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a specific tool with parameters.

        OAuth credentials are automatically injected by the gateway.

        Args:
            tool_id: Tool identifier (e.g., 'github.createPullRequest')
            integration: Integration name (e.g., 'github')
            parameters: Tool parameters as a dictionary

        Returns:
            Dict containing execution result

        Example:
            >>> result = client.invoke_tool(
            ...     'github.createPullRequest',
            ...     'github',
            ...     {
            ...         'owner': 'facebook',
            ...         'repo': 'react',
            ...         'title': 'Fix bug',
            ...         'head': 'feature-branch',
            ...         'base': 'main'
            ...     }
            ... )
            >>> print(result['result']['url'])
            'https://github.com/facebook/react/pull/12345'
        """
        response = self.session.post(
            f'{self.base_url}/api/v1/tools/invoke',
            json={
                'toolId': tool_id,
                'integration': integration,
                'tenantId': self.tenant_id,
                'parameters': parameters
            }
        )
        response.raise_for_status()
        return response.json()

    def list_tools(
        self,
        category: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        List all available tools, optionally filtered by category.

        Args:
            category: Filter by category (e.g., 'code', 'communication')
            limit: Maximum tools to return
            offset: Pagination offset

        Returns:
            Dict containing list of tools
        """
        params = {'limit': limit, 'offset': offset}
        if category:
            params['category'] = category

        response = self.session.get(
            f'{self.base_url}/api/v1/tools/list',
            params=params
        )
        response.raise_for_status()
        return response.json()

    def list_categories(self) -> List[str]:
        """
        Get all available integration categories.

        Returns:
            List of category names

        Example:
            >>> categories = client.list_categories()
            >>> print(categories)
            ['code', 'communication', 'project_management', 'cloud', 'data']
        """
        response = self.session.get(f'{self.base_url}/api/v1/categories')
        response.raise_for_status()
        return response.json()['categories']

    def get_metrics(self) -> Dict[str, Any]:
        """
        Get usage metrics and statistics.

        Returns:
            Dict containing metrics
        """
        response = self.session.get(f'{self.base_url}/api/v1/metrics')
        response.raise_for_status()
        return response.json()

    def health_check(self) -> Dict[str, Any]:
        """
        Check gateway health status.

        Returns:
            Dict containing health status
        """
        response = self.session.get(f'{self.base_url}/health')
        response.raise_for_status()
        return response.json()


# =============================================================================
# Example 1: Simple AI Agent
# =============================================================================

def ai_agent_example():
    """Demonstrate using Connectors in an AI agent."""
    client = ConnectorsClient(tenant_id='agent-123')

    # User asks the agent to do something
    user_query = "Create a GitHub issue for the bug I found"

    # Step 1: Find relevant tools
    print(f"🤖 Agent received: '{user_query}'")
    tools_response = client.select_tools(user_query, max_tools=3)

    # Step 2: Agent selects the best tool (simplified - normally use LLM)
    tools = tools_response['tools']['tier1']
    if not tools:
        print("❌ No tools found for query")
        return

    selected_tool = tools[0]
    print(f"✅ Selected tool: {selected_tool['name']}")
    print(f"   Description: {selected_tool['description']}")

    # Step 3: Extract parameters (simplified - normally use LLM)
    parameters = {
        'owner': 'facebook',
        'repo': 'react',
        'title': 'Bug: Login fails with SSO',
        'body': 'Detailed description of the bug...',
        'labels': ['bug']
    }

    # Step 4: Execute the tool
    print(f"⚙️  Executing tool...")
    result = client.invoke_tool(
        selected_tool['id'],
        selected_tool['integration'],
        parameters
    )

    if result['success']:
        print(f"✅ Success! Created issue: {result['result'].get('html_url', 'N/A')}")
    else:
        print(f"❌ Error: {result.get('error', 'Unknown error')}")


# =============================================================================
# Example 2: Chatbot Integration
# =============================================================================

def chatbot_example():
    """Demonstrate using Connectors in a chatbot."""
    client = ConnectorsClient(tenant_id='chatbot-456')

    # Simulate user messages
    user_messages = [
        "send a message to slack #general saying hello",
        "list all open GitHub issues in react repo",
        "deploy my function to AWS Lambda"
    ]

    for message in user_messages:
        print(f"\n💬 User: {message}")

        # Find tools
        tools = client.select_tools(message, max_tools=1)

        if tools['tools']['tier1']:
            tool = tools['tools']['tier1'][0]
            print(f"🤖 Bot: I'll use {tool['integration']}.{tool['name']} to help you!")
            print(f"   (Token usage: {tools['metadata']['tokenUsage']} tokens)")
        else:
            print("🤖 Bot: I don't have a tool for that yet.")


# =============================================================================
# Example 3: Multi-Step Workflow
# =============================================================================

def workflow_example():
    """Demonstrate a multi-step automated workflow."""
    client = ConnectorsClient(tenant_id='workflow-789')

    print("🔄 Starting automated workflow: 'Deploy & Notify'")

    # Step 1: Deploy to AWS
    print("\n1️⃣ Deploying to AWS Lambda...")
    deploy_result = client.invoke_tool(
        'aws.deployFunction',
        'aws',
        {
            'functionName': 'my-api',
            'runtime': 'nodejs18.x',
            'handler': 'index.handler',
            'code': {'zipFile': 'base64-encoded-zip'}
        }
    )

    if not deploy_result['success']:
        print(f"❌ Deployment failed: {deploy_result.get('error')}")
        return

    print("✅ Deployed successfully")

    # Step 2: Create GitHub release
    print("\n2️⃣ Creating GitHub release...")
    release_result = client.invoke_tool(
        'github.createRelease',
        'github',
        {
            'owner': 'myorg',
            'repo': 'myrepo',
            'tag_name': 'v1.0.0',
            'name': 'Production Release v1.0.0',
            'body': f"Deployed to AWS: {deploy_result['result']['functionArn']}"
        }
    )

    print("✅ Release created")

    # Step 3: Notify team on Slack
    print("\n3️⃣ Notifying team on Slack...")
    slack_result = client.invoke_tool(
        'slack.sendMessage',
        'slack',
        {
            'channel': 'C1234567',
            'text': f"🚀 Deployed v1.0.0 to production! {release_result['result']['html_url']}"
        }
    )

    print("✅ Team notified")
    print("\n🎉 Workflow completed successfully!")


# =============================================================================
# Example 4: Error Handling
# =============================================================================

def error_handling_example():
    """Demonstrate proper error handling."""
    client = ConnectorsClient(tenant_id='error-test')

    try:
        result = client.invoke_tool(
            'github.createPullRequest',
            'github',
            {'owner': 'test', 'repo': 'test'}  # Missing required params
        )

        if not result['success']:
            error = result.get('error', {})
            error_code = error.get('code', 'UNKNOWN')

            if error_code == 'OAUTH_ERROR':
                print("❌ Authentication failed - please reconnect GitHub")
            elif error_code == 'RATE_LIMIT':
                print("❌ Rate limit exceeded - please try again later")
            elif error_code == 'VALIDATION_ERROR':
                print(f"❌ Invalid parameters: {error.get('message')}")
            else:
                print(f"❌ Error: {error.get('message')}")

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to gateway - is it running?")
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


# =============================================================================
# Example 5: Category-Specific Usage
# =============================================================================

def category_example():
    """Demonstrate filtering by categories."""
    client = ConnectorsClient()

    # List all categories
    print("📂 Available categories:")
    categories = client.list_categories()
    for category in categories:
        print(f"   - {category}")

    # Get only code-related tools
    print("\n🔧 Code-related tools for: 'merge pull request'")
    tools = client.select_tools(
        "merge pull request",
        allowed_categories=['code'],
        max_tools=3
    )

    for tool in tools['tools']['tier1']:
        print(f"   - {tool['integration']}.{tool['name']}")


# =============================================================================
# Example 6: Performance Monitoring
# =============================================================================

def monitoring_example():
    """Demonstrate monitoring and metrics."""
    client = ConnectorsClient()

    # Check health
    health = client.health_check()
    print(f"🏥 Gateway health: {health['status']}")
    print(f"   Uptime: {health['uptime']:.2f}s")

    # Get metrics
    metrics = client.get_metrics()
    print(f"\n📊 Usage metrics:")
    print(f"   Total tool calls: {metrics.get('total', 0)}")
    print(f"   Token reduction: {metrics.get('tokenReductionPct', 0):.1f}%")
    print(f"   Avg latency: {metrics.get('avgLatencyMs', 0):.1f}ms")


# =============================================================================
# Main
# =============================================================================

if __name__ == '__main__':
    print("=" * 70)
    print("Connectors Platform - Python Client Examples")
    print("=" * 70)

    # Check if gateway is running
    try:
        client = ConnectorsClient()
        health = client.health_check()
        print(f"✅ Gateway is running (status: {health['status']})\n")
    except Exception as e:
        print(f"❌ Gateway is not running. Please start it first:")
        print(f"   cd gateway && npm run dev\n")
        print(f"Error: {e}\n")
        exit(1)

    # Run examples
    print("\n" + "=" * 70)
    print("Example 1: AI Agent")
    print("=" * 70)
    # ai_agent_example()  # Uncomment to run

    print("\n" + "=" * 70)
    print("Example 2: Chatbot")
    print("=" * 70)
    chatbot_example()

    print("\n" + "=" * 70)
    print("Example 3: Multi-Step Workflow")
    print("=" * 70)
    # workflow_example()  # Uncomment to run (requires OAuth setup)

    print("\n" + "=" * 70)
    print("Example 4: Error Handling")
    print("=" * 70)
    # error_handling_example()  # Uncomment to run

    print("\n" + "=" * 70)
    print("Example 5: Category Filtering")
    print("=" * 70)
    category_example()

    print("\n" + "=" * 70)
    print("Example 6: Monitoring")
    print("=" * 70)
    monitoring_example()

    print("\n✅ Examples completed!")
