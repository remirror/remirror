import 'remirror/styles/extension-file.css';

import React, { useCallback } from 'react';
import {
  createBaseuploadFileUploader,
  createObjectUrlFileUploader,
  createSlowFileUploader,
  FileExtension,
} from '@remirror/extension-file';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

import { useFileDialog } from './use-file-dialog';

export default { title: 'Extensions / File' };

export const Default = (): JSX.Element => {
  const extensions = useCallback(() => [new FileExtension({})], []);
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

export const WithObjectUrl = (): JSX.Element => {
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
        <Remirror manager={manager} initialContent={state} autoRender>
          <UploadFileButton />
        </Remirror>
      </ThemeProvider>
    </>
  );
};

export const WithBashupload = (): JSX.Element => {
  const extensions = useCallback(
    () => [new FileExtension({ uploadFileHandler: createBaseuploadFileUploader })],
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
        <Remirror manager={manager} initialContent={state} autoRender>
          <UploadFileButton />
        </Remirror>
      </ThemeProvider>
    </>
  );
};

export const UploadProgress = (): JSX.Element => {
  const extensions = useCallback(
    () => [new FileExtension({ uploadFileHandler: createSlowFileUploader })],
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
        <Remirror manager={manager} initialContent={state} autoRender>
          <UploadFileButton />
        </Remirror>
      </ThemeProvider>
    </>
  );
};

const UploadFileButton: React.FC = () => {
  const { uploadFiles } = useCommands();
  const { openFileDialog } = useFileDialog(uploadFiles);
  return <button onClick={openFileDialog}>Upload file</button>;
};

const html = String.raw; // Just for better editor support
const content = html`<p>
  Drag and drop one or multiple non-image files into the editor or click the button at the bottom.
</p>`;
