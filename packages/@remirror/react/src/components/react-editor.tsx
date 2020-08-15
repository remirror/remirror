import React, {
  cloneElement,
  Dispatch,
  ReactNode,
  Ref,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useFirstMountState } from 'react-use/lib/useFirstMountState';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import {
  AnyCombinedUnion,
  bool,
  EditorWrapper,
  EditorWrapperParameter,
  EMPTY_PARAGRAPH_NODE,
  ErrorConstant,
  getDocument,
  invariant,
  isArray,
  isFunction,
  isNullOrUndefined,
  isPlainObject,
  object,
  PrimitiveSelection,
  RemirrorContentType,
  SchemaFromCombined,
  shouldUseDomEnvironment,
  UpdateStateParameter,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';
import { ReactPreset } from '@remirror/preset-react';
import {
  addKeyToElement,
  getElementProps,
  isReactDOMElement,
  isRemirrorContextProvider,
  isRemirrorProvider,
  propIsFunction,
  RemirrorType,
} from '@remirror/react-utils';

import { usePrevious } from '../hooks';
import type {
  BaseProps,
  GetRootPropsConfig,
  RefKeyRootProps,
  RemirrorContextProps,
} from '../react-types';
import { createEditorView, RemirrorSSR } from '../ssr';

/**
 * The component responsible for rendering your prosemirror editor to the DOM.
 *
 * @remarks
 *
 * This is an internal component and should only be used within the `remirror`
 * codebase. The `RemirrorProvider` is the only supported way for consuming the
 * application.
 *
 * @internal
 */
export const ReactEditor = <Combined extends AnyCombinedUnion>(
  props: ReactEditorProps<Combined>,
) => {
  const { stringHandler = defaultStringHandler, onError, manager, forceEnvironment, value } = props;

  const { placeholder } = props;
  const isFirstMount = useFirstMountState();

  // Update the placeholder on first render.
  if (isFirstMount && !isNullOrUndefined(placeholder)) {
    manager.getPreset(ReactPreset).setOptions({ placeholder });
  }

  // Keep the placeholder updated
  useUpdateEffect(() => {
    if (isNullOrUndefined(placeholder)) {
      return;
    }

    manager.getPreset(ReactPreset).setOptions({ placeholder });
  }, [placeholder, manager]);

  const createStateFromContent = useCallback(
    (
      content: RemirrorContentType,
      selection?: PrimitiveSelection,
    ): EditorState<SchemaFromCombined<Combined>> => {
      return manager.createState({
        content,
        doc: getDocument(forceEnvironment),
        stringHandler,
        selection,
        onError,
      });
    },
    [onError, forceEnvironment, manager, stringHandler],
  );

  const fallback = isFunction(onError) ? onError() : onError ?? EMPTY_PARAGRAPH_NODE;
  const initialContentArgs = isArray(props.initialContent)
    ? props.initialContent
    : ([props.initialContent ?? fallback] as const);
  const initialContent = initialContentArgs[0];
  const initialSelection = initialContentArgs[1];
  const initialEditorState = bool(value)
    ? value
    : createStateFromContent(initialContent, initialSelection);
  const [shouldRenderClient, setShouldRenderClient] = useState<boolean | undefined>(
    props.suppressHydrationWarning ? false : undefined,
  );

  // Store all the `logic` in a `ref`
  const methods: ReactEditorWrapper<Combined> = useEditorWrapper<Combined>({
    initialEditorState,
    setShouldRenderClient,
    createStateFromContent,
    getProps: () => props,
    getShouldRenderClient: () => shouldRenderClient,
  });

  // Handle the initial editor mount.
  useEffect(() => {
    methods.onMount();

    return () => {
      methods.onDestroy();
    };
  }, [methods]);

  const previousEditable = usePrevious(props.editable);

  // Handle editor updates
  useEffect(() => {
    methods.onUpdate(previousEditable);
  }, [previousEditable, methods]);

  useControlledEditor(methods);

  // Return the rendered component
  return methods.render();
};

/**
 * Sets a flag to be a static remirror
 */
ReactEditor.remirrorType = RemirrorType.Editor;

/**
 * A function that takes the injected remirror params and returns JSX to render.
 *
 * @param - injected remirror params
 */
type RenderPropFunction<Combined extends AnyCombinedUnion> = (
  params: RemirrorContextProps<Combined>,
) => JSX.Element;

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

class ReactEditorWrapper<Combined extends AnyCombinedUnion> extends EditorWrapper<
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

  constructor(parameter: ReactEditorWrapperParameter<Combined>) {
    super(parameter);

    const { getShouldRenderClient, setShouldRenderClient } = parameter;

    this.#getShouldRenderClient = getShouldRenderClient;
    this.#setShouldRenderClient = setShouldRenderClient;

    propIsFunction(this.props.children);

    if (this.manager.view) {
      return;
    }

    this.manager.getPreset(ReactPreset).setOptions({ placeholder: this.props.placeholder ?? '' });
  }

  /**
   * This is called to update props on every render so that values don't become stale.
   */
  update(parameter: ReactEditorWrapperParameter<Combined>) {
    super.update(parameter);

    const { getShouldRenderClient, setShouldRenderClient } = parameter;

    this.#getShouldRenderClient = getShouldRenderClient;
    this.#setShouldRenderClient = setShouldRenderClient;

    return this;
  }

  /**
   * Create the prosemirror editor view.
   */
  protected createView(state: EditorState<SchemaFromCombined<Combined>>) {
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

    const { refKey: refKey = 'ref', ...config } = options ?? object<GetRootPropsConfig<RefKey>>();

    return {
      [refKey]: this.onRef,
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
  protected updateState(parameter: UpdateStateParameter<SchemaFromCombined<Combined>>) {
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
  ) {
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

  onMount() {
    const { suppressHydrationWarning } = this.props;

    if (suppressHydrationWarning) {
      this.#setShouldRenderClient(true);
    }
  }

  /**
   * Called for every update of the props and state.
   */
  onUpdate(previousEditable: boolean | undefined) {
    // Ensure that `children` is still a render prop
    propIsFunction(this.props.children);

    // Check whether the editable prop has been updated
    if (this.props.editable !== previousEditable && this.view && this.#editorRef) {
      this.view.setProps({ ...this.view.props, editable: () => this.props.editable ?? true });
    }
  }

  get remirrorContext(): RemirrorContextProps<Combined> {
    return {
      ...this.editorWrapperOutput,
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
   * Reset the `getRootProps` called status.
   */
  private resetRender() {
    // Reset the status of roots props being called
    this.rootPropsConfig.called = false;
    this.rootPropsConfig.count = 0;
  }

  /**
   * Create the react element which renders the text editor.
   */
  render() {
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

/**
 * The parameter that is passed into the ReactEditorWrapper.
 */
interface ReactEditorWrapperParameter<Combined extends AnyCombinedUnion>
  extends EditorWrapperParameter<Combined, ReactEditorProps<Combined>> {
  getShouldRenderClient: () => boolean | undefined;
  setShouldRenderClient: SetShouldRenderClient;
}

type SetShouldRenderClient = Dispatch<SetStateAction<boolean | undefined>>;

/**
 * A hook which creates a reference to the `ReactEditorWrapper` and updates the
 * parameters on every render.
 */
function useEditorWrapper<Combined extends AnyCombinedUnion>(
  parameter: ReactEditorWrapperParameter<Combined>,
) {
  const isFirstMount = useFirstMountState();
  const reactEditorWrapper = useRef(
    isFirstMount ? new ReactEditorWrapper<Combined>(parameter) : null,
  ).current?.update(parameter);

  invariant(reactEditorWrapper, {
    message: 'Problem with `useEditorWrapper` hook.',
    code: ErrorConstant.INTERNAL,
  });

  return reactEditorWrapper;
}

/**
 * If no string handler is provided, but the user tries to provide a string as
 * content then throw an error.
 */
function defaultStringHandler(): never {
  invariant(false, {
    code: ErrorConstant.REACT_EDITOR_VIEW,
    message:
      'No valid string handler. In order to pass in `string` as `initialContent` to the remirror editor you must provide a valid stringHandler prop',
  });
}

/**
 * A hook which manages the controlled updates for the editor.
 */
function useControlledEditor<Combined extends AnyCombinedUnion>(
  methods: ReactEditorWrapper<Combined>,
) {
  const { value } = methods.props;

  // Cache whether this is a controlled editor.
  const isControlled = useRef(bool(value)).current;
  const previousValue = usePrevious(value);

  // Check if the update is valid based on current value.
  const validUpdate = value ? isControlled === true : isControlled === false;

  invariant(validUpdate, {
    code: ErrorConstant.REACT_CONTROLLED,
    message: isControlled
      ? 'You have attempted to switch from a controlled to an uncontrolled editor. Once you set up an editor as a controlled editor it must always provide a `value` prop.'
      : 'You have provided a `value` prop to an uncontrolled editor. In order to set up your editor as controlled you must provide the `value` prop from the very first render.',
  });

  if (!value || value === previousValue) {
    return;
  }

  methods.updateControlledState(value, previousValue ?? undefined);
}
