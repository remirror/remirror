import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { HeadingExtension } from 'remirror/extensions';
import {
  HeadingLevelButtonGroup,
  Remirror,
  ThemeProvider,
  Toolbar,
  useRemirror,
} from '@remirror/react';

const extensions = () => [new HeadingExtension()];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>`,
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
          <HeadingLevelButtonGroup showAll />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
