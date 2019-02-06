import { setBlockType } from 'prosemirror-commands';
import { NodeType } from 'prosemirror-model';
import { nodeActive } from '../document-helpers';
import { CommandFunction } from '../types';

export const toggleBlockItem = (type: NodeType, toggleType: NodeType, attrs = {}): CommandFunction => (
  state,
  dispatch,
) => {
  const isActive = nodeActive(state, type, attrs);

  if (isActive) {
    return setBlockType(toggleType)(state, dispatch);
  }

  return setBlockType(type, attrs)(state, dispatch);
};
