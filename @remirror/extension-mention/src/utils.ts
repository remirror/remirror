import { findMatches, isRegExp, NULL_CHARACTER, replaceText, ResolvedPos } from '@remirror/core';
import { ActionTaken, SuggestionsCommandParams, SuggestionsMatcher, SuggestionStateField } from './types';

/**
 * The default matcher to use when none is provided in options
 */
export const DEFAULT_MATCHER: SuggestionsMatcher = {
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
const escapeChar = (char: string) => `\\${char}`;

/**
 * Convert a RegExp into a string
 *
 * @param regexpOrString
 */
const regexToString = (regexpOrString: string | RegExp) =>
  isRegExp(regexpOrString) ? regexpOrString.source : regexpOrString;

/**
 * Find regex prefix when depending on whether the mention only supports the start of a line or not
 *
 * @param onlyStartOfLine
 */
const regexPrefix = (onlyStartOfLine: boolean) => (onlyStartOfLine ? '^' : '');

/**
 * Checks if any matches exist at the current selection for so that the suggestions be activated
 * or deactivated.
 *
 * @param matcher
 * @param matcher.char
 * @param matcher.startOfLin
 * @param matcher.supportedCharacters
 * @param $pos
 */
export const getSuggestionMatchState = (
  {
    char = DEFAULT_MATCHER.char,
    startOfLine = DEFAULT_MATCHER.startOfLine,
    supportedCharacters = DEFAULT_MATCHER.supportedCharacters,
    name = DEFAULT_MATCHER.name,
  }: Partial<SuggestionsMatcher>,
  $pos: ResolvedPos,
): SuggestionStateField | undefined => {
  // Create the regular expression to match the text against
  const regexp = new RegExp(
    `${regexPrefix(startOfLine)}${escapeChar(char)}${regexToString(supportedCharacters)}`,
    'gm',
  );

  // All the text in the current node
  const text = $pos.doc.textBetween($pos.before(), $pos.end(), NULL_CHARACTER, NULL_CHARACTER);

  // Find the position and return it
  return findPosition({ text, regexp, $pos, char, name });
};

interface FindMentionPositionParams extends Pick<SuggestionsMatcher, 'name' | 'char'> {
  /** The text to match against */
  text: string;
  /** The regexp to use */
  regexp: RegExp;
  /** A resolved position for the current selection */
  $pos: ResolvedPos;
}

/**
 * Find the position of a mention for a given selection and character
 *
 * @param params
 */
export function findPosition({ text, regexp, $pos, char, name }: FindMentionPositionParams) {
  let position: SuggestionStateField | undefined;

  findMatches(text, regexp).forEach(match => {
    // Check the character before the current match to check if it is supported
    const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index);

    // ? Can this be switched for NOT `supportedCharacters` - TEST once refactored
    if (/^[\s\0]?$/.test(matchPrefix)) {
      // The absolute position of the match wrapper node
      const from = match.index + $pos.start();
      const to = from + match[0].length;

      // If the $position is located within the matched substring, return that range
      if (from < $pos.pos && to >= $pos.pos) {
        position = {
          name,
          char,
          range: {
            from,
            to,
          },
          query: match[0].slice(char.length),
          text: match[0],
        };
      }
    }
  });
  return position;
}

/**
 * Creates an array of the actions taken based on the current prev and next state field
 *
 * @param prev
 * @param next
 */
export const actionsTaken = (
  prev: SuggestionStateField | undefined,
  next: SuggestionStateField | undefined,
): ActionTaken[] => {
  const actions: ActionTaken[] = [];

  if (!prev && !next) {
    return actions;
  }

  if (prev && next && prev.range && next.range && prev.range.from !== next.range.from) {
    actions.push(ActionTaken.Moved);
  }

  if (!prev && next) {
    actions.push(ActionTaken.Entered);
  }

  if (prev && !next) {
    actions.push(ActionTaken.Exited);
  }

  if (prev && next && prev.query !== next.query) {
    actions.push(ActionTaken.Changed);
  }

  return actions;
};

/**
 * Update the suggestion
 *
 * @param params
 */
export const runSuggestionsCommand = ({ range, attrs, appendText, schema, name }: SuggestionsCommandParams) =>
  replaceText(range, schema.nodes[name], attrs, appendText);
