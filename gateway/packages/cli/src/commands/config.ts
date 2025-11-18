import chalk from 'chalk';
import { table } from 'table';
import { ConfigManager } from '../utils/config-manager';
import { selectPrompt } from '../utils/prompts';
import { initCommand } from './init';
import { ConfigOptions } from '../types';

/**
 * Manage Connectors configuration
 */
export async function configCommand(options: ConfigOptions) {
  const config = new ConfigManager();

  if (options.show) {
    await showConfig(config);
  } else if (options.edit) {
    await editConfig(config);
  } else {
    // Interactive menu
    const choice = await selectPrompt(
      'What would you like to do?',
      [
        { name: 'Show current configuration', value: 'show' },
        { name: 'Edit configuration', value: 'edit' },
        { name: 'Clear configuration', value: 'clear' }
      ]
    );

    if (choice === 'show') {
      await showConfig(config);
    } else if (choice === 'edit') {
      await editConfig(config);
    } else if (choice === 'clear') {
      await clearConfig(config);
    }
  }
}

/**
 * Show current configuration
 */
async function showConfig(config: ConfigManager) {
  const allConfig = config.getAll();

  if (Object.keys(allConfig).length === 0) {
    console.log(chalk.yellow('\n⚠️  No configuration found. Run "connectors init" to set up.\n'));
    return;
  }

  console.log(chalk.bold.cyan('\n⚙️  Current Configuration\n'));

  const tableData = [
    [chalk.bold('Key'), chalk.bold('Value')],
    ['Base URL', allConfig.baseURL || chalk.gray('(not set)')],
    ['Tenant ID', allConfig.tenantId || chalk.gray('(not set)')],
    ['API Key', allConfig.apiKey ? chalk.green('***configured***') : chalk.gray('(not set)')],
    ['Config Path', config.getConfigPath()]
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

/**
 * Edit configuration (re-run init)
 */
async function editConfig(config: ConfigManager) {
  console.log(chalk.cyan('\nRe-running initialization to update configuration...\n'));
  await initCommand();
}

/**
 * Clear configuration
 */
async function clearConfig(config: ConfigManager) {
  const inquirer = (await import('inquirer')).default;

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Are you sure you want to clear all configuration?',
      default: false
    }
  ]);

  if (confirmed) {
    config.clear();
    console.log(chalk.green('\n✅ Configuration cleared successfully!\n'));
  } else {
    console.log(chalk.yellow('\nOperation cancelled.\n'));
  }
}
