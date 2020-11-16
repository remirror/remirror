import 'codemirror/mode/meta';

import CodeMirror from 'codemirror';

import { CommandFunction, findParentNodeOfType, isEqual, NodeType } from '@remirror/core';

import type { CodeMirrorExtensionAttributes } from './codemirror-types';

/**
 * Updates the node attrs.
 *
 * This is used to update the language for the CodeMirror block.
 */
export function updateNodeAttributes(type: NodeType) {
  return (attributes: CodeMirrorExtensionAttributes): CommandFunction => ({
    state: { tr, selection },
    dispatch,
  }) => {
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
    const mime = CodeMirror.findModeByName(language);
    return mime?.mode;
  }

  return null;
}
