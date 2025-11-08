"""OpenAPI to MCP Server Generator.

Converts OpenAPI specifications into TypeScript-based MCP servers with OAuth support.
"""

from .openapi_generator import OpenAPIToMCP, GenerationConfig, GenerationResult
from .validators import ValidationResult, validate_generated_mcp

__version__ = "0.1.0"

__all__ = [
    "OpenAPIToMCP",
    "GenerationConfig",
    "GenerationResult",
    "ValidationResult",
    "validate_generated_mcp",
]
