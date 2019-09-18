import {
  absoluteCoordinates,
  EditorStateParams,
  findElementAtPosition,
  isEmptyParagraphNode,
  isNodeActive,
  isString,
  NodeType,
  selectionEmpty,
} from '@remirror/core';
import { Positioner } from './react-types';

export const defaultPositioner: Positioner = {
  initialPosition: { top: -9999, left: -9999, right: 99999, bottom: 99999 },
  hasChanged({ oldState, newState }) {
    return !(oldState && oldState.doc.eq(newState.doc) && oldState.selection.eq(newState.selection));
  },

  isActive({ newState }) {
    const isActive = !selectionEmpty(newState);
    return isActive;
  },

  getPosition({ element, view, newState }) {
    return absoluteCoordinates({
      view,
      element,
      coords: view.coordsAtPos(newState.selection.$anchor.pos),
    });
  },
};

/**
 * Render a menu which floats to the right at the beginning of an empty paragraph
 */
export const floatingPositioner: Positioner = {
  ...defaultPositioner,

  isActive({ newState }) {
    return selectionEmpty(newState) && isEmptyParagraphNode(newState.selection.$anchor.parent);
  },

  getPosition({ view, element, newState }) {
    const editorRect = element.offsetParent!.getBoundingClientRect();
    const cursorRect = view.coordsAtPos(newState.selection.$anchor.pos);
    const top = cursorRect.top - editorRect.top;
    return { ...floatingPositioner.initialPosition, top };
  },
};

/**
 * Render a bubble menu which becomes active whenever a selection is made.
 *
 * - `right` should be used to absolutely position away from the right
 * hand edge of the screen
 * - `left` should be used to determine absolute horizontal positioning.
 * - `bottom` absolutely positions the element above the text selection.
 * - `top` absolutely positions the element below the text selection
 *
 * The right position is unused.
 */
export const bubblePositioner: Positioner = {
  ...defaultPositioner,

  getPosition({ view, element, newState }) {
    const { from, to } = newState.selection;
    const parent = element.offsetParent;

    if (!parent) {
      return bubblePositioner.initialPosition;
    }

    // These are in screen coordinates
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // The box in which the bubble menu is positioned, to use as an anchor
    const parentBox = parent.getBoundingClientRect();

    // The bubble menu element
    const elementBox = element.getBoundingClientRect();

    const calculatedLeft = (start.left + end.left) / 2 - parentBox.left;
    const left = Math.min(
      parentBox.width - elementBox.width / 2,
      Math.max(calculatedLeft, elementBox.width / 2),
    );

    return {
      right: left,
      left,
      bottom: Math.trunc(parentBox.bottom - start.top),
      top: Math.trunc(start.bottom - parentBox.top),
    };
  },
};

interface GetNodeTypeParams extends EditorStateParams {
  type: NodeType | string;
}

const getNodeType = ({ state, type }: GetNodeTypeParams) =>
  isString(type) ? state.schema.nodes[type] : type;

/**
 * Creates a positioner for the provided node.
 *
 * TODO this currently is just a placeholder and doesn't actually work.
 */
export const createNodeTypePositioner = (nodeType: string | NodeType): Positioner => {
  return {
    ...defaultPositioner,
    isActive({ newState: state }) {
      const type = getNodeType({ state, type: nodeType });
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
};
