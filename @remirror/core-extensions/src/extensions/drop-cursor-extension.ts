import { Extension } from '@remirror/core';
import { BaseExtensionOptions } from '@remirror/core-types';
import { dropCursor } from 'prosemirror-dropcursor';

export interface DropCursorExtensionOptions extends BaseExtensionOptions {
  /**
   * Set the color of the cursor.
   *
   * @default 'black'
   */
  color?: string;

  /**
   * Set the precise width of the cursor in pixels.
   *
   * @default 1
   */
  width?: number;
}

export const defaultDropCursorExtensionOptions: DropCursorExtensionOptions = {
  color: 'black',
  width: 1,
};

/**
 * Create a plugin that, when added to a ProseMirror instance,
 * causes a decoration to show up at the drop position when something
 * is dragged over the editor.
 *
 * @builtin
 */
export class DropCursorExtension extends Extension<DropCursorExtensionOptions> {
  get name() {
    return 'dropCursor' as const;
  }

  get defaultOptions() {
    return defaultDropCursorExtensionOptions;
  }

  /**
   * Use the dropCursor plugin with provided options.
   */
  public plugin() {
    const { color, width } = this.options;

    return dropCursor({ color, width });
  }
}
