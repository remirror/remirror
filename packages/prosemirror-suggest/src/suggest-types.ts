import {
  AnyFunction,
  EditorViewParameter,
  FromToParameter,
  TextParameter,
} from '@remirror/core-types';

import { ChangeReason, ExitReason } from './suggest-constants';

/**
 * This `Suggestion` interface defines all the options required to create a
 * suggestion within your editor.
 *
 * @remarks
 *
 * The options are passed to the {@link suggest} method which uses them.
 *
 * @typeParam Command - the command method a {@link Suggestion} makes available
 * to its handlers.
 */
export interface Suggestion<Command extends AnyFunction<void> = AnyFunction<void>> {
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
   * eventually matched suggester will depend on the specificity of the regex
   * the order in which the suggesters are added to the plugin.
   */
  char: string;

  /**
   * A unique identifier for the suggester.
   *
   * @remarks
   *
   * This should be globally unique amongst all suggesters registered with this
   * plugin. The plugin will through an error if duplicates names are found.
   *
   * Typically this value will be appended to classes.
   */
  name: string;

  /**
   * Whether to only match from the start of the line
   *
   * @defaultValue `false`
   */
  startOfLine?: boolean;

  /**
   * A regex containing all supported characters when within a suggestion.
   *
   * @defaultValue `/[\w\d_]+/`
   */
  supportedCharacters?: RegExp | string;

  /**
   * A regex expression used to validate the text directly before the match.
   *
   * @remarks
   *
   * This will be used when {@link Suggestion.invalidPrefixCharacters} is not
   * provided.
   *
   * @defaultValue `/^[\s\0]?$/` - translation: only space and zero width
   * characters allowed.
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
   * @defaultValue ''
   */
  invalidPrefixCharacters?: RegExp | string;

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
   * @defaultValue 0
   */
  matchOffset?: number;

  /**
   * Text to append after the mention has been added.
   *
   * @defaultValue ''
   */
  appendText?: string;

  /**
   * Class name to use for the decoration (while the suggestion is still being
   * written)
   *
   * @defaultValue 'suggest'
   */
  suggestClassName?: string;

  /**
   * Tag for the prosemirror decoration which wraps an active match.
   *
   * @defaultValue 'span'
   */
  suggestTag?: string;

  /**
   * Set a class for the ignored suggestion decoration.
   *
   * @defaultValue ''
   */
  ignoredClassName?: string;

  /**
   * Set a tag for the ignored suggestion decoration.
   *
   * @defaultValue 'span'
   */
  ignoredTag?: string;

  /**
   * When true, decorations are not created when this mention is being edited..
   */
  noDecorations?: boolean;

  /**
   * Called whenever a suggestion becomes active or changes in any way.
   *
   * @remarks
   *
   * It receives a parameters object with the `reason` for the change for more
   * granular control.
   *
   * @defaultValue `() => void`
   */
  onChange?: (parameter: SuggestChangeHandlerParameter<Command>) => void;

  /**
   * Called whenever a suggestion is exited with the pre-exit match value.
   *
   * @remarks
   *
   * Can be used to force the command to run the command e.g. when no match was
   * found but a tag should still be created. To accomplish this you would call
   * the `command` parameter and trigger whatever action is felt required.
   *
   * @defaultValue `() => void`
   */
  onExit?: (parameter: SuggestExitHandlerParameter<Command>) => void;

  /**
   * Called for each character entry and can be used to disable certain
   * characters.
   *
   * @remarks
   *
   * For example you may want to disable all `@` symbols while the suggester is
   * active. Return `true` to prevent any further character handlers from
   * running.
   *
   * @defaultValue `() => false`
   */
  onCharacterEntry?: (parameter: SuggestCharacterEntryParameter<Command>) => boolean;

  /**
   * An object that describes how certain key bindings should be handled.
   *
   * @remarks
   *
   * Return `true` to prevent any further prosemirror actions or return `false`
   * to allow prosemirror to continue.
   */
  keyBindings?: SuggestKeyBindingMap<Command> | (() => SuggestKeyBindingMap<Command>);

  /**
   * Create the suggested actions which are made available to the `onExit` and
   * on`onChange` handlers.
   *
   * @remarks
   *
   * Suggested actions are useful for developing plugins and extensions which
   * provide useful defaults for managing the suggestion lifecycle.
   */
  createCommand?: (parameter: CreateSuggestCommandParameter) => Command;
}

/**
 * The parameters needed for the {@link SuggestIgnoreParameter.addIgnored} action
 * method available to the suggest plugin handlers.
 *
 * @remarks
 *
 * See:
 * - {@link RemoveIgnoredParameter}
 */
export interface AddIgnoredParameter extends RemoveIgnoredParameter {
  /**
   * When `false` this will ignore the range for all matching suggesters. When
   * true the ignored suggesters will only be the one provided by the name.
   */
  specific?: false;
}

/**
 * The parameters needed for the {@link SuggestIgnoreParameter.removeIgnored}
 * action method available to the suggest plugin handlers.
 */
export interface RemoveIgnoredParameter extends Pick<Suggestion, 'char' | 'name'> {
  /**
   * The starting point of the match that should be ignored.
   */
  from: number;
}

/**
 * A parameter builder interface describing the ignore methods available to the
 * {@link Suggestion} handlers.
 */
export interface SuggestIgnoreParameter {
  /**
   * Add a match target to the ignored matches.
   *
   * @remarks
   *
   * Until the activation character is deleted no more `onChange` or `onExit`
   * handlers will be triggered for the matched character. It will be like the
   * match doesn't exist.
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
   *   onExit: ({ addIgnored, range: { from }, suggester: { char, name } }: SuggestExitHandlerParameter) => {
   *     addIgnored({ from, char, name }); // Ignore this suggestion
   *   },
   * }
   * ```
   */
  addIgnored: (parameter: AddIgnoredParameter) => void;

  /**
   * When name is provided remove all ignored decorations which match the named
   * suggester. Otherwise remove **all** ignored decorations from the document.
   */
  clearIgnored: (name?: string) => void;
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
 * A parameter builder interface describing a `from`/`to`/`end` range.
 */
export interface FromToEndParameter extends FromToParameter {
  /**
   * The absolute end of the matching string.
   */
  end: number;
}

/**
 * Describes the properties of a match which includes range and the text as well
 * as information of the suggester that created the match.
 *
 * @typeParam Command - the command method a {@link Suggestion} makes available
 * to its handlers.
 */
export interface SuggestStateMatch<Command extends AnyFunction<void> = AnyFunction<void>>
  extends SuggestionParameter<Command> {
  /**
   * Range of current match; for example `@foo|bar` (where | is the cursor)
   * - `from` is the start (= 0)
   * - `to` is cursor position (= 4)
   * - `end` is the end of the match (= 7)
   */
  range: FromToEndParameter;

  /**
   * Current query of match which doesn't include the activation character.
   */
  queryText: MatchValue;

  /**
   * Full text of match including the activation character
   *
   * @remarks
   *
   * For a `char` of `'@'` and query of `'awesome'` `text.full` would be
   * `'@awesome'`.
   */
  matchText: MatchValue;
}

/**
 * A parameter builder interface describing match found by the suggest plugin.
 */
export interface SuggestStateMatchParameter {
  /**
   * The match that will be triggered.
   */
  match: SuggestStateMatch;
}

/**
 * A special parameter needed when creating editable suggester using prosemirror
 * `Marks`. The method should be called when removing a suggestion that was
 * identified by a prosemirror `Mark`.
 */
export interface SuggestMarkParameter {
  /**
   * When managing suggesters with marks it is possible to remove a mark
   * without the change reflecting in the prosemirror state. This method should
   * be used when removing a suggestion if you are using prosemirror `Marks` to
   * identify the suggestion.
   *
   * When this method is called, `prosemirror-suggest` will handle the removal
   * of the mark in the next state update (during apply).
   */
  setMarkRemoved: () => void;
}

/**
 * The parameters passed into the `createSuggest` suggester property.
 *
 * @remarks
 *
 * See:
 * - {@link ReasonParameter}
 * - {@link @remirror/core-types#EditorViewParameter}
 * - {@link SuggestStateMatchParameter}
 * - {@link SuggestMarkParameter}
 * - {@link SuggestIgnoreParameter}
 */
export interface CreateSuggestCommandParameter
  extends Partial<ReasonParameter>,
    EditorViewParameter,
    SuggestStateMatchParameter,
    SuggestMarkParameter,
    SuggestIgnoreParameter {}

/**
 * Determines whether to replace the full match or the partial match (up to the
 * cursor position).
 */
export type SuggestReplacementType = 'full' | 'partial';

export interface SuggestCallbackParameter<Command extends AnyFunction<void> = AnyFunction<void>>
  extends SuggestStateMatch,
    EditorViewParameter,
    SuggestCommandParameter<Command>,
    SuggestIgnoreParameter {}

/**
 * The parameters required by the {@link Suggestion.onKeyDown}.
 *
 * @remarks
 *
 * See:
 * - {@link SuggestStateMatch}
 * - {@link @remirror/core-types#EditorViewParameter}
 * - {@link KeyboardEventParameter}
 */
export interface OnKeyDownParameter
  extends SuggestStateMatch,
    EditorViewParameter,
    KeyboardEventParameter {}

/**
 * A parameter builder interface describing the event which triggers the
 * keyboard event handler.
 */
export interface KeyboardEventParameter {
  /**
   * The keyboard event which triggered the call to the event handler.
   */
  event: KeyboardEvent;
}

/**
 * A parameter builder interface indicating the reason the handler was called.
 *
 * @typeParam Reason - Whether this is change or an exit reason.
 */
export interface ReasonParameter<Reason = ExitReason | ChangeReason> {
  /**
   * The reason this callback was triggered. This can be used to determine the
   * action to use in your own code.
   */
  reason: Reason;
}

/**
 * The parameters passed to the {@link Suggestion.onChange} method.
 *
 * @typeParam Command - the command method a {@link Suggestion} makes available
 * to its handlers.
 */
export interface SuggestChangeHandlerParameter<
  Command extends AnyFunction<void> = AnyFunction<void>
> extends SuggestCallbackParameter<Command>, ReasonParameter<ChangeReason> {}

/**
 * The parameters passed to the {@link Suggestion.onExit} method.
 *
 * @typeParam Command - the command method a {@link Suggestion} makes available
 * to its handlers.
 */
export interface SuggestExitHandlerParameter<Command extends AnyFunction<void> = AnyFunction<void>>
  extends SuggestCallbackParameter<Command>,
    ReasonParameter<ExitReason> {}

/**
 * The parameters passed to the {@link Suggestion.onCharacterEntry} method.
 *
 * @typeParam Command - the command method a {@link Suggestion} makes available
 * to its handlers.
 */
export interface SuggestCharacterEntryParameter<
  Command extends AnyFunction<void> = AnyFunction<void>
> extends SuggestCallbackParameter<Command>, FromToParameter, TextParameter {}

/**
 * The parameters required by the {@link SuggestKeyBinding} method.
 *
 * @remarks
 *
 * See:
 * - {@link SuggestCallbackParameter}
 * - {@link SuggestMarkParameter}
 * - {@link KeyboardEventParameter}
 *
 * @typeParam Command - the command method a {@link Suggestion} makes available
 * to its handlers.
 */
export interface SuggestKeyBindingParameter<Command extends AnyFunction<void> = AnyFunction<void>>
  extends SuggestCallbackParameter<Command>,
    SuggestMarkParameter,
    KeyboardEventParameter {}

/**
 * A method for performing actions when a certain key / pattern is pressed.
 *
 * @remarks
 *
 * Return true to prevent any further bubbling of the key event and to stop
 * other handlers from also processing the event.
 *
 * @typeParam Command - the command method a {@link Suggestion} makes available
 * to its handlers.
 */
export type SuggestKeyBinding<Command extends AnyFunction<void> = AnyFunction<void>> = (
  parameter: SuggestKeyBindingParameter<Command>,
) => boolean | void;

/**
 * The keybindings shape for the {@link Suggestion.keyBindings} property.
 *
 * @typeParam Command - the command method a {@link Suggestion} makes available
 * to its handlers.
 */
export type SuggestKeyBindingMap<Command extends AnyFunction<void> = AnyFunction<void>> = Partial<
  Record<
    'Enter' | 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight' | 'Esc' | 'Delete' | 'Backspace',
    SuggestKeyBinding<Command>
  >
> &
  Record<string, SuggestKeyBinding<Command>>;

/**
 * A parameter builder interface which adds the command property.
 *
 * @typeParam Command - the command method a {@link Suggestion} makes available
 * to its handlers.
 */
export interface SuggestCommandParameter<Command extends AnyFunction<void> = AnyFunction<void>> {
  /**
   * A command which automatically applies the provided attributes to the
   * command.
   */
  command: Command;
}

export interface SuggestionParameter<Command extends AnyFunction<void> = AnyFunction<void>> {
  /**
   * The suggester to use for finding matches.
   */
  suggester: Required<Suggestion<Command>>;
}

export interface SuggestStateMatchReason<Reason>
  extends SuggestStateMatch,
    ReasonParameter<Reason> {}

/**
 * A mapping of the handler matches with their reasons for occurring within the
 * suggest state.
 */
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
 * A parameter builder interface which adds the match property.
 *
 * @remarks
 *
 * This is used to build parameters for {@link Suggestion} handler methods.
 *
 * @typeParam Reason - Whether this is change or an exit reason.
 */
export interface ReasonMatchParameter<Reason> {
  /**
   * The match with its reason property.
   */
  match: SuggestStateMatchReason<Reason>;
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
export interface CompareMatchParameter {
  /**
   * The initial match
   */
  prev: SuggestStateMatch;

  /**
   * The current match
   */
  next: SuggestStateMatch;
}
