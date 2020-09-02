import { extensionDecorator, PlainExtension } from '@remirror/core';
import { dropCursor } from '@remirror/pm/dropcursor';

export interface DropCursorOptions {
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

/**
 * Create a plugin that, when added to a ProseMirror instance,
 * causes a decoration to show up at the drop position when something
 * is dragged over the editor.
 *
 * @builtin
 */
@extensionDecorator<DropCursorOptions>({
  defaultOptions: {
    color: 'black',
    width: 1,
  },
})
export class DropCursorExtension extends PlainExtension<DropCursorOptions> {
  get name() {
    return 'dropCursor' as const;
  }

  /**
   * Use the dropCursor plugin with provided options.
   */
  public createExternalPlugins() {
    const { color, width } = this.options;

    return [dropCursor({ color, width })];
  }
}
