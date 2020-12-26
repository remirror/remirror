/**
 * @module
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see `support/scripts/playground.ts`
 */

import * as Multishift from 'multishift';
import * as ProsemirrorPasteRules from 'prosemirror-paste-rules';
import * as ProsemirrorSuggest from 'prosemirror-suggest';
import * as ProsemirrorTrailingNode from 'prosemirror-trailing-node';
import * as React from 'react';
import * as ReactJsxDevRuntime from 'react/jsx-dev-runtime';
import * as ReactJsxRuntime from 'react/jsx-runtime';
import * as ReactDom from 'react-dom';
import * as Remirror from 'remirror';
import * as SubRemirrorDom from 'remirror/dom';
import * as SubRemirrorExtensions from 'remirror/extensions';
import PlaygroundImports from 'remirror/playground';
import * as SubRemirrorReact from 'remirror/react';

import * as RemirrorDev from '@remirror/dev';
import * as RemirrorPm from '@remirror/pm';
import * as RemirrorPmDropcursor from '@remirror/pm/dropcursor';
import * as RemirrorPmGapcursor from '@remirror/pm/gapcursor';
import * as RemirrorPmHistory from '@remirror/pm/history';
import * as RemirrorPmInputrules from '@remirror/pm/inputrules';
import * as RemirrorPmKeymap from '@remirror/pm/keymap';
import * as RemirrorPmModel from '@remirror/pm/model';
import * as RemirrorPmSchemaList from '@remirror/pm/schema-list';
import * as RemirrorPmState from '@remirror/pm/state';
import * as RemirrorPmTables from '@remirror/pm/tables';
import * as RemirrorPmTransform from '@remirror/pm/transform';
import * as RemirrorPmView from '@remirror/pm/view';

import * as CreateContextHook from '../create-context-state';
import { INTERNAL_MODULE_PREFIX } from '../playground-constants';
import { ImportMap, ImportMapImports } from '../playground-types';

/**
 * Create the import cache for all internal imports available in the playground.
 */
export const IMPORT_CACHE_MODULES: Record<string, any> = {
  // Automated scoped modules.
  '@remirror/core': PlaygroundImports['@remirror/core'],
  '@remirror/core-constants': PlaygroundImports['@remirror/core-constants'],
  '@remirror/core-helpers': PlaygroundImports['@remirror/core-helpers'],
  '@remirror/core-types': PlaygroundImports['@remirror/core-types'],
  '@remirror/core-utils': PlaygroundImports['@remirror/core-utils'],
  '@remirror/extension-annotation': PlaygroundImports['@remirror/extension-annotation'],
  '@remirror/extension-bidi': PlaygroundImports['@remirror/extension-bidi'],
  '@remirror/extension-blockquote': PlaygroundImports['@remirror/extension-blockquote'],
  '@remirror/extension-bold': PlaygroundImports['@remirror/extension-bold'],
  '@remirror/extension-callout': PlaygroundImports['@remirror/extension-callout'],
  '@remirror/extension-code': PlaygroundImports['@remirror/extension-code'],
  '@remirror/extension-code-block': PlaygroundImports['@remirror/extension-code-block'],
  '@remirror/extension-codemirror5': PlaygroundImports['@remirror/extension-codemirror5'],
  '@remirror/extension-collaboration': PlaygroundImports['@remirror/extension-collaboration'],
  '@remirror/extension-columns': PlaygroundImports['@remirror/extension-columns'],
  '@remirror/extension-diff': PlaygroundImports['@remirror/extension-diff'],
  '@remirror/extension-doc': PlaygroundImports['@remirror/extension-doc'],
  '@remirror/extension-drop-cursor': PlaygroundImports['@remirror/extension-drop-cursor'],
  '@remirror/extension-embed': PlaygroundImports['@remirror/extension-embed'],
  '@remirror/extension-emoji': PlaygroundImports['@remirror/extension-emoji'],
  '@remirror/extension-epic-mode': PlaygroundImports['@remirror/extension-epic-mode'],
  '@remirror/extension-events': PlaygroundImports['@remirror/extension-events'],
  '@remirror/extension-font-family': PlaygroundImports['@remirror/extension-font-family'],
  '@remirror/extension-font-size': PlaygroundImports['@remirror/extension-font-size'],
  '@remirror/extension-gap-cursor': PlaygroundImports['@remirror/extension-gap-cursor'],
  '@remirror/extension-hard-break': PlaygroundImports['@remirror/extension-hard-break'],
  '@remirror/extension-heading': PlaygroundImports['@remirror/extension-heading'],
  '@remirror/extension-history': PlaygroundImports['@remirror/extension-history'],
  '@remirror/extension-horizontal-rule': PlaygroundImports['@remirror/extension-horizontal-rule'],
  '@remirror/extension-html': PlaygroundImports['@remirror/extension-html'],
  '@remirror/extension-icons': PlaygroundImports['@remirror/extension-icons'],
  '@remirror/extension-image': PlaygroundImports['@remirror/extension-image'],
  '@remirror/extension-italic': PlaygroundImports['@remirror/extension-italic'],
  '@remirror/extension-link': PlaygroundImports['@remirror/extension-link'],
  '@remirror/extension-list': PlaygroundImports['@remirror/extension-list'],
  '@remirror/extension-markdown': PlaygroundImports['@remirror/extension-markdown'],
  '@remirror/extension-media': PlaygroundImports['@remirror/extension-media'],
  '@remirror/extension-mention': PlaygroundImports['@remirror/extension-mention'],
  '@remirror/extension-mention-atom': PlaygroundImports['@remirror/extension-mention-atom'],
  '@remirror/extension-native-bridge': PlaygroundImports['@remirror/extension-native-bridge'],
  '@remirror/extension-node-formatting': PlaygroundImports['@remirror/extension-node-formatting'],
  '@remirror/extension-paragraph': PlaygroundImports['@remirror/extension-paragraph'],
  '@remirror/extension-placeholder': PlaygroundImports['@remirror/extension-placeholder'],
  '@remirror/extension-positioner': PlaygroundImports['@remirror/extension-positioner'],
  '@remirror/extension-react-component': PlaygroundImports['@remirror/extension-react-component'],
  '@remirror/extension-react-ssr': PlaygroundImports['@remirror/extension-react-ssr'],
  '@remirror/extension-search': PlaygroundImports['@remirror/extension-search'],
  '@remirror/extension-strike': PlaygroundImports['@remirror/extension-strike'],
  '@remirror/extension-sub': PlaygroundImports['@remirror/extension-sub'],
  '@remirror/extension-sup': PlaygroundImports['@remirror/extension-sup'],
  '@remirror/extension-tables': PlaygroundImports['@remirror/extension-tables'],
  '@remirror/extension-text': PlaygroundImports['@remirror/extension-text'],
  '@remirror/extension-text-case': PlaygroundImports['@remirror/extension-text-case'],
  '@remirror/extension-text-color': PlaygroundImports['@remirror/extension-text-color'],
  '@remirror/extension-text-highlight': PlaygroundImports['@remirror/extension-text-highlight'],
  '@remirror/extension-text-wrap': PlaygroundImports['@remirror/extension-text-wrap'],
  '@remirror/extension-trailing-node': PlaygroundImports['@remirror/extension-trailing-node'],
  '@remirror/extension-underline': PlaygroundImports['@remirror/extension-underline'],
  '@remirror/extension-whitespace': PlaygroundImports['@remirror/extension-whitespace'],
  '@remirror/extension-yjs': PlaygroundImports['@remirror/extension-yjs'],
  '@remirror/preset-core': PlaygroundImports['@remirror/preset-core'],
  '@remirror/preset-formatting': PlaygroundImports['@remirror/preset-formatting'],
  '@remirror/preset-react': PlaygroundImports['@remirror/preset-react'],
  '@remirror/preset-social': PlaygroundImports['@remirror/preset-social'],
  '@remirror/preset-wysiwyg': PlaygroundImports['@remirror/preset-wysiwyg'],
  '@remirror/react': PlaygroundImports['@remirror/react'],
  '@remirror/react-components': PlaygroundImports['@remirror/react-components'],
  '@remirror/react-hooks': PlaygroundImports['@remirror/react-hooks'],
  '@remirror/react-utils': PlaygroundImports['@remirror/react-utils'],

  // Automated internal unscoped modules.
  '@remirror/pm': RemirrorPm,
  'create-context-state': CreateContextHook,
  multishift: Multishift,
  'prosemirror-paste-rules': ProsemirrorPasteRules,
  'prosemirror-suggest': ProsemirrorSuggest,
  'prosemirror-trailing-node': ProsemirrorTrailingNode,
  remirror: Remirror,

  // Manual modules.
  '@remirror/dev': RemirrorDev,
  'remirror/extensions': SubRemirrorExtensions,
  'remirror/dom': SubRemirrorDom,
  'remirror/react': SubRemirrorReact,
  react: React,
  'react/jsx-runtime': ReactJsxRuntime,
  'react/jsx-dev-runtime': ReactJsxDevRuntime,
  'react-dom': ReactDom,
  'prosemirror-dropcursor': RemirrorPmDropcursor,
  'prosemirror-gapcursor': RemirrorPmGapcursor,
  'prosemirror-history': RemirrorPmHistory,
  'prosemirror-inputrules': RemirrorPmInputrules,
  'prosemirror-keymap': RemirrorPmKeymap,
  'prosemirror-model': RemirrorPmModel,
  'prosemirror-schema-list': RemirrorPmSchemaList,
  'prosemirror-state': RemirrorPmState,
  'prosemirror-tables': RemirrorPmTables,
  'prosemirror-transform': RemirrorPmTransform,
  'prosemirror-view': RemirrorPmView,
};

const imports: ImportMapImports = {};

for (const name of Object.keys(IMPORT_CACHE_MODULES)) {
  imports[name] = INTERNAL_MODULE_PREFIX + name;
}

export const IMPORT_MAP: ImportMap = { imports };
