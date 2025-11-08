"""Utility functions for OpenAPI to MCP conversion."""

import re
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import inflection
import requests
import yaml
from openapi_spec_validator import validate
from openapi_spec_validator.readers import read_from_filename

from .config import (
    CATEGORY_KEYWORDS,
    DEFAULT_HTTP_TIMEOUT,
    TOOL_NAME_MAX_LENGTH,
    TOOL_NAME_SEPARATOR,
)


def load_openapi_spec(spec_path_or_url: str) -> Dict[str, Any]:
    """
    Load and validate OpenAPI spec from file or URL.

    Args:
        spec_path_or_url: Path to local file or HTTP(S) URL

    Returns:
        Parsed OpenAPI specification dictionary

    Raises:
        ValueError: If spec is invalid or cannot be loaded
    """
    if is_url(spec_path_or_url):
        return _load_from_url(spec_path_or_url)
    else:
        return _load_from_file(spec_path_or_url)


def is_url(path_or_url: str) -> bool:
    """Check if string is a valid HTTP(S) URL."""
    try:
        result = urlparse(path_or_url)
        return result.scheme in ("http", "https") and bool(result.netloc)
    except Exception:
        return False


def _load_from_url(url: str) -> Dict[str, Any]:
    """Load OpenAPI spec from URL."""
    try:
        response = requests.get(url, timeout=DEFAULT_HTTP_TIMEOUT)
        response.raise_for_status()

        # Try JSON first, then YAML
        try:
            spec = response.json()
        except ValueError:
            spec = yaml.safe_load(response.text)

        validate(spec)
        return spec
    except requests.RequestException as e:
        raise ValueError(f"Failed to fetch OpenAPI spec from URL: {e}")
    except Exception as e:
        raise ValueError(f"Failed to parse OpenAPI spec: {e}")


def _load_from_file(file_path: str) -> Dict[str, Any]:
    """Load OpenAPI spec from local file."""
    try:
        path = Path(file_path)
        if not path.exists():
            raise ValueError(f"File not found: {file_path}")

        spec_dict, _ = read_from_filename(str(path))
        validate(spec_dict)
        return spec_dict
    except Exception as e:
        raise ValueError(f"Failed to load OpenAPI spec from file: {e}")


def infer_category(spec: Dict[str, Any]) -> str:
    """
    Infer API category from OpenAPI spec metadata.

    Args:
        spec: OpenAPI specification dictionary

    Returns:
        Category name (e.g., 'code', 'communication', 'cloud')
    """
    # Extract searchable text
    info = spec.get("info", {})
    title = info.get("title", "").lower()
    description = info.get("description", "").lower()
    search_text = f"{title} {description}"

    # Score each category by keyword matches
    scores: Dict[str, int] = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in search_text)
        if score > 0:
            scores[category] = score

    # Return highest scoring category or default
    if scores:
        return max(scores.items(), key=lambda x: x[1])[0]
    return "general"


def sanitize_tool_name(name: str) -> str:
    """
    Convert operation ID to valid MCP tool name.

    Rules:
    - camelCase preserved
    - Remove special characters
    - Max length enforced
    - Descriptive prefix if needed

    Examples:
        'createPullRequest' -> 'createPullRequest'
        'repos/{owner}/{repo}/pulls' -> 'createRepoPull'
        'get-user-profile' -> 'getUserProfile'
    """
    # Remove URL path-like patterns
    name = re.sub(r"[{}/()\[\]]", "", name)

    # Replace separators with camelCase
    parts = re.split(r"[-_\s]+", name)
    if len(parts) > 1:
        name = parts[0].lower() + "".join(inflection.camelize(p) for p in parts[1:])
    else:
        name = inflection.camelize(name, uppercase_first_letter=False)

    # Truncate if too long
    if len(name) > TOOL_NAME_MAX_LENGTH:
        name = name[:TOOL_NAME_MAX_LENGTH]

    return name


def extract_operation_id(method: str, path: str, operation: Dict[str, Any]) -> str:
    """
    Extract or generate operation ID for MCP tool name.

    Args:
        method: HTTP method (get, post, etc.)
        path: API path
        operation: OpenAPI operation object

    Returns:
        Operation ID suitable for tool name
    """
    # Use explicit operationId if available
    if "operationId" in operation:
        return sanitize_tool_name(operation["operationId"])

    # Generate from method + path
    # e.g., POST /repos/{owner}/{repo}/pulls -> createRepoPull
    path_parts = [p for p in path.split("/") if p and not p.startswith("{")]
    action_prefix = {
        "get": "get",
        "post": "create",
        "put": "update",
        "patch": "update",
        "delete": "delete",
    }.get(method.lower(), method.lower())

    if path_parts:
        resource = "".join(inflection.camelize(p) for p in path_parts[-2:])
        return f"{action_prefix}{resource}"
    else:
        return f"{action_prefix}Resource"


def generate_typescript_type(schema: Dict[str, Any], indent_level: int = 0) -> str:
    """
    Generate TypeScript type from JSON Schema.

    Args:
        schema: JSON Schema object
        indent_level: Current indentation level

    Returns:
        TypeScript type string
    """
    from .config import TS_INDENT

    indent = TS_INDENT * indent_level

    schema_type = schema.get("type", "any")

    if schema_type == "object":
        properties = schema.get("properties", {})
        required = set(schema.get("required", []))

        if not properties:
            return "Record<string, any>"

        lines = ["{"]
        for prop_name, prop_schema in properties.items():
            prop_type = generate_typescript_type(prop_schema, indent_level + 1)
            optional = "" if prop_name in required else "?"
            lines.append(f"{TS_INDENT}{indent}{prop_name}{optional}: {prop_type};")
        lines.append(f"{indent}}}")
        return "\n".join(lines)

    elif schema_type == "array":
        items = schema.get("items", {})
        item_type = generate_typescript_type(items, indent_level)
        return f"Array<{item_type}>"

    elif schema_type == "string":
        enum = schema.get("enum")
        if enum:
            return " | ".join(f'"{val}"' for val in enum)
        return "string"

    elif schema_type == "integer" or schema_type == "number":
        return "number"

    elif schema_type == "boolean":
        return "boolean"

    elif schema_type == "null":
        return "null"

    else:
        # oneOf, anyOf, allOf
        if "oneOf" in schema:
            types = [generate_typescript_type(s, indent_level) for s in schema["oneOf"]]
            return " | ".join(types)
        elif "anyOf" in schema:
            types = [generate_typescript_type(s, indent_level) for s in schema["anyOf"]]
            return " | ".join(types)
        elif "allOf" in schema:
            # Simplified: just use first type
            return generate_typescript_type(schema["allOf"][0], indent_level)

        return "any"


def extract_rate_limits(spec: Dict[str, Any]) -> Optional[Dict[str, int]]:
    """
    Extract rate limit information from OpenAPI spec.

    Checks:
    - x-ratelimit-* extensions
    - info.x-rate-limit
    - Common rate limit headers in responses

    Returns:
        Dict with rate limit config or None
    """
    # Check spec-level extensions
    info = spec.get("info", {})
    if "x-ratelimit-limit" in info:
        return {
            "requests_per_minute": int(info["x-ratelimit-limit"]),
            "requests_per_hour": int(info.get("x-ratelimit-limit-hour", 1000)),
        }

    # Check response headers across operations
    for path, path_item in spec.get("paths", {}).items():
        for method, operation in path_item.items():
            if method not in ["get", "post", "put", "patch", "delete"]:
                continue

            responses = operation.get("responses", {})
            for status, response in responses.items():
                headers = response.get("headers", {})
                if "X-RateLimit-Limit" in headers or "x-ratelimit-limit" in headers:
                    # Found rate limit headers, return default
                    from .config import DEFAULT_RATE_LIMIT

                    return DEFAULT_RATE_LIMIT

    return None


def split_operations_by_tag(
    spec: Dict[str, Any], max_per_server: int
) -> List[Dict[str, Any]]:
    """
    Split large OpenAPI spec into multiple specs by tags.

    Args:
        spec: OpenAPI specification
        max_per_server: Maximum operations per server

    Returns:
        List of OpenAPI specs, each with <= max_per_server operations
    """
    paths = spec.get("paths", {})

    # Count operations
    total_operations = sum(
        len([m for m in methods.keys() if m in ["get", "post", "put", "patch", "delete"]])
        for methods in paths.values()
    )

    if total_operations <= max_per_server:
        return [spec]

    # Group by tags
    tag_groups: Dict[str, Dict[str, Any]] = {}

    for path, path_item in paths.items():
        for method in ["get", "post", "put", "patch", "delete"]:
            if method not in path_item:
                continue

            operation = path_item[method]
            tags = operation.get("tags", ["default"])
            primary_tag = tags[0]

            if primary_tag not in tag_groups:
                tag_groups[primary_tag] = {}
            if path not in tag_groups[primary_tag]:
                tag_groups[primary_tag][path] = {}

            tag_groups[primary_tag][path][method] = operation

    # Create separate specs for each tag group
    split_specs = []
    for tag, tag_paths in tag_groups.items():
        new_spec = {
            "openapi": spec.get("openapi", "3.0.0"),
            "info": {
                **spec.get("info", {}),
                "title": f"{spec.get('info', {}).get('title', 'API')} - {tag}",
            },
            "servers": spec.get("servers", []),
            "paths": tag_paths,
            "components": spec.get("components", {}),
            "security": spec.get("security", []),
        }
        split_specs.append(new_spec)

    return split_specs
