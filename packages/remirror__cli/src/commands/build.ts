import { logger } from '../logger';
import { buildPackage } from '../utils/build-package';
import { listPackagesToBuild } from '../utils/list-packages';
import { runTsc } from '../utils/run-tsc';

export async function build() {
  logger.debug(`current working directory: ${process.cwd()}`);
  const packages = await listPackagesToBuild();

  for (const pkg of packages) {
    await buildPackage(pkg);
  }

  await runTsc();
}
