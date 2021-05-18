import type { Response } from 'playwright';
import { SupportedCharacters } from 'test-keyboard';

import type { PlaywrightBrowserName } from './playwright-types';

/**
 * Clear the editor via triple click and backspace.
 */
export async function clearEditor(selector: string): Promise<void> {
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
}

/**
 * Create a selector.
 */
export function sel(...selectors: string[]): string {
  return selectors.join(' ');
}

/**
 * Obtain the inner HTML.
 */
export function innerHtml(selector: string): Promise<string> {
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
 * Creates an array of length `length` `and transforms each index value with the provided function.
 *
 * @param length - the length of the created array
 * @param fn - the transformer function called with the index position
 */
function times<Type = number>(length: number, fn?: (index: number) => Type): Type[] {
  return Array.from<unknown, Type>({ length }, (_, index) =>
    fn ? fn(index) : (index as unknown as Type),
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
async function promiseSequence(sequence: Array<() => Promise<void>>): Promise<void> {
  const promise = Promise.resolve();

  for (const next of sequence) {
    promise.then(next);
  }

  return promise;
}

export interface TypeProps {
  /**
   * The text to type.
   */
  text: string;

  /**
   * The delay between each key press. Setting this higher can sometimes solve fix flakey tests.
   */
  delay?: number;
}

export interface PressProps extends Pick<TypeProps, 'delay'> {
  /**
   * The key to press.
   */
  key: SupportedCharacters;

  /**
   * The number of times the key should be pressed.
   *
   * @default 1
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
export async function press({ key, count = 1, delay = 10 }: PressProps) {
  return promiseSequence(times(count, () => () => page.keyboard.press(key, { delay })));
}

/**
 * Wrapper around `page.keyboard.type` with default typing delay.
 */
export async function type({ text, delay = 10 }: TypeProps) {
  return page.keyboard.type(text, { delay });
}

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
 * Navigate to a page relative to the active server's main URL.
 *
 * The timeout is increased so that the first navigation can succeed.
 */
export async function goto(url = ''): Promise<Response | null> {
  return page.goto(__SERVER__.url + url, { timeout: 60_000 });
}

/**
 * Retrieve the browser name from the environment
 */
export function getBrowserName(): PlaywrightBrowserName {
  return process.env.E2E_BROWSER ?? 'chromium';
}

/**
 * Prefix the browser name to the passed in string
 */
export function prefixBrowserName(...value: string[]): string {
  return `${getBrowserName()}-${process.platform}-${__SERVER__.name}-${value.join('-')}`;
}
