import {
  CommandFunction,
  CreatePluginReturn,
  extensionDecorator,
  ExtensionPriority,
  PlainExtension,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';

import {
  ActionType,
  AddAnnotationAction,
  RemoveAnnotationsAction,
  SetAnnotationsAction,
  UpdateAnnotationAction,
} from './actions';
import { AnnotationState } from './annotation-plugin';
import type { Annotation, AnnotationData, AnnotationOptions, AnnotationWithoutText } from './types';

/**
 * Computes a background color based on how many overlapping annotations are in
 * a segment. The more annotations, the darker the background. This gives the
 * illusion that annotations are above each other.
 */
function defaultGetStyle<A extends Annotation>(annotations: Array<AnnotationWithoutText<A>>) {
  // Consider up to 5 overlapping annotations
  const backgroundShade = Math.min(annotations.length, 5) / 5;
  const notBlue = 200 * (1 - backgroundShade) + 55;
  return `background: rgb(${notBlue}, ${notBlue}, 255);`;
}

/**
 * This extension allows to annotate the content in your editor.
 * Extend the Annotation interface to store application specific
 * information like tags or color.
 */
@extensionDecorator<AnnotationOptions<Annotation>>({
  defaultOptions: {
    getStyle: defaultGetStyle,
  },
  defaultPriority: ExtensionPriority.Low,
})
export class AnnotationExtension<A extends Annotation = Annotation> extends PlainExtension<
  AnnotationOptions<A>
> {
  get name() {
    return 'annotation' as const;
  }

  /**
   * Create the custom code block plugin which handles the delete key amongst other things.
   */
  createPlugin(): CreatePluginReturn<AnnotationState<A>> {
    const pluginState = new AnnotationState<A>(this.options.getStyle);

    return {
      state: {
        init() {
          return pluginState;
        },
        apply(tr) {
          const action = tr.getMeta(AnnotationExtension.name);
          return pluginState.apply({ tr, action });
        },
      },
      props: {
        decorations(state: EditorState) {
          return this.getState(state).decorationSet;
        },
      },
    };
  }

  createCommands() {
    return {
      /**
       * Adds an annotation spanning the currently selected content
       */
      addAnnotation: (annotationData: AnnotationData<A>): CommandFunction => ({
        state,
        dispatch,
      }) => {
        const sel = state.selection;

        if (sel.empty) {
          return false;
        }

        if (dispatch) {
          const action: AddAnnotationAction<A> = {
            type: ActionType.ADD_ANNOTATION,
            from: sel.from,
            to: sel.to,
            annotationData,
          };
          dispatch(state.tr.setMeta(AnnotationExtension.name, action));
        }

        return true;
      },

      /**
       * Updates an existing annotation with a new value
       */
      updateAnnotation: (
        id: string,
        annotationDataWithoutId: Omit<AnnotationData<A>, 'id'>,
      ): CommandFunction => ({ state, dispatch }) => {
        if (dispatch) {
          const annotationData = {
            ...annotationDataWithoutId,
            id,
          } as AnnotationData<A>;

          const action: UpdateAnnotationAction<A> = {
            type: ActionType.UPDATE_ANNOTATION,
            annotationId: id,
            annotationData,
          };
          dispatch(state.tr.setMeta(AnnotationExtension.name, action));
        }

        return true;
      },

      /**
       * Removes a list of annotations
       */
      removeAnnotations: (ids: string[]): CommandFunction => ({ state, dispatch }) => {
        if (dispatch) {
          const action: RemoveAnnotationsAction = {
            type: ActionType.REMOVE_ANNOTATIONS,
            annotationIds: ids,
          };
          dispatch(state.tr.setMeta(AnnotationExtension.name, action));
        }

        return true;
      },

      /**
       * Sets the annotation. Use this to initialize the extension based on
       * loaded data
       */
      setAnnotations: (annotations: Array<AnnotationWithoutText<A>>): CommandFunction => ({
        state,
        dispatch,
      }) => {
        if (dispatch) {
          const action: SetAnnotationsAction<A> = {
            type: ActionType.SET_ANNOTATIONS,
            annotations,
          };
          dispatch(state.tr.setMeta(AnnotationExtension.name, action));
        }

        return true;
      },
    };
  }

  createHelpers() {
    // Enrich text at annotation
    const enrichText = (annotation: AnnotationWithoutText<A>) => {
      const { doc } = this.store.getState();
      // Gracefully handle if annotations point to positions outside the content
      // This can happen if content/annotations are set at different points.
      const text =
        annotation.to <= doc.content.size
          ? doc.textBetween(annotation.from, annotation.to)
          : undefined;
      return {
        ...annotation,
        text,
      };
    };

    return {
      /**
       * @returns all annotations in the editor
       */
      getAnnotations: () => {
        const state: AnnotationState<A> = this.getPluginState();
        // Enrich text at annotation
        return state.annotations.map(enrichText);
      },

      /**
       * @returns all annotations at a specific position in the editor
       */
      getAnnotationsAt: (pos: number) => {
        const state: AnnotationState<A> = this.getPluginState();
        return (
          state.annotations
            // Only consider annotations that are at the requested position
            .filter((annotation) => annotation.from <= pos && annotation.to >= pos)
            .map(enrichText)
        );
      },
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      annotation: AnnotationExtension;
    }
  }
}
