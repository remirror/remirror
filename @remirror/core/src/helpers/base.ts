import { Literal } from '../types';

/**
 * Type cast an argument
 * @param arg
 */
export const Cast = <GType = any>(arg: any): GType => arg;

/**
 * Use this to create a Tuple with args that can be used as a type
 *
 * @example
 * ```
 * const ALL_SUITS = tuple('hearts', 'diamonds', 'spades', 'clubs');
 * type SuitTuple = typeof ALL_SUITS;
 * type Suit = SuitTuple[number]; // union type
 * ```
 * @param args
 */
export const tuple = <GType extends Literal[]>(...args: GType) => args;

/**
 * Finds all the regex matches for a string
 * @param text
 * @param regexp
 */
export const findMatches = (text: string, regexp: RegExp) => {
  const results: RegExpExecArray[] = [];
  for (let match = regexp.exec(text); match !== null; match = regexp.exec(text)) {
    results.push(match);
  }
  return results;
};
