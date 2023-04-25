import path from 'node:path';

import { logger } from '../logger';
import { buildPackage } from '../utils/build-package';
import { DebounceExecutor } from '../utils/debounce-executor';
import { getRoot } from '../utils/get-root';
import { listPackagesToBuild } from '../utils/list-packages';
import { runTsc } from '../utils/run-tsc';
import { build } from './build';

export async function watch(options: { skipBuild?: boolean }) {
  logger.debug(`current working directory: ${process.cwd()}`);
  logger.debug(`CLI options: ${JSON.stringify(options)}`);

  logger.info('Building all packages...');
  try {
    if (!options.skipBuild) {
      await build();
    }
  } catch (error) {
    logger.error('Failed to build all packages:', error);
  }

  logger.info('Watching all packages...');

  const packages = await listPackagesToBuild();

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
    ignored: ['**/{.git,node_modules,dist,dist-types}/**', /temp/, /tmp/, '**/package.json'],
    ignoreInitial: true,
    ignorePermissionErrors: true,
  });
  const executor = new DebounceExecutor(async (dir: string) => {
    await runTsc();
    await buildPackage(packageDirMap[dir], false);
  });

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
