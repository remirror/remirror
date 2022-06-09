import { Decoration } from '@remirror/pm/view';

import { EntityReferenceMetaData } from '../types';
import { findMinMaxRange } from './ranges';

/**
 * Helper function to add decorations for each entity reference and also handles
 */
export const decorateEntityReferences = (
  entityReferences: EntityReferenceMetaData[][],
): Decoration[] => {
  if (entityReferences.length === 0) {
    return [];
  }

  const decorations = entityReferences.map((overlappingEntityReferences) => {
    // Consider up to 5 overlapping entity references
    const backgroundShade = Math.min(overlappingEntityReferences.length, 5) / 5;
    const notBlue = 200 * (1 - backgroundShade) + 55;
    // We must set padding to have the decoration claim the same height as the mark
    const style = `background: rgb(${notBlue}, ${notBlue}, 255);padding: 6px 0;`;
    // ProseMirror would remove all entity references with matching specs
    // (not considering the current selection). So, we need a key to uniquely
    // identify decorations.
    const [from, to] = findMinMaxRange(overlappingEntityReferences);

    const specs = {
      inclusiveStart: true,
      inclusiveEnd: true,
    };
    // Add decoration to all inline nodes in the given range.
    return Decoration.inline(from, to, { style }, specs);
  });

  return [...decorations];
};
