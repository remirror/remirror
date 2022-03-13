import 'remirror/styles/extension-file.css';

import { useCallback } from 'react';
import { DropCursorExtension } from 'remirror/extensions';
import { FileExtension } from '@remirror/extension-file';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const Basic = (): JSX.Element => {
  const extensions = useCallback(() => [new FileExtension({}), new DropCursorExtension()], []);
  const { manager, state } = useRemirror({ extensions, content });

  return (
    <>
      <p>
        Default Implementation. Uses <code>FileReader.readAsDataURL</code> under the hood.
      </p>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender />
      </ThemeProvider>
    </>
  );
};

const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Drag and drop one or multiple non-image files into the editor.',
        },
      ],
    },
    {
      type: 'file',
      attrs: {
        id: null,
        url: 'data:text/plain;base64,SGVsbG8gd29ybGQhCgo=',
        fileName: 'hello.txt',
        fileType: 'text/plain',
        fileSize: 14,
        error: null,
      },
    },
  ],
};

export default Basic;
