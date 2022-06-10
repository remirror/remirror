import { Package } from '@manypkg/get-packages';
import path from 'node:path';

import { logger } from '../logger';
import { runEsbuild } from '../utils/esbuild';
import { listPackages } from '../utils/list-packages';
import { slugify } from '../utils/slugify';
import { writePackageJson } from '../utils/write-package-json';

export async function build() {
  const cwd = process.cwd();
  logger.debug(`current working directory: ${cwd}`);

  const packages = await listPackages();

  for (const pkg of packages) {
    if (pkg.dir === cwd) {
      await buildPackage(pkg);
    }
  }
}

async function buildPackage(pkg: Package) {
  const packageName = pkg.packageJson.name;
  const slugifyedPackageName = slugify(packageName);

  // An array of all the files to be built. e.g. ['index.ts', 'extra.ts']
  const entryPoints: string[] = (pkg.packageJson as any)?.preconstruct?.entrypoints ?? ['index.ts'];

  entryPoints.sort();

  const subModules = entryPoints.map((entryPoint) => {
    const entryPointId = path.parse(entryPoint).name;

    const inFile = path.join(pkg.dir, 'src', entryPoint);

    const isIndex = entryPointId === 'index';

    if (isIndex) {
      const entryPointName = slugifyedPackageName;
      const distDir = path.join(pkg.dir, 'dist');
      return { isIndex, inFile, entryPointName, entryPointId, distDir };
    } else {
      logger.assert(slugify(entryPointId) === entryPointId);
      const entryPointName = `${slugifyedPackageName}-${entryPointId}`;
      const distDir = path.join(pkg.dir, entryPointId, 'dist');
      return { isIndex, inFile, entryPointName, entryPointId, distDir };
    }
  });

  const promises: Array<Promise<unknown>> = subModules.map(async (config) => {
    logger.debug(`start building ${config.inFile} => ${config.distDir}`);

    await runEsbuild({
      entryPoints: { [config.entryPointName]: config.inFile },
      outdir: config.distDir,
    });

    if (!config.isIndex) {
      await writePackageJson(path.resolve(config.distDir, '..'), {
        type: 'module',
        main: `./dist/${config.entryPointName}.js`,
        module: `./dist/${config.entryPointName}.js`,
      });
    }
  });

  const packageJson = pkg.packageJson as any;

  const exports: any = {
    './package.json': './package.json',
  };

  for (const { isIndex, entryPointName, entryPointId, distDir } of subModules) {
    const relativedJsPath = `./${path.join(
      path.relative(pkg.dir, distDir),
      `${entryPointName}.js`,
    )}`;
    exports[isIndex ? '.' : `./${entryPointId}`] = {
      import: relativedJsPath,
      default: relativedJsPath,
    };
  }

  // packageJson.exports = exports;
  packageJson.type = 'module';
  packageJson.main = exports['.']['import'];
  packageJson.module = exports['.']['import'];
  packageJson.exports = exports;

  logger.assert(packageJson.module);
  promises.push(writePackageJson(pkg.dir, packageJson));

  return Promise.all(promises);
}
