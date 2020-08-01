import type { EditorState } from '@remirror/core';
import { Decoration } from '@remirror/pm/view';

import type { Annotation, AnnotationData } from './types';

interface ToDecorationOptions<A extends Annotation> {
  from: number;
  to: number;
  annotationData: AnnotationData<A>;
  annotationClassName: string;
}
export function toDecoration<A extends Annotation>(options: ToDecorationOptions<A>): Decoration {
  const { annotationData: annotation } = options;

  // Mixes extension-level styling for all annotations with annotation-specific styling
  const combinedClassName = [options.annotationClassName, annotation.className]
    .filter((className) => className)
    .join(' ');

  return Decoration.inline(options.from, options.to, { class: combinedClassName }, { annotation });
}

interface ToAnnotationOptions {
  state: EditorState;
  decoration: Decoration;
}
export function toAnnotation<A extends Annotation>(options: ToAnnotationOptions): A {
  const { from, to, spec } = options.decoration;
  const annotationDeco: AnnotationData<A> = spec.annotation;
  const text = options.state.doc.textBetween(from, to);
  return {
    ...annotationDeco,
    text,
    from,
    to,
  } as A;
}
