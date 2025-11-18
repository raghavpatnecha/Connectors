import ora from 'ora';
import chalk from 'chalk';
import { table } from 'table';
import { Connectors } from '@connectors/sdk';
import { ConfigManager } from '../utils/config-manager';
import { MCPListOptions } from '../types';

/**
 * List all MCP servers
 */
export async function mcpListCommand(options: MCPListOptions) {
  const config = new ConfigManager();

  const cliConfig = config.getCLIConfig();
  if (!cliConfig) {
    console.log(chalk.yellow('⚠️  No configuration found. Please run "connectors init" first.\n'));
    return;
  }

  const spinner = ora('Fetching MCP servers...').start();

  try {
    const connectors = new Connectors({
      baseURL: cliConfig.baseURL,
      tenantId: cliConfig.tenantId,
      apiKey: cliConfig.apiKey
    });

    const integrations = await connectors.mcp.list();

    spinner.stop();

    let filtered = integrations;
    if (options.category) {
      filtered = integrations.filter(i => i.category === options.category);
    }

    if (filtered.length === 0) {
      console.log(chalk.yellow('\nNo MCP servers found.\n'));
      return;
    }

    console.log(chalk.bold.cyan(`\n📦 MCP Servers (${filtered.length})\n`));

    // Group by category
    const byCategory = filtered.reduce((acc, integration) => {
      const cat = integration.category || 'uncategorized';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(integration);
      return acc;
    }, {} as Record<string, typeof filtered>);

    // Display each category
    for (const [category, items] of Object.entries(byCategory)) {
      console.log(chalk.bold.yellow(`\n${category.toUpperCase()}`));

      const tableData = [
        [
          chalk.bold('Name'),
          chalk.bold('Tools'),
          chalk.bold('Type'),
          chalk.bold('Status')
        ],
        ...items.map(i => [
          i.name,
          i.toolCount?.toString() || '0',
          i.custom ? 'Custom' : 'Built-in',
          i.status || 'unknown'
        ])
      ];

      console.log(table(tableData, {
        border: {
          topBody: '─',
          topJoin: '┬',
          topLeft: '┌',
          topRight: '┐',
          bottomBody: '─',
          bottomJoin: '┴',
          bottomLeft: '└',
          bottomRight: '┘',
          bodyLeft: '│',
          bodyRight: '│',
          bodyJoin: '│',
          joinBody: '─',
          joinLeft: '├',
          joinRight: '┤',
          joinJoin: '┼'
        }
      }));
    }

    console.log(chalk.gray(`\nTotal: ${filtered.length} server(s)\n`));

  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch servers'));
    console.log(chalk.red(`Error: ${error.message}\n`));
    process.exit(1);
  }
}
