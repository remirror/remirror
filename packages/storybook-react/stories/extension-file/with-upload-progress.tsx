import 'remirror/styles/extension-file.css';

import { useCallback } from 'react';
import { DropCursorExtension } from 'remirror/extensions';
import { createSlowFileUploader, FileExtension } from '@remirror/extension-file';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const WithUploadProgress = (): JSX.Element => {
  const extensions = useCallback(
    () => [
      new FileExtension({ uploadFileHandler: createSlowFileUploader }),
      new DropCursorExtension(),
    ],
    [],
  );
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <>
      <p>
        An example with slow uploading speed. You can see the upload progress and an abort button in
        this example.
      </p>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender />
      </ThemeProvider>
    </>
  );
};

const content = `<p>Drag and drop one or multiple non-image files into the editor.</p>`;

export default WithUploadProgress;
