import { CommandFunction, ProsemirrorNode } from '@remirror/pm';
import { Fragment, NodeRange, NodeType, ResolvedPos, Slice } from '@remirror/pm/model';
import { Transaction } from '@remirror/pm/state';
import { ReplaceAroundStep } from '@remirror/pm/transform';

import { calculateItemRange, maybeJoinList, wrapSelectedItems } from './list-commands';
import { isListItemNode, isListNode } from './list-utils';

function findParentItem($from: ResolvedPos, range: NodeRange) {
  const parentItem = $from.node(range.depth - 1);
  const parentList = $from.node(range.depth - 2);

  if (!isListItemNode(parentItem) || !isListNode(parentList)) {
    return false;
  }

  return { parentItem, parentList };
}

function indentSiblingsOfItems(
  tr: Transaction,
  range: NodeRange,
  parentList: ProsemirrorNode,
  parentItem: ProsemirrorNode,
) {
  const selectedList = range.parent;
  const lastSelectedItem = range.parent.child(range.endIndex - 1);

  const endOfRange = range.end;
  const endOfSelectedList = range.$to.end(range.depth);

  if (endOfRange < endOfSelectedList) {
    // There are sibling items after the selected items, which must become
    // children of the last item
    tr.step(
      new ReplaceAroundStep(
        endOfRange - 1,
        endOfSelectedList,
        endOfRange,
        endOfSelectedList,
        new Slice(Fragment.from(lastSelectedItem.type.create(null, selectedList.copy())), 1, 0),
        1,
        true,
      ),
    );
    return new NodeRange(
      tr.doc.resolve(range.$from.pos),
      tr.doc.resolve(endOfSelectedList),
      range.depth,
    );
  }

  return range;
}

function printPos(doc: ProsemirrorNode, pos: number) {
  const $pos = doc.resolve(pos);
  console.log('pos:', $pos.pos, $pos.depth);
}

function indentSiblingsOfList(
  tr: Transaction,
  range: NodeRange,
  parentList: ProsemirrorNode,
  parentItem: ProsemirrorNode,
) {
  const selectedList = range.parent;
  const lastSelectedItem = range.parent.child(range.endIndex - 1);

  const endOfSelectedList = range.end;
  const endOfParentListItem = range.$to.end(range.depth - 1);
  console.log({
    endOfSelectedList,
    endOfParentListItem,
  });

  if (endOfSelectedList + 1 < endOfParentListItem) {
    // There are sibling nodes after the selected list, which must become
    // children of the last item

    console.log('=======');
    printPos(tr.doc, endOfSelectedList);
    printPos(tr.doc, endOfParentListItem);
    console.log('=======');

    tr.step(
      new ReplaceAroundStep(
        endOfSelectedList,
        endOfParentListItem + 1,
        endOfSelectedList + 1,
        endOfParentListItem,
        // new Slice(Fragment.from(lastSelectedItem.type.create(null)), 2, 0),
        new Slice(
          Fragment.from(selectedList.type.create(null, lastSelectedItem.type.create(null))),
          2,
          0,
        ),
        0,
        true,
      ),
    );
  }

  return range;
}

function changeItemsType(
  tr: Transaction,
  range: NodeRange,
  parentList: ProsemirrorNode,
  parentItem: ProsemirrorNode,
) {
  const wrapped = wrapSelectedItems({
    listType: parentList.type,
    itemType: parentItem.type,
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

  // debugger;
  if (!range) {
    return false;
  }

  const findParentItemResult = findParentItem(tr.selection.$from, range);

  if (!findParentItemResult) {
    return false;
  }

  const { parentItem, parentList } = findParentItemResult;

  range = indentSiblingsOfItems(tr, range, parentList, parentItem);
  range = indentSiblingsOfList(tr, range, parentList, parentItem);
  range = changeItemsType(tr, range, parentList, parentItem);

  const target = liftTarget(range);

  if (typeof target !== 'number') {
    console.log('target is void', range);
    // const range2 = new NodeRange(range.$from, range.$to, range.depth - 1);
    // const target2 = liftTarget(range2);
    // console.log('target2:', range2, target2);
    return true;
  }

  tr.lift(range, target);

  range = calculateItemRange(tr.selection);

  if (range) {
    maybeJoinList(tr, tr.doc.resolve(range.end - 2));
  }

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

function liftTarget(range: NodeRange) {
  const parent = range.parent;
  const content = parent.content.cutByIndex(range.startIndex, range.endIndex);

  for (let depth = range.depth; ; --depth) {
    const node = range.$from.node(depth);
    const index = range.$from.index(depth),
      endIndex = range.$to.indexAfter(depth);

    if (depth < range.depth) {
      const canReplace = node.canReplace(index, endIndex, content);

      console.log({ depth, canReplace });

      if (canReplace) {
        return depth;
      }
    }

    if (depth == 0 || node.type.spec.isolating || !canCut(node, index, endIndex)) {
      break;
    }
  }
}

function canCut(node, start, end) {
  const canCutResult =
    (start == 0 || node.canReplace(start, node.childCount)) &&
    (end == node.childCount || node.canReplace(0, end));
  // console.log('canCut:', { canCutResult, node, start, end });
  return canCutResult;
}
