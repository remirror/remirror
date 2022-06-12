import { Package } from '@manypkg/get-packages';
import glob from 'fast-glob';
import path from 'node:path/posix';

import { logger } from '../logger';
import { fileExists } from '../utils/file-exists';
import { listPackages } from '../utils/list-packages';
import { removeFileExt } from '../utils/remove-file-ext';
import { runEsbuild } from '../utils/run-esbuild';
import { slugify } from '../utils/slugify';
import { writePackageJson } from '../utils/write-package-json';

export async function build() {
  const cwd = process.cwd();
  logger.debug(`current working directory: ${cwd}`);

  const packages = await listPackages({ isPrivate: false });

  return Promise.all(packages.map(buildPackage));
}

async function buildPackage(pkg: Package) {
  logger.info(`building ${pkg.packageJson.name}`);

  const entryPoints = await parseEntryPoints(pkg);

  await writeMainPackageJson(pkg, entryPoints);

  const promises: Array<Promise<unknown>> = [];

  // writeSubpathPackageJsons();

  for (const entryPoint of entryPoints) {
    promises.push(runEsbuild(pkg, entryPoint));
  }

  // runTsc();

  await Promise.all(promises);
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

async function writeMainPackageJson(pkg: Package, entryPoints: EntryPoint[]) {
  const packageJson = pkg.packageJson as any;

  const exports: any = {};

  for (const entryPoint of entryPoints) {
    const relativeSrcInFile = path.relative(path.join(pkg.dir, 'src'), entryPoint.inFile);
    const relativeDtsFile = `./${path.join(
      'dist-types',
      `${removeFileExt(relativeSrcInFile)}.d.ts`,
    )}`;

    const relativeOutFile = `./${path.relative(pkg.dir, entryPoint.outFile)}`;

    exports[entryPoint.subpath] = {
      import: relativeOutFile,
      types: relativeDtsFile,
      default: relativeOutFile,
    };
  }

  exports['./package.json'] = './package.json';

  packageJson.type = 'module';
  const main = exports['.']?.import;

  if (main) {
    packageJson.main = main;
    packageJson.module = main;
  }

  delete packageJson.browser;
  packageJson.exports = exports;

  writePackageJson(pkg.dir, packageJson);
}
