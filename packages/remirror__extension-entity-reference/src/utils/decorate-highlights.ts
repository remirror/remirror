/**
 * Helper function to add decorations for each highlight and also handles
 */
import { uniqueId } from 'remirror';
import { Decoration } from '@remirror/pm/view';

import { HighlightAttrs } from '../types';
import { findMinMaxRange } from './ranges';

export const decorateHighlights = (highlights: HighlightAttrs[][]): Decoration[] => {
  if (highlights.length === 0) {
    return [];
  }

  const decorations = highlights.map((overlappingHighlights) => {
    // Consider up to 5 overlapping highlights
    const backgroundShade = Math.min(overlappingHighlights.length, 5) / 5;
    const notBlue = 200 * (1 - backgroundShade) + 55;
    // We must set padding to have the decoration claim the same height as the mark
    const style = `background: rgb(${notBlue}, ${notBlue}, 255);padding: 6px 0;`;
    // ProseMirror would remove all tags with matching specs
    // (not considering the current selection). So, we need a key to uniquely
    // identify decorations.
    const [from, to] = findMinMaxRange(overlappingHighlights);
    const tags: string[] = [];

    for (const highlight of overlappingHighlights) {
      tags.push(...highlight.tags);
    }

    const specs = { tags: tags, id: uniqueId() };
    // Add decoration to all inline nodes in the given range.
    return Decoration.inline(from, to, { style }, specs);
  });

  return [...decorations];
};
