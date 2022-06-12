import { Coords } from '@remirror/core';
import { Positioner, selectionPositioner } from '@remirror/extension-positioner';

import type { EntityReferenceMetaData } from './types';

type MinimalEntityReference = Pick<EntityReferenceMetaData, 'from' | 'to'> & {
  text: string | undefined;
};

/**
 * You can pass `helpers.getEntityReferencesAt`, which implements the required
 * behavior.
 *
 * @returns the entityReferences at a specific position
 */
type GetEntityReferencesAt = (pos: number) => MinimalEntityReference[];

/**
 * Render a positioner which captures the selected entityReference.
 *
 * @remarks
 *
 * This extends the selection positioner. The difference is that the from and to
 * coordinates are picked from shortest entity reference selected.
 */
export function createCenteredEntityReferencePositioner(
  getEntityReferencesAt: GetEntityReferencesAt,
): Positioner<{ from: Coords; to: Coords }> {
  return selectionPositioner.clone({
    getActive: (props) => {
      const { state, view } = props;

      if (!state.selection.empty) {
        return [];
      }

      const entityReferences = getEntityReferencesAt(state.selection.from);

      if (entityReferences.length === 0) {
        return [];
      }

      // Using the shortest entityReference allows users to select the other
      // overlapping entityReference. If we were to use e.g. the longest entityReference,
      // there is the possibility that the shorter entityReferences aren't selectable
      // because they might be fully overlapped by the longer entityReference.
      const shortestEntityReference = entityReferences.sort(
        (entityReference1, entityReference2) =>
          (entityReference1.text ?? '').length - (entityReference2.text ?? '').length,
      )[0];

      if (!shortestEntityReference) {
        return [];
      }

      const from = view.coordsAtPos(shortestEntityReference.from);
      const to = view.coordsAtPos(shortestEntityReference.to);

      return [{ from, to }];
    },
  });
}
