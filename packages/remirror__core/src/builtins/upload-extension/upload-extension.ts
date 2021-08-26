import { ProsemirrorPlugin } from '@remirror/pm';

import { Helper, PlainExtension } from '../../extension';
import { helper } from '../builtin-decorators';
import { createUploadPlaceholderPlugin } from './file-placeholder-plugin';
import { uploadFile, UploadFileProps } from './file-upload';

interface DecorationsOptions {}

/**
 * `UploadExtension` handle the file upload process.
 */
export class UploadExtension extends PlainExtension<DecorationsOptions> {
  get name() {
    return 'upload' as const;
  }

  /**
   * Create the extension plugin for inserting decorations into the editor.
   */
  createExternalPlugins(): ProsemirrorPlugin[] {
    return [createUploadPlaceholderPlugin()];
  }

  @helper()
  upload(props: UploadFileProps): Helper<void> {
    uploadFile(props);
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      upload: UploadExtension;
    }
  }
}
