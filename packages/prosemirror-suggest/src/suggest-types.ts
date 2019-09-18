import {
  AnyFunction,
  EditorStateParams,
  EditorViewParams,
  FromToParams,
  MakeRequired,
} from '@remirror/core-types';
import { ChangeReason, ExitReason } from './suggest-constants';

export interface Suggester<GCommand extends AnyFunction<void> = AnyFunction<void>>
  extends OptionalSuggestMatcher {
  /**
   * Sets the characters that need to be present after the initial character
   * match before a match is triggered.
   *
   * For example with `char` = `@` the following is true.
   *
   * - `matchOffset: 0` matches `'@'` immediately
   * - `matchOffset: 1` matches `'@a'` but not `'@'`
   * - `matchOffset: 2` matches `'@ab'` but not `'@a'` or `'@'`
   * - `matchOffset: 3` matches `'@abc'` but not `'@ab'` or `'@a'` or `'@'`
   * - And so on...
   *
   * @default 0
   */
  matchOffset?: number;

  /**
   * Text to append after the mention has been added.
   *
   * @defaultValue ''
   */
  appendText?: string;

  /**
   * Class name to use for the decoration (while the plugin is still being written)
   *
   * @default 'suggestion'
   */
  suggestionClassName?: string;

  /**
   * Tag which wraps an active match.
   *
   * @default 'span'
   */
  decorationsTag?: keyof HTMLElementTagNameMap;

  /**
   * Whether to omit the decorations from being created.
   */
  ignoreDecorations?: boolean;

  /**
   * Called whenever a suggestion becomes active or changes in anyway.
   * It receives a parameters object with the `reason` for the change
   * for more granular control.
   *
   * @defaultValue `() => void`
   */
  onChange?(params: SuggestChangeHandlerParams<GCommand>): void;

  /**
   * Called when a suggestion is exited with the pre-exit match value.
   *
   * Can be used to force the command to run e.g. when no match was found but a hash
   * should still be created this can be used to call the command parameter and trigger
   * whatever action is felt required.
   *
   * @defaultValue `() => void`
   */
  onExit?(params: SuggestExitHandlerParams<GCommand>): void;

  /**
   * Called for each character entry and can be used to disable certain characters.
   *
   * @remarks
   * For example you may want to disable all `@` symbols while the `at` matcher is active.
   * Return true to stop the default character action.
   *
   * @defaultValue `() => false`
   */
  onCharacterEntry?(params: SuggestCharacterEntryParams<GCommand>): boolean;

  /**
   * An object that describes how certain key bindings should be handled.
   *
   * Return `true` to prevent any further prosemirror actions or return `false` to allow prosemirror to continue.
   */
  keyBindings?: SuggestKeyBindingMap<GCommand>;

  /**
   * Check the current match and editor state to determine whether this match
   * is being `new`ly created or `edit`ed.
   */
  getStage?(params: GetStageParams): SuggestStage;

  /**
   * Create the suggested actions which are made available to the `onExit` and
   * on`onChange` handlers.
   *
   * Suggested actions are useful for developing plugins and extensions which
   * provide useful defaults for managing the suggestion lifecycle.
   */
  createCommand?(params: CreateSuggestCommandParams): GCommand;
}

export interface SuggestMatcher {
  /**
   * The character to match against.
   *
   * For example if building a mention plugin you might want to set this to `@`.
   * Multi string characters are theoretically supported (although currently
   * untested).
   */
  char: string;

  /**
   * Whether to only match from the start of the line
   *
   * @defaultValue false
   */
  startOfLine: boolean;

  /**
   * A regex containing all supported characters when within a suggestion.
   *
   * @defaultValue `/[\w\d_]+/`
   */
  supportedCharacters: RegExp | string;

  /**
   * A regex expression used to validate the text directly before the match.
   * By default this allows zero width characters and space characters.
   *
   * @defaultValue `/^[\s\0]?$/`
   */
  validPrefixCharacters: RegExp | string;

  /**
   * A regex expression used to invalidate the text directly before the match.
   * This has preference over the `validPrefixCharacters` option and when it is
   * defined only it will be looked at in determining whether a prefix is valid.
   *
   * @defaultValue `undefined`
   */
  invalidPrefixCharacters: RegExp | string | undefined;

  /**
   * Name of matching character - This will be appended to the classnames
   */
  name: string;
}

export type OptionalSuggestMatcher = MakeRequired<Partial<SuggestMatcher>, 'char' | 'name'>;

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

export interface SuggestStateMatch extends Pick<SuggestMatcher, 'name' | 'char'>, SuggesterParams {
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

export interface SuggestStateMatchParams {
  /**
   * The match that will be triggered.
   */
  match: SuggestStateMatch;
}

export interface CreateSuggestCommandParams
  extends Partial<ReasonParams>,
    EditorViewParams,
    SuggestStateMatchParams,
    StageParams {}

export interface GetStageParams extends SuggestStateMatchParams, EditorStateParams {}

/**
 * Determines whether to replace the full match or the partial match (up to the cursor position).
 */
export type SuggestReplacementType = 'full' | 'partial';

export interface SuggestCallbackParams<GCommand extends AnyFunction<void> = AnyFunction<void>>
  extends SuggestStateMatch,
    EditorViewParams,
    SuggestCommandParams<GCommand>,
    StageParams {}

export interface StageParams {
  /**
   * The current stage of the focused mention. Can be used to decide which action to use.
   */
  stage: SuggestStage;
}

export interface OnKeyDownParams extends SuggestStateMatch, EditorViewParams {
  /**
   * The keyboard event
   */
  event: KeyboardEvent;
}

export interface ReasonParams<GReason = ExitReason | ChangeReason> {
  /**
   * The reason this callback was triggered. This can be used to determine the action to use in your own code.
   */
  reason: GReason;
}

export interface SuggestChangeHandlerParams<GCommand extends AnyFunction<void> = AnyFunction<void>>
  extends SuggestCallbackParams<GCommand>,
    ReasonParams<ChangeReason> {}

export interface SuggestExitHandlerParams<GCommand extends AnyFunction<void> = AnyFunction<void>>
  extends SuggestCallbackParams<GCommand>,
    ReasonParams<ExitReason> {}

export interface SuggestCharacterEntryParams<GCommand extends AnyFunction<void> = AnyFunction<void>>
  extends SuggestCallbackParams<GCommand> {
  /**
   * The text entry that was received.
   */
  entry: FromToParams & { text: string };
}

export interface SuggestKeyBindingParams<GCommand extends AnyFunction<void> = AnyFunction<void>>
  extends SuggestCallbackParams<GCommand> {
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
export type SuggestKeyBinding<GCommand extends AnyFunction<void> = AnyFunction<void>> = (
  params: SuggestKeyBindingParams<GCommand>,
) => boolean | void;

/**
 * The handler callback signature.
 */
export type SuggestCallback<GCommand extends AnyFunction<void> = AnyFunction<void>> = (
  params: SuggestCallbackParams<GCommand>,
) => void;

/**
 * The SuggestKeyBinding object.
 */
export type SuggestKeyBindingMap<GCommand extends AnyFunction<void> = AnyFunction<void>> = Partial<
  Record<
    'Enter' | 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight' | 'Esc' | 'Delete' | 'Backspace',
    SuggestKeyBinding<GCommand>
  >
> &
  Record<string, SuggestKeyBinding<GCommand>>;

/**
 * A suggestion can have two stages. When it is `new` and when it has already been created
 * and is now being `edit`ed.
 *
 * Separating the stages allows for greater control in how mentions are updated.
 *
 * The edit state is only applicable for editable suggestions. Most nodes and
 * text insertions can't be edited once created.
 */
export type SuggestStage = 'new' | 'edit';

export interface SuggestCommandParams<GCommand extends AnyFunction<void> = AnyFunction<void>> {
  /**
   * A command which automatically applies the provided attributes to the command.
   */
  command: GCommand;
}

export interface SuggesterParams {
  /**
   * The suggester to use for finding matches.
   */
  suggester: Required<Suggester>;
}

export interface SuggestStateMatchReason<GReason> extends SuggestStateMatch, ReasonParams<GReason> {}

export interface SuggestReasonMap {
  /**
   * Reasons triggering the onChange handler.
   */
  change?: SuggestStateMatchReason<ChangeReason>;

  /**
   * Reasons triggering the `onExit` handler
   */
  exit?: SuggestStateMatchReason<ExitReason>;
}

/**
 * Compares two matches.
 */
export interface CompareMatchParams {
  /**
   * The initial match
   */
  prev: SuggestStateMatch;

  /**
   * The current match
   */
  next: SuggestStateMatch;
}

export interface ReasonMatchParams<GReason> {
  /**
   * The match with its reason property.
   */
  match: SuggestStateMatchReason<GReason>;
}

/**
 * Compares two matches.
 */
export interface CompareMatchParams {
  /**
   * The initial match
   */
  prev: SuggestStateMatch;

  /**
   * The current match
   */
  next: SuggestStateMatch;
}
