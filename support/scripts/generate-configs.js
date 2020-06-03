const { join } = require('path');
const { getAllDependencies, formatFiles, baseDir, getRelativePathFromJson } = require('./helpers');
const writeJSON = require('write-json-file');

const AUTO_GENERATED_FLAG = {
  __AUTO_GENERATED__: 'To update run: `pnpm run generate:json`',
};

const configs = {
  sizeLimit: '.size-limit.json',
  storybook: 'support/storybook/modules.json',
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

const generateStorybookResolverConfig = async () => {
  const packages = await getAllDependencies();
  const modules = packages
    .filter((pkg) => !pkg.private && pkg.module)
    // eslint-disable-next-line unicorn/no-reduce
    .reduce((acc, json) => {
      const packagePath = getRelativePathFromJson(json);
      const name = json.name.includes('@remirror') ? json.name : `${json.name}`;
      return {
        ...acc,
        [`${name}/lib`]: [`../../${packagePath}/src`],
        [`${name}`]: [`../../${packagePath}/src`],
      };
    }, {});
  const path = baseDir(configs.storybook);

  await writeJSON(path, { ...AUTO_GENERATED_FLAG, modules });
  filesToPrettify.push(path);
};

const run = async () => {
  await Promise.all([generateSizeLimitConfig(), generateStorybookResolverConfig()]);

  await formatFiles(filesToPrettify.join(' '), true);
};

run();
