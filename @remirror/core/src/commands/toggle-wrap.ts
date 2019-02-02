import { lift, wrapIn } from 'prosemirror-commands';
import { NodeType } from 'prosemirror-model';
import { nodeActive } from '../document-helpers';
import { CommandFunction } from '../types';

export const toggleWrap = (type: NodeType): CommandFunction => (state, dispatch) => {
  const isActive = nodeActive(state, type);

  if (isActive) {
    return lift(state, dispatch);
  }

  return wrapIn(type)(state, dispatch);
};
