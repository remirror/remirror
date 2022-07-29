import type { ExecaReturnValue } from 'execa';

import { logger } from '../logger';
import { colors } from './colors';

export async function runCommand(command: string, args: string[], { cwd }: { cwd: string }) {
  const { execa } = await import('execa');

  const commandString = `${command} ${args.join(' ')}`;

  try {
    logger.debug(`running custom command "${commandString}" on ${cwd}`);
    await execa(command, args, { cwd });
  } catch (error_) {
    const error = error_ as ExecaReturnValue;
    logger.error(
      `Shell command "${colors.yellow(commandString)}" on directly ${colors.yellow(
        cwd,
      )} exits with code ${error.exitCode}. Error message is shown as below.\n${error.stderr}`,
    );

    throw new Error(`Failed to run command "${commandString}"`);
  }
}
