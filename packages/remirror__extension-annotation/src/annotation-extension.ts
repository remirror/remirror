import {
  command,
  CommandFunction,
  CreateExtensionPlugin,
  extension,
  ExtensionPriority,
  getTextSelection,
  Helper,
  helper,
  isEmptyObject,
  OnSetOptionsProps,
  PlainExtension,
  PrimitiveSelection,
  within,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';

import { ActionType, UpdateAnnotationAction } from './annotation-actions';
import { AnnotationState } from './annotation-plugin';
import type { Annotation, AnnotationOptions, GetData, OmitText } from './annotation-types';

/**
 * Computes a background color based on how many overlapping annotations are in
 * a segment. The more annotations, the darker the background. This gives the
 * illusion that annotations are above each other.
 */
function defaultGetStyle<A extends Annotation>(annotations: Array<OmitText<A>>) {
  // Consider up to 5 overlapping annotations
  const backgroundShade = Math.min(annotations.length, 5) / 5;
  const notBlue = 200 * (1 - backgroundShade) + 55;
  return `background: rgb(${notBlue}, ${notBlue}, 255);`;
}

/**
 * This extension allows to annotate the content in your editor.
 *
 * Extend the Annotation interface to store application specific information
 * like tags or color.
 */
@extension<AnnotationOptions>({
  defaultOptions: {
    getStyle: defaultGetStyle,
    blockSeparator: undefined,
    getMap: () => new Map(),
    transformPosition: (pos) => pos,
    transformPositionBeforeRender: (pos) => pos,
  },
  defaultPriority: ExtensionPriority.Low,
})
export class AnnotationExtension<Type extends Annotation = Annotation> extends PlainExtension<
  AnnotationOptions<Type>
> {
  get name() {
    return 'annotation' as const;
  }

  protected onSetOptions(props: OnSetOptionsProps<AnnotationOptions<Type>>): void {
    const { pickChanged } = props;
    const changedPluginOptions = pickChanged([
      'getMap',
      'transformPosition',
      'transformPositionBeforeRender',
    ]);

    if (!isEmptyObject(changedPluginOptions)) {
      this.store.updateExtensionPlugins(this);
    }
  }

  /**
   * Create the custom code block plugin which handles the delete key amongst
   * other things.
   */
  createPlugin(): CreateExtensionPlugin<AnnotationState<Type>> {
    const pluginState = new AnnotationState<Type>(
      this.options.getStyle,
      this.options.getMap(),
      this.options.transformPosition,
      this.options.transformPositionBeforeRender,
    );

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

  /**
   * Adds an annotation spanning the currently selected content.
   *
   * In order to use this command make sure you have the
   * [[`AnnotationExtension`]] added to your editor.
   *
   * @param annotationData - the data for the provided annotation.
   */
  @command()
  addAnnotation(annotationData: GetData<Type>): CommandFunction {
    return ({ tr, dispatch }) => {
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
    };
  }

  /**
   * Updates an existing annotation with a new value.
   *
   * In order to use this command make sure you have the
   * [[`AnnotationExtension`]] added to your editor.
   *
   * @param id - the annotation id to update.
   * @param annotationDataWithoutId - the annotation data without the id.
   */
  @command()
  updateAnnotation(
    id: string,
    annotationDataWithoutId: Omit<GetData<Type>, 'id'>,
  ): CommandFunction {
    return ({ tr, dispatch }) => {
      if (dispatch) {
        const annotationData = {
          ...annotationDataWithoutId,
          id,
        } as GetData<Type>;

        const action: UpdateAnnotationAction<Type> = {
          type: ActionType.UPDATE_ANNOTATION,
          annotationId: id,
          annotationData,
        };
        dispatch(tr.setMeta(AnnotationExtension.name, action));
      }

      return true;
    };
  }

  /**
   * Removes a list of annotations.
   *
   * In order to use this command make sure you have the
   * [[`AnnotationExtension`]] added to your editor.
   *
   * @param annotationIds - the ids of the annotations to be removed.
   */
  @command()
  removeAnnotations(annotationIds: string[]): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(
        tr.setMeta(AnnotationExtension.name, {
          type: ActionType.REMOVE_ANNOTATIONS,
          annotationIds,
        }),
      );

      return true;
    };
  }

  /**
   * Sets the annotation. Use this to initialize the extension based on loaded
   * data.
   *
   * In order to use this command make sure you have the
   * [[`AnnotationExtension`]] added to your editor.
   *
   * @param annotations - the initial annotation to be set.
   */
  @command()
  setAnnotations(annotations: Array<OmitText<Type>>): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(
        tr.setMeta(AnnotationExtension.name, { type: ActionType.SET_ANNOTATIONS, annotations }),
      );

      return true;
    };
  }

  /**
   * Forcefully redraws the annotations
   *
   * Call this function if the styling of the annotations changes.
   *
   * @see
   * https://discord.com/channels/726035064831344711/745695557976195072/759715559477870603
   */
  @command()
  redrawAnnotations(): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(tr.setMeta(AnnotationExtension.name, { type: ActionType.REDRAW_ANNOTATIONS }));

      return true;
    };
  }

  /**
   * @returns all annotations in the editor.
   *
   * In order to use this helper make sure you have the
   * [[`AnnotationExtension`]] added to your editor.
   */
  @helper()
  getAnnotations(): Helper<Type[]> {
    const state: AnnotationState<Type> = this.getPluginState();
    // Enrich text at annotation
    return state.annotations.map(this.enrichText);
  }

  /**
   * @param pos - the position in the root document to find annotations.
   *
   * @returns all annotations at a specific position in the editor.
   *
   * In order to use this helper make sure you have the
   * [[`AnnotationExtension`]] added to your editor.
   */
  @helper()
  getAnnotationsAt(pos?: PrimitiveSelection): Helper<Type[]> {
    const annotations: Type[] = [];
    const { doc, selection } = this.store.getState();
    const state: AnnotationState<Type> = this.getPluginState();
    const { from, to } = getTextSelection(pos ?? selection, doc);

    for (const annotation of state.annotations) {
      if (
        within(from, annotation.from, annotation.to) ||
        within(to, annotation.from, annotation.to) ||
        within(annotation.from, from, to) ||
        within(annotation.to, from, to)
      ) {
        annotations.push(this.enrichText(annotation));
      }
    }

    return annotations;
  }

  /**
   * @param pos - the optional selection to check for, if left undefined it
   * default to the current selection
   *
   * @returns true if the selection includes an annotation or is included within
   * an annotation.
   *
   * In order to use this helper make sure you have the
   * [[`AnnotationExtension`]] added to your editor.
   */
  @helper()
  selectionHasAnnotation(pos?: PrimitiveSelection): Helper<boolean> {
    return this.getAnnotationsAt(pos).length > 0;
  }

  /**
   * Enrich text at annotation
   */
  private readonly enrichText = (annotation: OmitText<Type>): Type => {
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
    } as Type;
  };
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      annotation: AnnotationExtension;
    }
  }
}
