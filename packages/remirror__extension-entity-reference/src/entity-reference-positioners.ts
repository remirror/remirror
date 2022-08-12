import type { Coords } from '@remirror/core';
import type { Positioner } from '@remirror/extension-positioner';
import { selectionPositioner } from '@remirror/extension-positioner';

import type { EntityReferenceMetaData } from './types';

type MinimalEntityReference = Pick<EntityReferenceMetaData, 'from' | 'to'> & {
  text: string | undefined;
};

/**
 * Render a positioner which captures the selected entityReference.
 *
 * @remarks
 *
 * This extends the selection positioner. The difference is that the from and to
 * coordinates are picked from the shortest entity reference selected.
 */
export const centeredEntityReferencePositioner: Positioner<{ from: Coords; to: Coords }> =
  selectionPositioner.clone({
    getActive: (props) => {
      const { state, view, helpers } = props;

      if (!state.selection.empty) {
        return [];
      }

      const entityReferences: MinimalEntityReference[] = helpers.getEntityReferencesAt(
        state.selection.from,
      );

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

      const from: Coords = view.coordsAtPos(shortestEntityReference.from);
      const to: Coords = view.coordsAtPos(shortestEntityReference.to);

      return [{ from, to }];
    },
  });
