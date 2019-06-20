import { getBrowserName } from '@test-fixtures/test-urls';
import pSeries from 'p-series';

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
 * Repeat the keyPress N number of times.
 */
export const repeatKeyPress = (key: string, times: number) =>
  pSeries(Array(times).fill(() => page.keyboard.press(key, { delay: 15 })));

/**
 * Skips the test on Firefox.
 */
export const skipTestOnFirefox = getBrowserName() === 'firefox' ? test.skip : test;
