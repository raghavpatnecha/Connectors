#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { mcpAddCommand } from './commands/mcp-add';
import { mcpListCommand } from './commands/mcp-list';
import { mcpRemoveCommand } from './commands/mcp-remove';
import { mcpImportCommand } from './commands/mcp-import';
import { toolsSearchCommand } from './commands/tools-search';
import { configCommand } from './commands/config';

program
  .name('connectors')
  .description('Connectors Platform CLI - Manage MCP servers and tools')
  .version('0.1.0');

// Init command
program
  .command('init')
  .description('Initialize Connectors configuration')
  .action(initCommand);

// MCP commands
const mcp = program.command('mcp').description('Manage MCP servers');

mcp
  .command('add')
  .description('Add a custom MCP server')
  .option('-n, --name <name>', 'Server name')
  .option('-s, --source <type>', 'Source type (github, stdio, http, docker)')
  .option('-u, --url <url>', 'Source URL (for github/http)')
  .option('-c, --category <category>', 'Category')
  .action(mcpAddCommand);

mcp
  .command('list')
  .description('List all MCP servers')
  .option('-c, --category <category>', 'Filter by category')
  .action(mcpListCommand);

mcp
  .command('remove <name>')
  .description('Remove a custom MCP server')
  .action(mcpRemoveCommand);

mcp
  .command('import <file>')
  .description('Import MCP servers from config file')
  .action(mcpImportCommand);

// Tools command
program
  .command('tools search <query>')
  .description('Search for tools semantically')
  .option('-m, --max <number>', 'Maximum number of tools', '10')
  .action(toolsSearchCommand);

// Config command
program
  .command('config')
  .description('Manage Connectors configuration')
  .option('-s, --show', 'Show current configuration')
  .option('-e, --edit', 'Edit configuration')
  .action(configCommand);

program.parse();
