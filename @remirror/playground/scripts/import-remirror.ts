import { promises as fsp } from 'fs';
import { resolve } from 'path';
import prettier from 'prettier';

async function scanImportsFrom<T extends RemirrorModuleMeta>(
  sourceDir: string,
  sourceModulePath: string,
  callback: (meta: RemirrorModuleMeta) => Promise<T>,
): Promise<{ [key: string]: T }> {
  const result: { [key: string]: T } = {};
  const folders = await fsp.readdir(sourceDir);
  for (const folder of folders) {
    const path = `${sourceDir}/${folder}`;
    const packageJson = require(`${path}/package.json`);
    const mainPath = resolve(path, packageJson.main);
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
  // import * as remirrorCore from 'remirror/core';
  // 'remirror/core': remirrorCore,

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

// Remirror custom imports
import { RemirrorProvider, useExtension, useManager, useRemirror } from '@remirror/react';
import { useRemirrorPlayground } from './use-remirror-playground';

export const IMPORT_CACHE: { [moduleName: string]: any } = {
  // Auto-imported
  ${imports.join(',\n  ')},

  // Manual-imported
  remirror: require('remirror'),
  'remirror/react': { RemirrorProvider, useManager, useExtension, useRemirror },
  '@remirror/playground': { useRemirrorPlayground },

  // External dependencies
  '@babel/runtime/helpers/interopRequireDefault': require('@babel/runtime/helpers/interopRequireDefault'),
  react: require('react'),
};

export const INTERNAL_MODULES: {moduleName: string, exports: string[]}[] = [
  ${extensionsAndPresets
    .map((meta) => JSON.stringify({ moduleName: meta.name, exports: meta.exports }, null, 2))
    .join(',\n  ')}
];
`;
}

async function main() {
  // TODO: rewrite this to walk everything inside `packages/remirror`; ignore
  // `dist` and `src; populate `execute.ts`'s `knownRequires` and handle the
  // TypeScript definitions.
  const extensions = await scanImportsFrom(
    `${__dirname}/../../../packages/remirror/extension`,
    'remirror/extension',
    importExtension,
  );
  const presets = await scanImportsFrom(
    `${__dirname}/../../../packages/remirror/preset`,
    'remirror/preset',
    importPreset,
  );
  const everything: Everything = {
    extensions,
    presets,
  };
  console.dir(everything, { depth: 6 });
  const code = template(everything);
  // TODO: prettier
  const filepath = `${__dirname}/../src/_remirror.tsx`;
  await fsp.writeFile(filepath, prettier.format(code, await prettier.resolveConfig(filepath)));
}

main().catch((error) => {
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
