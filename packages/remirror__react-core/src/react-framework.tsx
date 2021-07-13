import composeRefs from '@seznam/compose-react-refs';
import { Dispatch, ReactNode, Ref, SetStateAction } from 'react';
import {
  AnyExtension,
  ErrorConstant,
  Framework,
  FrameworkOptions,
  FrameworkProps,
  GetSchema,
  invariant,
  isArray,
  object,
  shouldUseDomEnvironment,
  STATE_OVERRIDE,
  UpdateStateProps,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';
import type { EditorView } from '@remirror/pm/view';
import { ReactPlaceholderExtension } from '@remirror/preset-react';
import { createEditorView, RemirrorSSR } from '@remirror/react-ssr';
import { addKeyToElement } from '@remirror/react-utils';

import type { GetRootPropsConfig, ReactFrameworkOutput, RefKeyRootProps } from './react-types';

export class ReactFramework<Extension extends AnyExtension> extends Framework<
  Extension,
  ReactFrameworkProps<Extension>,
  ReactFrameworkOutput<Extension>
> {
  /**
   * Whether to render the client immediately.
   */
  #getShouldRenderClient: () => boolean | undefined;

  /**
   * Update the should render client state input.
   */
  #setShouldRenderClient: SetShouldRenderClient;

  /**
   * Stores the Prosemirror EditorView dom element.
   */
  #editorRef?: HTMLElement;

  /**
   * Used when suppressHydrationWarning is true to determine when it's okay to
   * render the client content.
   */
  private get shouldRenderClient(): boolean | undefined {
    return this.#getShouldRenderClient();
  }

  /**
   * Keep track of whether the get root props has been called during the most recent render.
   */
  private rootPropsConfig = {
    called: false,
    count: 0,
  };

  get name() {
    return 'react' as const;
  }

  constructor(props: ReactFrameworkOptions<Extension>) {
    super(props);

    const { getShouldRenderClient, setShouldRenderClient } = props;

    this.#getShouldRenderClient = getShouldRenderClient;
    this.#setShouldRenderClient = setShouldRenderClient;

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
      .getExtension(ReactPlaceholderExtension)
      .setOptions({ placeholder: this.props.placeholder ?? '' });
  }

  /**
   * This is called to update props on every render so that values don't become stale.
   */
  update(props: ReactFrameworkOptions<Extension>): this {
    super.update(props);

    const { getShouldRenderClient, setShouldRenderClient } = props;

    this.#getShouldRenderClient = getShouldRenderClient;
    this.#setShouldRenderClient = setShouldRenderClient;

    return this;
  }

  /**
   * Create the prosemirror editor view.
   */
  protected createView(state: EditorState<GetSchema<Extension>>): EditorView<GetSchema<Extension>> {
    return createEditorView<GetSchema<Extension>>(
      undefined,
      {
        state,
        dispatchTransaction: this.dispatchTransaction,
        attributes: () => this.getAttributes(),
        editable: () => this.props.editable ?? true,
      },
      this.manager.settings.forceEnvironment,
    );
  }

  /**
   * The external `getRootProps` that is used to spread props onto a desired
   * holder element for the prosemirror view.
   */
  private readonly getRootProps = <RefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<RefKey>,
  ) => {
    return this.internalGetRootProps(options, null);
  };

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
      children: this.renderChildren(children),
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
  protected updateState({ state, ...rest }: UpdateStateProps<GetSchema<Extension>>): void {
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

      this.onChange({ state, tr });

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

    if (triggerChange) {
      // Update the `onChange` handler before notifying the manager but only when a change should be triggered.
      this.onChange({ state, tr });
    }

    this.manager.onStateUpdate({ previousState: this.previousState, state, tr, transactions });
  }

  /**
   * Update the controlled state when the value changes and notify the extension
   * of this update.
   */
  updateControlledState(
    state: EditorState<GetSchema<Extension>>,
    previousState?: EditorState<GetSchema<Extension>>,
  ): void {
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

  onMount(): void {
    const { suppressHydrationWarning } = this.props;

    if (suppressHydrationWarning) {
      this.#setShouldRenderClient(true);
    }
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
      renderSsr: this.renderSsr,
    };
  }

  /**
   * Checks whether this is an SSR environment and returns a child array with
   * the SSR component
   *
   * @param children
   *
   * TODO - this is useless and should be refactored.
   */
  private renderChildren(child: ReactNode = null) {
    const { insertPosition = 'end', suppressHydrationWarning } = this.props;
    const children = isArray(child) ? child : [child];

    if (
      shouldUseDomEnvironment(this.manager.settings.forceEnvironment) &&
      (!suppressHydrationWarning || this.shouldRenderClient)
    ) {
      return children;
    }

    const ssrElement = this.renderSsr();

    return (insertPosition === 'start' ? [ssrElement, ...children] : [...children, ssrElement]).map(
      addKeyToElement,
    );
  }

  /**
   * Return a JSX Element to be used within the ssr rendering phase.
   */
  renderSsr = (): ReactNode => {
    const { suppressHydrationWarning, editable } = this.props;

    if (
      shouldUseDomEnvironment(this.manager.settings.forceEnvironment) &&
      (!suppressHydrationWarning || this.shouldRenderClient)
    ) {
      return null;
    }

    return (
      <RemirrorSSR
        attributes={this.getAttributes(true)}
        state={this.getState()}
        manager={this.manager}
        editable={editable ?? true}
      />
    );
  };

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
  state?: EditorState<GetSchema<Extension>> | null;

  /**
   * Set to true to ignore the hydration warning for a mismatch between the
   * rendered server and client content.
   *
   * @remarks
   *
   * This is a potential solution for those who require server side rendering.
   *
   * While on the server the prosemirror document is transformed into a react
   * component so that it can be rendered. The moment it enters the DOM
   * environment prosemirror takes over control of the root element. The problem
   * is that this will always see this hydration warning on the client:
   *
   * `Warning: Did not expect server HTML to contain a <div> in <div>.`
   *
   * Setting this to true removes the warning at the cost of a slightly slower
   * start up time. It uses the two pass solution mentioned in the react docs.
   * See {@link https://reactjs.org/docs/react-dom.html#hydrate}.
   *
   * For ease of use this prop copies the name used by react for DOM Elements.
   * See {@link
   * https://reactjs.org/docs/dom-elements.html#suppresshydrationwarning.
   */
  suppressHydrationWarning?: boolean;

  /**
   * Determine whether the Prosemirror view is inserted at the `start` or `end`
   * of it's container DOM element.
   *
   * @default 'end'
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
  extends FrameworkOptions<Extension, ReactFrameworkProps<Extension>> {
  getShouldRenderClient: () => boolean | undefined;
  setShouldRenderClient: SetShouldRenderClient;
}

export type SetShouldRenderClient = Dispatch<SetStateAction<boolean | undefined>>;
