import { imagesMatch } from './helpers';

const tests = Object.entries(__SERVER__.urls).reduce(
  (acc, [editorName, urls]) =>
    acc.concat(Object.entries(urls).map(([urlType, url]) => [editorName, urlType, url])),
  [] as any[],
);

test.each(tests)('SSR %s - %s', async (_, __, url) => {
  await page.setJavaScriptEnabled(false);
  await page.goto(url);
  const ssrImage = await page.screenshot({ encoding: 'binary' });

  await page.setJavaScriptEnabled(true);
  await page.goto(url);
  const domImage = await page.screenshot({ encoding: 'binary' });

  await expect(imagesMatch(ssrImage, domImage)).resolves.toBeTrue();
});
