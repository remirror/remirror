import { EditorState, TextSelection } from 'prosemirror-state';
import React, { Fragment, PureComponent, ReactNode, Ref } from 'react';

import {
  bool,
  clamp,
  EDITOR_CLASS_NAME,
  EditorView as EditorViewType,
  fromHTML,
  FromToParameter,
  getDocument,
  GetExtensionUnion,
  isArray,
  isFunction,
  isNumber,
  isPlainObject,
  Manager,
  object,
  ObjectNode,
  RemirrorContentType,
  RemirrorThemeContextType,
  SchemaFromExtension,
  shouldUseDOMEnvironment,
  toHTML,
  Transaction,
  uniqueId,
} from '@remirror/core';
import { PortalContainer, RemirrorPortals } from '@remirror/react-portals';
import { createEditorView, RemirrorSSR } from '@remirror/react-ssr';
import {
  addKeyToElement,
  cloneElement,
  getElementProps,
  isManagedRemirrorProvider,
  isReactDOMElement,
  isRemirrorContextProvider,
  isRemirrorProvider,
  propIsFunction,
  RemirrorType,
} from '@remirror/react-utils';

import { defaultProps } from '../react-constants';
import { defaultPositioner } from '../react-positioners';
import {
  BaseListenerParameter,
  CalculatePositionerParameter,
  EditorStateEventListenerParameter,
  FocusType,
  GetPositionerPropsConfig,
  GetPositionerReturn,
  GetRootPropsConfig,
  InjectedRenderEditorProps,
  ListenerParameter,
  PositionerMapValue,
  PositionerProps,
  PositionerRefFactoryParameter,
  RefKeyRootProps,
  RemirrorEventListenerParameter,
  RemirrorState,
  RemirrorStateListenerParameter,
  RenderEditorProps,
  UpdateStateParameter,
} from '../react-types';

export class RenderEditor<ManagerType extends Manager = Manager> extends PureComponent<
  RenderEditorProps<ManagerType>,
  RemirrorState<SchemaFromExtension<GetExtensionUnion<ManagerType>>>
> {
  public static defaultProps = defaultProps;

  /**
   * Sets a flag to be a static remirror
   */
  public static $$remirrorType = RemirrorType.Editor;

  /**
   * This is needed to manage the controlled component `value` prop and copy it
   * to the components state for internal usage.
   */
  public static getDerivedStateFromProps(
    properties: RenderEditorProps,
    state: RemirrorState,
  ): RemirrorState | null {
    const { onStateChange, value } = properties;
    const {
      editor: { newState },
      ...rest
    } = state;

    if (onStateChange && value && value !== newState) {
      return {
        editor: { newState: value, oldState: newState },
        ...rest,
      };
    }

    return null;
  }

  /**
   * Stores the Prosemirror EditorView dom element.
   */
  private editorRef?: HTMLElement;

  /**
   * A map to keep track of all registered positioners.
   */
  private readonly positionerMap = new Map<string, PositionerMapValue>();

  /**
   * The prosemirror EditorView.
   */
  private readonly view: EditorViewType<SchemaFromExtension<GetExtensionUnion<ManagerType>>>;

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

  /**
   * The document to use when rendering.
   */
  private get doc() {
    return getDocument(this.props.forceEnvironment);
  }

  /**
   * A utility for quickly retrieving the extension manager.
   */
  private get manager(): ManagerType {
    console.info(this.props);
    return this.props.manager;
  }

  /**
   * The Remirror Theme context which is made available to all components.
   */
  public context!: RemirrorThemeContextType;

  private rootPropsConfig = {
    called: false,
  };

  constructor(properties: RenderEditorProps<ManagerType>) {
    super(properties);

    // Ensure that children is a render prop.
    propIsFunction(properties.children);

    this.state = this.createInitialState();

    // Create the ProsemirrorView and initialize our extension manager with it.
    this.view = this.createView();
    this.manager.addView(this.view);
  }

  /**
   * Reinitialize the Editor's manager when a new one is passed in via props.
   *
   * TODO check whether or not the schema has changed and log a warning. Schema
   * shouldn't change.
   */
  public updateManager() {
    // TODO add a way to reinitialize.
    this.manager.addView(this.view);
  }

  /**
   * Retrieve the editor state. This is passed through to the extension manager.
   */
  private readonly getState = () =>
    this.props.onStateChange && this.props.value ? this.props.value : this.view.state;

  /**
   * Create the initial React state which stores copies of the Prosemirror
   * editor state. Our React state also keeps track of the previous active
   * state.
   *
   * At this point both oldState and newState point to the same state object.
   */
  private createInitialState(): RemirrorState<SchemaFromExtension<GetExtensionUnion<ManagerType>>> {
    const { suppressHydrationWarning } = this.props;

    const newState = this.createStateFromContent(this.props.initialContent);

    return {
      editor: {
        newState,
        oldState: newState,
      },
      shouldRenderClient: suppressHydrationWarning ? false : undefined,
    };
  }

  /**
   * Create the prosemirror editor view.
   */
  private createView() {
    return createEditorView<SchemaFromExtension<GetExtensionUnion<ManagerType>>>(
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
  private readonly getRootProps = <GRefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<GRefKey>,
  ) => {
    return this.internalGetRootProps(options, null);
  };

  /**
   * Creates the props that should be spread on the root element inside which
   * the prosemirror instance will be rendered.
   */
  private readonly internalGetRootProps = <GRefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<GRefKey>,
    children?: ReactNode,
  ): RefKeyRootProps<GRefKey> => {
    // Ensure that this is the first time `getRootProps` is being called during
    // this render.
    if (this.rootPropsConfig.called) {
      throw new Error(
        '`getRootProps` has been called MULTIPLE times. It should only be called ONCE during render.',
      );
    }
    this.rootPropsConfig.called = true;

    const { refKey: referenceKey = 'ref', ...config } =
      options ?? object<NonNullable<typeof options>>();

    return {
      [referenceKey]: this.onRef,
      key: this.uid,
      ...config,
      children: children ?? this.renderChildren(null),
    } as RefKeyRootProps<GRefKey>;
  };

  /**
   * The method passed to the render props that can be used for passing the
   * position and positioner information components that want to respond to the
   * cursor position (e.g.) a floating / bubble menu.
   */
  private readonly getPositionerProps = <GRefKey extends string = 'ref'>(
    options: GetPositionerPropsConfig<GetExtensionUnion<ManagerType>, GRefKey> | undefined,
  ) => {
    const { refKey: referenceKey = 'ref', ...config } = {
      ...defaultPositioner,
      ...(options ?? object<NonNullable<typeof options>>()),
    };

    // Create the onRef handler which will store the ref to the positioner
    // component
    const reference = this.positionerRefFactory({
      positionerId: config.positionerId,
      position: config.initialPosition,
    });

    // Calculate the props
    const properties = this.calculatePositionProps({ ...config });

    const returnValue: GetPositionerReturn<GRefKey> = {
      ...properties,
      [referenceKey]: reference,
    } as any;

    return returnValue;
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
   * A curried function which holds the positionerId and position in a closure.
   * It generate the method that is passed into a `ref` prop for any component
   * to register dom element for the positioner.
   *
   * It works since each positioner is created with a distinct `positionerId` (a
   * descriptive string) so that multiple positioners can be registered per
   * editor.
   */
  private readonly positionerRefFactory = ({
    positionerId,
    position,
  }: PositionerRefFactoryParameter): Ref<HTMLElement> => (element) => {
    if (!element) {
      return;
    }

    // Retrieve the current
    const current = this.positionerMap.get(positionerId);
    if (!current || current.element !== element) {
      this.positionerMap.set(positionerId, { element, prev: { ...position, isActive: false } });
    }
  };

  /**
   * Returns the positioner props for a given positionerId.
   */
  private calculatePositionProps({
    initialPosition,
    getPosition,
    hasChanged,
    isActive,
    positionerId,
  }: CalculatePositionerParameter<GetExtensionUnion<ManagerType>>): PositionerProps {
    const positionerMapItem = this.positionerMap.get(positionerId);
    let positionerProperties = { isActive: false, ...initialPosition };

    // No element exist yet - so we can return early
    if (!positionerMapItem) {
      return positionerProperties;
    }

    // Nothing has changed so return the prev value.
    if (!hasChanged(this.state.editor)) {
      return positionerMapItem.prev;
    }

    const { element, prev } = positionerMapItem;
    const parameters = { element, view: this.view, ...this.state.editor };

    positionerProperties.isActive = isActive(parameters);

    if (!positionerProperties.isActive) {
      if (prev.isActive) {
        // This has changed so store the new value.
        this.positionerMap.set(positionerId, { element, prev: positionerProperties });
        return positionerProperties;
      }
      return prev;
    }

    positionerProperties = { ...positionerProperties, ...getPosition(parameters) };
    this.positionerMap.set(positionerId, { element, prev: positionerProperties });

    return positionerProperties as PositionerProps;
  }

  /**
   * This sets the attributes that wrap the outer prosemirror node.
   */
  private readonly getAttributes = (ssr = false) => {
    const { attributes, autoFocus } = this.props;
    const propertyAttributes = isFunction(attributes)
      ? attributes(this.eventListenerParameter())
      : attributes;

    const managerAttributes = this.manager.store?.attributes;

    const defaultAttributes = {
      role: 'textbox',
      autofocus: autoFocus ? 'true' : 'false',
      'aria-multiline': 'true',
      ...(!this.props.editable ? { 'aria-readonly': 'true' } : {}),
      'aria-label': this.props.label ?? '',
      ...managerAttributes,
      class: [ssr && 'Prosemirror', EDITOR_CLASS_NAME, managerAttributes?.class]
        .filter(bool)
        .join(' '),
    };

    return { ...defaultAttributes, ...propertyAttributes };
  };

  /**
   * Part of the Prosemirror API and is called whenever there is state change in
   * the editor.
   *
   * @internalremarks
   * How does it work when transactions are dispatched one after the other.
   */
  private readonly dispatchTransaction = (tr: Transaction) => {
    tr = this.props.onDispatchTransaction(tr, this.getState());

    const state = this.getState().apply(tr);

    this.updateState({
      tr,
      state,
      onUpdate: () => {
        this.manager.onTransaction({ tr, state });
      },
    });
  };

  /**
   * This method manages state updates only when the `onStateChange` is passed
   * into the editor. Since it's up to the user to provide state updates to the
   * editor this method is called when the value prop has changed.
   */
  private readonly controlledUpdate = (
    state: EditorState<SchemaFromExtension<GetExtensionUnion<ManagerType>>>,
  ) => {
    const updateHandler = this.createUpdateStateHandler({ state });
    this.view.updateState(state);
    updateHandler();
  };

  /**
   * Create the callback which is passed back to the setState handler.
   */
  private readonly createUpdateStateHandler = ({
    state,
    triggerOnChange,
    onUpdate,
    tr,
  }: UpdateStateParameter<SchemaFromExtension<GetExtensionUnion<ManagerType>>>) => (
    updatedState = state,
  ) => {
    const { onChange } = this.props;

    // No need to continue if triggerOnChange is `false`
    if (!triggerOnChange) {
      return;
    }

    if (onUpdate) {
      onUpdate();
    }

    if (onChange) {
      onChange(this.eventListenerParameter({ state: updatedState, tr }));
    }
  };

  /**
   * Updates the state either by calling onStateChange when it exists or
   * directly setting the internal state via a `setState` call.
   */
  private updateState({
    state,
    triggerOnChange = true,
    onUpdate,
    tr,
  }: UpdateStateParameter<SchemaFromExtension<GetExtensionUnion<ManagerType>>>) {
    const { onStateChange } = this.props;

    const updateHandler = this.createUpdateStateHandler({ state, triggerOnChange, onUpdate });

    // Check if this is a controlled component.
    if (onStateChange) {
      onStateChange(
        this.editorStateEventListenerParameter({
          oldState: this.state.editor.newState,
          newState: state,
          tr,
        }),
      );
    } else {
      // Update the internal prosemirror state. This happens before we update
      // the component's copy of the state.
      this.view.updateState(state);

      // This is not a controlled component so we need to manage firing of
      // setState
      this.setState(({ editor: { newState } }) => {
        return { editor: { oldState: newState, newState: state } };
        // Move update handler out from callback and directly after
        // this.setState To prevent updates from only happening with stale data.
      }, updateHandler);
    }
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
    if (!this.editorRef) {
      throw new Error(
        'Something went wrong when initializing the text editor. Please check your setup.',
      );
    }
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

  /**
   * This is purely used to indicate to the component that this is a client
   * environment when using the `suppressHydrationWarning` prop.
   */
  public componentDidMount() {
    const { suppressHydrationWarning } = this.props;

    if (suppressHydrationWarning) {
      this.setState({ shouldRenderClient: true });
    }
  }

  public componentDidUpdate(
    { editable, manager: previousManager }: RenderEditorProps<ManagerType>,
    previousState: RemirrorState<SchemaFromExtension<GetExtensionUnion<ManagerType>>>,
  ) {
    // Ensure that children is still a render prop
    propIsFunction(this.props.children);

    // Check whether the editable prop has been updated
    if (this.props.editable !== editable && this.view && this.editorRef) {
      this.view.setProps({ ...this.view.props, editable: () => this.props.editable });
    }

    // Check if the manager has changed
    if (!previousManager.isEqual(this.props.manager)) {
      this.updateManager();
      this.view.setProps({ ...this.view.props, nodeViews: this.manager.store.nodeViews });

      // The following converts the current content to HTML and then uses the
      // new manager schema to convert it back into a ProsemirrorNode for
      // compatibility with the new manager.
      const htmlString = toHTML({
        node: this.state.editor.newState.doc,
        schema: previousManager.schema,
      });
      const newContent = fromHTML({
        schema: this.manager.schema,
        content: htmlString,
        doc: this.doc,
      });
      this.setContent(newContent, true);
    }

    const { newState } = this.state.editor;

    // Check if this is controlled component and run the post update handler
    if (this.props.onStateChange && newState !== previousState.editor.newState) {
      // The update was caused by an internal change
      this.controlledUpdate(newState);
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
  public componentWillUnmount() {
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
  private readonly onBlur = (event: Event) => {
    if (this.props.onBlur) {
      this.props.onBlur(this.eventListenerParameter(), event);
    }
  };

  /**
   * Listener for editor 'focus' events
   */
  private readonly onFocus = (event: Event) => {
    if (this.props.onFocus) {
      this.props.onFocus(this.eventListenerParameter(), event);
    }
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
  }: ListenerParameter<GetExtensionUnion<ManagerType>>): BaseListenerParameter<
    GetExtensionUnion<ManagerType>
  > {
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
    { state, tr }: ListenerParameter = object(),
  ): RemirrorEventListenerParameter<GetExtensionUnion<ManagerType>> {
    return {
      ...this.baseListenerParameter({ tr }),
      state: state ?? this.state.editor.newState,
    };
  }

  /**
   * The params passed into onStateChange (within controlled components)
   */
  private editorStateEventListenerParameter(
    {
      newState,
      oldState,
      tr,
    }: EditorStateEventListenerParameter<GetExtensionUnion<ManagerType>> = object(),
  ): RemirrorStateListenerParameter<GetExtensionUnion<ManagerType>> {
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

  get renderParameter(): InjectedRenderEditorProps<ManagerType> {
    return {
      /* Properties */
      uid: this.uid,
      manager: this.manager,
      view: this.view,
      state: this.state.editor,

      /* Mapped methods */
      commands: this.manager.store.commands as any,
      chain: this.manager.store.chain,

      /* Getter Methods */
      getRootProps: this.getRootProps,
      getPositionerProps: this.getPositionerProps,

      /* Setter Methods */
      clearContent: this.clearContent,
      setContent: this.setContent,

      /* Helper Methods */
      focus: this.focus,
    };
  }

  private readonly getText = (
    state?: EditorState<SchemaFromExtension<GetExtensionUnion<ManagerType>>>,
  ) => (lineBreakDivider = '\n\n') => {
    const { doc } = state ?? this.state.editor.newState;
    return doc.textBetween(0, doc.content.size, lineBreakDivider);
  };

  /**
   * Retrieve the HTML from the `doc` prosemirror node
   */
  private readonly getHTML = (
    state?: EditorState<SchemaFromExtension<GetExtensionUnion<ManagerType>>>,
  ) => () => {
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
    state?: EditorState<SchemaFromExtension<GetExtensionUnion<ManagerType>>>,
  ) => (): ObjectNode => {
    return (state ?? this.state.editor.newState).toJSON() as ObjectNode;
  };

  /**
   * Return the json object for the prosemirror document.
   */
  private readonly getObjectNode = (
    state?: EditorState<SchemaFromExtension<GetExtensionUnion<ManagerType>>>,
  ) => (): ObjectNode => {
    return (state ?? this.state.editor.newState).doc.toJSON() as ObjectNode;
  };

  /**
   * Create the editor state from a remirror content type.
   */
  private readonly createStateFromContent = (
    content: RemirrorContentType,
  ): EditorState<SchemaFromExtension<GetExtensionUnion<ManagerType>>> => {
    const { stringHandler, fallbackContent: fallback } = this.props;
    return this.manager.createState({ content, doc: this.doc, stringHandler, fallback });
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
      // within a domless environment
      return element;
    } else if (
      // When called by a provider `getRootProps` can't actually be called until
      // the jsx is generated. Check if this is being rendered via any remirror
      // context provider. In this case `getRootProps` **must** be called by the
      // consumer.
      isRemirrorContextProvider(element) ||
      isRemirrorProvider(element) ||
      isManagedRemirrorProvider(element)
    ) {
      const { childAsRoot } = element.props;
      return childAsRoot
        ? cloneElement(element, properties, this.renderClonedElement(children, childAsRoot))
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

  public render() {
    // Reset the status of roots props being called
    this.rootPropsConfig.called = false;

    return (
      <Fragment>
        {this.renderReactElement()}
        <RemirrorPortals portalContainer={this.portalContainer} />
      </Fragment>
    );
  }
}
