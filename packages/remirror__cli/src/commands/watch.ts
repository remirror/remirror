import path from 'node:path';

import { logger } from '../logger';
import { buildPackage } from '../utils/build-package';
import { DebounceExecutor } from '../utils/debounce-executor';
import { getRoot } from '../utils/get-root';
import { listPackages } from '../utils/list-packages';

export async function watch() {
  logger.debug(`current working directory: ${process.cwd()}`);

  const packages = await listPackages({ isPrivate: false });

  logger.info('Building all packages...');
  try {
    await Promise.all(packages.map(buildPackage));
  } catch (error) {
    logger.error('Failed to build all packages:', error);
  }

  logger.info('Watching all packages...');

  const packageDirMap = Object.fromEntries(packages.map((pkg) => [path.normalize(pkg.dir), pkg]));

  const findAncestorPackage = (filePath: string): string | void => {
    for (let depth = 0; depth < 10; depth++) {
      const ancestor = path.normalize(path.resolve(filePath, '../'.repeat(depth)));

      const pkg = packageDirMap[ancestor];

      if (pkg) {
        return pkg.dir;
      }
    }
  };

  const chokidar = await import('chokidar');
  const watcher = chokidar.watch(getRoot(), {
    ignored: ['**/{.git,node_modules,dist,dist-types}/**'],
    ignoreInitial: true,
    ignorePermissionErrors: true,
  });
  const executor = new DebounceExecutor((dir: string) => buildPackage(packageDirMap[dir]));

  watcher.on('all', (event, filePath) => {
    logger.info(`Change detected: ${event} ${filePath}`);
    const pkgDir = findAncestorPackage(filePath);

    if (pkgDir) {
      logger.debug(`Going to rebuild package ${pkgDir}`);
      executor.push(pkgDir);
    } else {
      logger.debug("Nothing to do for this change, it's in a directory that we don't care about.");
    }
  });
}
