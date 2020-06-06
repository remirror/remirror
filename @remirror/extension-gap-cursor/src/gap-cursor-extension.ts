import { isInstanceOf, PlainExtension } from '@remirror/core';
import { GapCursor, gapCursor } from '@remirror/pm/gapcursor';

export interface GapCursorOptions {}

/**
 * Create a gap cursor plugin.
 *
 * @remarks
 *
 * When enabled, this will capture clicks near and arrow-key-motion past places
 * that don't have a normally selectable position nearby, and create a gap
 * cursor selection for them. The cursor is drawn as an element with class
 * `ProseMirror-gapcursor`.
 *
 * Make sure to import the styles as shown below.
 *
 * ```ts
 * import '@remirror/styles/extension-gap-cursor.css';
 * ```
 */
export class GapCursorExtension extends PlainExtension<GapCursorOptions> {
  get name() {
    return 'gapCursor' as const;
  }

  public createExternalPlugins = () => {
    return [gapCursor()];
  };
}

/**
 * Predicate checking whether the selection is a GapCursor
 *
 * @param value - the value to check
 */
export const isGapCursorSelection = isInstanceOf(GapCursor);
