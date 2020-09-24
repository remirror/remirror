import escapeStringRegex from 'escape-string-regexp';

import { NULL_CHARACTER } from '@remirror/core-constants';
import {
  findMatches,
  isEmptyArray,
  isRegExp,
  isString,
  object,
  range,
} from '@remirror/core-helpers';

import { isChange, isEntry, isExit, isJump, isMove } from './suggest-predicates';
import type {
  CompareMatchParameter,
  DocChangedParameter,
  EditorSchema,
  EditorStateParameter,
  MakeOptional,
  PickPartial,
  ReasonParameter,
  ResolvedPos,
  ResolvedPosParameter,
  ResolvedRangeWithCursor,
  Suggester,
  SuggesterParameter,
  SuggestMatch,
  SuggestReasonMap,
  SuggestStateMatchParameter,
  TextParameter,
} from './suggest-types';
import { ChangeReason, ExitReason } from './suggest-types';

type CreateMatchWithReasonParameter<
  Schema extends EditorSchema = EditorSchema
> = SuggestStateMatchParameter<Schema> & ReasonParameter;

/**
 * Small utility method for creating a match with the reason property available.
 */
function createMatchWithReason<Schema extends EditorSchema = EditorSchema>(
  parameter: CreateMatchWithReasonParameter<Schema>,
) {
  const { match, changeReason, exitReason } = parameter;

  return {
    ...match,
    changeReason,
    exitReason,
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

  // Will ignore the empty string intentionally.
  if (invalidPrefixCharacters) {
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
function findPosition<Schema extends EditorSchema = EditorSchema>(
  parameter: FindPositionParameter<Schema>,
): SuggestMatch<Schema> | undefined {
  const { text, regexp, $pos, suggester } = parameter;

  // The starting position for matches
  const start = $pos.start();

  let position: SuggestMatch<Schema> | undefined;

  findMatches(text, regexp).forEach((match) => {
    // Check the character before the current match to ensure it is not one of
    // the supported characters
    const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);

    if (isPrefixValid(matchPrefix, suggester)) {
      // The absolute position of the matching parent node
      const from = match.index + start;

      // The position where the match ends
      const to = from + match[0].length;

      // The cursor position (or end position whichever is greater)
      const cursor = Math.min(to, $pos.pos);

      // The length of the current match
      const matchLength = cursor - from;

      // The matching text for the `char` regex or string is always captured as
      // the first matching group.
      const charMatch = match[1];

      // If the $position is located within the matched substring, return that
      // range.
      if (from < $pos.pos && to >= $pos.pos) {
        position = {
          range: { from, to, cursor },
          match,
          query: {
            partial: match[0].slice(charMatch.length, matchLength),
            full: match[0].slice(charMatch.length),
          },
          text: { partial: match[0].slice(0, matchLength), full: match[0] },
          suggester,
        };
      }
    }
  });

  return position;
}

type FindMatchParameter<Schema extends EditorSchema = EditorSchema> = ResolvedPosParameter<Schema> &
  SuggesterParameter<Schema>;

/**
 * Checks if any matches exist at the current selection so that the suggesters
 * can be activated or deactivated.
 */
function findMatch<Schema extends EditorSchema = EditorSchema>(
  parameter: FindMatchParameter<Schema>,
): SuggestMatch<Schema> | undefined {
  const { $pos, suggester } = parameter;
  const {
    char,
    name,
    startOfLine,
    supportedCharacters,
    matchOffset,
    multiline,
    caseInsensitive,
  } = suggester;

  // Create the regular expression to match the text against
  const regexp = createRegexFromSuggester({
    char,
    matchOffset,
    startOfLine,
    supportedCharacters,
    multiline,
    caseInsensitive,
  });

  // All the text in the current node
  const text = $pos.doc.textBetween($pos.before(), $pos.end(), NULL_CHARACTER, NULL_CHARACTER);

  // Find the position and return it
  return findPosition<Schema>({
    suggester,
    text,
    regexp,
    $pos,
    char,
    name,
  });
}

type RecheckMatchParameter<Schema extends EditorSchema = EditorSchema> = SuggestStateMatchParameter<
  Schema
> &
  EditorStateParameter<Schema>;

/**
 * Checks the provided match and generates a new match. This is useful for
 * determining the kind of change that has happened.
 *
 * If the match still exists and it is different then it's likely a split has
 * occurred.
 */
function recheckMatch<Schema extends EditorSchema = EditorSchema>(
  parameter: RecheckMatchParameter<Schema>,
) {
  const { state, match } = parameter;
  try {
    // Wrapped in try/catch because it's possible for everything to be deleted
    // and the doc.resolve will fail.
    return findMatch({
      $pos: state.doc.resolve(match.range.cursor),
      suggester: match.suggester,
    });
  } catch {
    return;
  }
}

type CreateInsertReasonParameter<Schema extends EditorSchema = EditorSchema> = MakeOptional<
  CompareMatchParameter<Schema>,
  'next'
> &
  EditorStateParameter<Schema>;

/**
 * Check whether the insert action occurred at the end, in the middle or caused
 * the suggestion to be invalid.
 *
 * Prev refers to the original previous and next refers to the updated version
 * after the split
 */
function createInsertReason<Schema extends EditorSchema = EditorSchema>(
  parameter: CreateInsertReasonParameter<Schema>,
): SuggestReasonMap<Schema> {
  const { prev, next, state } = parameter;

  // Has the text been removed? TODO how to tests for deletions mid document?
  if (!next && prev.range.from >= state.doc.nodeSize) {
    return {
      exit: createMatchWithReason({
        match: prev,
        exitReason: ExitReason.Removed,
      }),
    };
  }

  // Are we within an invalid split?
  if (!next || !prev.query.partial) {
    return {
      exit: createMatchWithReason({
        match: prev,
        exitReason: ExitReason.InvalidSplit,
      }),
    };
  }

  // Are we at the end position?
  if (prev.range.to === next.range.cursor) {
    // It seems that this never gets called. Revisit the logic and check whether
    // it's even necessary.
    return { exit: createMatchWithReason({ match: next, exitReason: ExitReason.End }) };
  }

  // Are we in the middle of the mention
  if (prev.query.partial) {
    return { exit: createMatchWithReason({ match: next, exitReason: ExitReason.Split }) };
  }

  return {};
}

type FindJumpReasonParameter<Schema extends EditorSchema = EditorSchema> = CompareMatchParameter<
  Schema
> &
  EditorStateParameter<Schema>;

/**
 * Find the reason for the Jump between two suggesters.
 */
function findJumpReason<Schema extends EditorSchema = EditorSchema>(
  parameter: FindJumpReasonParameter<Schema>,
): SuggestReasonMap<Schema> {
  const { prev, next, state } = parameter;
  const value: SuggestReasonMap<Schema> = object();

  const updatedPrevious = recheckMatch({ state, match: prev });

  const { exit } =
    updatedPrevious && updatedPrevious.query.full !== prev.query.full // has query changed
      ? createInsertReason({ prev, next: updatedPrevious, state })
      : value;

  const isJumpForward = prev.range.from < next.range.from;

  if (isJumpForward) {
    return {
      exit: exit ?? createMatchWithReason({ match: prev, exitReason: ExitReason.JumpForward }),
      change: createMatchWithReason({ match: next, changeReason: ChangeReason.JumpForward }),
    };
  }

  return {
    exit: exit ?? createMatchWithReason({ match: prev, exitReason: ExitReason.JumpBackward }),
    change: createMatchWithReason({ match: next, changeReason: ChangeReason.JumpBackward }),
  };
}

type FindExitReasonParameter<
  Schema extends EditorSchema = EditorSchema
> = SuggestStateMatchParameter<Schema> &
  EditorStateParameter<Schema> &
  ResolvedPosParameter<Schema>;

/**
 * Find the reason for the exit.
 *
 * This provides some context and helps sets up a helper command with sane
 * defaults.
 */
function findExitReason<Schema extends EditorSchema = EditorSchema>(
  parameter: FindExitReasonParameter<Schema>,
) {
  const { match, state, $pos } = parameter;
  const { selection } = state;
  const updatedPrevious = recheckMatch({ match, state });

  // Exit created a split
  if (!updatedPrevious || updatedPrevious.text.full !== match.text.full) {
    return createInsertReason({ prev: match, next: updatedPrevious, state });
  }

  // Exit caused by a selection
  if (
    !state.selection.empty &&
    (selection.from <= match.range.from || selection.to >= match.range.to)
  ) {
    return { exit: createMatchWithReason({ match, exitReason: ExitReason.SelectionOutside }) };
  }

  // Exit happened at the end of previous suggestion
  if ($pos.pos > match.range.to) {
    return { exit: createMatchWithReason({ match, exitReason: ExitReason.MoveEnd }) };
  }

  // Exit happened at the start of previous suggestion
  if ($pos.pos <= match.range.from) {
    return { exit: createMatchWithReason({ match, exitReason: ExitReason.MoveStart }) };
  }

  return {};
}

interface FindFromSuggestersParameter<Schema extends EditorSchema = EditorSchema>
  extends ResolvedPosParameter<Schema>,
    DocChangedParameter {
  /**
   * The matchers to search through.
   */
  suggesters: Array<Required<Suggester<Schema>>>;

  /**
   * When `true` the selection is empty.
   */
  selectionEmpty: boolean;
}

interface FindPositionParameter<Schema extends EditorSchema = EditorSchema>
  extends Pick<Suggester, 'name' | 'char'>,
    TextParameter,
    SuggesterParameter<Schema>,
    ResolvedPosParameter<Schema> {
  /**
   * The regexp to use
   */
  regexp: RegExp;
}

type FindReasonParameter<Schema extends EditorSchema = EditorSchema> = EditorStateParameter<
  Schema
> &
  ResolvedPosParameter<Schema> &
  Partial<CompareMatchParameter<Schema>>;

/**
 * Creates an array of the actions taken based on the current prev and next
 * state field
 */
export function findReason<Schema extends EditorSchema = EditorSchema>(
  parameter: FindReasonParameter<Schema>,
): SuggestReasonMap<Schema> {
  const { prev, next, state, $pos } = parameter;
  const value: SuggestReasonMap<Schema> = object();

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
    return {
      change: createMatchWithReason({ match: compare.next, changeReason: ChangeReason.Start }),
    };
  }

  // Exited a suggestion
  if (isExit(compare)) {
    return findExitReason({ $pos, match: compare.prev, state });
  }

  if (isChange(compare)) {
    return {
      change: createMatchWithReason({ match: compare.next, changeReason: ChangeReason.Text }),
    };
  }

  if (isMove(compare)) {
    return {
      change: createMatchWithReason({
        match: compare.next,
        changeReason: state.selection.empty ? ChangeReason.Move : ChangeReason.SelectionInside,
      }),
    };
  }

  return value;
}

/**
 * Check to see if the current $pos has a parent node matching the type.
 */
function hasParentNode($pos: ResolvedPos, types: string[]): boolean {
  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);

    if (types.includes(node.type.name)) {
      return true;
    }
  }

  return false;
}

/**
 * Check whether the mark is active anywhere between `$from` and `$end`.
 *
 * Currently this is not doing exactly what it should. I've decided to be lazy
 * and only check the following.
 *
 * - Do any of the requested marks span the entire range using `rangeHasMarks`?
 * - Does the starting position have a mark?
 * - Does the cursor have a mark?
 * - Does the end position have a mark?
 *
 * In reality I should also check for each position within the range to see if a
 * target mark is active but I won't for now.
 */
export function markActiveInRange<Schema extends EditorSchema = EditorSchema>(
  resolvedRange: Omit<ResolvedRangeWithCursor<Schema>, '$cursor'>,
  marks: string[],
): boolean {
  const { $from, $to } = resolvedRange;

  // Check if there is a mark spanning the range of marks.
  if (rangeHasMarks(resolvedRange, marks)) {
    return true;
  }

  // Check if any of the positions in the available range have the active mark
  // associated with
  return range($from.pos, $to.pos).some((value) =>
    positionHasMarks($from.doc.resolve(value), marks),
  );
}

/**
 * Check if the entire matching range `from` the start point all the way through
 * `to` the end point, has any of the provided marks that span it.
 */
export function rangeHasMarks<Schema extends EditorSchema = EditorSchema>(
  resolvedRange: Omit<ResolvedRangeWithCursor<Schema>, '$cursor'>,
  marks: string[],
): boolean {
  const { $from, $to } = resolvedRange;

  // Get the set of marks which span across the whole range.
  const setOfMarks = new Set(($from.marksAcross($to) ?? []).map((mark) => mark.type.name));

  return marks.some((item) => setOfMarks.has(item));
}

/**
 * Check if the provided position has the given marks.
 */
export function positionHasMarks<Schema extends EditorSchema = EditorSchema>(
  $pos: ResolvedPos<Schema>,
  marks: string[],
): boolean {
  // Get the set of marks for the current `$pos` which is used to check firstly
  // whether the set of marks is valid, and secondly whether the set of marks
  // includes any invalid marks.
  const setOfMarks = new Set($pos.marks().map((mark) => mark.type.name));

  return marks.some((item) => setOfMarks.has(item));
}

/**
 * Checks if the suggester is in an invalid position.
 */
function isPositionValidForSuggester<Schema extends EditorSchema = EditorSchema>(
  suggester: Required<Suggester<Schema>>,
  resolvedRange: ResolvedRangeWithCursor<Schema>,
): boolean {
  const { $cursor } = resolvedRange;
  const { validMarks, validNodes, invalidMarks, invalidNodes } = suggester;

  // Break early in the default case.
  if (!validMarks && !validNodes && isEmptyArray(invalidMarks) && isEmptyArray(invalidNodes)) {
    return true;
  }

  if (validMarks && !rangeHasMarks(resolvedRange, validMarks)) {
    return false;
  }

  if (validNodes && !hasParentNode($cursor, validNodes)) {
    return false;
  }

  if (!validMarks && markActiveInRange(resolvedRange, invalidMarks)) {
    return false;
  }

  if (!validNodes && hasParentNode($cursor, invalidNodes)) {
    return false;
  }

  return true;
}

/**
 * Find a match for the provided matchers.
 */
export function findFromSuggesters<Schema extends EditorSchema = EditorSchema>(
  parameter: FindFromSuggestersParameter<Schema>,
): SuggestMatch<Schema> | undefined {
  const { suggesters, $pos, selectionEmpty } = parameter;

  // Find the first match and break when done
  for (const suggester of suggesters) {
    // Make sure the selection is valid for this `suggester`.
    if (suggester.emptySelectionsOnly && !selectionEmpty) {
      continue;
    }

    try {
      const match = findMatch<Schema>({ suggester, $pos });

      if (!match) {
        continue;
      }

      // The resolved positions where `to` represents the cursor position.
      const resolvedRange: ResolvedRangeWithCursor<Schema> = {
        $from: $pos.doc.resolve(match.range.from),
        $to: $pos.doc.resolve(match.range.to),
        $cursor: $pos,
      };

      if (
        isPositionValidForSuggester<Schema>(suggester, resolvedRange) &&
        suggester.isValidPosition(resolvedRange, match)
      ) {
        return match;
      }

      // Break early and return the match which was found.
    } catch {
      // Captures any errors which can pop up when all the content in the editor
      // is deleted or an invalid position was provided.
    }
  }

  return;
}

/**
 * Convert a RegExp into a string
 *
 * @param regexOrString
 */
function regexToString(regexOrString: string | RegExp) {
  return isRegExp(regexOrString) ? regexOrString.source : regexOrString;
}

/**
 * Find regex prefix when depending on whether the mention only supports the
 * start of a line or not
 *
 * @param onlyStartOfLine
 */
function getRegexPrefix(onlyStartOfLine: boolean) {
  return onlyStartOfLine ? '^' : '';
}

/**
 * Get the supported characters regex string.
 */
function getRegexSupportedCharacters(supportedCharacters: string | RegExp, matchOffset: number) {
  return `(?:${regexToString(supportedCharacters)}){${matchOffset},}`;
}

/**
 * Get the `char` from the `suggester` as regex.
 */
export function getCharAsRegex(char: RegExp | string): RegExp {
  return isString(char) ? new RegExp(escapeStringRegex(char)) : char;
}

interface CreateRegexFromSuggesterParameter
  extends Pick<Required<Suggester>, 'startOfLine' | 'char' | 'supportedCharacters' | 'matchOffset'>,
    Pick<Suggester, 'multiline' | 'caseInsensitive' | 'captureChar'> {}

/**
 * Create a regex expression which evaluate matches directly from the suggester
 * properties.
 */
export function createRegexFromSuggester(parameter: CreateRegexFromSuggesterParameter): RegExp {
  const {
    char,
    matchOffset,
    startOfLine,
    supportedCharacters,
    captureChar = true,
    caseInsensitive = false,
    multiline = false,
  } = parameter;
  const flags = `g${multiline ? 'm' : ''}${caseInsensitive ? 'i' : ''}`;
  let charRegex = getCharAsRegex(char).source;

  if (captureChar) {
    charRegex = `(${charRegex})`;
  }

  return new RegExp(
    `${getRegexPrefix(startOfLine)}${charRegex}${getRegexSupportedCharacters(
      supportedCharacters,
      matchOffset,
    )}`,
    flags,
  );
}

/**
 * The default value for the suggester.
 */
export const DEFAULT_SUGGESTER: PickPartial<Suggester<any>> = {
  appendTransaction: false,
  priority: 50,
  ignoredTag: 'span',
  matchOffset: 0,
  disableDecorations: false,
  startOfLine: false,
  suggestClassName: 'suggest',
  suggestTag: 'span',
  supportedCharacters: /\w+/,
  validPrefixCharacters: /^[\s\0]?$/,
  invalidPrefixCharacters: null,
  ignoredClassName: null,
  invalidMarks: [],
  invalidNodes: [],
  validMarks: null,
  validNodes: null,
  isValidPosition: () => true,
  checkNextValidSelection: null,
  emptySelectionsOnly: false,
  caseInsensitive: false,
  multiline: false,
  captureChar: true,
};

/**
 * Takes the passed through `suggester` and adds all the missing default values.
 */
export function getSuggesterWithDefaults<Schema extends EditorSchema = EditorSchema>(
  suggester: Suggester<Schema>,
): Required<Suggester<Schema>> {
  return { ...DEFAULT_SUGGESTER, ...suggester };
}
