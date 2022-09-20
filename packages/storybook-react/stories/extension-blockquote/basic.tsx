import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { BlockquoteExtension } from 'remirror/extensions';
import {
  Remirror,
  ThemeProvider,
  ToggleBlockquoteButton,
  Toolbar,
  useRemirror,
} from '@remirror/react';

const extensions = () => [new BlockquoteExtension()];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<blockquote><p>I'm a blockquote</p></blockquote>`,
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      >
        <Toolbar>
          <ToggleBlockquoteButton />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
