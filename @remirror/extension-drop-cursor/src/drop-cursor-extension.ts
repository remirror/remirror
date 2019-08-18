import { Extension, ExtensionManagerParams } from '@remirror/core';
import { createDropCursorPlugin } from './drop-cursor-plugin';
import { DropCursorExtensionOptions } from './drop-cursor-types';

export class DropCursorExtension extends Extension<DropCursorExtensionOptions> {
  get name() {
    return 'dropCursor' as const;
  }

  get defaultOptions() {
    return { width: '100%', color: 'primary' };
  }

  /**
   * Use the dropCursor plugin with provided options.
   */
  public plugin(params: ExtensionManagerParams) {
    return createDropCursorPlugin(params, this.options);
  }
}
