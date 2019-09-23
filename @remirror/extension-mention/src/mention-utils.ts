import {
  bool,
  CommandFunction,
  EditorStateParams,
  findMatches,
  isRegExp,
  isString,
  MakeOptional,
  NULL_CHARACTER,
  ResolvedPosParams,
  selectionEmpty,
  SelectionParams,
  TextParams,
  Attrs,
  isPlainObject,
} from '@remirror/core';
import { keydownHandler } from 'prosemirror-keymap';
import {
  ChangeReason,
  CompareMatchParams,
  ExitReason,
  ReasonParams,
  SuggestionKeyBindingMap,
  SuggestionKeyBindingParams,
  SuggestionMatcher,
  SuggestionMatcherParams,
  SuggestionMatchParams,
  SuggestionReasonMap,
  SuggestionStateMatch,
  MentionExtensionAttrs,
} from './mention-types';

/**
 * The default matcher to use when none is provided in options
 */
export const DEFAULT_MATCHER: SuggestionMatcher = {
  char: '@',
  startOfLine: false,
  supportedCharacters: /[\w\d_]+/,
  name: 'at',
};

/**
 * Escape a regex character
 *
 * @param char The character to escape
 */
export const escapeChar = (char: string) => `\\${char}`;

/**
 * Convert a RegExp into a string
 *
 * @param regexpOrString
 */
export const regexToString = (regexpOrString: string | RegExp) =>
  isRegExp(regexpOrString) ? regexpOrString.source : regexpOrString;

/**
 * Find regex prefix when depending on whether the mention only supports the start of a line or not
 *
 * @param onlyStartOfLine
 */
export const getRegexPrefix = (onlyStartOfLine: boolean) => (onlyStartOfLine ? '^' : '');

interface FindFromMatchersParams extends ResolvedPosParams {
  /**
   * The matchers to search through.
   */
  matchers: Array<Partial<SuggestionMatcher>>;
}

/**
 * Find a match for the provided matchers
 */
export const findFromMatchers = ({
  matchers,
  $pos,
}: FindFromMatchersParams): SuggestionStateMatch | undefined => {
  // Find the first match and break when done
  for (const matcher of matchers) {
    try {
      const match = findMatch({ matcher, $pos });
      if (match) {
        return match;
      }
    } catch {}
  }

  return undefined;
};

interface FindMatchParams extends ResolvedPosParams, SuggestionMatcherParams {}

/**
 * Checks if any matches exist at the current selection for so that the suggestions be activated
 * or deactivated.
 */
const findMatch = ({ $pos, matcher }: FindMatchParams): SuggestionStateMatch | undefined => {
  const {
    char = DEFAULT_MATCHER.char,
    startOfLine = DEFAULT_MATCHER.startOfLine,
    supportedCharacters = DEFAULT_MATCHER.supportedCharacters,
    name = DEFAULT_MATCHER.name,
  } = matcher;

  // Create the regular expression to match the text against
  const regexp = new RegExp(
    `${getRegexPrefix(startOfLine)}${escapeChar(char)}${regexToString(supportedCharacters)}`,
    'gm',
  );

  // All the text in the current node
  const text = $pos.doc.textBetween($pos.before(), $pos.end(), NULL_CHARACTER, NULL_CHARACTER);

  // Find the position and return it
  return findPosition({
    matcher,
    text,
    regexp,
    $pos,
    char,
    name,
    supportedCharacters: new RegExp(regexToString(supportedCharacters), 'g'),
  });
};

interface FindPositionParams
  extends Pick<SuggestionMatcher, 'name' | 'char'>,
    TextParams,
    SuggestionMatcherParams,
    ResolvedPosParams {
  /**
   * The regexp to use
   */
  regexp: RegExp;

  /**
   * The characters that are supported
   */
  supportedCharacters: RegExp;
}

/**
 * Find the position of a mention for a given selection and character
 *
 * @param params
 */
const findPosition = ({
  text,
  regexp,
  $pos,
  char,
  name,
  supportedCharacters,
  matcher,
}: FindPositionParams) => {
  let position: SuggestionStateMatch | undefined;

  const cursor = $pos.pos; // The current cursor position
  const start = $pos.start(); // The starting position for matches

  findMatches(text, regexp).forEach(match => {
    // Check the character before the current match to ensure it is not one of the supported characters
    const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);

    // ? Can this be switched for NOT `supportedCharacters` - TEST once refactored
    if (/^[\s\0]?$/.test(matchPrefix)) {
      const from = match.index + start; // The absolute position of the match wrapper node
      const end = from + match[0].length; // The position where the match ends
      const to = Math.min(end, cursor); // The cursor position (or end position whichever is greater)
      const matchLength = to - from; // The length of the current match

      // If the $position is located within the matched substring, return that range
      if (from < cursor && end >= cursor) {
        position = {
          name,
          char,
          range: {
            from,
            end,
            to,
          },
          query: { partial: match[0].slice(char.length, matchLength), full: match[0].slice(char.length) },
          text: { partial: match[0].slice(0, matchLength), full: match[0] },
          supportedCharacters,
          matcher,
        };
      }
    }
  });
  return position;
};

interface FindReasonsParams extends EditorStateParams, ResolvedPosParams, Partial<CompareMatchParams> {}

/**
 * Creates an array of the actions taken based on the current prev and next state field
 */
export const findReason = ({ prev, next, state, $pos }: FindReasonsParams): SuggestionReasonMap => {
  const value: SuggestionReasonMap = {};

  if (!prev && !next) {
    return value;
  }

  const compare = { prev, next };

  // Check for a Jump
  if (isJump(compare)) {
    return findJumpReason({ prev: compare.prev, next: compare.next, state });
  }

  // Entered into a new suggestion
  if (isEntry(compare)) {
    return { change: createMatchWithReason({ match: compare.next, reason: ChangeReason.Start }) };
  }

  // Exited a suggestion
  if (isExit(compare)) {
    return findExitReason({ $pos, match: compare.prev, state });
  }

  if (isChange(compare)) {
    return { change: createMatchWithReason({ match: compare.next, reason: ChangeReason.Text }) };
  }

  if (isMove(compare)) {
    return {
      change: createMatchWithReason({
        match: compare.next,
        reason: selectionEmpty(state) ? ChangeReason.Move : ChangeReason.SelectionInside,
      }),
    };
  }

  return value;
};

/**
 * Checks the provided match and generates a new match. This is useful for determining
 * the kind of change that has happened.
 *
 * If the match still exists and it is different then it's likely a split has occurred.
 */
const recheckMatch = ({ state, match }: SuggestionMatchParams & EditorStateParams) => {
  try {
    // Wrapped in try catch because it's possible for everything to be deleted and the doc.resolve will fail.
    return findMatch({
      $pos: state.doc.resolve(match.range.to),
      matcher: match.matcher,
    });
  } catch {
    return undefined;
  }
};

/**
 * Find the reason for the Jump
 */
const findJumpReason = ({
  prev,
  next,
  state,
}: CompareMatchParams & EditorStateParams): SuggestionReasonMap => {
  const value: SuggestionReasonMap = {};

  const updatedPrev = recheckMatch({ state, match: prev });

  const { exit } =
    updatedPrev && updatedPrev.query.full !== prev.query.full // has query changed
      ? createInsertReason({ prev, next: updatedPrev, state })
      : value;

  const isJumpForward = prev.range.from < next.range.from;

  if (isJumpForward) {
    return {
      exit: exit || createMatchWithReason({ match: prev, reason: ExitReason.JumpForward }),
      change: createMatchWithReason({ match: next, reason: ChangeReason.JumpForward }),
    };
  }

  return {
    exit: exit || createMatchWithReason({ match: prev, reason: ExitReason.JumpBackward }),
    change: createMatchWithReason({ match: next, reason: ChangeReason.JumpBackward }),
  };
};

/**
 * Find the reason for the exit.
 *
 * This provides some context and helps sets up a helper command with sane defaults.
 */
const findExitReason = ({
  match,
  state,
  $pos,
}: SuggestionMatchParams & EditorStateParams & ResolvedPosParams) => {
  const { selection } = state;
  const updatedPrev = recheckMatch({ match, state });

  // Exit created a split
  if (!updatedPrev || (updatedPrev && updatedPrev.query.full !== match.query.full)) {
    return createInsertReason({ prev: match, next: updatedPrev, state });
  }

  // Exit caused by a selection
  if (!selectionEmpty(state) && (selection.from <= match.range.from || selection.to >= match.range.end)) {
    return { exit: createMatchWithReason({ match, reason: ExitReason.SelectionOutside }) };
  }

  // Exit happened at the end of previous suggestion
  if ($pos.pos > match.range.end) {
    return { exit: createMatchWithReason({ match, reason: ExitReason.MoveEnd }) };
  }

  // Exit happened at the start of previous suggestion
  if ($pos.pos <= match.range.from) {
    return { exit: createMatchWithReason({ match, reason: ExitReason.MoveStart }) };
  }

  return {};
};

/**
 * Check whether the insert action occurred at the end, in the middle or caused the suggestion to be invalid.
 *
 * Prev refers to the original previous and next refers to the updated version after the split
 */
const createInsertReason = ({
  prev,
  next,
  state,
}: MakeOptional<CompareMatchParams, 'next'> & EditorStateParams): SuggestionReasonMap => {
  // Has the text been removed?
  // TODO how to tests for deletions mid document?
  if (!next && prev.range.from >= state.doc.nodeSize) {
    return {
      exit: createMatchWithReason({
        match: prev,
        reason: ExitReason.Removed,
      }),
    };
  }

  // Are we within an invalid split?
  if (!next || !prev.query.partial) {
    return {
      exit: createMatchWithReason({
        match: prev,
        reason: ExitReason.InvalidSplit,
      }),
    };
  }

  // Are we at the end position?
  if (next && prev.range.end === next.range.to) {
    return { exit: createMatchWithReason({ match: next, reason: ExitReason.End }) };
  }

  // Are we in the middle of the mention
  if (next && prev.query.partial) {
    return { exit: createMatchWithReason({ match: next, reason: ExitReason.Split }) };
  }

  return {};
};

interface CreateMatchWithReasonParams<GReason> extends SuggestionMatchParams, ReasonParams<GReason> {}

const createMatchWithReason = <GReason>({ match, reason }: CreateMatchWithReasonParams<GReason>) => ({
  ...match,
  reason,
});

/**
 * Is this a change in the current suggestion (added or deleted characters)?
 */
const isChange = (compare: Partial<CompareMatchParams>): compare is CompareMatchParams =>
  bool(compare.prev && compare.next && compare.prev.query.full !== compare.next.query.full);

/**
 * Has the cursor moved within the current suggestion (added or deleted characters)?
 */
const isMove = (compare: Partial<CompareMatchParams>): compare is CompareMatchParams =>
  bool(compare.prev && compare.next && compare.prev.range.to !== compare.next.range.to);

/**
 * Are we entering a new suggestion?
 */
const isEntry = (compare: Partial<CompareMatchParams>): compare is Pick<CompareMatchParams, 'next'> =>
  bool(!compare.prev && compare.next);

/**
 * Are we exiting a suggestion?
 */
const isExit = (compare: Partial<CompareMatchParams>): compare is Pick<CompareMatchParams, 'prev'> =>
  bool(compare.prev && !compare.next);

/**
 * Is this a jump from one suggestion to another?
 */
const isJump = (compare: Partial<CompareMatchParams>): compare is CompareMatchParams =>
  bool(compare.prev && compare.next && compare.prev.range.from !== compare.next.range.from);

/**
 * Check that the passed in value is an ExitReason
 */
export const isExitReason = (value: unknown): value is ExitReason =>
  isString(value) && Object.values(ExitReason).includes(value as ExitReason);

export const isChangeReason = (value: unknown): value is ChangeReason =>
  isString(value) && Object.values(ChangeReason).includes(value as ChangeReason);

/**
 * Checks that the reason passed is a split reason. This typically means that we should default to a partial
 * update / creation of the mention.
 */
export const isSplitReason = (value?: unknown): value is ExitReason.Split => value === ExitReason.Split;

/**
 * Checks that the reason was caused by a split at a point where there is no query.
 */
export const isInvalidSplitReason = (value?: unknown): value is ExitReason.InvalidSplit =>
  value === ExitReason.InvalidSplit;

/**
 * Checks that the reason was caused by a deletion.
 */
export const isRemovedReason = (value?: unknown): value is ExitReason.Removed => value === ExitReason.Removed;

/**
 * Checks to see if this is a jump reason.
 */
export const isJumpReason = (map: SuggestionReasonMap): map is Required<SuggestionReasonMap> =>
  map.exit
    ? [ExitReason.JumpBackward, ExitReason.JumpForward].includes(map.exit.reason)
    : map.change
    ? [ChangeReason.JumpBackward, ChangeReason.JumpForward].includes(map.change.reason)
    : false;

/**
 * True when the match is currently active (i.e. it's query has a value)
 */
export const isValidMatch = (match: SuggestionStateMatch | undefined): match is SuggestionStateMatch =>
  bool(match && match.query.full.length);

/**
 * True when the current selection is outside the match.
 */
export const selectionOutsideMatch = ({
  match,
  selection,
}: Partial<SuggestionMatchParams> & SelectionParams) =>
  match && (selection.from < match.range.from || selection.from > match.range.end);

interface TransformKeyBindingsParams {
  /**
   * The object where each keys are mapped to corresponding actions.
   */
  bindings: SuggestionKeyBindingMap;

  /**
   * The param object which is passed into each method.
   */
  params: SuggestionKeyBindingParams;
}

/**
 * Transforms the keybindings into an object that can be consumed by the prosemirror
 * keydownHandler method.
 */
export const transformKeyBindings = ({
  bindings,
  params,
}: TransformKeyBindingsParams): Record<string, CommandFunction> => {
  const keys: Record<string, CommandFunction> = {};
  return Object.entries(bindings).reduce((prev, [key, method]) => {
    return {
      ...prev,
      [key]: () => bool(method(params)),
    };
  }, keys);
};

/**
 * Run the keyBindings when a key is pressed to perform actions.
 *
 * When return value is `true` no further actions should be taken for this key event.
 * When `false` the event will be passed up the chain to the next key handler.
 *
 * This is useful for intercepting events.
 */
export const runKeyBindings = (bindings: SuggestionKeyBindingMap, params: SuggestionKeyBindingParams) => {
  return keydownHandler(transformKeyBindings({ bindings, params }))(params.view, params.event);
};

/**
 * Runs through a list of functions and stops as soon as one returns a truthy value.
 */
export const runWhileFalsy = (methods: Array<() => unknown>) => {
  for (const method of methods) {
    if (method()) {
      return true;
    }
  }

  return false;
};

/**
 * Check that the attributes exist and are valid for the mention update
 * command method.
 */
export const isValidMentionAttrs = (attrs?: Attrs): attrs is MentionExtensionAttrs =>
  bool(attrs && isPlainObject(attrs) && attrs.id && attrs.label);
