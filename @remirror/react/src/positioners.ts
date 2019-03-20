import { absoluteCoordinates, isEmptyParagraphNode, selectionEmpty } from '@remirror/core';
import { Positioner } from './types';

export const defaultPositioner: Positioner = {
  initialPosition: { top: -9999, left: -9999, right: -9999, bottom: -9999 },
  hasChanged({ prevState, newState }) {
    return !(prevState && prevState.doc.eq(newState.doc) && prevState.selection.eq(newState.selection));
  },

  isActive({ view }) {
    return !selectionEmpty(view.state);
  },

  getPosition({ element, view }) {
    return absoluteCoordinates({
      view,
      element,
      coords: view.coordsAtPos(view.state.selection.$anchor.pos),
    });
  },
};

/**
 * Render a menu which floats to the right at the beginning of an empty paragaph
 */
export const floatingPositioner: Positioner = {
  ...defaultPositioner,

  isActive({ view }) {
    return selectionEmpty(view.state) && isEmptyParagraphNode(view.state.selection.$anchor.parent);
  },

  getPosition({ view, element }) {
    const editorRect = element.offsetParent!.getBoundingClientRect();
    const cursorRect = view.coordsAtPos(view.state.selection.$anchor.pos);
    const top = cursorRect.top - editorRect.top;
    return { ...floatingPositioner.initialPosition, top };
  },
};

/**
 * Render a bubble menu which becomes active whenever a selection is made.
 *
 * The relevant positions are `bottom` and `left` which can be used to absolutely positioned your PositionerComponent
 * `top` and `right` aren't used and always equal `0`
 */
export const bubblePositioner: Positioner = {
  ...defaultPositioner,

  getPosition({ view, element }) {
    const { from, to } = view.state.selection;

    // These are in screen coordinates
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // The box in which the tooltip is positioned, to use as base
    const box = element.offsetParent!.getBoundingClientRect();

    // Find a center-ish x position from the selection endpoints (when
    // crossing lines, end may be more to the left)
    const left = Math.max((start.left + end.left) / 2, start.left + 3);

    return {
      ...bubblePositioner.initialPosition,
      left: Math.trunc(left - box.left),
      bottom: Math.trunc(box.bottom - start.top),
    };
  },
};
