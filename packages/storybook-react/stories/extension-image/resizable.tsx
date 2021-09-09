import 'remirror/styles/all.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { ImageExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [new ImageExtension({ enableResizing: true })];

const Resizable: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions,
    content:
      '<p>You can see a resizable image below. Move you mouse over the image and drag the resizing handler to resize it.</p>' +
      '<p style="display:flex; align-items: center; justify-content: center;"><img src="https://dummyimage.com/200x80/479e0c/fafafa"></div>',
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
      />
    </ThemeProvider>
  );
};

export default Resizable;
