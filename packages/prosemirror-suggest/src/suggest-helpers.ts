import { isRegExp } from '@remirror/core-helpers';
import escapeStringRegex from 'escape-string-regexp';
import { Suggester } from './suggest-types';

export const escapeChar = (char: string) => escapeStringRegex(char);

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

/**
 * Get the supported characters regex string.
 */
const getRegexSupportedCharacters = (supportedCharacters: string | RegExp, matchOffset: number) =>
  `(?:${regexToString(supportedCharacters)}){${matchOffset},}`;

/**
 * Create a regex expression to evaluate matches directly from the suggester properties.
 */
export const createRegexFromSuggester = (
  {
    char,
    matchOffset,
    startOfLine,
    supportedCharacters,
  }: Pick<Required<Suggester>, 'startOfLine' | 'char' | 'supportedCharacters' | 'matchOffset'>,
  flags = 'gm',
) =>
  new RegExp(
    `${getRegexPrefix(startOfLine)}${escapeChar(char)}${getRegexSupportedCharacters(
      supportedCharacters,
      matchOffset,
    )}`,
    flags,
  );
