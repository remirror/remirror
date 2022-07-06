import 'remirror/styles/extension-file.css';

import React, { useCallback } from 'react';
import { DropCursorExtension } from 'remirror/extensions';
import { createBaseuploadFileUploader, FileExtension } from '@remirror/extension-file';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const WithBashupload = (): JSX.Element => {
  const extensions = useCallback(
    () => [
      new FileExtension({ uploadFileHandler: createBaseuploadFileUploader }),
      new DropCursorExtension(),
    ],
    [],
  );
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <>
      <p>
        Actually upload the file to <a href='https://bashupload.com/'>https://bashupload.com/</a>.{' '}
        bashupload is an open-source project created by IO-Technologies. Star it on{' '}
        <a href='https://github.com/IO-Technologies/bashupload'>GitHub</a>.
      </p>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender />
      </ThemeProvider>
    </>
  );
};

const content = `<p>Drag and drop one or multiple non-image files into the editor.</p>`;

export default WithBashupload;
