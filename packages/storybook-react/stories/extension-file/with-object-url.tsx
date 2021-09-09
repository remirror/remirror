import 'remirror/styles/extension-file.css';

import { useCallback } from 'react';
import { createObjectUrlFileUploader, FileExtension } from '@remirror/extension-file';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const WithObjectUrl = (): JSX.Element => {
  const extensions = useCallback(
    () => [new FileExtension({ uploadFileHandler: createObjectUrlFileUploader })],
    [],
  );
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <>
      <p>
        Uses <code>URL.createObjectUrl</code> under the hood.
      </p>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender />
      </ThemeProvider>
    </>
  );
};

const content = `<p>Drag and drop one or multiple non-image files into the editor.</p>`;

export default WithObjectUrl;
