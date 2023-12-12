import process from 'process';
import { readPackageUp } from 'read-pkg-up';

import { logger } from '../logger';
import { buildPackage } from '../utils/build-package';
import { listPackagesToBuild } from '../utils/list-packages';

export async function build(options: { types?: boolean }) {
  logger.debug(`current working directory: ${process.cwd()}`);
  const packages = await listPackagesToBuild();

  const currentPackage = await readPackageUp();

  if (!currentPackage) {
    throw new Error(`No package.json found in ${process.cwd()}`);
  }

  if (currentPackage.packageJson.name === 'remirror-monorepo') {
    throw new Error('You need to run this command from within a package directory');
  }

  const pkg = packages.find((pkg) => pkg.packageJson.name === currentPackage.packageJson.name);

  if (!pkg) {
    throw new Error(`This command cannot build ${currentPackage.packageJson.name}`);
  }

  await buildPackage(pkg, { types: !!options.types });
}
