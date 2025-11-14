/**
 * Drive Tools Registry - Exports all 41 tools
 */

import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GoogleClientFactory } from '../clients/drive-client.js';
import { registerFileTools } from './files.js';
import { registerFolderTools } from './folders.js';
import { registerPermissionTools } from './permissions.js';
import { registerCommentTools } from './comments.js';
import { registerSharedDriveTools } from './shared-drives.js';

export function registerAllDriveTools(
  registry: ToolRegistry,
  clientFactory: GoogleClientFactory
): void {
  // Files (18 tools)
  registerFileTools(registry, clientFactory);

  // Folders (4 tools)
  registerFolderTools(registry, clientFactory);

  // Permissions (5 tools)
  registerPermissionTools(registry, clientFactory);

  // Comments (9 tools)
  registerCommentTools(registry, clientFactory);

  // Shared Drives (5 tools)
  registerSharedDriveTools(registry, clientFactory);

  console.log(`✅ Registered ${registry.getToolCount()} Drive tools`);
}

export * from './files.js';
export * from './folders.js';
export * from './permissions.js';
export * from './comments.js';
export * from './shared-drives.js';
