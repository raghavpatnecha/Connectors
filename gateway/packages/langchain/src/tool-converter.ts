/**
 * Tool converter for Connectors to LangChain
 * Converts Connectors Tool parameters to Zod schemas
 */

import { z } from 'zod';
import type { ToolParameter } from './types';

/**
 * Convert Connectors Tool parameters to Zod schema
 *
 * @param parameters - Tool parameters from Connectors
 * @returns Zod object schema
 */
export function convertToZodSchema(parameters: ToolParameter[]): z.ZodObject<any> {
  if (!parameters || parameters.length === 0) {
    return z.object({});
  }

  const shape: Record<string, z.ZodTypeAny> = {};

  for (const param of parameters) {
    let zodType = getZodType(param);

    // Add enum constraint if present
    if (param.enum && param.enum.length > 0) {
      zodType = z.enum(param.enum as [string, ...string[]]);
    }

    // Add description
    if (param.description) {
      zodType = zodType.describe(param.description);
    }

    // Make optional if not required
    if (!param.required) {
      zodType = zodType.optional();
    }

    shape[param.name] = zodType;
  }

  return z.object(shape);
}

/**
 * Get Zod type for parameter
 *
 * @param param - Tool parameter
 * @returns Zod type
 */
function getZodType(param: ToolParameter): z.ZodTypeAny {
  const type = param.type?.toLowerCase() || 'string';

  switch (type) {
    case 'string':
      return createStringType(param);

    case 'number':
      return createNumberType(param, false);

    case 'integer':
      return createNumberType(param, true);

    case 'boolean':
      return z.boolean();

    case 'array':
      return createArrayType(param);

    case 'object':
      return createObjectType(param);

    default:
      return z.any();
  }
}

/**
 * Create string type with constraints
 */
function createStringType(param: ToolParameter): z.ZodTypeAny {
  let zodType: z.ZodString = z.string();

  // Add format constraints
  if (param.format) {
    switch (param.format) {
      case 'email':
        zodType = zodType.email();
        break;
      case 'uri':
      case 'url':
        zodType = zodType.url();
        break;
      case 'uuid':
        zodType = zodType.uuid();
        break;
    }
  }

  // Add length constraints
  if (param.minLength !== undefined) {
    zodType = zodType.min(param.minLength);
  }
  if (param.maxLength !== undefined) {
    zodType = zodType.max(param.maxLength);
  }

  // Add pattern constraint
  if (param.pattern) {
    zodType = zodType.regex(new RegExp(param.pattern));
  }

  return zodType;
}

/**
 * Create number type with constraints
 */
function createNumberType(param: ToolParameter, isInteger: boolean): z.ZodTypeAny {
  let zodType: z.ZodNumber = z.number();

  if (isInteger) {
    zodType = zodType.int();
  }

  // Add range constraints
  if (param.minimum !== undefined) {
    zodType = zodType.min(param.minimum);
  }
  if (param.maximum !== undefined) {
    zodType = zodType.max(param.maximum);
  }

  return zodType;
}

/**
 * Create array type with item constraints
 */
function createArrayType(param: ToolParameter): z.ZodTypeAny {
  let itemType: z.ZodTypeAny = z.any();

  // Get item type if specified
  if (param.items) {
    itemType = getZodType({
      name: 'item',
      type: param.items.type,
      required: false
    } as ToolParameter);
  }

  let zodType = z.array(itemType);

  // Add length constraints
  if (param.minItems !== undefined) {
    zodType = zodType.min(param.minItems);
  }
  if (param.maxItems !== undefined) {
    zodType = zodType.max(param.maxItems);
  }

  return zodType;
}

/**
 * Create object type
 */
function createObjectType(param: ToolParameter): z.ZodTypeAny {
  // If properties are specified, create structured object
  if (param.properties) {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const [propName, propDef] of Object.entries(param.properties)) {
      // Check if this property is required
      const isRequired = Array.isArray(param.required)
        ? param.required.includes(propName)
        : false;

      const propParam: ToolParameter = {
        name: propName,
        type: (propDef as any).type || 'string',
        required: isRequired
      };

      let propType = getZodType(propParam);

      if (!isRequired) {
        propType = propType.optional();
      }

      shape[propName] = propType;
    }

    return z.object(shape);
  }

  // Otherwise, use generic record
  return z.record(z.any());
}

/**
 * Validate input against Zod schema
 *
 * @param schema - Zod schema
 * @param input - Input to validate
 * @returns Validated input or throws error
 */
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  return schema.parse(input);
}
