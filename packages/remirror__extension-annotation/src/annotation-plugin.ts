import { assert, Transaction, TransactionProps } from '@remirror/core';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import {
  ActionType,
  AddAnnotationAction,
  RemoveAnnotationsAction,
  SetAnnotationsAction,
  UpdateAnnotationAction,
} from './annotation-actions';
import { toSegments } from './annotation-segments';
import type {
  Annotation,
  GetStyle,
  MapLike,
  OmitText,
  TransformedAnnotation,
} from './annotation-types';

interface ApplyProps extends TransactionProps {
  action: any;
}

export class AnnotationState<Type extends Annotation = Annotation> {
  annotations: Array<OmitText<Type>> = [];

  /**
   * Decorations are computed based on the annotations. The state contains a
   * copy of the decoration for performance optimization.
   */
  decorationSet = DecorationSet.empty;

  constructor(
    private readonly getStyle: GetStyle<Type>,
    private readonly map: MapLike<string, TransformedAnnotation<Type>>,
    private readonly transformPosition: (pos: number) => any,
    private readonly transformPositionBeforeRender: (rpos: any) => number | null,
  ) {}

  addAnnotation(addAction: AddAnnotationAction<Type>): void {
    const { id } = addAction.annotationData;
    this.map.set(id, {
      ...addAction.annotationData,
      from: this.transformPosition(addAction.from),
      to: this.transformPosition(addAction.to),
    } as TransformedAnnotation<Type>);
  }

  updateAnnotation(updateAction: UpdateAnnotationAction<Type>): void {
    assert(this.map.has(updateAction.annotationId));

    this.map.set(updateAction.annotationId, {
      ...this.map.get(updateAction.annotationId),
      ...updateAction.annotationData,
    } as TransformedAnnotation<Type>);
  }

  removeAnnotations(removeAction: RemoveAnnotationsAction): void {
    removeAction.annotationIds.forEach((id) => {
      this.map.delete(id);
    });
  }

  setAnnotations(setAction: SetAnnotationsAction<Type>): void {
    // YJS maps don't support clear
    this.map.clear?.();
    this.map.forEach((_, id, map) => {
      map.delete(id);
    });

    setAction.annotations.forEach((annotation) => {
      const { id, from, to } = annotation;
      this.map.set(id, {
        ...annotation,
        from: this.transformPosition(from),
        to: this.transformPosition(to),
      } as TransformedAnnotation<Type>);
    });
  }

  formatAnnotations(): Array<OmitText<Type>> {
    const annotations: Array<OmitText<Type>> = [];

    this.map.forEach((annotation, id, map) => {
      const from = this.transformPositionBeforeRender(annotation.from);
      const to = this.transformPositionBeforeRender(annotation.to);

      if (!from || !to) {
        map.delete(id);
      }

      annotations.push({
        ...annotation,
        from,
        to,
      });
    });

    return annotations;
  }

  createDecorations(tr: Transaction, annotations: Array<OmitText<Type>> = []): DecorationSet {
    // Recalculate decorations when annotations changed
    const decos = toSegments(annotations).map((segment) => {
      const classNames = segment.annotations
        .map((a) => a.className)
        .filter((className) => className);
      const style = this.getStyle(segment.annotations);

      return Decoration.inline(segment.from, segment.to, {
        class: classNames.length > 0 ? classNames.join(' ') : undefined,
        style,
      });
    });

    return DecorationSet.create(tr.doc, decos);
  }

  apply({ tr, action }: ApplyProps): this {
    const actionType = action?.type;

    if (!action && !tr.docChanged) {
      return this;
    }

    this.annotations = this.annotations
      // Adjust annotation positions based on changes in the editor, e.g.
      // if new text was added before the decoration
      .map((annotation) => ({
        ...annotation,
        from: tr.mapping.map(annotation.from, -1),
        // -1 indicates that the annotation isn't extended when the user types
        // at the end of the annotation
        to: tr.mapping.map(annotation.to, -1),
      }))
      // Remove annotations for which all containing content was deleted
      .filter((annotation) => annotation.to !== annotation.from);

    if (actionType !== undefined) {
      if (actionType === ActionType.ADD_ANNOTATION) {
        this.addAnnotation(action as AddAnnotationAction<Type>);
      }

      if (actionType === ActionType.UPDATE_ANNOTATION) {
        this.updateAnnotation(action as UpdateAnnotationAction<Type>);
      }

      if (actionType === ActionType.REMOVE_ANNOTATIONS) {
        this.removeAnnotations(action as RemoveAnnotationsAction);
      }

      if (actionType === ActionType.SET_ANNOTATIONS) {
        this.setAnnotations(action as SetAnnotationsAction<Type>);
      }

      this.annotations = this.formatAnnotations();
      this.decorationSet = this.createDecorations(tr, this.annotations);
    } else {
      // Performance optimization: Adjust decoration positions based on changes
      // in the editor, e.g. if new text was added before the decoration
      this.decorationSet = this.decorationSet.map(tr.mapping, tr.doc);
    }

    return this;
  }
}
