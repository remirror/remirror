import {
  AnyCombinedUnion,
  EditorState,
  Framework,
  FrameworkOutput,
  FrameworkProps,
  SchemaFromCombined,
  UpdateStateParameter,
} from '@remirror/core';
import { EditorView } from '@remirror/pm/view';

export interface DomFrameworkOutput<Combined extends AnyCombinedUnion>
  extends FrameworkOutput<Combined> {
  /**
   * Call this method when cleaning up the DOM. It is called for you if you call
   * `manager.destroy()`.
   */
  destroy: () => void;
}

export interface DomFrameworkProps<Combined extends AnyCombinedUnion>
  extends FrameworkProps<Combined> {
  /**
   * Provide a container element. Which the editor will be appended to.
   */
  element: Element;
}

/**
 * The helper class which makes integrating with the DOM easier.
 */
export class DomFramework<Combined extends AnyCombinedUnion> extends Framework<
  Combined,
  DomFrameworkProps<Combined>
> {
  get name() {
    return 'dom' as const;
  }

  /**
   * Create the prosemirror `[[EditorView`]].
   */
  protected createView(
    state: EditorState<SchemaFromCombined<Combined>>,
    element?: Element,
  ): EditorView<SchemaFromCombined<Combined>> {
    return new EditorView(element, {
      state,
      nodeViews: this.manager.store.nodeViews,
      dispatchTransaction: this.dispatchTransaction,
      attributes: () => this.getAttributes(),
      editable: () => {
        return this.props.editable ?? true;
      },
    });
  }

  /**
   * This method should be called when the framework is first created.
   */
  onFirstRender(): void {
    if (!this.firstRender) {
      return;
    }

    this.onChange();
    this.addFocusListeners();
  }

  /**
   * Responsible for managing state updates.
   */
  protected updateState(parameter: UpdateStateParameter<SchemaFromCombined<Combined>>): void {
    const { state, tr, transactions, triggerChange = true } = parameter;

    // Update the internal prosemirror state. This happens before we update
    // the component's copy of the state.
    this.view.updateState(state);

    if (triggerChange) {
      this.onChange({ state, tr });
    }

    this.manager.onStateUpdate({ previousState: this.previousState, state, tr, transactions });
  }

  get domOutput(): DomFrameworkOutput<Combined> {
    return {
      ...this.frameworkHelpers,
      destroy: () => this.destroy(),
    };
  }
}
