import { ProsemirrorPlugin } from '@remirror/pm';

import { PlainExtension } from '../../extension';
import { createUploadPlaceholderPlugin } from './file-placeholder-plugin';

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
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      upload: UploadExtension;
    }
  }
}
