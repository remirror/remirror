import composeRefs from '@seznam/compose-react-refs';
import React, { cloneElement, Dispatch, ReactNode, Ref, SetStateAction } from 'react';

import {
  AnyCombinedUnion,
  ErrorConstant,
  Framework,
  FrameworkParameter,
  invariant,
  isArray,
  isPlainObject,
  object,
  SchemaFromCombined,
  shouldUseDomEnvironment,
  UpdateStateParameter,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';
import type { EditorView } from '@remirror/pm/view';
import { ReactPreset } from '@remirror/preset-react';
import {
  addKeyToElement,
  getElementProps,
  isReactDOMElement,
  isRemirrorContextProvider,
  isRemirrorProvider,
  propIsFunction,
} from '@remirror/react-utils';

import type {
  BaseProps,
  GetRootPropsConfig,
  RefKeyRootProps,
  RemirrorContextProps,
} from './react-types';
import { createEditorView, RemirrorSSR } from './ssr';

export class ReactFramework<Combined extends AnyCombinedUnion> extends Framework<
  Combined,
  ReactEditorProps<Combined>
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

  constructor(parameter: ReactFrameworkParameter<Combined>) {
    super(parameter);

    const { getShouldRenderClient, setShouldRenderClient } = parameter;

    this.#getShouldRenderClient = getShouldRenderClient;
    this.#setShouldRenderClient = setShouldRenderClient;

    propIsFunction(this.props.children);

    if (this.manager.view) {
      this.manager.view.setProps({
        state: this.manager.view.state,
        dispatchTransaction: this.dispatchTransaction,
        attributes: () => this.getAttributes(),
        editable: () => this.props.editable ?? true,
      });

      return;
    }

    this.manager.getPreset(ReactPreset).setOptions({ placeholder: this.props.placeholder ?? '' });
  }

  /**
   * This is called to update props on every render so that values don't become stale.
   */
  update(parameter: ReactFrameworkParameter<Combined>): this {
    super.update(parameter);

    const { getShouldRenderClient, setShouldRenderClient } = parameter;

    this.#getShouldRenderClient = getShouldRenderClient;
    this.#setShouldRenderClient = setShouldRenderClient;

    return this;
  }

  /**
   * Create the prosemirror editor view.
   */
  protected createView(
    state: EditorState<SchemaFromCombined<Combined>>,
  ): EditorView<SchemaFromCombined<Combined>> {
    return createEditorView<SchemaFromCombined<Combined>>(
      undefined,
      {
        state,
        nodeViews: this.manager.store.nodeViews,
        dispatchTransaction: this.dispatchTransaction,
        attributes: () => this.getAttributes(),
        editable: () => this.props.editable ?? true,
      },
      this.props.forceEnvironment,
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
   */
  private readonly internalGetRootProps = <RefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<RefKey>,
    children?: ReactNode,
  ): RefKeyRootProps<RefKey> => {
    // Ensure that this is the first time `getRootProps` is being called during
    // this commit phase of the .
    // invariant(!this.rootPropsConfig.called, { code: ErrorConstant.REACT_GET_ROOT_PROPS });
    this.rootPropsConfig.called = true;

    const { refKey: refKey = 'ref', ref, ...config } =
      options ?? object<GetRootPropsConfig<RefKey>>();

    return {
      [refKey]: composeRefs(ref as Ref<HTMLElement>, this.onRef),
      key: this.uid,
      ...config,
      children: children ?? this.renderChildren(null),
    } as any;
  };

  /**
   * Stores the Prosemirror editor dom instance for this component using `refs`
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
   * Updates the state either by calling onStateChange when it exists or
   * directly setting the internal state via a `setState` call.
   */
  protected updateState(parameter: UpdateStateParameter<SchemaFromCombined<Combined>>): void {
    const { state, triggerChange = true, tr, transactions } = parameter;

    if (this.props.value) {
      const { onChange } = this.props;

      invariant(onChange, {
        code: ErrorConstant.REACT_CONTROLLED,
        message:
          'You are required to provide the `onChange` handler when creating a controlled editor.',
      });

      invariant(triggerChange, {
        code: ErrorConstant.REACT_CONTROLLED,
        message:
          'Controlled editors do not support `clearContent` or `setContent` where `triggerChange` is `true`. Update the `value` prop instead.',
      });

      if (!this.previousStateOverride) {
        this.previousStateOverride = this.getState();
      }

      this.onChange({ state, tr });

      return;
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
    state: EditorState<SchemaFromCombined<Combined>>,
    previousState?: EditorState<SchemaFromCombined<Combined>>,
  ): void {
    this.previousStateOverride = previousState;

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
  onUpdate(previousEditable: boolean | undefined): void {
    // Ensure that `children` is still a render prop
    propIsFunction(this.props.children);

    // Check whether the editable prop has been updated
    if (this.props.editable !== previousEditable && this.view && this.#editorRef) {
      this.view.setProps({ ...this.view.props, editable: () => this.props.editable ?? true });
    }
  }

  get remirrorContext(): RemirrorContextProps<Combined> {
    return {
      ...this.frameworkHelpers,
      getRootProps: this.getRootProps,
      portalContainer: this.manager.store.portalContainer,
    };
  }

  /**
   * Checks whether this is an SSR environment and returns a child array with
   * the SSR component
   *
   * @param children
   */
  private renderChildren(child: ReactNode) {
    const { forceEnvironment, insertPosition = 'end', suppressHydrationWarning } = this.props;
    const children = isArray(child) ? child : [child];

    if (
      shouldUseDomEnvironment(forceEnvironment) &&
      (!suppressHydrationWarning || this.shouldRenderClient)
    ) {
      return children;
    }

    const ssrElement = this.renderSSR();

    return (insertPosition === 'start' ? [ssrElement, ...children] : [...children, ssrElement]).map(
      addKeyToElement,
    );
  }

  /**
   * Return a JSX Element to be used within the domless environment.
   */
  private renderSSR() {
    return (
      <RemirrorSSR
        attributes={this.getAttributes(true)}
        state={this.getState()}
        manager={this.manager}
        editable={this.props.editable ?? true}
      />
    );
  }

  /**
   * Clones the passed element when `getRootProps` hasn't yet been called.
   *
   * This method also supports rendering the children within a domless environment where necessary.
   */
  private renderClonedElement(
    element: JSX.Element,
    rootProperties?: GetRootPropsConfig<string> | boolean,
  ) {
    const [editorElement, ...other] = isArray(element) ? element : [element, null];
    const { children, ...rest } = getElementProps(editorElement);
    const properties = isPlainObject(rootProperties) ? { ...rootProperties, ...rest } : rest;

    return (
      <>
        {cloneElement(
          editorElement,
          this.internalGetRootProps(properties, this.renderChildren(children)),
        )}
        {[...other]}
      </>
    );
  }

  /**
   * Reset the called status of `getRootProps`.
   */
  private resetRender() {
    // Reset the status of roots props being called
    this.rootPropsConfig.called = false;
    this.rootPropsConfig.count = 0;
  }

  /**
   * Create the react element which renders the text editor. This render method
   * also provides the `RemirrorPortals` which are used to render custom
   * component based node views.
   */
  generateReactElement(): JSX.Element {
    this.resetRender();

    const element: JSX.Element | null = this.props.children(this.remirrorContext);

    const { children, ...properties } = getElementProps(element);
    let renderedElement: JSX.Element;

    if (this.rootPropsConfig.called) {
      // Simply return the element as this method can never actually be called
      // within an ssr environment
      renderedElement = element;
    } else if (
      // When called by a provider `getRootProps` can't actually be called until
      // the jsx is generated. Check if this is being rendered via any remirror
      // context provider. In this case `getRootProps` **must** be called by the
      // consumer.
      isRemirrorContextProvider(element) ||
      isRemirrorProvider(element)
    ) {
      const { childAsRoot } = element.props;

      renderedElement = childAsRoot
        ? cloneElement(element, properties, this.renderClonedElement(children, childAsRoot))
        : element;
    } else {
      renderedElement = isReactDOMElement(element) ? (
        this.renderClonedElement(element)
      ) : (
        <div {...this.internalGetRootProps(undefined, this.renderChildren(element))} />
      );
    }

    this.resetRender();

    return renderedElement;
  }
}

export interface ReactEditorProps<Combined extends AnyCombinedUnion> extends BaseProps<Combined> {
  /**
   * The render prop that takes the injected remirror params and returns an
   * element to render. The editor view is automatically attached to the DOM.
   */
  children: RenderPropFunction<Combined>;

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
   * https://reactjs.org/docs/dom-elements.html#suppresshydrationwarning}.
   */
  suppressHydrationWarning?: boolean;
}

/**
 * A function that takes the injected remirror params and returns JSX to render.
 *
 * @param - injected remirror params
 */
type RenderPropFunction<Combined extends AnyCombinedUnion> = (
  params: RemirrorContextProps<Combined>,
) => JSX.Element;

/**
 * The parameter that is passed into the ReactFramework.
 */
export interface ReactFrameworkParameter<Combined extends AnyCombinedUnion>
  extends FrameworkParameter<Combined, ReactEditorProps<Combined>> {
  getShouldRenderClient: () => boolean | undefined;
  setShouldRenderClient: SetShouldRenderClient;
}

export type SetShouldRenderClient = Dispatch<SetStateAction<boolean | undefined>>;
