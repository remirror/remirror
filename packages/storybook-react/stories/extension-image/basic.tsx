import 'remirror/styles/all.css';

import { ImageExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const extensions = () => [new ImageExtension()];

const Basic = ({ delaySeconds = 1 }: { delaySeconds: number }): JSX.Element => {
  const imageSrc = 'https://dummyimage.com/2000x800/479e0c/fafafa';
  const proxySrc = `https://deelay.me/${delaySeconds * 1000}/${imageSrc}`;

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
                src: proxySrc,
              },
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'You can see a green image below.',
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

export default Basic;
