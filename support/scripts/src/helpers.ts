import { readPreState } from '@changesets/pre';
import readChangesets from '@changesets/read';
import type { NewChangeset, PreState } from '@changesets/types';
import { getPackages } from '@manypkg/get-packages';
import assert from 'assert';
import camelCaseKeys from 'camelcase-keys';
import chalk from 'chalk';
import { exec as _exec } from 'child_process';
import fs from 'fs';
import { diff } from 'jest-diff';
import isEqual from 'lodash.isequal';
import minimist from 'minimist';
import path from 'path';
import _rm from 'rimraf';
import { debounce } from 'throttle-debounce';
import { Logger } from 'tslog';
import { promisify } from 'util';
import { PackageJson, TsConfigJson } from '@remirror/types';

/**
 * The `camelCased` argument passed to the cli.
 */
export const cliArgs = camelCaseKeys(minimist(process.argv.slice(2)));

// The log level to use for scripts.
const minLevel = cliArgs.logLevel ?? process.env.LOG_LEVEL ?? 'debug';

/**
 * The logger used when running scripts.
 */
export const log: Logger = new Logger({ minLevel });

export const exec = promisify(_exec);
export const rm = promisify(_rm);
const separator = '__';

/**
 * Convert a mangled name to its unmangled version.
 *
 * `babel__types` => `@babel/types`.
 */
export function unmangleScopedPackage(mangledName: string): string {
  return mangledName.includes(separator) ? `@${mangledName.replace(separator, '/')}` : mangledName;
}

/**
 * Mangle a scoped package name. Which removes the `@` symbol and adds a `__`
 * separator.
 *
 * `@babel/types` => `babel__types`
 */
export function mangleScopedPackageName(packageName: string): string {
  const [scope, name] = packageName.split('/');
  assert.ok(scope, `Invalid package name provided: ${packageName}`);

  if (name) {
    return [scope.replace('@', ''), name].join(separator);
  }

  return scope;
}

/**
 * Get a path relative to the base directory of this project. If called with no
 * arguments it will return the base directory.
 */
export function baseDir(...paths: string[]): string {
  return path.resolve(__dirname, '../../..', path.join(...paths));
}

/**
 * Get the path relative to the base directory of this project.
 */
export function getRelativePathFromJson({ location }: { location: string }): string {
  return path.relative(baseDir(), location);
}

interface FormatFilesOptions {
  /**
   * Whether to log anything to the console.
   *
   * @default false
   */
  silent?: boolean;

  /**
   * What formatters to use.
   *
   * @default 'all'
   */
  formatter?: 'prettier' | 'eslint' | 'all';
}

/**
 * Format the provided files with `prettier` and `eslint`.
 */
export async function formatFiles(
  path = '',
  { silent = false, formatter = 'all' }: FormatFilesOptions = {},
): Promise<void> {
  const promises: Array<Promise<{ stdout: string; stderr: string }>> = [];

  if (formatter !== 'prettier') {
    promises.push(
      exec(`eslint --fix ${path}`, {
        // @ts-expect-error
        stdio: 'pipe',
      }),
    );
  }

  if (formatter !== 'eslint') {
    promises.push(
      exec(`prettier --loglevel warn ${path} --write`, {
        // @ts-expect-error
        stdio: 'pipe',
      }),
    );
  }

  const results = await Promise.all(promises);

  if (silent) {
    return;
  }

  if (results.some((result) => result.stderr)) {
    log.fatal(...results.map((result) => result.stderr.trim()));
  }

  if (results.some((result) => result.stdout)) {
    log.info(...results.map((result) => result.stdout.trim()));
  }
}

export interface RemirrorPackageMeta {
  /**
   * The maximum size in KB for the package.
   */
  sizeLimit?: string;

  /**
   * Set the options for the tsconfig.
   *
   * False means no tsconfig files will be added to the package.
   */
  tsconfigs?: false | TsConfigMeta;

  /**
   * Whether to skip the api generation for a package.
   */
  skipApi?: boolean;
}

export type TsConfigWithPaths = TsConfigJson & {
  paths?: false | Array<string | [path: string, typesPackage: string, subFolder?: string]>;
};

export interface TsConfigMeta {
  [key: string]: TsConfigWithPaths | false | undefined;
  __dts__?: TsConfigWithPaths | false;
  __tests__?: TsConfigWithPaths | false;
  __e2e__?: TsConfigWithPaths | false;
  src?: TsConfigWithPaths | false;
}

export interface Package extends Omit<PackageJson, 'name'> {
  /**
   * The name of the package.
   */
  name: string;

  /**
   * The absolute path to the package.
   */
  location: string;

  /**
   * Custom meta properties consumed by `remirror`.
   */
  '@remirror'?: RemirrorPackageMeta;
}

/**
 * The cached packages, to prevent multiple re-computations.
 */
let packages: Promise<Package[]>;

interface GetAllDependencies {
  excludeDeprecated?: boolean;
  excludeSupport?: boolean;
}

/**
 * Get all dependencies.
 *
 * @param excludeDeprecated - when true exclude the deprecated packages
 */
export function getAllDependencies({
  excludeDeprecated = true,
  excludeSupport = false,
}: GetAllDependencies = {}): Promise<Package[]> {
  if (!packages) {
    packages = getPackages(baseDir()).then(({ packages = [] }) => {
      const transformedPackages: Package[] = [];

      for (const pkg of packages) {
        if (excludeSupport && pkg.dir.startsWith(baseDir('support'))) {
          continue;
        }

        if (excludeDeprecated && pkg.dir.startsWith(baseDir('deprecated'))) {
          continue;
        }

        transformedPackages.push({
          ...pkg.packageJson,
          location: pkg.dir,
        });
      }

      return transformedPackages;
    });
  }

  return packages;
}

/**
 * Get all the packages that can be used as dependencies within the project.
 * These are identified by having a types field in the package.json.
 *
 * @param relative - when set to true this will return the paths as
 * relative to the root directory. Defaults to `false`.
 */
export async function getTypedPackagesWithPath(relative = false): Promise<Record<string, string>> {
  // Load all the packages within this repository.
  const packages = await getAllDependencies();

  // Get the packages which have a `types` field.
  const tsPackages = packages.filter((pkg) => pkg.types);

  /**
   * The typed packages to be returned.
   */
  const typedPackages: Record<string, string> = {};

  // Loop through the typed packages and store the name as a key and path
  // (either relative or absolute) as the value.
  for (const pkg of tsPackages) {
    assert.ok(pkg.name, 'Packages must include a name');
    typedPackages[pkg.name] = relative ? getRelativePathFromJson(pkg) : pkg.location;
  }

  return typedPackages;
}

interface ChangesetState {
  preState: PreState | undefined;
  changesets: NewChangeset[];
}

/**
 * Get the value of the current changesets.
 */
export async function readChangesetState(cwd = process.cwd()): Promise<ChangesetState> {
  const preState = await readPreState(cwd);
  let changesets = await readChangesets(cwd);

  if (preState?.mode === 'pre') {
    const changesetsToFilter = new Set(preState.changesets);
    changesets = changesets.filter((x) => !changesetsToFilter.has(x.id));
  }

  return {
    preState: preState,
    changesets,
  };
}

const diffOptions = {
  contextLines: 1,
  expand: false,
  aAnnotation: 'Original',
  aColor: chalk.red,
  bAnnotation: 'Generated',
  bColor: chalk.green,
  includeChangeCounts: true,
};

/**
 * Sort the keys alphabetically to produce consistent comparisons.
 */
function orderOutputKeys(output: Record<string, unknown>) {
  return Object.keys(output)
    .sort()
    .map((name) => path.relative(process.cwd(), name));
}

/**
 * Check that the actual output and the expected output are identical. When
 * content has changed it will throw an error with a descriptive diff.
 *
 * @param actual
 * @param expected
 */
export function compareOutput(actual: Record<string, unknown>, expected: Record<string, unknown>) {
  const actualKeys = orderOutputKeys(actual);
  const expectedKeys = orderOutputKeys(expected);

  if (!isEqual(actualKeys, expectedKeys)) {
    throw new Error(
      chalk`\n{yellow The generated files are not identical to the original files.}\n\n${
        diff(actualKeys, expectedKeys, diffOptions) || ''
      }\n`,
    );
  }

  const errorMessages: string[] = [];

  for (const [name, actualContents] of Object.entries(actual)) {
    const expectedContents = expected[name];
    const relativeName = path.relative(process.cwd(), name);

    if (isEqual(actualContents, expectedContents)) {
      continue;
    }

    errorMessages.push(
      chalk`{grey ${relativeName}}\n${diff(actualContents, expected[name], diffOptions)}`,
    );
  }

  if (errorMessages.length > 0) {
    throw new Error(
      chalk`\n{bold.yellow The generated file contents differs from current content.}\n\n${errorMessages.join(
        '\n\n',
      )}\n`,
    );
  }
}

export const environment = {
  get isUnit() {
    return !environment.isE2E && !environment.isIntegration;
  },

  get isIntegration() {
    return process.env.TEST_ENV === 'integration';
  },

  get isE2E() {
    return process.env.TEST_ENV === 'e2e';
  },

  get isCI() {
    return Boolean(process.env.CI);
  },

  get isMacOS() {
    return process.platform === 'darwin';
  },
};

/**
 * watch some files and execute a callback function when any file change.
 *
 * @param files an array of file paths
 * @param callback the function that will be called when a file is modified
 */
export function watchFiles(files: string[], callback: () => any) {
  const debounceCallback = debounce(1027, false, callback);

  for (const file of files) {
    fs.watchFile(file, { interval: 1007 }, (curr, prev) => {
      // To be notified when the file was modified, not just accessed, it is
      // necessary to compare curr.mtime and prev.mtime.
      if (curr.mtime.getTime() !== prev.mtime.getTime()) {
        debounceCallback();
      }
    });
  }
}
