import { NodeType } from 'prosemirror-model';
import { liftListItem, wrapInList } from 'prosemirror-schema-list';
import { nodeActive } from '../document-helpers';
import { CommandFunction } from '../types';

export const toggleList = (type: NodeType, itemType: NodeType): CommandFunction => (
  state,
  dispatch,
) => {
  const isActive = nodeActive(state, type);

  if (isActive) {
    return liftListItem(itemType)(state, dispatch);
  }

  return wrapInList(type)(state, dispatch);
};
