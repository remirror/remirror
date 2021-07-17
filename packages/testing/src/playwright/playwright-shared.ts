/**
 * @module
 *
 * These are the shared tests across the different setups.
 */

import type { Page } from 'playwright';

import { goto } from './playwright-helpers';
import { imagesMatch } from './playwright-images';

/**
 * If this test fails for the server then something is wrong with the setup or
 * the build process.
 */
export function smokeTest(url = '/'): void {
  // eslint-disable-next-line jest/expect-expect, jest/no-if
  test(`can navigate to '${url}'`, async () => {
    await goto(url);
  });
}

/**
 * Test that the provide url has a consistent snapshot when javascript is
 * enabled and when javascript is disabled.
 *
 * @param description - a description for the generated test
 * @param url - the url to test for consistency
 */
export function ssrTest(description: string, url: string): void {
  test(`ssr - ${description}`, async () => {
    let currentPage: Page;
    currentPage = await browser.newPage({ javaScriptEnabled: false });
    await goto(url);
    const ssrImage = await currentPage.screenshot();
    await currentPage.close();

    currentPage = await browser.newPage({ javaScriptEnabled: true });
    await goto(url);
    const domImage = await currentPage.screenshot();
    await currentPage.close();

    await expect(imagesMatch(ssrImage, domImage)).resolves.toBeTrue();
  });
}
