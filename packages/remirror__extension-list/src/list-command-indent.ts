import { CommandFunction, ProsemirrorNode } from '@remirror/pm';
import { Fragment, NodeRange, ResolvedPos, Slice } from '@remirror/pm/model';
import { TextSelection, Transaction } from '@remirror/pm/state';

import { calculateItemRange } from './list-commands';
import { isListItemNode, isListNode } from './list-utils';

/**
 * Try to find the previous item. Indent can only works if we can find this item.
 *
 * It may be the previous list item in the same list (in this case, `previousItem`
 * will be equal to `selectedList`), or it may be the last list item in the
 * previous list.
 */
function findPreviousItem(selectedList: ProsemirrorNode, $from: ResolvedPos, range: NodeRange) {
  let previousItem: ProsemirrorNode;
  let previousList: ProsemirrorNode;
  let previousItemStart: number;
  let previousListStart: number;

  const doc = $from.doc;

  if (range.startIndex >= 1) {
    previousItem = selectedList.child(range.startIndex - 1);
    previousList = selectedList;
    previousListStart = doc.resolve(range.start).start(range.depth);
    previousItemStart = previousListStart + 1;

    for (let i = 0; i < range.startIndex - 1; i++) {
      previousItemStart += previousList.child(i).nodeSize;
    }
  } else {
    const listIndex = $from.index(range.depth - 1);

    if (listIndex >= 1) {
      const listParent = $from.node(range.depth - 1);
      const listParentStart = $from.start(range.depth - 1);
      previousList = listParent.child(listIndex - 1);

      if (!isListNode(previousList)) {
        return false;
      }

      previousListStart = listParentStart + 1;

      for (let i = 0; i < listIndex - 1; i++) {
        previousListStart += listParent.child(i).nodeSize;
      }

      previousItem = previousList.child(previousList.childCount - 1);

      previousItemStart = previousListStart + previousList.nodeSize - previousItem.nodeSize - 1;

      if (!isListItemNode(previousItem)) {
        return false;
      }
    } else {
      return false;
    }
  }

  return {
    previousItem,
    previousList,
    previousItemStart,
    previousListStart,
  };
}

/**
 * Separate selected list item into two slices: `selectedSlice` and `unselectedSlice`.
 *
 * If `unselectedSlice` exists, we don't want to change its indentation.
 */
function sliceSelectedItems(doc: ProsemirrorNode, $to: ResolvedPos, range: NodeRange) {
  let selectedSlice: Slice;
  let unselectedSlice: Slice | null;

  const start = range.start;
  // `range.depth` is the depth of the list node. We +2 here because we want to
  // get the depth of item children (e.g. paragraph).
  const mid = $to.depth >= range.depth + 2 ? $to.end(range.depth + 2) : range.end - 1;
  const end = range.end;

  if (mid + 1 >= end) {
    selectedSlice = doc.slice(start, end);
    unselectedSlice = null;
  } else {
    selectedSlice = doc.slice(start, mid);
    unselectedSlice = doc.slice(mid + 1, end - 1);
  }

  return { selectedSlice, unselectedSlice };
}

/**
 * A helper function to indent selected list items.
 *
 * @beta
 */
export function indentList(tr: Transaction): boolean {
  const { $from, $to } = tr.selection;
  const range = calculateItemRange(tr.selection);

  if (!range) {
    return false;
  }

  const selectedList: ProsemirrorNode = tr.doc.resolve(range.start).node();

  if (!isListNode(selectedList)) {
    return false;
  }

  const findPreviousItemResult = findPreviousItem(selectedList, $from, range);

  if (!findPreviousItemResult) {
    return false;
  }

  const { previousItem, previousList, previousItemStart } = findPreviousItemResult;

  const { selectedSlice, unselectedSlice } = sliceSelectedItems(tr.doc, $to, range);

  const newPreviousItemContent: Fragment = previousItem.content
    .append(Fragment.fromArray([selectedList.copy(selectedSlice.content)]))
    .append(unselectedSlice ? unselectedSlice.content : Fragment.empty);

  tr.deleteRange(range.start, range.end);

  const previousItemEnd = previousItemStart + previousItem.nodeSize - 2; // Note: nodeSize = end - start + 2
  const newPreviousItem = previousItem.copy(newPreviousItemContent);

  newPreviousItem.check();

  tr.replaceRangeWith(previousItemStart - 1, previousItemEnd + 1, newPreviousItem);

  tr.setSelection(
    previousList === selectedList
      ? TextSelection.create(tr.doc, $from.pos, $to.pos)
      : TextSelection.create(tr.doc, $from.pos - 2, $to.pos - 2),
  );

  return true;
}

/**
 * @internal
 */
export const indentListCommand: CommandFunction = ({ tr, dispatch }) => {
  if (indentList(tr)) {
    dispatch?.(tr.scrollIntoView());
    return true;
  }

  return false;
};
