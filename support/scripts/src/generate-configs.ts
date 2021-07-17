/**
 * @script
 *
 * Generate configuration files for `sizeLimit` and package `tsconfig`'s.
 */

import chalk from 'chalk';
import fs, { readdir } from 'fs-extra';
import globby from 'globby';
import os from 'os';
import pLimit from 'p-limit';
import path from 'path';
import sortKeys from 'sort-keys';
import writeJSON from 'write-json-file';
import {
  assertGet,
  deepMerge,
  invariant,
  isEmptyObject,
  isPlainObject,
  isString,
  object,
  omitUndefined,
} from '@remirror/core-helpers';
import type { PackageJson, TsConfigJson } from '@remirror/types';

import {
  baseDir,
  cliArgs,
  compareOutput,
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
  sizeLimit: baseDir('support', 'root', '.size-limit.json'),
  mainTsconfig: baseDir(tsconfigFileName),
  baseTsconfig: baseDir('support', 'tsconfig.base.json'),
  rootTsconfig: baseDir('support', 'root', tsconfigFileName),
  packagesTsconfig: baseDir('packages', tsconfigFileName),
  rootTypedoc: baseDir('support', 'root', 'typedoc.json'),
};

// A list of all the generated files which will be prettified at the end of the
// process.
const filesToPrettify: string[] = [];

type Exports = Record<string, ExportField>;
type ExportField = { [Key in PackageJson.ExportCondition | 'types']?: string } | string;

/**
 * Generate the exports within the packages.
 *
 * TODO support `typeVersions` field https://github.com/sandersn/downlevel-dts
 */
async function generateExports() {
  log.info(chalk`\n{blue Running script for package.json {bold.grey exports} field}`);

  // The following are used for running checks.
  const actual: Record<string, unknown> = object();
  const expected: Record<string, unknown> = object();

  // Get all the packages in the `pnpm` monorepo.
  const packages = await getAllDependencies({ excludeSupport: true });

  // All the files to update with the new exports object.
  const files: Array<[location: string, json: PackageJson]> = [];

  for (const pkg of packages) {
    if (!pkg.main) {
      continue;
    }

    const { location, ...packageJson } = pkg;
    const name = pkg.name;
    const exportsObject = object<any>();

    // Reset the exports field so that outdated references aren't persisted.
    packageJson.exports = exportsObject;

    // Track the actual stored expected for comparison with the expected.
    actual[name] = JSON.stringify(pkg.exports, null, 2) ?? '';

    const subPackages = await globby('**/package.json', {
      cwd: location,
      ignore: ['**/node_modules/**'],
      onlyFiles: true,
      absolute: true,
    });

    for (const subPackage of subPackages) {
      const subPackageJson: PackageJson = require(subPackage);
      const relativePath = prefixRelativePath(path.relative(location, path.dirname(subPackage)));

      augmentExportsObject(packageJson, relativePath, subPackageJson);
    }

    // Make sure the keys are sorted for the exports.
    packageJson.exports = sortKeys(exportsObject) ?? '';

    // Track the generated exports object for testing.
    expected[name] = JSON.stringify(packageJson.exports, null, 2);
    files.push([path.join(location, 'package.json'), packageJson]);
  }

  let error: Error | undefined;

  try {
    log.info('\nChecking the generated exports');
    compareOutput(actual, expected);
    log.info(chalk`\n{green The generated {bold exports} are valid for all packages.}`);

    if (!cliArgs.force) {
      return;
    }

    log.info(chalk`\n\nForcing update: {yellow \`--force\`} flag applied.\n\n`);
  } catch (error_) {
    error = error_;
    log.error('\n', error?.message);
  }

  if (cliArgs.check && error) {
    process.exit(1);
  }

  if (cliArgs.check) {
    return;
  }

  log.info('\nWriting updates to file system.');

  await Promise.all(
    files.map(async ([filepath, json]) => {
      filesToPrettify.push(path.relative(process.cwd(), filepath));
      await writeJSON(filepath, json);
    }),
  );
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
 * Add the path with relevant fields to the export field of the provided
 * `package.json` object.
 */
function augmentExportsObject(packageJson: PackageJson, filepath: string, json: PackageJson) {
  filepath = filepath || '.';
  const browserPath = getBrowserPath(packageJson);
  const field: ExportField = {
    import: prefixRelativePath(json.module ? path.join(filepath, json.module) : undefined),
    require: prefixRelativePath(json.main ? path.join(filepath, json.main) : undefined),
    browser: prefixRelativePath(browserPath ? path.join(filepath, browserPath) : undefined),

    // Experimental since this is not currently resolved by TypeScript.
    types: prefixRelativePath(json.types ? path.join(filepath, json.types) : undefined),
  };
  field.default = field.import;

  let exportsObject: Exports;

  if (isPlainObject(packageJson.exports)) {
    exportsObject = packageJson.exports as Exports;
  } else {
    exportsObject = object();
    packageJson.exports = exportsObject as PackageJson.Exports;
  }

  if (!packageJson.exports || isString(packageJson.exports)) {
    packageJson.exports = {};
  }

  exportsObject[filepath] = omitUndefined(field);

  if (filepath === '.') {
    exportsObject['./package.json'] = './package.json';
    exportsObject['./types/*'] = './dist/declarations/src/*.d.ts';
  }
}

/**
 * Get the relative path for the browser module if it exists, otherwise fallback
 * to the module or main path.
 */
function getBrowserPath(pkg: PackageJson) {
  const browserPath = isString(pkg.browser) ? pkg.browser : pkg.browser?.[`./${pkg.module}`];

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
   * @default false
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
 * This generates the `.size-limit.json` file which is currently placed into the
 * `support/root` folder.
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
    compilerOptions: { types: [], declaration: true, noEmit: true },
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
      declaration: false,
      noEmit: true,
      skipLibCheck: true,
      // @ts-ignore
      importsNotUsedAsValues: 'remove',
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
      declaration: false,
      noEmit: true,
      skipLibCheck: true,
      // @ts-ignore
      importsNotUsedAsValues: 'remove',
    },
    include: ['./'],
  },
  __dts__: {
    compilerOptions: {
      declarationMap: false,
      declaration: false,
      noEmit: true,
      skipLibCheck: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      allowUnreachableCode: true,
      noImplicitReturns: false,
      // @ts-ignore
      importsNotUsedAsValues: 'remove',
    },
    include: ['./'],
  },
  __stories__: {
    compilerOptions: {
      declaration: false,
      noEmit: true,
      skipLibCheck: true,
      // @ts-ignore
      importsNotUsedAsValues: 'remove',
    },
    include: ['./'],
    paths: [
      ['react', '@types/react'],
      ['react/jsx-dev-runtime', '@types/react', 'jsx-dev-runtime.d.ts'],
      ['react/jsx-runtime', '@types/react', 'jsx-runtime.d.ts'],
      ['react-dom', '@types/react-dom'],
      ['reakit', 'reakit', 'ts'],
      '@remirror/react',
      ['@storybook/react', '@storybook/react', 'types-6-0.d.ts'],
      '@remirror/dev',
    ],
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
    for (const dependency of Object.keys(pkg.dependencies ?? {})) {
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

    const { compilerOptions: original, ...other } = src ?? {};
    const isComposite =
      !!pkg.types ||
      Object.keys(dependencies).includes(pkg.name) ||
      ['__tests__', '__dts__'].some((folder) => foldersInDirectory.includes(folder));
    const compilerOptions = deepMerge(
      {},
      original ?? {},
      isComposite
        ? { composite: true, noEmit: false, emitDeclarationOnly: true, outDir: '../dist-types' }
        : { declaration: false, noEmit: true },
    );

    for (const type of compilerOptions?.types ?? []) {
      types.add(type);
    }

    configFiles.push({
      shouldReference: true,
      filepath,
      json: {
        ...createAutoGeneratedFlag('src'),
        extends: path.relative(path.dirname(filepath), PATH.baseTsconfig),
        compilerOptions,
        ...other,
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
 *
 * This is currently unused.
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
        filesToPrettify.push(tsconfigFiles.map((tsconfig) => tsconfig.filepath).join(' '));
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
      declaration: false,
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
  await writeJSON(PATH.packagesTsconfig, packagesTsconfig, { detectIndent: true });
  await writeJSON(PATH.rootTypedoc, { entryFiles, out: 'docs/api' }, { detectIndent: true });
  filesToPrettify.push(PATH.rootTsconfig, PATH.rootTypedoc, PATH.packagesTsconfig);
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
  } else if (cliArgs.exports) {
    // Run when `--exports` is used
    await Promise.all([generateExports()]);
  } else {
    // This is the default mode to run.
    await Promise.all([generateSizeLimitConfig()]);
  }

  if (filesToPrettify.length === 0) {
    return;
  }

  log.debug('Prettifying the updated and created files');

  // Format all the files which have been created before exiting.
  await formatFiles(filesToPrettify.join(' '), { silent: true, formatter: 'prettier' });
}

// Run the script and listen for any errors.
main().catch((error) => {
  log.error(
    chalk`\n{red Something went wrong while running the} {blue.bold playground:imports} {red script.}`,
  );

  log.fatal('\n', error);
  process.exit(1);
});
