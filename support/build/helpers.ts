import { getPackages, Packages } from '@manypkg/get-packages';
import fs, { outputFile } from 'fs-extra';
import { join, relative, resolve } from 'path';
import progressEstimator from 'progress-estimator';
import { PackageJson as BasePackageJson } from 'type-fest';

export { keys, uniqueArray } from '@remirror/core-helpers';

export const DEPENDENCY_TYPES = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

export interface PackageJson extends BasePackageJson {
  cjs?: string;
}

export interface WorkspacePackage extends PackageJson {
  /**
   * The name is required.
   */
  name: string;

  /**
   * The absolute path to the location of the workspace package.
   */
  location: string;
}

let packages: Packages | undefined;

export const baseDir = (...paths: string[]) => resolve(__dirname, '../..', join(...paths));

/**
 * Get all the dependencies for the remirror project.
 */
export const getAllDependencies = async (): Promise<WorkspacePackage[]> => {
  if (!packages) {
    packages = await getPackages(baseDir());
  }

  return packages?.packages.map((pkg) => ({ ...pkg.packageJson, location: pkg.dir })) ?? [];
};

export const getRelativePathFromJson = (json: WorkspacePackage) =>
  relative(baseDir(), json.location);

/**
 * Get all the packages that can be used as dependencies within the project.
 * These are identified by having a types field in the package.json.
 */
export const getDependencyPackageMap = async () => {
  const packages = await getAllDependencies();

  // Only the packages that have types can be dependencies with the remirror
  // workspace. This naturally excludes examples and the e2e packages.
  const tsPackages = packages.filter((pkg) => pkg.types);

  // Relative packages are here.
  const tsPackagesWithRelativePaths: Record<string, string> = {};

  for (const tsPackage of tsPackages) {
    tsPackagesWithRelativePaths[tsPackage.name] = getRelativePathFromJson(tsPackage);
  }

  return tsPackagesWithRelativePaths;
};

export interface WriteCjsEntryFileOptions {
  /**
   * The absolute path to the dist folder.
   */
  path: string;

  /**
   * The absolute path the production CommonJS file.
   */
  production: string;

  /**
   * The absolute path to the development CommonJS file.
   */
  development: string;

  /**
   * The relative path from the dist folder where this should file
   * should be written.
   *
   * @defaultValue 'index.js'
   */
  fileName?: string;
}

/**
 * Writes the common js entry file to the
 */
export const writeCjsEntryFile = async ({
  path,
  production,
  development,
  fileName = join('lib', 'dist', 'index.js'),
}: WriteCjsEntryFileOptions) => {
  const commonJsRequire = (fileName: string) =>
    `module.exports = require('./${relative(path, fileName)}');`;

  const contents = `'use strict'
if (process.env.NODE_ENV === 'production') {
  ${commonJsRequire(production)}
} else {
  ${commonJsRequire(development)}
}
`;

  return outputFile(join(path, fileName), contents);
};

const PROGRESS_ESTIMATOR_CACHE = baseDir('node_modules', '.cache', '.progress-estimator');

export const createProgressEstimator = async () => {
  await fs.ensureDir(PROGRESS_ESTIMATOR_CACHE);

  return progressEstimator({
    storagePath: PROGRESS_ESTIMATOR_CACHE,
  });
};
