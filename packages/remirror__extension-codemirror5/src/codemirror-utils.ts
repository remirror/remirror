import type { ModeInfo } from 'codemirror/mode/meta';
import { CommandFunction, findParentNodeOfType, isEqual, NodeType } from '@remirror/core';
import { Selection } from '@remirror/pm/state';

import ref from './codemirror-ref';
import type { CodeMirrorExtensionAttributes } from './codemirror-types';

/**
 * Handling cursor motion from the outer to the inner editor must be done with a
 * keymap on the outer editor. The `arrowHandler` function uses the
 * `endOfTextblock` method to determine, in a bidi-text-aware way, whether the
 * cursor is at the end of a given textblock. If it is, and the next block is a
 * code block, the selection is moved into it.
 *
 * Adapted from https://prosemirror.net/examples/codemirror/
 */
export function arrowHandler(dir: 'left' | 'right' | 'up' | 'down'): CommandFunction {
  return ({ dispatch, view, tr }) => {
    if (!view) {
      return false;
    }

    if (!(tr.selection.empty && view.endOfTextblock(dir))) {
      return false;
    }

    const side = dir === 'left' || dir === 'up' ? -1 : 1;
    const $head = tr.selection.$head;
    const nextPos = Selection.near(tr.doc.resolve(side > 0 ? $head.after() : $head.before()), side);

    if (nextPos.$head && nextPos.$head.parent.type.name === 'codeMirror') {
      dispatch?.(tr.setSelection(nextPos));
      return true;
    }

    return false;
  };
}

/**
 * Updates the node attrs.
 *
 * This is used to update the language for the CodeMirror block.
 */
export function updateNodeAttributes(type: NodeType) {
  return (attributes: CodeMirrorExtensionAttributes): CommandFunction =>
    ({ state: { tr, selection }, dispatch }) => {
      const parent = findParentNodeOfType({ types: type, selection });

      if (!parent || isEqual(attributes, parent.node.attrs)) {
        // Do nothing since the attrs are the same
        return false;
      }

      tr.setNodeMarkup(parent.pos, type, { ...parent.node.attrs, ...attributes });

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    };
}

/**
 * Parse a language string to CodeMirror's mode option.
 */
export function parseLanguageToMode(language?: string): string | null {
  if (language) {
    let mime: ModeInfo | undefined;

    if ((mime = ref.CodeMirror.findModeByName(language))) {
      return mime.mode;
    } else if ((mime = ref.CodeMirror.findModeByExtension(language))) {
      return mime.mode;
    } else if ((mime = ref.CodeMirror.findModeByMIME(language))) {
      return mime.mode;
    }
  }

  return null;
}
