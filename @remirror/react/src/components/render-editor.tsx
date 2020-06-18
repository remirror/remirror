import React, {
  cloneElement,
  Dispatch,
  Fragment,
  ReactNode,
  Ref,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import {
  AnyCombinedUnion,
  bool,
  EditorWrapper,
  EditorWrapperParameter,
  EMPTY_PARAGRAPH_NODE,
  ErrorConstant,
  FromToParameter,
  getDocument,
  invariant,
  isArray,
  isFunction,
  isPlainObject,
  object,
  RemirrorContentType,
  SchemaFromCombined,
  shouldUseDomEnvironment,
  UpdateStateParameter,
} from '@remirror/core';
import { EditorState } from '@remirror/pm/state';
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
import { PortalContainer } from '../portals';
import { defaultProps } from '../react-constants';
import {
  BaseProps,
  GetRootPropsConfig,
  RefKeyRootProps,
  RemirrorContextProps,
} from '../react-types';
import { createEditorView, RemirrorSSR } from '../ssr';

/**
 * The component responsible for rendering your prosemirror editor to the DOM.
 *
 * @internal
 *
 * This is an internal component and should only be used within the `remirror`
 * codebase. The `RemirrorProvider` is the only supported way for consuming the
 * application.
 */
export const RenderEditor = <Combined extends AnyCombinedUnion>(
  rawProps: RenderEditorProps<Combined>,
) => {
  const props = createPropsWithDefaults<Combined>(rawProps);
  const { stringHandler = defaultStringHandler, onError, manager, forceEnvironment, value } = props;

  // Cache whether this is a controlled editor.
  const isControlledEditor = useRef(bool(value)).current;

  const createStateFromContent = useCallback(
    (
      content: RemirrorContentType,
      selection?: FromToParameter,
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
  const initialEditorState = bool(value)
    ? value
    : createStateFromContent(props.initialContent ?? fallback);
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
  useEffectOnce(() => {
    methods.onMount();

    return () => methods.onDestroy();
  });

  const previousEditable = usePrevious(props.editable);

  // Handle editor updates
  useUpdateEffect(() => {
    methods.onUpdate(previousEditable);
  }, [previousEditable]);

  // Handle controlled editor updates every time the value changes.
  useEffect(() => {
    if (!isControlledEditor) {
      return;
    }

    invariant(value, {
      code: ErrorConstant.REACT_CONTROLLED,
      message:
        'This editor has been set up as a controlled editor and must always provide a `value` prop.',
    });

    methods.updateControlledState(value);
  }, [isControlledEditor, value, methods]);

  // Return the rendered component
  return methods.render();
};

/**
 * Sets a flag to be a static remirror
 */
RenderEditor.remirrorType = RemirrorType.Editor;

/**
 * A function that takes the injected remirror params and returns JSX to render.
 *
 * @param - injected remirror params
 */
type RenderPropFunction<Combined extends AnyCombinedUnion> = (
  params: RemirrorContextProps<Combined>,
) => JSX.Element;

export interface RenderEditorProps<Combined extends AnyCombinedUnion> extends BaseProps<Combined> {
  /**
   * The render prop that takes the injected remirror params and returns an
   * element to render. The editor view is automatically attached to the DOM.
   */
  children: RenderPropFunction<Combined>;
}

function createPropsWithDefaults<Combined extends AnyCombinedUnion>(
  props: RenderEditorProps<Combined>,
): RenderEditorProps<Combined> {
  return {
    attributes: props.attributes ?? defaultProps.attributes,
    editable: props.editable ?? defaultProps.editable,
    onError: props.onError ?? defaultProps.onError,
    initialContent: props.initialContent ?? defaultProps.initialContent,
    insertPosition: props.insertPosition ?? defaultProps.insertPosition,
    label: props.label ?? defaultProps.label,
    onDispatchTransaction: props.onDispatchTransaction ?? defaultProps.onDispatchTransaction,
    stringHandler: props.stringHandler ?? defaultProps.stringHandler,
    children: props.children,
    manager: props.manager,
    autoFocus: props.autoFocus,
    forceEnvironment: props.forceEnvironment,
    onChange: props.onChange,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    suppressHydrationWarning: props.suppressHydrationWarning,
    value: props.value,
  };
}

class ReactEditorWrapper<Combined extends AnyCombinedUnion> extends EditorWrapper<
  Combined,
  RenderEditorProps<Combined>
> {
  /**
   * The portal container which keeps track of all the React Portals containing
   * custom prosemirror NodeViews.
   */
  readonly #portalContainer: PortalContainer = new PortalContainer();

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
  };

  constructor(parameter: ReactEditorWrapperParameter<Combined>) {
    super(parameter);

    const { getShouldRenderClient, setShouldRenderClient } = parameter;

    this.#getShouldRenderClient = getShouldRenderClient;
    this.#setShouldRenderClient = setShouldRenderClient;

    propIsFunction(this.props.children);
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
    // this render.
    invariant(!this.rootPropsConfig.called, { code: ErrorConstant.REACT_GET_ROOT_PROPS });
    this.rootPropsConfig.called = true;

    const { refKey: refKey = 'ref', ...config } = options ?? object<NonNullable<typeof options>>();

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
    if (element) {
      this.#editorRef = element;
      this.onRefLoad();
    }
  };

  /**
   * Updates the state either by calling onStateChange when it exists or
   * directly setting the internal state via a `setState` call.
   */
  protected updateState(parameter: UpdateStateParameter<SchemaFromCombined<Combined>>) {
    const { state, triggerChange = true, tr } = parameter;

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
          'Controlled editors do not support `clearContent` or `setContent` where triggerChange. Update the `value` prop instead.',
      });

      this.onChange({ state, tr });
      return;
    }

    // Update the internal prosemirror state. This happens before we update
    // the component's copy of the state.
    this.view.updateState(state);

    if (triggerChange) {
      this.onChange({ state, tr });
    }

    this.manager.onStateUpdate({ previousState: this.previousState, state });
  }

  /**
   * Update the controlled state when the value changes.
   */
  updateControlledState(state: EditorState<SchemaFromCombined<Combined>>) {
    this.view.updateState(state);
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

    this.manager.ready();
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
      portalContainer: this.#portalContainer,
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

  private renderReactElement() {
    const element: JSX.Element | null = this.props.children({
      ...this.remirrorContext,
    });

    const { children, ...properties } = getElementProps(element);

    if (this.rootPropsConfig.called) {
      // Simply return the element as this method can never actually be called
      // within an ssr environment
      return element;
    } else if (
      // When called by a provider `getRootProps` can't actually be called until
      // the jsx is generated. Check if this is being rendered via any remirror
      // context provider. In this case `getRootProps` **must** be called by the
      // consumer.
      isRemirrorContextProvider(element) ||
      isRemirrorProvider(element)
    ) {
      const { childAsRoot } = element.props;
      return childAsRoot
        ? React.cloneElement(element, properties, this.renderClonedElement(children, childAsRoot))
        : element;
    } else {
      return isReactDOMElement(element) ? (
        this.renderClonedElement(element)
      ) : (
        <div {...this.internalGetRootProps(undefined, this.renderChildren(element))} />
      );
    }
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
    const { children, ...rest } = getElementProps(element);
    const properties = isPlainObject(rootProperties) ? { ...rootProperties, ...rest } : rest;

    return cloneElement(
      element,
      this.internalGetRootProps(properties, this.renderChildren(children)),
    );
  }

  render() {
    // Reset the status of roots props being called
    this.rootPropsConfig.called = false;

    return <Fragment>{this.renderReactElement()}</Fragment>;
  }
}

interface ReactEditorWrapperParameter<Combined extends AnyCombinedUnion>
  extends EditorWrapperParameter<Combined, RenderEditorProps<Combined>> {
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
  return useRef(new ReactEditorWrapper<Combined>(parameter)).current.update(parameter);
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
