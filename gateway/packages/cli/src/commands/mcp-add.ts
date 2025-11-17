import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { Connectors } from '@connectors/sdk';
import { ConfigManager } from '../utils/config-manager';
import { MCPAddOptions } from '../types';

/**
 * Add a custom MCP server
 */
export async function mcpAddCommand(options: MCPAddOptions) {
  const config = new ConfigManager();

  // Get configuration or prompt to run init
  const cliConfig = config.getCLIConfig();
  if (!cliConfig) {
    console.log(chalk.yellow('⚠️  No configuration found. Please run "connectors init" first.\n'));
    return;
  }

  // Interactive prompts if options not provided
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Server name:',
      when: !options.name,
      validate: (input) => input.length > 0 || 'Name is required'
    },
    {
      type: 'list',
      name: 'sourceType',
      message: 'Source type:',
      choices: [
        { name: 'GitHub Repository', value: 'github' },
        { name: 'Standard I/O (stdio)', value: 'stdio' },
        { name: 'HTTP/HTTPS Endpoint', value: 'http' },
        { name: 'Docker Image', value: 'docker' }
      ],
      when: !options.source
    },
    {
      type: 'input',
      name: 'url',
      message: 'GitHub URL or HTTP endpoint:',
      when: (ans) => {
        const type = options.source || ans.sourceType;
        return (type === 'github' || type === 'http') && !options.url;
      },
      validate: (input) => input.length > 0 || 'URL is required'
    },
    {
      type: 'input',
      name: 'command',
      message: 'STDIO command (e.g., node server.js):',
      when: (ans) => (options.source || ans.sourceType) === 'stdio',
      validate: (input) => input.length > 0 || 'Command is required'
    },
    {
      type: 'input',
      name: 'dockerImage',
      message: 'Docker image (e.g., myorg/mcp-server:latest):',
      when: (ans) => (options.source || ans.sourceType) === 'docker',
      validate: (input) => input.length > 0 || 'Docker image is required'
    },
    {
      type: 'input',
      name: 'category',
      message: 'Category:',
      when: !options.category,
      default: 'custom',
      validate: (input) => input.length > 0 || 'Category is required'
    }
  ]);

  const name = options.name || answers.name;
  const sourceType = options.source || answers.sourceType;
  const category = options.category || answers.category;

  // Build source config
  let source: any;
  if (sourceType === 'github') {
    source = {
      type: 'github',
      url: options.url || answers.url
    };
  } else if (sourceType === 'stdio') {
    const commandParts = answers.command.split(' ');
    source = {
      type: 'stdio',
      command: commandParts[0],
      args: commandParts.slice(1)
    };
  } else if (sourceType === 'http') {
    source = {
      type: 'http',
      url: options.url || answers.url
    };
  } else if (sourceType === 'docker') {
    source = {
      type: 'docker',
      image: answers.dockerImage
    };
  }

  // Deploy
  const spinner = ora('Deploying MCP server...').start();

  try {
    const connectors = new Connectors({
      baseURL: cliConfig.baseURL,
      tenantId: cliConfig.tenantId,
      apiKey: cliConfig.apiKey
    });

    const deployment = await connectors.mcp.add({
      name,
      source,
      category
    });

    spinner.text = 'Waiting for deployment to complete...';

    // Wait for deployment with progress updates
    await deployment.waitUntilReady({
      timeout: 600000, // 10 minutes
      onProgress: (status) => {
        const phase = Object.entries(status.progress || {})
          .filter(([_, v]) => v === 'in_progress')
          .map(([k]) => k)[0];

        if (phase) {
          spinner.text = `Deploying: ${phase}...`;
        }
      }
    });

    spinner.succeed(chalk.green(`✅ MCP server "${name}" deployed successfully!`));

    console.log(chalk.cyan('\nDeployment Info:'));
    console.log(`  Name: ${chalk.bold(name)}`);
    console.log(`  ID: ${chalk.bold(deployment.deploymentId)}`);
    console.log(`  Category: ${chalk.bold(category)}`);
    console.log(`  Status: ${chalk.green(deployment.status)}`);
    console.log();

  } catch (error: any) {
    spinner.fail(chalk.red('Deployment failed'));
    console.log(chalk.red(`\nError: ${error.message}\n`));
    process.exit(1);
  }
}
