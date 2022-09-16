import * as linkify from 'linkifyjs';
import React from 'react';
import { LinkExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const findAutoLinks = (str: string) =>
  linkify.find(str).map((link) => ({
    text: link.value,
    href: link.href,
    start: link.start,
    end: link.end,
  }));

const isValidUrl = (input: string) => linkify.test(input);

const LinkifyJS = (): JSX.Element => {
  const { manager, state } = useRemirror({
    extensions: () => [new LinkExtension({ autoLink: true, findAutoLinks, isValidUrl })],
    content: `Type "www.remirror.io" to insert a link:&nbsp;`,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} />
    </ThemeProvider>
  );
};

export default LinkifyJS;
