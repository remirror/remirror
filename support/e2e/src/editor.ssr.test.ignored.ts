import type { Page } from 'playwright';

import { goto, imagesMatch } from './helpers';

const tests = Object.entries(__SERVER__.urls).reduce(
  (acc, [editorName, urls]) =>
    acc.concat(Object.entries(urls).map(([urlType, url]) => [editorName, urlType, url])),
  [] as any[],
);

test.each(tests)('SSR %s - %s', async (_, __, url) => {
  let page: Page;
  page = await browser.newPage({ javaScriptEnabled: false });
  await goto(url);
  const ssrImage = await page.screenshot();
  await page.close();

  page = await browser.newPage({ javaScriptEnabled: true });
  await goto(url);
  const domImage = await page.screenshot();
  await page.close();

  await expect(imagesMatch(ssrImage, domImage)).resolves.toBeTrue();
});
