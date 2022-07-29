import { Package } from '@manypkg/get-packages';

import { runCommand } from './run-command';

export async function runCustomScript(pkg: Package, scriptName: string) {
  return await runCommand('pnpm', ['run', scriptName], { cwd: pkg.dir });
}
