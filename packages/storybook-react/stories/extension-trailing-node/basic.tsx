import 'remirror/styles/all.css';

import React from 'react';
import { BlockquoteExtension, TrailingNodeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [new TrailingNodeExtension(), new BlockquoteExtension()];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions,
    content:
      '<blockquote><p>Appends an empty paragraph (by default) to the document, if it does not end with a text node.</p></blockquote>',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      />
    </ThemeProvider>
  );
};

export default Basic;
