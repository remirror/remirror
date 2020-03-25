/* eslint-disable @typescript-eslint/no-var-requires */
import chalk from 'chalk';
import { join } from 'path';
import { RollupOptions } from 'rollup';
import { PackageJson } from 'type-fest';

import {
  baseDir,
  DEPENDENCY_TYPES,
  getAllDependencies,
  getDependencyPackageMap,
  getRelativePathFromJson,
  keys,
  uniqueArray,
  WorkspacePackage,
} from './helpers';
import factory from './rollup-factory';

// Specify the exact packages to be build with `PACKAGE` environment variable.
// `PACKAGES=jest-remirror,@remirror/core rollup -c`
const { PACKAGES, DEV_ONLY } = process.env;

// The names of the packages specifically requested to be built.
const requestedPackageNames = PACKAGES?.split(',') ?? [];

// Whether this build should ignore minification. Used when running `rollup
// --watch`
const devOnly = DEV_ONLY === 'true';

// The list of packages to ignore from the list. Basically packages which have
// types but are never published.
const IGNORED_PACKAGES = ['@remirror/test-fixtures'];

/**
 * Checks if the current package name should be ignored. These are excluded from
 * the buildable packages list.
 */
const isIgnoredPackage = (name: string) => IGNORED_PACKAGES.includes(name);

interface BuildablePackage {
  path: string;
  name: string;
}

/**
 * Get all packages within the remirror workspace that should be processed by
 * rollup.
 */
const getBuildablePackages = (allPackages: WorkspacePackage[]) => {
  // The packages that can be built with the paths and names.
  const buildablePackages: BuildablePackage[] = [];

  // Populate the buildable packages.
  for (const buildablePackage of allPackages) {
    // Ignore packages that should be ignored like examples, docs and invalid.
    if (buildablePackage.private || isIgnoredPackage(buildablePackage.name)) {
      continue;
    }

    // Add this package to the list of buildable packages.
    buildablePackages.push({
      path: getRelativePathFromJson(buildablePackage),
      name: buildablePackage.name,
    });
  }

  return buildablePackages;
};

/**
 * Documenting this now, and I'm not 100% sure why it does what it's doing.
 *
 * Something about getting names. For now it works and I'll circle back once I
 * figure it out.
 */
const getNamesCreator = (
  buildablePackages: BuildablePackage[],
  dependencies: Record<string, string>,
) => {
  const getNames = (name = ''): string[] => {
    const config = buildablePackages.find((conf) => conf.name === name);
    const arr = [name];

    if (!config) {
      return arr;
    }

    const path = baseDir(config.path);
    const pkg: PackageJson = require(join(path, 'package.json'));

    return DEPENDENCY_TYPES.reduce((acc, key) => {
      if (pkg[key]) {
        return [
          ...acc,
          ...keys(pkg[key] ?? {})
            .filter((dep) => dependencies[dep])
            .reduce((acc, key) => [...acc, ...getNames(key)], [] as string[]),
        ];
      }

      return acc;
    }, arr);
  };
  return getNames;
};

/**
 * Create the rollup configuration which is a promise that returns an array of
 * different build configurations that should be used.
 */
const createRollupConfig = async () => {
  const allPackages = await getAllDependencies();
  const dependencies = await getDependencyPackageMap();
  const buildablePackages = getBuildablePackages(allPackages);

  const entryPoints = requestedPackageNames.map((name) => {
    const config = buildablePackages.find((buildablePackage) => buildablePackage.name === name);

    if (!config) {
      throw new Error(
        chalk`{red You must specify a recognized package within the 'PACKAGES' environment variable}: {bold '${name}'} {red is invalid}`,
      );
    }

    return config;
  });

  const getNames = getNamesCreator(buildablePackages, dependencies);

  let filtered = buildablePackages;

  // Only filter when entry points have been specified.
  if (entryPoints?.length) {
    filtered = uniqueArray(
      entryPoints.reduce((acc, config) => [...acc, ...getNames(config.name)], [] as string[]),
    )
      .map((key) => buildablePackages.find((config) => config.name === key))
      .filter<BuildablePackage>(
        (buildablePackage): buildablePackage is BuildablePackage => buildablePackage !== undefined,
      )
      .reverse();
  }

  const configurations: RollupOptions[] = [];

  for (const config of filtered) {
    const path = baseDir(config.path);
    const packageJson = join(path, 'package.json');

    const configs = await factory({
      pkg: require(packageJson),
      root: path,
      devOnly,
    });

    for (const config of configs) {
      configurations.push(config);
    }
  }

  return configurations;
};

export default createRollupConfig();
