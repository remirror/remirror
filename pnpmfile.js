module.exports = {
  hooks: {
    readPackage,
  },
};

/**
 * A pnpm hook which is called when each package is being read. This can be used
 * to achieve behaviour similar to that of `resolutions` in yarn.
 *
 * @param {PackageJson} pkg - the `package.json` of the package being read.
 * @param {Context} context - the pnpm context which has a logging utility.
 */
function readPackage(pkg, context) {
  const updatePackage = createPackageUpdater(pkg, context);

  updatePackage({ name: 'serialize-javascript', version: '^4.0.0' });

  return pkg;
}

/**
 * Create a function that can update a package.json file based on the configured
 * actions.
 *
 * @param {PackageJson} pkg - the `package.json` of the package being read.
 * @param {Context} context - the pnpm context which has a logging utility.
 * @returns {DependencyUpdater} - a function that updates the dependencies for
 * the provided pkg.
 */
function createPackageUpdater(pkg, context) {
  const { log } = context;

  /**
   * @param {string} name - the name of the package being removed
   * @param {boolean} [includePeers] - Whether to also remove peer dependencies.
   */
  function removeDependency(name, includePeers) {
    if (pkg.dependencies && pkg.dependencies[name]) {
      log(`[${pkg.name}] Removing ${name} as a dependency.`);
      delete pkg.dependencies[name];
    }

    if (pkg.devDependencies && pkg.devDependencies[name]) {
      log(`[${pkg.name}] Removing ${name} as a dev dependency.`);
      delete pkg.devDependencies[name];
    }

    if (includePeers && pkg.peerDependencies && pkg.peerDependencies[name]) {
      log(`[${pkg.name}] Removing ${name} as a peer dependency.`);
      delete pkg.peerDependencies[name];
    }
  }

  /**
   * @param {string} name - the name of the package being removed
   * @param {string} version - the version being set
   * @param {boolean} [includePeers] - Whether to also remove peer dependencies.
   */
  function updateDependencyVersion(name, version, includePeers) {
    if (pkg.dependencies && pkg.dependencies[name] && pkg.dependencies[name] !== version) {
      log(
        `[${pkg.name}] Updating the version of ${name} from ${pkg.dependencies[name]} to ${version} in dependencies.`,
      );
      pkg.dependencies[name] = version;
    }

    if (pkg.devDependencies && pkg.devDependencies[name] && pkg.devDependencies[name] !== version) {
      log(
        `[${pkg.name}] Updating the version of ${name} from ${pkg.devDependencies[name]} to ${version} in devDependencies.`,
      );
      pkg.devDependencies[name] = version;
    }

    if (
      includePeers &&
      pkg.peerDependencies &&
      pkg.peerDependencies[name] &&
      pkg.peerDependencies[name] !== version
    ) {
      log(
        `[${pkg.name}] Updating the version of ${name} from ${pkg.peerDependencies[name]} to ${version} in peerDependencies.`,
      );
      pkg.peerDependencies[name] = version;
    }
  }

  return function ({ name, version, includePeers = false, remove }) {
    if (remove) {
      return removeDependency(name, includePeers);
    }

    if (version) {
      return updateDependencyVersion(name, version, includePeers);
    }
  };
}

/**
 * @typedef {import('type-fest').PackageJson} PackageJson
 */

/**
 * @typedef {(action: PackageUpdateAction) => void} DependencyUpdater
 */

/**
 * An object for configuring the action to take on the provided dependency name.
 * @typedef { Object } PackageUpdateAction
 * @property { string } name - The name of the dependency. E.g. `react`.
 * @property { string } [version] - The version to set the dependency to.
 * @property { boolean } [remove] - Whether you want to remove the dependency.
 * @property { boolean } [includePeers] - Whether to update the peer dependency.
 * versions as well.
 */

/**
 * @typedef { Object } Context
 * @property {() => void} log - a function to add a log to the console.
 */
