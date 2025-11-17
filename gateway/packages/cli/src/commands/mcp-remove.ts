import ora from 'ora';
import chalk from 'chalk';
import { Connectors } from '@connectors/sdk';
import { ConfigManager } from '../utils/config-manager';
import { confirmPrompt } from '../utils/prompts';

/**
 * Remove a custom MCP server
 */
export async function mcpRemoveCommand(name: string) {
  const config = new ConfigManager();

  const cliConfig = config.getCLIConfig();
  if (!cliConfig) {
    console.log(chalk.yellow('⚠️  No configuration found. Please run "connectors init" first.\n'));
    return;
  }

  // Confirm deletion
  const confirmed = await confirmPrompt(
    `Are you sure you want to remove MCP server "${name}"?`,
    false
  );

  if (!confirmed) {
    console.log(chalk.yellow('\nOperation cancelled.\n'));
    return;
  }

  const spinner = ora(`Removing MCP server "${name}"...`).start();

  try {
    const connectors = new Connectors({
      baseURL: cliConfig.baseURL,
      tenantId: cliConfig.tenantId,
      apiKey: cliConfig.apiKey
    });

    await connectors.mcp.remove(name);

    spinner.succeed(chalk.green(`✅ MCP server "${name}" removed successfully!`));
    console.log();

  } catch (error: any) {
    spinner.fail(chalk.red('Removal failed'));
    console.log(chalk.red(`\nError: ${error.message}\n`));
    process.exit(1);
  }
}
