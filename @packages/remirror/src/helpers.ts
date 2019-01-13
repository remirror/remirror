/**
 * Type cast an argument
 * @param arg
 */
export const Cast = <T = any>(arg: any): T => arg;

export type Literal = string | number | boolean | undefined | null | void | {};

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
export const tuple = <T extends Literal[]>(...args: T) => args;
