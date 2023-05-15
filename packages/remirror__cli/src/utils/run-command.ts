import type { ExecaReturnValue } from 'execa';

import { logger } from '../logger';
import { colors } from './colors';

export async function runCommand(command: string, args: string[], { cwd }: { cwd: string }) {
  const { execa } = await import('execa');

  const commandString = `${command} ${args.join(' ')}`;

  try {
    logger.debug(`running custom command "${commandString}" on ${cwd}`);
    await execa(command, args, { cwd, stdout: 'inherit', stderr: 'inherit' });
  } catch (error_) {
    const error = error_ as ExecaReturnValue;
    logger.error(
      `Shell command "${colors.yellow(commandString)}" on directly ${colors.yellow(
        cwd,
      )} exits with code ${colors.yellow(String(error.exitCode))}`,
    );

    const { stdout, stderr } = error;

    if (stdout) {
      logger.error(`stdout is shown below:\n${stdout}`);
    }

    if (stderr) {
      logger.error(`stderr is shown below:\n${stderr}`);
    }

    throw new Error(`Failed to run command "${commandString}"`);
  }
}
