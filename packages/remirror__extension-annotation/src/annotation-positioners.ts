import { Coords } from '@remirror/core';
import { Positioner, selectionPositioner } from '@remirror/extension-positioner';

import type { Annotation } from './annotation-types';

type MinimalAnnotation = Pick<Annotation, 'from' | 'to'> & {
  text: string | undefined;
};

/**
 * You can pass `helpers.getAnnotationsAt`, which implements the required
 * behavior.
 *
 * @returns the annotations at a specific position
 */
type GetAnnotationsAt = (pos: number) => MinimalAnnotation[];

/**
 * Render a positioner which captures the selected annotation.
 *
 * @remarks
 *
 * This extends the selection positioner. The difference is that the from and to
 * coordinates are picked from shortest annotation selected.
 */
export function createCenteredAnnotationPositioner(
  getAnnotationsAt: GetAnnotationsAt,
): Positioner<{ from: Coords; to: Coords }> {
  return selectionPositioner.clone({
    getActive: (props) => {
      const { state, view } = props;

      if (!state.selection.empty) {
        return [];
      }

      const annotations = getAnnotationsAt(state.selection.from);

      if (annotations.length === 0) {
        return [];
      }

      // Using the shortest annotation allows users to select the other
      // overlapping annotation. If we were to use e.g. the longest annotation,
      // there is the possibility that the shorter annotations aren't selectable
      // because they might be fully overlapped by the longer annotation.
      const shortestAnnotation = annotations.sort(
        (annotation1, annotation2) =>
          (annotation1.text ?? '').length - (annotation2.text ?? '').length,
      )[0];

      if (!shortestAnnotation) {
        return [];
      }

      const from = view.coordsAtPos(shortestAnnotation.from);
      const to = view.coordsAtPos(shortestAnnotation.to);

      return [{ from, to }];
    },
  });
}
