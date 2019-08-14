import { Extension } from '@remirror/core';
import { isInstanceOf } from '@remirror/core-helpers';
import { css } from '@remirror/react-utils';
import { gapCursor, GapCursor } from 'prosemirror-gapcursor';

/**
 * Create a gap cursor plugin. When enabled, this will capture clicks
 * near and arrow-key-motion past places that don't have a normally
 * selectable position nearby, and create a gap cursor selection for
 * them. The cursor is drawn as an element with class
 * `ProseMirror-gapcursor`.
 *
 * @builtin
 */
export class GapCursorExtension extends Extension {
  get name() {
    return 'gapCursor' as const;
  }

  /**
   * Sets the styling for the gapCursor.
   *
   * @remark
   *
   * To override set `exclude.styles` to true and pass you desired `extraStyles` into the editor.
   *
   * ```ts
   * const extraStyles = css`...all my styles`;
   * new GapCursorExtension({ exclude: {styled: true}, extraStyles });
   * ```
   *
   * Taken from https://github.com/ProseMirror/prosemirror-gapcursor/blob/d8dfba0aa58439ec840c0848c3a79cea7d33ea4f/style/gapcursor.css#L1-L25
   */
  public styles() {
    return css`
      .ProseMirror-gapcursor {
        display: none;
        pointer-events: none;
        position: absolute;
      }

      .ProseMirror-gapcursor:after {
        content: '';
        display: block;
        position: absolute;
        top: -2px;
        width: 20px;
        border-top: 1px solid black;
        animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
      }

      @keyframes ProseMirror-cursor-blink {
        to {
          visibility: hidden;
        }
      }

      .ProseMirror-focused .ProseMirror-gapcursor {
        display: block;
      }
    `;
  }

  /**
   * Adds the gapCursor plugin functionality into the editor.
   */
  public plugin() {
    return gapCursor();
  }
}

/**
 * Predicate checking whether the selection is a GapCursor
 *
 * @param value - the value to check
 *
 * @public
 */
export const isGapCursorSelection = isInstanceOf(GapCursor);
