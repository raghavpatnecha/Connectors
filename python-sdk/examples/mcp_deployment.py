#!/usr/bin/env python3
"""
MCP deployment example.

Demonstrates:
- Listing integrations
- Deploying custom MCP servers
- Monitoring deployment progress
- Using deployed servers
"""

import asyncio
from connectors import Connectors
from connectors.types import (
    MCPDeploymentConfig,
    MCPSource,
    MCPSourceType,
    WaitOptions,
)


async def main() -> None:
    """Main example function."""
    connectors = Connectors(
        base_url="http://localhost:3000", tenant_id="my-company"
    )

    # Example 1: List all integrations
    print("=" * 60)
    print("Example 1: List all MCP integrations")
    print("=" * 60)

    integrations = await connectors.mcp.list()
    print(f"\nAvailable integrations ({len(integrations)}):")
    for integration in integrations:
        custom_badge = " [CUSTOM]" if integration.custom else ""
        print(
            f"  {integration.name}: {integration.tool_count} tools "
            f"({integration.category}){custom_badge}"
        )

    # Example 2: Get bound MCP server
    print("\n" + "=" * 60)
    print("Example 2: Using bound MCP server")
    print("=" * 60)

    github = connectors.mcp.get("github")

    # List tools for this integration
    tools = await github.list_tools()
    print(f"\nGitHub integration has {len(tools)} tools:")
    for tool in tools[:5]:  # Show first 5
        print(f"  - {tool.name}")

    # Call a tool directly
    print("\nCalling github.createIssue...")
    try:
        result = await github.call(
            "createIssue",
            {
                "repo": "owner/repo",
                "title": "Bug report",
                "body": "Found a bug in the application",
                "labels": ["bug"],
            },
        )
        print(f"✓ Issue created: {result}")
    except Exception as e:
        print(f"✗ Error: {e}")

    # Example 3: Deploy custom MCP from OpenAPI
    print("\n" + "=" * 60)
    print("Example 3: Deploy custom MCP server from OpenAPI")
    print("=" * 60)

    openapi_config = MCPDeploymentConfig(
        name="petstore-api",
        source=MCPSource(
            type=MCPSourceType.OPENAPI,
            url="https://petstore3.swagger.io/api/v3/openapi.json",
        ),
        category="custom",
        description="Swagger Petstore API",
    )

    print("\nDeploying Petstore API...")
    deployment = await connectors.mcp.add(openapi_config)
    print(f"Deployment ID: {deployment.deployment_id}")
    print(f"Status: {deployment.status}")

    # Wait for deployment with progress callback
    def on_progress(status):  # type: ignore
        print(f"  Progress: {status.status} ({status.progress}%)")

    try:
        await deployment.wait_until_ready(
            options=WaitOptions(
                timeout=300000,  # 5 minutes
                poll_interval=2000,  # 2 seconds
                on_progress=on_progress,
            )
        )
        print(f"✓ Deployment complete! Status: {deployment.status}")

        # Use the newly deployed server
        petstore = connectors.mcp.get("petstore-api")
        tools = await petstore.list_tools()
        print(f"\nPetstore API has {len(tools)} tools")

    except Exception as e:
        print(f"✗ Deployment failed: {e}")

    # Example 4: Deploy from Docker
    print("\n" + "=" * 60)
    print("Example 4: Deploy custom MCP server from Docker")
    print("=" * 60)

    docker_config = MCPDeploymentConfig(
        name="custom-docker-mcp",
        source=MCPSource(
            type=MCPSourceType.DOCKER, image="myregistry/custom-mcp:latest"
        ),
        category="custom",
        description="Custom Docker-based MCP server",
    )

    print("\nDeploying Docker MCP...")
    docker_deployment = await connectors.mcp.add(docker_config)
    print(f"Deployment ID: {docker_deployment.deployment_id}")

    # Poll deployment status manually
    print("\nPolling deployment status...")
    status = await connectors.mcp.wait_for_deployment(
        docker_deployment.deployment_id, options=WaitOptions(timeout=180000)
    )
    print(f"Final status: {status.status}")

    # Example 5: Deploy from NPM package
    print("\n" + "=" * 60)
    print("Example 5: Deploy custom MCP server from NPM")
    print("=" * 60)

    npm_config = MCPDeploymentConfig(
        name="custom-npm-mcp",
        source=MCPSource(type=MCPSourceType.NPM, package="@example/mcp-server"),
        category="custom",
        description="NPM-based MCP server",
    )

    print("\nDeploying NPM MCP...")
    npm_deployment = await connectors.mcp.add(npm_config)
    print(f"Deployment ID: {npm_deployment.deployment_id}")

    # Example 6: Remove custom MCP
    print("\n" + "=" * 60)
    print("Example 6: Remove custom MCP server")
    print("=" * 60)

    print("\nRemoving petstore-api...")
    try:
        await connectors.mcp.remove("petstore-api")
        print("✓ MCP server removed successfully")
    except Exception as e:
        print(f"✗ Error removing MCP: {e}")

    # Verify removal
    integrations_after = await connectors.mcp.list()
    petstore_exists = any(i.name == "petstore-api" for i in integrations_after)
    print(f"Petstore still exists: {petstore_exists}")


if __name__ == "__main__":
    asyncio.run(main())
