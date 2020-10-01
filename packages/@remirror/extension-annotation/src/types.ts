export type GetStyle<A extends Annotation> = (
  annotations: Array<AnnotationWithoutText<A>>,
) => string | undefined;
export interface AnnotationOptions<A extends Annotation = Annotation> {
  /**
   * Method to calculate styles for a segment with one or more annotations
   *
   * @remarks
   *
   * This can be used e.g. to assign different shades of a color depending on
   * the amount of annotations in a segment.
   */
  getStyle?: GetStyle<A>;

  /**
   * Allows to format the text returned for each annotation.
   *
   * When `blockSeparator` is given, it will be inserted whenever a new
   * block node is started.
   *
   * @see PromirrorNode.textBetween
   */
  blockSeparator?: string | undefined;
}

export interface Annotation {
  /**
   * Unique identifier of the annotation
   */
  id: string;

  /**
   * Document position where the annotation starts
   */
  from: number;

  /**
   * Document position where the annotation ends
   */
  to: number;

  /**
   * Plain text of what is annotated, i.e. content between from->start.
   * This allows applications fetching the annotation to work with them without
   * having to query Prosemirror for the text.
   */
  text: string;

  /**
   * Classname added to the annotation when it's rendered. This can be used
   * e.g. to have annotations in different colors
   */
  className?: string;
}

export type AnnotationWithoutText<A extends Annotation> = Omit<A, 'text'>;

/**
 * Annotation without the fields managed by Prosemirror
 */
export type AnnotationData<A extends Annotation> = Omit<AnnotationWithoutText<A>, 'from' | 'to'>;
