import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { ConfigManager } from '../utils/config-manager';
import { Connectors } from '@connectors/sdk';

/**
 * Initialize Connectors CLI configuration
 */
export async function initCommand() {
  console.log(chalk.bold.cyan('\n🚀 Connectors Platform Setup\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'baseURL',
      message: 'Gateway URL:',
      default: 'http://localhost:3000',
      validate: (input) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      }
    },
    {
      type: 'input',
      name: 'tenantId',
      message: 'Tenant ID:',
      validate: (input) => input.length > 0 || 'Tenant ID is required'
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key (optional, press Enter to skip):'
    }
  ]);

  const config = new ConfigManager();
  config.set('baseURL', answers.baseURL);
  config.set('tenantId', answers.tenantId);
  if (answers.apiKey) {
    config.set('apiKey', answers.apiKey);
  }

  // Test connection
  const spinner = ora('Testing connection to gateway...').start();

  try {
    const connectors = new Connectors({
      baseURL: answers.baseURL,
      tenantId: answers.tenantId,
      apiKey: answers.apiKey || undefined
    });

    const isConnected = await connectors.testConnection();

    if (isConnected) {
      spinner.succeed(chalk.green('Connection successful!'));
      console.log(chalk.green('\n✅ Configuration saved!\n'));
      console.log(chalk.cyan(`Config file: ${config.getConfigPath()}\n`));
    } else {
      spinner.fail(chalk.red('Connection failed'));
      console.log(chalk.yellow('⚠️  Configuration saved, but gateway is not reachable.'));
      console.log(chalk.yellow(`Please verify the gateway is running at ${answers.baseURL}\n`));
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Connection error'));
    console.log(chalk.red(`Error: ${error.message}`));
    console.log(chalk.yellow('\n⚠️  Configuration saved, but connection test failed.\n'));
  }
}
