import ora, { Ora } from 'ora';
import chalk from 'chalk';

/**
 * Utility functions for spinners and progress indicators
 */

export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan'
  });
}

export function successSpinner(spinner: Ora, text: string): void {
  spinner.succeed(chalk.green(text));
}

export function failSpinner(spinner: Ora, text: string): void {
  spinner.fail(chalk.red(text));
}

export function warnSpinner(spinner: Ora, text: string): void {
  spinner.warn(chalk.yellow(text));
}

export function infoSpinner(spinner: Ora, text: string): void {
  spinner.info(chalk.blue(text));
}

/**
 * Run a task with spinner
 */
export async function withSpinner<T>(
  text: string,
  task: (spinner: Ora) => Promise<T>
): Promise<T> {
  const spinner = createSpinner(text).start();

  try {
    const result = await task(spinner);
    successSpinner(spinner, `${text} - Done`);
    return result;
  } catch (error) {
    failSpinner(spinner, `${text} - Failed`);
    throw error;
  }
}
