import process from 'process';

import { logger } from '../logger';
import { buildPackage } from '../utils/build-package';
import { listPackagesToBuild } from '../utils/list-packages';
import { runTsc } from '../utils/run-tsc';

export async function build(packageNames?: string[]) {
  logger.debug(`current working directory: ${process.cwd()}`);
  let packages = await listPackagesToBuild();

  if (packageNames && packageNames.length > 0) {
    const names = new Set(packageNames);
    packages = packages.filter((pkg) => names.has(pkg.packageJson.name));

    if (packages.length < names.size) {
      const usedName = new Set(names);

      for (const pkg of packages) {
        usedName.delete(pkg.packageJson.name);
      }

      logger.error(`No packages found for names: ${[...usedName].join(', ')}`);
    }
  }

  // await runTsc();

  for (const pkg of packages) {
    await buildPackage(pkg);
  }
}
