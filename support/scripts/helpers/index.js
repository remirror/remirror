const { resolve, join, sep } = require('path');
const { getPackages } = require('@lerna/project');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

let packages: Promise<any>;

const getAllDependencies = () => {
  if (!packages) {
    packages = getPackages().then(pkgs =>
      pkgs.map(pkg => ({
        ...pkg.toJSON(),
        location: pkg.location,
        rootPath: pkg.rootPath,
      })),
    );
  }

  return packages;
};

const separator = '__';

const unmangleScopedPackage = mangledName => {
  return mangledName.includes(separator)
    ? `@${mangledName.replace(separator, '/')}`
    : mangledName;
};

const mangleScopedPackageName = packageName => {
  const [scope, name] = packageName.split('/');

  if (name) {
    return [scope.replace('@', ''), name].join(separator);
  }

  return scope;
};

const baseDir = (...paths) => resolve(__dirname, '../../..', join(...paths));
const getRelativePathFromJson = json =>
  json.location.replace(`${json.rootPath}${sep}`, '');

module.exports = {
  getAllDependencies,
  formatFiles,
  baseDir,
  getRelativePathFromJson,
  unmangleScopedPackage,
  mangleScopedPackageName,
  exec,
};
