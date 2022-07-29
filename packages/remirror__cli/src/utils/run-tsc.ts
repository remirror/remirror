import { spawnSync } from 'node:child_process';

import { logger } from '../logger';
import { getRoot } from './get-root';

export function runTsc() {
  logger.info(`generating typescript declaration files...`);
  const command = 'pnpm -w typecheck';
  spawnSync(command, { stdio: 'inherit', shell: true, cwd: getRoot() });
  logger.info(`generated typescript declaration files.`);
}
