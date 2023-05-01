/**
 * @script
 *
 * Generate configuration files for `sizeLimit` and package `tsconfig`'s.
 */

import chalk from 'chalk';
import fs, { readdir } from 'fs-extra';
import os from 'os';
import pLimit from 'p-limit';
import path from 'path';
import writeJSON from 'write-json-file';
import { assertGet, deepMerge, invariant, isEmptyObject, isString } from '@remirror/core-helpers';
import type { TsConfigJson } from '@remirror/types';

import {
  baseDir,
  cliArgs,
  formatFiles,
  getAllDependencies,
  getRelativePathFromJson,
  getTypedPackagesWithPath,
  log,
  Package,
  TsConfigMeta,
} from './helpers';

// Store the name used for all tsconfig files.
const tsconfigFileName = 'tsconfig.json';

// A collection of the absolute paths where files will be written to.
const PATH = {
  sizeLimit: baseDir('.size-limit.json'),
  mainTsconfig: baseDir(tsconfigFileName),
  baseTsconfig: baseDir('support', 'tsconfig.base.json'),
  rootTsconfig: baseDir(tsconfigFileName),
  packagesTsconfig: baseDir('packages', tsconfigFileName),
};

// A list of all the generated files which will be prettified at the end of the
// process.
const filesToPrettify: string[] = [];

/**
 * Make sure that "main", "module" and "types" fields within the packages are
 * prefixed with `./`.
 */
async function generateEntryPoint() {
  const fields = ['main', 'module', 'types'] as const;

  log.info(chalk`\n{blue Running script for package.json {bold.grey ${fields}} fields}`);

  // Get all the packages in the `pnpm` monorepo.
  const packages = await getAllDependencies({ excludeSupport: true });

  const promises: Array<Promise<void>> = [];

  for (const pkg of packages) {
    const { location, ...packageJson } = pkg;
    const packageJsonPath = path.join(location, 'package.json');
    let edited = false;

    for (const field of fields) {
      const originValue = packageJson[field];

      if (!originValue) {
        continue;
      }

      const fixedValue = prefixRelativePath(originValue);

      if (originValue !== fixedValue) {
        packageJson[field] = fixedValue;
        edited = true;
      }
    }

    if (edited) {
      promises.push(writeJSON(packageJsonPath, packageJson));
      filesToPrettify.push(packageJsonPath);
    }
  }

  await Promise.all(promises);
}

/**
 * Add a `./` prefix to a path that needs to be seen as relative.
 */
function prefixRelativePath<Type extends string | undefined>(path: Type): Type {
  if (path === undefined || path === '') {
    return path;
  }

  return path.startsWith('.') ? path : (`./${path}` as Type);
}

/**
 * Get the relative path for the browser module if it exists, otherwise fallback
 * to the module or main path.
 */
function getBrowserPath(pkg: Package) {
  const browserPath = isString(pkg.browser)
    ? pkg.browser
    : pkg.browser?.[prefixRelativePath(pkg.module ?? '')];

  return isString(browserPath) ? browserPath : pkg.module;
}

interface SizeLimitConfig {
  /**
   * Relative paths to files. The only mandatory option. It could be a path
   * "index.js", a pattern "dist/app-*.js" or an array ["index.js",
   * "dist/app-*.js", "!dist/app-exclude.js"].
   */
  path: string | string[];

  /**
   * Partial import to test tree-shaking. It could be "{ lib }" to test import {
   * lib } from 'lib' or { "a.js": "{ a }", "b.js": "{ b }" } to test multiple
   * files.
   */
  import?: string | Record<string, string>;

  /**
   * Size or time limit for files from the path option. It should be a string with
   * a number and unit, separated by a space. Format: 100 B, 10 KB, 500 ms, 1 s.
   */
  limit: string;

  /**
   * The name of the current section. It will only be useful if you have multiple
   * sections.
   */
  name?: string;

  /**
   * When using a custom webpack config, a webpack entry could be given. It could
   * be a string or an array of strings. By default, the total size of all entry
   * points will be checked.
   */
  entry?: string | string[];

  /**
   * With false it will disable webpack.
   */
  webpack?: boolean;

  /**
   * With false it will disable calculating running time.
   *
   * @defaultValue false
   */
  running?: boolean;

  /**
   * With false it will disable gzip compression.
   */
  gzip?: boolean;

  /**
   * With true it will use brotli compression and disable gzip compression.
   */
  brotli?: boolean;

  /**
   * A path to a custom webpack config.
   */
  config?: string;

  /**
   * An array of files and dependencies to exclude from the project size
   * calculation.
   */
  ignore?: string[];
}

/**
 * This generates the `.size-limit.json` file.
 */
async function generateSizeLimitConfig() {
  log.info(chalk`\n{blue Generating {bold.grey size-limit.json} config file}`);

  // Get all the packages in the `pnpm` monorepo.
  const packages = await getAllDependencies();

  // Container for the size limit config object. This will be written to the
  // size limit json file.
  const sizes: SizeLimitConfig[] = [];

  for (const pkg of packages) {
    const limit = pkg['@remirror']?.sizeLimit;

    // Ignore when there is no limit set for the package.
    if (!limit) {
      continue;
    }

    // The path from the current package to the entry point.
    const pathToEntryFile = getBrowserPath(pkg);

    if (!pathToEntryFile) {
      continue;
    }

    // The path from the root directory to the current package.
    const pathToPackage = getRelativePathFromJson(pkg);

    // A list of files to ignore in the size calculations.
    const ignore = [
      // Ignore all peer dependencies.
      ...Object.keys(pkg.peerDependencies ?? {}),

      // Ignore all internal dependencies.
      ...Object.keys(pkg.dependencies ?? {}).filter((name) => name.startsWith('@remirror/')),
    ];

    // Add the configuration object to the list of sizes to check.
    sizes.push({
      name: pkg.name,
      limit,
      path: path.join(pathToPackage, pathToEntryFile),
      ignore,
      running: false,
      gzip: true,
    });
  }

  await writeJSON(PATH.sizeLimit, sizes);
  filesToPrettify.push(PATH.sizeLimit);
}

const DEFAULT_TSCONFIG_META: Required<TsConfigMeta> = {
  src: {
    // Flag to show that this file is autogenerated and should not be edited.
    compilerOptions: {
      types: [],
      declaration: true,
      composite: true,
      noEmit: false,
      emitDeclarationOnly: true,
      outDir: '../dist-types',
    },
    include: ['./'],
  },
  __e2e__: {
    // Flag to show that this file is autogenerated and should not be edited.
    compilerOptions: {
      types: [
        'expect-playwright/global',
        'jest-playwright-preset',
        'jest',
        'jest-extended',
        'snapshot-diff',
        'playwright',
        'node',
      ],
      skipLibCheck: true,
      importsNotUsedAsValues: 'remove',
      outDir: './dist-types',
    },
    include: ['./'],
  },
  __tests__: {
    compilerOptions: {
      types: [
        'jest',
        'jest-extended',
        'jest-axe',
        '@testing-library/jest-dom',
        'snapshot-diff',
        'node',
      ],
      skipLibCheck: true,
      importsNotUsedAsValues: 'remove',
      outDir: './dist-types',
    },
    include: ['./'],
  },
  __dts__: {
    compilerOptions: {
      skipLibCheck: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      allowUnreachableCode: true,
      noImplicitReturns: false,
      importsNotUsedAsValues: 'remove',
      outDir: './dist-types',
    },
    include: ['./'],
  },
};

interface TsConfigFile {
  filepath: string;
  json: TsConfigJson;
  shouldReference: boolean;
}

// Get the folder for `.pnpm`.
const pnpmFolder = baseDir('node_modules', '.pnpm');

// Store the scoped folders within the main `pnpmFolder`.
const pnpmScopedFolders: Record<string, string[]> = {};

/**
 * A function which retrieves the .d.ts file for a given package name.
 *
 * We can't use `require.resolve` since pnpm doesn't hoist all packages.
 * Instead we're going to look at the special `.pnpm` folder inside the root
 * `node_modules`.
 */
async function getPackageDefinitionFilePath(name: string, subFolder = ''): Promise<string> {
  const searchFolders = (pnpmScopedFolders['.'] ??= await fs.readdir(pnpmFolder));
  let folderName = name;
  const base = pnpmFolder;

  if (name.startsWith('@')) {
    const split = name.split('/');
    folderName = `${assertGet(split, 0)}+${assertGet(split, 1)}`;
  }

  const directory = searchFolders.find((name) => name.startsWith(`${folderName}@`));

  invariant(directory, { message: `No directory found for ${name}` });

  return path.join(
    base,
    directory,
    'node_modules',
    name,
    subFolder.endsWith('.d.ts') ? subFolder : path.join(subFolder, 'index.d.ts'),
  );
}

/**
 * Add flag to indicate that this file is auto generated.
 */
function createAutoGeneratedFlag(folderName: string): object {
  return {
    __AUTO_GENERATED__: [
      `To update the configuration edit the following field.`,
      `\`package.json > @remirror > tsconfigs > '${folderName}'\``,
      '',
      `Then run: \`pnpm -w generate:ts\``,
    ],
  };
}

function makeRelative(filepath: string) {
  return filepath.startsWith('.') ? filepath : `./${filepath}`;
}

/**
 * Resolve the metadata from the tsconfig file.
 */
async function resolveTsConfigMeta(
  pkg: Package,
  dependencies: Record<string, string>,
  types: Set<string>,
): Promise<TsConfigFile[]> {
  const configFiles: TsConfigFile[] = [];
  const meta = pkg['@remirror']?.tsconfigs;

  if (meta === false) {
    return configFiles;
  }

  const foldersInDirectory = await readdir(pkg.location);
  const mergedMeta: Required<TsConfigMeta> = deepMerge(DEFAULT_TSCONFIG_META, meta ?? {});
  const { './': main, src, ...rest } = mergedMeta;
  const references: TsConfigJson.References[] = [];

  if (src !== false) {
    const filepath = path.join(pkg.location, 'src', tsconfigFileName);

    // Collect all the references need for the current package.
    for (const dependency of Object.keys({
      ...pkg.dependencies,
      // ...pkg.devDependencies,
      ...pkg.peerDependencies,
      ...pkg.optionalDependencies,
    })) {
      const dependencyPath = dependencies[dependency];

      // Check if the dependency is one of the internal workspace dependencies.
      // We only want to add the internal project dependencies to the
      // references.
      if (!dependencyPath) {
        continue;
      }

      references.push({
        // Add the dependency which is a path relative to the current package
        // being checked.
        path: path.join(path.relative(path.dirname(filepath), path.join(dependencyPath, 'src'))),
      });
    }

    for (const type of src?.compilerOptions?.types ?? []) {
      types.add(type);
    }

    configFiles.push({
      shouldReference: true,
      filepath,
      json: {
        ...createAutoGeneratedFlag('src'),
        extends: path.relative(path.dirname(filepath), PATH.baseTsconfig),
        ...src,
        references:
          pkg.name === '@remirror/support'
            ? [{ path: path.relative(path.dirname(filepath), dependencies['remirror'] ?? '') }]
            : references,
      },
    });
  }

  if (main) {
    const filepath = path.join(pkg.location, tsconfigFileName);
    const { compilerOptions: original = {}, ...other } = main ?? {};
    const compilerOptions = deepMerge(src !== false ? src?.compilerOptions ?? {} : {}, original);
    configFiles.push({
      shouldReference: false,
      filepath,
      json: {
        ...createAutoGeneratedFlag('src'),
        extends: makeRelative(path.relative(path.dirname(filepath), PATH.baseTsconfig)),
        compilerOptions,
        ...other,
      },
    });
  }

  for (const [folder, config] of Object.entries(rest)) {
    if (!foldersInDirectory.includes(folder.replace(/^\.\//, '')) || config === false) {
      continue;
    }

    const filepath = path.join(pkg.location, folder, tsconfigFileName);
    const { compilerOptions: original = {}, paths = [], ...other } = config ?? {};
    const compilerOptionsPaths: Record<string, string[]> = original.paths ?? {};

    if (paths) {
      for (const entry of paths) {
        if (isString(entry)) {
          const dependencyPath = dependencies[entry];

          if (!dependencyPath) {
            continue;
          }

          compilerOptionsPaths[entry] = [
            path.join(
              path.relative(path.dirname(filepath), path.join(dependencyPath, 'src', 'index.ts')),
            ),
          ];

          continue;
        }

        const [name, pnpmFolder, subFolder] = entry;
        const pathToDefinitionFile = await getPackageDefinitionFilePath(pnpmFolder, subFolder);
        compilerOptionsPaths[name] = [
          path.join(path.relative(path.dirname(filepath), pathToDefinitionFile)),
        ];
      }
    }

    const compilerOptions: TsConfigJson.CompilerOptions = deepMerge(
      src !== false ? src?.compilerOptions ?? {} : {},
      original,
      { paths: isEmptyObject(compilerOptionsPaths) ? undefined : compilerOptionsPaths },
    );

    const extraReferences: TsConfigJson.References[] = [];

    if (['__tests__', '__dts__'].includes(folder)) {
      extraReferences.push({ path: '../src' });
    }

    if (folder.startsWith('__')) {
      const testingPath = path.relative(
        path.dirname(filepath),
        path.join(dependencies['testing'] ?? '', 'src'),
      );
      const remirrorPath = path.relative(
        path.dirname(filepath),
        path.join(dependencies['remirror'] ?? '', 'src'),
      );
      extraReferences.push({ path: testingPath }, { path: remirrorPath });
    }

    configFiles.push({
      shouldReference: true,
      filepath,
      json: {
        ...createAutoGeneratedFlag(folder),
        extends: path.relative(path.dirname(filepath), PATH.baseTsconfig),
        compilerOptions,
        ...other,
        references: [...extraReferences, ...references],
      },
    });
  }

  return configFiles;
}

/**
 * Generate a tsconfig for every package.
 */
async function generatePackageTsConfigs() {
  log.info(chalk`\n{blue Generating {bold.grey tsconfig.json} files for all packages}`);

  // Get the full package and the locations of all packages with a `types` field
  // in their `package.json`.
  const [packages, dependencies] = await Promise.all([
    getAllDependencies(),
    getTypedPackagesWithPath(),
  ]);

  const promises: Array<Promise<void>> = [];
  const limit = pLimit(os.cpus().length);
  const references: TsConfigJson.References[] = [];
  const types: Set<string> = new Set();
  const entryFiles: string[] = [];

  /**
   * Write the file for an individual package.
   */
  function writePackageTsconfig(pkg: Package) {
    if (pkg.types && !pkg.private) {
      entryFiles.push(path.join(getRelativePathFromJson(pkg), 'src', 'index.ts'));
    }

    promises.push(
      limit(async () => {
        const tsconfigFiles = await resolveTsConfigMeta(pkg, dependencies, types);

        for (const tsconfig of tsconfigFiles) {
          if (!tsconfig.shouldReference) {
            continue;
          }

          references.push({
            path: path.relative(baseDir(), path.dirname(tsconfig.filepath)),
          });
        }

        // Write the tsconfig files to disk.
        await Promise.all(tsconfigFiles.map(({ filepath, json }) => writeJSON(filepath, json)));

        // Add the file created to the list of files to prettify at the end of
        // the script being run.
        filesToPrettify.push(...tsconfigFiles.map((tsconfig) => tsconfig.filepath));
      }),
    );
  }

  for (const pkg of packages) {
    // Populate the promises.
    writePackageTsconfig(pkg);
  }

  // Write all the files to the locations.
  await Promise.all(promises);

  const packagesTsconfig = {
    extends: makeRelative(path.relative(path.dirname(PATH.packagesTsconfig), PATH.baseTsconfig)),
    compilerOptions: {
      types: [...types],
      composite: true,
      noEmit: true,
      skipLibCheck: true,
    },
    include: ['./*/src'],
  };

  references.sort((a, b) => a.path.localeCompare(b.path));
  await writeJSON(
    PATH.rootTsconfig,
    { include: [], files: [], references },
    { detectIndent: true },
  );

  filesToPrettify.push(PATH.packagesTsconfig);

  await writeJSON(PATH.packagesTsconfig, packagesTsconfig, { detectIndent: true });
}

/**
 * The runner that runs when this is actioned.
 */
async function main() {
  if (cliArgs.size > 0) {
    // Update the `size-limit.json` file.
    await Promise.all([generateSizeLimitConfig()]);
  } else if (cliArgs.tsPackages) {
    // Run when flag `--ts-packages` is used.
    await Promise.all([generatePackageTsConfigs()]);
  } else if (cliArgs.entryPoint) {
    // Run when `--entry-point` is used
    await Promise.all([generateEntryPoint()]);
  } else {
    // This is the default mode to run.
    await Promise.all([generateSizeLimitConfig()]);
  }

  if (filesToPrettify.length === 0) {
    return;
  }

  log.debug('Prettifying the updated and created files');

  // Format all the files which have been created before exiting.
  await formatFiles(filesToPrettify, { silent: true, formatter: 'prettier' });
}

// Run the script and listen for any errors.
main().catch((error) => {
  log.error(
    chalk`\n{red Something went wrong while running the} {blue.bold generate-configs} {red script.}`,
  );

  log.fatal('\n', error);
  process.exit(1);
});
