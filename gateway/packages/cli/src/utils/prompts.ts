import inquirer from 'inquirer';

/**
 * Common prompt utilities
 */

export async function confirmPrompt(message: string, defaultValue = false): Promise<boolean> {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue
    }
  ]);
  return confirmed;
}

export async function textPrompt(
  message: string,
  defaultValue?: string,
  validate?: (input: string) => boolean | string
): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message,
      default: defaultValue,
      validate
    }
  ]);
  return value;
}

export async function selectPrompt(
  message: string,
  choices: string[] | Array<{ name: string; value: string }>
): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
      message,
      choices
    }
  ]);
  return value;
}

export async function multiSelectPrompt(
  message: string,
  choices: string[] | Array<{ name: string; value: string; checked?: boolean }>
): Promise<string[]> {
  const { values } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'values',
      message,
      choices
    }
  ]);
  return values;
}

export async function passwordPrompt(message: string): Promise<string> {
  const { value } = await inquirer.prompt([
    {
      type: 'password',
      name: 'value',
      message
    }
  ]);
  return value;
}
