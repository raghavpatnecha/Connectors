import ora from 'ora';
import chalk from 'chalk';
import { table } from 'table';
import { Connectors } from '@connectors/sdk';
import { ConfigManager } from '../utils/config-manager';
import { ToolsSearchOptions } from '../types';

/**
 * Search for tools semantically
 */
export async function toolsSearchCommand(query: string, options: ToolsSearchOptions) {
  const config = new ConfigManager();

  const cliConfig = config.getCLIConfig();
  if (!cliConfig) {
    console.log(chalk.yellow('⚠️  No configuration found. Please run "connectors init" first.\n'));
    return;
  }

  const spinner = ora('Searching for tools...').start();

  try {
    const connectors = new Connectors({
      baseURL: cliConfig.baseURL,
      tenantId: cliConfig.tenantId,
      apiKey: cliConfig.apiKey
    });

    const maxTools = parseInt(options.max);
    if (isNaN(maxTools) || maxTools <= 0) {
      spinner.fail(chalk.red('Invalid max value'));
      console.log(chalk.red('\nMax must be a positive number.\n'));
      process.exit(1);
    }

    const tools = await connectors.tools.select(query, {
      maxTools
    });

    spinner.succeed(chalk.green(`Found ${tools.length} tool(s)`));

    if (tools.length === 0) {
      console.log(chalk.yellow(`\nNo tools found for query: "${query}"\n`));
      return;
    }

    console.log(chalk.bold.cyan(`\n🔍 Search Results for: "${query}"\n`));

    const tableData = [
      [
        chalk.bold('Tool ID'),
        chalk.bold('Description'),
        chalk.bold('Category'),
        chalk.bold('Score')
      ],
      ...tools.map(t => [
        t.toolId,
        truncate(t.description, 50),
        t.category,
        t.score?.toFixed(3) || 'N/A'
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
      },
      columnDefault: {
        width: 'auto'
      },
      columns: [
        { width: 30 },
        { width: 52 },
        { width: 15 },
        { width: 8 }
      ]
    }));

    console.log(chalk.gray(`\nShowing ${tools.length} of ${maxTools} requested tools\n`));

  } catch (error: any) {
    spinner.fail(chalk.red('Search failed'));
    console.log(chalk.red(`\nError: ${error.message}\n`));
    process.exit(1);
  }
}

/**
 * Truncate string with ellipsis
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}
