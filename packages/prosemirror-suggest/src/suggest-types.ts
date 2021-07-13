/**
 * This [[`Suggester`]] interface defines all the options required to create a
 * suggestion within your editor.
 *
 * @remarks
 *
 * The options are passed to the [[`suggest`]] method which uses them.
 */
export interface Suggester<Schema extends EditorSchema = EditorSchema> {
  /**
   * The activation character(s) to match against.
   *
   * @remarks
   *
   * For example if building a mention plugin you might want to set this to `@`.
   * Multi string characters are theoretically supported (although currently
   * untested).
   *
   * The character does not have to be unique amongst the suggesters and the
   * eventually matched suggester will depend on the order in which the
   * suggesters are added to the plugin.
   *
   * Please note that when this is a plain string, it is assumed to be a plain
   * string. Which means that it will be matched as it is and **not** as a
   * string representation of `RegExp`.
   *
   * It can also be regex, but the regex support has a few caveats.
   *
   * - All flags specified will be ignored.
   * - Avoid using `^` to denote the start of line since that can conflict with
   *   the [[`Suggester.startOfLine`]] value and cause an invalid regex.
   */
  char: RegExp | string;

  /**
   * A unique identifier for the suggester.
   *
   * @remarks
   *
   * This should be globally unique amongst all suggesters registered with this
   * plugin. The plugin will throw an error if duplicates names are used.
   *
   * Typically this value will be appended to classes to uniquely identify them
   * amongst the suggesters and even in your own nodes and mark.
   */
  name: string;

  /**
   * Set this to true so that the `onChange` handler is called in the
   * `appendTransaction` ProseMirror plugin hook instead of the the view update
   * handler.
   *
   * This tends to work better with updates that are run multiple times while
   * preserving the redo/undo history stack.
   *
   * Please note this should only be set to true if updates are expected to be
   * synchronous and immediately available. If you're planning on packaging the
   * update into a command which dispatches the update in response to user
   * interaction, then you're better off leaving this as false.
   *
   * An example of how it's being used is in the `autoLink` functionality for
   * the `LinkExtension` in remirror. Since autolinking is purely based on
   * configuration and not on user interaction it's possible to create the links
   * automatically within the `appendTransaction` hook.
   *
   * @default false
   */
  appendTransaction?: boolean;

  /**
   * Called whenever a suggester becomes active or changes in any way.
   *
   * @remarks
   *
   * It receives a parameters object with the `changeReason` or `exitReason` to
   * let you know whether the change was an exit and what caused the change.
   */
  onChange: SuggestChangeHandler<Schema>;

  /**
   * The priority for this suggester.
   *
   * A higher number means that this will be added to the list earlier. If
   * you're using this within the context of `remirror` you can also use the
   * `ExtensionPriority` from the `remirror/core` library.
   *
   * @default 50
   */
  priority?: number;

  /**
   * When set to true, matches will only be recognised at the start of a new
   * line.
   *
   * @default false
   */
  startOfLine?: boolean;

  /**
   * A regex containing all supported characters when within an active
   * suggester.
   *
   * @default /[\w\d_]+/
   */
  supportedCharacters?: RegExp | string;

  /**
   * A regex expression used to validate the text directly before the match.
   *
   * @remarks
   *
   * This will be used when {@link Suggester.invalidPrefixCharacters} is not
   * provided.
   *
   * @default /^[\s\0]?$/ - translation: only space and zero width characters
   * allowed.
   */
  validPrefixCharacters?: RegExp | string;

  /**
   * A regex expression used to invalidate the text directly before the match.
   *
   * @remarks
   *
   * This has preference over the `validPrefixCharacters` option and when it is
   * defined only it will be looked at in determining whether a prefix is valid.
   *
   * @default ''
   */
  invalidPrefixCharacters?: RegExp | string | null;

  /**
   * Sets the characters that need to be present after the initial character
   * match before a match is triggered.
   *
   * @remarks
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
   * Class name to use for the decoration while the suggester is active.
   *
   * @default 'suggest'
   */
  suggestClassName?: string;

  /**
   * Tag for the prosemirror decoration which wraps an active match.
   *
   * @default 'span'
   */
  suggestTag?: string;

  /**
   * Set a class for the ignored suggester decoration.
   *
   * @default null
   */
  ignoredClassName?: string | null;

  /**
   * Set a tag for the ignored suggester decoration.
   *
   * @default 'span'
   */
  ignoredTag?: string;

  /**
   * When true, decorations are not created when this mention is being edited.
   */
  disableDecorations?: boolean | ShouldDisableDecorations;

  /**
   * A list of node names which will be marked as invalid.
   *
   * @default []
   */
  invalidNodes?: string[];

  /**
   * A list of node names which will be marked as invalid. This takes priority
   * over `invalidNodes` if both properties are present.
   *
   * Setting this to an empty array would mean that this [[`Suggester`]] can
   * never match.
   *
   * @default null
   */
  validNodes?: string[] | null;

  /**
   * A list of node names which will be marked as invalid.
   *
   * @default []
   */
  invalidMarks?: string[];

  /**
   * A list of node names which will be marked as invalid. This takes priority
   * over `invalidMarks` if both properties are present.
   *
   * By setting this value to the empty array `[]`, you are telling this
   * [[`Suggester`]] to never match if any marks are found.
   *
   * @default null
   */
  validMarks?: string[] | null;

  /**
   * This is run after the `valid` and `invalid` node and mark checks regardless
   * of their outcomes and only when the current suggester has found a match at
   * the current position.
   *
   * It is a method of doing more advanced checking of the resolved position.
   * Perhaps checking the attributes on the marks `resolvedRange.$to.marks`, or
   * the checking the attributes of the direct parent node
   * `resolvedRange.$to.parent.attrs` to check if something is missing.
   */
  isValidPosition?: (
    resolvedRange: ResolvedRangeWithCursor<Schema>,
    match: SuggestMatch<Schema>,
  ) => boolean;

  /**
   * This is a utility option that may be necessary for you when building
   * editable mentions using `prosemirror-suggest`.
   *
   * By default `prosemirror-suggest` searches backwards from the current cursor
   * position to see if any text matches any of the configured suggesters. For
   * the majority of use cases this is perfectly acceptable behaviour.
   *
   * However, [#639](https://github.com/remirror/remirror/issues/639) shows that
   * it's possible to delete forward and make mentions invalid. Without adding
   * this option, the only solution to this problem would have required,
   * creating a custom plugin to check each state update and see if the next
   * character is still valid.
   *
   * This method removes this requirement. It is run on every single update
   * where there is a valid text selection after the current cursor position. It
   * makes use of the `appendTransaction` ProseMirror plugin hook and provides
   * you with a transaction (`tr`) which should be mutated with updates. These
   * updates are added to the updates for the editor and makes it much easier to
   * build `history` friendly functionality.
   *
   * This is called before all `onChange` handlers.
   *
   * @default null
   */
  checkNextValidSelection?: CheckNextValidSelection<Schema> | null;

  /**
   * Whether this suggester should only be valid for empty selections.
   *
   * @default false
   */
  emptySelectionsOnly?: boolean;

  /**
   * Whether the match should be case insensitive and ignore the case. This adds
   * the `i` flag to the regex used.
   *
   * @default false
   */
  caseInsensitive?: boolean;

  /**
   * When true support matches across multiple lines.
   *
   * @default false
   */
  multiline?: boolean;

  /**
   * Whether to capture the `char character as the first capture group.
   *
   * When this is set to true it will be the first matching group with
   * `match[1]`.
   *
   * @default true
   */
  captureChar?: boolean;
}

/**
 * A function for checking whether the next selection is valid.
 *
 * It is called for all registered suggesters before any of the onChange
 * handlers are fired.
 *
 * @param $pos - the next valid position that supports text selections.
 * @param tr - the transaction that can be mutated when `appendTransaction` is
 * set to true.
 * @param matches - the possibly undefined exit and change matcher names. These
 * can be used to check if the name matches the current suggester.
 */
export type CheckNextValidSelection<Schema extends EditorSchema = EditorSchema> = (
  $pos: ResolvedPos<Schema>,
  tr: Transaction<Schema>,
  matches: { change?: string; exit?: string },
) => Transaction | null | void;

/**
 * A function that can be used to determine whether the decoration should be set
 * or not.
 *
 * @param match - the current active match
 * @param resolvedRange - the range of the match with each position resolved.
 */
export type ShouldDisableDecorations = <Schema extends EditorSchema = EditorSchema>(
  state: EditorState<Schema>,
  match: Readonly<SuggestMatch<Schema>>,
) => boolean;

/**
 * The potential reasons for an exit of a mention.
 */
export enum ExitReason {
  /**
   * The user has pasted some text with multiple characters or run a command
   * that adds multiple characters.
   *
   * `onExit` should be called but the previous match should be retested as it's
   * possible that it's been extended.
   */
  End = 'exit-end',

  /**
   * The suggestion has been removed.
   */
  Removed = 'delete',

  /**
   * The user has pasted some text with multiple characters or run a command
   * that adds multiple characters somewhere within the active suggestion. e.g.
   * `@abc` -> `@ab123 asdf aiti c`
   *
   * `onExit` should be called but the previous match should be retested as it's
   * possible that it's been extended.
   */
  Split = 'exit-split',

  /**
   * The user has pasted some text with multiple characters or run a command
   * that adds multiple characters right after the initial multi-character. e.g.
   * `@abc` -> `@ this is newabc`
   *
   * In this case it is best to remove the mention completely.
   */
  InvalidSplit = 'invalid-exit-split',

  /**
   * User has moved out of the suggestion at the end. This can happen via using
   * arrow keys, but can also be via the suggestion no longer matching as the
   * user types, a mouse click or custom command. All that has changed is the
   * cursor position.
   */
  MoveEnd = 'move-end',

  /**
   * User has moved out of the suggestion but from the beginning. This can be
   * via the arrow keys but can also be via a mouse click or custom command. All
   * that changed is the cursor position.
   */
  MoveStart = 'move-start',

  /**
   * The user has jumped to another suggestion which occurs afterwards in the
   * editor. This can be via a click, a keyboard jump or custom commands. In
   * this case since there is still an active suggestion it will trigger both an
   * `onExit` and `onChange` call.
   */
  JumpForward = 'jump-forward-exit',

  /**
   * The user has jumped to another suggestion which occurs before the previous
   * suggestion in the editor. This can happen via a click, a keyboard jump
   * (END) or a custom command. In this case since there is still an active
   * suggestion it will trigger both an `onExit` and `onChange` call.
   */
  JumpBackward = 'jump-backward-exit',

  /**
   * The user has selected some text outside the current selection, this can
   * trigger an exit. This can be from a triple click to select the line or
   * Ctrl-A to select all.
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
   * A changed happened to the character. This can be addition, deletion or
   * replacement.
   */
  Text = 'change-character',

  /**
   * A change happened to the selection status which was not purely a move. The
   * selection area may have been increased.
   */
  SelectionInside = 'selection-inside',

  /**
   * The cursor was moved.
   */
  Move = 'move',

  /**
   * The user has moved from one suggestion to another suggestion earlier in the
   * document.
   */
  JumpBackward = 'jump-backward-change',

  /**
   * The user has moved from one suggestion to another suggestion further along
   * in the document.
   */
  JumpForward = 'jump-forward-change',
}

/**
 * The parameters needed for the [[`SuggestIgnoreProps.addIgnored`]] action
 * method available to the suggest plugin handlers.
 *
 * @remarks
 *
 * See:
 * - [[`RemoveIgnoredProps`]]
 */
export interface AddIgnoredProps extends RemoveIgnoredProps {
  /**
   * When `false` this will ignore the range for all matching suggesters. When
   * true the ignored suggesters will only be the ones provided by the name.
   */
  specific?: boolean;
}

/**
 * The parameters needed for the {@link SuggestIgnoreProps.removeIgnored}
 * action method available to the suggest plugin handlers.
 */
export interface RemoveIgnoredProps extends Pick<Suggester, 'name'> {
  /**
   * The starting point of the match that should be ignored.
   */
  from: number;
}

/**
 * A parameter builder interface describing the ignore methods available to the
 * [[`Suggester`]] handlers.
 */
export interface SuggestIgnoreProps {
  /**
   * Add a match target to the ignored matches.
   *
   * @remarks
   *
   * Until the activation character is deleted the `onChange` handler will no
   * longer be triggered for the matched character. It will be like the match
   * doesn't exist.
   *
   * By ignoring the activation character the plugin ensures that any further
   * matches from the activation character will be ignored.
   *
   * There are a number of use cases for this. You may chose to ignore a match
   * when:
   *
   * - The user presses the `escape` key to exit your suggestion dropdown.
   * - The user continues typing without selecting any of the options for the
   *   selection drop down.
   * - The user clicks outside of the suggesters dropdown.
   *
   * ```ts
   * const suggester = {
   *   onChange: ({ addIgnored, range: { from }, suggester: { char, name } }: SuggestExitHandlerProps) => {
   *     addIgnored({ from, char, name }); // Ignore this suggester
   *   },
   * }
   * ```
   */
  addIgnored: (props: AddIgnoredProps) => void;

  /**
   * When the name is provided remove all ignored decorations which match the
   * named suggester. Otherwise remove **all** ignored decorations from the
   * document.
   */
  clearIgnored: (name?: string) => void;

  /**
   * Use this method to skip the next `onChange` when the reason is an exit.
   *
   * @remarks
   *
   * This is useful when you manually call a command which applies the
   * suggestion outside of the `onChange` handler. When that happens `onChange`
   * will still be triggered since the document has now changed. If you don't
   * have the logic set up properly it may rerun your exit logic. This can lead
   * to mismatched transaction errors since the `onChange` handler is provided
   * the last active range and query when the reason is an exit, but these
   * values are probably no longer valid.
   *
   * This helper method can be applied to make life easier. Call it when running
   * a command in a click handler or key binding and you don't have to worry
   * about your `onChange` handler being called again and leading to a
   * mismatched transaction error.
   */
  ignoreNextExit: () => void;
}

/**
 * The match value with the full and partial text.
 *
 * @remarks
 *
 * For a suggester with a char `@` then the following text `@ab|c` where `|` is
 * the current cursor position will create a queryText with the following
 * signature.
 *
 * ```json
 * { "full": "abc", "partial": "ab" }
 * ```
 */
export interface MatchValue {
  /**
   * The complete match independent of the cursor position.
   */
  full: string;

  /**
   * This value is a partial match which ends at the position of the cursor
   * within the matching text.
   */
  partial: string;
}

/**
 * A range with the cursor attached.
 *
 * - `from` - describes the start position of the query, including the
 *   activation character.
 * - `to` - describes the end position of the match, so the point at which there
 *   is no longer an active suggest.
 * - `cursor` describes the cursor potion within that match.
 *
 * Depending on the use case you can decide which is most important in your
 * application.
 *
 * If you want to replace the whole match regardless of cursor position, then
 * `from` and `to` are all that you need.
 *
 * If you want to split the match and only replace up until the cursor while
 * preserving the remaining part of the match, then you can use `from`, `cursor`
 * for the initial replacement and then take the value between `cursor` and `to`
 * and append it in whatever way you feel works.
 */
export interface RangeWithCursor {
  /**
   * The absolute starting point of the matching string.
   */
  from: number;

  /**
   * The current cursor position, which may not be at the end of the full match.
   */
  cursor: number;

  /**
   * The absolute end of the matching string.
   */
  to: number;
}

export interface ResolvedRangeWithCursor<Schema extends EditorSchema = EditorSchema> {
  /**
   * The absolute starting point of the matching string as a [resolved
   * position](https://prosemirror.net/docs/ref/#model.Resolved_Positions).
   */
  $from: ResolvedPos<Schema>;

  /**
   * The current cursor position as a [resolved
   * position](https://prosemirror.net/docs/ref/#model.Resolved_Positions),
   * which may not be at the end of the full match.
   */
  $cursor: ResolvedPos<Schema>;

  /**
   * The absolute end of the matching string as a [resolved
   * position](https://prosemirror.net/docs/ref/#model.Resolved_Positions).
   */
  $to: ResolvedPos<Schema>;
}

/**
 * Describes the properties of a match which includes range and the text as well
 * as information of the suggester that created the match.
 *
 */
export interface SuggestMatch<Schema extends EditorSchema = EditorSchema>
  extends SuggesterProps<Schema> {
  /**
   * Range of current match; for example `@foo|bar` (where | is the cursor)
   * - `from` is the start (= 0)
   * - `to` is cursor position (= 4)
   * - `end` is the end of the match (= 7)
   */
  range: RangeWithCursor;

  /**
   * Current query of match which doesn't include the activation character.
   */
  query: MatchValue;

  /**
   * Full text of match including the activation character
   *
   * @remarks
   *
   * For a `char` of `'@'` and query of `'awesome'` `text.full` would be
   * `'@awesome'`.
   */
  text: MatchValue;

  /**
   * The raw regex match which caused this suggester to be triggered.
   *
   * - `rawMatch[0]` is always the full match.
   * - `rawMatch[1]` is always the matching character (or regex pattern).
   *
   * To make use of this you can set the [[`Suggester.supportedCharacters`]]
   * property to be a regex which included matching capture group segments.
   */
  match: RegExpExecArray;

  /**
   * The text after full match, up until the end of the text block.
   */
  textAfter: string;

  /**
   * The text before the full match, up until the beginning of the node.
   */
  textBefore: string;
}

export interface DocChangedProps {
  /**
   * - `true` when there was a changed in the editor content.
   * - `false` when only the selection changed.
   *
   * TODO currently unused. Should be used to differentiate between a cursor
   * exit using the keyboard navigation and a document update change typing
   * invalid character, space, etc...
   */
  docChanged: boolean;
}

/**
 * A parameter builder interface describing match found by the suggest plugin.
 */
export interface SuggestStateMatchProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * The match that will be triggered.
   */
  match: SuggestMatch<Schema>;
}

/**
 * A special parameter needed when creating editable suggester using prosemirror
 * `Marks`. The method should be called when removing a suggestion that was
 * identified by a prosemirror `Mark`.
 */
export interface SuggestMarkProps {
  /**
   * When managing suggesters with marks it is possible to remove a mark without
   * the change reflecting in the prosemirror state. This method should be used
   * when removing a suggestion if you are using prosemirror `Marks` to identify
   * the suggestion.
   *
   * When this method is called, `prosemirror-suggest` will handle the removal
   * of the mark in the next state update (during apply).
   */
  setMarkRemoved: () => void;
}

/**
 * A parameter builder interface indicating the reason the handler was called.
 *
 * @template Reason - Whether this is change or an exit reason.
 */
export interface ReasonProps {
  /**
   * The reason for the exit. Either this or the change reason must have a
   * value.
   */
  exitReason?: ExitReason;

  /**
   * The reason for the change. Either this or change reason must have a value..
   */
  changeReason?: ChangeReason;
}

/**
 * The parameter passed to the  [[`Suggester.onChange`]] method. It the
 * properties `changeReason` and `exitReason` which are available depending on
 * whether this is an exit or change.
 *
 * Exactly **ONE** will always be available. Unfortunately that's quite hard to
 * model in TypeScript without complicating all dependent types.
 */
export interface SuggestChangeHandlerProps<Schema extends EditorSchema = EditorSchema>
  extends SuggestMatchWithReason<Schema>,
    EditorViewProps<Schema>,
    SuggestIgnoreProps,
    SuggestMarkProps,
    Pick<Suggester<Schema>, 'name' | 'char'> {}

/**
 * The type signature of the `onChange` handler method.
 *
 * @param changeDetails - all the information related to the change that caused
 * this to be called.
 * @param tr - the transaction that can be updated when `appendTransaction` is
 * set to true.
 */
export type SuggestChangeHandler<Schema extends EditorSchema = EditorSchema> = (
  changeDetails: SuggestChangeHandlerProps<Schema>,
  tr: Transaction<Schema>,
) => void;

export interface SuggesterProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * The suggester to use for finding matches.
   */
  suggester: Required<Suggester<Schema>>;
}

/**
 * The matching suggester along with the reason, whether it is a `changeReason`
 * or an `exitReason`.
 */
export interface SuggestMatchWithReason<Schema extends EditorSchema = EditorSchema>
  extends SuggestMatch<Schema>,
    ReasonProps {}

/**
 * A mapping of the handler matches with their reasons for occurring within the
 * suggest state.
 */
export interface SuggestReasonMap<Schema extends EditorSchema = EditorSchema> {
  /**
   * Change reasons for triggering the change handler.
   */
  change?: SuggestMatchWithReason<Schema>;

  /**
   * Exit reasons for triggering the change handler.
   */
  exit?: SuggestMatchWithReason<Schema>;
}

/**
 * A parameter builder interface which adds the match property.
 *
 * @remarks
 *
 * This is used to build parameters for {@link Suggester} handler methods.
 *
 * @template Reason - Whether this is change or an exit reason.
 */
export interface ReasonMatchProps {
  /**
   * The match with its reason property.
   */
  match: SuggestMatchWithReason;
}

/**
 * A parameter builder interface which compares the previous and next match.
 *
 * @remarks
 *
 * It is used within the codebase to determine the kind of change that has
 * occurred (i.e. change or exit see {@link SuggestReasonMap}) and the reason
 * for that that change. See {@link ExitReason} {@link ChangeReason}
 */
export interface CompareMatchProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * The initial match
   */
  prev: SuggestMatch<Schema>;

  /**
   * The current match
   */
  next: SuggestMatch<Schema>;
}

/**
 * Makes specified keys of an interface optional while the rest stay the same.
 */
export type MakeOptional<Type extends object, Keys extends keyof Type> = Omit<Type, Keys> &
  { [Key in Keys]+?: Type[Key] };

export type EditorSchema = import('prosemirror-model').Schema<string, string>;

export type ProsemirrorNode<Schema extends EditorSchema = EditorSchema> =
  import('prosemirror-model').Node<Schema>;

export type Transaction<Schema extends EditorSchema = EditorSchema> =
  import('prosemirror-state').Transaction<Schema>;

/**
 * A parameter builder interface containing the `tr` property.
 *
 * @template Schema - the underlying editor schema.
 */
export interface TransactionProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * The prosemirror transaction
   */
  tr: Transaction<Schema>;
}

export type EditorState<Schema extends EditorSchema = EditorSchema> =
  import('prosemirror-state').EditorState<Schema>;

/**
 * A parameter builder interface containing the `state` property.
 *
 * @template Schema - the underlying editor schema.
 */
export interface EditorStateProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * A snapshot of the prosemirror editor state.
   */
  state: EditorState<Schema>;
}

export type ResolvedPos<Schema extends EditorSchema = EditorSchema> =
  import('prosemirror-model').ResolvedPos<Schema>;

/**
 * @template Schema - the underlying editor schema.
 */
export interface ResolvedPosProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * A prosemirror resolved pos with provides helpful context methods when
   * working with a position in the editor.
   *
   * In prosemirror suggest this always uses the lower bound of the text
   * selection.
   */
  $pos: ResolvedPos<Schema>;
}

export interface TextProps {
  /**
   * The text to insert or work with.
   */
  text: string;
}

export type EditorView<Schema extends EditorSchema = EditorSchema> =
  import('prosemirror-view').EditorView<Schema>;

/**
 * A parameter builder interface containing the `view` property.
 *
 * @template Schema - the underlying editor schema.
 */
export interface EditorViewProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * An instance of the ProseMirror editor `view`.
   */
  view: EditorView<Schema>;
}

export interface SelectionProps<Schema extends EditorSchema = EditorSchema> {
  /**
   * The text editor selection
   */
  selection: import('prosemirror-state').Selection<Schema>;
}
