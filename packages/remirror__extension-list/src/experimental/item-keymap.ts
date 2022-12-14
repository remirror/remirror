import { KeyBindings, NodeType } from '@remirror/core';

import {
  createDedentListCommand,
  createIndentListCommand,
  createSplitListCommand,
} from './item-commands';

export function createListItemKeymap(itemType: NodeType): KeyBindings {
  return {
    Enter: createSplitListCommand(itemType),

    'Shift-Tab': createDedentListCommand(itemType),

    Tab: createIndentListCommand(itemType),

    'Mod-Shift-l': ({ tr, dispatch }): boolean => {
      let range: number[] | null = null;

      tr.doc.descendants((node, pos) => {
        if (node.type.name === 'blockquote') {
          range = [pos, pos + node.nodeSize];
        }
      });

      if (range) {
        dispatch?.(tr.deleteRange(range[0], range[1]));
        return true;
      }

      return false;
    },
  };
}
