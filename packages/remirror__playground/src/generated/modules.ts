/**
 * @module
 *
 * DO NOT EDIT: AUTO-GENERATED FILE
 * @see `support/scripts/src/playground.ts`
 */

import * as CreateContextState from 'create-context-state';
import * as Multishift from 'multishift';
import * as ProsemirrorPasteRules from 'prosemirror-paste-rules';
import * as ProsemirrorResizableView from 'prosemirror-resizable-view';
import * as ProsemirrorSuggest from 'prosemirror-suggest';
import * as ProsemirrorTrailingNode from 'prosemirror-trailing-node';
import * as React from 'react';
import * as ReactJsxDevRuntime from 'react/jsx-dev-runtime';
import * as ReactJsxRuntime from 'react/jsx-runtime';
import * as ReactDom from 'react-dom';
import * as Remirror from 'remirror';
import * as SubRemirrorDom from 'remirror/dom';
import * as SubRemirrorExtensions from 'remirror/extensions';
import { PlaygroundImports } from 'remirror/playground';
import * as RemirrorDev from '@remirror/dev';
import * as RemirrorPm from '@remirror/pm';
import * as RemirrorPmDropcursor from '@remirror/pm/dropcursor';
import * as RemirrorPmGapcursor from '@remirror/pm/gapcursor';
import * as RemirrorPmHistory from '@remirror/pm/history';
import * as RemirrorPmInputrules from '@remirror/pm/inputrules';
import * as RemirrorPmKeymap from '@remirror/pm/keymap';
import * as RemirrorPmModel from '@remirror/pm/model';
import * as RemirrorPmPasteRules from '@remirror/pm/paste-rules';
import * as RemirrorPmSchemaList from '@remirror/pm/schema-list';
import * as RemirrorPmState from '@remirror/pm/state';
import * as RemirrorPmSuggest from '@remirror/pm/suggest';
import * as RemirrorPmTables from '@remirror/pm/tables';
import * as RemirrorPmTrailingNode from '@remirror/pm/trailing-node';
import * as RemirrorPmTransform from '@remirror/pm/transform';
import * as RemirrorPmView from '@remirror/pm/view';
import * as RemirrorReact from '@remirror/react';
import { ReactPlaygroundImports } from '@remirror/react/playground';
import * as RemirrorReactDebugger from '@remirror/react-debugger';
import * as RemirrorReactEditors from '@remirror/react-editors';
import * as RemirrorTypes from '@remirror/types';

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
  '@remirror/extension-image': PlaygroundImports['@remirror/extension-image'],
  '@remirror/extension-italic': PlaygroundImports['@remirror/extension-italic'],
  '@remirror/extension-link': PlaygroundImports['@remirror/extension-link'],
  '@remirror/extension-list': PlaygroundImports['@remirror/extension-list'],
  '@remirror/extension-markdown': PlaygroundImports['@remirror/extension-markdown'],
  '@remirror/extension-mention': PlaygroundImports['@remirror/extension-mention'],
  '@remirror/extension-mention-atom': PlaygroundImports['@remirror/extension-mention-atom'],
  '@remirror/extension-node-formatting': PlaygroundImports['@remirror/extension-node-formatting'],
  '@remirror/extension-paragraph': PlaygroundImports['@remirror/extension-paragraph'],
  '@remirror/extension-placeholder': PlaygroundImports['@remirror/extension-placeholder'],
  '@remirror/extension-positioner': PlaygroundImports['@remirror/extension-positioner'],
  '@remirror/extension-search': PlaygroundImports['@remirror/extension-search'],
  '@remirror/extension-strike': PlaygroundImports['@remirror/extension-strike'],
  '@remirror/extension-sub': PlaygroundImports['@remirror/extension-sub'],
  '@remirror/extension-sup': PlaygroundImports['@remirror/extension-sup'],
  '@remirror/extension-tables': PlaygroundImports['@remirror/extension-tables'],
  '@remirror/extension-text': PlaygroundImports['@remirror/extension-text'],
  '@remirror/extension-text-case': PlaygroundImports['@remirror/extension-text-case'],
  '@remirror/extension-text-color': PlaygroundImports['@remirror/extension-text-color'],
  '@remirror/extension-text-highlight': PlaygroundImports['@remirror/extension-text-highlight'],
  '@remirror/extension-trailing-node': PlaygroundImports['@remirror/extension-trailing-node'],
  '@remirror/extension-underline': PlaygroundImports['@remirror/extension-underline'],
  '@remirror/extension-whitespace': PlaygroundImports['@remirror/extension-whitespace'],
  '@remirror/extension-yjs': PlaygroundImports['@remirror/extension-yjs'],
  '@remirror/preset-core': PlaygroundImports['@remirror/preset-core'],
  '@remirror/preset-formatting': PlaygroundImports['@remirror/preset-formatting'],
  '@remirror/preset-wysiwyg': PlaygroundImports['@remirror/preset-wysiwyg'],

  // Automated react scoped modules
  '@remirror/extension-react-component':
    ReactPlaygroundImports['@remirror/extension-react-component'],
  '@remirror/extension-react-ssr': ReactPlaygroundImports['@remirror/extension-react-ssr'],
  '@remirror/extension-react-tables': ReactPlaygroundImports['@remirror/extension-react-tables'],
  '@remirror/preset-react': ReactPlaygroundImports['@remirror/preset-react'],
  '@remirror/react-components': ReactPlaygroundImports['@remirror/react-components'],
  '@remirror/react-core': ReactPlaygroundImports['@remirror/react-core'],
  '@remirror/react-hooks': ReactPlaygroundImports['@remirror/react-hooks'],
  '@remirror/react-renderer': ReactPlaygroundImports['@remirror/react-renderer'],
  '@remirror/react-ssr': ReactPlaygroundImports['@remirror/react-ssr'],
  '@remirror/react-utils': ReactPlaygroundImports['@remirror/react-utils'],

  // Automated internal unscoped modules.
  '@remirror/types': RemirrorTypes,
  '@remirror/react': RemirrorReact,
  '@remirror/react-debugger': RemirrorReactDebugger,
  '@remirror/react-editors': RemirrorReactEditors,
  'create-context-state': CreateContextState,
  multishift: Multishift,
  'prosemirror-paste-rules': ProsemirrorPasteRules,
  'prosemirror-resizable-view': ProsemirrorResizableView,
  'prosemirror-suggest': ProsemirrorSuggest,
  'prosemirror-trailing-node': ProsemirrorTrailingNode,
  remirror: Remirror,

  // Manual modules.
  '@remirror/pm': RemirrorPm,
  '@remirror/dev': RemirrorDev,
  'remirror/extensions': SubRemirrorExtensions,
  'remirror/dom': SubRemirrorDom,
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
  '@remirror/pm/dropcursor': RemirrorPmDropcursor,
  '@remirror/pm/gapcursor': RemirrorPmGapcursor,
  '@remirror/pm/history': RemirrorPmHistory,
  '@remirror/pm/inputrules': RemirrorPmInputrules,
  '@remirror/pm/keymap': RemirrorPmKeymap,
  '@remirror/pm/model': RemirrorPmModel,
  '@remirror/pm/schema-list': RemirrorPmSchemaList,
  '@remirror/pm/state': RemirrorPmState,
  '@remirror/pm/tables': RemirrorPmTables,
  '@remirror/pm/transform': RemirrorPmTransform,
  '@remirror/pm/view': RemirrorPmView,
  '@remirror/pm/suggest': RemirrorPmSuggest,
  '@remirror/pm/paste-rules': RemirrorPmPasteRules,
  '@remirror/pm/trailing-node': RemirrorPmTrailingNode,
};

const imports: ImportMapImports = {};

for (const name of Object.keys(IMPORT_CACHE_MODULES)) {
  imports[name] = INTERNAL_MODULE_PREFIX + name;
}

export const IMPORT_MAP: ImportMap = { imports };
