import { CommandFunction } from '../../types';

export const insertText = (text: string): CommandFunction => (state, dispatch) => {
  const { $from } = state.selection;
  const { pos } = $from;
  if (dispatch) {
    dispatch(state.tr.insertText(text, pos));
  }

  return true;
};
