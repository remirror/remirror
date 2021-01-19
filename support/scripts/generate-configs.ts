/**
 * @script
 *
 * Generate configuration files for `sizeLimit` and package `tsconfig`'s.
 */

import chalk from 'chalk';
import { readdir } from 'fs/promises';
import globby from 'globby';
import os from 'os';
import pLimit from 'p-limit';
import path from 'path';
import { assert, deepMerge, isPlainObject, isString, object, omitUndefined } from 'remirror';
import sortKeys from 'sort-keys';
import { PackageJson, TsConfigJson } from 'type-fest';
import writeJSON from 'write-json-file';

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
  RemirrorPackageMeta,
  TsConfigMeta,
} from './helpers';

// A collection of the absolute paths where files will be written to.
const paths = {
  sizeLimit: baseDir('support', 'root', '.size-limit.json'),
  mainTsconfig: baseDir('tsconfig.json'),
  baseTsconfig: baseDir('support', 'tsconfig.base.json'),
  rootTsconfig: baseDir('support', 'root', 'tsconfig.json'),
};

// A list of all the generated files which will be prettified at the end of the process.
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

/**
 * This generates the `.size-limit.json` file which is currently placed into the
 * `support/root` folder.
 */
async function generateSizeLimitConfig() {
  log.info(chalk`\n{blue Generating {bold.grey size-limit.json} config file}`);

  // Get all the packages in the `pnpm` monorepo.
  const packages = await getAllDependencies();

  type DesiredPackage = Package & { module: string; meta: Required<RemirrorPackageMeta> };

  // Transform the packages into the correct sizes.
  const sizes = packages
    // Only pick the packages that are ESModules and have a size limit value in the `meta` package.json field.
    .filter((pkg): pkg is DesiredPackage => !!(pkg.module && pkg['@remirror']?.sizeLimit))

    // Convert the package.json into a valid array of [sizelimit
    // config](https://github.com/ai/size-limit/blob/HEAD/README.md#config)
    .map((pkg) => {
      const relativePath = getBrowserPath(pkg);
      assert(relativePath, 'A module path must exist for the package.');

      return {
        name: pkg.name,
        path: path.join(getRelativePathFromJson(pkg), relativePath),
        limit: pkg['@remirror']?.sizeLimit,
        ignore: Object.keys(pkg.peerDependencies ?? {}),
        running: false,
      };
    });

  await writeJSON(paths.sizeLimit, sizes);
  filesToPrettify.push(paths.sizeLimit);
}

// The base tsconfig starting point.
const baseMainTsconfig = {
  __AUTO_GENERATED__: 'To update run: `pnpm generate:ts:experimental`',
  files: [],
  references: [
    { path: 'test/tsconfig.json' },
    { path: 'support/storybook/tsconfig.json' },
    { path: 'examples/with-next/tsconfig.json' },
    { path: 'support/tsconfig.all.json' },
  ],
};

// Store the name used for all tsconfig files.
const tsconfigFileName = 'tsconfig.json';

// Packages which should not be referenced in the main tsconfig reference file.
// These ones don't have a tsconfig available.
const excludedPackageNames = new Set(['@remirror/support']);

/**
 * Generate the main tsconfig reference file which points to all the packages.
 */
async function generateMainTsConfig() {
  log.info(
    chalk`\n{blue Generating {bold.grey tsconfig.json} reference file for the project root}`,
  );

  // Get all the workspace packages.
  const packages = await getAllDependencies();

  // The variable which will be updated with all the references from packages.
  const mainTsconfig = { ...baseMainTsconfig };

  // Loop through each package an add the relevant tsconfig files to the list of
  // reference.
  for (const pkg of packages) {
    if (excludedPackageNames.has(pkg.name)) {
      continue;
    }

    // Add the reference to the main tsconfig object.
    mainTsconfig.references.push({
      path: path.join(getRelativePathFromJson(pkg), tsconfigFileName),
    });
  }

  // Write the main tsconfig reference file to the defined absolute path.
  await writeJSON(paths.mainTsconfig, mainTsconfig);

  // Add the generated file to the list of files to prettify.
  filesToPrettify.push(paths.mainTsconfig);
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
  './': {
    compilerOptions: {
      declaration: false,
      noEmit: true,
      skipLibCheck: true,
    },
    include: ['src'],
  },
};

interface TsConfigFile {
  filepath: string;
  json: TsConfigJson;
  shouldReference: boolean;
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
        // Add the dependency which is a path relative to the current package being checked.
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

    configFiles.push({
      shouldReference: true,
      filepath,
      json: {
        ...createAutoGeneratedFlag('src'),
        extends: path.relative(path.dirname(filepath), paths.baseTsconfig),
        compilerOptions,
        ...other,
        references:
          pkg.name === '@remirror/support'
            ? [{ path: path.relative(path.dirname(filepath), dependencies['remirror'] ?? '') }]
            : references,
      },
    });
  }

  if (main !== false) {
    const filepath = path.join(pkg.location, tsconfigFileName);
    const { compilerOptions: original = {}, ...other } = main ?? {};
    const compilerOptions = deepMerge(src !== false ? src?.compilerOptions ?? {} : {}, original);
    configFiles.push({
      shouldReference: false,
      filepath,
      json: {
        ...createAutoGeneratedFlag('src'),
        extends: makeRelative(path.relative(path.dirname(filepath), paths.baseTsconfig)),
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
    const { compilerOptions: original = {}, ...other } = config ?? {};
    const compilerOptions = deepMerge(src !== false ? src?.compilerOptions ?? {} : {}, original);

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
        extends: path.relative(path.dirname(filepath), paths.baseTsconfig),
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

  /**
   * Write the file for an individual package.
   */
  function writePackageTsconfig(pkg: Package) {
    // // Don't add a tsconfig to packages within the support directory.
    // if (path.relative(baseDir(), pkg.location).startsWith('support')) {
    //   return;
    // }

    // // The path for the tsconfig
    // const tsconfigFilePath = path.join(pkg.location, tsconfigFileName);

    // // The compiler options for the tsconfig file. If this is a typed package
    // // then it is declared to be composite and if not it is left quite bare.
    // const tsconfigCompilerOptions = pkg.types
    //   ? { declaration: true, noEmit: true }
    //   : { noEmit: true };

    // // Create the json for the tsconfig which will be written to the tsconfig file.
    // const tsconfig = {
    //   ...basePackageTsconfig,
    //   extends: path.relative(pkg.location, baseDir(paths.mainTsconfig)),
    //   compilerOptions: {
    //     ...basePackageTsconfig.compilerOptions,
    //     ...tsconfigCompilerOptions,
    //   },
    //   // references,
    // };

    promises.push(
      limit(async () => {
        const tsconfigs = await resolveTsConfigMeta(pkg, dependencies);

        for (const tsconfig of tsconfigs) {
          if (!tsconfig.shouldReference) {
            continue;
          }

          references.push({
            path: path.relative(baseDir(), path.dirname(tsconfig.filepath)),
          });
        }

        // Write the tsconfig files to disk.
        await Promise.all(tsconfigs.map(({ filepath, json }) => writeJSON(filepath, json)));

        // Add the file created to the list of files to prettify at the end of the
        // script being run.
        filesToPrettify.push(tsconfigs.map((tsconfig) => tsconfig.filepath).join(' '));
      }),
    );
  }

  for (const pkg of packages) {
    // Populate the promises.
    writePackageTsconfig(pkg);
  }

  // Write all the files to the locations.
  await Promise.all(promises);

  references.sort((a, b) => a.path.localeCompare(b.path));
  await writeJSON(paths.rootTsconfig, { include: [], files: [], references });
  filesToPrettify.push(paths.rootTsconfig);
}

/**
 * The runner that runs when this is actioned.
 */
async function main() {
  if (cliArgs.size) {
    // Update the `size-limit.json` file.
    await Promise.all([generateSizeLimitConfig()]);
  } else if (cliArgs.tsExperimentalReferences) {
    // Run when flag `--ts-experimental-references` is used. It currently breaks
    // everything but might become useful in the future.
    await Promise.all([generatePackageTsConfigs(), generateMainTsConfig()]);
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
