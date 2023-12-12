import 'remirror/styles/all.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { HorizontalRuleExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { InsertHorizontalRuleButton, Toolbar } from '@remirror/react-ui';

const extensions = () => [new HorizontalRuleExtension()];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <hr />with horizontal rule</p>',
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
          <InsertHorizontalRuleButton />
        </Toolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
