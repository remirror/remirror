import { lift, wrapIn } from 'prosemirror-commands';
import { NodeType } from 'prosemirror-model';
import { nodeActive } from '../document-helpers';
import { Attrs, CommandFunction } from '../types';

export const toggleWrap = (type: NodeType, attrs?: Attrs): CommandFunction => (state, dispatch) => {
  const isActive = nodeActive(state, type);

  if (isActive) {
    return lift(state, dispatch);
  }
  return wrapIn(type, attrs)(state, dispatch);
};
