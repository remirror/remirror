import { EditorView } from '../types';
import { Cast } from './base';
import { isElementNode, isTextNode } from './document';

export const textRange = (node: Node, from?: number, to?: number) => {
  const range = document.createRange();
  range.setEnd(node, to == null ? (node.nodeValue || '').length : to);
  range.setStart(node, from || 0);
  return range;
};

function singleRect(object: Range | Element, bias?: number) {
  const rects = object.getClientRects();
  return !rects.length ? object.getBoundingClientRect() : rects[!bias || bias < 0 ? 0 : rects.length - 1];
}

/**
 * EditorView.cordsAtPos returns wrong coordinates when at a linebreak.
 * @see https://github.com/scrumpy/tiptap/pull/228
 */
export const coordsAtPos = (view: EditorView, pos: number, end = false) => {
  const { node, offset } = view.docView.domFromPos(pos);
  let side: 'left' | 'right' = 'left';
  let rect: ClientRect | undefined;
  if (isTextNode(node) && node.nodeValue) {
    if (end && offset < node.nodeValue.length) {
      rect = singleRect(textRange(node, offset - 1, offset), -1);
      side = 'right';
    } else if (offset < node.nodeValue.length) {
      rect = singleRect(textRange(node, offset, offset + 1), -1);
      side = 'left';
    }
  } else if (node.firstChild) {
    if (offset < node.childNodes.length) {
      const child = node.childNodes[offset];
      rect = isTextNode(child)
        ? singleRect(textRange(child), -1)
        : isElementNode(child)
        ? singleRect(child, -1)
        : rect;
      side = 'left';
    }
    if ((!rect || rect.top === rect.bottom) && offset) {
      const child = node.childNodes[offset - 1];
      rect = isTextNode(child)
        ? singleRect(textRange(child), 1)
        : isElementNode(child)
        ? singleRect(child, 1)
        : rect;
      side = 'right';
    }
  } else {
    rect = Cast<Element>(node).getBoundingClientRect();
    side = 'left';
  }

  return rect
    ? {
        top: rect.top,
        bottom: rect.bottom,
        left: rect[side],
        right: rect[side],
      }
    : // Fallback to view.coordsAtPos when no clientRect
      view.coordsAtPos(pos);
};
