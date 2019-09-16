import {
  AnyFunction,
  Attrs,
  EditorSchema,
  EditorStateParams,
  EditorViewParams,
  FromToParams,
  MakeRequired,
  MarkTypeParams,
} from '@remirror/core-types';
import { ChangeReason, ExitReason } from './suggest-constants';

export interface Suggester<GSchema extends EditorSchema = any> extends OptionalSuggestMatcher {
  /**
   * If true a match is triggered as soon as the match character is typed. When
   * false there must be an active query with at least one non-char character.
   *
   * @default true
   */
  immediateMatch?: boolean;

  /**
   * Text to append after the mention has been added.
   *
   * @defaultValue ' '
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
   *
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
  keyBindings?: SuggestKeyBindingMap;

  /**
   * Create the suggested actions which are made available to the `onExit` and
   * on`onChange` handlers.
   *
   * Suggested actions are useful for developing plugins and extensions which
   * provide useful defaults for managing the suggestion lifecycle.
   */
  createSuggestActions?(params: CreateSuggestActionsParams): DefaultSuggestActions;

  /**
   * Check the current match and editor state to determine whether this match
   * is being `new`ly created or `edit`ed.
   */
  getStage?(params: GetStageParams<GSchema>): SuggestStage;
}

export interface SuggestMatcher {
  /**
   * The character to match against
   *
   * @defaultValue '@'
   */
  char: string;

  /**
   * Whether to only match from the start of the line
   *
   * @defaultValue false
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

export interface OptionalMentionExtensionParams {
  /**
   * The text to append to the replacement.
   *
   * @default '''
   */
  appendText?: string;

  /**
   * The type of replacement to use. By default the command will only replace text up the the cursor position.
   *
   * To force replacement of the whole match regardless of where in the match the cursor is placed set this to
   * `full`.
   *
   * @default 'full'
   */
  replacementType?: SuggestReplacementType;
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

export interface SuggestMatcher {
  /**
   * The character to match against
   *
   * @defaultValue '@'
   */
  char: string;

  /**
   * Whether to only match from the start of the line
   *
   * @defaultValue false
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

export interface CreateSuggestActionsParams
  extends Partial<ReasonParams>,
    SuggestStateMatchParams,
    StageParams {}

export interface GetStageParams<GSchema extends EditorSchema = any>
  extends SuggestStateMatchParams,
    EditorStateParams<GSchema> {}

/**
 * Determines whether to replace the full match or the partial match (up to the cursor position).
 */
export type SuggestReplacementType = 'full' | 'partial';

export interface SuggestCommandParams extends MarkTypeParams, OptionalMentionExtensionParams {
  attrs: MentionExtensionAttrs;
  range: FromToEndParams;
}

export interface SuggestCallbackParams
  extends SuggestStateMatch,
    EditorViewParams,
    DefaultSuggestActions,
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

export interface OnChangeCallbackParams extends SuggestCallbackParams, ReasonParams<ChangeReason> {}

export interface OnExitCallbackParams extends SuggestCallbackParams, ReasonParams<ExitReason> {}

export interface OnCharacterEntryParams extends SuggestCallbackParams {
  /**
   * The text entry that was received.
   */
  entry: FromToParams & { text: string };
}

export interface SuggestKeyBindingParams extends SuggestCallbackParams {
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
export type SuggestKeyBinding = (params: SuggestKeyBindingParams) => boolean | void;

/**
 * The handler callback signature.
 */
export type SuggestCallback = (params: SuggestCallbackParams) => void;

/**
 * The SuggestKeyBinding object.
 */
export type SuggestKeyBindingMap = Partial<
  Record<
    'Enter' | 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight' | 'Esc' | 'Delete' | 'Backspace',
    SuggestKeyBinding
  >
> &
  Record<string, SuggestKeyBinding>;

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

export type SuggestCommandAttrs = Attrs<
  Partial<Pick<MentionExtensionAttrs, 'id' | 'label' | 'appendText' | 'replacementType'>>
>;

export interface BaseSuggestActions {
  create: AnyFunction;
  update: AnyFunction;
  remove: AnyFunction;
  command: AnyFunction;
}

export interface DefaultSuggestActions extends BaseSuggestActions {
  /**
   * Create the suggestion for the first time
   */
  create(attrs?: Attrs): void;

  /**
   * Update the active suggestion when suggestions are editable.
   */
  update(attrs?: Attrs): void;

  /**
   * Remove the active suggestion, where this is possible.
   */
  remove(attrs?: Attrs): void;

  /**
   * A command which automatically provides the default action.
   *
   * This is the recommended option to use an should typically fall back to the
   * desired `update` `remove` or `create` action.
   */
  command(attrs?: Attrs): void;
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
