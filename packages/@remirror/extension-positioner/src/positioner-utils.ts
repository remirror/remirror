import {
  EditorState,
  EditorStateParameter,
  hasTransactionChanged,
  TransactionParameter,
} from '@remirror/core';

export { isEmptyBlockNode } from '@remirror/core';

interface HasChangedParameter extends EditorStateParameter, Partial<TransactionParameter> {
  previousState: EditorState;
}

/**
 * Checks the transaction for changes or compares the state with the previous
 * state.
 *
 * Return `true` when a change is detected in the document or the selection.
 */
export function hasStateChanged(parameter: HasChangedParameter): boolean {
  const { tr, state, previousState } = parameter;

  if (tr) {
    return hasTransactionChanged(tr);
  }

  return !state.doc.eq(previousState.doc) || !state.selection.eq(previousState.selection);
}
