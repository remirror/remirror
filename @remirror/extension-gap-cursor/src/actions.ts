import {
  atTheBeginningOfDoc,
  atTheEndOfDoc,
  CommandFunction,
  EditorView,
  findDomRefAtPos,
  GapCursorSelection,
  isGapCursorSelection,
  isTextSelection,
  removeNodeBefore,
  Side,
  ZERO_WIDTH_SPACE_CHAR,
} from '@remirror/core';
import { Selection } from 'prosemirror-state';
import { Direction, isBackward, isForward } from './direction';
import { isTextBlockNearPos } from './utils';

export const arrow = (dir: Direction, endOfTextblock?: EditorView['endOfTextblock']): CommandFunction => (
  state,
  dispatch,
  view,
) => {
  if (!endOfTextblock) {
    return false;
  }
  const { doc, schema, selection, tr } = state;

  let $pos = isBackward(dir) ? selection.$from : selection.$to;
  let mustMove = selection.empty;

  // start from text selection
  if (isTextSelection(selection)) {
    // if cursor is in the middle of a text node, do nothing
    if (!endOfTextblock(dir)) {
      return false;
    }

    // UP/DOWN jumps to the nearest textblock skipping gapcursor whenever possible
    if (
      (dir === Direction.UP && !atTheBeginningOfDoc(state) && isTextBlockNearPos(doc, schema, $pos, -1)) ||
      (dir === Direction.DOWN && (atTheEndOfDoc(state) || isTextBlockNearPos(doc, schema, $pos, 1)))
    ) {
      return false;
    }

    // otherwise resolve previous/next position
    $pos = doc.resolve(isBackward(dir) ? $pos.before() : $pos.after());
    mustMove = false;
  }

  // when jumping between block nodes at the same depth, we need to reverse cursor without changing ProseMirror position
  if (
    isGapCursorSelection(selection) &&
    // next node allow gap cursor position
    GapCursorSelection.isValidTargetNode(isBackward(dir) ? $pos.nodeBefore : $pos.nodeAfter) &&
    // gap cursor changes block node
    ((isBackward(dir) && selection.side === Side.LEFT) || (isForward(dir) && selection.side === Side.RIGHT))
  ) {
    // reverse cursor position
    if (dispatch) {
      dispatch(
        tr
          .setSelection(new GapCursorSelection($pos, selection.side === Side.RIGHT ? Side.LEFT : Side.RIGHT))
          .scrollIntoView(),
      );
    }
    return true;
  }

  if (view) {
    const domAtPos = view.domAtPos.bind(view);
    const target = findDomRefAtPos($pos.pos, domAtPos) as HTMLElement;

    if (target && target.textContent === ZERO_WIDTH_SPACE_CHAR) {
      return false;
    }
  }

  const nextSelection = GapCursorSelection.findFrom($pos, isBackward(dir) ? -1 : 1, mustMove);

  if (!nextSelection) {
    return false;
  }

  if (
    !GapCursorSelection.isValidTargetNode(
      isForward(dir) ? nextSelection.$from.nodeBefore : nextSelection.$from.nodeAfter,
    )
  ) {
    // reverse cursor position
    if (dispatch) {
      dispatch(
        tr
          .setSelection(new GapCursorSelection(nextSelection.$from, isForward(dir) ? Side.LEFT : Side.RIGHT))
          .scrollIntoView(),
      );
    }
    return true;
  }

  if (dispatch) {
    dispatch(tr.setSelection(nextSelection).scrollIntoView());
  }
  return true;
};

export const deleteNode = (dir: Direction): CommandFunction => (state, dispatch) => {
  if (isGapCursorSelection(state.selection)) {
    const { $from, $anchor } = state.selection;
    let { tr } = state;
    if (isBackward(dir)) {
      if (state.selection.side === 'left') {
        tr.setSelection(new GapCursorSelection($anchor, Side.RIGHT));
        if (dispatch) {
          dispatch(tr);
        }
        return true;
      }
      tr = removeNodeBefore(state.tr);
    } else if ($from.nodeAfter) {
      tr = tr.delete($from.pos, $from.pos + $from.nodeAfter.nodeSize);
    }
    if (dispatch) {
      dispatch(
        tr
          .setSelection(Selection.near(tr.doc.resolve(tr.mapping.map(state.selection.$from.pos))))
          .scrollIntoView(),
      );
    }
    return true;
  }
  return false;
};

export const setGapCursorAtPos = (position: number, side: Side = Side.LEFT): CommandFunction => (
  state,
  dispatch,
) => {
  // @see ED-6231
  if (position > state.doc.content.size) {
    return false;
  }

  const $pos = state.doc.resolve(position);

  if (GapCursorSelection.valid($pos)) {
    if (dispatch) {
      dispatch(state.tr.setSelection(new GapCursorSelection($pos, side)));
    }
    return true;
  }

  return false;
};
