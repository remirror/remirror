import { EditorView } from '@remirror/core';

/**
 * Extract the position from a provided event.
 */
export function getPositionFromEvent(
  view: EditorView,
  event: MouseEvent,
): PositionFromCoords | undefined {
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
