import { Package } from '@manypkg/get-packages';
import glob from 'fast-glob';
import path from 'node:path';
import sortKeys from 'sort-keys';

import { logger } from '../logger';
import { colors } from './colors';
import { ensureCjsFilename } from './ensure-cjs-filename';
import { EntryPoint } from './entry-point';
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
  logger.info(`${colors.blue(pkg.packageJson.name)} building...`);

  const entryPoints = await parseEntryPoints(pkg);

  await writeMainPackageJson(pkg, entryPoints);

  const promises: Array<Promise<unknown>> = [];

  const buildScript = (pkg.packageJson as any)?.scripts?.build;

  if (buildScript) {
    logger.info(`${colors.blue(pkg.packageJson.name)} building with its custom build script...`);
    promises.push(runCustomScript(pkg, 'build'));
  } else {
    for (const entryPoint of entryPoints) {
      const { format } = entryPoint;

      if (format === 'dual' || format === 'esm') {
        promises.push(runEsbuild(pkg, { ...entryPoint, format: 'esm' }));
      }

      if (format === 'dual' || format === 'cjs') {
        promises.push(runEsbuild(pkg, { ...entryPoint, format: 'cjs' }));
      }
    }
  }

  for (const entryPoint of entryPoints.filter((entryPoint) => !entryPoint.isMain)) {
    promises.push(writeSubpathPackageJson(pkg, entryPoint));
  }

  await Promise.all(promises);
  logger.info(`${colors.blue(pkg.packageJson.name)} done`);
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

    const isPureCjs = /\.c[jt]sx?$/.test(inFile);
    const isPureMjs = /\.m[jt]sx?$/.test(inFile);
    const isDual = !isPureMjs && !isPureCjs;
    const format = isDual ? 'dual' : isPureCjs ? 'cjs' : 'esm';

    entryPoints.push({ isMain, inFile, outFile, subpath, format });
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
  const packageJson = buildPackageJson(pkg.dir, pkg.dir, entryPoints, pkg.packageJson);

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
  logger.assert(!entryPoint.isMain);

  const subPathDir = path.resolve(pkg.dir, entryPoint.subpath);
  const packageJson = buildPackageJson(pkg.dir, subPathDir, [entryPoint]);
  await writePackageJson(subPathDir, packageJson);
}

function buildPackageJson(
  /**
   * The absolute path to the NPM package directory.
   */
  packageDir: string,
  /**
   * The absolute path to the directory that include the package.json file. This directory may be the same as the packageDir or it may be a subdirectory of the packageDir.
   */
  packageJsonDir: string,

  entryPoints: EntryPoint[],
  packageJson: any = {},
) {
  let exports: Record<string, any> = { ...packageJson.exports };

  for (const entryPoint of entryPoints) {
    exports = {
      ...exports,
      ...buildCondictionalExports(packageDir, packageJsonDir, entryPoint),
    };
  }

  exports = sortKeys(exports);
  exports['./package.json'] = './package.json';

  packageJson.type = entryPoints.every((entryPoint) => entryPoint.format === 'cjs')
    ? 'commonjs'
    : 'module';
  const mainExport = exports['.'];

  if (mainExport) {
    packageJson.main = mainExport.require || mainExport.import;

    if (mainExport.import) {
      packageJson.module = mainExport.import;
    }

    packageJson.types = mainExport.types;
  }

  delete packageJson.browser;
  packageJson.exports = exports;
  return packageJson;
}

function buildCondictionalExports(
  /**
   * The absolute path to the NPM package directory.
   */
  packageDir: string,
  /**
   * The absolute path to the directory that include the package.json file. This directory may be the same as the packageDir or it may be a subdirectory of the packageDir.
   */
  packageJsonDir: string,
  entryPoint: EntryPoint,
): Record<string, any> {
  const inFileRelativeToSrc = path.relative(path.join(packageDir, 'src'), entryPoint.inFile);
  const dtsFile = `${path.join(
    packageDir,
    'dist-types',
    `${removeFileExt(inFileRelativeToSrc)}.d.ts`,
  )}`;

  const dtsFileRelativePath = `./${path.relative(packageJsonDir, dtsFile)}`;
  const outEsmFileRelativePath = `./${path.relative(packageJsonDir, entryPoint.outFile)}`;
  const outCjsFileRelativePath = ensureCjsFilename(outEsmFileRelativePath);

  let subPathRelativePath = `./${path.relative(
    packageJsonDir,
    path.join(packageDir, entryPoint.subpath),
  )}`;

  if (subPathRelativePath === './') {
    subPathRelativePath = '.';
  }

  const supportCjs = entryPoint.format === 'dual' || entryPoint.format === 'cjs';
  const supportEsm = entryPoint.format === 'dual' || entryPoint.format === 'esm';
  logger.assert(supportCjs || supportEsm);

  return {
    [subPathRelativePath]: {
      ...(supportEsm
        ? {
            import: outEsmFileRelativePath,
          }
        : {}),
      ...(supportCjs
        ? {
            require: outCjsFileRelativePath,
          }
        : {}),
      types: dtsFileRelativePath,
    },
  };
}
