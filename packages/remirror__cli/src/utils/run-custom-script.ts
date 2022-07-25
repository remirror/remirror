import { Package } from '@manypkg/get-packages';
import { spawnSync } from 'node:child_process';

import { logger } from '../logger';

export async function runCustomScript(pkg: Package, scriptName: string) {
  const command = `pnpm run ${scriptName}`;

  logger.debug(`running custom script "${command}" on ${pkg.dir}`);

  spawnSync(command, { stdio: 'inherit', shell: true, cwd: pkg.dir });
}
