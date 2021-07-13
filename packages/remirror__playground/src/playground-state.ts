/**
 * @packageDocumentation
 *
 * This module is where the state for the playground is managed. It is
 * responsible for loading the monaco editor, injecting the babel, and
 */

import { createContextState } from 'create-context-state';
import type * as Monaco from 'monaco-editor';
import { relative } from 'path-browserify';
import { assertGet, entries, invariant, pick } from '@remirror/core-helpers';

import { DTS_MODULE_NAMES } from './generated/meta';
import { compilerOptions, editorThemes } from './playground-constants';
import type {
  EntryFile,
  PrettierWorkerData,
  PrettierWorkerOutput,
  TypingsWorkerData,
  TypingsWorkerOutput,
} from './playground-types';
import { getImportStatements, TypedPromiseWorker } from './playground-utils';

/**
 * A singleton responsible for managing the loading of the editor and other
 * jobs. This makes use of dynamic imports to make sure large files and editor
 * specific functionality is only loaded at the time it is needed.
 */
class CodeEditorHelper {
  #monaco?: typeof Monaco;

  /**
   * Keeps track of whether the editor has been initialized.
   */
  #initialized = false;

  /**
   * The worker for extracting typings.
   */
  #typingsWorker = new TypedPromiseWorker<TypingsWorkerOutput, TypingsWorkerData>(
    new Worker('../worker.typings', { type: 'module', name: 'typingsWorker' }),
  );

  /**
   * The worker for prettifying code.
   */
  #prettierWorker = new TypedPromiseWorker<PrettierWorkerOutput, PrettierWorkerData>(
    new Worker('../worker.prettier', { type: 'module', name: 'prettierWorker' }),
  );

  /**
   * Typings which have been added.
   */
  #requestedTypings = new Map<string, string>();

  /**
   * The extra libraries currently active.
   */
  #extraLibs: Map<string, { js: Monaco.IDisposable; ts: Monaco.IDisposable }> = new Map();

  /**
   * The editor states for each configured file.
   */
  #editorStates = new Map<string, Monaco.editor.ICodeEditorViewState | undefined>();

  /**
   * The full monaco namespace import.
   */
  get monaco(): typeof Monaco {
    invariant(this.#monaco, {
      message: 'Monaco was referenced before being loaded. Please call `loadMonaco` method first.',
    });

    return this.#monaco;
  }

  /**
   * The monaco editor
   */
  get editor(): typeof Monaco.editor {
    return this.monaco.editor;
  }

  /**
   * A shorthand way of accessing languages.
   */
  get languages(): typeof Monaco.languages {
    return this.monaco.languages;
  }

  /**
   * A shorthand way of accessing typescript
   */
  get typescript(): typeof Monaco.languages.typescript.typescriptDefaults {
    return this.languages.typescript.typescriptDefaults;
  }

  /**
   * A shorthand way of accessing javascript
   */
  get javascript(): typeof Monaco.languages.typescript.javascriptDefaults {
    return this.languages.typescript.typescriptDefaults;
  }

  get services() {
    invariant(this.#services, {
      message: '`services` were accessed before being loaded. ',
    });

    return this.#services;
  }

  #services?: { Standalone: any; Simple: any };

  /**
   * Load the monaco editor asynchronously and prepare the environment properly.
   * This allows for bundle splitting in the playground so that the editor is
   * only imported when it is required.
   *
   * This is current called while loading the monaco component loader.
   */
  async initialize() {
    if (this.#initialized) {
      return;
    }

    this.#monaco = await import('monaco-editor');

    // Load the services which are patched.
    await this.loadServices();

    // Patch the editor.
    this.patchEditor();

    // Sync all the models to the worker eagerly. This enables intelliSense for
    // all files without needing an `addExtraLib` call.
    this.typescript.setEagerModelSync(true);
    this.javascript.setEagerModelSync(true);

    // Set the compiler options to use for the code.
    this.typescript.setCompilerOptions(compilerOptions);
    this.javascript.setCompilerOptions(compilerOptions);

    // Turn off the built in monaco linting and formatting eventually and switch
    // to using eslint and prettier only
    // this.typescript.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: true });

    // Register the formatter.
    this.registerPrettierFormatter();

    for (const [name, theme] of entries(editorThemes)) {
      this.editor.defineTheme(name, theme);
    }

    // Load initial typings
    const result = await this.#typingsWorker.send({
      type: 'typings-init',
    });

    this.addTypings(result.typings);
    this.#initialized = true;
  }

  /**
   * Find the model for the given path.
   */
  private findModel(path: string) {
    return this.editor.getModels().find((model) => model.uri.path === `/${path}`);
  }

  /**
   * Remove the path.
   */
  removePath(path: string) {
    // Remove editor states
    this.#editorStates.delete(path);

    // Remove associated models
    const model = this.findModel(path);

    model?.dispose();
  }

  /**
   * Rename the path.
   */
  renamePath(oldPath: string, newPath: string) {
    const selection = this.#editorStates.get(oldPath);

    this.#editorStates.delete(oldPath);
    this.#editorStates.set(newPath, selection);

    this.removePath(oldPath);
  }

  /**
   * Create a model for the provided path, or update it's content if it already
   * exists.
   */
  updateModelForPath(path: string, text: string) {
    let model = this.findModel(path);

    if (model && !model.isDisposed()) {
      const range = model.getFullModelRange();

      // If a model exists, we need to update it's value This is needed because
      // the content for the file might have been modified externally Use
      // `pushEditOperations` instead of `setValue` or `applyEdits` to preserve
      // undo stack
      model.pushEditOperations([], [{ range, text }], () => []);
      return;
    }

    // Create the model when it doesn't already exist.
    model = this.editor.createModel(
      text,
      undefined,
      this.monaco.Uri.from({ scheme: 'file', path }),
    );

    // Update the options for the created model.
    model.updateOptions({
      tabSize: 2,
      insertSpaces: true,
    });
  }

  /**
   * Set the model at the provided path to be the active model.
   */
  setActiveModel(
    editor: Monaco.editor.IStandaloneCodeEditor,
    path: string,
    value: string,
    focus?: boolean,
  ) {
    this.updateModelForPath(path, value);

    // Find the model based on the provided path.
    const model = this.findModel(path);

    if (!model) {
      return;
    }

    editor.setModel(model);

    // Restore the editor state for the file
    const editorState = this.#editorStates.get(path);

    if (editorState) {
      editor.restoreViewState(editorState);
    }

    if (focus) {
      editor.focus();
    }
  }

  /**
   * Create the editor and attach it to the dom.
   *
   * This will be created each time an editor is attached and the return value
   * is used by the `PlaygroundCodeEditor`.
   */
  createEditorAndAttach(element: HTMLElement): Monaco.editor.IStandaloneCodeEditor {
    return this.editor.create(element, {
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      language: 'typescript',
      fontSize: 16,
      fontFamily: '"Fira Code", Menlo, Monaco, "Courier New", monospace',
      fontLigatures: true,
      minimap: {
        enabled: false,
      },
    });
  }

  /**
   * Load typings from dependencies found in the provided source code.
   */
  async fetchTypingsFromCode(path: string, source: string) {
    const dependencies = getImportStatements(path, source);

    for (const dependency of dependencies) {
      // Parse the qualifier to get the package name
      // This will handle qualifiers with deep imports
      const match = /^(?:@([^/?]+)\/)?([^/?@]+)(?:\/([^@]+))?/.exec(dependency);

      if (!match) {
        continue;
      }

      const [scope, nameOrSubScope] = match;
      const name = `${scope ? `@${scope}/` : ''}${nameOrSubScope}`;

      if (this.#requestedTypings.has(name) || DTS_MODULE_NAMES.has(name)) {
        // Typing already loaded
        continue;
      }

      const result = await this.#typingsWorker.send({ type: 'typings', name, version: 'latest' });

      this.addTypings(result.typings);
      this.#requestedTypings.set(name, 'latest');
    }
  }

  /**
   * Handle updating the layout of the editor.
   */
  handleLayout(editorInstance: Monaco.editor.IStandaloneCodeEditor | undefined) {
    function layout() {
      if (!editorInstance) {
        return;
      }

      editorInstance.layout();
    }

    // Setup the initial render.
    layout();

    // Also layout whenever the window resizes
    window.addEventListener('resize', layout, false);

    // Return a dispose function.
    return () => {
      // Clean up when the component is unmounted.
      window.removeEventListener('resize', layout, false);
    };
  }

  /**
   * Load the services that are used.
   */
  private async loadServices() {
    this.#services = {
      Standalone: await import('monaco-editor/esm/vs/editor/standalone/browser/standaloneServices'),
      Simple: await import('monaco-editor/esm/vs/editor/standalone/browser/simpleServices'),
    };
  }

  /**
   * Monkeypatch to make 'Find All References' work across multiple files
   * https://github.com/Microsoft/monaco-editor/issues/779#issuecomment-374258435
   */
  private patchEditor() {
    const { SimpleEditorModelResolverService } = this.services.Simple;

    SimpleEditorModelResolverService.prototype.findModel = (_: any, resource: any) => {
      return this.editor.getModels().find((model) => model.uri.toString() === resource.toString());
    };
  }

  /**
   * Register the language formatter as prettier.
   */
  private registerPrettierFormatter() {
    const formatter = {
      provideDocumentFormattingEdits: async (model: Monaco.editor.ITextModel) => {
        let source = model.getValue();
        const result = await this.#prettierWorker.send({
          type: 'prettier',
          path: model.uri.path,
          source,
        });

        source = result.code ?? source;

        return [
          {
            range: model.getFullModelRange(),
            text: source,
          },
        ];
      },
    };

    this.languages.registerDocumentFormattingEditProvider('typescript', formatter);
    this.languages.registerDocumentFormattingEditProvider('javascript', formatter);
    this.languages.registerDocumentFormattingEditProvider('markdown', formatter);
    this.languages.registerDocumentFormattingEditProvider('json', formatter);
  }

  /**
   * Add typings to the the current editor.
   */
  private addTypings(typings: { [key: string]: string }) {
    for (const [path, content] of entries(typings)) {
      const extraLib = this.#extraLibs.get(path);

      if (content == null) {
        continue;
      }

      if (extraLib) {
        extraLib.js.dispose();
        extraLib.ts.dispose();
      }

      const uri = `file:///${path}`;
      const js = this.javascript.addExtraLib(content, uri);
      const ts = this.typescript.addExtraLib(content, uri);

      this.#extraLibs.set(path, { js, ts });
    }
  }

  /**
   * Completion provider to provide autocomplete for files and dependencies
   */
  createCompletionProvider(getContext: () => ConfigurationContextProps): () => void {
    const completionProvider: Monaco.languages.CompletionItemProvider = {
      triggerCharacters: ["'", '"', '.', '/'],
      provideCompletionItems: (model, position) => {
        // Get editor content before the pointer
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        if (
          // Doesn't match `import "`, `from "`, `require("`
          !/(([\s|]+(import|from)\s+)|(\brequire\b\s*\())["'|][^"'^]*$/.test(textUntilPosition)
        ) {
          return;
        }

        const { activeIndex, files } = getContext();
        const activeFile = assertGet(files, activeIndex);

        if (textUntilPosition.endsWith('.') || textUntilPosition.endsWith('/')) {
          // User is trying to import a file

          // Get the text after the quotes
          const match = textUntilPosition.match(/[^"']+$/);

          const typed = match ? assertGet(match, 0) : '';
          // Map '.' to './' and '..' to '../' for better autocomplete
          const prefix = typed === '.' ? './' : typed === '..' ? '../' : typed;
          const suggestions: Monaco.languages.CompletionItem[] = [];

          for (const file of files) {
            if (file.path === activeFile.path) {
              continue;
            }

            const relativePath = relative(activeFile.path, file.path);

            if (
              // Only show files that match the prefix typed by user
              !relativePath.startsWith(prefix) ||
              // Only show files in the same directory as the prefix
              relativePath.split('/').length > prefix.split('/').length
            ) {
              continue;
            }

            suggestions.push({
              // Show only the file name for label
              label: relativePath.split('/').pop() ?? '',
              // Don't keep extension for JS files
              insertText:
                file.type === 'text' ? relativePath.replace(/\.(js|tsx?)$/, '') : relativePath,
              kind: this.languages.CompletionItemKind.File,
              range: undefined as any,
            });
          }

          return { suggestions };
        }

        const deps = Object.keys(this.typescript.getExtraLibs())
          .map((path) =>
            path
              .replace('file:///node_modules/', '')
              .replace(/(index|)?\.d\.ts$/, '')
              .replace(/\/$/, ''),
          )
          .filter(
            (path) =>
              !path.endsWith('package.json') && !path.startsWith('@') && path.split('/').length < 3,
          );

        return {
          // User is trying to import a dependency
          suggestions: deps.map((name) => ({
            label: name,
            insertText: name,
            range: undefined as any,
            kind: this.languages.CompletionItemKind.Module,
          })),
        };
      },
    };

    const js = this.monaco.languages.registerCompletionItemProvider(
      'javascript',
      completionProvider,
    );
    const ts = this.monaco.languages.registerCompletionItemProvider(
      'typescript',
      completionProvider,
    );

    return () => {
      js.dispose();
      ts.dispose();
    };
  }
}

export const codeEditorHelper = new CodeEditorHelper();

const defaultContent = `\
import { FC } from 'react';
import { PlaygroundExportProps } from 'remirror/playground';
import { Remirror, useRemirror, useRemirrorContext } from '@remirror/react';

const extensions = () => [];

/**
 * This component contains the editor and any toolbars/chrome it requires.
 */
const SmallEditor: FC = () => {
  const { getRootProps } = useRemirrorContext();

  return (
    <div>
      <div {...getRootProps()} />
    </div>
  );
};

const SmallEditorContainer = ({ DebugComponent }: PlaygroundExportProps) => {
  const { state, onChange, manager } = useRemirror({ extensions });

  return (
    <Remirror
      manager={manager}
      state={state}
      onChange={onChange}
    >
      <DebugComponent />
      <SmallEditor />
    </Remirror>
  );
};

export default SmallEditorContainer;`;

const defaultFiles = [
  { content: defaultContent, path: 'index.tsx', type: 'text', state: 'active', fixed: true },
  // {
  //   content: JSON.stringify(defaultPackJson),
  //   path: 'package.json',
  //   type: 'text',
  //   state: 'inactive',
  //   fixed: true,
  // },
  // {
  //   content: '# remirror playground\n\n> This readme was generated with the playground.',
  //   path: 'readme.md',
  //   type: 'text',
  //   state: 'inactive',
  //   fixed: true,
  // },
] as const;

export const [ConfigurationProvider, useConfiguration] = createContextState<ConfigurationContext>(
  ({ set }) => ({
    readOnly: false,
    activeIndex: 0,
    files: [...defaultFiles],
    actions: {
      setReadOnly: (readOnly) => set({ readOnly }),
      updateFiles: (files) => set({ files }),
      updateFileContent: (path: string, content: string) => {
        set((context) => {
          const files = context.files.map((file) =>
            file.path === path ? { ...file, content } : file,
          );

          return { files };
        });
      },
      resetFiles: () => set({ files: [...defaultFiles] }),
    },
  }),
);

interface ConfigurationContextProps {
  readOnly: boolean;
  activeIndex: number;
  files: EntryFile[];
}

export interface ConfigurationContext extends ConfigurationContextProps {
  actions: {
    setReadOnly: (readonly: boolean) => void;
    updateFiles: (files: EntryFile[]) => void;
    updateFileContent: (path: string, content: string) => void;
    resetFiles: () => void;
  };
}

export const ConfigurationSelector = {
  activeFile: ({ files, activeIndex }: ConfigurationContext) => assertGet(files, activeIndex),
  props: (context: ConfigurationContext) => pick(context, ['activeIndex', 'files', 'readOnly']),
  actions: (context: ConfigurationContext) => context.actions,
};
