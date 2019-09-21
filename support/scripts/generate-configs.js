const { join, sep } = require('path');
const {
  getAllDependencies,
  formatFiles,
  baseDir,
  getRelativePathFromJson,
  mangleScopedPackageName,
} = require('./helpers');
const writeJSON = require('write-json-file');

const configs = {
  sizeLimit: '.size-limit.json',
  rollup: 'support/rollup/config.json',
  tsconfig: 'support/tsconfig.paths.json',
  storybook: 'support/storybook/modules.json',
};

const filesToPrettify = [];

const generateSizeLimitConfig = async () => {
  const packages = await getAllDependencies();
  const sizeLimitArray = packages
    .filter(pkg => pkg.meta && pkg.meta.sizeLimit)
    .map(json => ({
      name: json.name,
      path: join(getRelativePathFromJson(json), json.module),
      limit: json.meta.sizeLimit,
      ignore: Object.keys(json.peerDependencies || {}),
      running: false,
    }));
  const path = baseDir(configs.sizeLimit);

  await writeJSON(path, sizeLimitArray);
  filesToPrettify.push(path);
};

const generateRollupConfig = async () => {
  const packages = await getAllDependencies();
  const rollupPackagesArray = packages
    .filter(pkg => !pkg.private && pkg.module)
    .map(json => {
      const path = getRelativePathFromJson(json);
      return {
        path: join('../..', path, 'package.json'),
        root: path.split(sep)[0],
      };
    });

  const path = baseDir(configs.rollup);

  await writeJSON(path, rollupPackagesArray);
  filesToPrettify.push(path);
};

const generateTSConfig = async () => {
  const packages = await getAllDependencies();
  const tsPaths = packages
    .filter(pkg => pkg.types)
    .reduce((acc, json) => {
      const path = getRelativePathFromJson(json);
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
  filesToPrettify.push(path);
};

const generateStorybookResolverConfig = async () => {
  const packages = await getAllDependencies();
  const resolverConfig = packages
    .filter(pkg => !pkg.private && pkg.module)
    .reduce((acc, json) => {
      const path = getRelativePathFromJson(json);
      const name = json.name.includes('@remirror') ? json.name : `${json.name}`;
      return {
        ...acc,
        [`${name}/lib`]: [`../../${path}/src`],
        [`${name}`]: [`../../${path}/src`],
      };
    }, {});

  const path = baseDir(configs.storybook);

  await writeJSON(path, resolverConfig);
  filesToPrettify.push(path);
};

const API_EXTRACTOR_FILENAME = 'api-extractor.json';
const API_EXTRACTOR_CONFIG = {
  $schema:
    'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json',
  extends: join('../../support', API_EXTRACTOR_FILENAME),
  mainEntryPointFilePath: '<projectFolder>/lib/index.d.ts',
};

const TSCONFIG_PROD_FILENAME = 'tsconfig.prod.json';
const TSCONFIG_PROD = {
  extends: './tsconfig.json',
  compilerOptions: { baseUrl: 'src', paths: {} },
  exclude: [
    '**/*.test.{ts,tsx}',
    '**/*.stories.{ts,tsx}',
    '**/*.spec.{ts,tsx}',
    '**/__mocks__/**',
    '**/__tests__/**',
    '**/__stories__/**',
  ],
};

const generateApiExtractorConfigs = async () => {
  const packages = await getAllDependencies();

  const paths = packages
    .filter(pkg => !pkg.private && pkg.types && !(pkg.meta && pkg.meta.skipApi))
    .map(json => ({
      path: getRelativePathFromJson(json),
      name: mangleScopedPackageName(json.name),
    }));

  const fn = async ({ path, name }) => {
    const apiExtractorConfig = {
      ...API_EXTRACTOR_CONFIG,
      apiReport: {
        enabled: true,
        reportFolder: '../../support/api/',
        reportFileName: `${name}.api.md`,
      },
    };
    const apiExtractorPath = baseDir(path, API_EXTRACTOR_FILENAME);
    const tsConfigProdPath = baseDir(path, TSCONFIG_PROD_FILENAME);

    await writeJSON(apiExtractorPath, apiExtractorConfig);
    await writeJSON(tsConfigProdPath, TSCONFIG_PROD);

    filesToPrettify.push(apiExtractorPath, tsConfigProdPath);
  };

  await Promise.all(paths.map(fn));
};



const run = async () => {
  await Promise.all([
    generateSizeLimitConfig(),
    generateRollupConfig(),
    generateTSConfig(),
    generateStorybookResolverConfig(),
    generateApiExtractorConfigs(),
  ]);

  await formatFiles(filesToPrettify.join(' '));
};

run();
