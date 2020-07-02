import {
  AnyCombinedUnion,
  BuiltinPreset,
  EditorState,
  EditorWrapper,
  EditorWrapperOutput,
  EditorWrapperProps,
  EMPTY_PARAGRAPH_NODE,
  FromToParameter,
  getDocument,
  isFunction,
  RemirrorContentType,
  RemirrorManager,
  SchemaFromCombined,
  UpdateStateParameter,
} from '@remirror/core';
import { EditorView } from '@remirror/pm/view';
import { CorePreset, createCoreManager, CreateCoreManagerOptions } from '@remirror/preset-core';

/**
 * Create an editor manager. It comes with the `CorePreset` already available.
 */
export function createDomManager<Combined extends AnyCombinedUnion>(
  combined: Combined[],
  options?: CreateCoreManagerOptions,
): RemirrorManager<CorePreset | BuiltinPreset | Combined> {
  return createCoreManager([...combined], options);
}

export interface DomEditorWrapperProps<Combined extends AnyCombinedUnion>
  extends EditorWrapperProps<Combined> {
  /**
   * Provide a container element. Which the editor will be appended to.
   */
  element: Element;
}

/**
 * Create the prosemirror editor for the dom environment.
 */
export function createDomEditor<Combined extends AnyCombinedUnion>(
  props: DomEditorWrapperProps<Combined>,
): DomEditorWrapperOutput<Combined> {
  const { stringHandler, onError, manager, forceEnvironment, element } = props;

  function createStateFromContent(
    content: RemirrorContentType,
    selection?: FromToParameter,
  ): EditorState<SchemaFromCombined<Combined>> {
    return manager.createState({
      content,
      doc: getDocument(forceEnvironment),
      stringHandler,
      selection,
      onError,
    });
  }

  const fallback = isFunction(onError) ? onError() : onError ?? EMPTY_PARAGRAPH_NODE;
  const initialEditorState = createStateFromContent(props.initialContent ?? fallback);
  const wrapper = new DomEditorWrapper<Combined>({
    createStateFromContent,
    getProps: () => props,
    initialEditorState,
    element,
  });

  return wrapper.output;
}

interface DomEditorWrapperOutput<Combined extends AnyCombinedUnion>
  extends EditorWrapperOutput<Combined> {
  /**
   * Call this to cleanup the view.
   */
  destroy: () => void;
}

/**
 * The helper class which makes integrating with the DOM easier.
 */
class DomEditorWrapper<Combined extends AnyCombinedUnion> extends EditorWrapper<
  Combined,
  DomEditorWrapperProps<Combined>
> {
  /**
   * Create the prosemirror EditorView.
   */
  protected createView(state: EditorState<SchemaFromCombined<Combined>>, element?: Element) {
    return new EditorView(element, {
      state,
      nodeViews: this.manager.store.nodeViews,
      dispatchTransaction: this.dispatchTransaction,
      attributes: () => this.getAttributes(),
      editable: () => {
        return this.props.editable ?? true;
      },
    });

    this.onChange();
    this.addFocusListeners();
  }

  /**
   * Responsible for managing state updates.
   */
  protected updateState(parameter: UpdateStateParameter<SchemaFromCombined<Combined>>): void {
    const { state, tr, triggerChange = true } = parameter;

    // Update the internal prosemirror state. This happens before we update
    // the component's copy of the state.
    this.view.updateState(state);

    if (triggerChange) {
      this.onChange({ state, tr });
    }

    this.manager.onStateUpdate({ previousState: this.previousState, state });
  }

  get output() {
    return {
      ...this.editorWrapperOutput,
      destroy: () => this.onDestroy(),
    };
  }
}
