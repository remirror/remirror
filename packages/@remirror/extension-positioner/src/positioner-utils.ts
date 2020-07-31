import {
  bool,
  EditorState,
  EditorStateParameter,
  hasTransactionChanged,
  ProsemirrorNode,
  TransactionParameter,
} from '@remirror/core';

/**
 * Checks if the current node is a block node and empty.
 *
 * @param node - the prosemirror node
 *
 * @public
 */
export function isEmptyBlockNode(node: ProsemirrorNode | null | undefined) {
  return bool(node) && node.type.isBlock && !node.textContent && !node.childCount;
}

interface HasChangedParameter extends EditorStateParameter, Partial<TransactionParameter> {
  previousState: EditorState;
}

/**
 * Checks the transaction for changes or compares the state with the previous
 * state.
 *
 * Return `true` when a change is detected in the document or the selection.
 */
export function hasStateChanged(parameter: HasChangedParameter) {
  const { tr, state, previousState } = parameter;

  if (tr) {
    return hasTransactionChanged(tr);
  }

  return !state.doc.eq(previousState.doc) || !state.selection.eq(previousState.selection);
}
