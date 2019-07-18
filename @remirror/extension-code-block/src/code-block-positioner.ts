import { absoluteCoordinates, EditorState, findElementAtPosition, isNodeActive } from '@remirror/core';
import { defaultPositioner, Positioner } from '@remirror/react-utils';

const getCodeBlockType = (state: EditorState) => state.schema.nodes.codeBlock;

export const activeCodeBlockPositioner: Positioner = {
  ...defaultPositioner,
  isActive({ newState: state }) {
    const type = getCodeBlockType(state);
    return isNodeActive({ state, type });
  },
  getPosition({ newState, view }) {
    findElementAtPosition(newState.selection.from, view);
    return absoluteCoordinates({
      view,
      element: findElementAtPosition(newState.selection.from, view),
      coords: view.coordsAtPos(newState.selection.$anchor.pos),
    });
  },
};
