import { getPackages, Packages } from '@manypkg/get-packages';
import { outputFile } from 'fs-extra';
import { join, relative, resolve } from 'path';
import { PackageJson as BasePackageJson } from 'type-fest';

export { keys, uniqueArray } from '../../@remirror/core-helpers/src';

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

export const baseDirectory = (...paths: string[]) => resolve(__dirname, '../..', join(...paths));

/**
 * Get all the dependencies for the remirror project.
 */
export const getAllDependencies = async (): Promise<WorkspacePackage[]> => {
  if (!packages) {
    packages = await getPackages(baseDirectory());
  }

  return (
    packages?.packages.map((package_) => ({ ...package_.packageJson, location: package_.dir })) ??
    []
  );
};

export const getRelativePathFromJson = (json: WorkspacePackage) =>
  relative(baseDirectory(), json.location);

/**
 * Get all the packages that can be used as dependencies within the project.
 * These are identified by having a types field in the package.json.
 */
export const getDependencyPackageMap = async () => {
  const packages = await getAllDependencies();

  // Only the packages that have types can be dependencies with the remirror
  // workspace. This naturally excludes examples and the e2e packages.
  const tsPackages = packages.filter((package_) => package_.types);

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

  /**
   * Whether this is a 'development' only build.
   *
   * @default false
   */
  devOnly?: boolean;
}

/**
 * Writes the common js entry file to the
 */
export const writeCjsEntryFile = async ({
  path,
  production,
  development,
  fileName = 'index.js',
  devOnly: developmentOnly = false,
}: WriteCjsEntryFileOptions) => {
  const commonJsRequire = (fileName: string) =>
    `module.exports = require('./${relative(path, fileName)}');`;

  const contents = developmentOnly
    ? commonJsRequire(development)
    : `'use strict'

if (process.env.NODE_ENV === 'production') {
  ${commonJsRequire(production)}
} else {
  ${commonJsRequire(development)}
}
`;

  return outputFile(join(path, fileName), contents);
};
