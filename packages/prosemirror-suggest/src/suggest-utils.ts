import { keydownHandler } from 'prosemirror-keymap';

import { NULL_CHARACTER } from '@remirror/core-constants';
import { bool, entries, findMatches, isUndefined, object } from '@remirror/core-helpers';
import type {
  EditorStateParameter,
  MakeOptional,
  ProsemirrorCommandFunction,
  ResolvedPosParameter,
  TextParameter,
} from '@remirror/core-types';

import { ChangeReason, ExitReason } from './suggest-constants';
import { createRegexFromSuggester, regexToString } from './suggest-helpers';
import { isChange, isEntry, isExit, isJump, isMove } from './suggest-predicates';
import type {
  CompareMatchParameter,
  DocChangedParameter,
  ReasonParameter,
  Suggester,
  SuggesterParameter,
  SuggestKeyBindingMap,
  SuggestKeyBindingParameter,
  SuggestReasonMap,
  SuggestStateMatch,
  SuggestStateMatchParameter,
} from './suggest-types';

type CreateMatchWithReasonParameter<Reason> = SuggestStateMatchParameter & ReasonParameter<Reason>;

/**
 * Small utility method for creating a match with the reason property available.
 */
function createMatchWithReason<Reason>(parameter: CreateMatchWithReasonParameter<Reason>) {
  const { match, reason } = parameter;

  return {
    ...match,
    reason,
  };
}

type IsPrefixValidOptions = Pick<
  Required<Suggester>,
  'invalidPrefixCharacters' | 'validPrefixCharacters'
>;

/**
 * Checks to see if the text before the matching character is a valid prefix.
 *
 * @param prefix - the prefix to test
 * @param params - an object with the regex testing values
 */
function isPrefixValid(prefix: string, options: IsPrefixValidOptions) {
  const { invalidPrefixCharacters, validPrefixCharacters } = options;

  if (!isUndefined(invalidPrefixCharacters)) {
    const regex = new RegExp(regexToString(invalidPrefixCharacters));
    return !regex.test(prefix);
  }

  {
    const regex = new RegExp(regexToString(validPrefixCharacters));
    return regex.test(prefix);
  }
}

/**
 * Find the position of a mention for a given selection and character
 *
 * @param params
 */
function findPosition(parameter: FindPositionParameter) {
  const { text, regexp, $pos, char, suggester } = parameter;
  const cursor = $pos.pos; // The current cursor position
  const start = $pos.start(); // The starting position for matches

  let position: SuggestStateMatch | undefined;

  findMatches(text, regexp).forEach((match) => {
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
          queryText: {
            partial: match[0].slice(char.length, matchLength),
            full: match[0].slice(char.length),
          },
          matchText: { partial: match[0].slice(0, matchLength), full: match[0] },
          suggester,
        };
      }
    }
  });
  return position;
}

type FindMatchParameter = ResolvedPosParameter & SuggesterParameter;

/**
 * Checks if any matches exist at the current selection so that the
 * suggesters can be activated or deactivated.
 */
function findMatch(parameter: FindMatchParameter): SuggestStateMatch | undefined {
  const { $pos, suggester } = parameter;
  const { char, name, startOfLine, supportedCharacters, matchOffset } = suggester;

  // Create the regular expression to match the text against
  const regexp = createRegexFromSuggester({ char, matchOffset, startOfLine, supportedCharacters });

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
}

type RecheckMatchParameter = SuggestStateMatchParameter & EditorStateParameter;

/**
 * Checks the provided match and generates a new match. This is useful for
 * determining the kind of change that has happened.
 *
 * If the match still exists and it is different then it's likely a split has
 * occurred.
 */
function recheckMatch(parameter: RecheckMatchParameter) {
  const { state, match } = parameter;
  try {
    // Wrapped in try/catch because it's possible for everything to be deleted
    // and the doc.resolve will fail.
    return findMatch({
      $pos: state.doc.resolve(match.range.to),
      suggester: match.suggester,
    });
  } catch {
    return;
  }
}

type CreateInsertReasonParameter = MakeOptional<CompareMatchParameter, 'next'> &
  EditorStateParameter;

/**
 * Check whether the insert action occurred at the end, in the middle or caused
 * the suggestion to be invalid.
 *
 * Prev refers to the original previous and next refers to the updated version
 * after the split
 */
function createInsertReason(parameter: CreateInsertReasonParameter): SuggestReasonMap {
  const { prev, next, state } = parameter;

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
  if (prev.range.end === next.range.to) {
    return { exit: createMatchWithReason({ match: next, reason: ExitReason.End }) };
  }

  // Are we in the middle of the mention
  if (prev.queryText.partial) {
    return { exit: createMatchWithReason({ match: next, reason: ExitReason.Split }) };
  }

  return {};
}

type FindJumpReasonParameter = CompareMatchParameter & EditorStateParameter;

/**
 * Find the reason for the Jump
 */
function findJumpReason(parameter: FindJumpReasonParameter): SuggestReasonMap {
  const { prev, next, state } = parameter;
  const value: SuggestReasonMap = object();

  const updatedPrevious = recheckMatch({ state, match: prev });

  const { exit } =
    updatedPrevious && updatedPrevious.queryText.full !== prev.queryText.full // has query changed
      ? createInsertReason({ prev, next: updatedPrevious, state })
      : value;

  const isJumpForward = prev.range.from < next.range.from;

  if (isJumpForward) {
    return {
      exit: exit ?? createMatchWithReason({ match: prev, reason: ExitReason.JumpForward }),
      change: createMatchWithReason({ match: next, reason: ChangeReason.JumpForward }),
    };
  }

  return {
    exit: exit ?? createMatchWithReason({ match: prev, reason: ExitReason.JumpBackward }),
    change: createMatchWithReason({ match: next, reason: ChangeReason.JumpBackward }),
  };
}

type FindExitReasonParameter = SuggestStateMatchParameter &
  EditorStateParameter &
  ResolvedPosParameter;

/**
 * Find the reason for the exit.
 *
 * This provides some context and helps sets up a helper command with sane
 * defaults.
 */
function findExitReason(parameter: FindExitReasonParameter) {
  const { match, state, $pos } = parameter;
  const { selection } = state;
  const updatedPrevious = recheckMatch({ match, state });

  // Exit created a split
  if (!updatedPrevious || updatedPrevious.queryText.full !== match.queryText.full) {
    return createInsertReason({ prev: match, next: updatedPrevious, state });
  }

  // Exit caused by a selection
  if (
    !state.selection.empty &&
    (selection.from <= match.range.from || selection.to >= match.range.end)
  ) {
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
}

interface TransformKeyBindingsParameter {
  /**
   * The object where each keys are mapped to corresponding actions.
   */
  bindings: SuggestKeyBindingMap;

  /**
   * The param object which is passed into each method.
   */
  suggestParameter: SuggestKeyBindingParameter;
}

/**
 * Transforms the keybindings into an object that can be consumed by the
 * prosemirror keydownHandler method.
 */
export function transformKeyBindings(
  parameter: TransformKeyBindingsParameter,
): Record<string, ProsemirrorCommandFunction> {
  const { bindings, suggestParameter } = parameter;
  const transformed: Record<string, ProsemirrorCommandFunction> = object();

  for (const [key, binding] of entries(bindings)) {
    transformed[key] = () => bool(binding(suggestParameter));
  }

  return transformed;
}

/**
 * Run the keyBindings when a key is pressed to perform actions.
 *
 * When return value is `true` no further actions should be taken for this key
 * event. When `false` the event will be passed up the chain to the next key
 * handler.
 *
 * This is useful for intercepting events.
 */
export function runKeyBindings(
  bindings: SuggestKeyBindingMap,
  suggestParameter: SuggestKeyBindingParameter,
) {
  return keydownHandler(transformKeyBindings({ bindings, suggestParameter }))(
    suggestParameter.view,
    suggestParameter.event,
  );
}

interface FindFromSuggestersParameter extends ResolvedPosParameter, DocChangedParameter {
  /**
   * The matchers to search through.
   */
  suggesters: Array<Required<Suggester>>;
}

interface FindPositionParameter
  extends Pick<Suggester, 'name' | 'char'>,
    TextParameter,
    SuggesterParameter,
    ResolvedPosParameter {
  /**
   * The regexp to use
   */
  regexp: RegExp;
}

type FindReasonParameter = EditorStateParameter &
  ResolvedPosParameter &
  Partial<CompareMatchParameter>;

/**
 * Creates an array of the actions taken based on the current prev and next
 * state field
 */
export function findReason(parameter: FindReasonParameter): SuggestReasonMap {
  const { prev, next, state, $pos } = parameter;
  const value: SuggestReasonMap = object();

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
        reason: state.selection.empty ? ChangeReason.Move : ChangeReason.SelectionInside,
      }),
    };
  }

  return value;
}

/**
 * Find a match for the provided matchers
 */
export function findFromSuggesters(
  parameter: FindFromSuggestersParameter,
): SuggestStateMatch | undefined {
  const { suggesters, $pos } = parameter;

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

  return;
}
