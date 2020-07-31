export interface AnnotationOptions {
  /**
   * Classname set for all annotation. Set this option to use a custom
   * style for annotation.
   * Note that you can style additionally individual annotations via
   * Annotation.className.
   */
  annotationClassName?: string;
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

/**
 * Annotation without the fields managed by Prosemirror
 */
export type AnnotationData<A extends Annotation> = Omit<A, 'from' | 'to' | 'text'>;
