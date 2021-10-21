import { UploadContext } from './upload-context';

export interface FileUploader<NodeAttributes> {
  /**
   * Inserts the file (but doesn't start the upload operation) and returns an
   * object with this to be uploaded file's attributes.
   */
  insert: (file: File) => NodeAttributes;

  /**
   * Starts the upload operation and returns a promise. The promise will be
   * resolved by a successful upload with uploaded file's attributes, or rejected
   * because of an error.
   *
   * `upload` can update the object `context` to update information during
   * the upload process. `context` will be passed to the render function. The
   * render function can add a listener to `context` by using `context.addListener`
   * to get the updated values. The default render function will try to find the
   * keys `loaded` and `total` in `context`, which are two numbers that
   * represent the progress of the upload.
   */
  upload: (context: UploadContext) => Promise<NodeAttributes>;

  /**
   * Aborts the upload operation.
   */
  abort: () => void;
}
