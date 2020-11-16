/**
 * Reference:
 * https://prosemirror.net/examples/codemirror/
 */

import type { Command } from '@remirror/pm/commands';
import { keymap } from '@remirror/pm/keymap';
import { Plugin, Selection } from '@remirror/pm/state';

/**
 * Handling cursor motion from the outer to the inner editor must be done with a keymap on the outer
 * editor. The `arrowHandler` function uses the `endOfTextblock` method to determine, in a
 * bidi-text-aware way, whether the cursor is at the end of a given textblock. If it is, and the
 * next block is a code block, the selection is moved into it.
 */
function arrowHandler(dir: 'left' | 'right' | 'up' | 'down'): Command {
  return (state, dispatch, view) => {
    if (!dispatch || !view) {
      return false;
    }

    if (state.selection.empty && view.endOfTextblock(dir)) {
      const side = dir === 'left' || dir === 'up' ? -1 : 1,
        $head = state.selection.$head;
      const nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side,
      );

      if (nextPos.$head && nextPos.$head.parent.type.name === 'codeMirror') {
        dispatch(state.tr.setSelection(nextPos));
        return true;
      }
    }

    return false;
  };
}

export function createArrowHandlerPlugin(): Plugin {
  return keymap({
    ArrowLeft: arrowHandler('left'),
    ArrowRight: arrowHandler('right'),
    ArrowUp: arrowHandler('up'),
    ArrowDown: arrowHandler('down'),
  });
}
