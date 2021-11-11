import { DefaultProtocol, extractHref as extractLink, LinkExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const phoneRegex = /(?:\+?(\d{1,3}))?[ (.-]*(\d{3})[ ).-]*(\d{3})[ .-]*(\d{4})(?: *x(\d+))?/;
const linkRegex =
  /(?:(?:(?:https?|ftp):)?\/\/)?(?:\S+(?::\S*)?@)?(?:(?:[\da-z\u00A1-\uFFFF][\w\u00A1-\uFFFF-]{0,62})?[\da-z\u00A1-\uFFFF]\.)+[a-z\u00A1-\uFFFF]{2,}\.?(?::\d{2,5})?(?:[#/?]\S*)?/i;
const composedRegex = new RegExp(
  [phoneRegex, linkRegex].map((regex) => `(${regex.source})`).join('|'),
);

function extractLinkOrTel({
  url,
  defaultProtocol,
}: {
  url: string;
  defaultProtocol: DefaultProtocol;
}): string {
  const isLink = linkRegex.test(url);
  return isLink ? extractLink({ url, defaultProtocol }) : `tel:${url}`;
}

const WithTelephoneSupport = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: () => [
      new LinkExtension({
        autoLink: true,
        autoLinkRegex: composedRegex,
        extractHref: extractLinkOrTel,
      }),
    ],
    content: `Type "800-555-1234" to insert a phone:&nbsp;`,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} />
    </ThemeProvider>
  );
};

export default WithTelephoneSupport;
