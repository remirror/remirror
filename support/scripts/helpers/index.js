const { resolve, join, relative } = require('path');
const { getPackages } = require('@manypkg/get-packages');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const separator = '__';

const unmangleScopedPackage = (mangledName) => {
  return mangledName.includes(separator) ? `@${mangledName.replace(separator, '/')}` : mangledName;
};

const mangleScopedPackageName = (packageName) => {
  const [scope, name] = packageName.split('/');

  if (name) {
    return [scope.replace('@', ''), name].join(separator);
  }

  return scope;
};

const baseDir = (...paths) => resolve(__dirname, '../../..', join(...paths));
const getRelativePathFromJson = (json) => relative(baseDir(), json.location);

const formatFiles = async (path = '', silent = false) => {
  const { stderr, stdout } = await exec(`prettier ${path} --write`);

  if (silent) {
    return;
  }

  if (stderr) {
    console.error(stderr.trim());
  }

  if (stdout) {
    console.log(stdout.trim());
  }
};

/**
 * @typedef {import('@manypkg/get-packages').Package['packageJson'] & {
 * location: string }} Package
 */

/**
 * @type Promise<Package[]>
 */
let packages;

/**
 * Get all dependencies.
 *
 * @param {boolean} [excludeDeprecated=true] - when true exclude the deprecated
 * packages
 * @returns {Promise<Package[]>}
 */
const getAllDependencies = (excludeDeprecated = true) => {
  if (!packages) {
    packages = getPackages().then(({ packages }) => {
      if (!packages) {
        return [];
      }

      return packages
        .filter((pkg) => (excludeDeprecated ? !pkg.dir.includes('deprecated') : true))
        .map((pkg) => ({
          ...pkg.packageJson,
          location: pkg.dir,
        }));
    });
  }

  return packages;
};

/**
 * Get all the packages that can be used as dependencies within the project.
 * These are identified by having a types field in the package.json.
 *
 * @param {boolean} [relative] - when set to true this will return the paths as
 * relative to the root directory. Defaults to `false`.
 */
const getTypedPackagesWithPath = async (relative = false) => {
  // Load all the packages within this repository.
  const packages = await getAllDependencies();

  // Get the packages which have a `types` field.
  const tsPackages = packages.filter((pkg) => pkg.types);

  /**
   * The typed packages to be returned.
   *
   * @type {Record<string, string>}
   */
  const typedPackages = {};

  // Loop through the typed packages and store the name as a key and path
  // (either relative or absolute) as the value.
  for (const pkg of tsPackages) {
    typedPackages[pkg.name] = relative ? getRelativePathFromJson(pkg) : pkg.location;
  }

  return typedPackages;
};

module.exports = {
  getAllDependencies,
  getTypedPackagesWithPath,
  formatFiles,
  baseDir,
  getRelativePathFromJson,
  unmangleScopedPackage,
  mangleScopedPackageName,
  exec,
};
