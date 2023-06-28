import { FileUploader, UploadContext } from '@remirror/core';

import { FileAttributes } from '../file-extension';
import { getDefaultFileAttrs } from './data-url-file-uploader';

/**
 * Mock implementation of a FileUploader to test slow file uploads
 */
export function createSlowFileUploader(): FileUploader<FileAttributes> {
  let file: File;
  let aborted = false;

  return {
    insert: (f: File) => {
      file = f;
      return getDefaultFileAttrs(file);
    },

    upload: async (context: UploadContext) => {
      // We want the upload process to finish in about 8 seconds
      const total = 8000;
      // Update the progress every 200ms
      const chunk = 200;

      let loaded = 0;
      context.set('total', total);
      context.set('loaded', loaded);

      while (loaded < total) {
        if (aborted) {
          throw new Error('Canceled');
        }

        await new Promise((resolve) => setTimeout(resolve, chunk));
        loaded += 2 * Math.random() * chunk;
        loaded = Math.min(total, loaded);
        // console.log(`Uploading ${file.name}. Progress: ${Math.floor((100 * loaded) / total)}%`);
        context.set('loaded', loaded);
      }

      const url = URL.createObjectURL(file) + '#uploaded';
      return { ...getDefaultFileAttrs(file), url };
    },

    abort: (): void => {
      aborted = true;
    },
  };
}
