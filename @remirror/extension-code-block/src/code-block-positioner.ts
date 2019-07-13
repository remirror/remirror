import { EditorState, isNodeActive } from '@remirror/core';
import { defaultPositioner, Positioner } from '@remirror/react-utils';

const getCodeBlockType = (state: EditorState) => state.schema.nodes.codeBlock;

export const activeCodeBlockPositioner: Positioner = {
  ...defaultPositioner,
  isActive({ newState: state }) {
    const type = getCodeBlockType(state);
    return isNodeActive({ state, type });
  },
  // getPosition() {
  //   return {};
  // },
};
