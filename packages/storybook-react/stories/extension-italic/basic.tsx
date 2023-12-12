import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { ItalicExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { ToggleItalicButton, Toolbar } from '@remirror/react-ui';

const extensions = () => [new ItalicExtension()];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <i>italic</i></p>',
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
          <ToggleItalicButton />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
