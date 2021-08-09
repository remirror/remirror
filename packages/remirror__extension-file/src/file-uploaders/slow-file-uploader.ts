import { UploadContext } from '../file-upload-context';
import { FileUploader } from '../file-uploader';
import { getDefaultFileAttrs } from './data-url-file-uploader';

export function createSlowFileUploader(): FileUploader {
  let file: File;
  let aborted = false;

  return {
    insert: (f: File) => {
      file = f;
      return getDefaultFileAttrs(file);
    },

    upload: async (context: UploadContext) => {
      const total = 1000;
      let loaded = 0;
      context.set('total', total);
      context.set('loaded', loaded);

      while (loaded < total) {
        if (aborted) {
          throw new Error('Canceled');
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
        loaded += Math.random() * 40;
        loaded = Math.min(total, loaded);
        context.set('loaded', loaded);
      }

      const url = URL.createObjectURL(file);
      return { ...getDefaultFileAttrs(file), url };
    },

    abort: (): void => {
      aborted = true;
    },
  };
}
