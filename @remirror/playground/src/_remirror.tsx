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
