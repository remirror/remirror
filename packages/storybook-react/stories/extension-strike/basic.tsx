import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { StrikeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { ToggleStrikeButton, Toolbar } from '@remirror/react-ui';

const extensions = () => [new StrikeExtension()];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <strike>strike</strike></p>',
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
          <ToggleStrikeButton />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
