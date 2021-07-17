import type { editor, languages } from 'monaco-editor';
import type { PackageJson } from '@remirror/core';

/**
 * The key used to store the internal module on the window object.
 */
export const GLOBAL_INTERNAL_MODULES = '$$__remirror_internal_modules__$$';

/**
 * All the exports from the generated playground code.
 *
 * This is the content that is exported from the `index.tsx` file.
 */
export const PLAYGROUND_EXPORTS = '$$__PlaygroundExports__$$';

/**
 * Store the debug map.
 */
export const PLAYGROUND_DEBUG = '$$__PlaygroundDebug__$$';

/**
 * The prefix used for internal modules. These are intercepted by the dynamic
 * \`importShim\` fetch handler.
 */
export const INTERNAL_MODULE_PREFIX = '/__internal__/';

/**
 * The prefix used to identify locally created es modules. These files are
 * intercepted by the dynamic `importShim` fetch handler.
 */
export const LOCAL_MODULE_PREFIX = '/__local__/';

/**
 * The package url for `ESM` imports.
 */
export const ESM_ROOT_URL = '//jspm.dev/npm:';

/**
 * The url for getting npm packages.
 */
export const NPM_ROOT_URL = 'https://cdn.jsdelivr.net/npm/';

/**
 * The root url for data look ups with npm.
 */
export const DATA_ROOT_URL = 'https://data.jsdelivr.com/v1/package/';

/**
 * The compiler options which are used for typechecking the code that is
 * entered.
 */
export const compilerOptions: languages.typescript.CompilerOptions = {
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  allowJs: true,
  strict: true,
  noImplicitAny: true,
  strictNullChecks: true,
  strictFunctionTypes: true,
  strictPropertyInitialization: true,
  strictBindCallApply: true,
  noImplicitThis: true,
  noImplicitReturns: true,
  useDefineForClassFields: false,
  alwaysStrict: true,
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  downlevelIteration: false,
  noEmitHelpers: false,
  noLib: false,
  noStrictGenericChecks: false,
  noUnusedLocals: false,
  noUnusedParameters: false,
  preserveConstEnums: false,
  removeComments: false,
  skipLibCheck: false,
  declaration: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,

  // The following options are declared as numbers to prevent from importing any
  // values from the `monaco-editor`. The import needs to be a dynamic `import`
  // statement.

  // languages.typescript.ModuleResolutionKind.NodeJs
  moduleResolution: 2,

  // languages.typescript.ScriptTarget.ESNext
  target: 99,

  // languages.typescript.ModuleKind.ESNext
  module: 99,

  // languages.typescript.JsxEmit.ReactJSXDev => not currently exported by monaco.
  jsx: 5,
};

/** The editor to be used for the monaco editor. */
export const editorThemes = {
  darkTheme: {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { background: '#1B2B34', token: '' },
      { foreground: '#cdd3de', token: 'variable' },
      { foreground: '#c795ff', token: 'keyword' },
      { foreground: '#ff91a2', token: 'type.identifier' },
      { foreground: '#44bdff', token: 'identifier' },
      { foreground: '#fefffe', token: 'delimiter.bracket' },
      { foreground: '#ffc568', token: 'delimiter.angle', fontStyle: '' },
      { foreground: '#ffc568', token: 'delimiter.parenthesis', fontStyle: '' },
      { foreground: '#ffc568', token: 'delimiter' },
      { foreground: '#7887d5', token: 'comment', fontStyle: 'italic' },
      { foreground: '#7887d5', token: 'comment.doc.ts' },
      { foreground: '#c795ff', token: 'storage.type' },
      { foreground: '#c795ff', token: 'storage.modifier' },
      { foreground: '#5fb3b3', token: 'keyword.operator' },
      { foreground: '#5fb3b3', token: 'constant.other.color' },
      { foreground: '#5fb3b3', token: 'punctuation' },
      { foreground: '#5fb3b3', token: 'meta.tag' },
      { foreground: '#5fb3b3', token: 'keyword.other.template' },
      { foreground: '#5fb3b3', token: 'keyword.other.substitution' },
      { foreground: '#eb606b', token: 'entity.name.tag' },
      { foreground: '#eb606b', token: 'meta.tag.sgml' },
      { foreground: '#6699cc', token: 'entity.name.function' },
      { foreground: '#6699cc', token: 'meta.function-call' },
      { foreground: '#6699cc', token: 'variable.function' },
      { foreground: '#6699cc', token: 'support.function' },
      { foreground: '#6699cc', token: 'keyword.other.special-method' },
      { foreground: '#6699cc', token: 'meta.block-level' },
      { foreground: '#f2777a', token: 'support.other.variable' },
      { foreground: '#f2777a', token: 'string.other.link' },
      { foreground: '#f99157', token: 'constant.numeric' },
      { foreground: '#f99157', token: 'constant.language' },
      { foreground: '#f99157', token: 'support.constant' },
      { foreground: '#f99157', token: 'constant.character' },
      { foreground: '#f99157', token: 'variable.parameter' },
      { foreground: '#f99157', token: 'keyword.other.unit' },
      { foreground: '#b8e780', fontStyle: 'normal', token: 'string' },
      { foreground: '#99c794', fontStyle: 'normal', token: 'constant.other.symbol' },
      { foreground: '#99c794', fontStyle: 'normal', token: 'constant.other.key' },
      { foreground: '#99c794', fontStyle: 'normal', token: 'entity.other.inherited-class' },
      { foreground: '#fac863', token: 'entity.name.class' },
      { foreground: '#fac863', token: 'entity.name.type.class' },
      { foreground: '#fac863', token: 'support.type' },
      { foreground: '#fac863', token: 'support.class' },
      { foreground: '#fac863', token: 'support.orther.namespace.use.php' },
      { foreground: '#fac863', token: 'meta.use.php' },
      { foreground: '#fac863', token: 'support.other.namespace.php' },
      { foreground: '#ec5f67', token: 'entity.name.module.js' },
      { foreground: '#ec5f67', token: 'variable.import.parameter.js' },
      { foreground: '#ec5f67', token: 'variable.other.class.js' },
      { foreground: '#ec5f67', fontStyle: 'italic', token: 'variable.language' },
      { fontStyle: 'underline', token: '*url*' },
      { fontStyle: 'underline', token: '*link*' },
      { fontStyle: 'underline', token: '*uri*' },
    ],
    colors: {
      'editor.foreground': '#CDD3DE',
      'editor.background': '#222437',
      'editor.selectionBackground': '#4f5b66',
      'editor.lineHighlightBackground': '#65737e55',
      'editorCursor.foreground': '#c0c5ce',
      'editorWhitespace.foreground': '#51525a',
      'editorIndentGuide.background': '#65737F',
      'editorIndentGuide.activeBackground': '#FBC95A',
    },
  } as editor.IStandaloneThemeData,
};

export const DEFAULT_PACK_JSON: PackageJson = {
  name: 'remirror-playground',
  description: 'An editor built with the remirror playground',
  main: 'index.tsx',
  dependencies: {
    remirror: '*',
    react: '*',
    '@remirror/pm': '*',
  },
};
