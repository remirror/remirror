const { join, sep, relative } = require('path');
const {
  getAllDependencies,
  formatFiles,
  baseDir,
  getRelativePathFromJson,
  mangleScopedPackageName,
} = require('./helpers');
const writeJSON = require('write-json-file');

const AUTO_GENERATED_FLAG = {
  __AUTO_GENERATED__: 'To update run: `yarn generate:json`',
};

const EXCLUDE_PROD = [
  'lib',
  '**/*.test.{ts,tsx}',
  '**/*.stories.{ts,tsx}',
  '**/*.spec.{ts,tsx}',
  '**/__mocks__/**',
  '**/__tests__/**',
  '**/__stories__/**',
];

const configs = {
  sizeLimit: 'support/.size-limit.json',
  rollup: 'support/rollup/config.json',
  tsconfig: 'support/tsconfig.paths.json',
  storybook: 'support/storybook/modules.json',
};

const filesToPrettify = [];

const generateSizeLimitConfig = async () => {
  const packages = await getAllDependencies();
  const sizes = packages
    .filter(pkg => pkg.module && pkg.meta && pkg.meta.sizeLimit)
    .map(json => ({
      name: json.name,
      path: join(getRelativePathFromJson(json), json.module),
      limit: json.meta.sizeLimit,
      ignore: Object.keys(json.peerDependencies || {}),
      running: false,
    }));
  const path = baseDir(configs.sizeLimit);

  await writeJSON(path, { ...AUTO_GENERATED_FLAG, sizes });
  filesToPrettify.push(path);
};

const generateRollupConfig = async () => {
  const packages = await getAllDependencies();
  const rollup = packages
    .filter(pkg => !pkg.private && pkg.module)
    .map(json => {
      const packagePath = getRelativePathFromJson(json);
      return {
        path: join('../..', packagePath, 'package.json'),
        root: packagePath.split(sep)[0],
      };
    });
  const jsonPath = baseDir(configs.rollup);

  await writeJSON(jsonPath, { ...AUTO_GENERATED_FLAG, rollup });
  filesToPrettify.push(jsonPath);
};

const generateTSConfig = async () => {
  const packages = await getAllDependencies();
  const tsPaths = packages
    .filter(pkg => pkg.types)
    .reduce((acc, json) => {
      const packagePath = getRelativePathFromJson(json);
      return {
        ...acc,
        [json.name]: [`${packagePath}/src/index.ts`],
        [`${json.name}/lib/*`]: [`${packagePath}/src/*`],
      };
    }, {});
  const path = baseDir(configs.tsconfig);

  await writeJSON(path, {
    ...AUTO_GENERATED_FLAG,
    compilerOptions: {
      baseUrl: '../',
      paths: { ...tsPaths },
    },
  });
  filesToPrettify.push(path);
};

const generateStorybookResolverConfig = async () => {
  const packages = await getAllDependencies();
  const modules = packages
    .filter(pkg => !pkg.private && pkg.module)
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

const API_EXTRACTOR_FILENAME = 'api-extractor.json';
const API_EXTRACTOR_CONFIG = {
  ...AUTO_GENERATED_FLAG,
  // $schema:
  //   'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json',
  extends: join('../../support', API_EXTRACTOR_FILENAME),
  mainEntryPointFilePath: '<projectFolder>/lib/index.d.ts',
};

const TSCONFIG_PROD_FILENAME = 'tsconfig.prod.json';
const TSCONFIG_PROD = {
  ...AUTO_GENERATED_FLAG,
  extends: './tsconfig.json',
  compilerOptions: {
    baseUrl: 'src',
    paths: {},
    composite: true,
  },
  exclude: EXCLUDE_PROD,
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

    await writeJSON(apiExtractorPath, apiExtractorConfig);

    filesToPrettify.push(apiExtractorPath);
  };

  await Promise.all(paths.map(fn));
};

const TSCONFIG_FILENAME = 'tsconfig.json';
const MAIN_TSCONFIG_PATH = baseDir(TSCONFIG_FILENAME);
// const FIXTURES = '@remirror/test-fixtures';

const generateMainTsConfig = async () => {
  const packages = await getAllDependencies();

  const config = packages
    .filter(pkg => pkg.types)
    .map(json => ({
      path: join(getRelativePathFromJson(json), TSCONFIG_PROD_FILENAME),
    }))
    .reduce((acc, path) => ({ ...acc, references: [...acc.references, path] }), {
      ...AUTO_GENERATED_FLAG,
      files: [],
      references: [],
      exclude: EXCLUDE_PROD,
    });

  filesToPrettify.push(MAIN_TSCONFIG_PATH);
  await writeJSON(MAIN_TSCONFIG_PATH, config);
};

const generatePackageTsConfigs = async () => {
  const packages = await getAllDependencies();
  const tsPackages = packages.filter(pkg => pkg.types);
  const packagePathMapping = tsPackages.reduce(
    (acc, json) => ({ ...acc, [json.name]: json.location }),
    {},
  );

  const fn = async json => {
    const references = Object.keys(json.dependencies)
      .filter(dependency => !!packagePathMapping[dependency])
      .map(dependency => {
        const path = join(
          relative(json.location, packagePathMapping[dependency]),
          TSCONFIG_PROD_FILENAME,
        );
        return {
          path,
        };
      });

    const tsConfigProdPath = join(json.location, TSCONFIG_PROD_FILENAME);
    const options = json.types
      ? {
          emitDeclarationOnly: true,
          declaration: true,
          declarationMap: true,
          rootDir: 'src',
        }
      : { noEmit: true };
    await writeJSON(tsConfigProdPath, {
      ...TSCONFIG_PROD,
      compilerOptions: {
        ...TSCONFIG_PROD.compilerOptions,
        ...options,
      },
      references,
    });

    filesToPrettify.push(tsConfigProdPath);
  };

  await Promise.all(packages.map(fn));
};

const run = async () => {
  await Promise.all([
    generateSizeLimitConfig(),
    generateRollupConfig(),
    generateTSConfig(),
    generateStorybookResolverConfig(),
    generateApiExtractorConfigs(),
    generateMainTsConfig(),
    generatePackageTsConfigs(),
  ]);

  await formatFiles(filesToPrettify.join(' '), true);
};

run();
