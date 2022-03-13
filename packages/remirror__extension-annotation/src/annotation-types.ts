import type { AcceptUndefined } from '@remirror/core';

export interface MapLike<K extends string, V> {
  clear?: () => void;
  delete: (key: K) => any;
  forEach: (callbackfn: (value: V, key: K, map: MapLike<K, V>) => void, thisArg?: any) => void;
  get: (key: K) => V | undefined;
  has: (key: K) => boolean;
  set: (key: K, value: V) => any;
  readonly size: number;
}

export interface Annotation {
  /**
   * Unique identifier of the annotation
   */
  id: string;

  /**
   * Document position where the annotation starts.
   */
  from: number;

  /**
   * Document position where the annotation ends.
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
 * Remove the text field from an annotation.
 */
export type OmitText<Type extends Annotation> = Omit<Type, 'text'>;

/**
 * Get the data of the annotation without the fields managed by ProseMirror.
 */
export type OmitTextAndPosition<Type extends Annotation> = Omit<Type, 'text' | 'from' | 'to'>;

export type GetStyle<Type extends Annotation> = (
  annotations: Array<OmitText<Type>>,
) => string | undefined;

export interface AnnotationStore<Type extends Annotation> {
  addAnnotation: (data: OmitText<Type>) => void;
  updateAnnotation: (id: string, updateData: OmitTextAndPosition<Type>) => void;
  removeAnnotations: (ids: string[]) => void;

  setAnnotations: (annotations: Array<OmitText<Type>>) => void;
  formatAnnotations: () => Array<OmitText<Type>>;
}

export type TransformedAnnotation<T extends object> = Omit<T, 'from' | 'to'> & {
  /**
   * Document transformed position where the annotation starts.
   */
  from: any;

  /**
   * Document transformed position where the annotation ends.
   */
  to: any;
};

/**
 * Options related to configuring another {@link MapLike} structure to store annotations.
 *
 * @deprecated
 */
interface ExternalMapOptions<Type extends Annotation> {
  /**
   * Allows a custom map-like object for storing internal annotations
   *
   * @remarks
   *
   * This can be used to pass something like a Yjs Y.Map for shared annotations
   */
  // NOTE: Historically this was a MapList<string, TransformedAnnotation<Type>>
  //       even though the input always was a OmitText<Type>. This was missed
  //       due to hard casts and JS being nice enough to not care.
  getMap?: () => MapLike<string, TransformedAnnotation<OmitText<Type>>>;

  /**
   * Allows a custom transform function that modifies how positions are stored
   * internally
   *
   * @remarks
   *
   * This can be used to transform positions to other representations, like a
   * Yjs Relative Position
   *
   * @see ExternalMapOptions.transformPositionBeforeRender
   */
  transformPosition?: (pos: number) => any;

  /**
   * Allows a custom transform function that modifies how internal positions
   * representations are returned externally
   *
   * @remarks
   *
   * This can be used to transform positions from other representations, like a
   * Yjs Relative Position to a ProseMirror integer (absolute) position
   *
   * @see ExternalMapOptions.transformPosition
   */
  transformPositionBeforeRender?: (rpos: any) => number | null;
}

/** Translate all options in T to use {@link AcceptUndefined} */
type ObsoleteOptions<T> = { [K in keyof T]: AcceptUndefined<T[K]> };

export interface AnnotationOptions<Type extends Annotation = Annotation>
  extends ObsoleteOptions<ExternalMapOptions<Type>> {
  /**
   * Method to calculate styles for a segment with one or more annotations
   *
   * @remarks
   *
   * This can be used e.g. to assign different shades of a color depending on
   * the amount of annotations in a segment.
   */
  getStyle?: GetStyle<Type>;

  /**
   * Allows to format the text returned for each annotation.
   *
   * When `blockSeparator` is given, it will be inserted whenever a new
   * block node is started.
   *
   * @see ProsemirrorNode.textBetween
   */
  blockSeparator?: AcceptUndefined<string>;

  getStore?: () => AnnotationStore<Type>;
}
