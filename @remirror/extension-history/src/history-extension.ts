import {
  CommandFunction,
  CustomKeyList,
  DefaultExtensionOptions,
  DispatchFunction,
  EditorState,
  environment,
  Handler,
  HandlerKeyList,
  isFunction,
  KeyBindings,
  PlainExtension,
  ProsemirrorCommandFunction,
  Static,
  StaticKeyList,
} from '@remirror/core';
import { history, redo, undo } from '@remirror/pm/history';

export interface HistoryOptions {
  /**
   * The amount of history events that are collected before the
   * oldest events are discarded.
   *
   * @defaultValue 100
   */
  depth?: Static<number | null>;

  /**
   * The delay (ms) between changes after which a new group should be
   * started. Note that when changes aren't adjacent, a new group is always started.
   *
   * @defaultValue 500
   */
  newGroupDelay?: Static<number | null>;

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
  getState?: (() => EditorState) | null;

  /**
   * Provide a custom dispatch getter function for embedded editors
   *
   * @remarks
   *
   * This is only needed when the extension is part of a child editor, e.g.
   * `ImageCaptionEditor`. By passing in the `getDispatch` method history actions
   * can be dispatched into the parent editor allowing them to propagate into
   * the child editor.
   */
  getDispatch?: (() => DispatchFunction) | null;

  /**
   * A callback to listen to when the user attempts to undo with the keyboard.
   * When it succeeds it `success` is true.
   */
  onUndo?: Handler<(success: boolean) => void>;

  /**
   * A callback to listen to when the user attempts to redo with the keyboard.
   * When it succeeds it `success` is true.
   */
  onRedo?: Handler<(success: boolean) => void>;
}

/**
 * This extension provides undo and redo commands and inserts a plugin which
 * handles history related actions.
 *
 * @builtin
 */
export class HistoryExtension extends PlainExtension<HistoryOptions> {
  public static readonly staticKeys: StaticKeyList<HistoryOptions> = ['depth', 'newGroupDelay'];
  public static readonly handlerKeys: HandlerKeyList<HistoryOptions> = ['onRedo', 'onUndo'];
  public static readonly customKeys: CustomKeyList<HistoryOptions> = [];

  public static readonly defaultOptions: DefaultExtensionOptions<HistoryOptions> = {
    depth: 100,
    newGroupDelay: 500,
    getDispatch: null,
    getState: null,
  };

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
  public keys(): KeyBindings {
    const notMacOS = !environment.isMac
      ? { ['Mod-y']: this.wrapMethod(redo, this.options.onRedo) }
      : undefined;

    return {
      'Mod-y': () => false,
      'Mod-z': this.wrapMethod(undo, this.options.onUndo),
      'Shift-Mod-z': this.wrapMethod(redo, this.options.onRedo),
      ...notMacOS,
    };
  }

  /**
   * Bring the `prosemirror-history` plugin with options set on this extension.
   */
  public createExternalPlugins = () => {
    const { depth, newGroupDelay } = this.options;

    return [history({ depth, newGroupDelay })];
  };

  /**
   * Provide the undo and redo commands.
   */
  public createCommands = () => {
    return {
      /**
       * Undo the last action that occurred. This can be overridden by
       * setting an `"addToHistory"` metadata property of `false` on a
       * transaction to prevent it from being rolled back by undo.
       *
       * ```ts
       * actions.undo()
       *
       * // To prevent this use
       * tr.setMeta(pluginKey, { addToHistory: false })
       * ```
       */
      undo: () => this.wrapMethod(undo),

      /**
       * Redo an action that was in the undo stack.
       *
       * ```ts
       * actions.redo()
       * ```
       */
      redo: () => this.wrapMethod(redo),
    };
  };
}
