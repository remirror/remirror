import { Static, UploadHandler } from '@remirror/core';

import type { IframeAttributes } from './iframe-extension';

export interface IframeOptions {
  /**
   * The default source to use for the iframe.
   */
  defaultSource?: Static<string>;

  /**
   * The class to add to the iframe.
   *
   * @default 'remirror-iframe'
   */
  class?: Static<string>;

  /**
   * Enable resizing.
   *
   * If true, the iframe node will be rendered by `nodeView` instead of `toDOM`.
   *
   * @default false
   */
  enableResizing: boolean;

  /**
   * A function returns a `FileUploader` which will handle the upload process.
   */
  uploadFileHandler?: UploadHandler<IframeAttributes>;
}
