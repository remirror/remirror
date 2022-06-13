import 'remirror/styles/extension-file.css';

import React, { useCallback } from 'react';
import { DropCursorExtension } from 'remirror/extensions';
import { FileExtension } from '@remirror/extension-file';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const WithUploadFileButton = (): JSX.Element => {
  const extensions = useCallback(() => [new FileExtension({}), new DropCursorExtension()], []);
  const { manager, state } = useRemirror({ extensions, content, stringHandler: 'html' });

  return (
    <>
      <p>
        Default Implementation. Uses <code>FileReader.readAsDataURL</code> under the hood.
      </p>
      <ThemeProvider>
        <Remirror manager={manager} initialContent={state} autoRender>
          <UploadFileButton />
        </Remirror>
      </ThemeProvider>
    </>
  );
};

function useFileDialog(
  uploadFiles: (files: File[]) => void,
  accept?: string,
): {
  openFileDialog: () => void;
} {
  const openFileDialog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;

    if (accept) {
      input.accept = accept;
    }

    input.addEventListener('change', (event: Event) => {
      const { files } = event.target as HTMLInputElement;

      if (files) {
        const fileArray: File[] = [];

        for (const file of files) {
          fileArray.push(file);
        }

        uploadFiles(fileArray);
      }
    });

    input.click();
  };

  return { openFileDialog };
}

const UploadFileButton: React.FC = () => {
  const { uploadFiles } = useCommands();
  const { openFileDialog } = useFileDialog(uploadFiles);
  return <button onClick={openFileDialog}>Upload file</button>;
};

const content = `<p>Drag and drop one or multiple non-image files into the editor or click the button at the bottom.</p>`;

export default WithUploadFileButton;
