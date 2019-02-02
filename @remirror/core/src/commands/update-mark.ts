import { MarkType } from 'prosemirror-model';
import { Attrs, CommandFunction } from '../types';

export const updateMark = (type: MarkType, attrs: Attrs): CommandFunction => (state, dispatch) => {
  const { from, to } = state.selection;
  if (dispatch) {
    dispatch(state.tr.addMark(from, to, type.create(attrs)));
    return true;
  }
  return false;
};
