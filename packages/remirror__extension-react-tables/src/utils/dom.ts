import { h, HTMLAttributes } from 'jsx-dom-cjs';

// Re-export from jsx-dom so that we can easily switch the implement behind.
export type { HTMLAttributes };
export { h };

export function stopEvent(e: Pick<MouseEvent, 'preventDefault' | 'stopPropagation'>): void {
  e.preventDefault();
  e.stopPropagation();
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
