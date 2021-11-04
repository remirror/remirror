import 'remirror/styles/all.css';

import React from 'react';
import { ImageExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [new ImageExtension({ enableResizing: true })];

const Resizable: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions,
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'You can see a resizable image below. Move your mouse over the image and drag the resizing handler to resize it.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'image',
              attrs: {
                alt: '',
                crop: null,
                height: 160,
                width: 400,
                rotate: null,
                src: 'https://deelay.me/10000/https://dummyimage.com/2000x800/479e0c/fafafa',
                title: '',
                fileName: null,
                resizable: false,
              },
            },
          ],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'aa' }] },
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
