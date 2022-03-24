import type { EditorState, ProsemirrorNode } from '@remirror/core';
import { findMatches } from '@remirror/core';

// Consider anything not whitespace a word. (Microsoft Word behaviour)
export const WORDS_REGEX = /\S+/g;

export function getTextLength(node: ProsemirrorNode): number {
  if (node.type.isTextblock) {
    // Count the linebreak at the end of a block node
    return 1;
  }

  if (node.type.isText) {
    return node.textBetween(0, node.nodeSize).length;
  }

  return 0;
}

export function getCharacterExceededPosition({ doc }: EditorState, maxCharacters: number): number {
  let count = 0;
  let foundPos = 0;

  doc.nodesBetween(0, doc.nodeSize - 2, (node, pos) => {
    if (foundPos > 0) {
      // Already found the position - return early
      return false;
    }

    const nodeTextLength = getTextLength(node);

    if (count + nodeTextLength > maxCharacters) {
      foundPos = pos + 1 + (maxCharacters - count);
      return false;
    }

    count += nodeTextLength;
    return true;
  });

  return foundPos;
}

export function getWordExceededPosition({ doc }: EditorState, maxWords: number): number {
  let count = 0;
  let foundPos = 0;

  doc.nodesBetween(0, doc.nodeSize - 2, (node, pos) => {
    if (foundPos > 0) {
      // Already found the position - return early
      return false;
    }

    if (!node.type.isText) {
      // Descend into node
      return true;
    }

    const text = node.textBetween(0, node.nodeSize);
    const matches = findMatches(text, WORDS_REGEX);

    if (count + matches.length > maxWords) {
      const index = maxWords - count;
      const word = matches[index];
      foundPos = pos + (word?.index ?? 0);
      return false;
    }

    count += matches.length;
    return true;
  });

  return foundPos;
}
