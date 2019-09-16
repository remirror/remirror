const { join, resolve, sep } = require('path');
const { getPackages } = require('@lerna/project');
const writeJSON = require('write-json-file');
const { execSync } = require('child_process');

const configs = {
  sizeLimit: '.size-limit.json',
  rollup: 'support/rollup/config.json',
  tsconfig: 'support/tsconfig.paths.json',
  storybook: 'support/storybook/modules.json',
};

const baseDir = (...paths) => resolve(__dirname, '../..', join(...paths));
const formatFile = path => execSync(`prettier ${path} --write`, { stdio: 'inherit' });
const getPathFromRoot = json => json.location.replace(`${json.rootPath}${sep}`, '');

const getAllDependencies = async () => {
  const packages = await getPackages();
  return packages.map(pkg => ({
    ...pkg.toJSON(),
    location: pkg.location,
    rootPath: pkg.rootPath,
  }));
};

const generateSizeLimitConfig = async () => {
  const packages = await getAllDependencies();
  const sizeLimitArray = packages
    .filter(pkg => pkg.meta && pkg.meta.sizeLimit)
    .map(json => ({
      name: json.name,
      path: join(getPathFromRoot(json), json.module),
      limit: json.meta.sizeLimit,
      ignore: Object.keys(json.peerDependencies || {}),
    }));
  const path = baseDir(configs.sizeLimit);

  await writeJSON(path, sizeLimitArray);
  formatFile(path);
};

const generateRollupConfig = async () => {
  const packages = await getAllDependencies();
  const rollupPackagesArray = packages
    .filter(pkg => !pkg.private && pkg.module)
    .map(json => {
      const path = getPathFromRoot(json);
      return {
        path: join('../..', path, 'package.json'),
        root: path.split(sep)[0],
      };
    });

  const path = baseDir(configs.rollup);

  await writeJSON(path, rollupPackagesArray);
  formatFile(path);
};

const generateTSConfig = async () => {
  const packages = await getAllDependencies();
  const tsPaths = packages
    .filter(pkg => pkg.types)
    .reduce((acc, json) => {
      const path = getPathFromRoot(json);
      return {
        ...acc,
        [json.name]: [`${path}/src/index.ts`],
        [`${json.name}/lib/*`]: [`${path}/src/*`],
      };
    }, {});

  const path = baseDir(configs.tsconfig);

  await writeJSON(path, {
    compilerOptions: {
      baseUrl: '../',
      paths: { ...tsPaths, '@test-fixtures/*': ['support/fixtures/*'] },
    },
  });
  formatFile(path);
};

const generateStorybookResolverConfig = async () => {
  const packages = await getAllDependencies();
  const resolverConfig = packages
    .filter(pkg => !pkg.private && pkg.module)
    .reduce((acc, json) => {
      const path = getPathFromRoot(json);
      const name = json.name.includes('@remirror') ? json.name : `${json.name}`;
      return {
        ...acc,
        [`${name}/lib`]: [`../../${path}/src`],
        [`${name}`]: [`../../${path}/src`],
      };
    }, {});

  const path = baseDir(configs.storybook);

  await writeJSON(path, resolverConfig);
  formatFile(path);
};

const run = async () => {
  await generateSizeLimitConfig();
  await generateRollupConfig();
  await generateTSConfig();
  await generateStorybookResolverConfig();
};

run();
