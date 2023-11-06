import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { UnderlineExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { ToggleUnderlineButton, Toolbar } from '@remirror/react-ui';

const extensions = () => [new UnderlineExtension()];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <u>underline</u></p>',
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
          <ToggleUnderlineButton />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
