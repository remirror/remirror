import { Extension } from '@remirror/core';
import {
  BaseExtensionOptions,
  CommandFunction,
  DispatchFunction,
  EditorState,
  ExtensionManagerParams,
} from '@remirror/core-types';
import { environment } from '@remirror/core-utils';
import { history, redo, redoDepth, undo, undoDepth } from 'prosemirror-history';

export interface HistoryExtensionOptions extends BaseExtensionOptions {
  /**
   * The amount of history events that are collected before the
   * oldest events are discarded.
   *
   * @defaultValue `100`
   */
  depth?: number | null;

  /**
   * The delay (ms) between changes after which a new group should be
   * started. Note that when changes aren't adjacent, a new group is always started.
   *
   * @defaultValue `500`
   */
  newGroupDelay?: number | null;

  /**
   * This is only needed when the extension is part of a child editor, e.g.
   * `ImageCaptionEditor`. By passing in the `getState` method history actions
   * can be dispatched into the parent editor allowing them to propagate into
   * the child editor
   */
  getState?(): EditorState;

  /**
   * This is only needed when the extension is part of a child editor, e.g.
   * `ImageCaptionEditor`. By passing in the `getDispatch` method history actions
   * can be dispatched into the parent editor allowing them to propagate into
   * the child editor.
   */
  getDispatch?(): DispatchFunction;
}

/**
 * This extension provides undo and redo commands and inserts a plugin which
 * handles history related actions.
 *
 * @builtin
 */
export class HistoryExtension extends Extension<HistoryExtensionOptions> {
  get name() {
    return 'history' as const;
  }

  get defaultOptions() {
    return {
      depth: 100,
      newGroupDelay: 500,
    };
  }

  /**
   * Adds the default key mappings for undo and redo.
   */
  public keys() {
    const wrap = createHistoryMethodWrapper(this.options);

    return {
      'Mod-y': () => false,
      'Mod-z': wrap(undo),
      'Shift-Mod-z': wrap(redo),
      ...(!environment.isMac ? { ['Mod-y']: wrap(redo) } : {}),
    };
  }

  /**
   * Bring the `prosemirror-history` plugin with options set on theis extension.
   */
  public plugin() {
    const { depth, newGroupDelay } = this.options;
    return history({ depth, newGroupDelay });
  }

  /**
   * Provides the isEnabled method to the ActionMethods of undo and redo.
   *
   * @remarks
   *
   * - Redo is not enabled when at the end of the history and there is nothing left to redo.
   * - Undo is not enabled when at the beginning of the history and there is nothing left to undo.
   */
  public isEnabled({ getState }: ExtensionManagerParams) {
    return ({ command }: { command?: string }) => {
      switch (command) {
        case 'undo':
          return undoDepth(getState()) > 0;
        case 'redo':
          return redoDepth(getState()) > 0;
        default:
          return false;
      }
    };
  }

  /**
   * The history plugin doesn't really have an active state.
   */
  public isActive() {
    return () => false;
  }

  /**
   * Provide the undo and redo commands.
   */
  public commands() {
    const wrap = createHistoryMethodWrapper(this.options);

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
      undo: (): CommandFunction => wrap(undo),

      /**
       * Redo an action that was in the undo stack.
       *
       * ```ts
       * actions.redo()
       * ```
       */
      redo: (): CommandFunction => wrap(redo),
    };
  }
}

/**
 * Wraps the history method to inject state from the getState or getDispatch
 * method.
 */
const createHistoryMethodWrapper = (options: Pick<HistoryExtensionOptions, 'getState' | 'getDispatch'>) => (
  method: CommandFunction,
): CommandFunction => (state, dispatch, view) => {
  const { getState, getDispatch } = options;

  return method(
    getState ? getState() || state : state,
    getDispatch ? getDispatch() || dispatch : dispatch,
    view,
  );
};
