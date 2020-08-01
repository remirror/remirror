const { join } = require('path');
const { getAllDependencies, formatFiles, baseDir, getRelativePathFromJson } = require('./helpers');
const writeJSON = require('write-json-file');

const paths = {
  sizeLimit: baseDir('support', 'root', '.size-limit.json'),
};

const filesToPrettify = [];

const generateSizeLimitConfig = async () => {
  const packages = await getAllDependencies();
  const sizes = packages
    .filter((pkg) => pkg.module && pkg.meta && pkg.meta.sizeLimit)
    .map((pkg) => ({
      name: pkg.name,
      path: join(
        getRelativePathFromJson(pkg),
        (pkg.browser && pkg.browser[`./${pkg.module}`]) || pkg.module,
      ),
      limit: pkg.meta.sizeLimit,
      ignore: Object.keys(pkg.peerDependencies || {}),
      running: false,
    }));

  await writeJSON(paths.sizeLimit, sizes);
  filesToPrettify.push(paths.sizeLimit);
};

const run = async () => {
  await Promise.all([generateSizeLimitConfig()]);

  await formatFiles(filesToPrettify.join(' '), true);
};

run();
