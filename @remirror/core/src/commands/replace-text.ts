import { NodeType } from 'prosemirror-model';
import { CommandFunction, FromTo } from '../types';

export const replaceText = (range: FromTo | null, type: NodeType, attrs = {}): CommandFunction => (
  state,
  dispatch,
) => {
  console.log('inside replace text', range);
  const { $from, $to } = state.selection;
  const index = $from.index();
  const from = range ? range.from : $from.pos;
  const to = range ? range.to : $to.pos;

  if (!$from.parent.canReplaceWith(index, index, type)) {
    console.log('cant replace text', from, to, index);
    return false;
  }

  if (dispatch) {
    console.log('dispatching replace text', from, to, index);
    dispatch(state.tr.replaceWith(from, to, type.create(attrs)));
    console.log('successfully dispatched replace text');
  }

  return true;
};
