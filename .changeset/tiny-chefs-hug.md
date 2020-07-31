---
'@remirror/extension-positioner': major
'@remirror/preset-core': major
'@remirror/react': major
'remirror': major
---

Rewrite the positioner extension with a new API for creating positioners.

Positioners now return an array of `VirtualPositions` or an empty array if no positions extension.

`@remirror/react` - Add `useMultiPositioner`. `@remirror/react` - Add `virtualNode` property for compatibility with `popper-react`

An example of creating a new positioner with the new api is below.

```ts
import { Positioner, Coords, hasStateChanged } from '@remirror/extension-positioner';

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
```
