const { join } = require('path');
const { getAllDependencies, formatFiles, baseDir, getRelativePathFromJson } = require('./helpers');
const writeJSON = require('write-json-file');

const configs = {
  sizeLimit: '.size-limit.json',
};

const filesToPrettify = [];

const generateSizeLimitConfig = async () => {
  const packages = await getAllDependencies();
  const sizes = packages
    .filter((pkg) => pkg.module && pkg.meta && pkg.meta.sizeLimit)
    .map((json) => ({
      name: json.name,
      path: join(getRelativePathFromJson(json), json.module),
      limit: json.meta.sizeLimit,
      ignore: Object.keys(json.peerDependencies || {}),
      running: false,
    }));
  const path = baseDir(configs.sizeLimit);

  await writeJSON(path, sizes);
  filesToPrettify.push(path);
};

const run = async () => {
  await Promise.all([generateSizeLimitConfig()]);

  await formatFiles(filesToPrettify.join(' '), true);
};

run();
