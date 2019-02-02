import { NodeType } from 'prosemirror-model';
import { Attrs, CommandFunction } from '../types';

export const setInlineBlockType = (type: NodeType, attrs: Attrs = {}): CommandFunction => (
  state,
  dispatch,
) => {
  const { $from } = state.selection;
  const index = $from.index();

  if (!$from.parent.canReplaceWith(index, index, type)) {
    return false;
  }

  if (dispatch) {
    dispatch(state.tr.replaceSelectionWith(type.create(attrs)));
  }

  return true;
};
