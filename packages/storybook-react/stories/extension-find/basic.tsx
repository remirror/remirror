import 'remirror/styles/all.css';

import React from 'react';
import { wysiwygPreset } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { FindButton, Toolbar } from '@remirror/react-ui';

const Basic: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: wysiwygPreset,
    content: '<p>Using the <code>&lt;FindButton /&gt;</code> from <code>@remirror/react-ui</code>.',
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
      >
        <Toolbar>
          <FindButton />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
