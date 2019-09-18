import { noop } from '@remirror/core-helpers';

export const DEFAULT_SUGGEST_ACTIONS = { command: noop, create: noop, remove: noop, update: noop };

const defaultHandler = () => false;

export const DEFAULT_SUGGESTER = {
  startOfLine: false,
  supportedCharacters: /[\w\d_]+/,
  matchOffset: 0,
  appendText: '',
  decorationsTag: 'span' as 'span',
  suggestionClassName: 'suggestion',
  onChange: defaultHandler,
  onExit: defaultHandler,
  onCharacterEntry: defaultHandler,
  keyBindings: {},
  createCommand: () => noop,
  getStage: () => 'new' as const,
  ignoreDecorations: false,
  validPrefixCharacters: /^[\s\0]?$/,
  invalidPrefixCharacters: undefined,
};

/**
 * The action taken on a suggestion
 */
export enum ActionTaken {
  /**
   * We've moved from suggestion to another.
   */
  Moved = 'moved',

  /**
   * The suggestion wasn't active before and now it is active
   */
  Entered = 'entered',

  /**
   * The suggestion was active before and not it is no longer active
   */
  Exited = 'exited',

  /**
   * The suggestion query has changed either by typing or deleting characters
   */
  Changed = 'changed',
}

/**
 * The potential reasons for an exit
 */
export enum ExitReason {
  /**
   * The user has pasted some text with multiple characters or run a command that adds multiple character.
   *
   * `onExit` should be called but the previous match should be retested as it's possible that it's been extended.
   */
  End = 'exit-end',

  /**
   * The suggestion has been removed.
   */
  Removed = 'delete',

  /**
   * The user has pasted some text with multiple characters or run a command that adds multiple characters
   * somewhere within the active suggestion.
   * e.g. `@abc` -> `@ab123 asdf aiti c`
   *
   * `onExit` should be called but the previous match should be retested as it's possible that it's been extended.
   */
  Split = 'exit-split',

  /**
   * The user has pasted some text with multiple characters or run a command that adds multiple characters
   * right after the initial multi-character.
   * e.g. `@abc` -> `@ this is newabc`
   *
   * In this case it is best to remove the mention completely.
   */
  InvalidSplit = 'invalid-exit-split',

  /**
   * User has moved out of the suggestion at the end. This will typically be using arrow keys, but can also be
   * via a mouse click or custom command. All that has changed is the cursor position.
   */
  MoveEnd = 'move-end',

  /**
   * User has moved out of the suggestion but from the beginning. This can be via the arrow keys but can also be
   * via a mouse click or custom command. All that changed is the cursor position.
   */
  MoveStart = 'move-start',

  /**
   * The user has jumped to another suggestion which occurs afterwards in the editor. This can be via a click,
   * a keyboard jump or custom commands. In this case since there is still an active suggestion it will trigger
   * both an `onExit` and `onChange` call.
   */
  JumpForward = 'jump-forward-exit',

  /**
   * The user has jumped to another suggestion which occurs before the previous suggestion in the editor. This can
   * happen via a click, a keyboard jump (END) or a custom command. In this case since there is still an active
   * suggestion it will trigger both an `onExit` and `onChange` call.
   */
  JumpBackward = 'jump-backward-exit',

  /**
   * The user has selected some text outside the current selection, this can trigger
   * an exit. This can be from a triple click to select the line or Ctrl-A to select all.
   */
  SelectionOutside = 'selection-outside',
}

/**
 * The potential reason for changes
 */
export enum ChangeReason {
  /**
   * The user has entered or started a new suggestion.
   */
  Start = 'start',

  /**
   * A changed happened to the character. This can be addition, deletion or replacement.
   */
  Text = 'change-character',

  /**
   * A change happened to the selection status which was not purely a move.
   * The selection area may have been increased.
   */
  SelectionInside = 'selection-inside',

  /**
   * The cursor was moved.
   */
  Move = 'move',

  /**
   * The user has moved from one suggestion to another suggestion earlier in the document.
   */
  JumpBackward = 'jump-backward-change',

  /**
   * The user has moved from one suggestion to another suggestion further along in the document.
   */
  JumpForward = 'jump-forward-change',
}
