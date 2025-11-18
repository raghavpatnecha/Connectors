import fs from 'fs/promises';
import ora from 'ora';
import chalk from 'chalk';
import { Connectors } from '@connectors/sdk';
import { ConfigManager } from '../utils/config-manager';

/**
 * Import MCP servers from configuration file
 */
export async function mcpImportCommand(file: string) {
  const config = new ConfigManager();

  const cliConfig = config.getCLIConfig();
  if (!cliConfig) {
    console.log(chalk.yellow('⚠️  No configuration found. Please run "connectors init" first.\n'));
    return;
  }

  const spinner = ora('Reading configuration file...').start();

  try {
    // Read and parse file
    const content = await fs.readFile(file, 'utf-8');
    let mcpConfig: any;

    try {
      mcpConfig = JSON.parse(content);
    } catch (parseError) {
      spinner.fail(chalk.red('Invalid JSON file'));
      console.log(chalk.red(`\nError parsing JSON: ${parseError.message}\n`));
      process.exit(1);
    }

    // Check for mcpServers key
    if (!mcpConfig.mcpServers || typeof mcpConfig.mcpServers !== 'object') {
      spinner.fail(chalk.red('Invalid MCP configuration'));
      console.log(chalk.red('\nConfiguration file must contain "mcpServers" object.\n'));
      process.exit(1);
    }

    const connectors = new Connectors({
      baseURL: cliConfig.baseURL,
      tenantId: cliConfig.tenantId,
      apiKey: cliConfig.apiKey
    });

    // Convert standard MCP config to Connectors format
    const servers = Object.entries(mcpConfig.mcpServers || {});

    spinner.text = `Importing ${servers.length} server(s)...`;

    const results = {
      success: [] as string[],
      failed: [] as { name: string; error: string }[]
    };

    for (const [name, serverConfig] of servers) {
      try {
        spinner.text = `Importing "${name}"...`;

        const deployment = await connectors.mcp.addFromConfig({
          mcpServers: { [name]: serverConfig }
        });

        // Wait for deployment
        await deployment.waitUntilReady({
          timeout: 300000, // 5 minutes per server
          onProgress: (status) => {
            const phase = Object.entries(status.progress || {})
              .filter(([_, v]) => v === 'in_progress')
              .map(([k]) => k)[0];

            if (phase) {
              spinner.text = `Importing "${name}": ${phase}...`;
            }
          }
        });

        results.success.push(name);

      } catch (error: any) {
        results.failed.push({ name, error: error.message });
      }
    }

    spinner.stop();

    // Display results
    console.log(chalk.bold.cyan('\n📦 Import Results\n'));

    if (results.success.length > 0) {
      console.log(chalk.green(`✅ Successfully imported (${results.success.length}):`));
      for (const name of results.success) {
        console.log(chalk.green(`   • ${name}`));
      }
      console.log();
    }

    if (results.failed.length > 0) {
      console.log(chalk.red(`❌ Failed to import (${results.failed.length}):`));
      for (const { name, error } of results.failed) {
        console.log(chalk.red(`   • ${name}: ${error}`));
      }
      console.log();
    }

    console.log(chalk.cyan(`Total: ${results.success.length}/${servers.length} imported successfully\n`));

    if (results.failed.length > 0) {
      process.exit(1);
    }

  } catch (error: any) {
    spinner.fail(chalk.red('Import failed'));
    console.log(chalk.red(`\nError: ${error.message}\n`));
    process.exit(1);
  }
}
