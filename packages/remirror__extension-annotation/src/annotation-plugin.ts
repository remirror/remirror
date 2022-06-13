import { Transaction, TransactionProps } from '@remirror/core';
import { Decoration, DecorationSet } from '@remirror/pm/view';

import {
  ActionType,
  AddAnnotationAction,
  RemoveAnnotationsAction,
  SetAnnotationsAction,
  UpdateAnnotationAction,
} from './annotation-actions';
import { toSegments } from './annotation-segments';
import type { Annotation, AnnotationStore, GetStyle, OmitText } from './annotation-types';

interface ApplyProps extends TransactionProps {
  action: any;
}

export class AnnotationState<Type extends Annotation = Annotation> {
  /**
   * Cache of annotations being currently shown
   */
  annotations: Array<OmitText<Type>> = [];

  /**
   * Decorations are computed based on the annotations. The state contains a
   * copy of the decoration for performance optimization.
   */
  decorationSet = DecorationSet.empty;

  constructor(
    private readonly getStyle: GetStyle<Type>,
    private readonly store: AnnotationStore<Type>,
  ) {}

  addAnnotation(addAction: AddAnnotationAction<Type>): void {
    // FIXME: Review and remove explicit cast.
    const annotation: OmitText<Type> = {
      from: addAction.from,
      to: addAction.to,
      ...addAction.annotationData,
    } as OmitText<Type>;
    this.store.addAnnotation(annotation);
  }

  updateAnnotation(updateAction: UpdateAnnotationAction<Type>): void {
    this.store.updateAnnotation(updateAction.annotationId, updateAction.annotationData);
  }

  removeAnnotations(removeAction: RemoveAnnotationsAction): void {
    this.store.removeAnnotations(removeAction.annotationIds);
  }

  setAnnotations(setAction: SetAnnotationsAction<Type>): void {
    this.store.setAnnotations(setAction.annotations);
  }

  formatAnnotations(): Array<OmitText<Type>> {
    return this.store.formatAnnotations();
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
      // Adjust cached annotation positions based on changes in the editor, e.g.
      // if new text was added before the decoration.
      //
      // Note: If you see annotations getting removed here check the source of
      // the transaction and whether it contains any unexpected steps. In particular
      // 'replace' steps that modify the entire document range, such as the one
      // used by the Yjs extension for supporting `undo`, can cause issues.
      // Consider using the `disableUndo` option of the Yjs extension, if you are
      // using both the Yjs and Annotations extensions.
      this.annotations = this.annotations
        .map((annotation) => ({
          ...annotation,
          // 1 indicates that the annotation isn't extended when the user types
          // at the beginning of the annotation
          from: tr.mapping.map(annotation.from, 1),
          // -1 indicates that the annotation isn't extended when the user types
          // at the end of the annotation
          to: tr.mapping.map(annotation.to, -1),
        }))
        // Remove annotations for which all containing content was deleted
        .filter((annotation) => annotation.to !== annotation.from);
      // Update the store with the updated annotation positions, and the remove ones
      this.store.setAnnotations(this.annotations);
      this.decorationSet = this.decorationSet.map(tr.mapping, tr.doc);
    }

    return this;
  }
}
