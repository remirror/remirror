import {
  CommandFunction,
  CreatePluginReturn,
  extensionDecorator,
  ExtensionPriority,
  PlainExtension,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';

import { ActionType, UpdateAnnotationAction } from './actions';
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
@extensionDecorator<AnnotationOptions>({
  defaultOptions: {
    getStyle: defaultGetStyle,
    blockSeparator: undefined,
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
       * Adds an annotation spanning the currently selected content.
       *
       * In order to use this command make sure you have the
       * [[`AnnotationExtension`]] added to your editor.
       *
       * @param annotationData - the data for the provided annotation.
       */
      addAnnotation: (annotationData: AnnotationData<A>): CommandFunction => ({ tr, dispatch }) => {
        const { empty, from, to } = tr.selection;

        if (empty) {
          return false;
        }

        dispatch?.(
          tr.setMeta(AnnotationExtension.name, {
            type: ActionType.ADD_ANNOTATION,
            from,
            to,
            annotationData,
          }),
        );

        return true;
      },

      /**
       * Updates an existing annotation with a new value.
       *
       * In order to use this command make sure you have the
       * [[`AnnotationExtension`]] added to your editor.
       *
       * @param id - the annotation id to update.
       * @param annotationDataWithoutId - the annotation data without the id.
       */
      updateAnnotation: (
        id: string,
        annotationDataWithoutId: Omit<AnnotationData<A>, 'id'>,
      ): CommandFunction => ({ tr, dispatch }) => {
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
          dispatch(tr.setMeta(AnnotationExtension.name, action));
        }

        return true;
      },

      /**
       * Removes a list of annotations.
       *
       * In order to use this command make sure you have the
       * [[`AnnotationExtension`]] added to your editor.
       *
       * @param annotationIds - the ids of the annotations to be removed.
       */
      removeAnnotations: (annotationIds: string[]): CommandFunction => ({ tr, dispatch }) => {
        dispatch?.(
          tr.setMeta(AnnotationExtension.name, {
            type: ActionType.REMOVE_ANNOTATIONS,
            annotationIds,
          }),
        );

        return true;
      },

      /**
       * Sets the annotation. Use this to initialize the extension based on
       * loaded data.
       *
       * In order to use this command make sure you have the
       * [[`AnnotationExtension`]] added to your editor.
       *
       * @param annotations - the initial annotation to be set.
       */
      setAnnotations: (annotations: Array<AnnotationWithoutText<A>>): CommandFunction => ({
        tr,
        dispatch,
      }) => {
        dispatch?.(
          tr.setMeta(AnnotationExtension.name, { type: ActionType.SET_ANNOTATIONS, annotations }),
        );

        return true;
      },

      /**
       * Forcefully redraws the annotations
       *
       * Call this function if the styling of the annotations changes.
       *
       * @see https://discord.com/channels/726035064831344711/745695557976195072/759715559477870603
       */
      redrawAnnotations: (): CommandFunction => ({ tr, dispatch }) => {
        dispatch?.(tr.setMeta(AnnotationExtension.name, { type: ActionType.REDRAW_ANNOTATIONS }));

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
          ? doc.textBetween(annotation.from, annotation.to, this.options.blockSeparator)
          : undefined;
      return {
        ...annotation,
        text,
      };
    };

    return {
      /**
       * @returns all annotations in the editor.
       *
       * In order to use this helper make sure you have the
       * [[`AnnotationExtension`]] added to your editor.
       */
      getAnnotations: () => {
        const state: AnnotationState<A> = this.getPluginState();
        // Enrich text at annotation
        return state.annotations.map(enrichText);
      },

      /**
       * @param pos - the position in the root document to find annotations.
       *
       * @returns all annotations at a specific position in the editor.
       *
       * In order to use this command make sure you have the
       * [[`AnnotationExtension`]] added to your editor.
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
