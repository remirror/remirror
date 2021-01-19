import {
  AcceptUndefined,
  command,
  CommandFunction,
  DispatchFunction,
  EditorState,
  environment,
  extension,
  Handler,
  isFunction,
  keyBinding,
  KeyBindingProps,
  NamedShortcut,
  nonChainable,
  NonChainableCommandFunction,
  PlainExtension,
  PrioritizedKeyBindings,
  ProsemirrorCommandFunction,
  ProsemirrorPlugin,
  Static,
} from '@remirror/core';
import { ExtensionHistoryMessages as Messages } from '@remirror/messages';
import { history, redo, undo } from '@remirror/pm/history';

export interface HistoryOptions {
  /**
   * The number of history events that are collected before the oldest events
   * are discarded.
   *
   * @default 100
   */
  depth?: Static<number>;

  /**
   * The delay (ms) between changes after which a new group should be started.
   * Note that when changes aren't adjacent, a new group is always started.
   *
   * @default 500
   */
  newGroupDelay?: Static<number>;

  /**
   * Provide a custom state getter function.
   *
   * @remarks
   *
   * This is only needed when the extension is part of a child editor, e.g.
   * `ImageCaptionEditor`. By passing in the `getState` method history actions
   * can be dispatched into the parent editor allowing them to propagate into
   * the child editor
   */
  getState?: AcceptUndefined<() => EditorState>;

  /**
   * Provide a custom dispatch getter function for embedded editors
   *
   * @remarks
   *
   * This is only needed when the extension is part of a child editor, e.g.
   * `ImageCaptionEditor`. By passing in the `getDispatch` method history
   * actions can be dispatched into the parent editor allowing them to propagate
   * into the child editor.
   */
  getDispatch?: AcceptUndefined<() => DispatchFunction>;

  /**
   * A callback to listen to when the user attempts to undo with the keyboard.
   * When it succeeds `success` is true.
   */
  onUndo?: Handler<(success: boolean) => void>;

  /**
   * A callback to listen to when the user attempts to redo with the keyboard.
   * When it succeeds `success` is true.
   */
  onRedo?: Handler<(success: boolean) => void>;
}

/**
 * This extension provides undo and redo commands and inserts a plugin which
 * handles history related actions.
 *
 * @category Builtin Extension
 */
@extension<HistoryOptions>({
  defaultOptions: {
    depth: 100,
    newGroupDelay: 500,
    getDispatch: undefined,
    getState: undefined,
  },
  staticKeys: ['depth', 'newGroupDelay'],
  handlerKeys: ['onUndo', 'onRedo'],
})
export class HistoryExtension extends PlainExtension<HistoryOptions> {
  get name() {
    return 'history' as const;
  }

  /**
   * Wraps the history method to inject state from the getState or getDispatch
   * method.
   *
   * @param method - the method to wrap
   */
  private readonly wrapMethod = (
    method: ProsemirrorCommandFunction,
    callback?: (success: boolean) => void,
  ): CommandFunction => {
    return ({ state, dispatch, view }) => {
      const { getState, getDispatch } = this.options;
      const wrappedState = isFunction(getState) ? getState() : state;
      const wrappedDispatch = isFunction(getDispatch) && dispatch ? getDispatch() : dispatch;
      const success = method(wrappedState, wrappedDispatch, view);

      callback?.(success);

      return success;
    };
  };

  /**
   * Adds the default key mappings for undo and redo.
   */
  createKeymap(): PrioritizedKeyBindings {
    return {
      'Mod-y': !environment.isMac ? this.wrapMethod(redo, this.options.onRedo) : () => false,
      'Mod-z': this.wrapMethod(undo, this.options.onUndo),
      'Shift-Mod-z': this.wrapMethod(redo, this.options.onRedo),
    };
  }

  /**
   * Handle the undo keybinding.
   */
  @keyBinding({ shortcut: NamedShortcut.Undo, command: 'undo' })
  undoShortcut(props: KeyBindingProps): boolean {
    return this.wrapMethod(undo, this.options.onUndo)(props);
  }

  /**
   * Handle the redo keybinding for the editor.
   */
  @keyBinding({ shortcut: NamedShortcut.Redo, command: 'redo' })
  redoShortcut(props: KeyBindingProps): boolean {
    return this.wrapMethod(redo, this.options.onRedo)(props);
  }

  /**
   * Bring the `prosemirror-history` plugin with options set on this extension.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    const { depth, newGroupDelay } = this.options;

    return [history({ depth, newGroupDelay })];
  }

  /**
   * Undo the last action that occurred. This can be overridden by setting
   * an `"addToHistory"` metadata property of `false` on a transaction to
   * prevent it from being rolled back by undo.
   *
   * ```ts
   * actions.undo()
   *
   * // To prevent this use
   * tr.setMeta(pluginKey, { addToHistory: false })
   * ```
   *
   * This command is **non-chainable**.
   */
  @command({
    disableChaining: true,
    description: ({ t }) => t(Messages.UNDO_DESCRIPTION),
    label: ({ t }) => t(Messages.UNDO_LABEL),
    icon: 'arrowGoBackFill',
  })
  undo(): NonChainableCommandFunction {
    return nonChainable(this.wrapMethod(undo, this.options.onUndo));
  }

  /**
   * Redo an action that was in the undo stack.
   *
   * ```ts
   * actions.redo()
   * ```
   *
   * This command is **non-chainable**.
   */
  @command({
    disableChaining: true,
    description: ({ t }) => t(Messages.REDO_DESCRIPTION),
    label: ({ t }) => t(Messages.REDO_LABEL),
    icon: 'arrowGoForwardFill',
  })
  redo(): NonChainableCommandFunction {
    return nonChainable(this.wrapMethod(redo, this.options.onRedo));
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      history: HistoryExtension;
    }
  }
}
