import { findParentNode } from '@remirror/core';
import { NodeType, ProsemirrorNode, ResolvedPos, Transaction } from '@remirror/pm';
import { Fragment, NodeRange, Slice } from '@remirror/pm/model';
import { NodeSelection, Selection, TextSelection } from '@remirror/pm/state';

import { isListItemNode, isListNode } from './list-utils';

export function indentListItemsSelected(tr: Transaction): boolean {
  const originalSelection = tr.selection;
  const normalizedSelection = originalSelection;

  const { $from, $to } = normalizedSelection;
  const range = calculateRange({ selection: normalizedSelection });

  if (!range) {
    return false;
  }

  const listItemsSelected = {
    from: findFirstParentListItemNode($from),
    to: findFirstParentListItemNode($to),
  };

  if (!listItemsSelected.from || !listItemsSelected.to) {
    return false;
  }

  const resolvedPos = tr.doc.resolve(listItemsSelected.from.pos);
  const listItemIndex = resolvedPos.index();
  const positionListItemPosition = resolvedPos.posAtIndex(listItemIndex - 1);
  const previousListItem = tr.doc.nodeAt(positionListItemPosition);

  if (!previousListItem || !isListItemNode(previousListItem)) {
    return false;
  }

  if (isListItemNode(previousListItem) && listItemIndex === 0) {
    return false;
  }

  const listItemSelectedCommonParent = range.parent;
  const previousNestedList = isListNode(previousListItem.lastChild)
    ? previousListItem.lastChild
    : null;
  const listNodeType = previousNestedList
    ? previousNestedList.type
    : listItemSelectedCommonParent.type;
  const nestedList = listItemsSelected.to.node.lastChild;

  const nestedItemsOffset = nestedList && isListNode(nestedList) ? nestedList.nodeSize : 0;
  const from = listItemsSelected.from.pos;
  const to = listItemsSelected.to.pos + listItemsSelected.to.node.nodeSize - nestedItemsOffset;
  const [sliceSelected, nestedListItemsLeftover] = createIndentedListItemsSlice({
    tr,
    listNodeType,
    range,
    from,
    to,
  });
  const hasPreviousNestedList = Boolean(previousNestedList);
  const start = from - 1;
  tr.replaceRange(hasPreviousNestedList ? start - 1 : start, to, sliceSelected);
  // debugger;

  const leftoverContentPosition = tr.mapping.map(to) - 2;

  // if (nestedListItemsLeftover.openStart === 0) {
  //   tr.insert(leftoverContentPosition, nestedListItemsLeftover.content);
  //   // debugger;
  // } else {
  //   tr.replace(
  //     leftoverContentPosition - nestedListItemsLeftover.openStart,
  //     leftoverContentPosition - nestedListItemsLeftover.openStart,
  //     nestedListItemsLeftover,
  //   );
  //   // debugger;
  // }

  // const nextSelection = calculateNewSelection({
  //   originalSelection,
  //   normalizedSelection,
  //   tr,
  //   hasPreviousNestedList,
  // });

  // tr.setSelection(nextSelection);
  return true;
}

function findFirstParentListItemNode($pos: ResolvedPos):
  | {
      pos: number;
      node: ProsemirrorNode;
    }
  | null
  | undefined {
  return findParentNode({ selection: $pos, predicate: isListItemNode });
}

type NormalizeListItemsSelection = (props: {
  selection: Selection;
  doc: ProsemirrorNode;
}) => Selection;
const normalizeListItemsSelection: NormalizeListItemsSelection = ({ selection }) => {
  if (selection.empty) {
    return selection;
  }

  const { $from, $to } = selection;

  if (selection instanceof NodeSelection) {
    const head = resolvePositionToStartOfListItem($from);
    return new TextSelection(head, head);
  }

  const head = resolvePositionToStartOfListItem($from);
  const anchor = resolvePositionToEndOfListItem($to);

  return new TextSelection(anchor, head);
};

const resolvePositionToStartOfListItem = ($pos: ResolvedPos): ResolvedPos => {
  const fromRange = $pos.blockRange($pos, isListItemNode);
  const fromPosition =
    fromRange && $pos.textOffset === 0 && fromRange.end - 1 === $pos.pos
      ? Selection.near($pos.doc.resolve(fromRange.end + 1), 1).$from
      : $pos;

  return fromPosition;
};

const resolvePositionToEndOfListItem = ($pos: ResolvedPos): ResolvedPos => {
  const toRange = $pos.blockRange($pos, isListItemNode);
  const toPosition =
    toRange && $pos.textOffset === 0 && toRange.start + 1 === $pos.pos
      ? Selection.near($pos.doc.resolve(toRange.start - 1), -1).$to
      : $pos;

  return toPosition;
};

type CalculateRange = (props: { selection: Selection }) => NodeRange | null;
const calculateRange: CalculateRange = ({ selection }) => {
  const { $from, $to } = selection;
  const range = $from.blockRange($to, isListNode);

  if (!range) {
    return null;
  }

  return range;
};

interface CalculateNewSelectionProps {
  originalSelection: Selection;
  normalizedSelection: Selection;
  tr: Transaction;
  hasPreviousNestedList: boolean;
}

const calculateNewSelection = ({
  tr,
  normalizedSelection,
  originalSelection,
  hasPreviousNestedList,
}: CalculateNewSelectionProps) => {
  const offset = hasPreviousNestedList ? 2 : 0;
  const { $from, $to } = normalizedSelection;

  if (originalSelection instanceof NodeSelection) {
    return NodeSelection.create(tr.doc, $from.pos - offset);
  }

  const { $from: nextSelectionFrom } = Selection.near(tr.doc.resolve($from.pos - offset));
  const { $to: nextSelectionTo } = Selection.near(tr.doc.resolve($to.pos - offset), -1);
  return new TextSelection(nextSelectionFrom, nextSelectionTo);
};

interface CreateIndentedListItemsSliceProps {
  tr: Transaction;
  from: number;
  to: number;
  listNodeType: NodeType;
  range: NodeRange;
}
const createIndentedListItemsSlice = ({
  tr,
  from,
  to,
  listNodeType,
  range,
}: CreateIndentedListItemsSliceProps): [Slice, Slice] => {
  const listItemsSlice = tr.doc.slice(from, to - 2);
  const listFragment = Fragment.from(listNodeType.create(null, listItemsSlice.content));

  const nonSelectedListItemsSlice = tr.doc.slice(to, range.end - 2);

  const openStart = tr.doc.slice(from - 1, range.end).openStart;
  const slice = new Slice(listFragment, openStart, 0);

  return [slice, nonSelectedListItemsSlice];
};
