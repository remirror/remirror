import { CommandFunction } from '@remirror/pm';
import { Fragment, NodeRange, NodeType, ResolvedPos, Slice } from '@remirror/pm/model';
import { Transaction } from '@remirror/pm/state';
import { liftTarget, ReplaceAroundStep } from '@remirror/pm/transform';

import { calculateItemRange, wrapSelectedItems } from './list-commands';
import { isListItemNode, isListNode } from './list-utils';

function findParentItem($from: ResolvedPos, range: NodeRange) {
  const parentItem = $from.node(range.depth - 1);
  const parentList = $from.node(range.depth - 2);

  if (!isListItemNode(parentItem) || !isListNode(parentList)) {
    return false;
  }

  return { parentItem, parentList };
}

function indentSiblings(tr: Transaction, range: NodeRange, parentItemType: NodeType) {
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
        new Slice(Fragment.from(parentItemType.create(null, range.parent.copy())), 1, 0),
        1,
        true,
      ),
    );
    return new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
  }

  return range;
}

function changeItemsType(
  tr: Transaction,
  range: NodeRange,
  parentListType: NodeType,
  parentItemType: NodeType,
) {
  const wrapped = wrapSelectedItems({
    listType: parentListType,
    itemType: parentItemType,
    tr,
  });

  if (wrapped) {
    return new NodeRange(tr.selection.$from, tr.selection.$to, range.depth);
  }

  return range;
}

/**
 * A helper function to dedent selected list items
 *
 * @beta
 */
export function dedentList(tr: Transaction): boolean {
  let range = calculateItemRange(tr.selection);

  if (!range) {
    return false;
  }

  const findParentItemResult = findParentItem(tr.selection.$from, range);

  if (!findParentItemResult) {
    return false;
  }

  const { parentItem, parentList } = findParentItemResult;

  range = indentSiblings(tr, range, parentItem.type);
  range = changeItemsType(tr, range, parentList.type, parentItem.type);

  const target = liftTarget(range);

  if (typeof target !== 'number') {
    return false;
  }

  tr.lift(range, target);
  return true;
}

/**
 * @internal
 */
export const dedentListCommand: CommandFunction = ({ tr, dispatch }) => {
  if (dedentList(tr)) {
    dispatch?.(tr.scrollIntoView());
  }

  return true;
};
