import { Transaction } from '@remirror/core';
import { Attrs, NodeType } from '@remirror/pm/dist-types/model';
import { InputRule } from '@remirror/pm/inputrules';
import { findWrapping } from '@remirror/pm/transform';

import { ListAttributes } from './item-types';

export function wrappingItemInputRule<T extends Attrs = ListAttributes>(
  regexp: RegExp,
  itemType: NodeType,
  getAttrs: T | ((matches: RegExpMatchArray) => T),
): InputRule {
  return new InputRule(regexp, (state, match, start, end): Transaction | null => {
    const tr = state.tr;
    tr.deleteRange(start, end);

    const attrs = typeof getAttrs === 'function' ? getAttrs(match) : getAttrs;

    const $pos = tr.selection.$from;

    if ($pos.depth >= 2 && $pos.node(-1).type === itemType) {
      const foundItem = $pos.node(-1);
      let needUpdate = false;

      for (const [key, value] of Object.entries(attrs)) {
        if (foundItem.attrs[key] !== value) {
          needUpdate = true;
          break;
        }
      }

      if (needUpdate) {
        tr.setNodeMarkup($pos.before(-1), undefined, { ...foundItem.attrs, ...attrs });
        return tr;
      } else {
        return null;
      }
    } else {
      const $start = tr.doc.resolve(start);
      const range = $start.blockRange();

      if (!range) {
        return null;
      }

      const wrapping = findWrapping(range, itemType, attrs);

      if (!wrapping) {
        return null;
      }

      tr.wrap(range, wrapping);
      return tr;
    }
  });
}
