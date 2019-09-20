import { MakeOptional } from '@remirror/core';
import { SupportedCharacters } from 'test-keyboard';
import { getBrowserName } from './test-environment';

/**
 * Clear the editor via triple click and delete
 */
export const clearEditor = async (selector: string) => {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
};

/**
 * Create a selector
 */
export const sel = (...selectors: string[]) => selectors.join(' ');

/**
 * Obtain the inner HTML
 */
export const innerHtml = async (selector: string) => page.$eval(selector, element => element.innerHTML);

/**
 * Retrieve the text content from the editor
 */
export const textContent = async (selector: string) => page.$eval(selector, element => element.textContent);

/**
 * Retrieve the outerHTML from the editor
 */
export const outerHtml = async (selector: string) => page.$eval(selector, element => element.outerHTML);

/**
 * Skips the test on Firefox.
 */
export const skipTestOnFirefox = getBrowserName() === 'firefox' ? test.skip : test;

/**
 * Creates an array of length `length` `and transforms each index value with the provided function.
 *
 * @param length - the length of the created array
 * @param fn - the transformer function called with the index position
 */
const times = <GType = number>(length: number, fn?: (index: number) => GType): GType[] =>
  Array.from<unknown, GType>({ length }, (_, index) => (fn ? fn(index) : ((index as unknown) as GType)));

/* Taken from https://github.com/WordPress/gutenberg/blob/5bbda3656a530616a7a78c0a101d6ec2d8fa6a7a/packages/e2e-test-utils/src/press-key-times.js */

/**
 * Given an array of functions, each returning a promise, performs all
 * promises in sequence (waterfall) order.
 *
 * @param sequence Array of promise creators.
 *
 * @return Promise resolving once all in the sequence complete.
 */
const promiseSequence = async (sequence: Array<() => Promise<void>>) =>
  sequence.reduce((current, next) => current.then(next), Promise.resolve());

export interface TypeParams {
  /**
   * The text to type.
   */
  text: string;

  /**
   * The delay between each key press. Setting this higher can sometimes solve fix flakey tests.
   */
  delay?: number;
}

export interface PressParams extends MakeOptional<TypeParams, 'text'> {
  /**
   * The key to press.
   */
  key: SupportedCharacters;

  /**
   * The number of times the key should be pressed.
   *
   * @defaultValue 1
   */
  count?: number;
}
/**
 * Presses the given keyboard key a number of times in sequence.
 *
 * @param key - the key to press.
 * @param count - the number of times to press it.
 *
 * @return Promise resolving when key presses complete.
 */
export const press = async ({ key, count = 1, delay = 50, text }: PressParams) =>
  promiseSequence(times(count, () => () => page.keyboard.press(key, { text, delay })));

/**
 * Wrapper around `page.keyboard.type` with default typing delay.
 */
export const type = async ({ text, delay = 10 }: TypeParams) => page.keyboard.type(text, { delay });

export * from './modifier-keys';

export * from './images';
