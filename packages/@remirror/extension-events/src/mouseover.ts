/**
 * @module
 *
 * This module provides a mouseover class which is used to manage hover events
 * for different nodes and marks within the editor.
 */

import type { EditorView, ProsemirrorNode } from '@remirror/core';

export class Mouseover {
  /**
   * The view instance.
   */
  readonly #view: EditorView;

  /**
   * The event to inspect.
   */
  readonly #event: MouseEvent;

  /**
   * The node that is being hovered.
   */
  readonly #targetNode: ProsemirrorNode | undefined;

  /**
   * The dom for the targetNode
   */
  readonly #targetDom: HTMLElement | undefined;

  /**
   * The start position of the target node.
   */
  readonly targetPos: number;

  /**
   * The position created from the coordinates of the mouse event.
   */
  readonly pos: PositionFromCoords;

  constructor(view: EditorView, event: MouseEvent, pos: PositionFromCoords) {
    this.#view = view;
    this.#event = event;
    this.pos = pos;

    if (pos.inside > -1) {
      this.#targetNode = view.state.doc.nodeAt(pos.inside) ?? undefined;
      this.#targetDom = this.#targetNode ? view.nodeDOM
      this.targetPos = pos.inside;
    }
  }

  private addMouseLeaveHandler() {}
}

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
interface PositionFromCoords {
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
