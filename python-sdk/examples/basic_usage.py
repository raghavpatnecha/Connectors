#!/usr/bin/env python3
"""
Basic usage example for Connectors Python SDK.

Demonstrates:
- Client initialization
- Health check
- Semantic tool selection
- Tool invocation
"""

import asyncio
from connectors import Connectors


async def main() -> None:
    """Main example function."""
    # Initialize Connectors client
    connectors = Connectors(
        base_url="http://localhost:3000",
        tenant_id="my-company",
        api_key="your-api-key",  # Optional
    )

    # Test connection
    print("Testing connection...")
    is_connected = await connectors.test_connection()
    print(f"Connected: {is_connected}")

    if not is_connected:
        print("Failed to connect to gateway")
        return

    # Check health
    print("\nChecking gateway health...")
    health = await connectors.health()
    print(f"Status: {health.status}")
    print(f"Version: {health.version}")
    print(f"Uptime: {health.uptime}s")

    # Semantic tool selection
    print("\nSelecting tools for: 'create a GitHub pull request'")
    tools = await connectors.tools.select(
        "create a GitHub pull request",
        options={"max_tools": 5, "categories": ["code"]},
    )

    print(f"\nSelected {len(tools)} tools:")
    for i, tool in enumerate(tools, 1):
        print(f"{i}. {tool.name} ({tool.tool_id})")
        print(f"   {tool.description}")
        print(f"   Category: {tool.category}, Integration: {tool.integration}")
        if tool.token_cost:
            print(f"   Token cost: {tool.token_cost}")
        print()

    # Tool invocation example
    print("\nInvoking tool: github.createPullRequest")
    try:
        result = await connectors.tools.invoke(
            tool_id="github.createPullRequest",
            parameters={
                "repo": "owner/repo",
                "title": "New feature implementation",
                "head": "feature-branch",
                "base": "main",
                "body": "This PR implements a new feature",
            },
        )

        if result.success:
            print(f"✓ Success! PR created: {result.data}")
            print(f"Execution time: {result.execution_time_ms}ms")
        else:
            print(f"✗ Failed: {result.error}")

    except Exception as e:
        print(f"✗ Error invoking tool: {e}")

    # List all GitHub tools
    print("\nListing all GitHub tools...")
    github_tools = await connectors.tools.list(
        filters={"integration": "github", "limit": 10}
    )

    print(f"Found {len(github_tools)} GitHub tools:")
    for tool in github_tools:
        print(f"  - {tool.name}")


if __name__ == "__main__":
    asyncio.run(main())
