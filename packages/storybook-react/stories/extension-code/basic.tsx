import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { CodeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, ToggleCodeButton, Toolbar, useRemirror } from '@remirror/react';

const extensions = () => [new CodeExtension()];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text as <code>code</code></p>',
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
          <ToggleCodeButton />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
