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
export const outerHTML = async (selector: string) => page.$eval(selector, e => e.outerHTML);
