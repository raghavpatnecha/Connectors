/**
 * Tool Registry Helper
 * Simplifies tool registration for MCP server
 */

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
}

export type ToolHandler = (args: any, tenantId: string) => Promise<any>;

export class ToolRegistry {
  private readonly _tools: Map<string, { definition: ToolDefinition; handler: ToolHandler }> = new Map();

  registerTool(definition: ToolDefinition, handler: ToolHandler): void {
    this._tools.set(definition.name, { definition, handler });
  }

  getTools(): ToolDefinition[] {
    return Array.from(this._tools.values()).map(t => t.definition);
  }

  getHandler(toolName: string): ToolHandler | undefined {
    return this._tools.get(toolName)?.handler;
  }

  getAllToolNames(): string[] {
    return Array.from(this._tools.keys());
  }

  getToolCount(): number {
    return this._tools.size;
  }
}
