import {
  Attrs,
  CommandFunction,
  EditorSchema,
  EditorView,
  FromToParams,
  MakeRequired,
  NodeExtensionOptions,
} from '@remirror/core';

/**
 * The attrs that will be added to the node.
 * ID and label are plucked and used while attributes like href and role can be assigned as desired.
 */
export interface MentionNodeAttrs extends Attrs {
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
}

export interface SuggestionsMatcher {
  /**
   * The character to match against
   *
   * @default '@'
   */
  char: string;

  /**
   * Whether to only match from the start of the line
   *
   * @default false
   */
  startOfLine: boolean;

  /**
   * A regex containing all supported characters.
   *
   * @default /[\w\d_]+/
   */
  supportedCharacters: RegExp | string;

  /**
   * Name of matching character - This will be appended to the classnames
   *
   * @default 'at'
   */
  name: string;
}

export type OptionalSuggestionsMatcher = MakeRequired<Partial<SuggestionsMatcher>, 'char' | 'name'>;

export interface SuggestionStateField extends Pick<SuggestionsMatcher, 'name' | 'char'> {
  /**
   * Range of current match
   */
  range: FromToParams;

  /**
   * Current query of match which doesn't include the match character
   */
  query: string;

  /**
   * Full string of match including the activation character e.g. `'@awesome'`
   */
  text: string;
}
export interface SuggestionsCommandParams {
  attrs?: Attrs;
  range: FromToParams | null;
  schema: EditorSchema;
  appendText?: string;
}
export interface SuggestionsCallbackParams extends SuggestionStateField {
  view: EditorView;
  command(attrs: MentionNodeAttrs): void;
}
export interface OnKeyDownParams {
  view: EditorView;
  event: KeyboardEvent;
  range: FromToParams | null;
}

/**
 * The options passed into a mention
 */
export interface MentionOptions extends NodeExtensionOptions {
  /**
   * Provide customs class names for the completed mention
   */
  mentionClassName?: string;

  /**
   * Provide a custom tag for the mention
   */
  readonly tag?: keyof HTMLElementTagNameMap;

  /**
   * Determine whether the mention should be editable or not
   */
  editable?: boolean;

  /**
   * Determine whether the mention should be be selectable
   */
  selectable?: boolean;

  /**
   * Provide a custom matcher with options
   */
  matchers?: OptionalSuggestionsMatcher[];

  /**
   * Text to append after the mention has been added.
   *
   * @default ' '
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
   * Custom command to fire when a match has been made
   */
  command?(params: SuggestionsCommandParams): CommandFunction;

  /**
   * Called when a suggestion is entered for the first time.
   *
   * @default () => void
   */
  onEnter?(params: SuggestionsCallbackParams): void;

  /**
   * Called when a suggestion is active and has changed.
   *
   * @default () => void
   */
  onChange?(params: SuggestionsCallbackParams): void;

  /**
   * Called when a suggestion is exited with the pre-exit match.
   * Can be used to force the command to run e.g. when no match was found but a hash
   * should still be created this can be used to call the command parameter and trigger the mention being created.
   *
   * @default () => void
   */
  onExit?(params: SuggestionsCallbackParams): void;

  /**
   * Called for every key press when a suggestion is active.
   * Must return a boolean.
   *
   * Return to true to prevent the any further keydown actions and run what you'd like to run.
   *
   * @default () => false
   */
  onKeyDown?(params: OnKeyDownParams): boolean;
}

/**
 * The action taken on a suggestion
 */
export enum ActionTaken {
  /**
   * The suggestion is still active and nothing has changed except for the cursor position
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
