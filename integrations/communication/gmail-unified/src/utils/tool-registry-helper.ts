import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';

export class ToolRegistry {
  private _toolCount = 0;

  constructor(private readonly _server: Server) {}

  registerTool<T extends z.ZodTypeAny>(
    name: string,
    description: string,
    schema: T,
    handler: (params: z.infer<T>) => Promise<any>
  ): void {
    this._server.setRequestHandler(
      { method: 'tools/call', params: { name } } as any,
      async (request: any) => {
        try {
          const validatedParams = schema.parse(request.params.arguments);
          const result = await handler(validatedParams);
          return result;
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: error.message,
                details: error.stack
              })
            }]
          };
        }
      }
    );

    this._toolCount++;
  }

  getToolCount(): number {
    return this._toolCount;
  }

  formatResponse(data: any) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }]
    };
  }
}
