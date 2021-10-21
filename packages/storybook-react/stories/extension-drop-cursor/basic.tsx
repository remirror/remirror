import 'remirror/styles/all.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { DropCursorExtension, ImageExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [new ImageExtension(), new DropCursorExtension()];

const Basic: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions,
    content:
      '<p>Drag-and-drop an image file, or drag the image below to view a drop cursor.</p>' +
      '<p><img src="https://dummyimage.com/200x80/479e0c/fafafa"></p>',
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

export default Basic;
