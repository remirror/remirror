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
import useEffectOnce from 'react-use/lib/useEffectOnce';
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
import { EditorState } from '@remirror/pm/state';
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
import { PortalContainer } from '../portals';
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

  // Cache whether this is a controlled editor.
  const isControlled = bool(value);
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
    invariant((value && isControlled) || (isNullOrUndefined(value) && !isControlled), {
      code: ErrorConstant.REACT_CONTROLLED,
      message: isControlled
        ? 'You have attempted to switch from a controlled to an uncontrolled editor. Once you set up an editor as a controlled editor it must always provide a `value` prop.'
        : 'You have provided a `value` prop to an uncontrolled editor. In order to set up your editor as controlled you must provide the `value` prop from the very first render.',
    });

    if (!value) {
      return;
    }

    methods.updateControlledState(value);
  }, [isControlled, value, methods]);

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
}

class ReactEditorWrapper<Combined extends AnyCombinedUnion> extends EditorWrapper<
  Combined,
  ReactEditorProps<Combined>
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

      this.onChange({ state, tr });
      return;
    }

    // Update the internal prosemirror state. This happens before we update
    // the component's copy of the state.
    this.view.updateState(state);

    if (triggerChange) {
      this.onChange({ state, tr });
    }

    this.manager.onStateUpdate({ previousState: this.previousState, state, tr, transactions });
  }

  /**
   * Update the controlled state when the value changes and notify the extension
   * of this update.
   */
  updateControlledState(state: EditorState<SchemaFromCombined<Combined>>) {
    this.view.updateState(state);
    this.manager.onStateUpdate({ previousState: this.previousState, state });
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

  /**
   * Reset the `getRootProps` called status.
   */
  private prepareRender() {
    // Reset the status of roots props being called
    this.rootPropsConfig.called = false;
  }

  render() {
    this.prepareRender();

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
}

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
