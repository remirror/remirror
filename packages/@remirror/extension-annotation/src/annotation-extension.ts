import {
  CommandFunction,
  CreatePluginReturn,
  extensionDecorator,
  ExtensionPriority,
  PlainExtension,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';
import { DecorationSet } from '@remirror/pm/view';

import {
  ActionType,
  AddAnnotationAction,
  RemoveAnnotationsAction,
  SetAnnotationsAction,
} from './actions';
import type { Annotation, AnnotationData, AnnotationOptions } from './types';
import { toAnnotation, toDecoration } from './utils';

/**
 * This extension allows to annotate the content in your editor.
 * Extend the Annotation interface to store application specific
 * information like tags or color.
 */
@extensionDecorator<AnnotationOptions>({
  defaultOptions: {
    annotationClassName: 'annotation',
  },
  defaultPriority: ExtensionPriority.Low,
})
export class AnnotationExtension<A extends Annotation = Annotation> extends PlainExtension<
  AnnotationOptions
> {
  get name() {
    return 'annotation' as const;
  }

  /**
   * Create the custom code block plugin which handles the delete key amongst other things.
   */
  createPlugin(): CreatePluginReturn<DecorationSet> {
    return {
      state: {
        init() {
          return DecorationSet.empty;
        },
        apply: (tr, state) => {
          const action = tr.getMeta(AnnotationExtension.name);
          const actionType = action?.type;

          if (!action && !tr.docChanged) {
            return state;
          }

          // Adjust decoration positions based on changes in the editor, e.g.
          // if new text was added before the decoration
          const newDecorationSet = state.map(tr.mapping, tr.doc);

          if (actionType === ActionType.ADD_ANNOTATION) {
            const addAction = action as AddAnnotationAction<A>;
            const decoration = toDecoration({
              from: addAction.from,
              to: addAction.to,
              annotationData: addAction.annotationData,
              annotationClassName: this.options.annotationClassName,
            });
            return newDecorationSet.add(tr.doc, [decoration]);
          }

          if (actionType === ActionType.REMOVE_ANNOTATIONS) {
            const removeAction = action as RemoveAnnotationsAction;
            const found = newDecorationSet.find(undefined, undefined, (spec) =>
              removeAction.annotationIds.includes(spec.annotation.id),
            );
            return newDecorationSet.remove(found);
          }

          if (actionType === ActionType.SET_ANNOTATIONS) {
            const setAction = action as SetAnnotationsAction<A>;
            const decos = setAction.annotations.map((a) => {
              // Ignore field "text". Prosemirror content is source of truth.
              const { from, to, text, ...annotationData } = a;
              return toDecoration({
                from,
                to,
                annotationData,
                annotationClassName: this.options.annotationClassName,
              });
            });
            return DecorationSet.create(tr.doc, decos);
          }

          return newDecorationSet;
        },
      },
      props: {
        decorations(state: EditorState) {
          return this.getState(state);
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
      setAnnotations: (annotations: A[]): CommandFunction => ({ state, dispatch }) => {
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
    return {
      /**
       * @returns all annotations in the editor
       */
      getAnnotations: () => {
        const decorations: DecorationSet = this.getPluginState();
        return decorations.find().map((decoration) =>
          toAnnotation<A>({
            state: this.store.getState(),
            decoration,
          }),
        );
      },

      /**
       * @returns all annotations at a specific position in the editor
       */
      getAnnotationsAt: (pos: number) => {
        const decorations: DecorationSet = this.getPluginState();
        return (
          decorations
            .find()
            // Only consider decorations that are at the requested position
            .filter((d) => d.from <= pos && d.to >= pos)
            // Convert into annotations (external interface)
            .map((decoration) =>
              toAnnotation<A>({
                state: this.store.getState(),
                decoration,
              }),
            )
        );
      },
    };
  }
}
