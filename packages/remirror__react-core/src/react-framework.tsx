import { Dispatch, ReactNode, Ref, SetStateAction } from 'react';
import {
  AnyExtension,
  ErrorConstant,
  Framework,
  FrameworkOptions,
  FrameworkProps,
  invariant,
  object,
  STATE_OVERRIDE,
  UpdateStateProps,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';
import { EditorView } from '@remirror/pm/view';
import { PlaceholderExtension } from '@remirror/preset-react';

import { composeRefs } from './commonjs-packages/seznam-compose-react-refs';
import type { GetRootPropsConfig, ReactFrameworkOutput, RefKeyRootProps } from './react-types';

export class ReactFramework<Extension extends AnyExtension> extends Framework<
  Extension,
  ReactFrameworkProps<Extension>,
  ReactFrameworkOutput<Extension>
> {
  /**
   * Stores the Prosemirror EditorView dom element.
   */
  #editorRef?: HTMLElement;

  /**
   * Keep track of whether the get root props has been called during the most recent render.
   */
  private readonly rootPropsConfig = {
    called: false,
    count: 0,
  };

  get name() {
    return 'react' as const;
  }

  constructor(props: ReactFrameworkOptions<Extension>) {
    super(props);

    if (this.manager.view) {
      this.manager.view.setProps({
        state: this.manager.view.state,
        dispatchTransaction: this.dispatchTransaction,
        attributes: () => this.getAttributes(),
        editable: () => this.props.editable ?? true,
      });

      return;
    }

    this.manager
      .getExtension(PlaceholderExtension)
      .setOptions({ placeholder: this.props.placeholder ?? '' });
  }

  /**
   * This is called to update props on every render so that values don't become stale.
   */
  update(props: ReactFrameworkOptions<Extension>): this {
    super.update(props);

    return this;
  }

  /**
   * Create the prosemirror editor view.
   */
  protected createView(state: EditorState): EditorView {
    return new EditorView(null, {
      state,
      dispatchTransaction: this.dispatchTransaction,
      attributes: () => this.getAttributes(),
      editable: () => this.props.editable ?? true,
      plugins: [],
    });
  }

  /**
   * The external `getRootProps` that is used to spread props onto a desired
   * holder element for the prosemirror view.
   */
  private readonly getRootProps = <RefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<RefKey>,
  ) => this.internalGetRootProps(options, null);

  /**
   * Creates the props that should be spread on the root element inside which
   * the prosemirror instance will be rendered.
   *
   * TODO - this is useless - REFACTOR
   */
  private readonly internalGetRootProps = <RefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<RefKey>,
    children?: ReactNode,
  ): RefKeyRootProps<RefKey> => {
    // Ensure that this is the first time `getRootProps` is being called during
    // this commit phase of the .
    // invariant(!this.rootPropsConfig.called, { code: ErrorConstant.REACT_GET_ROOT_PROPS });
    this.rootPropsConfig.called = true;

    const {
      refKey: refKey = 'ref',
      ref,
      ...config
    } = options ?? object<GetRootPropsConfig<RefKey>>();

    return {
      [refKey]: composeRefs(ref as Ref<HTMLElement>, this.onRef),
      key: this.uid,
      ...config,
      children,
    } as any;
  };

  /**
   * Stores the Prosemirror editor dom instance for this component using `refs`.
   */
  private readonly onRef: Ref<HTMLElement> = (element) => {
    if (!element) {
      return;
    }

    this.rootPropsConfig.count += 1;

    invariant(this.rootPropsConfig.count <= 1, {
      code: ErrorConstant.REACT_GET_ROOT_PROPS,
      message: `Called ${this.rootPropsConfig.count} times`,
    });

    this.#editorRef = element;
    this.onRefLoad();
  };

  /**
   * Updates the state either by calling `onChange` when it exists or
   * directly setting the internal state via a `setState` call.
   */
  protected updateState({ state, ...rest }: UpdateStateProps): void {
    const { triggerChange = true, tr, transactions } = rest;

    if (this.props.state) {
      const { onChange } = this.props;

      invariant(onChange, {
        code: ErrorConstant.REACT_CONTROLLED,
        message:
          'You are required to provide the `onChange` handler when creating a controlled editor.',
      });

      invariant(triggerChange, {
        code: ErrorConstant.REACT_CONTROLLED,
        message:
          'Controlled editors do not support `clearContent` or `setContent` where `triggerChange` is `true`. Update the `state` prop instead.',
      });

      if (!this.previousStateOverride) {
        this.previousStateOverride = this.getState();
      }

      this.onChange({ state, tr, transactions });

      return;
    }

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
      // Update the `onChange` handler before notifying the manager but only when a change should be triggered.
      this.onChange({ state, tr, transactions });
    }

    this.manager.onStateUpdate({ previousState: this.previousState, state, tr, transactions });
  }

  /**
   * Update the controlled state when the value changes and notify the extension
   * of this update.
   */
  updateControlledState(state: EditorState, previousState?: EditorState): void {
    this.previousStateOverride = previousState;

    // Mark this as a state override so that extensions and plugins know to
    // ignore the transaction.
    state = state.apply(state.tr.setMeta(STATE_OVERRIDE, {}));

    this.view.updateState(state);
    this.manager.onStateUpdate({ previousState: this.previousState, state });

    this.previousStateOverride = undefined;
  }

  /**
   * Adds the prosemirror view to the dom in the position specified via the
   * component props.
   */
  private addProsemirrorViewToDom(element: HTMLElement, viewDom: Element) {
    if (this.props.insertPosition === 'start') {
      element.insertBefore(viewDom, element.firstChild);
    } else {
      element.append(viewDom);
    }
  }

  /**
   * Called once the container dom node (`this.editorRef`) has been initialized
   * after the component mounts.
   *
   * This method handles the cases where the dom is not focused.
   */
  private onRefLoad() {
    invariant(this.#editorRef, {
      code: ErrorConstant.REACT_EDITOR_VIEW,
      message: 'Something went wrong when initializing the text editor. Please check your setup.',
    });

    const { autoFocus } = this.props;
    this.addProsemirrorViewToDom(this.#editorRef, this.view.dom);

    if (autoFocus) {
      this.focus(autoFocus);
    }

    this.onChange();
    this.addFocusListeners();
  }

  /**
   * Called for every update of the props and state.
   */
  onUpdate(): void {
    // Ensure that `children` is still a render prop
    // propIsFunction(this.props.children);

    // Check whether the editable prop has been updated
    if (this.view && this.#editorRef) {
      this.view.setProps({ ...this.view.props, editable: () => this.props.editable ?? true });
    }
  }

  /**
   * Get the framework output.
   */
  get frameworkOutput(): ReactFrameworkOutput<Extension> {
    return {
      ...this.baseOutput,
      getRootProps: this.getRootProps,
      portalContainer: this.manager.store.portalContainer,
    };
  }

  /**
   * Reset the called status of `getRootProps`.
   */
  resetRender(): void {
    // Reset the status of roots props being called
    this.rootPropsConfig.called = false;
    this.rootPropsConfig.count = 0;
  }
}

export interface ReactFrameworkProps<Extension extends AnyExtension>
  extends FrameworkProps<Extension> {
  /**
   * When `onChange` is defined this prop is used to set the next editor
   * state value of the Editor. The value is an instance of the **ProseMirror**
   * [[`EditorState`]].
   *
   * @remarks
   *
   * When this is provided the editor becomes a controlled component. Nothing
   * will be updated unless you explicitly set the value prop to the updated
   * state.
   *
   * Be careful not to set and unset the value as this will trigger an error.
   *
   * When the Editor is set to be controlled there are a number of things to be
   * aware of.
   *
   * - **The last dispatch wins** - Calling multiple dispatches synchronously
   *   during an update is no longer possible since each dispatch needs to be
   *   processed within the `onChange` handler and updated via `setState` call.
   *   Only the most recent call is updated.
   * - **Use chained commands** - These can help resolve the above limitation
   *   for handling multiple updates.
   */
  state?: EditorState | null;

  /**
   * Determine whether the Prosemirror view is inserted at the `start` or `end`
   * of it's container DOM element.
   *
   * @defaultValue 'end'
   */
  insertPosition?: 'start' | 'end';

  /**
   * The placeholder to set for the editor.
   */
  placeholder?: string;
}

/**
 * The options that are passed into the [[`ReactFramework`]] constructor.
 */
export interface ReactFrameworkOptions<Extension extends AnyExtension>
  extends FrameworkOptions<Extension, ReactFrameworkProps<Extension>> {}

export type SetShouldRenderClient = Dispatch<SetStateAction<boolean | undefined>>;
