import {
  defaultCursorBuilder,
  defaultDeleteFilter,
  defaultSelectionBuilder,
  redo,
  undo,
  yCursorPlugin,
  ySyncPlugin,
  ySyncPluginKey,
  yUndoPlugin,
  yUndoPluginKey,
} from 'y-prosemirror';
import type { Doc } from 'yjs';
import { UndoManager } from 'yjs';
import {
  AcceptUndefined,
  command,
  convertCommand,
  EditorState,
  ErrorConstant,
  extension,
  ExtensionPriority,
  invariant,
  isEmptyObject,
  isFunction,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  nonChainable,
  NonChainableCommandFunction,
  OnSetOptionsProps,
  PlainExtension,
  ProsemirrorPlugin,
  Selection,
  Shape,
  Static,
} from '@remirror/core';
import { ExtensionHistoryMessages as Messages } from '@remirror/messages';
import { DecorationAttrs } from '@remirror/pm/view';

export interface ColorDef {
  light: string;
  dark: string;
}

export interface YSyncOpts {
  colors?: ColorDef[];
  colorMapping?: Map<string, ColorDef>;
  permanentUserData?: any | null;
}

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
   * Generator for the selection attributes
   */
  selectionBuilder?: (user: Shape) => DecorationAttrs;

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

  disableUndo?: Static<boolean>;

  /**
   * Names of nodes in the editor which should be protected.
   *
   * @default `new Set('paragraph')`
   */
  protectedNodes?: Static<Set<string>>;
  trackedOrigins?: Static<any[]>;
}

/**
 * The YJS extension is the recommended extension for creating a collaborative
 * editor.
 */
@extension<YjsOptions>({
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
    selectionBuilder: defaultSelectionBuilder,
    cursorStateField: 'cursor',
    getSelection: (state) => state.selection,
    disableUndo: false,
    protectedNodes: new Set('paragraph'),
    trackedOrigins: [],
  },
  staticKeys: ['disableUndo', 'protectedNodes', 'trackedOrigins'],
  defaultPriority: ExtensionPriority.High,
})
export class YjsExtension extends PlainExtension<YjsOptions> {
  get name() {
    return 'yjs' as const;
  }

  private _provider?: YjsRealtimeProvider;

  /**
   * The provider that is being used for the editor.
   */
  get provider(): YjsRealtimeProvider {
    const { getProvider } = this.options;

    return (this._provider ??= getLazyValue(getProvider));
  }

  getBinding(): { mapping: Map<any, any> } | undefined {
    const state = this.store.getState();
    const { binding } = ySyncPluginKey.getState(state);
    return binding;
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
      disableUndo,
      protectedNodes,
      trackedOrigins,
      selectionBuilder,
    } = this.options;

    const yDoc = this.provider.doc;
    const type = yDoc.getXmlFragment('prosemirror');

    const plugins = [
      ySyncPlugin(type, syncPluginOptions),
      yCursorPlugin(
        this.provider.awareness,
        { cursorBuilder, getSelection, selectionBuilder },
        cursorStateField,
      ),
    ];

    if (!disableUndo) {
      const undoManager = new UndoManager(type, {
        trackedOrigins: new Set([ySyncPluginKey, ...trackedOrigins]),
        deleteFilter: (item) => defaultDeleteFilter(item, protectedNodes),
      });
      plugins.push(yUndoPlugin({ undoManager }));
    }

    return plugins;
  }

  /**
   * This managers the updates of the collaboration provider.
   */
  onSetOptions(props: OnSetOptionsProps<YjsOptions>): void {
    const { changes, pickChanged } = props;
    const changedPluginOptions = pickChanged([
      'cursorBuilder',
      'cursorStateField',
      'getProvider',
      'getSelection',
      'syncPluginOptions',
    ]);

    if (changes.getProvider.changed) {
      this._provider = undefined;
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
    if (!this._provider) {
      return;
    }

    this.options.destroyProvider(this._provider);
    this._provider = undefined;
  }

  /**
   * Undo that last Yjs transaction(s)
   *
   * This command does **not** support chaining.
   * This command is a no-op and always returns `false` when the `disableUndo` option is set.
   */
  @command({
    disableChaining: true,
    description: ({ t }) => t(Messages.UNDO_DESCRIPTION),
    label: ({ t }) => t(Messages.UNDO_LABEL),
    icon: 'arrowGoBackFill',
  })
  yUndo(): NonChainableCommandFunction {
    return nonChainable((props) => {
      if (this.options.disableUndo) {
        return false;
      }

      const { state, dispatch } = props;
      const undoManager: UndoManager = yUndoPluginKey.getState(state).undoManager;

      if (undoManager.undoStack.length === 0) {
        return false;
      }

      if (!dispatch) {
        return true;
      }

      return convertCommand(undo)(props);
    });
  }

  /**
   * Redo the last transaction undone with a previous `yUndo` command.
   *
   * This command does **not** support chaining.
   * This command is a no-op and always returns `false` when the `disableUndo` option is set.
   */
  @command({
    disableChaining: true,
    description: ({ t }) => t(Messages.REDO_DESCRIPTION),
    label: ({ t }) => t(Messages.REDO_LABEL),
    icon: 'arrowGoForwardFill',
  })
  yRedo(): NonChainableCommandFunction {
    return nonChainable((props) => {
      if (this.options.disableUndo) {
        return false;
      }

      const { state, dispatch } = props;
      const undoManager: UndoManager = yUndoPluginKey.getState(state).undoManager;

      if (undoManager.redoStack.length === 0) {
        return false;
      }

      if (!dispatch) {
        return true;
      }

      return convertCommand(redo)(props);
    });
  }

  /**
   * Handle the undo keybinding.
   */
  @keyBinding({ shortcut: NamedShortcut.Undo, command: 'yUndo' })
  undoShortcut(props: KeyBindingProps): boolean {
    return this.yUndo()(props);
  }

  /**
   * Handle the redo keybinding for the editor.
   */
  @keyBinding({ shortcut: NamedShortcut.Redo, command: 'yRedo' })
  redoShortcut(props: KeyBindingProps): boolean {
    return this.yRedo()(props);
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

declare global {
  namespace Remirror {
    interface AllExtensions {
      yjs: YjsExtension;
    }
  }
}
