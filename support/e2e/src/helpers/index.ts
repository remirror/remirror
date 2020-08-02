import type { SupportedCharacters } from 'test-keyboard';

import { getBrowserName } from './test-environment';

/**
 * Clear the editor via triple click and delete
 */
export async function clearEditor(selector: string) {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
}

/**
 * Create a selector
 */
export const sel = (...selectors: string[]) => selectors.join(' ');

/**
 * Obtain the inner HTML
 */
export function innerHtml(selector: string) {
  return page.$eval(selector, (element) => element.innerHTML);
}

/**
 * Retrieve the text content from the editor
 */
export function textContent(selector: string) {
  return page.$eval(selector, (element) => element.textContent);
}

/**
 * Retrieve the outerHTML from the editor
 */
export function outerHtml(selector: string) {
  return page.$eval(selector, (element) => element.outerHTML);
}

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
function times<Type = number>(length: number, fn?: (index: number) => Type): Type[] {
  return Array.from<unknown, Type>({ length }, (_, index) =>
    fn ? fn(index) : ((index as unknown) as Type),
  );
}

/* Taken from https://github.com/WordPress/gutenberg/blob/5bbda3656a530616a7a78c0a101d6ec2d8fa6a7a/packages/e2e-test-utils/src/press-key-times.js */

/**
 * Given an array of functions, each returning a promise, performs all
 * promises in sequence (waterfall) order.
 *
 * @param sequence Array of promise creators.
 *
 * @return Promise resolving once all in the sequence complete.
 */
async function promiseSequence(sequence: Array<() => Promise<void>>) {
  return sequence.reduce((current, next) => current.then(next), Promise.resolve());
}

export interface TypeParameter {
  /**
   * The text to type.
   */
  text: string;

  /**
   * The delay between each key press. Setting this higher can sometimes solve fix flakey tests.
   */
  delay?: number;
}

export interface PressParameter extends Pick<TypeParameter, 'delay'> {
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
export async function press({ key, count = 1, delay = 10 }: PressParameter) {
  return promiseSequence(times(count, () => () => page.keyboard.press(key, { delay })));
}

/**
 * Wrapper around `page.keyboard.type` with default typing delay.
 */
export async function type({ text, delay = 10 }: TypeParameter) {
  return page.keyboard.type(text, { delay });
}

export * from './modifier-keys';
export * from './images';

interface HTMLObject {
  _: 'HTML';
  html: string;
}

async function makeHtmlObject(htmlOrPromise: string | Promise<string>): Promise<HTMLObject> {
  return await Promise.resolve({ _: 'HTML', html: await Promise.resolve(htmlOrPromise) });
}

export function $innerHtml(selector: string) {
  return makeHtmlObject(page.$eval(selector, (element) => element.innerHTML));
}

/**
 * Navigate to a page with an increased timeout from default.
 */
export async function goto(url: string) {
  return page.goto(url, { timeout: 60_000 });
}
