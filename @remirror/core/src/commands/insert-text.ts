import { CommandFunction } from '../types';

/**
 * Inserts text into the DOM
 */
export const insertText = (text: string): CommandFunction => (state, dispatch) => {
  const { anchor } = state.selection;

  if (dispatch) {
    dispatch(state.tr.insertText(text, anchor));
  }

  return true;
};
