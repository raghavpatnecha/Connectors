#!/usr/bin/env python3
"""
Advanced tool selection example.

Demonstrates:
- Category filtering
- Token budget constraints
- Multiple queries
- Tool comparison
"""

import asyncio
from connectors import Connectors
from connectors.types import ToolSelectionOptions


async def main() -> None:
    """Main example function."""
    connectors = Connectors(
        base_url="http://localhost:3000", tenant_id="my-company"
    )

    # Example 1: Category filtering
    print("=" * 60)
    print("Example 1: Code tools for PR creation")
    print("=" * 60)

    code_tools = await connectors.tools.select(
        "create a pull request",
        options=ToolSelectionOptions(max_tools=3, categories=["code"]),
    )

    print(f"\nSelected {len(code_tools)} code tools:")
    for tool in code_tools:
        print(f"  {tool.name} ({tool.integration})")

    # Example 2: Communication tools
    print("\n" + "=" * 60)
    print("Example 2: Communication tools for messaging")
    print("=" * 60)

    comm_tools = await connectors.tools.select(
        "send a message to the team",
        options=ToolSelectionOptions(max_tools=5, categories=["communication"]),
    )

    print(f"\nSelected {len(comm_tools)} communication tools:")
    for tool in comm_tools:
        print(f"  {tool.name} ({tool.integration})")

    # Example 3: Token budget constraints
    print("\n" + "=" * 60)
    print("Example 3: Token budget constraint (max 1000 tokens)")
    print("=" * 60)

    budget_tools = await connectors.tools.select(
        "manage cloud infrastructure",
        options=ToolSelectionOptions(max_tools=10, token_budget=1000),
    )

    total_tokens = sum(tool.token_cost or 0 for tool in budget_tools)
    print(f"\nSelected {len(budget_tools)} tools with {total_tokens} total tokens:")
    for tool in budget_tools:
        print(f"  {tool.name}: {tool.token_cost} tokens")

    # Example 4: Multiple categories
    print("\n" + "=" * 60)
    print("Example 4: Multi-category selection")
    print("=" * 60)

    multi_tools = await connectors.tools.select(
        "create a GitHub issue and notify the team on Slack",
        options=ToolSelectionOptions(
            max_tools=5, categories=["code", "communication"]
        ),
    )

    print(f"\nSelected {len(multi_tools)} tools across categories:")
    for tool in multi_tools:
        print(f"  {tool.name} ({tool.category}/{tool.integration})")

    # Example 5: Compare different queries
    print("\n" + "=" * 60)
    print("Example 5: Query comparison")
    print("=" * 60)

    queries = [
        "deploy to kubernetes",
        "create a database backup",
        "send a notification",
    ]

    for query in queries:
        tools = await connectors.tools.select(query, options={"max_tools": 2})
        print(f"\nQuery: '{query}'")
        print(f"Top tools: {', '.join(t.name for t in tools)}")

    # Example 6: Search vs semantic selection
    print("\n" + "=" * 60)
    print("Example 6: Text search vs semantic selection")
    print("=" * 60)

    # Text search
    search_results = await connectors.tools.list(
        filters={"search": "pull request", "limit": 3}
    )
    print(f"\nText search results for 'pull request':")
    for tool in search_results:
        print(f"  {tool.name}")

    # Semantic selection
    semantic_results = await connectors.tools.select(
        "pull request", options={"max_tools": 3}
    )
    print(f"\nSemantic selection for 'pull request':")
    for tool in semantic_results:
        print(f"  {tool.name}")


if __name__ == "__main__":
    asyncio.run(main())
