import process from 'process';

import { readPackageUp } from 'read-pkg-up';
import { logger } from '../logger';
import { buildPackage } from '../utils/build-package';
import { listPackagesToBuild } from '../utils/list-packages';

export async function build(packageNames?: string[]) {
  logger.debug(`current working directory: ${process.cwd()}`);
  let packages = await listPackagesToBuild();

  const currentPackage = await readPackageUp();
  if (
    !packageNames?.length &&
    currentPackage &&
    currentPackage.packageJson.name !== 'remirror-monorepo'
  ) {
    packageNames = [currentPackage.packageJson.name];
  }

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

  if (packages.length > 1) {
    logger.debug(`building ${packages.length} packages`);
  } else {
    logger.debug(`building ${packages[0].packageJson.name}`);
  }

  for (const pkg of packages) {
    await buildPackage(pkg);
  }
}
