import { cx } from 'linaria';
import React, { cloneElement, Fragment, ReactNode, Ref, useCallback, useRef } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import useSetState from 'react-use/lib/useSetState';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import {
  AnyCombinedUnion,
  bool,
  clamp,
  CompareStateParameter,
  EDITOR_CLASS_NAME,
  EditorManager,
  EditorSchema,
  EditorView as EditorViewType,
  ErrorConstant,
  FromToParameter,
  getDocument,
  invariant,
  isArray,
  isFunction,
  isNumber,
  isPlainObject,
  MakeRequired,
  object,
  ObjectNode,
  RemirrorContentType,
  SchemaFromCombined,
  Shape,
  shouldUseDOMEnvironment,
  toHTML,
  Transaction,
  uniqueId,
} from '@remirror/core';
import { EditorState, TextSelection } from '@remirror/pm/state';
import {
  addKeyToElement,
  getElementProps,
  isReactDOMElement,
  isRemirrorContextProvider,
  isRemirrorProvider,
  propIsFunction,
  RemirrorType,
} from '@remirror/react-utils';

import { DispatchPartial, usePrevious } from '../hooks';
import { PortalContainer } from '../portals';
import { defaultProps } from '../react-constants';
import {
  BaseListenerParameter,
  BaseProps,
  EditorStateEventListenerParameter,
  FocusType,
  GetRootPropsConfig,
  ListenerParameter,
  RefKeyRootProps,
  RemirrorContextProps,
  RemirrorEventListenerParameter,
  RemirrorStateListenerParameter,
  UpdateStateParameter,
} from '../react-types';
import { createEditorView, RemirrorSSR } from '../ssr';

/**
 * A function that takes the injected remirror params and returns JSX to render.
 *
 * @param - injected remirror params
 */
type RenderPropFunction<Combined extends AnyCombinedUnion> = (
  params: RemirrorContextProps<Combined>,
) => JSX.Element;

export interface RenderEditorProps<Combined extends AnyCombinedUnion>
  extends MakeRequired<BaseProps<Combined>, keyof typeof defaultProps> {
  /**
   * The render prop that takes the injected remirror params and returns an
   * element to render. The editor view is automatically attached to the DOM.
   */
  children: RenderPropFunction<Combined>;
}

export interface RenderEditorHooksProps<Combined extends AnyCombinedUnion>
  extends BaseProps<Combined> {
  /**
   * The render prop that takes the injected remirror params and returns an
   * element to render. The editor view is automatically attached to the DOM.
   */
  children: RenderPropFunction<Combined>;
}

interface RenderEditorState<Schema extends EditorSchema = any> {
  /**
   * The Prosemirror editor state
   */
  editor: CompareStateParameter<Schema>;
  /**
   * Used when suppressHydrationWarning is true to determine when it's okay to
   * render the client content.
   */
  shouldRenderClient?: boolean;
}

function createPropsWithDefaults<Combined extends AnyCombinedUnion>(
  props: RenderEditorHooksProps<Combined>,
): RenderEditorProps<Combined> {
  return {
    attributes: props.attributes ?? defaultProps.attributes,
    editable: props.editable ?? defaultProps.editable,
    fallbackContent: props.fallbackContent ?? defaultProps.fallbackContent,
    initialContent: props.initialContent ?? defaultProps.initialContent,
    insertPosition: props.insertPosition ?? defaultProps.insertPosition,
    label: props.label ?? defaultProps.label,
    onDispatchTransaction: props.onDispatchTransaction ?? defaultProps.onDispatchTransaction,
    stringHandler: props.stringHandler ?? defaultProps.stringHandler,
    usesBuiltInExtensions: props.usesBuiltInExtensions ?? defaultProps.usesBuiltInExtensions,
    usesDefaultStyles: props.usesDefaultStyles ?? defaultProps.usesDefaultStyles,
    children: props.children,
    manager: props.manager,
    autoFocus: props.autoFocus,
    forceEnvironment: props.forceEnvironment,
    onBlur: props.onBlur,
    onChange: props.onChange,
    onFirstRender: props.onFirstRender,
    onFocus: props.onFocus,
    onStateChange: props.onStateChange,
    suppressHydrationWarning: props.suppressHydrationWarning,
    value: props.value,
  };
}

class InternalMethods<Combined extends AnyCombinedUnion> {
  /**
   * Stores the Prosemirror EditorView dom element.
   */
  private editorRef?: HTMLElement;

  /**
   * The prosemirror EditorView.
   */
  private readonly view: EditorViewType<SchemaFromCombined<Combined>>;

  /**
   * A unique ID for the editor which is also used as a key to pass into
   * `getRootProps`.
   */
  private readonly uid = uniqueId({ size: 10 });

  /**
   * The portal container which keeps track of all the React Portals containing
   * custom prosemirror NodeViews.
   */
  private readonly portalContainer: PortalContainer = new PortalContainer();

  #getProps: () => RenderEditorProps<Combined>;
  #getState: () => RenderEditorState<SchemaFromCombined<Combined>>;
  #getSetState: () => DispatchPartial<RenderEditorState<SchemaFromCombined<Combined>>>;

  private get props(): RenderEditorProps<Combined> {
    return this.#getProps();
  }

  private get state(): RenderEditorState<SchemaFromCombined<Combined>> {
    return this.#getState();
  }

  private get setState(): DispatchPartial<RenderEditorState<SchemaFromCombined<Combined>>> {
    return this.#getSetState();
  }

  /**
   * Create the editor state from a remirror content type.
   */
  private createStateFromContent: (
    content: RemirrorContentType,
  ) => EditorState<SchemaFromCombined<Combined>>;

  /**
   * The document to use when rendering.
   */
  private get doc() {
    return getDocument(this.props.forceEnvironment);
  }

  /**
   * A utility for quickly retrieving the extension manager.
   */
  private get manager(): EditorManager<Combined> {
    return this.props.manager;
  }

  private rootPropsConfig = {
    called: false,
  };

  constructor(parameter: InternalMethodsConstructorParameter<Combined>) {
    const { getProps, getState, getSetState, createStateFromContent } = parameter;

    this.#getProps = getProps;
    this.#getState = getState;
    this.#getSetState = getSetState;
    this.createStateFromContent = createStateFromContent;

    propIsFunction(this.props.children);

    // Create the ProsemirrorView and initialize our editor manager with it.
    this.view = this.createView();
    this.manager.addView(this.view);
  }

  init(parameter: InternalMethodsConstructorParameter<Combined>) {
    const { getProps, getState, createStateFromContent, getSetState } = parameter;
    this.#getProps = getProps;
    this.#getState = getState;
    this.#getSetState = getSetState;
    this.createStateFromContent = createStateFromContent;

    return this;
  }

  /**
   * Reinitialize the Editor's manager when a new one is passed in via props.
   *
   * TODO check whether or not the schema has changed and log a warning. Schema
   * shouldn't change.
   */
  updateManager() {
    // TODO add a way to reinitialize.
    this.manager.addView(this.view).ready();
  }

  /**
   * Retrieve the editor state. This is passed through to the extension manager.
   */
  private readonly getState = () => this.view.state;

  /**
   * Create the prosemirror editor view.
   */
  private createView() {
    return createEditorView<SchemaFromCombined<Combined>>(
      undefined,
      {
        state: this.state.editor.newState,
        nodeViews: this.manager.store.nodeViews,
        dispatchTransaction: this.dispatchTransaction,

        attributes: () => this.getAttributes(),
        editable: () => {
          return this.props.editable;
        },
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

    const { refKey: referenceKey = 'ref', ...config } =
      options ?? object<NonNullable<typeof options>>();

    return {
      [referenceKey]: this.onRef,
      key: this.uid,
      ...config,
      children: children ?? this.renderChildren(null),
    } as any;
  };

  /**
   * Stores the Prosemirror editor dom instance for this component using `refs`
   */
  private readonly onRef: Ref<HTMLElement> = (reference) => {
    if (reference) {
      this.editorRef = reference;
      this.onRefLoad();
    }
  };

  /**
   * This sets the attributes that wrap the outer prosemirror node.
   */
  private getAttributes(ssr?: false): Record<string, string>;
  private getAttributes(ssr: true): Shape;
  private getAttributes(ssr?: boolean) {
    const { attributes, autoFocus } = this.props;
    const propertyAttributes = isFunction(attributes)
      ? attributes(this.eventListenerParameter())
      : attributes;

    const managerAttributes = this.manager.store?.attributes;
    const focus = ssr
      ? { autoFocus: bool(autoFocus) }
      : { autofocus: autoFocus ? 'true' : 'false' };

    const defaultAttributes = {
      role: 'textbox',
      ...focus,
      'aria-multiline': 'true',
      ...(!this.props.editable ? { 'aria-readonly': 'true' } : {}),
      'aria-label': this.props.label ?? '',
      ...managerAttributes,
      class: cx(ssr && 'Prosemirror', EDITOR_CLASS_NAME, managerAttributes?.class),
    };

    return { ...defaultAttributes, ...propertyAttributes } as any;
  }

  /**
   * Part of the Prosemirror API and is called whenever there is state change in
   * the editor.
   *
   * @internalremarks
   * How does it work when transactions are dispatched one after the other.
   */
  private readonly dispatchTransaction = (tr: Transaction) => {
    tr = this.props.onDispatchTransaction(tr, this.getState());
    const previousState = this.getState();
    const state = previousState.apply(tr);

    // TODO check for controlled component here.

    // Uncontrolled component
    this.updateState({ state, tr });
  };

  /**
   * Updates the state either by calling onStateChange when it exists or
   * directly setting the internal state via a `setState` call.
   */
  private updateState(parameter: UpdateStateParameter<SchemaFromCombined<Combined>>) {
    const { state, triggerOnChange = true, tr } = parameter;

    // Update the internal prosemirror state. This happens before we update
    // the component's copy of the state.
    this.view.updateState(state);

    const previousState = this.state.editor.newState;
    this.setState({ editor: { newState: state, oldState: previousState } });

    if (triggerOnChange) {
      this.props.onChange?.(this.eventListenerParameter({ state, tr }));
    }

    this.manager.onStateUpdate({ previousState, state });
  }

  /**
   * Adds the prosemirror view to the dom in the position specified via the
   * component props.
   */
  private addProsemirrorViewToDom(reactReference: HTMLElement, viewDom: Element) {
    if (this.props.insertPosition === 'start') {
      reactReference.insertBefore(viewDom, reactReference.firstChild);
    } else {
      reactReference.append(viewDom);
    }
  }

  /**
   * Called once the container dom node (`this.editorRef`) has been initialized
   * after the component mounts.
   *
   * This method handles the cases where the dom is not focused.
   */
  private onRefLoad() {
    invariant(this.editorRef, {
      code: ErrorConstant.REACT_EDITOR_VIEW,
      message: 'Something went wrong when initializing the text editor. Please check your setup.',
    });

    const { autoFocus, onFirstRender, onStateChange } = this.props;
    this.addProsemirrorViewToDom(this.editorRef, this.view.dom);
    if (autoFocus) {
      this.focus(autoFocus);
    }

    if (onFirstRender) {
      onFirstRender(this.eventListenerParameter());
    }

    // Handle setting the state when this is a controlled component
    if (onStateChange) {
      onStateChange(this.editorStateEventListenerParameter());
    }

    this.view.dom.addEventListener('blur', this.onBlur);
    this.view.dom.addEventListener('focus', this.onFocus);
  }

  onMount() {
    const { suppressHydrationWarning } = this.props;

    if (suppressHydrationWarning) {
      this.setState({ shouldRenderClient: true });
    }

    this.manager.ready();
  }

  onUpdate(previousEditable: boolean | undefined) {
    // Ensure that children is still a render prop
    propIsFunction(this.props.children);

    // Check whether the editable prop has been updated
    if (this.props.editable !== previousEditable && this.view && this.editorRef) {
      this.view.setProps({ ...this.view.props, editable: () => this.props.editable });
    }
  }

  /**
   * Called when the component unmounts and is responsible for cleanup.
   *
   * @remarks
   *
   * - Removes listeners for the editor blur and focus events
   * - Destroys the state for each plugin
   * - Destroys the prosemirror view
   */
  onDestroy() {
    this.view.dom.removeEventListener('blur', this.onBlur);
    this.view.dom.removeEventListener('focus', this.onFocus);

    const editorState = this.state.editor.newState;

    this.view.state.plugins.forEach((plugin) => {
      const state = plugin.getState(editorState);
      if (state?.destroy) {
        state.destroy();
      }
    });

    this.view.destroy();
  }

  /**
   * Listener for editor 'blur' events
   */
  onBlur = (event: Event) => {
    this.props.onBlur?.(this.eventListenerParameter(), event);
  };

  /**
   * Listener for editor 'focus' events
   */
  onFocus = (event: Event) => {
    this.props.onFocus?.(this.eventListenerParameter(), event);
  };

  /**
   * Sets the content of the editor.
   *
   * @param content
   * @param triggerOnChange
   */
  private readonly setContent = (content: RemirrorContentType, triggerOnChange = false) => {
    const state = this.createStateFromContent(content);
    this.updateState({ state, triggerOnChange });
  };

  /**
   * Clear; the content of the editor (reset to the default empty node)
   *
   * @param triggerOnChange - whether to notify the onChange handler that the
   * content has been reset
   */
  private readonly clearContent = (triggerOnChange = false) => {
    this.setContent(this.props.fallbackContent, triggerOnChange);
  };

  /**
   * The params used in the event listeners and the state listener
   */
  private baseListenerParameter({
    state,
    tr,
  }: ListenerParameter<Combined>): BaseListenerParameter<Combined> {
    return {
      tr,
      internalUpdate: !tr,
      view: this.view,
      getHTML: this.getHTML(state),
      getJSON: this.getJSON(state),
      getObjectNode: this.getObjectNode(state),
      getText: this.getText(state),
    };
  }

  /**
   * Creates the parameters passed into all event listener handlers.
   * e.g. `onChange`
   */
  private eventListenerParameter(
    { state, tr }: ListenerParameter<Combined> = object(),
  ): RemirrorEventListenerParameter<Combined> {
    return {
      ...this.baseListenerParameter({ tr }),
      state: state ?? this.state.editor.newState,
    };
  }

  /**
   * The params passed into onStateChange (within controlled components)
   */
  private editorStateEventListenerParameter(
    { newState, oldState, tr }: EditorStateEventListenerParameter<Combined> = object(),
  ): RemirrorStateListenerParameter<Combined> {
    return {
      ...this.baseListenerParameter({ state: newState, tr }),
      newState: newState ?? this.state.editor.newState,
      oldState: oldState ?? this.state.editor.oldState,
      createStateFromContent: this.createStateFromContent,
    };
  }

  /**
   * Set the focus for the editor.
   */
  private readonly focus = (position?: FocusType) => {
    if (position === false) {
      return;
    }

    if (this.view.hasFocus() && (position === undefined || position === true)) {
      return;
    }

    const { selection, doc, tr } = this.getState();
    const { from = 0, to = from } = selection;

    let pos: number | FromToParameter;

    /** Ensure the selection is within the current document range */
    const clampToDocument = (value: number) => clamp({ min: 0, max: doc.content.size, value });

    if (position === undefined || position === true) {
      pos = { from, to };
    } else if (position === 'start') {
      pos = 0;
    } else if (position === 'end') {
      pos = doc.nodeSize - 2;
    } else {
      pos = position;
    }

    let newSelection: TextSelection;

    if (isNumber(pos)) {
      pos = clampToDocument(pos);
      newSelection = TextSelection.near(doc.resolve(pos));
    } else {
      const start = clampToDocument(pos.from);
      const end = clampToDocument(pos.to);
      newSelection = TextSelection.create(doc, start, end);
    }

    // Set the selection to the requested value
    const transaction = tr.setSelection(newSelection);
    this.view.dispatch(transaction);

    // Wait for the next event loop to set the focus.
    requestAnimationFrame(() => this.view.focus());
  };

  get renderParameter(): RemirrorContextProps<Combined> {
    return {
      ...this.manager.store,

      /* Properties */
      uid: this.uid,
      manager: this.manager,
      view: this.view,
      state: this.state.editor,

      /* Getter Methods */
      getRootProps: this.getRootProps,

      /* Setter Methods */
      clearContent: this.clearContent,
      setContent: this.setContent,

      /* Helper Methods */
      focus: this.focus,

      portalContainer: this.portalContainer,
    };
  }

  private readonly getText = (state?: EditorState<SchemaFromCombined<Combined>>) => (
    lineBreakDivider = '\n\n',
  ) => {
    const { doc } = state ?? this.state.editor.newState;
    return doc.textBetween(0, doc.content.size, lineBreakDivider);
  };

  /**
   * Retrieve the HTML from the `doc` prosemirror node
   */
  private readonly getHTML = (state?: EditorState<SchemaFromCombined<Combined>>) => () => {
    return toHTML({
      node: (state ?? this.state.editor.newState).doc,
      schema: this.manager.store.schema,
      doc: this.doc,
    });
  };

  /**
   * Retrieve the full state json object
   */
  private readonly getJSON = (
    state?: EditorState<SchemaFromCombined<Combined>>,
  ) => (): ObjectNode => {
    return (state ?? this.state.editor.newState).toJSON() as ObjectNode;
  };

  /**
   * Return the json object for the prosemirror document.
   */
  private readonly getObjectNode = (
    state?: EditorState<SchemaFromCombined<Combined>>,
  ) => (): ObjectNode => {
    return (state ?? this.state.editor.newState).doc.toJSON() as ObjectNode;
  };

  /**
   * Checks whether this is an SSR environment and returns a child array with
   * the SSR component
   *
   * @param children
   */
  private renderChildren(child: ReactNode) {
    const { forceEnvironment, insertPosition, suppressHydrationWarning } = this.props;
    const { shouldRenderClient } = this.state;

    const children = isArray(child) ? child : [child];

    if (
      shouldUseDOMEnvironment(forceEnvironment) &&
      (!suppressHydrationWarning || shouldRenderClient)
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
        state={this.state.editor.newState}
        manager={this.manager}
        editable={this.props.editable}
      />
    );
  }

  private renderReactElement() {
    const element: JSX.Element | null = this.props.children({
      ...this.renderParameter,
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

interface InternalMethodsConstructorParameter<Combined extends AnyCombinedUnion> {
  getProps: () => RenderEditorProps<Combined>;
  getState: () => RenderEditorState<SchemaFromCombined<Combined>>;
  getSetState: () => DispatchPartial<RenderEditorState<SchemaFromCombined<Combined>>>;
  createStateFromContent: (
    content: RemirrorContentType,
  ) => EditorState<SchemaFromCombined<Combined>>;
}

function useInternalMethods<Combined extends AnyCombinedUnion>(
  parameter: InternalMethodsConstructorParameter<Combined>,
) {
  return useRef(new InternalMethods<Combined>(parameter)).current.init(parameter);
}

export const RenderEditor = <Combined extends AnyCombinedUnion>(
  rawProps: RenderEditorHooksProps<Combined>,
) => {
  const props = createPropsWithDefaults<Combined>(rawProps);

  const { stringHandler, fallbackContent, manager, forceEnvironment } = props;

  const createStateFromContent = useCallback(
    (content: RemirrorContentType): EditorState<SchemaFromCombined<Combined>> => {
      return manager.createState({
        content,
        doc: getDocument(forceEnvironment),
        stringHandler,
        onError: fallbackContent,
      });
    },
    [fallbackContent, forceEnvironment, manager, stringHandler],
  );

  const initialState = createStateFromContent(props.initialContent);
  const [state, setState] = useSetState<RenderEditorState<SchemaFromCombined<Combined>>>({
    editor: { newState: initialState, oldState: initialState },
    shouldRenderClient: props.suppressHydrationWarning ? false : undefined,
  });

  const methods: InternalMethods<Combined> = useInternalMethods<Combined>({
    getProps: () => props,
    getState: () => state,
    getSetState: () => setState,
    createStateFromContent,
  });

  // // The following is used as an alternative to `getDerivedStateFromProps`
  // // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops
  // if (props.onStateChange && props.value && props.value !== state.editor.newState) {
  //   setState({
  //     editor: { newState: props.value, oldState: state.editor.newState },
  //   });
  // }

  useEffectOnce(() => {
    methods.onMount();

    return () => methods.onDestroy();
  });

  const previousEditable = usePrevious(props.editable);

  useUpdateEffect(() => {
    methods.onUpdate(previousEditable);
  }, [props, state]);

  return methods.render();
};

/**
 * Sets a flag to be a static remirror
 */
RenderEditor.remirrorType = RemirrorType.Editor;
