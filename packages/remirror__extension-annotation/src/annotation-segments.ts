import { FromToProps, sort } from '@remirror/core';

import type { Annotation, OmitText } from './annotation-types';

/**
 * Reflects one non-overlapping segment
 */
export interface Segment<Type extends Annotation> extends FromToProps {
  annotations: Array<OmitText<Type>>;
}

interface Item<Type extends Annotation> {
  type: 'start' | 'end';
  annotation: OmitText<Type>;
}

/**
 * Creates non-overlapping segments based on overlapping annotations.
 *
 * Prosemirror combines overlapping inline decorations by creating segments in
 * which the props of each overlapping decoration are merged.
 *
 * The Prosemirror approach doesn't allow to calculate styles based on multiple
 * annotations, e.g. a darker background shade if there are multiple
 * annotations.
 *
 * To overcome this limitations, this method calculates non-overlapping segments
 * with overlapping annotations. These segments can be used to create
 * ProseMirror decorations with a style that reflects all all annotations within
 * the segment.
 *
 * Approach was confirmed by Marijn:
 * https://discuss.prosemirror.net/t/how-to-style-overlapping-inline-decorations/3162
 */
export function toSegments<A extends Annotation>(
  annotations: Array<OmitText<A>>,
): Array<Segment<A>> {
  type AnnotationItem = Item<A>;
  type AnnotationSegment = Segment<A>;

  // Keep track of the segments which will be returned by this function.
  const segments: AnnotationSegment[] = [];

  // This holds the index of the `start` and `end` annotations for each
  // position.
  const positionMap: Map<number, AnnotationItem[]> = new Map();

  // Build up the index items with the provided annotations.
  for (const annotation of annotations) {
    // Get the already added annotations for the positions provided.
    const currentFrom = positionMap.get(annotation.from) ?? [];
    const currentTo = positionMap.get(annotation.to) ?? [];

    positionMap.set(annotation.from, [...currentFrom, { type: 'start', annotation }]);
    positionMap.set(annotation.to, [...currentTo, { type: 'end', annotation }]);
  }

  // Sort from the smallest position to the largest position (a-z);
  const sortedPositions = sort([...positionMap.entries()], ([a], [z]) => a - z);

  // Tracks the annotations active in the currently analyzed segment
  let activeAnnotations: Array<OmitText<A>> = [];

  // Tracks the last from state
  let from = 0;

  // Loop through the available items.
  for (const [to, items] of sortedPositions) {
    const startAnnotations = items
      .filter((item) => item.type === 'start')
      .map((item) => item.annotation);
    const endIds = new Set(
      items.filter((item) => item.type === 'end').map((item) => item.annotation.id),
    );

    if (activeAnnotations.length > 0) {
      segments.push({ from, to, annotations: activeAnnotations });
    }

    // Update the from position to point to the current `to` for the next
    // iteration.
    from = to;

    // Update the active annotations with the latest start annotations and
    // remove any annotations that have reached the end.
    activeAnnotations = [...activeAnnotations, ...startAnnotations].filter(
      // Remove any annotation that is at the end of the annotation group.
      (annotation) => !endIds.has(annotation.id),
    );
  }

  return segments;
}
