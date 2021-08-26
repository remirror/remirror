import { FileUploader } from '@remirror/core';

import { FileAttributes } from '../file-extension';

export class DataUrlFileUploader implements FileUploader<FileAttributes> {
  private file: File | null = null;
  private readonly fileReader: FileReader;

  constructor() {
    this.fileReader = new FileReader();
  }

  insert(file: File): FileAttributes {
    this.file = file;
    return this.getBaseAttrs();
  }

  upload(): Promise<FileAttributes> {
    const fileReader = this.fileReader;
    const file = this.file;

    if (!file) {
      throw new Error('No file to upload');
    }

    fileReader.readAsDataURL(file);
    return new Promise<FileAttributes>((resolve, reject) => {
      fileReader.addEventListener('load', () =>
        resolve({ ...this.getBaseAttrs(), url: fileReader.result as string }),
      );
      fileReader.addEventListener('error', () => {
        reject(fileReader.error);
      });
    });
  }

  abort(): void {
    this.fileReader.abort();
  }

  private getBaseAttrs(): FileAttributes {
    if (!this.file) {
      throw new Error('No file to upload');
    }

    return getDefaultFileAttrs(this.file);
  }
}

export function createDataUrlFileUploader(): DataUrlFileUploader {
  return new DataUrlFileUploader();
}

export function getDefaultFileAttrs(file: File): FileAttributes {
  return {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
}
