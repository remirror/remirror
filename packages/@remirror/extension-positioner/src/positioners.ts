import { isSelectionEmpty, Shape } from '@remirror/core';

import { Coords, Positioner, VirtualPosition } from './positioner';
import { hasStateChanged, isEmptyBlockNode } from './positioner-utils';

export const emptyCoords: Coords = {
  top: -999_999,
  left: -999_999,
  right: 999_999,
  bottom: 999_999,
};

const emptyRect = {
  ...emptyCoords,
  height: 0,
  width: 0,
  x: -999_999,
  y: -999_999,
};

export const emptyVirtualPosition: VirtualPosition = {
  rect: { ...emptyRect, toJSON: (): Shape => emptyRect },
};

/**
 * Render a floating selection positioner when the current selected node is empty.
 *
 * - `rect` provides a viewport position which spans the width of the editor
 *   with a height identical to the cursor height.
 * - `top` - the top of the cursor.
 * - `bottom` - the bottom of the cursor.
 * - `left` - the left side of the editor.
 * - `right` - the right side of the editor.
 */
export const floatingSelectionPositioner = Positioner.create<Coords>({
  hasChanged: hasStateChanged,

  /**
   * This is only active for empty top level nodes. The data is the cursor start
   * and end position.
   */
  getActive(parameter) {
    const { state, view } = parameter;

    if (
      isSelectionEmpty(state) &&
      state.selection.$anchor.depth === 1 &&
      isEmptyBlockNode(state.selection.$anchor.parent)
    ) {
      return [view.coordsAtPos(state.selection.$anchor.pos)];
    }

    return [];
  },

  getPosition(parameter) {
    const { view, element, data: coords } = parameter;
    const parent = element.offsetParent;

    if (!parent) {
      return emptyVirtualPosition;
    }

    const parentRect = parent.getBoundingClientRect();
    const editorRect = view.dom.getBoundingClientRect();

    const top = coords.top - parentRect.top;
    const bottom = coords.bottom - parentRect.top;

    // Since this is only active when the selection and node are empty, the left
    // position can be the cursor position.
    const left = coords.left - parentRect.left;

    // When used the right value will push the positioner to the extreme right
    // edge of the editor.
    const right = editorRect.right - parentRect.left;
    const rect = new DOMRect(coords.left, coords.top, right - left, coords.top - coords.bottom);

    return { top, bottom, left, right, rect };
  },
});

/**
 * Render a positioner which is centered around the selection. This is only
 * active for text selections, where the selection spans more than one
 * character.
 *
 * @remarks
 *
 * The menu will horizontally center itself `from` / `to` bounds of the current
 * selection.
 *
 * - `right` is undefined
 * - `left` will center your element based on the width of the current selection
 *   .
 * - `bottom` absolutely positions the element below the text selection.
 * - `top` absolutely positions the element above the text selection
 */
export const centeredSelectionPositioner = Positioner.create<{ start: Coords; end: Coords }>({
  hasChanged: hasStateChanged,
  getActive: (parameter) => {
    const { state, view } = parameter;

    if (state.selection.empty) {
      return [];
    }

    const { from, to } = state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    return [{ start, end }];
  },

  getPosition(parameter) {
    const { element, data } = parameter;
    const { start, end } = data;
    const parent = element.offsetParent;

    if (!parent) {
      return emptyVirtualPosition;
    }

    // The box in which the bubble menu is positioned, to use as an anchor
    const parentBox = parent.getBoundingClientRect();

    // The bubble menu element
    const elementBox = element.getBoundingClientRect();

    const calculatedLeft = (start.left + end.left) / 2 - parentBox.left;
    const left = Math.min(
      parentBox.width - elementBox.width / 2,
      Math.max(calculatedLeft, elementBox.width / 2),
    );
    const top = Math.trunc(start.top - parentBox.top);
    const bottom = Math.trunc(start.bottom - parentBox.top);
    const rect = new DOMRect(start.left, start.top, end.right - start.left, end.bottom - start.top);

    return { rect, left, top, bottom, right: left };
  },
});

/**
 * Render a menu that is inline with the first character of the selection. This
 * is useful for suggestions since they should typically appear while typing
 * without a multi character selection.
 *
 * @remarks
 *
 * The menu will center itself within the selection.
 *
 * - `right` should be used to absolutely position away from the right hand edge
 *   of the screen.
 * - `left` should be used to absolutely position away from the left hand edge
 *   of the screen.
 * - `bottom` absolutely positions the element above the text selection.
 * - `top` absolutely positions the element below the text selection
 */
export const cursorPopupPositioner = Positioner.create<Coords>({
  hasChanged: hasStateChanged,

  /**
   * Only active when the selection is empty (one character)
   */
  getActive: (parameter) => {
    const { state, view } = parameter;

    if (!state.selection.empty) {
      return [];
    }

    return [view.coordsAtPos(state.selection.from)];
  },
  getPosition(parameter) {
    const { element, data: cursor } = parameter;
    const parent = element.offsetParent;

    if (!parent) {
      return emptyVirtualPosition;
    }

    // The box in which the bubble menu is positioned, to use as an anchor
    const parentBox = parent.getBoundingClientRect();

    // The popup menu element
    const elementBox = element.getBoundingClientRect();

    const calculatedLeft = cursor.left - parentBox.left;
    const calculatedRight = parentBox.right - cursor.right;

    const bottom = Math.trunc(cursor.bottom - parentBox.top);
    const top = Math.trunc(cursor.top - parentBox.top);
    const rect = new DOMRect(cursor.left, cursor.top, 0, cursor.bottom - cursor.top);
    const left =
      calculatedLeft + elementBox.width > parentBox.width
        ? calculatedLeft - elementBox.width
        : calculatedLeft;
    const right =
      calculatedRight + elementBox.width > parentBox.width
        ? calculatedRight - elementBox.width
        : calculatedRight;

    return { rect, right, left, bottom, top };
  },
});
