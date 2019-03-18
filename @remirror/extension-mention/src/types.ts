import {
  Attrs,
  CommandFunction,
  EditorSchema,
  EditorView,
  FromTo,
  MakeRequired,
  NodeExtensionOptions,
} from '@remirror/core';
/**
 * The attrs that will be added to the node.
 * ID and label are plucked and used while attributes like href and role can be assigned as desired.
 */
export interface NodeAttrs extends Attrs {
  /**
   * A unique identifier for the suggestions node
   */
  id: string;
  /**
   * The text to be placed within the suggestions node
   */
  label: string;
}
export interface SuggestionsMatcher {
  char: string;
  startOfLine: boolean;
  supportedCharacters: RegExp | string;
}
export interface SuggestionStateField {
  /** Range of current match */
  range: FromTo;
  /** Current query of match which doesn't include the match character */
  query: string;
  /** Full string of match including the activation character e.g. `'@awesome'` */
  text: string;
}
export interface SuggestionsCommandParams {
  attrs?: Attrs;
  range: FromTo | null;
  schema: EditorSchema;
  appendText?: string;
}
export interface SuggestionsCallbackParams extends SuggestionStateField {
  view: EditorView;
  command(attrs: NodeAttrs): void;
}
export interface OnKeyDownParams {
  view: EditorView;
  event: KeyboardEvent;
  range: FromTo | null;
}

export interface MentionOptions<GName extends string> extends NodeExtensionOptions {
  /**
   * Allows for multiple mentions extensions to be registered for one editor.
   * The name must begin with 'mention' so as not to pollute the namespaces.
   */
  name: GName;
  /** Provide customs class names for the completed mention */
  mentionClassName?: string;
  /** Provide a custom tag for the mention */
  readonly tag?: keyof HTMLElementTagNameMap;
  /** Determine whether the mention should be editable or not */
  editable?: boolean;
  /** Determine whether the mention should be be selectable */
  selectable?: boolean;
  /**
   * Provide a custom matcher with options
   *
   * @default `{char:'@',startOfLine:false,supportedCharacters:/[\w\d_]+/}`
   */
  matcher?: MakeRequired<Partial<SuggestionsMatcher>, 'char'>;
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
  /** Tag which wraps an active match */
  decorationsTag?: keyof HTMLElementTagNameMap;
  /** Custom command to fire when a match has been made */
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
   * @defualt () => void
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
  /** The suggestion is still active and nothing has changed except for the cursor position */
  Moved = 'moved',
  /** The suggestion wasn't active before and now it is active */
  Entered = 'entered',
  /** The suggestion was active before and not it is no longer active */
  Exited = 'exited',
  /** The suggestion query has changed either by typing or deleting characters */
  Changed = 'changed',
}
