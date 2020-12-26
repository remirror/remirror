import { assertGet, TransactionParameter } from '@remirror/core';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import {
  ActionType,
  AddAnnotationAction,
  RemoveAnnotationsAction,
  SetAnnotationsAction,
  UpdateAnnotationAction,
} from './actions';
import { toSegments } from './segments';
import type { Annotation, GetStyle, OmitText } from './types';

interface ApplyParameter extends TransactionParameter {
  action: any;
}

export class AnnotationState<Type extends Annotation = Annotation> {
  annotations: Array<OmitText<Type>> = [];

  /**
   * Decorations are computed based on the annotations. The state contains a
   * copy of the decoration for performance optimization.
   */
  decorationSet = DecorationSet.empty;

  constructor(private readonly getStyle: GetStyle<Type>) {}

  apply({ tr, action }: ApplyParameter): this {
    const actionType = action?.type;

    if (!action && !tr.docChanged) {
      return this;
    }

    this.annotations = this.annotations
      // Adjust annotation positions based on changes in the editor, e.g.
      // if new text was added before the decoration
      .map((annotation) => ({
        ...annotation,
        from: tr.mapping.map(annotation.from),
        // -1 indicates that the annotation isn't extended when the user types
        // at the end of the annotation
        to: tr.mapping.map(annotation.to, -1),
      }))
      // Remove annotations for which all containing content was deleted
      .filter((annotation) => annotation.to !== annotation.from);

    let newAnnotations: Array<OmitText<Type>> | undefined;

    if (actionType === ActionType.ADD_ANNOTATION) {
      const addAction = action as AddAnnotationAction<Type>;
      const newAnnotation = {
        ...addAction.annotationData,
        from: addAction.from,
        to: addAction.to,
      } as OmitText<Type>;
      newAnnotations = this.annotations.concat(newAnnotation);
    }

    if (actionType === ActionType.UPDATE_ANNOTATION) {
      const updateAction = action as UpdateAnnotationAction<Type>;
      const annotationIndex = this.annotations.findIndex(
        (annotation) => annotation.id === updateAction.annotationId,
      );
      const updatedAnnotation = {
        ...assertGet(this.annotations, annotationIndex),
        ...updateAction.annotationData,
      };
      newAnnotations = [
        ...this.annotations.slice(0, annotationIndex),
        updatedAnnotation,
        ...this.annotations.slice(annotationIndex + 1),
      ];
    }

    if (actionType === ActionType.REMOVE_ANNOTATIONS) {
      const removeAction = action as RemoveAnnotationsAction;
      newAnnotations = this.annotations.filter((a) => !removeAction.annotationIds.includes(a.id));
    }

    if (actionType === ActionType.SET_ANNOTATIONS) {
      const setAction = action as SetAnnotationsAction<Type>;
      newAnnotations = setAction.annotations;
    }

    if (actionType === ActionType.REDRAW_ANNOTATIONS) {
      newAnnotations = this.annotations;
    }

    if (newAnnotations) {
      // Recalculate decorations when annotations changed
      const decos = toSegments(newAnnotations).map((segment) => {
        const classNames = segment.annotations
          .map((a) => a.className)
          .filter((className) => className);
        const style = this.getStyle(segment.annotations);

        return Decoration.inline(segment.from, segment.to, {
          class: classNames.length > 0 ? classNames.join(' ') : undefined,
          style,
        });
      });

      this.annotations = newAnnotations;
      this.decorationSet = DecorationSet.create(tr.doc, decos);
    } else {
      // Performance optimization: Adjust decoration positions based on changes
      // in the editor, e.g. if new text was added before the decoration
      this.decorationSet = this.decorationSet.map(tr.mapping, tr.doc);
    }

    return this;
  }
}
