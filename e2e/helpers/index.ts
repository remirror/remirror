import { getBrowserName, SupportedServers } from '@test-fixtures/test-urls';

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
export const innerHtml = async (selector: string) => page.$eval(selector, e => e.innerHTML);

/**
 * Retrieve the text content from the editor
 */
export const textContent = async (selector: string) => page.$eval(selector, e => e.textContent);

/**
 * Retrieve the outerHTML from the editor
 */
export const outerHtml = async (selector: string) => page.$eval(selector, e => e.outerHTML);

/**
 * Skips the test on Firefox.
 */
export const skipTestOnFirefox = getBrowserName() === 'firefox' ? test.skip : test;

/**
 * Runs describe block only on provided servers
 */
export const describeServer = (servers: SupportedServers[]): jest.Describe =>
  servers.some(server => __SERVERS__.includes(server)) ? describe : describe.skip;

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

interface KeyPressOptions {
  text?: string;
  delay?: number;
}

/**
 * Presses the given keyboard key a number of times in sequence.
 *
 * @param key - Key to press.
 * @param count - Number of times to press.
 *
 * @return Promise resolving when key presses complete.
 */
export const pressKeyTimes = async (key: string, count: number, { text, delay = 50 }: KeyPressOptions = {}) =>
  promiseSequence(times(count, () => () => page.keyboard.press(key, { text, delay })));
