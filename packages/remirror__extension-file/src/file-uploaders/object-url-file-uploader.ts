import { FileUploader } from '@remirror/core';

import { FileAttributes } from '../file-extension';
import { getDefaultFileAttrs } from './data-url-file-uploader';

export function createObjectUrlFileUploader(): FileUploader<FileAttributes> {
  let file: File;

  return {
    insert: (f: File) => {
      file = f;
      return getDefaultFileAttrs(file);
    },

    upload: () => {
      const url = URL.createObjectURL(file);
      return Promise.resolve({ ...getDefaultFileAttrs(file), url });
    },

    // `URL.createObjectURL` is sychronous. There is no change to abort the loading process.
    abort: (): void => {},
  };
}
