/**
 * @script
 *
 * This script should be run to update the playground with all the latest type
 * definitions and module exports.
 *
 * It should be run after running `pnpm build` otherwise it will fail.
 */

import assert from 'assert';
import { promises as fs, Stats } from 'fs';
import glob from 'globby';
import isBuiltinModule from 'is-builtin-module';
import loadJson from 'load-json-file';
import path from 'path';
import { format, resolveConfig } from 'prettier';
import sortKeys from 'sort-keys';
import { assertGet, camelCase, findMatches, invariant, pascalCase } from '@remirror/core-helpers';
import type { DtsCache } from '@remirror/playground';
import type { PackageJson } from '@remirror/types';

import { baseDir, formatFiles, log } from './helpers';

log.debug('\nLaunching the `generate:playground` script.');

// The location for all the project packages.
const packagesFolder = baseDir('packages');

const remirrorPackageJson: PackageJson = loadJson.sync(
  path.join(packagesFolder, 'remirror', 'package.json'),
);
const remirrorReactPackageJson: PackageJson = loadJson.sync(
  path.join(packagesFolder, 'remirror__react', 'package.json'),
);

const remirrorPackageNames = Object.keys(remirrorPackageJson.dependencies ?? {}).filter(
  (name) => name.startsWith('@remirror') && !name.startsWith('@remirror/pm'),
);
const remirrorReactPackageNames = Object.keys(remirrorReactPackageJson.dependencies ?? {}).filter(
  (name) => name.startsWith('@remirror') && !name.startsWith('@remirror/pm'),
);

interface PopulateRemirrorImports {
  /**
   * The pattern which matches the main package.json file.
   *
   * e.g. `extension-*\/package.json` matches all package.json files for
   * extensions.
   */
  pattern: string;

  /**
   * The names to skip.
   */
  excludedNames?: string[];
}

/**
 * Get the imports from the `remirror/` module and transform them into:
 *
 * - dts file mappings
 * - import keys
 * - the scoped name
 * - a pseudo `package.json`
 *
 * All of this is then used to create the files which add all the extension and
 * presets to the code and enable intellisense in the monaco editor via `*.d.ts`
 * files..
 */
async function populateRemirrorImports(
  props: PopulateRemirrorImports,
): Promise<Record<string, PackageModuleMeta>> {
  const { pattern, excludedNames = [] } = props;
  const result: Record<string, PackageModuleMeta> = {};
  const mainPackageJsonFiles = await glob(pattern, {
    cwd: packagesFolder,
    absolute: true,
  });

  /**
   * Add a result from the provided directory.
   */
  async function addResult(packageJsonPath: string, _name?: string): Promise<void> {
    // Deprecated and should never be true.
    const isSubdirectory = !!_name;
    const packageFolder = path.dirname(packageJsonPath);

    if (
      // Skip the folder if it's the build directory.
      packageFolder.endsWith('dist') ||
      // Make sure the package.json exists otherwise return early.
      !(await getFileStat(packageJsonPath))?.isFile()
    ) {
      return;
    }

    // Load the contents of the the `package.json` file.
    const packageJson = require(packageJsonPath);

    // For subdirectories the name should be provided otherwise, collect it from
    // the package.json file.
    const name: string | undefined = packageJson.name;

    // Ignore this package if the name is excluded.
    if (!name || excludedNames.includes(name)) {
      return;
    }

    // The main entry point relative to the current folder.
    const relativeEntryPoint = packageJson.browser?.[`./${packageJson.main}`] ?? packageJson.main;
    const mainPath = path.join(packageFolder, relativeEntryPoint);

    // Populate the `.d.ts` file map and retrieve all the data.
    result[packageFolder] = await extractPackageModuleData(
      packageFolder,
      name,
      mainPath,
      isSubdirectory,
    );

    const subDirectories = await fs.readdir(packageFolder);

    // Loop through nested directories.
    for (const directory of subDirectories) {
      const filepath = path.join(packageFolder, directory, 'package.json');

      await addResult(filepath, path.join(name, directory));
    }
  }

  // Loop through the folders and extra the required data.
  for (const packageJsonPath of mainPackageJsonFiles) {
    await addResult(packageJsonPath);
  }

  return sortKeys(result, { deep: true });
}

/**
 * Sort the object keys.
 */

interface PackageDeclarations {
  /**
   * The name of the package the declarations belong to and the DtsMap. Name is
   * either scoped `@remirror/extension-bold` or a sub import
   * `remirror/extensions`.
   */
  [name: string]: DtsFileContents;
}

interface PackageModuleMeta {
  /**
   * The name of the module which will be used for the `package.json`.
   */
  name: string;

  /**
   * The exports from the module.
   */
  exports: string[];

  /**
   * An object mapping of the types that should be added to the monaco editor
   * instance.
   */
  declarations: PackageDeclarations;

  /**
   * The pseudo package.json as a string value.
   */
  packageJson: string;
}

/**
 * Extract the package module data from a given file path.
 */
async function extractPackageModuleData(
  absolutePath: string,
  name: string,
  mainPath: string,
  singleEntryPoint = false,
): Promise<PackageModuleMeta> {
  let contents: Record<string, string>;

  if (!singleEntryPoint) {
    // Get the declaration directory.
    const dtsFolder = path.join(absolutePath, 'dist', 'declarations', 'src');

    // Add all folder contents to the folder
    contents = await getDtsFileContents(dtsFolder);
  } else {
    const [dtsEntryPoint] = await glob('*.d.ts', {
      absolute: true,
      cwd: path.join(absolutePath, 'dist'),
    });

    invariant(dtsEntryPoint, {
      disableLogging: true,
      message: `No definition (*.d.ts) file found for entry point: ${name}`,
    });

    contents = await readDtsFile(dtsEntryPoint, 'index.d.ts');
  }

  contents['package.json'] = JSON.stringify({ name, types: 'index.d.ts' });

  // Get the names of the exports from this module.
  const exports = Object.keys(await require(mainPath));

  // All the declarations that have been retrieved.
  const declarations: PackageDeclarations = {
    [name]: contents,
  };

  // Get the package.json file for the scoped package and modify the entry
  // point.
  const packageJson = JSON.stringify({ name, types: 'index.d.ts' });

  return {
    name,
    exports,
    declarations,
    packageJson,
  };
}

/**
 * Safely get the stats for a file or directory.
 *
 * @param {string} target
 * @returns a promise of the file information if it exists.
 */
async function getFileStat(target: string): Promise<Stats | undefined> {
  try {
    const stat = await fs.lstat(target);
    return stat;
  } catch {
    return;
  }
}

/** A type alias of the string for better naming */
type FileContents = string;

/**
 * The type of the package declarations object which is returned for each
 * package.
 */
type DtsFileContents = Record<string, FileContents>;

/**
 * Keeps track of all the external modules which have been required by the
 * internal packages. These are added to the file produced as imports to a file
 * and run through the `type-acquisition.ts` file in order to download all the
 * required types at runtime.
 *
 * This seemed much easier than rebuilding the functionality for node.
 */
const EXTERNAL_MODULES = new Set<string>([]);

/**
 * Load all type declarations from a given path.
 *
 * @param dtsFolder - The absolute path to the definition types folder.
 * @param subFolder - The relative path from the dtsFolder to the sub-folders.
 * @returns and object of monaco libraries paths and their file contents
 */
async function getDtsFileContents(dtsFolder: string, subFolder = ''): Promise<DtsFileContents> {
  // Keeps track of the declaration files for this
  let dtsFileContents: DtsFileContents = {};

  for (const declaration of await fs.readdir(dtsFolder)) {
    const key = path.join(subFolder, declaration);
    const filePath = path.join(dtsFolder, declaration);
    const filePathStat = await getFileStat(filePath);

    if (!filePathStat) {
      continue;
    }

    if (filePathStat.isDirectory()) {
      const nestedDeclarations = await getDtsFileContents(path.join(dtsFolder, declaration), key);

      dtsFileContents = { ...dtsFileContents, ...nestedDeclarations };
      continue;
    }

    if (!filePath.endsWith('.d.ts')) {
      continue;
    }

    const fileContents = await readDtsFile(filePath, key);
    dtsFileContents = { ...dtsFileContents, ...fileContents };
  }

  return dtsFileContents;
}

/**
 * Read a single dts file.
 */
async function readDtsFile(filePath: string, key: string): Promise<DtsFileContents> {
  const dts = await fs.readFile(filePath, { encoding: 'utf-8' });

  // Here I want to get all the external modules that are valid and don't belong
  // to remirror and keep track of them. They can either be added manually via
  // this file, or perhaps a way to add them at runtime should be sought.
  parseFileForModuleReferences(dts)
    .map((name) => (isBuiltinModule(name) ? 'node' : name))
    .filter((name) => !isDisallowed(name))
    .forEach((name) => EXTERNAL_MODULES.add(name));

  return { [key]: dts };
}

/**
 * Use this to preload the types from external libraries.
 *
 * - `react`
 * - `react-dom`
 * - `prosemirror-*`
 */
async function preloadRequiredLibraries(dtsCache: DtsCache) {
  type ModuleName = string;
  type AbsolutePath = string;

  // We can't use `require.resolve` since pnpm doesn't hoist all packages.
  // Instead we're going to look at the special `.pnpm` folder inside the root
  // `node_modules`.

  // Get the folder for `.pnpm`.
  const pnpmFolder = baseDir('node_modules', '.pnpm');
  const searchFolders = await fs.readdir(pnpmFolder);

  /** A function which retrieves the package folder for a given package name. */
  function getPackageFolder(name: string, subFolder = '') {
    let folderName = name;

    if (name.startsWith('@')) {
      const split = name.split('/');
      folderName = `${assertGet(split, 0)}+${assertGet(split, 1)}`;
    }

    // const searchFolders = inTypesFolder ? pnpmTypeFolders : pnpmFolders;
    const directory = searchFolders.find((name) => name.startsWith(`${folderName}@`));

    if (!directory) {
      log.warn(`No directory found for: ${name}`);
      return '';
    }

    return path.join(pnpmFolder, directory, 'node_modules', name, subFolder);
  }

  // The list of packages that should be preloaded and the location of their root `*.d.ts` file.
  const preloadList: Array<[ModuleName, AbsolutePath]> = [
    ['@remirror/dev', baseDir('packages/remirror__dev/dist/declarations/src')],
    ['react', getPackageFolder('@types/react')],
    ['react-dom', getPackageFolder('@types/react-dom')],
    ['prosemirror-view', getPackageFolder('@types/prosemirror-view')],
    ['prosemirror-commands', getPackageFolder('@types/prosemirror-commands')],
    ['prosemirror-dropcursor', getPackageFolder('@types/prosemirror-dropcursor')],
    ['prosemirror-gapcursor', getPackageFolder('@types/prosemirror-gapcursor')],
    ['prosemirror-history', getPackageFolder('@types/prosemirror-history')],
    ['prosemirror-inputrules', getPackageFolder('@types/prosemirror-inputrules')],
    ['prosemirror-keymap', getPackageFolder('@types/prosemirror-keymap')],
    ['prosemirror-model', getPackageFolder('@types/prosemirror-model')],
    ['prosemirror-schema-list', getPackageFolder('@types/prosemirror-schema-list')],
    ['prosemirror-state', getPackageFolder('@types/prosemirror-state')],
    ['prosemirror-transform', getPackageFolder('@types/prosemirror-transform')],
    ['prosemirror-tables', getPackageFolder('prosemirror-tables')],

    ['type-fest', getPackageFolder('type-fest')],
    ['nanoevents', getPackageFolder('nanoevents')],
    ['react-use', getPackageFolder('react-use')],
    ['yjs', getPackageFolder('yjs')],
    ['y-protocols', getPackageFolder('y-protocols')],
    ['lib0', getPackageFolder('lib0')],
    ['y-prosemirror', getPackageFolder('y-prosemirror')],
    ['make-error', getPackageFolder('make-error')],
    ['json.macro', getPackageFolder('json.macro')],
    ['case-anything', getPackageFolder('case-anything')],
    ['csstype', getPackageFolder('csstype')],
    ['make-plural', getPackageFolder('make-plural')],
    ['reakit', getPackageFolder('reakit', 'ts')],
    ['reakit-utils', getPackageFolder('reakit-utils', 'ts')],
    ['reakit-system-palette', getPackageFolder('reakit-system-palette', 'ts')],
    ['reakit-system', getPackageFolder('reakit-system', 'ts')],
    ['@linaria/core', getPackageFolder('@linaria/core')],
    ['@lingui/core', getPackageFolder('@lingui/core')],

    ['prismjs', getPackageFolder('@types/prismjs')],
    ['refractor', getPackageFolder('@types/refractor')],
    ['orderedmap', getPackageFolder('@types/orderedmap')],
    ['throttle-debounce', getPackageFolder('@types/throttle-debounce')],
    ['object.omit', getPackageFolder('@types/object.omit')],
    ['object.pick', getPackageFolder('@types/object.pick')],
  ];

  for (const [packageName, dtsFolder] of preloadList) {
    // Add the `*.d.ts` files for the current package name. Can be one file (in
    // the object) e.g. `{ 'index.d.ts': 'CONTENT' }` or a mapping to a whole
    // file structure.
    const dtsContents = dtsFolder.endsWith('.d.ts')
      ? await readDtsFile(dtsFolder, 'index.d.ts')
      : await getDtsFileContents(dtsFolder);

    dtsContents['package.json'] = JSON.stringify({ name: packageName, types: 'index.d.ts' });
    dtsCache[packageName] = dtsContents;
  }
}

interface RemirrorModuleMap {
  [key: string]: PackageModuleMeta;
}

/**
 * The groups of imports that we're interested in for the editor.
 */
interface ImportGroups {
  pm: RemirrorModuleMap;
  extensions: RemirrorModuleMap;
  presets: RemirrorModuleMap;
  core: RemirrorModuleMap;
  react: RemirrorModuleMap;
  unscoped: RemirrorModuleMap;
}

const externalModules = [
  ['@remirror/pm', '@remirror/pm'],
  ['@remirror/dev', '@remirror/dev'],
  ['remirror/extensions', 'remirror/extensions'],
  ['remirror/dom', 'remirror/dom'],
  ['react', 'react'],
  ['react/jsx-runtime', 'react/jsx-runtime'],
  ['react/jsx-dev-runtime', 'react/jsx-dev-runtime'],
  ['react-dom', 'react-dom'],
  ['prosemirror-dropcursor', '@remirror/pm/dropcursor'],
  ['prosemirror-gapcursor', '@remirror/pm/gapcursor'],
  ['prosemirror-history', '@remirror/pm/history'],
  ['prosemirror-inputrules', '@remirror/pm/inputrules'],
  ['prosemirror-keymap', '@remirror/pm/keymap'],
  ['prosemirror-model', '@remirror/pm/model'],
  ['prosemirror-schema-list', '@remirror/pm/schema-list'],
  ['prosemirror-state', '@remirror/pm/state'],
  ['prosemirror-tables', '@remirror/pm/tables'],
  ['prosemirror-transform', '@remirror/pm/transform'],
  ['prosemirror-view', '@remirror/pm/view'],

  ['@remirror/pm/dropcursor', '@remirror/pm/dropcursor'],
  ['@remirror/pm/gapcursor', '@remirror/pm/gapcursor'],
  ['@remirror/pm/history', '@remirror/pm/history'],
  ['@remirror/pm/inputrules', '@remirror/pm/inputrules'],
  ['@remirror/pm/keymap', '@remirror/pm/keymap'],
  ['@remirror/pm/model', '@remirror/pm/model'],
  ['@remirror/pm/schema-list', '@remirror/pm/schema-list'],
  ['@remirror/pm/state', '@remirror/pm/state'],
  ['@remirror/pm/tables', '@remirror/pm/tables'],
  ['@remirror/pm/transform', '@remirror/pm/transform'],
  ['@remirror/pm/view', '@remirror/pm/view'],
  ['@remirror/pm/suggest', '@remirror/pm/suggest'],
  ['@remirror/pm/paste-rules', '@remirror/pm/paste-rules'],
  ['@remirror/pm/trailing-node', '@remirror/pm/trailing-node'],
];

const manualModules: Set<string> = new Set();
const importDeclarations: Set<string> = new Set();

for (const [name, importName] of externalModules) {
  assert.ok(importName);
  const computedImportName = importName.startsWith('remirror/')
    ? pascalCase(`sub-${importName}`)
    : pascalCase(importName);
  manualModules.add(`${JSON.stringify(name)}: ${computedImportName}`);
  importDeclarations.add(`import * as ${computedImportName} from '${importName}';`);
}

/**
 * Generate the code strings which should be used to create the files for the
 * `../src/generated` folder.
 */
async function generateCode(props: ImportGroups) {
  log.debug('\nGenerating the playground code.');
  const { extensions, presets, core, react, unscoped, pm } = props;
  const importGroups: PackageModuleMeta[] = [
    ...Object.values(pm),
    ...Object.values(core),
    ...Object.values(extensions),
    ...Object.values(presets),
    ...Object.values(react),
    ...Object.values(unscoped),
  ];

  // Set up the containers for the data that will be used to populate the
  // templates returned from this function.
  const scopedModules: string[] = [];
  const reactScopedModules: string[] = [];
  const unscopedModules: string[] = [];
  const dtsCache: DtsCache = {};

  // Load other required libraries.
  await preloadRequiredLibraries(dtsCache);

  for (const meta of importGroups) {
    const declarations = meta.declarations[meta.name];
    assert.ok(declarations);
    // Update the `*.d.ts` cache which will be added on the front end to provide
    // intellisense for users of the playground.
    dtsCache[meta.name] = declarations;

    const isScoped = remirrorPackageNames.includes(meta.name);
    const isReactScoped = remirrorReactPackageNames.includes(meta.name);

    if (isScoped) {
      // Add the scoped module to the exported object.
      scopedModules.push(
        `${JSON.stringify(meta.name)}: PlaygroundImports[${JSON.stringify(meta.name)}]`,
      );
    } else if (isReactScoped) {
      // Add the scoped module to the exported object.
      reactScopedModules.push(
        `${JSON.stringify(meta.name)}: ReactPlaygroundImports[${JSON.stringify(meta.name)}]`,
      );
    } else {
      // Store the required imports.
      importDeclarations.add(`import * as ${pascalCase(meta.name)} from '${meta.name}';`);

      // Add the unscoped module to the exported object.
      unscopedModules.push(`${JSON.stringify(meta.name)}: ${pascalCase(meta.name)}`);
    }
  }

  const externalArray = [...EXTERNAL_MODULES];

  // Check for any un-imported packages.
  for (const key of Object.keys(dtsCache)) {
    externalArray
      .filter((value) => value.startsWith(`${key}/`) || value.length <= 2 || value === key)
      .forEach((value) => EXTERNAL_MODULES.delete(value));
  }

  if (EXTERNAL_MODULES.size > 0) {
    log.warn(
      `The following modules are imported and require definition (*.d.ts) files:\n\n - ${[
        ...EXTERNAL_MODULES,
      ]}`,
    );
  } else {
    log.info(0, 'missing *.d.ts modules found');
  }

  const dtsJson = `${JSON.stringify(
    {
      AUTO_GENERATED: 'DO NOT EDIT',
      packageNames: Object.keys(dtsCache),
      dtsCache,
    },
    null,
    2,
  )}`;

  const modules = `\
/**
 * @module
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see \`support/scripts/src/playground.ts\`
 */

${[...importDeclarations].join('\n')}
import { PlaygroundImports } from 'remirror/playground';
import { ReactPlaygroundImports } from '@remirror/react/playground';

import { INTERNAL_MODULE_PREFIX } from '../playground-constants';
import { ImportMap, ImportMapImports } from '../playground-types';

/**
 * Create the import cache for all internal imports available in the playground.
 */
export const IMPORT_CACHE_MODULES: Record<string, any> = {
  // Automated scoped modules.
  ${scopedModules.join(',\n  ')},

  // Automated react scoped modules
  ${reactScopedModules.join(',\n  ')},

  // Automated internal unscoped modules.
  ${unscopedModules.join(',\n  ')},

  // Manual modules.
  ${[...manualModules].join(',\n  ')},
};

const imports: ImportMapImports = {}

for (const name of Object.keys(IMPORT_CACHE_MODULES)) {
  imports[name] = INTERNAL_MODULE_PREFIX + name;
}

export const IMPORT_MAP: ImportMap = { imports };
`;

  const meta = `\
/**
 * @module
 *
 * Provides the module meta data for internal modules.
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see \`support/scripts/src/playground.ts\`
 *
 */

import { loadJson } from 'json.macro';

// Use a babel macro to load the json file.
const packageNames = loadJson<string[]>('./dts.json', 'packageNames');

/**
 * The packages which have types already provided for them.
 */
export const DTS_MODULE_NAMES: Set<string> = new Set(packageNames);

/**
 * The names and exports of the internally created modules.
 */
export const INTERNAL_MODULE_META: Array<{ moduleName: string, exports: string[] }> = [
 ${importGroups
   .map((meta) => JSON.stringify({ moduleName: meta.name, exports: meta.exports }, null, 2))
   .join(',\n  ')}
];

/**
 * The names of external modules.
 */
export const EXTERNAL_MODULE_META: string[] = ${JSON.stringify(
    externalModules.map(([name]) => name),
    null,
    2,
  )}
`;

  const exports = `\
  /**
 * @module
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see \`support/scripts/src/playground.ts\`
 */

import { loadJson } from 'json.macro';

import type { DtsCache } from '../playground-types';

// Use a babel macro to load the json file.
const dtsCache = loadJson<DtsCache>('./dts.json', 'dtsCache');

/**
 * The pre populated cache of definition files.
 */
export const DTS_CACHE: DtsCache = dtsCache;
`;

  const playground = `\
/**
 * @module
 *
 * This is an internal module which is only used for the playground. The purpose
 * is to provide all the scoped remirror packages to the playground without
 * needing to import them all within the \`@remirror/playground\`.
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see \`support/scripts/src/generate-playground.ts\`
 */

${remirrorPackageNames.map((name) => `import * as ${camelCase(name)} from '${name}';`).join('\n')}

export const PlaygroundImports = {
  ${remirrorPackageNames.map((name) => `'${name}': ${camelCase(name)},`).join('\n')}
} as const;
`;

  const reactPlayground = `\
/**
 * @module
 *
 * This is an internal module which is only used for the playground. The purpose
 * is to provide all the scoped remirror packages to the playground without
 * needing to import them all within the \`@remirror/playground\`.
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see \`support/scripts/src/generate-playground.ts\`
 */

import type { ComponentType } from 'react';

${remirrorReactPackageNames
  .map((name) => `import * as ${camelCase(name)} from '${name}';`)
  .join('\n')}

export const ReactPlaygroundImports = {
  ${remirrorReactPackageNames.map((name) => `'${name}': ${camelCase(name)},`).join('\n')}
} as const;

export interface PlaygroundExportProps {
  /**
   * Use this component to add a debugger to the rendered editor.
   */
  DebugComponent: ComponentType<{ name?: string }>;
}
`;

  return {
    meta,
    /** The require statements fo required libraries. */
    modules,
    /** JSON objects for the `*.d.ts` files for each module. */
    dtsJson,
    /** The exports the created `json` file via `babel-plugin-macro`. */
    exports,
    /** The playground exports in `remirror/playground` */
    playground,
    /** The playground exports in `@remirror/react/playground` */
    reactPlayground,
  };
}

// Where the generated file will be located.
const generatedFolder = baseDir('packages', 'remirror__playground', 'src', 'generated');
const modulesPath = path.join(generatedFolder, 'modules.ts');
const jsonPath = path.join(generatedFolder, 'dts.json');
const exportsPath = path.join(generatedFolder, 'exports.ts');
const metaPath = path.join(generatedFolder, 'meta.ts');
const playgroundPath = path.join(packagesFolder, 'remirror', 'src', 'playground.ts');
const reactPlaygroundPath = path.join(packagesFolder, 'remirror__react', 'src', 'playground.ts');

interface FileFormatterConfig {
  contents: string;
  filepath: string;
  parser?: 'json' | 'typescript';
}

/**
 * Format and write the files to the intended location.
 */
async function formatAndWriteFiles(files: FileFormatterConfig[]) {
  const prettierConfig = await resolveConfig(generatedFolder);
  const filesToFormat: string[] = [];

  const filePromises = files.map(({ filepath, parser = 'typescript', contents }) => {
    contents = format(contents, { filepath, parser, ...prettierConfig });

    if (parser === 'typescript') {
      filesToFormat.push(filepath);
    }

    return fs.writeFile(filepath, contents);
  });

  log.debug('\nGenerating the files.');

  // Write to the formatted code to the output path for consumption by the rest
  // of the playground.
  await Promise.all(filePromises);

  log.debug(
    'Linting generated files',
    filesToFormat.map((filepath) => path.relative(process.cwd(), filepath)).join('\n'),
  );

  // Run eslint on the files.
  await formatFiles(filesToFormat.join(' '), { formatter: 'eslint', silent: true });
}

/**
 * This will throw an error when the `pnpm build` has not been run prior to this script.
 */
async function ensureActiveBuild() {
  const stat = await getFileStat(
    path.join(packagesFolder, 'remirror__core', 'dist', 'declarations', 'src', 'index.d.ts'),
  );

  invariant(stat?.isFile(), {
    disableLogging: true,
    message:
      'The build must be run before attempting to generate the playground files.\n\nPlease run `pnpm build` to resolve this issue.',
  });

  log.debug('\nThere is an active build available.');
}

/**
 * Grab any import/requires from inside the code and make a list of its
 * dependencies.
 *
 * @param sourceCode - the source of the definition file.
 *
 * @returns all unique matches found.
 */
function parseFileForModuleReferences(sourceCode: string): string[] {
  // Track all the unique modules found so far.
  const foundModules = new Set<string>();

  // Regex used to test for a `require` module reference -
  // https://regex101.com/r/Jxa3KX/4
  const requirePattern = /(const|let|var)(.|\n)*? require\(('|")(.*)('|")\);?$/gm;

  // Regex used to test for `imports` module reference -
  // https://regex101.com/r/hdEpzO/4
  const es6Pattern =
    /(import|export)((?!from)(?!require)(.|\n))*?(from|require\()\s?('|")(.*)('|")\)?;?$/gm;

  // Regex used to test for only es6 imports - https://regex101.com/r/hdEpzO/6
  const es6ImportOnly = /import\s?('|")(.*)('|")\)?;?/gm;

  // Find all matches and add to the set.
  findMatches(sourceCode, es6Pattern).forEach((match) => match[6] && foundModules.add(match[6]));
  findMatches(sourceCode, requirePattern).forEach(
    (match) => match[5] && foundModules.add(match[5]),
  );
  findMatches(sourceCode, es6ImportOnly).forEach((match) => match[2] && foundModules.add(match[2]));

  return [...foundModules];
}

/**
 * The disallowed strings.
 */
const packagesToIgnore = [
  /^\./,
  /^@?remirror(?:$|\/)/,
  /^multishift$/,
  /^prosemirror-/,
  /^react$/,
  /^react-dom$/,
  /^api$/,
  /^prop-types$/,
  /^js-cookie$/,
  /^@babel\/core$/,
];

/**
 * Check if the start of a package is disallowed from being loaded.
 */
function isDisallowed(name: string): boolean {
  return packagesToIgnore.some((regex) => regex.test(name));
}

/**
 * This is the function run when the script is called, as is convention in other
 * languages.
 */
async function main() {
  await ensureActiveBuild();

  const pm = await populateRemirrorImports({
    pattern: 'pm/package.json',
  });

  const extensions = await populateRemirrorImports({
    pattern: 'remirror__extension-*/package.json',
    excludedNames: ['@remirror/extension-react-native-bridge'],
  });

  const presets = await populateRemirrorImports({
    pattern: 'remirror__preset-*/package.json',
  });

  const core = await populateRemirrorImports({
    pattern: 'remirror__{core-*,core,types}/package.json',
  });

  const react = await populateRemirrorImports({
    excludedNames: ['@remirror/react-native'],
    pattern: 'remirror__{react-*,react}/package.json',
  });

  const unscoped = await populateRemirrorImports({
    excludedNames: ['jest-prosemirror', 'jest-remirror', 'a11y-status', 'test-keyboard'],
    pattern: '{a11y-status,create-context-state,multishift,prosemirror-*,remirror}/package.json',
  });

  // Generate the code from the importGroups.
  const {
    exports,
    dtsJson: json,
    modules,
    meta,
    playground,
    reactPlayground,
  } = await generateCode({
    pm,
    extensions,
    presets,
    core,
    react,
    unscoped,
  });

  // Write the files to the intended location.
  await formatAndWriteFiles([
    { contents: meta, filepath: metaPath },
    { contents: exports, filepath: exportsPath },
    { contents: modules, filepath: modulesPath },
    { contents: playground, filepath: playgroundPath },
    { contents: reactPlayground, filepath: reactPlaygroundPath },
    { contents: json, filepath: jsonPath, parser: 'json' },
  ]);

  log.info('Successfully created the playground imports');
}

// Run the script and listen for any errors.
main().catch((error) => {
  log.prettyError(error);
  log.fatal('Something went wrong while running the `generate:playground` playground script');
  // log.prettyError(error);
  process.exit(1);
});
