import { MarkType } from 'prosemirror-model';
import { CommandFunction } from '../types';

export const removeMark = (type: MarkType): CommandFunction => (state, dispatch) => {
  const { from, to } = state.selection;
  if (!dispatch) {
    return false;
  }

  dispatch(state.tr.removeMark(from, to, type));
  return true;
};
