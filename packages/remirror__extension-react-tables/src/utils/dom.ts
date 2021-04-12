import { h, HTMLAttributes } from 'jsx-dom';

// Re-export from jsx-dom so that we can easily switch the implement behind.
export type { HTMLAttributes };
export { h };

export function stopEvent(e: Pick<MouseEvent, 'preventDefault' | 'stopPropagation'>): void {
  e.preventDefault();
  e.stopPropagation();
}

/**
 * Merge two DOMRect objects into a one big DOMRect object that contains both two DOMRect objects.
 */
export function mergeDOMRects(rect1: DOMRect, rect2: DOMRect): DOMRect {
  const left = Math.min(rect1.left, rect2.left);
  const right = Math.min(rect1.right, rect2.right);
  const top = Math.min(rect1.top, rect2.top);
  const bottom = Math.max(rect1.bottom, rect2.bottom);
  const width = right - left;
  const height = bottom - top;
  return new DOMRect(left, top, width, height);
}

interface Coord {
  x: number;
  y: number;
}

export function getRelativeCoord(absoluteCoord: Coord, parent: Element): Coord {
  const parentRect = parent.getBoundingClientRect();
  return {
    x: absoluteCoord.x + parent.scrollLeft - parentRect.left,
    y: absoluteCoord.y + parent.scrollTop - parentRect.top,
  };
}

export function getAbsoluteCoord(relativeCoord: Coord, parent: Element): Coord {
  const parentRect = parent.getBoundingClientRect();
  return {
    x: relativeCoord.x - parent.scrollLeft + parentRect.left,
    y: relativeCoord.y - parent.scrollTop + parentRect.top,
  };
}
