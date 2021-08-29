import React, { useEffect, useState } from 'react';
import { UploadContext } from '@remirror/core';
import { NodeViewComponentProps, useCommands } from '@remirror/react';
import {
  CloseLineIcon as StopIcon,
  DeleteBin6LineIcon as DeleteIcon,
  DownloadLineIcon as DownloadIcon,
  File2LineIcon as FileIcon,
} from '@remirror/react-components/all-icons';
import { ExtensionFileTheme } from '@remirror/theme';

import type { FileAttributes } from './file-extension';

export type FileComponentProps = NodeViewComponentProps & {
  context?: UploadContext;
  abort: () => void;
};

export const FileComponent: React.FC<FileComponentProps> = ({
  node,
  getPosition,
  context,
  abort,
}) => {
  const attrs = node.attrs as FileAttributes;
  const fileSize = formatFileSize(attrs.fileSize ?? 0);
  return (
    <div className={ExtensionFileTheme.FILE_ROOT}>
      <IconButton>
        <FileIcon />
      </IconButton>
      <div className={ExtensionFileTheme.FILE_NAME}>{attrs.fileName}</div>
      <div className={ExtensionFileTheme.FILE_SIZE}>{fileSize}</div>
      <div style={{ flex: 1, minWidth: '8px' }} />

      {context ? (
        <UploadingFileAction context={context} abort={abort} />
      ) : (
        <UploadedFileAction attrs={attrs} getPosition={getPosition as () => number} />
      )}
    </div>
  );
};

const UploadingFileAction: React.FC<{ context: UploadContext; abort: () => void }> = ({
  context,
  abort,
}) => {
  const progress = useProgress(context);

  return (
    <>
      <div className={ExtensionFileTheme.FILE_UPLOAD_PROGRESS}>{progress}</div>
      <StopButton abort={abort} />
    </>
  );
};

const UploadedFileAction: React.FC<{
  attrs: FileAttributes;
  getPosition: () => number;
}> = ({ attrs, getPosition }) => {
  return (
    <>
      {attrs.error ? (
        <div className={ExtensionFileTheme.FILE_ERROR}>{attrs.error}</div>
      ) : (
        <DownloadFileButton attrs={attrs} />
      )}
      <div style={{ minWidth: '8px' }} />
      <DeleteFileButton getPosition={getPosition} />
    </>
  );
};

const IconButton: React.FC<React.ComponentProps<'a'>> = (props) => {
  return (
    <a
      {...props}
      className={ExtensionFileTheme.FILE_ICON_BUTTON}
      style={{
        cursor: props.onClick || props.href ? 'pointer' : 'default',
      }}
    >
      {props.children}
    </a>
  );
};

const StopButton: React.FC<{ abort: () => void }> = ({ abort }) => {
  return (
    <IconButton onClick={abort}>
      <StopIcon />
    </IconButton>
  );
};

const DeleteFileButton: React.FC<{ getPosition: () => number }> = ({ getPosition }) => {
  const { deleteFile } = useCommands();
  return (
    <IconButton onClick={() => deleteFile(getPosition())}>
      <DeleteIcon />
    </IconButton>
  );
};

const DownloadFileButton: React.FC<{ attrs: FileAttributes }> = ({ attrs }) => {
  return (
    <IconButton href={attrs.url} download={attrs.fileName} target='_blank' rel='noreferrer'>
      <DownloadIcon />
    </IconButton>
  );
};

// Taken from: https://gist.github.com/zentala/1e6f72438796d74531803cc3833c039c
function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) {
    return '0';
  }

  const k = 1024,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(decimals))} ${sizes[i]}`;
}

// Returns a number between 0 and 100
function formatProgress(contextValues: Record<string, unknown>): number {
  let loaded = contextValues['loaded'] as number;
  let total = contextValues['total'] as number;

  if (typeof loaded !== 'number' || loaded < 0) {
    loaded = 0;
  }

  if (typeof total !== 'number' || total <= 0) {
    total = 1;
  }

  const progress = (loaded / total) * 100;
  return Math.min(progress, 100);
}

function useProgress(context: UploadContext): string {
  // progress is a number between 0 and 100
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    context.addListener((values) => {
      setProgress(formatProgress(values));
    });
  }, [context]);

  return `${progress.toFixed(1)}%`;
}
