import 'remirror/styles/all.css';

import React from 'react';
import { FileUploader } from 'remirror';
import { IframeAttributes, IframeExtension } from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { createBaseuploadFileUploader } from '@remirror/extension-file';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

import { useFileDialog } from '../extension-file/use-file-dialog';

export default { title: 'Extensions / Embed' };

const AddIframeButton = () => {
  const commands = useCommands();
  const handleClick = () =>
    commands.addIframe({ src: 'https://remirror.io/', height: 250, width: 500 });
  return <button onClick={handleClick}>Add iframe</button>;
};

export const Basic: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new IframeExtension()],
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <AddIframeButton />
      </Remirror>
    </ThemeProvider>
  );
};

export const Resizable: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new IframeExtension({ enableResizing: true })],
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <AddIframeButton />
      </Remirror>
    </ThemeProvider>
  );
};

const AddYoutubeButton = () => {
  const commands = useCommands();
  const handleClick = () => commands.addYouTubeVideo({ video: 'Zi7sRMcJT-o', startAt: 450 });
  return <button onClick={handleClick}>Add video</button>;
};

export const Youtube: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new IframeExtension({ enableResizing: true })],
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <AddYoutubeButton />
      </Remirror>
    </ThemeProvider>
  );
};

export const UploadPDF: React.FC = () => {
  const { manager } = useRemirror({
    extensions: () => [new IframeExtension({ enableResizing: true, uploadFileHandler })],
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender='end'>
        <UploadPDFButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};

const UploadPDFButton: React.FC = () => {
  const { uploadIframeFiles } = useCommands();
  const { openFileDialog } = useFileDialog(uploadIframeFiles, '.pdf');
  return <button onClick={openFileDialog}>Click me to upload some PDF files</button>;
};

function uploadFileHandler(): FileUploader<IframeAttributes> {
  const uploader = createBaseuploadFileUploader();

  return {
    insert: (file) => {
      uploader.insert(file);
      return { src: URL.createObjectURL(file) };
    },
    upload: async (context) => {
      const { url } = await uploader.upload(context);
      return { src: (url || '').replace('download=1', '') };
    },
    abort: () => {
      uploader.abort();
    },
  };
}
