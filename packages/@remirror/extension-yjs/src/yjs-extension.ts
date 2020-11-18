import { css } from 'linaria';
import {
  defaultCursorBuilder,
  redo,
  undo,
  yCursorPlugin,
  YSyncOpts,
  ySyncPlugin,
  yUndoPlugin,
  yUndoPluginKey,
} from 'y-prosemirror';
import type { Doc, UndoManager } from 'yjs';

import {
  AcceptUndefined,
  CommandFunction,
  convertCommand,
  EditorState,
  environment,
  ErrorConstant,
  extensionDecorator,
  ExtensionPriority,
  invariant,
  isEmptyObject,
  isFunction,
  nonChainable,
  OnSetOptionsParameter,
  PlainExtension,
  PrioritizedKeyBindings,
  ProsemirrorPlugin,
  Selection,
  Shape,
} from '@remirror/core';

/**
 * yjs typings are very rough; so we define here the interface that we require
 * (y-webrtc and y-websocket providers are both compatible with this interface;
 * no other providers have been checked).
 */
interface YjsRealtimeProvider {
  doc: Doc;
  awareness: any;
  destroy: () => void;
  disconnect: () => void;
}

export interface YjsOptions<Provider extends YjsRealtimeProvider = YjsRealtimeProvider> {
  /**
   * Get the provider for this extension.
   */
  getProvider: Provider | (() => Provider);

  /**
   * Remove the active provider. This should only be set at initial construction
   * of the editor.
   */
  destroyProvider?: (provider: Provider) => void;

  /**
   * The options which are passed through to the Yjs sync plugin.
   */
  syncPluginOptions?: AcceptUndefined<YSyncOpts>;

  /**
   * Take the user data and transform it into a html element which is used for
   * the cursor. This is passed into the cursor builder.
   *
   * See https://github.com/yjs/y-prosemirror#remote-cursors
   */
  cursorBuilder?: (user: Shape) => HTMLElement;

  /**
   * By default all editor bindings use the awareness 'cursor' field to
   * propagate cursor information.
   *
   * @default 'cursor'
   */
  cursorStateField?: string;

  /**
   * Get the current editor selection.
   *
   * @default `(state) => state.selection`
   */
  getSelection?: (state: EditorState) => Selection;

  /**
   * Names of nodes in the editor which should be protected.
   *
   * @default `new Set('paragraph')`
   */
  protectedNodes?: Set<string>;
  trackedOrigins?: any[];
}

/**
 * The YJS extension is the recommended extension for creating a collaborative
 * editor.
 */
@extensionDecorator<YjsOptions>({
  defaultOptions: {
    getProvider: (): never => {
      invariant(false, {
        code: ErrorConstant.EXTENSION,
        message: 'You must provide a YJS Provider to the `YjsExtension`.',
      });
    },
    destroyProvider: defaultDestroyProvider,
    syncPluginOptions: undefined,
    cursorBuilder: defaultCursorBuilder,
    cursorStateField: 'cursor',
    getSelection: (state) => state.selection,
    protectedNodes: new Set('paragraph'),
    trackedOrigins: [],
  },
  defaultPriority: ExtensionPriority.High,
})
export class YjsExtension extends PlainExtension<YjsOptions> {
  get name() {
    return 'yjs' as const;
  }

  #provider?: YjsRealtimeProvider;

  /**
   * The provider that is being used for the editor.
   */
  get provider(): YjsRealtimeProvider {
    const { getProvider } = this.options;

    return (this.#provider ??= getLazyValue(getProvider));
  }

  /**
   * Create the custom undo keymaps for the
   */
  createKeymap(): PrioritizedKeyBindings {
    return {
      'Mod-y': !environment.isMac ? convertCommand(redo) : () => false,
      'Mod-z': convertCommand(undo),
      'Shift-Mod-z': convertCommand(redo),
    };
  }

  /**
   * Create the yjs plugins.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    const {
      syncPluginOptions,
      cursorBuilder,
      getSelection,
      cursorStateField,
      protectedNodes,
      trackedOrigins,
    } = this.options;

    const yDoc = this.provider.doc;
    const type = yDoc.getXmlFragment('prosemirror');
    return [
      ySyncPlugin(type, syncPluginOptions),
      yCursorPlugin(
        this.provider.awareness,
        { cursorBuilder, cursorStateField, getSelection },
        cursorStateField,
      ),
      yUndoPlugin({ protectedNodes, trackedOrigins }),
    ];
  }

  createCommands() {
    return {
      /**
       * Undo within a collaborative editor.
       *
       * This should be used instead of the built in `undo` command.
       *
       * This command does **not** support chaining.
       */
      yUndo: (): CommandFunction =>
        nonChainable((parameter) => {
          const { state, dispatch } = parameter;
          const undoManager: UndoManager = yUndoPluginKey.getState(state).undoManager;

          if (undoManager.undoStack.length === 0) {
            return false;
          }

          if (!dispatch) {
            return true;
          }

          return convertCommand(undo)(parameter);
        }),

      /**
       * Redo, within a collaborative editor.
       *
       * This should be used instead of the built in `redo` command.
       *
       * This command does **not** support chaining.
       */
      yRedo: (): CommandFunction =>
        nonChainable((parameter) => {
          const { state, dispatch } = parameter;
          const undoManager: UndoManager = yUndoPluginKey.getState(state).undoManager;

          if (undoManager.redoStack.length === 0) {
            return false;
          }

          if (!dispatch) {
            return true;
          }

          return convertCommand(redo)(parameter);
        }),
    };
  }

  /**
   * This managers the updates of the collaboration provider.
   */
  onSetOptions(parameter: OnSetOptionsParameter<YjsOptions>): void {
    const { changes, pickChanged } = parameter;
    const changedPluginOptions = pickChanged([
      'cursorBuilder',
      'cursorStateField',
      'getProvider',
      'getSelection',
      'syncPluginOptions',
      'protectedNodes',
      'trackedOrigins',
    ]);

    if (changes.getProvider.changed) {
      this.#provider = undefined;
      const previousProvider = getLazyValue(changes.getProvider.previousValue);

      // Check whether the values have changed.
      if (changes.destroyProvider.changed) {
        changes.destroyProvider.previousValue?.(previousProvider);
      } else {
        this.options.destroyProvider(previousProvider);
      }
    }

    if (!isEmptyObject(changedPluginOptions)) {
      this.store.updateExtensionPlugins(this);
    }
  }

  /**
   * Remove the provider from the manager.
   */
  onDestroy(): void {
    if (!this.#provider) {
      return;
    }

    this.options.destroyProvider(this.#provider);
    this.#provider = undefined;
  }
}

/**
 * The default destroy provider method.
 */
export function defaultDestroyProvider(provider: YjsRealtimeProvider): void {
  const { doc } = provider;
  provider.disconnect();
  provider.destroy();
  doc.destroy();
}

function getLazyValue<Type>(lazyValue: Type | (() => Type)): Type {
  return isFunction(lazyValue) ? lazyValue() : lazyValue;
}

/**
 * @remarks
 *
 * This magic property is transformed by babel via linaria into CSS that will be
 * wrapped by the `.remirror-editor` class; when you edit it you must run `yarn
 * fix:css` to regenerate `@remirror/styles/all.css`.
 */
export const editorStyles = css`
  .ProseMirror {
    .ProseMirror-yjs-cursor {
      position: absolute;
      border-left: black;
      border-left-style: solid;
      border-left-width: 2px;
      border-color: orange;
      height: 1em;
      word-break: normal;
      pointer-events: none;

      > div {
        position: relative;
        top: -1.05em;
        font-size: 13px;
        background-color: rgb(250, 129, 0);
        font-family: serif;
        font-style: normal;
        font-weight: normal;
        line-height: normal;
        user-select: none;
        color: white;
        padding-left: 2px;
        padding-right: 2px;
      }
    }

    > .ProseMirror-yjs-cursor:first-child {
      margin-top: 16px;
    }

    p:first-child,
    h1:first-child,
    h2:first-child,
    h3:first-child,
    h4:first-child,
    h5:first-child,
    h6:first-child {
      margin-top: 16px;
    }
  }

  #y-functions {
    position: absolute;
    top: 20px;
    right: 20px;

    > * {
      display: inline-block;
    }
  }
`;

declare global {
  namespace Remirror {
    interface AllExtensions {
      yjs: YjsExtension;
    }
  }
}
