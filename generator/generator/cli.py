"""CLI tool for OpenAPI to MCP generation."""

import asyncio
import sys
from pathlib import Path
from typing import Optional

import click

from . import OpenAPIToMCP, GenerationConfig, validate_generated_mcp


@click.group()
@click.version_option(version="0.1.0")
def main() -> None:
    """OpenAPI to MCP Server Generator.

    Convert OpenAPI specifications into TypeScript-based MCP servers
    with OAuth support, rate limiting, and auto-generated tests.
    """
    pass


@main.command()
@click.argument("spec_path", type=str)
@click.option(
    "--output",
    "-o",
    type=click.Path(path_type=Path),
    help="Output directory (default: integrations/{category}/{name})",
)
@click.option(
    "--category",
    "-c",
    type=str,
    help="API category (auto-detected if not provided)",
)
@click.option(
    "--force-split",
    is_flag=True,
    help="Force splitting even if under 100 operations",
)
@click.option(
    "--no-tests",
    is_flag=True,
    help="Skip test generation",
)
@click.option(
    "--no-validate",
    is_flag=True,
    help="Skip validation of generated code",
)
@click.option(
    "--dry-run",
    is_flag=True,
    help="Show what would be generated without writing files",
)
def generate(
    spec_path: str,
    output: Optional[Path],
    category: Optional[str],
    force_split: bool,
    no_tests: bool,
    no_validate: bool,
    dry_run: bool,
) -> None:
    """Generate MCP server from OpenAPI specification.

    SPEC_PATH can be a local file path or HTTP(S) URL to an OpenAPI spec.

    Examples:

        # Generate from local file
        openapi-mcp-gen generate ./specs/github.yaml

        # Generate from URL with custom category
        openapi-mcp-gen generate https://api.github.com/openapi.yaml -c code

        # Dry run to preview generation
        openapi-mcp-gen generate ./specs/slack.yaml --dry-run

        # Force split large API
        openapi-mcp-gen generate ./specs/aws.yaml --force-split
    """
    config = GenerationConfig(
        spec_path=spec_path,
        output_dir=output,
        category=category,
        force_split=force_split,
        include_tests=not no_tests,
        validate_output=not no_validate,
        dry_run=dry_run,
    )

    click.echo(f"Generating MCP server from: {spec_path}")

    try:
        generator = OpenAPIToMCP(config)
        result = asyncio.run(generator.generate())

        if result.success:
            click.secho("✓ Generation successful!", fg="green", bold=True)
            click.echo(f"\nGenerated {result.server_count} server(s) with {result.operation_count} operations")

            if result.warnings:
                click.secho("\nWarnings:", fg="yellow", bold=True)
                for warning in result.warnings:
                    click.echo(f"  ⚠ {warning}")

            click.echo("\nOutput files:")
            for path in result.output_paths:
                click.echo(f"  • {path}")

            if not dry_run:
                click.echo(
                    f"\nNext steps:\n"
                    f"  cd {result.output_paths[0].parent.parent}\n"
                    f"  npm install\n"
                    f"  npm run build\n"
                    f"  npm test"
                )

        else:
            click.secho("✗ Generation failed", fg="red", bold=True)
            for error in result.errors:
                click.echo(f"  ✗ {error}", err=True)
            sys.exit(1)

    except Exception as e:
        click.secho(f"✗ Error: {str(e)}", fg="red", bold=True, err=True)
        sys.exit(1)


@main.command()
@click.argument("server_path", type=click.Path(exists=True, path_type=Path))
@click.option(
    "--verbose",
    "-v",
    is_flag=True,
    help="Show detailed validation output",
)
def validate(server_path: Path, verbose: bool) -> None:
    """Validate a generated MCP server.

    SERVER_PATH should point to the root directory of a generated MCP server.

    Examples:

        # Validate generated server
        openapi-mcp-gen validate ./integrations/code/github

        # Verbose output
        openapi-mcp-gen validate ./integrations/code/github -v
    """
    click.echo(f"Validating MCP server at: {server_path}")

    try:
        result = asyncio.run(validate_generated_mcp(server_path))

        if result.passed:
            click.secho("✓ All validation checks passed!", fg="green", bold=True)
        else:
            click.secho("✗ Validation failed", fg="red", bold=True)

        if verbose or not result.passed:
            click.echo(f"\nChecks run: {', '.join(result.checks_run)}")

        if result.errors:
            click.secho("\nErrors:", fg="red", bold=True)
            for error in result.errors:
                click.echo(f"  ✗ {error}")

        if result.warnings:
            click.secho("\nWarnings:", fg="yellow", bold=True)
            for warning in result.warnings:
                click.echo(f"  ⚠ {warning}")

        if not result.passed:
            sys.exit(1)

    except Exception as e:
        click.secho(f"✗ Validation error: {str(e)}", fg="red", bold=True, err=True)
        sys.exit(1)


@main.command()
@click.argument("spec_path", type=str)
def analyze(spec_path: str) -> None:
    """Analyze OpenAPI spec and show generation preview.

    Examples:

        openapi-mcp-gen analyze ./specs/github.yaml
        openapi-mcp-gen analyze https://api.stripe.com/openapi.yaml
    """
    from .utils import load_openapi_spec, infer_category

    try:
        click.echo(f"Analyzing OpenAPI spec: {spec_path}\n")

        spec = load_openapi_spec(spec_path)
        info = spec.get("info", {})
        category = infer_category(spec)

        # Count operations
        operation_count = 0
        methods_count = {"GET": 0, "POST": 0, "PUT": 0, "PATCH": 0, "DELETE": 0}

        for path_item in spec.get("paths", {}).values():
            for method in ["get", "post", "put", "patch", "delete"]:
                if method in path_item:
                    operation_count += 1
                    methods_count[method.upper()] += 1

        # Display analysis
        click.secho("API Information:", bold=True)
        click.echo(f"  Title: {info.get('title', 'Unknown')}")
        click.echo(f"  Version: {info.get('version', 'Unknown')}")
        click.echo(f"  Category: {category}")
        click.echo(f"  Base URL: {spec.get('servers', [{}])[0].get('url', 'N/A')}")

        click.secho(f"\nOperations: {operation_count}", bold=True)
        for method, count in methods_count.items():
            if count > 0:
                click.echo(f"  {method}: {count}")

        # Check if splitting needed
        from .config import MAX_OPERATIONS_PER_SERVER

        if operation_count > MAX_OPERATIONS_PER_SERVER:
            click.secho(
                f"\n⚠ API has {operation_count} operations (>{MAX_OPERATIONS_PER_SERVER})",
                fg="yellow",
            )
            click.echo("  Server will be split by tags")

        # Check OAuth
        security_schemes = spec.get("components", {}).get("securitySchemes", {})
        oauth_schemes = [
            name for name, scheme in security_schemes.items() if scheme.get("type") == "oauth2"
        ]

        if oauth_schemes:
            click.secho(f"\nOAuth Configuration:", bold=True)
            for scheme_name in oauth_schemes:
                scheme = security_schemes[scheme_name]
                flows = scheme.get("flows", {})
                click.echo(f"  {scheme_name}: {', '.join(flows.keys())}")
        else:
            click.secho("\n⚠ No OAuth configuration found", fg="yellow")

        # Show tags
        tags = set()
        for path_item in spec.get("paths", {}).values():
            for method in ["get", "post", "put", "patch", "delete"]:
                if method in path_item:
                    operation_tags = path_item[method].get("tags", [])
                    tags.update(operation_tags)

        if tags:
            click.secho(f"\nTags ({len(tags)}):", bold=True)
            for tag in sorted(tags):
                click.echo(f"  • {tag}")

    except Exception as e:
        click.secho(f"✗ Analysis failed: {str(e)}", fg="red", bold=True, err=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
