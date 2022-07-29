import { Package } from '@manypkg/get-packages';
import glob from 'fast-glob';
import path from 'node:path';
import sortKeys from 'sort-keys';

import { logger } from '../logger';
import { colors } from './colors';
import { fileExists } from './file-exists';
import { getRoot } from './get-root';
import { removeFileExt } from './remove-file-ext';
import { runCustomScript } from './run-custom-script';
import { runEsbuild } from './run-esbuild';
import { slugify } from './slugify';
import { writePackageJson } from './write-package-json';

/**
 * Bundle a package using esbuild and update `package.json` if necessary.
 */
export async function buildPackage(pkg: Package) {
  logger.info(`${colors.yellow(pkg.packageJson.name)} building...`);

  const entryPoints = await parseEntryPoints(pkg);

  await writeMainPackageJson(pkg, entryPoints);

  const promises: Array<Promise<unknown>> = [];

  const buildScript = (pkg.packageJson as any)?.scripts?.build;

  if (buildScript) {
    logger.info(`${colors.yellow(pkg.packageJson.name)} building with its custom build script...`);
    promises.push(runCustomScript(pkg, 'build'));
  } else {
    for (const entryPoint of entryPoints) {
      promises.push(runEsbuild(pkg, entryPoint));
    }
  }

  for (const entryPoint of entryPoints) {
    promises.push(writeSubpathPackageJson(pkg, entryPoint));
  }

  await Promise.all(promises);
  logger.info(`${colors.yellow(pkg.packageJson.name)} finished`);
}

interface EntryPoint {
  // This entry is a "main" entry point or a "subpath" entry point.
  isMain: boolean;

  // The absolute path to the entry file. Usually ends with `.ts` or `.tsx`.
  // e.g. /projects/remirror/packages/remirror__extension-foo/src/submodule/index.tsx
  inFile: string;

  // The absolute path to the output file. Usually ends with `.js`.
  // e.g. /projects/remirror/packages/remirror__extension-foo/submodule/dist/remirror-extension-foo.js
  outFile: string;

  // The relative path to the output file.
  // e.g. ".", "./subpath", "./subpath/subpath"
  subpath: string;

  // The format of the input file. Mostly `esm`.
  format: 'cjs' | 'esm';
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

    const cjs = /\.c[jt]sx?$/.test(inFile);

    entryPoints.push({ isMain, inFile, outFile, subpath, format: cjs ? 'cjs' : 'esm' });
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

  let exports: any = { ...packageJson.exports };

  for (const entryPoint of entryPoints) {
    const inFileRelativeToSrc = path.relative(path.join(pkg.dir, 'src'), entryPoint.inFile);
    const dtsFileRelativeToPkgDir = `./${path.join(
      'dist-types',
      `${removeFileExt(inFileRelativeToSrc)}.d.ts`,
    )}`;

    const outFileRelativeToPkgDir = `./${path.relative(pkg.dir, entryPoint.outFile)}`;

    exports[entryPoint.subpath] = {
      [entryPoint.format === 'cjs' ? 'require' : 'import']: outFileRelativeToPkgDir,
      types: dtsFileRelativeToPkgDir,
      default: outFileRelativeToPkgDir,
    };
  }

  exports = sortKeys(exports);
  exports['./package.json'] = './package.json';

  packageJson.type = 'module';
  const mainExport = exports['.'];

  if (mainExport) {
    packageJson.main = mainExport.default;
    packageJson.module = mainExport.default;
    packageJson.types = mainExport.types;
  }

  delete packageJson.browser;
  packageJson.exports = exports;

  // Update `files`
  const files: string[] = packageJson.files ?? [];

  for (const dir of ['dist', 'dist-types']) {
    if (!files.includes(dir)) {
      files.push(dir);
    }
  }

  files.sort();
  packageJson.files = files;

  // Update `homepage` and `repository`
  const root = getRoot();
  const relativeDir = path.relative(root, pkg.dir);
  packageJson.homepage = `https://github.com/remirror/remirror/tree/HEAD/${relativeDir}`;
  packageJson.repository = {
    type: 'git',
    url: 'https://github.com/remirror/remirror.git',
    directory: relativeDir,
  };

  await writePackageJson(pkg.dir, packageJson);
}

async function writeSubpathPackageJson(pkg: Package, entryPoint: EntryPoint) {
  if (entryPoint.isMain) {
    return;
  }

  const subpathDir = path.resolve(entryPoint.outFile, '..', '..');

  const inFileRelativeToSrc = path.relative(path.join(pkg.dir, 'src'), entryPoint.inFile);
  const dtsFile = `${path.join(
    pkg.dir,
    'dist-types',
    `${removeFileExt(inFileRelativeToSrc)}.d.ts`,
  )}`;
  const dtsFileRelativeToSubpath = `./${path.relative(subpathDir, dtsFile)}`;
  const outFileRelativeToSubpath = `./${path.relative(subpathDir, entryPoint.outFile)}`;

  const packageJson = {
    type: entryPoint.format === 'cjs' ? 'commonjs' : 'module',
    main: outFileRelativeToSubpath,
    module: outFileRelativeToSubpath,
    types: dtsFileRelativeToSubpath,
  };

  await writePackageJson(subpathDir, packageJson);
}
