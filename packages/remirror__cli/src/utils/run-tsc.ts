import { logger } from '../logger';
import { getRoot } from './get-root';
import { runCommand } from './run-command';

export async function runTsc() {
  logger.info(`generating typescript declaration files...`);
  await runCommand('pnpm', ['-w', 'typecheck'], { cwd: getRoot() });
  logger.info(`generated typescript declaration files.`);
}
