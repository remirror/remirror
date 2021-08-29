import { FileUploader, UploadContext } from '@remirror/core';

import { FileAttributes } from '../file-extension';
import { getDefaultFileAttrs } from './data-url-file-uploader';

class BaseuploadFileUploader implements FileUploader<FileAttributes> {
  private file: File | null = null;
  private readonly xhr: XMLHttpRequest;
  private readonly uploadPromise: Promise<string>;

  constructor() {
    this.xhr = new XMLHttpRequest();

    this.uploadPromise = new Promise<string>((resolve, reject) => {
      this.xhr.addEventListener('load', () => {
        try {
          const response: string = this.xhr.responseText;
          const rawUrl: string = JSON.parse(response)?.file?.url;

          if (!rawUrl) {
            throw new Error('incorrect response structure');
          }

          resolve(`${rawUrl}?download=1`);
        } catch (error) {
          reject(new Error(`something went wrong when parsing the server response: ${error}`));
        }
      });
      this.xhr.addEventListener('error', () => {
        reject(new Error(`something went wrong when uploading the file`));
      });
      this.xhr.addEventListener('abort', () => {
        reject(new Error(`Aborted`));
      });
    });
  }

  insert(file: File) {
    this.file = file;
    return getDefaultFileAttrs(file);
  }

  async upload(context: UploadContext): Promise<FileAttributes> {
    const file = this.file;

    if (!file) {
      throw new Error('No file to upload');
    }

    this.xhr.addEventListener('progress', (event) => {
      context.set('loaded', event.loaded);
      context.set('total', event.total);
    });

    // start reading and uploading
    this.xhr.open('POST', 'https://bashupload.com/upload');
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('json', 'true');
    this.xhr.send(form);

    // wait for the upload to finish
    const uploadUrl = await this.uploadPromise;
    return { ...getDefaultFileAttrs(file), url: uploadUrl };
  }

  abort(): void {
    this.xhr.abort();
  }
}

export function createBaseuploadFileUploader(): FileUploader<FileAttributes> {
  return new BaseuploadFileUploader();
}
