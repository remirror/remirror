import { imagesMatch } from './helpers';

const tests = Object.entries(__SERVER__.urls).flatMap(([editorName, urls]) =>
  Object.entries(urls).map(([urlType, url]) => [editorName, urlType, url]),
);

test.each(tests)('SSR %s - %s', async (_editorName, _withContentString, url) => {
  await page.setJavaScriptEnabled(false);
  await page.goto(url);
  const ssrImage = await page.screenshot({ encoding: 'binary' });

  await page.setJavaScriptEnabled(true);
  await page.goto(url);
  const domImage = await page.screenshot({ encoding: 'binary' });

  await expect(imagesMatch(ssrImage, domImage)).toBeTrue();
});
