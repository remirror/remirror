import { Package } from '@manypkg/get-packages';
import glob from 'fast-glob';
import path from 'node:path';

import { logger } from '../logger';
import { runEsbuild } from '../utils/esbuild';
import { fileExists } from '../utils/file-exists';
import { listPackages } from '../utils/list-packages';
import { removeFileExt } from '../utils/remove-file-ext';
import { slugify } from '../utils/slugify';
import { writePackageJson } from '../utils/write-package-json';

export async function build() {
  const cwd = process.cwd();
  logger.debug(`current working directory: ${cwd}`);

  const packages = await listPackages({ isPrivate: false });

  for (const pkg of packages) {
    // if (pkg.dir === cwd) {
    await buildPackageV2(pkg);
    // }
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

async function buildPackageV2(pkg: Package) {
  logger.info(`building ${pkg.packageJson.name}`);

  const entryPoints = await parseEntryPoints(pkg);
  console.log(entryPoints);

  // writeSubpathPackageJsons();
  // writeMainPackageJson();
  // runEsbuild();
  // runTsc();
}

interface EntryPoint {
  // This entry is a "main" entry point or a "subpath" entry point.
  isMain: boolean;

  // The absolute path to the entry file.
  // e.g. /projects/remirror/packages/remirror__extension-foo/src/submodule/index.tsx
  inFile: string;

  // The absolute path to the output file.
  // e.g. /projects/remirror/packages/remirror__extension-foo/submodule/dist/remirror-extension-foo.js
  outFile: string;

  // The relative path to the output file.
  // e.g. ".", "./subpath", "./subpath/subpath"
  subpath: string;
}

/**
 * Parse a package.json file and return all entry points in this packages.
 */
async function parseEntryPoints(pkg: Package): Promise<EntryPoint[]> {
  const entryPointFiles = await findEntryPoints(pkg);

  logger.assert(
    entryPointFiles.length > 0,
    `failed to find any entry point for package ${pkg.packageJson.name} at ${pkg.dir}`,
  );

  for (const entryPointFile of entryPointFiles) {
    await validEntryPoint(pkg, entryPointFile);
  }

  const entryPoints: EntryPoint[] = [];

  for (const file of entryPointFiles) {
    const inFile = path.join(pkg.dir, 'src', file);

    let subpath = `./${removeFileExt(file)}`;

    if (subpath.endsWith('/index')) {
      subpath = subpath.slice(0, -6);
    }

    const isMain = subpath === '.';

    const entryPointName = slugify(`${pkg.packageJson.name}-${isMain ? '' : subpath}`);

    const outFile = path.resolve(pkg.dir, subpath, 'dist', `${entryPointName}.js`);

    entryPoints.push({ isMain, inFile, outFile, subpath });
  }

  return entryPoints;
}

/**
 * Returns an array of all entry points in the given package.
 * A entry point is a relative path to the `src/` directory.
 */
async function findEntryPoints(pkg: Package): Promise<string[]> {
  const entryPoints: string[] = (pkg.packageJson as any)?.preconstruct?.entrypoints;

  if (entryPoints) {
    return entryPoints;
  }

  return await glob(['index.ts', 'index.tsx', 'index.mjs', 'index.cjs', 'index.js'], {
    cwd: path.join(pkg.dir, 'src'),
  });
}

async function validEntryPoint(pkg: Package, entryPoint: string) {
  const absFilePath = path.resolve(pkg.dir, 'src', entryPoint);
  logger.assert(
    await fileExists(absFilePath),
    "entry point file doesn't exist: ${absFilePath}. Please check your package.json",
  );
}
