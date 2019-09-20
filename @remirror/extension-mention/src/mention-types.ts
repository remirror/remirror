import {
  Attrs,
  EditorViewParams,
  FromToParams,
  MakeRequired,
  MarkExtensionOptions,
  MarkTypeParams,
} from '@remirror/core';

export interface OptionalMentionExtensionParams {
  /**
   * The text to append to the replacement.
   *
   * @defaultValue '''
   */
  appendText?: string;

  /**
   * The type of replacement to use. By default the command will only replace text up the the cursor position.
   *
   * To force replacement of the whole match regardless of where in the match the cursor is placed set this to
   * `full`.
   *
   * @defaultValue 'full'
   */
  replacementType?: SuggestionReplacementType;
}

/**
 * The attrs that will be added to the node.
 * ID and label are plucked and used while attributes like href and role can be assigned as desired.
 */
export type MentionExtensionAttrs = Attrs<
  OptionalMentionExtensionParams & {
    /**
     * A unique identifier for the suggestions node
     */
    id: string;

    /**
     * The text to be placed within the suggestions node
     */
    label: string;

    /**
     * The name of the matched char
     */
    name?: string;

    /**
     * The range of the requested selection.
     */
    range?: FromToEndParams;
  }
>;

export interface SuggestionMatcher {
  /**
   * The character to match against
   *
   * @defaultValue '@'
   */
  char: string;

  /**
   * Whether to only match from the start of the line
   *
   * @defaultValue `false`
   */
  startOfLine: boolean;

  /**
   * A regex containing all supported characters.
   *
   * @defaultValue `/[\w\d_]+/`
   */
  supportedCharacters: RegExp | string;

  /**
   * Name of matching character - This will be appended to the classnames
   *
   * @defaultValue 'at'
   */
  name: string;
}

export type OptionalSuggestionMatcher = MakeRequired<Partial<SuggestionMatcher>, 'char' | 'name'>;

export interface MatchLength {
  /**
   * The complete match independent of the cursor position.
   */
  full: string;

  /**
   * This value is a partial match which ends at the position of the cursor within the matching text.
   */
  partial: string;
}

/**
 *
 */
export interface FromToEndParams extends FromToParams {
  /**
   * The absolute end of the matching string.
   */
  end: number;
}

export interface SuggestionStateMatch
  extends Pick<SuggestionMatcher, 'name' | 'char'>,
    SuggestionMatcherParams {
  /**
   * Range of current match.
   * - `from` is the start
   * - `to` is cursor position
   * - `end` is the end of the match
   */
  range: FromToEndParams;

  /**
   * Current query of match which doesn't include the match character.
   */
  query: MatchLength;

  /**
   * Full text of match including the activation character e.g. `'@awesome'`.
   */
  text: MatchLength;

  /**
   * The characters that the matcher supports
   */
  supportedCharacters: RegExp;
}

export interface SuggestionMatchParams {
  /**
   * The match that will be triggered.
   */
  match: SuggestionStateMatch;
}

/**
 * Determines whether to replace the full match or the partial match (up to the cursor position).
 */
export type SuggestionReplacementType = 'full' | 'partial';

export interface SuggestionCommandParams extends MarkTypeParams, OptionalMentionExtensionParams {
  attrs: MentionExtensionAttrs;
  range: FromToEndParams;
}

export interface SuggestionCallbackParams extends SuggestionStateMatch, EditorViewParams, SuggestionActions {}

export interface OnKeyDownParams extends SuggestionStateMatch, EditorViewParams {
  /**
   * The keyboard event
   */
  event: KeyboardEvent;
}

export interface ReasonParams<GReason> {
  /**
   * The reason this callback was triggered. This can be used to determine the action to use in your own code.
   */
  reason: GReason;
}

export interface OnChangeCallbackParams extends SuggestionCallbackParams, ReasonParams<ChangeReason> {}

export interface OnExitCallbackParams extends SuggestionCallbackParams, ReasonParams<ExitReason> {}

/**
 * The options passed into a mention
 */
export interface MentionExtensionOptions extends MarkExtensionOptions {
  /**
   * Provide customs class names for the completed mention
   */
  mentionClassName?: string;

  /**
   * Provide a custom tag for the mention
   */
  readonly tag?: keyof HTMLElementTagNameMap;

  /**
   * Provide a custom matcher with options
   */
  matchers?: OptionalSuggestionMatcher[];

  /**
   * Text to append after the mention has been added.
   *
   * @defaultValue ' '
   *
   * TODO move this into the `matchers` option as a property of the SuggestionMatcher
   */
  appendText?: string;

  /**
   * Class name to use for the decoration (while the plugin is still being written)
   */
  suggestionClassName?: string;

  /**
   * Tag which wraps an active match
   */
  decorationsTag?: keyof HTMLElementTagNameMap;

  /**
   * Called when a suggestion is active and has changed.
   *
   * @defaultValue `() => void`
   */
  onChange?(params: OnChangeCallbackParams): void;

  /**
   * Called when a suggestion is exited with the pre-exit match.
   * Can be used to force the command to run e.g. when no match was found but a hash
   * should still be created this can be used to call the command parameter and trigger the mention being created.
   *
   * @defaultValue `() => void`
   */
  onExit?(params: OnExitCallbackParams): void;

  /**
   * Called for each character entry and can be used to disable certain characters.
   *
   * @remarks
   * For example you may want to disable all `@` symbols while the `at` matcher is active.
   * Return true to stop the default character action.
   *
   * @defaultValue `() => false`
   */
  onCharacterEntry?(params: OnCharacterEntryParams): boolean;

  /**
   * An object that describes how certain key bindings should be handled.
   *
   * Return `true` to prevent any further prosemirror actions or return `false` to allow prosemirror to continue.
   */
  keyBindings?: SuggestionKeyBindingMap;
}

export interface OnCharacterEntryParams extends SuggestionCallbackParams {
  /**
   * The text entry that was received.
   */
  entry: FromToParams & { text: string };
}

export interface SuggestionKeyBindingParams extends SuggestionCallbackParams {
  /**
   * The native keyboard event.
   */
  event: KeyboardEvent;
}

/**
 * A method for performing actions when a certain key / patter is pressed.
 *
 * Return true to prevent any further bubbling of the key event and to stop other handlers
 * from also processing the event.
 */
export type SuggestionKeyBinding = (params: SuggestionKeyBindingParams) => boolean | void;

/**
 * The handler callback signature.
 */
export type SuggestionCallback = (params: SuggestionCallbackParams) => void;

/**
 * The SuggestionKeyBinding object.
 */
export type SuggestionKeyBindingMap = Partial<
  Record<'Enter' | 'ArrowDown' | 'ArrowUp' | 'Esc' | 'Delete' | 'Backspace', SuggestionKeyBinding>
> &
  Record<string, SuggestionKeyBinding>;

/**
 * A suggestion has two stage. When it is `new` and when it has already been created
 * and is now being `edit`ed.
 *
 * Separating the stages allows for greater control in how mentions are updated.
 */
export type SuggestionStage = 'new' | 'edit';

export type SuggestionCommandAttrs = Attrs<
  Partial<Pick<MentionExtensionAttrs, 'id' | 'label' | 'appendText' | 'replacementType'>>
>;
export interface SuggestionActions {
  /**
   * Create a mention for the first time
   */
  create(attrs: MentionExtensionAttrs): void;

  /**
   * Update the active mention
   */
  update(attrs: MentionExtensionAttrs): void;

  /**
   * Remove the active suggestion
   */
  remove(attrs: Attrs<FromToParams>): void;

  /**
   * A command automatically provides some default.
   *
   * This is the recommended option to use.
   */
  command(attrs: SuggestionCommandAttrs): void;

  /**
   * The current stage of the focused mention. Can be used to decide which action to use.
   */
  stage: SuggestionStage;
}

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
   * A change happened to the selection status.
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

export interface SuggestionMatcherParams {
  /**
   * The matcher to search through.
   */
  matcher: Partial<SuggestionMatcher>;
}

export interface SuggestionStateMatchReason<GReason> extends SuggestionStateMatch, ReasonParams<GReason> {}

export interface SuggestionReasonMap {
  /**
   * Reasons triggering the onChange handler.
   */
  change?: SuggestionStateMatchReason<ChangeReason>;

  /**
   * Reasons triggering the `onExit` handler
   */
  exit?: SuggestionStateMatchReason<ExitReason>;
}

/**
 * Compares two matches.
 */
export interface CompareMatchParams {
  /**
   * The initial match
   */
  prev: SuggestionStateMatch;

  /**
   * The current match
   */
  next: SuggestionStateMatch;
}

export interface ReasonMatchParams<GReason> {
  /**
   * The match with its reason property.
   */
  match: SuggestionStateMatchReason<GReason>;
}

/**
 * Compares two matches.
 */
export interface CompareMatchParams {
  /**
   * The initial match
   */
  prev: SuggestionStateMatch;

  /**
   * The current match
   */
  next: SuggestionStateMatch;
}

export type MentionExtensionCommands = 'createMention' | 'updateMention' | 'removeMention';
