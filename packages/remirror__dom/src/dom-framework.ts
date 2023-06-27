import {
  AnyExtension,
  EditorState,
  Framework,
  FrameworkOutput,
  FrameworkProps,
  STATE_OVERRIDE,
  UpdateStateProps,
} from '@remirror/core';
import { EditorView } from '@remirror/pm/view';

export interface DomFrameworkOutput<Extension extends AnyExtension>
  extends FrameworkOutput<Extension> {
  /**
   * Call this method when cleaning up the DOM. It is called for you if you call
   * `manager.destroy()`.
   */
  destroy: () => void;
}

export interface DomFrameworkProps<Extension extends AnyExtension>
  extends FrameworkProps<Extension> {
  /**
   * Provide a container element. Which the editor will be appended to.
   */
  element: Element;
}

/**
 * The Framework implementation when interacting with the DOM.
 */
export class DomFramework<Extension extends AnyExtension> extends Framework<
  Extension,
  DomFrameworkProps<Extension>,
  DomFrameworkOutput<Extension>
> {
  get name() {
    return 'dom' as const;
  }

  /**
   * Create the prosemirror `[[EditorView`]].
   */
  protected createView(state: EditorState, element?: Element): EditorView {
    return new EditorView(element ?? null, {
      state,
      dispatchTransaction: this.dispatchTransaction,
      attributes: () => this.getAttributes(),
      editable: () => this.props.editable ?? true,
      plugins: [],
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
  protected updateState({ state, ...rest }: UpdateStateProps): void {
    const { tr, transactions, triggerChange = true } = rest;

    // Check if this is a fresh update directly applied by the developer (without
    // transactions or commands).
    if (!tr && !transactions) {
      state = state.apply(state.tr.setMeta(STATE_OVERRIDE, {}));
    }

    // Update the internal prosemirror state. This happens before we update
    // the component's copy of the state.
    this.view.updateState(state);

    // If `transactions` is an empty array, that means the transaction was cancelled by `filterTransaction`.
    if (triggerChange && transactions?.length !== 0) {
      this.onChange({ state, tr });
    }

    this.manager.onStateUpdate({ previousState: this.previousState, state, tr, transactions });
  }

  get frameworkOutput(): DomFrameworkOutput<Extension> {
    return {
      ...this.baseOutput,
      destroy: () => this.destroy(),
    };
  }
}
