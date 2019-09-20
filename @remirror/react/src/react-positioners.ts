import { absoluteCoordinates, isEmptyParagraphNode, selectionEmpty } from '@remirror/core';
import { Positioner } from './react-types';

export const defaultPositioner: Positioner = {
  initialPosition: { top: -99999, left: -99999, right: 99999, bottom: 99999 },
  hasChanged({ oldState, newState }) {
    return !(oldState && oldState.doc.eq(newState.doc) && oldState.selection.eq(newState.selection));
  },

  isActive: ({ newState }) => !selectionEmpty(newState),

  getPosition({ element, view, newState }) {
    return absoluteCoordinates({
      view,
      element,
      position: view.coordsAtPos(newState.selection.$anchor.pos),
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
 * Render a centered bubble menu which becomes active whenever a selection is
 * made.
 *
 * @remarks
 *
 * The menu will horizontally center itself `from` / `to` bounds of the current
 * selection.
 *
 * - `right` should be used to absolutely position away from the right hand edge
 *   of the screen
 * - `left` should be used to determine absolute horizontal positioning.
 * - `bottom` absolutely positions the element above the text selection.
 * - `top` absolutely positions the element below the text selection
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

/**
 * Render a menu that is inline with the first character of the selection.
 *
 * @remarks
 *
 * The menu will center itself within the selection.
 *
 * - `right` should be used to absolutely position away from the right
 * hand edge of the screen.
 * - `left` should be used to absolutely position away from the left
 * hand edge of the screen.
 * - `bottom` absolutely positions the element above the text selection.
 * - `top` absolutely positions the element below the text selection
 */
export const popupMenuPositioner: Positioner = {
  ...defaultPositioner,

  /**
   * Only active when the selection is empty (one character)
   */
  isActive: ({ newState }) => selectionEmpty(newState),
  getPosition({ view, element, newState }) {
    const parent = element.offsetParent;

    if (!parent) {
      return bubblePositioner.initialPosition;
    }

    // Position at the start of the selection
    const start = view.coordsAtPos(newState.selection.from);

    // The box in which the bubble menu is positioned, to use as an anchor
    const parentBox = parent.getBoundingClientRect();

    // The popup menu element
    const elementBox = element.getBoundingClientRect();

    const calculatedLeft = start.left - parentBox.left;
    const calculatedRight = parentBox.right - start.right;
    const left =
      calculatedLeft + elementBox.width > parentBox.width
        ? calculatedLeft - elementBox.width
        : calculatedLeft;
    const right =
      calculatedRight + elementBox.width > parentBox.width
        ? calculatedRight - elementBox.width
        : calculatedRight;

    return {
      right,
      left,
      bottom: Math.trunc(parentBox.bottom - start.top),
      top: Math.trunc(start.bottom - parentBox.top),
    };
  },
};
