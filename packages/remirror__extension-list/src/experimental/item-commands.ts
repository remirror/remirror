import { CommandFunction, convertCommand, DispatchFunction } from '@remirror/pm';
import {
  chainCommands as pmChainCommands,
  createParagraphNear,
  newlineInCode,
  splitBlock,
} from '@remirror/pm/commands';
import { Fragment, NodeRange, NodeType, Slice } from '@remirror/pm/model';
import { Transaction } from '@remirror/pm/state';
import { canSplit, liftTarget, ReplaceAroundStep } from '@remirror/pm/transform';

import { findIndentationRange, isBlockNodeSelection, isItemRange } from './item-utils';

// This command has the same behavior as the `Enter` keybinding, but without the
// `liftEmptyBlock` command.
const enterWithoutLift = convertCommand(
  pmChainCommands(newlineInCode, createParagraphNear, splitBlock),
);

export function createSplitListCommand(itemType: NodeType): CommandFunction {
  return (props): boolean => {
    const { tr, dispatch, state } = props;
    const { selection } = state;
    const { $from, $to } = selection;

    if (isBlockNodeSelection(selection)) {
      return false;
    }

    if (!$from.sameParent($to)) {
      return false;
    }

    if ($from.depth < 2) {
      return false;
    }

    const currItem = $from.node(-1);

    if (currItem.type !== itemType) {
      return false;
    }

    // If the cursor is inside the list item, but not inside the first child
    // of the list item, then we don't want to split the list item and we
    // also don't want to lift the parent block. So we use the original
    // ProseMirror `Enter` keybinding but remove the `liftEmptyBlock`
    // command from it.
    if ($from.index(-1) !== 0) {
      return enterWithoutLift(props);
    }

    // If the parent block is empty, we lift this empty block.
    if ($from.parent.content.size === 0) {
      return false;
    }

    // Split the list item
    const nextType = $to.pos === $from.end() ? currItem.contentMatchAt(0).defaultType : undefined;
    tr.delete($from.pos, $to.pos);
    const typesAfter = [
      { type: currItem.type, attrs: currItem.attrs },
      nextType ? { type: nextType } : null,
    ];

    if (!canSplit(tr.doc, $from.pos, 2, typesAfter)) {
      return false;
    }

    dispatch?.(tr.split($from.pos, 2, typesAfter).scrollIntoView());
    return true;
  };
}

export function createDedentListCommand(itemType: NodeType): CommandFunction {
  return (props): boolean => {
    const { state, dispatch, tr } = props;

    const { $from, $to } = state.selection;
    // const range = findItemRange($from, $to, itemType)
    const range = findIndentationRange($from, $to, itemType, false);

    if (!range) {
      return false;
    }

    if (isItemRange(range, itemType)) {
      return liftToOuterList(tr, dispatch, itemType, range);
    }

    return liftBlockRange(tr, dispatch, range);
  };
}

function liftToOuterList(
  tr: Transaction,
  dispatch: DispatchFunction | undefined,
  itemType: NodeType,
  range: NodeRange,
) {
  const endOfItem = range.end;
  const endOfSiblings = range.$to.end(range.depth);

  if (endOfItem < endOfSiblings) {
    // There are siblings after the lifted items, which must become
    // children of the last item
    tr.step(
      new ReplaceAroundStep(
        endOfItem - 1,
        endOfSiblings,
        endOfItem,
        endOfSiblings,
        new Slice(Fragment.from(itemType.create(null)), 1, 0),
        0,
        true,
      ),
    );
    range = new NodeRange(
      tr.doc.resolve(range.$from.pos),
      tr.doc.resolve(endOfSiblings),
      range.depth,
    );
  }

  return liftBlockRange(tr, dispatch, range);
}

function liftBlockRange(tr: Transaction, dispatch: DispatchFunction | undefined, range: NodeRange) {
  const target = liftTarget(range);

  if (target == null) {
    return false;
  }

  dispatch?.(tr.lift(range, target).scrollIntoView());
  return true;
}

export function createIndentListCommand(itemType: NodeType): CommandFunction {
  return (props): boolean => {
    const { tr, dispatch } = props;

    const { $from, $to } = tr.selection;
    // const range = findItemRange($from, $to, itemType)
    const range = findIndentationRange($from, $to, itemType, true);

    if (!range) {
      return false;
    }

    const { startIndex, parent } = range;

    const nodeBefore = startIndex > 0 ? parent.child(startIndex - 1) : null;
    const itemBefore = nodeBefore?.type === itemType ? nodeBefore : null;

    if (dispatch) {
      const attrs = parent.type === itemType ? parent.attrs : null;
      const slice = new Slice(Fragment.from(itemType.create({ ...attrs })), itemBefore ? 1 : 0, 0);
      const { start, end } = range;
      tr.step(
        new ReplaceAroundStep(
          start - (itemBefore ? 1 : 0),
          end,
          start,
          end,
          slice,
          itemBefore ? 0 : 1,
          true,
        ),
      );
      dispatch(tr.scrollIntoView());
    }

    return true;
  };
}
