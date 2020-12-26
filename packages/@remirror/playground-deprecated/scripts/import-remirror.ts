import chalk from 'chalk';
import { constants, promises as fsp } from 'fs';
import { resolve } from 'path';
import * as prettier from 'prettier';

console.log(chalk`{grey Updating playground imports... }\n`);

async function scanImportsFrom<T extends RemirrorModuleMeta>(
  sourceDir: string,
  sourceModulePath: string,
  callback: (meta: RemirrorModuleMeta) => Promise<T>,
): Promise<{ [key: string]: T }> {
  const result: { [key: string]: T } = {};
  const folders = await fsp.readdir(sourceDir);

  for (const folder of folders) {
    const path = `${sourceDir}/${folder}`;
    const packageJsonPath = `${path}/package.json`;

    try {
      await fsp.access(packageJsonPath, constants.R_OK);
    } catch {
      console.warn(`Could not find ${packageJsonPath}`);
      continue;
    }

    const packageJson = require(packageJsonPath);
    const mainPath = resolve(path, packageJson.main);
    try {
      await fsp.access(mainPath, constants.R_OK);
    } catch {
      console.warn(`Could not find ${mainPath} ("main" according to ${packageJsonPath})`);
      continue;
    }
    const mod = require(mainPath);
    const meta: RemirrorModuleMeta = {
      name: `${sourceModulePath}/${folder}`,
      exports: Object.keys(mod),
    };

    result[folder] = await callback(meta);
  }

  return result;
}

async function importExtension(meta: RemirrorModuleMeta) {
  return meta;
}

async function importPreset(meta: RemirrorModuleMeta) {
  return meta;
}

interface RemirrorModuleMeta {
  name: string;
  exports: string[];
}

interface RemirrorModuleMap {
  [key: string]: RemirrorModuleMeta;
}

interface Everything {
  extensions: RemirrorModuleMap;
  presets: RemirrorModuleMap;
}

function template({ extensions, presets }: Everything) {
  // import * as remirrorCore from 'remirror';
  // 'remirror': remirrorCore,

  const extensionsAndPresets: RemirrorModuleMeta[] = [
    ...Object.values(extensions),
    ...Object.values(presets),
  ];
  const imports = extensionsAndPresets.map((meta) => {
    return `${JSON.stringify(meta.name)}: require(${JSON.stringify(meta.name)})`;
  });

  return `\
/******************************************************************************\\
*                                                                              *
*                       THIS FILE IS AUTO-GENERATED                            *
*                                                                              *
*           See @remirror/playground/scripts/import-remirror.ts.               *
*                                                                              *
\\******************************************************************************/

import { useRemirrorPlayground } from './use-remirror-playground';

export const IMPORT_CACHE: { [moduleName: string]: any } = {
  // Auto-imported
  ${imports.join(',\n  ')},

  // Manually -imported
  remirror: require('remirror'),
  'remirror': require('remirror'),
  'remirror/react': require('remirror/react'),
  'remirror/react': require('remirror/react'),
  'remirror/react': require('remirror/react'),
  'remirror/react': require('remirror/react'),
  '@remirror/dev': require('@remirror/dev'),
  '@remirror/playground': { useRemirrorPlayground },
  '@remirror/pm/commands': require('@remirror/pm/commands'),
  '@remirror/pm/dropcursor': require('@remirror/pm/dropcursor'),
  '@remirror/pm/gapcursor': require('@remirror/pm/gapcursor'),
  '@remirror/pm/history': require('@remirror/pm/history'),
  '@remirror/pm/inputrules': require('@remirror/pm/inputrules'),
  '@remirror/pm/keymap': require('@remirror/pm/keymap'),
  '@remirror/pm/model': require('@remirror/pm/model'),
  '@remirror/pm/schema-list': require('@remirror/pm/schema-list'),
  '@remirror/pm/state': require('@remirror/pm/state'),
  '@remirror/pm/suggest': require('@remirror/pm/suggest'),
  '@remirror/pm/tables': require('@remirror/pm/tables'),
  '@remirror/pm/transform': require('@remirror/pm/transform'),
  '@remirror/pm/view': require('@remirror/pm/view'),

  // External dependencies
  '@babel/runtime/helpers/interopRequireDefault': require('@babel/runtime/helpers/interopRequireDefault'),
  '@babel/runtime/helpers/interopRequireWildcard': require('@babel/runtime/helpers/interopRequireWildcard'),
  '@babel/runtime/helpers/slicedToArray': require('@babel/runtime/helpers/slicedToArray'),
  '@babel/runtime/helpers/createClass': require('@babel/runtime/helpers/createClass'),
  '@babel/runtime/helpers/possibleConstructorReturn': require('@babel/runtime/helpers/possibleConstructorReturn'),
  '@babel/runtime/helpers/extends': require('@babel/runtime/helpers/extends'),
  '@babel/runtime/helpers/assertThisInitialized': require('@babel/runtime/helpers/assertThisInitialized'),
  '@babel/runtime/helpers/classCallCheck': require('@babel/runtime/helpers/classCallCheck'),
  '@babel/runtime/helpers/inherits': require('@babel/runtime/helpers/inherits'),
  '@babel/runtime/helpers/defineProperty': require('@babel/runtime/helpers/defineProperty'),
  react: require('react'),
  'react-dom': require('react-dom'),
  'react-dom/server': require('react-dom/server'),
};

export const INTERNAL_MODULES: Array<{ moduleName: string, exports: string[] }> = [
  ${extensionsAndPresets
    .map((meta) => JSON.stringify({ moduleName: meta.name, exports: meta.exports }, null, 2))
    .join(',\n  ')}
];
`;
}

function forceTermination() {
  const timeout = global.setTimeout(() => {
    console.log(
      chalk`{yellow Look, I'm just a script, and far be it for me to tell you your job, dear human, but it seems to me that something has been keeping me alive for the last 5,000,000 nanoseconds (which feels like an eternity to me) since I completed my task. Maybe something opened a network connection? Who knows. Either way, it doesn't seem right, so I'm going to go ahead and exit. }`,
    );
    process.exit(0);
  }, 5000);

  timeout.unref();
  console.log(chalk`{green Successfully created playground imports}\n`);
}

async function main() {
  // TODO: rewrite this to walk everything inside `packages/remirror`; ignore
  // `dist` and `src; populate `execute.ts`'s `knownRequires` and handle the
  // TypeScript definitions.
  const extensions = await scanImportsFrom(
    `${__dirname}/../../../remirror/extension`,
    'remirror/extensions',
    importExtension,
  );
  const presets = await scanImportsFrom(
    `${__dirname}/../../../remirror/preset`,
    'remirror/extensions',
    importPreset,
  );
  const everything: Everything = {
    extensions,
    presets,
  };
  const code = template(everything);
  // TODO: prettier
  const filepath = `${__dirname}/../src/_remirror.tsx`;
  await fsp.writeFile(
    filepath,
    prettier.format(code, {
      filepath,
      parser: 'typescript',
      ...(await prettier.resolveConfig(filepath)),
    }),
  );
  forceTermination();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
