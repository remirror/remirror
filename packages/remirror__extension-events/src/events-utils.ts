import { EditorView } from '@remirror/core';

/**
 * A port of `view.posAtDOM` without throwing error when the dom node is not
 * inside the editor.
 */
function posAtDOM(view: EditorView, node: Node, offset: number, bias?: number): number | null {
  return (view as any).docView.posFromDOM(node, offset, bias);
}

/**
 * Extract the position from a provided event.
 */
export function getPositionFromEvent(
  view: EditorView,
  event: MouseEvent,
): PositionFromCoords | undefined {
  const target = event.target;

  if (target) {
    const pos = posAtDOM(view, target as Node, 0);

    if (pos !== null) {
      const $pos = view.state.doc.resolve(pos);
      const border = $pos.node().isLeaf ? 0 : 1;
      // https://github.com/ProseMirror/prosemirror-view/blob/9af8ceac1ee60a30ced3611913db7f187bbb51ed/src/domcoords.js#L283
      const inside = $pos.start() - border;
      return { pos, inside };
    }
  }

  // If the coordinates are just at the boundary of two elements, `view.posAtCoords`
  // can't distinguish which one should be returned. This is not a big deal for
  // `click` event but it's a huge problem for `mouseover` and `mouseout` events.
  // That's why we try to use `posAtDOM` firstly and only use `posAtCoords` if
  // `posAtDOM` doesn't work.
  return view.posAtCoords({ left: event.clientX, top: event.clientY }) ?? undefined;
}

/**
 * The position created by `view.posAtCoords`
 */
export interface PositionFromCoords {
  /**
   * The position nearest to the viewport coordinates that were provided.
   */
  pos: number;

  /**
   * Holds the position of the inner node that the position falls inside of, or
   * -1 if it is at the top level, not in any node.
   */
  inside: number;
}
