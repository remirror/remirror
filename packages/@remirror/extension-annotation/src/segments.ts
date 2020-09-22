import type { Annotation } from './types';

/**
 * Reflects one non-overlapping segment
 */
export interface Segment<A extends Annotation> {
  from: number;
  to: number;
  annotations: Array<AnnotationWithoutText<A>>;
}

interface Item<A extends Annotation> {
  type: 'start' | 'end';
  annotation: AnnotationWithoutText<A>;
}

type AnnotationWithoutText<A extends Annotation> = Omit<A, 'text'>;
/**
 * Creates non-overlapping segments based on overlapping annotations.
 *
 * Prosemirror combines overlapping inline decorations by creating
 * segments in which the props of each overlapping decoration
 * are merged.
 * The Prosemirror approach doesn't allow to calculate styles based
 * on multiple annotations, e.g. a darker background shade if there
 * are multiple annotations.
 * To overcome this limitations, this method calculates non-overlapping
 * segments with overlapping annotations. These segments can be used
 * to create Prosemirror decorations with a style that reflects all
 * all annotations within the segment.
 *
 * Approach was confirmed by Marijn: https://discuss.prosemirror.net/t/how-to-style-overlapping-inline-decorations/3162
 */
export function toSegments<A extends Annotation>(
  annotations: Array<AnnotationWithoutText<A>>,
): Array<Segment<A>> {
  // Create index of start/end annotations per index
  const indexItems = annotations.reduce(
    (acc, annotation) => ({
      ...acc,
      [annotation.from]: (acc[annotation.from] || []).concat({
        type: 'start',
        annotation,
      }),
      [annotation.to]: (acc[annotation.to] || []).concat({
        type: 'end',
        annotation,
      }),
    }),
    {} as { [key: string]: Array<Item<A>> },
  );

  // Tracks the annotations active in the currently analyzed segment
  let activeAnnotations: Array<AnnotationWithoutText<A>> = [];
  // Tracks the last from state
  let from = 0;
  return (
    Object.keys(indexItems)
      // Sort nummerically
      .sort((index1, index2) => Number(index1) - Number(index2))
      .reduce((acc, index) => {
        // Find starting/ending annotations for current index
        const items = indexItems[index];
        const startingAnnotations = items
          .filter((item) => item.type === 'start')
          .map((item) => item.annotation);
        const endingAnnotationIds = new Set(
          items.filter((item) => item.type === 'end').map((item) => item.annotation.id),
        );

        const indexAsNumber = Number(index);

        // Create segment if there are any active annotations
        if (activeAnnotations.length > 0) {
          const segment = {
            from,
            to: indexAsNumber,
            annotations: activeAnnotations,
          };
          acc.push(segment);
        }

        from = indexAsNumber;

        // Update active annotations based on starting/ending annotations
        activeAnnotations = activeAnnotations
          .concat(...startingAnnotations)
          .filter((a) => !endingAnnotationIds.has(a.id));

        return acc;
      }, [] as Array<Segment<A>>)
  );
}
