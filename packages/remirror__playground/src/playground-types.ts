/**
 * @module
 *
 * The types used throughout the playground.
 */

import type { ComponentType } from 'react';
import type { FromToProps, RemirrorJSON, StateJSON } from 'remirror';

export interface DebugComponentProps {
  /**
   * If creating multiple editors within the same export you can assign a custom
   * prefix which will
   */
  prefix?: string;
}

export interface PlaygroundExportProps {
  /**
   * The debug component which is passed through to the default exports. This
   * component connects the editor to the remirror debugger within the
   * playground.
   */
  DebugComponent: ComponentType<DebugComponentProps>;
}

/**
 * The exports from the main playground entry point.
 *
 * Every export, both named and `default` must be a React component which takes
 * no props.
 */
export interface PlaygroundExports {
  [key: string]: ComponentType<PlaygroundExportProps>;
}

export interface ImportMapImports {
  [key: string]: string;
}

export interface ImportMapScopes {
  [key: string]: ImportMapImports;
}

/**
 * The structure for import maps as defined by the `ECMAScript` spec.
 */
export interface ImportMap {
  imports?: ImportMapImports;
  scopes?: ImportMapScopes;
}

export interface CompileWorkerDataPayload {
  /**
   * The code to compile.
   */
  code: string;

  /**
   * The filename to use when compiling the code.
   */
  filename: string;

  /**
   * Versions that have been set in the package.json.
   */
  versions: Record<string, string>;
}

export interface CompileWorkerData extends CompileWorkerDataPayload {
  /**
   * Compile the code with babel.
   */
  type: 'compile';
}

export interface CompileWorkerOutputSuccess {
  type: 'compile-success';

  /**
   * The output of the code compilation.
   */
  code: string;
}

export interface CompileWorkerOutputFailure {
  type: 'compile-failure';

  /**
   * The error that occurred
   */
  error: Error;
}

export type CompileWorkerOutput = CompileWorkerOutputSuccess | CompileWorkerOutputFailure;

export interface TypingsWorkerPayload {
  /**
   * The name of the package to get typings for.
   */
  name: string;

  /**
   * The version of the package.
   */
  version: string;
}

interface TypingsInitWorkerData {
  type: 'typings-init';
}

interface TypingsPackageWorkerData extends TypingsWorkerPayload {
  /**
   * Extract the typings from the code.
   */
  type: 'typings';
}

export type TypingsWorkerData = TypingsInitWorkerData | TypingsPackageWorkerData;

export interface TypingsWorkerOutput {
  type: 'typings-success';

  /**
   * The typings paths relative to node_modules.
   */
  typings: Record<string, string>;
}

export interface PrettierWorkerPayload {
  /**
   * The path of the file to prettify.
   */
  path: string;

  /**
   * The code for the given path.
   */
  source: string;
}

export interface PrettierWorkerData extends PrettierWorkerPayload {
  /**
   * Extract the typings from the code.
   */
  type: 'prettier';
}

export interface PrettierWorkerOutput {
  type: 'prettier-success';

  /**
   * The output code.
   */
  code: string;
}

/**
 * The data passed via the worker.
 */
export type WorkerData = CompileWorkerData | TypingsWorkerData | PrettierWorkerData;

/**
 * The names and their dependencies.
 */
export interface DependencyList {
  [key: string]: {
    version: string;
    /** The exact version from the package.json */
    resolved: string;
  };
}

export type Language = 'javascript' | 'typescript' | 'json' | 'css' | 'html' | 'markdown';

/**
 * Configuration for simple mode.
 */
interface ModelV0SimpleMode {
  /**
   * The configuration for the playground when using the configuration settings.
   */
  m: 0;

  /**
   * Additional modules to include.
   */
  a: string[];

  /**
   * Extensions added.
   */
  e: string[];

  /**
   * Presets added.
   */
  p: string[];
}
/**
 * Configuration for advanced mode.
 */
interface ModelV0AdvancedMode {
  /**
   * The configuration for the playground when using editor.
   */
  m: 1;

  /**
   * Code for the editor (only one file so no need to provided named imports)
   */
  c: string;
}

export interface ModelV0 {
  /**
   * The first version of the playground model.
   */
  version: 0;

  /**
   * The content in the active editor. This is the editor that is exported with
   * `export default` since in this version multiple editors could not be debugged.
   */
  doc: RemirrorJSON;

  /**
   * The playground
   */
  playground: ModelV0AdvancedMode | ModelV0SimpleMode;
}
interface ExportedEditorState extends StateJSON {
  /**
   * The name of the export.
   */
  name: string;

  /**
   * The prefix used for the export. (an export can contain multiple debuggable
   * editors).
   */
  prefix: string;

  /**
   * The main `ProseMirror` doc as a JSON object.
   */
  doc: RemirrorJSON;

  /**
   * The current selection.
   */
  selection: FromToProps;
}

interface ModelV1AdvancedConfiguration {
  /**
   * Set this as an advanced configuration object.
   */
  type: 'advanced';

  /**
   * The files stored within the editor.
   */
  files: [EntryFile, ...EntryFile[]];
}
interface ModelV1SimpleConfiguration {
  type: 'simple';
  extensions: [];
  presets: [];
  /**
   * UI Elements like menus.
   */
  ui: [];
}

export interface ModelV1 {
  /**
   * The current version for the playground model.
   */
  version: 1;

  /**
   * The state of the editor. Must have at least one item.
   *
   * This is taken extracted from the renderer.
   */
  state: [ExportedEditorState, ...ExportedEditorState[]];

  /**
   * Configuration passes in the details and code.
   */
  configuration: ModelV1AdvancedConfiguration | ModelV1SimpleConfiguration;
}
/**
 * The playground model is taken from the **Configuration** and
 * passed to the **Renderer**. Each version has a migration function that is
 * used to transition to the most up to date model.
 */
export type Model = ModelV0 | ModelV1;

interface BaseEntry {}

export interface TextFileEntry extends BaseEntry {
  /**
   * Set's this as a text file. Useful for discriminative unions.
   */
  readonly type: 'text';

  /**
   * The name of the file. Must be unique, and corresponds to the file path.
   * Also includes the extension, but doesn't include the leading `/`.
   */
  readonly path: string;

  /**
   * The contents for the file.
   */
  readonly content: string;

  /**
   * When true this file cannot be deleted.
   *
   * @default undefined
   */
  readonly fixed?: boolean;
}

export type EntryFileState = 'active' | 'focused' | 'inactive';

export type EntryFile = TextFileEntry;

export interface DtsCache {
  [module: string]: { [path: string]: string };
}
