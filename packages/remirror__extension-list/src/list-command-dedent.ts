import { CommandFunction } from '@remirror/pm';
import { Fragment, NodeRange, Slice } from '@remirror/pm/model';
import { Transaction } from '@remirror/pm/state';
import { liftTarget, ReplaceAroundStep } from '@remirror/pm/transform';

import { calculateItemRange } from './list-commands';
import { isListItemNode } from './list-utils';

export function dedentList(tr: Transaction): boolean {
  let range = calculateItemRange(tr.selection);

  if (!range) {
    return false;
  }

  const parentItem = tr.selection.$from.node(range.depth - 1);

  if (!isListItemNode(parentItem)) {
    return false;
  }

  const end = range.end;
  const endOfList = range.$to.end(range.depth);

  if (end < endOfList) {
    // There are siblings after the lifted items, which must become
    // children of the last item
    tr.step(
      new ReplaceAroundStep(
        end - 1,
        endOfList,
        end,
        endOfList,
        new Slice(Fragment.from(parentItem.type.create(null, range.parent.copy())), 1, 0),
        1,
        true,
      ),
    );
    range = new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
  }

  const target = liftTarget(range);

  if (typeof target !== 'number') {
    return false;
  }

  tr.lift(range, target).scrollIntoView();
  return true;
}

/**
 * @internal
 */
export const dedentListCommand: CommandFunction = ({ tr, dispatch }) => {
  if (dedentList(tr)) {
    dispatch?.(tr);
  }

  return true;
};
