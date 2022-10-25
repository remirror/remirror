import 'remirror/styles/all.css';

import React from 'react';
import { ImageExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [new ImageExtension({ enableResizing: true })];

const Resizable = (): JSX.Element => {
  const imageSrc = 'https://dummyimage.com/2000x800/479e0c/fafafa';

  const { manager, state, onChange } = useRemirror({
    extensions,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'image',
              attrs: {
                height: 160,
                width: 400,
                src: imageSrc,
              },
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'You can see a resizable image above. Move your mouse over the image and drag the resizing handler to resize it.',
            },
          ],
        },
      ],
    },
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
