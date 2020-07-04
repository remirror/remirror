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
 * @typedef {import('@manypkg/get-packages').Package['packageJson'] & { location: string }} Package
 */

/**
 * @type Promise<Package[]>
 */
let packages;

/**
 * Get all dependencies.
 *
 * @param {boolean} [excludeDeprecated=true] - when true exclude the
 * deprecated packages
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
 */
const getDependencyPackageMap = async (relative = false) => {
  const packages = await getAllDependencies();
  const tsPackages = packages.filter((pkg) => pkg.types);
  return tsPackages.reduce(
    (acc, json) => ({
      ...acc,
      [json.name]: relative ? getRelativePathFromJson(json) : json.location,
    }),
    {},
  );
};

module.exports = {
  getAllDependencies,
  getDependencyPackageMap,
  formatFiles,
  baseDir,
  getRelativePathFromJson,
  unmangleScopedPackage,
  mangleScopedPackageName,
  exec,
};
