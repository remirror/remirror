import {
  Coords,
  emptyVirtualPosition,
  hasStateChanged,
  Positioner,
} from '@remirror/extension-positioner';

import type { Annotation } from './types';

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
 * Render a positioner which is centered around a selected annotation.
 *
 * @remarks
 *
 * The menu will horizontally center itself `from` / `to` bounds of the current
 * selected annotation.
 *
 * - `right` is undefined
 * - `left` will center your element based on the width of the current selected
 *   annotation
 *   .
 * - `bottom` absolutely positions the element below the selected annotation.
 * - `top` absolutely positions the element above the selected annotation
 */
export function createCenteredAnnotationPositioner(
  getAnnotationsAt: GetAnnotationsAt,
): Positioner<{ start: Coords; end: Coords }> {
  return Positioner.create<{
    start: Coords;
    end: Coords;
  }>({
    hasChanged: hasStateChanged,
    getActive: (parameter) => {
      const { state, view } = parameter;

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

      const start = view.coordsAtPos(shortestAnnotation.from);
      const end = view.coordsAtPos(shortestAnnotation.to);

      return [{ start, end }];
    },

    getPosition(parameter) {
      const { element, data } = parameter;
      const { start, end } = data;
      const parent = element.offsetParent;

      if (!parent) {
        return emptyVirtualPosition;
      }

      // The box in which the bubble menu is positioned, to use as an anchor
      const parentBox = parent.getBoundingClientRect();

      // The bubble menu element
      const elementBox = element.getBoundingClientRect();

      const calculatedLeft = (start.left + end.left) / 2 - parentBox.left;
      const left = Math.min(
        parentBox.width - elementBox.width / 2,
        Math.max(calculatedLeft, elementBox.width / 2),
      );
      const top = Math.trunc(start.top - parentBox.top);
      const bottom = Math.trunc(end.bottom - parentBox.top);
      const rect = new DOMRect(
        start.left,
        start.top,
        end.right - start.left,
        end.bottom - start.top,
      );

      return { rect, left, top, bottom, right: left };
    },
  });
}
