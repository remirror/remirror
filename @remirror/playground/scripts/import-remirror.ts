import { promises as fsp } from 'fs';
import { resolve } from 'path';

type Meta = any;

async function scanImportsFrom<T>(
  sourceDir: string,
  sourceModulePath: string,
  callback: (meta: Meta) => Promise<T>,
): Promise<{ [folderName: string]: T }> {
  const result: { [folderName: string]: T } = {};
  const folders = await fsp.readdir(sourceDir);
  for (const folder of folders) {
    const path = `${sourceDir}/${folder}`;
    const packageJson = require(`${path}/package.json`);
    const mainPath = resolve(path, packageJson.main);
    const mod = require(mainPath);
    const meta = {
      name: `${sourceModulePath}/${folder}`,
      exports: Object.keys(mod),
    };
    result[folder] = await callback(meta);
  }
  return result;
}

async function importExtension(meta: Meta) {
  return meta;
}
async function importPreset(meta: Meta) {
  return meta;
}

function template() {
  return `\
/******************************************************************************\\
*                                                                              *
*                       THIS FILE IS AUTO-GENERATED                            *
*                                                                              *
*           See @remirror/playground/scripts/import-remirror.ts.               *
*                                                                              *
\\******************************************************************************/


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as babelRuntimeHelpersInteropRequireDefault from '@babel/runtime/helpers/interopRequireDefault';
import { useRemirrorPlayground } from './use-remirror-playground';
import * as remirrorCore from 'remirror/core';
import { RemirrorProvider, useExtension, useManager, useRemirror } from '@remirror/react';
import * as React from 'react';

const remirrorReact = { RemirrorProvider, useManager, useExtension, useRemirror };

// Hack it so ESModule imports and CommonJS both work
babelRuntimeHelpersInteropRequireDefault.default.default =
  babelRuntimeHelpersInteropRequireDefault.default;

export const knownRequires: { [moduleName: string]: any } = {
  '@babel/runtime/helpers/interopRequireDefault': babelRuntimeHelpersInteropRequireDefault.default,
  // '@remirror/core-extensions': remirrorCoreExtensions,
  remirror: require('remirror'),
  'remirror/extension/doc': require('remirror/extension/doc'),
  'remirror/extension/text': require('remirror/extension/text'),
  'remirror/extension/paragraph': require('remirror/extension/paragraph'),
  'remirror/extension/bold': require('remirror/extension/bold'),
  'remirror/extension/italic': require('remirror/extension/italic'),
  'remirror/react': remirrorReact,
  'remirror/core': remirrorCore,
  '@remirror/playground': { useRemirrorPlayground },
  //remirror: remirror,
  react: { default: React, ...React },
};
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
  const everything = {
    extensions,
    presets,
  };
  console.dir(everything, { depth: 6 });
  const code = template();
  await fsp.writeFile(`${__dirname}/../src/_remirror.tsx`, code);
}

main().catch((error) => {
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
