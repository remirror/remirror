import { NULL_CHARACTER } from '@remirror/core-constants';
import { bool, findMatches, isRegExp, isUndefined } from '@remirror/core-helpers';
import {
  CommandFunction,
  EditorStateParams,
  MakeOptional,
  ResolvedPosParams,
  TextParams,
} from '@remirror/core-types';
import { selectionEmpty } from '@remirror/core-utils';
import escapeStringRegex from 'escape-string-regexp';
import { keydownHandler } from 'prosemirror-keymap';
import { ChangeReason, ExitReason } from './suggest-constants';
import { isChange, isEntry, isExit, isJump, isMove } from './suggest-predicates';
import {
  CompareMatchParams,
  ReasonParams,
  Suggester,
  SuggesterParams,
  SuggestKeyBindingMap,
  SuggestKeyBindingParams,
  SuggestReasonMap,
  SuggestStateMatch,
  SuggestStateMatchParams,
} from './suggest-types';

/**
 * Convert a RegExp into a string
 *
 * @param regexOrString
 */
export const regexToString = (regexOrString: string | RegExp) =>
  isRegExp(regexOrString) ? regexOrString.source : regexOrString;

/**
 * Find regex prefix when depending on whether the mention only supports the
 * start of a line or not
 *
 * @param onlyStartOfLine
 */
export const getRegexPrefix = (onlyStartOfLine: boolean) => (onlyStartOfLine ? '^' : '');

const getRegexSupportedCharacters = (supportedCharacters: string | RegExp, matchOffset: number) =>
  `(?:${regexToString(supportedCharacters)}){${matchOffset},}`;

/**
 * Find a match for the provided matchers
 */
export const findFromMatchers = ({
  suggesters,
  $pos,
}: FindFromMatchersParams): SuggestStateMatch | undefined => {
  // Find the first match and break when done
  for (const suggester of suggesters) {
    try {
      const match = findMatch({ suggester, $pos });
      if (match) {
        return match;
      }
    } catch {
      console.warn('Error while finding match.');
    }
  }

  return undefined;
};

/**
 * Checks if any matches exist at the current selection for so that the
 * suggestions be activated or deactivated.
 */
const findMatch = ({ $pos, suggester }: FindMatchParams): SuggestStateMatch | undefined => {
  const { char, name, startOfLine, supportedCharacters, matchOffset } = suggester;

  // Create the regular expression to match the text against
  const regexp = new RegExp(
    `${getRegexPrefix(startOfLine)}${escapeStringRegex(char)}${getRegexSupportedCharacters(
      supportedCharacters,
      matchOffset,
    )}`,
    'gm',
  );

  // All the text in the current node
  const text = $pos.doc.textBetween($pos.before(), $pos.end(), NULL_CHARACTER, NULL_CHARACTER);

  // Find the position and return it
  return findPosition({
    suggester,
    text,
    regexp,
    $pos,
    char,
    name,
  });
};

/**
 * Checks to see if the text before the matching character is a valid prefix.
 *
 * @param prefix - the prefix to test
 * @param params - an object with the regex testing values
 */
const isPrefixValid = (
  prefix: string,
  {
    invalidPrefixCharacters,
    validPrefixCharacters,
  }: Pick<Required<Suggester>, 'invalidPrefixCharacters' | 'validPrefixCharacters'>,
) => {
  if (!isUndefined(invalidPrefixCharacters)) {
    const regex = new RegExp(regexToString(invalidPrefixCharacters));
    return !regex.test(prefix);
  }

  {
    const regex = new RegExp(regexToString(validPrefixCharacters));
    return regex.test(prefix);
  }
};

/**
 * Find the position of a mention for a given selection and character
 *
 * @param params
 */
const findPosition = ({ text, regexp, $pos, char, suggester }: FindPositionParams) => {
  let position: SuggestStateMatch | undefined;

  const cursor = $pos.pos; // The current cursor position
  const start = $pos.start(); // The starting position for matches

  findMatches(text, regexp).forEach(match => {
    // Check the character before the current match to ensure it is not one of
    // the supported characters
    const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);

    if (isPrefixValid(matchPrefix, suggester)) {
      const from = match.index + start; // The absolute position of the match wrapper node
      const end = from + match[0].length; // The position where the match ends
      const to = Math.min(end, cursor); // The cursor position (or end position whichever is greater)
      const matchLength = to - from; // The length of the current match

      // If the $position is located within the matched substring, return that
      // range
      if (from < cursor && end >= cursor) {
        position = {
          range: {
            from,
            end,
            to,
          },
          queryText: { partial: match[0].slice(char.length, matchLength), full: match[0].slice(char.length) },
          matchText: { partial: match[0].slice(0, matchLength), full: match[0] },
          suggester,
        };
      }
    }
  });
  return position;
};

/**
 * Creates an array of the actions taken based on the current prev and next
 * state field
 */
export const findReason = ({ prev, next, state, $pos }: FindReasonsParams): SuggestReasonMap => {
  const value: SuggestReasonMap = {};

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
 * Checks the provided match and generates a new match. This is useful for
 * determining the kind of change that has happened.
 *
 * If the match still exists and it is different then it's likely a split has
 * occurred.
 */
const recheckMatch = ({ state, match }: SuggestStateMatchParams & EditorStateParams) => {
  try {
    // Wrapped in try catch because it's possible for everything to be deleted
    // and the doc.resolve will fail.
    return findMatch({
      $pos: state.doc.resolve(match.range.to),
      suggester: match.suggester,
    });
  } catch {
    return undefined;
  }
};

/**
 * Find the reason for the Jump
 */
const findJumpReason = ({ prev, next, state }: CompareMatchParams & EditorStateParams): SuggestReasonMap => {
  const value: SuggestReasonMap = {};

  const updatedPrev = recheckMatch({ state, match: prev });

  const { exit } =
    updatedPrev && updatedPrev.queryText.full !== prev.queryText.full // has query changed
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
 * This provides some context and helps sets up a helper command with sane
 * defaults.
 */
const findExitReason = ({
  match,
  state,
  $pos,
}: SuggestStateMatchParams & EditorStateParams & ResolvedPosParams) => {
  const { selection } = state;
  const updatedPrev = recheckMatch({ match, state });

  // Exit created a split
  if (!updatedPrev || (updatedPrev && updatedPrev.queryText.full !== match.queryText.full)) {
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
 * Check whether the insert action occurred at the end, in the middle or caused
 * the suggestion to be invalid.
 *
 * Prev refers to the original previous and next refers to the updated version
 * after the split
 */
const createInsertReason = ({
  prev,
  next,
  state,
}: MakeOptional<CompareMatchParams, 'next'> & EditorStateParams): SuggestReasonMap => {
  // Has the text been removed? TODO how to tests for deletions mid document?
  if (!next && prev.range.from >= state.doc.nodeSize) {
    return {
      exit: createMatchWithReason({
        match: prev,
        reason: ExitReason.Removed,
      }),
    };
  }

  // Are we within an invalid split?
  if (!next || !prev.queryText.partial) {
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
  if (next && prev.queryText.partial) {
    return { exit: createMatchWithReason({ match: next, reason: ExitReason.Split }) };
  }

  return {};
};

const createMatchWithReason = <GReason>({ match, reason }: CreateMatchWithReasonParams<GReason>) => ({
  ...match,
  reason,
});

/**
 * Transforms the keybindings into an object that can be consumed by the
 * prosemirror keydownHandler method.
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
 * When return value is `true` no further actions should be taken for this key
 * event. When `false` the event will be passed up the chain to the next key
 * handler.
 *
 * This is useful for intercepting events.
 */
export const runKeyBindings = (bindings: SuggestKeyBindingMap, params: SuggestKeyBindingParams) => {
  return keydownHandler(transformKeyBindings({ bindings, params }))(params.view, params.event);
};

interface TransformKeyBindingsParams {
  /**
   * The object where each keys are mapped to corresponding actions.
   */
  bindings: SuggestKeyBindingMap;

  /**
   * The param object which is passed into each method.
   */
  params: SuggestKeyBindingParams;
}

interface CreateMatchWithReasonParams<GReason> extends SuggestStateMatchParams, ReasonParams<GReason> {}

interface FindReasonsParams extends EditorStateParams, ResolvedPosParams, Partial<CompareMatchParams> {}

interface FindFromMatchersParams extends ResolvedPosParams {
  /**
   * The matchers to search through.
   */
  suggesters: Array<Required<Suggester>>;
}

interface FindMatchParams extends ResolvedPosParams, SuggesterParams {}

interface FindPositionParams
  extends Pick<Suggester, 'name' | 'char'>,
    TextParams,
    SuggesterParams,
    ResolvedPosParams {
  /**
   * The regexp to use
   */
  regexp: RegExp;
}
