/**
 * @script
 *
 * This is a script that:
 *
 * - Takes the prelease postfix - `PRERELEASE_VALUE`
 * - Updates every package version in the repo to be the version `{MAJOR}.{MINOR}.{PATCH}-pr{PRERELEASE_VALUE}`.
 * - Publishes to npm with the tag `pr{PRERELEASE_VALUE}`
 */

import os from 'os';
import pLimit from 'p-limit';
import path from 'path';
import { parse } from 'semver';
import writeJSON from 'write-json-file';
import { invariant } from '@remirror/core-helpers';

import { baseDir, getAllDependencies } from './helpers';

/**
 * Read through the packages and update all the versions of internal
 * dependencies to be the new version
 */
export async function mutatePackageVersions(prerelease: string) {
  // The options for writing the json files
  const options = { detectIndent: true };

  // First change the versions for all public packages.
  const packages = await getAllDependencies();
  const limit = pLimit(os.cpus().length);
  const promises: Array<Promise<void>> = [];
  const versionedNames: Record<string, string> = {};

  for (const pkg of packages) {
    versionedNames[pkg.name] = getPreReleaseVersion(pkg.version, prerelease);
  }

  for (const pkg of packages) {
    const { location, ...json } = pkg;
    const jsonLocation = path.join(location, 'package.json');

    // Change the version of the json
    json.version = versionedNames[pkg.name];

    // Change the versions of internal dependencies.
    mutateDependencies(versionedNames, json.dependencies);

    // Change the versions of internal devDependencies.
    mutateDependencies(versionedNames, json.devDependencies);

    // Change the versions of internal peerDependencies.
    mutateDependencies(versionedNames, json.peerDependencies);

    // log.debug(location, json.version);
    promises.push(limit(() => writeJSON(jsonLocation, json, options)));
  }

  const rootLocation = baseDir('package.json');

  // Mutate the root package.json file
  const rootJson = require(baseDir('package.json'));
  mutateDependencies(versionedNames, rootJson.dependencies);
  mutateDependencies(versionedNames, rootJson.devDependencies);
  mutateDependencies(versionedNames, rootJson.peerDependencies);
  promises.push(limit(() => writeJSON(rootLocation, rootJson, options)));

  await Promise.all(promises);
}

/**
 * Update the pre-release version to use the PR version.
 */
function getPreReleaseVersion(version: string | undefined, prerelease: string) {
  const semver = parse(version);
  invariant(semver, { message: 'Invalid version provided' });

  return `0.0.0-${prerelease}`;
}

/**
 * Mutate dependencies so that every package uses the same dependencies.
 */
function mutateDependencies(
  versionedNames: Record<string, string>,
  dependencies: Record<string, string> | undefined,
) {
  if (!dependencies) {
    return;
  }

  for (const name of Object.keys(dependencies)) {
    const prVersion = versionedNames[name];

    if (prVersion) {
      dependencies[name] = prVersion;
    }
  }
}
