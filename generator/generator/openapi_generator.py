"""Main OpenAPI to MCP generator class."""

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

from jinja2 import Environment, FileSystemLoader, Template

from .config import (
    MAX_OPERATIONS_PER_SERVER,
    OUTPUT_BASE_DIR,
    SUPPORTED_OAUTH_FLOWS,
    TEMPLATES_DIR,
)
from .utils import (
    extract_operation_id,
    extract_rate_limits,
    generate_typescript_type,
    infer_category,
    load_openapi_spec,
    split_operations_by_tag,
)


@dataclass
class GenerationConfig:
    """Configuration for MCP server generation."""

    spec_path: str
    """Path or URL to OpenAPI specification"""

    output_dir: Optional[Path] = None
    """Output directory (defaults to integrations/{category}/{name})"""

    category: Optional[str] = None
    """API category (auto-detected if not provided)"""

    force_split: bool = False
    """Force splitting even if under operation limit"""

    include_tests: bool = True
    """Generate integration tests"""

    validate_output: bool = True
    """Validate generated code"""

    dry_run: bool = False
    """Don't write files, just show what would be generated"""


@dataclass
class OAuthConfig:
    """OAuth configuration extracted from OpenAPI spec."""

    flow_type: str
    """OAuth flow: authorizationCode, implicit, clientCredentials"""

    auth_url: Optional[str] = None
    """Authorization URL (for authorizationCode/implicit)"""

    token_url: Optional[str] = None
    """Token URL"""

    scopes: Dict[str, str] = None
    """Available OAuth scopes"""

    def __post_init__(self) -> None:
        if self.scopes is None:
            self.scopes = {}


@dataclass
class GenerationResult:
    """Result of MCP generation."""

    success: bool
    """Whether generation succeeded"""

    output_paths: List[Path]
    """Paths to generated files"""

    warnings: List[str]
    """Non-fatal warnings during generation"""

    errors: List[str]
    """Fatal errors (if success=False)"""

    server_count: int
    """Number of MCP servers generated"""

    operation_count: int
    """Total number of operations converted"""


class OpenAPIToMCP:
    """Converts OpenAPI specifications to MCP servers."""

    def __init__(self, config: GenerationConfig):
        """
        Initialize generator.

        Args:
            config: Generation configuration
        """
        self.config = config
        self._spec: Optional[Dict[str, Any]] = None
        self._jinja_env = Environment(
            loader=FileSystemLoader(TEMPLATES_DIR), trim_blocks=True, lstrip_blocks=True
        )

    async def generate(self) -> GenerationResult:
        """
        Generate MCP server(s) from OpenAPI spec.

        Returns:
            Generation result with paths and metadata

        Raises:
            ValueError: If spec is invalid or generation fails
        """
        warnings: List[str] = []
        errors: List[str] = []
        output_paths: List[Path] = []

        try:
            # Load and validate spec
            self._spec = load_openapi_spec(self.config.spec_path)

            # Infer category if not provided
            category = self.config.category or infer_category(self._spec)

            # Check if splitting is needed
            specs_to_generate = self._check_and_split_spec()

            if len(specs_to_generate) > 1:
                warnings.append(
                    f"API has {self._count_operations(self._spec)} operations, "
                    f"splitting into {len(specs_to_generate)} servers"
                )

            # Generate server for each spec
            for idx, spec in enumerate(specs_to_generate):
                suffix = f"-{idx + 1}" if len(specs_to_generate) > 1 else ""
                result = await self._generate_single_server(spec, category, suffix)

                output_paths.extend(result.output_paths)
                warnings.extend(result.warnings)
                errors.extend(result.errors)

            return GenerationResult(
                success=len(errors) == 0,
                output_paths=output_paths,
                warnings=warnings,
                errors=errors,
                server_count=len(specs_to_generate),
                operation_count=self._count_operations(self._spec),
            )

        except Exception as e:
            return GenerationResult(
                success=False,
                output_paths=[],
                warnings=warnings,
                errors=[f"Generation failed: {str(e)}"],
                server_count=0,
                operation_count=0,
            )

    def _check_and_split_spec(self) -> List[Dict[str, Any]]:
        """Check if spec needs splitting and return list of specs to generate."""
        if self._spec is None:
            raise ValueError("Spec not loaded")

        operation_count = self._count_operations(self._spec)

        if operation_count <= MAX_OPERATIONS_PER_SERVER and not self.config.force_split:
            return [self._spec]

        return split_operations_by_tag(self._spec, MAX_OPERATIONS_PER_SERVER)

    def _count_operations(self, spec: Dict[str, Any]) -> int:
        """Count total operations in spec."""
        count = 0
        for path_item in spec.get("paths", {}).values():
            for method in ["get", "post", "put", "patch", "delete"]:
                if method in path_item:
                    count += 1
        return count

    async def _generate_single_server(
        self, spec: Dict[str, Any], category: str, suffix: str = ""
    ) -> GenerationResult:
        """Generate a single MCP server from spec."""
        warnings: List[str] = []
        errors: List[str] = []
        output_paths: List[Path] = []

        try:
            # Extract metadata
            info = spec.get("info", {})
            title = info.get("title", "Unknown API").replace(" ", "-").lower()
            server_name = f"{title}{suffix}"

            # Determine output directory
            if self.config.output_dir:
                # If output dir specified and we're splitting, create subdirectory for each server
                output_dir = self.config.output_dir / server_name
            else:
                output_dir = OUTPUT_BASE_DIR / category / server_name

            # Extract OAuth configuration
            oauth_config = self._extract_oauth_config(spec)
            if oauth_config is None:
                warnings.append("No OAuth configuration found - API key auth may be required")

            # Extract rate limits
            rate_limits = extract_rate_limits(spec)
            if rate_limits is None:
                warnings.append("No rate limit information found - using defaults")

            # Parse operations into tools
            tools = self._parse_operations(spec)

            if len(tools) == 0:
                errors.append("No valid operations found in spec")
                return GenerationResult(
                    success=False,
                    output_paths=[],
                    warnings=warnings,
                    errors=errors,
                    server_count=0,
                    operation_count=0,
                )

            # Generate files
            template_context = {
                "server_name": server_name,
                "category": category,
                "title": info.get("title", "Unknown API"),
                "description": info.get("description", ""),
                "version": info.get("version", "1.0.0"),
                "base_url": self._extract_base_url(spec),
                "oauth": oauth_config,
                "rate_limits": rate_limits,
                "tools": tools,
            }

            # Generate server file
            server_path = await self._render_and_write(
                "mcp_server_template.ts.j2", output_dir / "src" / "index.ts", template_context
            )
            output_paths.append(server_path)

            # Generate package.json
            package_json_path = await self._generate_package_json(output_dir, template_context)
            output_paths.append(package_json_path)

            # Generate tsconfig.json
            tsconfig_path = await self._generate_tsconfig(output_dir)
            output_paths.append(tsconfig_path)

            # Generate tests if requested
            if self.config.include_tests:
                test_path = await self._render_and_write(
                    "test_template.ts.j2",
                    output_dir / "tests" / "integration.test.ts",
                    template_context,
                )
                output_paths.append(test_path)

            return GenerationResult(
                success=True,
                output_paths=output_paths,
                warnings=warnings,
                errors=[],
                server_count=1,
                operation_count=len(tools),
            )

        except Exception as e:
            errors.append(f"Server generation failed: {str(e)}")
            return GenerationResult(
                success=False,
                output_paths=output_paths,
                warnings=warnings,
                errors=errors,
                server_count=0,
                operation_count=0,
            )

    def _extract_oauth_config(self, spec: Dict[str, Any]) -> Optional[OAuthConfig]:
        """Extract OAuth configuration from OpenAPI security schemes."""
        components = spec.get("components", {})
        security_schemes = components.get("securitySchemes", {})

        for scheme_name, scheme in security_schemes.items():
            if scheme.get("type") != "oauth2":
                continue

            flows = scheme.get("flows", {})
            for flow_name, flow_config in flows.items():
                if flow_name not in SUPPORTED_OAUTH_FLOWS:
                    continue

                return OAuthConfig(
                    flow_type=flow_name,
                    auth_url=flow_config.get("authorizationUrl"),
                    token_url=flow_config.get("tokenUrl"),
                    scopes=flow_config.get("scopes", {}),
                )

        return None

    def _extract_base_url(self, spec: Dict[str, Any]) -> str:
        """Extract base URL from servers section."""
        servers = spec.get("servers", [])
        if servers:
            return servers[0].get("url", "")
        return ""

    def _parse_operations(self, spec: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse OpenAPI operations into MCP tool definitions."""
        tools = []

        for path, path_item in spec.get("paths", {}).items():
            for method in ["get", "post", "put", "patch", "delete"]:
                if method not in path_item:
                    continue

                operation = path_item[method]
                tool = self._parse_single_operation(path, method, operation)
                if tool:
                    tools.append(tool)

        return tools

    def _parse_single_operation(
        self, path: str, method: str, operation: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Parse a single OpenAPI operation into MCP tool definition."""
        # Extract tool name
        tool_name = extract_operation_id(method, path, operation)

        # Extract description
        description = operation.get("summary") or operation.get("description") or f"{method} {path}"

        # Parse parameters
        parameters = self._parse_parameters(operation, path)

        # Parse request body
        request_body = self._parse_request_body(operation)
        if request_body:
            parameters.update(request_body)

        # Parse response schema
        response_schema = self._parse_response_schema(operation)

        return {
            "name": tool_name,
            "description": description,
            "method": method.upper(),
            "path": path,
            "parameters": parameters,
            "response_type": response_schema,
        }

    def _parse_parameters(self, operation: Dict[str, Any], path: str) -> Dict[str, Any]:
        """Parse OpenAPI parameters into MCP input schema."""
        schema: Dict[str, Any] = {"type": "object", "properties": {}, "required": []}

        parameters = operation.get("parameters", [])

        for param in parameters:
            param_name = param.get("name")
            param_schema = param.get("schema", {"type": "string"})
            param_required = param.get("required", False)

            schema["properties"][param_name] = {
                **param_schema,
                "description": param.get("description", ""),
            }

            if param_required:
                schema["required"].append(param_name)

        # Add path parameters (always required)
        import re

        path_params = re.findall(r"\{(\w+)\}", path)
        for param_name in path_params:
            if param_name not in schema["properties"]:
                schema["properties"][param_name] = {
                    "type": "string",
                    "description": f"Path parameter: {param_name}",
                }
                schema["required"].append(param_name)

        return schema

    def _parse_request_body(self, operation: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse OpenAPI request body into parameters."""
        request_body = operation.get("requestBody")
        if not request_body:
            return None

        content = request_body.get("content", {})
        json_content = content.get("application/json", {})
        schema = json_content.get("schema", {})

        if schema.get("type") == "object":
            # Flatten object properties into parameters
            properties = schema.get("properties", {})
            required = schema.get("required", [])

            return {
                "type": "object",
                "properties": properties,
                "required": required,
            }

        return None

    def _parse_response_schema(self, operation: Dict[str, Any]) -> str:
        """Parse OpenAPI response schema into TypeScript type."""
        responses = operation.get("responses", {})

        # Try to get success response (200, 201, etc.)
        for status in ["200", "201", "202", "204"]:
            if status in responses:
                response = responses[status]
                content = response.get("content", {})
                json_content = content.get("application/json", {})
                schema = json_content.get("schema", {})

                if schema:
                    return generate_typescript_type(schema)

        return "any"

    async def _render_and_write(
        self, template_name: str, output_path: Path, context: Dict[str, Any]
    ) -> Path:
        """Render Jinja2 template and write to file."""
        template = self._jinja_env.get_template(template_name)
        content = template.render(**context)

        if not self.config.dry_run:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(content)

        return output_path

    async def _generate_package_json(
        self, output_dir: Path, context: Dict[str, Any]
    ) -> Path:
        """Generate package.json for MCP server."""
        package_json = {
            "name": f"@connectors/mcp-{context['server_name']}",
            "version": "0.1.0",
            "description": context["description"],
            "main": "dist/index.js",
            "types": "dist/index.d.ts",
            "scripts": {
                "build": "tsc",
                "dev": "tsc --watch",
                "test": "jest",
                "lint": "eslint src/**/*.ts",
            },
            "dependencies": {
                "@modelcontextprotocol/sdk": "^0.5.0",
                "axios": "^1.6.0",
            },
            "devDependencies": {
                "@types/node": "^20.10.0",
                "@typescript-eslint/eslint-plugin": "^6.13.0",
                "@typescript-eslint/parser": "^6.13.0",
                "eslint": "^8.54.0",
                "jest": "^29.7.0",
                "typescript": "^5.3.0",
            },
        }

        path = output_dir / "package.json"
        if not self.config.dry_run:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(package_json, indent=2))

        return path

    async def _generate_tsconfig(self, output_dir: Path) -> Path:
        """Generate tsconfig.json for TypeScript compilation."""
        tsconfig = {
            "compilerOptions": {
                "target": "ES2020",
                "module": "commonjs",
                "lib": ["ES2020"],
                "outDir": "./dist",
                "rootDir": "./src",
                "strict": True,
                "esModuleInterop": True,
                "skipLibCheck": True,
                "forceConsistentCasingInFileNames": True,
                "declaration": True,
                "declarationMap": True,
                "sourceMap": True,
            },
            "include": ["src/**/*"],
            "exclude": ["node_modules", "dist", "tests"],
        }

        path = output_dir / "tsconfig.json"
        if not self.config.dry_run:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(tsconfig, indent=2))

        return path
