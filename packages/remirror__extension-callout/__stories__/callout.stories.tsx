import 'remirror/styles/all.css';

import React from 'react';
import { CalloutExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

export default { title: 'Callouts' };

const basicExtensions = () => [new CalloutExtension()];

export const Basic: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: basicExtensions,
    content:
      '<div data-callout-type="info"><p>Info callout</p></div><p />' +
      '<div data-callout-type="warning"><p>Warning callout</p></div><p />' +
      '<div data-callout-type="error"><p>Error callout</p></div><p />' +
      '<div data-callout-type="success"><p>Success callout</p></div>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end' />
    </ThemeProvider>
  );
};
