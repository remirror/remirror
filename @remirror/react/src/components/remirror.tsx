import React, { Component, ReactNode, Ref } from 'react';

import { css, Interpolation } from '@emotion/core';
import {
  CompareStateParams,
  EDITOR_CLASS_NAME,
  EditorView as EditorViewType,
  EMPTY_PARAGRAPH_NODE,
  ExtensionManager,
  fromHTML,
  getDocument,
  isArray,
  isFunction,
  NodeViewPortalContainer,
  ObjectNode,
  Position,
  RemirrorContentType,
  shouldUseDOMEnvironment,
  toHTML,
  Transaction,
  uniqueId,
} from '@remirror/core';
import { createEditorView, RemirrorSSR } from '@remirror/react-ssr';
import {
  BaseListenerParams,
  CalculatePositionerParams,
  childIsFunction,
  cloneElement,
  getElementProps,
  GetPositionerPropsConfig,
  GetPositionerReturn,
  GetRootPropsConfig,
  InjectedRemirrorProps,
  isReactDOMElement,
  isRemirrorContextProvider,
  PositionerMapValue,
  PositionerProps,
  PositionerRefFactoryParams,
  RefKeyRootProps,
  RemirrorElementType,
  RemirrorEventListenerParams,
  RemirrorProps,
  RemirrorStateListenerParams,
} from '@remirror/react-utils';
import { cx } from 'emotion';
import { EditorState } from 'prosemirror-state';
import { defaultProps } from '../constants';
import { NodeViewPortalComponent } from '../node-views';
import { defaultPositioner } from '../positioners';
import { defaultStyles } from '../styles';

export class Remirror extends Component<RemirrorProps, CompareStateParams> {
  public static defaultProps = defaultProps;
  public static $$remirrorType = RemirrorElementType.Editor;

  /**
   * Used to manage the controlled component value prop and pass it on to the state for internal usage
   */
  public static getDerivedStateFromProps(
    props: RemirrorProps,
    state: CompareStateParams,
  ): CompareStateParams | null {
    const { onStateChange, value } = props;
    const { newState } = state;
    if (newState && onStateChange && value && value !== newState) {
      return {
        newState: value,
        prevState: newState,
      };
    }
    return null;
  }

  /**
   * This method manages state updates only when the `onStateChange` is passed into the editor. Since it's up to the
   * user to provide state updates to the editor this method is called when the value prop has changed.
   */
  private controlledComponentUpdateHandler?: (state: EditorState) => void;
  /**
   * Stores the Prosemirror EditorView dom element
   */
  private editorRef?: HTMLElement;
  private positionerMap = new Map<string, PositionerMapValue>();

  /**
   * The prosemirror EditorView.
   */
  private view: EditorViewType;

  /**
   * A unique ID for the editor which is also used as a key to pass into `getRootProps`
   */
  private uid = uniqueId({ size: 10 });

  /**
   * The portal container which keeps track of all the React Portals containing custom prosemirror NodeViews
   */
  private readonly portalContainer: NodeViewPortalContainer = new NodeViewPortalContainer();

  /**
   * The document to use when rendering
   */
  private get doc() {
    return getDocument(this.props.forceEnvironment);
  }

  /**
   * A utility for quickly retrieving the extension manager
   */
  private get manager(): ExtensionManager {
    return this.props.manager;
  }

  constructor(props: RemirrorProps) {
    super(props);

    // Ensure that children is a render prop
    childIsFunction(props.children);

    // Initialize the manager and create the initial state
    this.manager.init({ getEditorState: this.getEditorState, getPortalContainer: this.getPortalContainer });
    this.state = this.createInitialState();

    // Create the ProsemirrorView and initialize our extension manager with it
    this.view = this.createView();
    this.manager.initView(this.view);
  }

  public updateExtensionManager() {
    this.manager
      .init({ getEditorState: this.getEditorState, getPortalContainer: this.getPortalContainer })
      .initView(this.view);
  }

  /**
   * Retrieve the editor state. This is passed through to the extension manager.
   */
  private getEditorState = () => this.props.value || this.state.newState;

  /**
   * Retrieve the portal container which used for managing node views which contain react components via the portal api.
   */
  private getPortalContainer = () => this.portalContainer;

  /**
   * Create the initial React state which stores copies of the Prosemirror editor state.
   * Our React state also keeps track of the previous active state.
   *
   * It this point both prevState and newState point to the same state object.
   */
  private createInitialState(): CompareStateParams {
    const newState = this.createStateFromContent(this.props.initialContent);

    return {
      newState,
      prevState: newState,
    };
  }

  /**
   * Create the Prosemirror editor view
   */
  private createView() {
    return createEditorView(
      undefined,
      {
        state: this.state.newState,
        nodeViews: this.manager.data.nodeViews,
        dispatchTransaction: this.dispatchTransaction,
        attributes: this.getAttributes,
        editable: () => {
          return this.props.editable;
        },
      },
      this.props.forceEnvironment,
    );
  }

  private rootPropsConfig = {
    called: false,
    suppressRefError: false,
  };

  /**
   * Retrieves up the editor styles for the editor
   */
  private get editorStyles() {
    const styles: Interpolation[] = [this.props.editorStyles];

    /* Inject styles from any extensions */
    styles.unshift(this.manager.data.styles);

    if (this.props.usesDefaultStyles) {
      styles.unshift(defaultStyles());
    }

    return styles;
  }

  private getRootProps = <GRefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<GRefKey>,
  ): RefKeyRootProps<GRefKey> => {
    if (this.rootPropsConfig.called) {
      throw new Error(
        '`getRootProps` has been called MULTIPLE times. It should only be called ONCE during render.',
      );
    }
    this.rootPropsConfig.called = true;
    return this.internalGetRootProps(options, false);
  };

  private internalGetRootProps<GRefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<GRefKey>,
    internal = true,
  ): RefKeyRootProps<GRefKey> {
    const { refKey = 'ref', ...config } = options || {};

    if (internal) {
      //
    }

    return {
      [refKey]: this.onRef,
      key: this.uid,
      css: css(this.editorStyles),
      ...config,
      children: this.renderChildren(null),
    } as RefKeyRootProps<GRefKey>;
  }

  /**
   * The method passed to the render props that can be used for passing the position and positioner
   * information components that want to respond to the cursor position (e.g.) a floating / bubble menu.
   */
  private getPositionerProps = <GRefKey extends string = 'ref'>(
    options: GetPositionerPropsConfig<GRefKey>,
  ) => {
    const { refKey = 'ref', ...config } = { ...defaultPositioner, ...(options || {}) };

    // Create the onRef handler which will store the ref to the positioner component
    const ref = this.positionerRefFactory({
      positionerId: config.positionerId,
      position: config.initialPosition as Position,
    });

    // Calculate the props
    const props = this.calculatePositionProps({ ...config });

    const ret: GetPositionerReturn<GRefKey> = {
      ...props,
      [refKey]: ref,
    } as any;

    return ret;
  };

  /**
   * Stores the Prosemirror editor dom instance for this component using `refs`
   */
  private onRef: Ref<HTMLElement> = ref => {
    if (ref) {
      this.editorRef = ref;
      this.onRefLoad();
    }
  };

  /**
   * A curried function which holds the positionerId and position in a closure. It generate the method that is passed
   * into a `ref` prop for any component to register dom element for the positioner.
   *
   * It works since each positioner is created with a distinct `positionerId` (a descriptive string) so that multiple
   * positioners can be registered per editor.
   */
  private positionerRefFactory = ({
    positionerId,
    position,
  }: PositionerRefFactoryParams): Ref<HTMLElement> => element => {
    if (!element) {
      return;
    }

    // Retrieve the current
    const current = this.positionerMap.get(positionerId);
    if (!current || current.element !== element) {
      this.positionerMap.set(positionerId, { element, prev: { ...position, isActive: false } });
    }
  };

  private calculatePositionProps({
    initialPosition,
    getPosition,
    hasChanged,
    isActive,
    positionerId,
  }: CalculatePositionerParams): PositionerProps {
    const positionerMapItem = this.positionerMap.get(positionerId);
    let positionerProps = { isActive: false, ...initialPosition };

    // No element exist yet - so we can return early
    if (!positionerMapItem) {
      return positionerProps;
    }

    if (!hasChanged(this.state)) {
      return positionerMapItem.prev;
    }

    const { element, prev } = positionerMapItem;
    const params = { element, view: this.view, ...this.state };

    positionerProps.isActive = isActive(params);

    if (!positionerProps.isActive) {
      if (prev.isActive) {
        // This has changed so store the new value
        this.positionerMap.set(positionerId, { element, prev: positionerProps });
        return positionerProps;
      }
      return prev;
    }

    positionerProps = { ...positionerProps, ...getPosition(params) };
    this.positionerMap.set(positionerId, { element, prev: positionerProps });

    return positionerProps as PositionerProps;
  }

  /**
   * This sets the attributes that wrap the outer prosemirror node.
   * It is currently used for setting the aria attributes on the content-editable prosemirror div.
   */
  private getAttributes = () => {
    const { attributes } = this.props;
    const propAttributes = isFunction(attributes) ? attributes(this.eventListenerParams()) : attributes;

    const managerAttrs = this.manager.attributes;

    const defaultAttributes = {
      role: 'textbox',
      'aria-multiline': 'true',
      ...(!this.props.editable ? { 'aria-readonly': 'true' } : {}),
      'aria-label': this.props.label || '',
      ...managerAttrs,
      class: cx(EDITOR_CLASS_NAME, managerAttrs.class),
    };

    return { ...defaultAttributes, ...propAttributes };
  };

  /**
   * Part of the Prosemirror API and is called whenever there is state change in the editor.
   */
  private dispatchTransaction = (transaction: Transaction) => {
    const { dispatchTransaction } = this.props;
    if (dispatchTransaction) {
      dispatchTransaction(transaction);
    }
    const { state } = this.state.newState.applyTransaction(transaction);
    this.updateState(state);
  };

  /**
   * Updates the state either by calling onStateChange when it exists or directly setting the state
   */
  private updateState(state: EditorState, triggerOnChange = true) {
    const { onChange, onStateChange } = this.props;

    const updateHandler = (updatedState?: EditorState) => {
      // For some reason moving the view.updateState here fixes a bug
      this.view.updateState(updatedState || state);
      if (onChange && triggerOnChange) {
        onChange(this.eventListenerParams(updatedState || state));
      }
    };

    // Check if this is a controlled component.
    if (onStateChange) {
      // This is a controlled component
      this.controlledComponentUpdateHandler = (updatedState: EditorState) => {
        updateHandler(updatedState);
        this.controlledComponentUpdateHandler = undefined;
      };

      onStateChange(this.editorStateEventListenerParams({ prevState: this.state.newState, newState: state }));
    } else {
      // This is not a controlled component so we need to manage firing of setState
      this.setState(({ newState }) => {
        return { prevState: newState, newState: state };
      }, updateHandler);
    }
  }

  private addProsemirrorViewToDom(reactRef: HTMLElement, viewDom: Element) {
    if (this.props.insertPosition === 'start') {
      reactRef.insertBefore(viewDom, reactRef.firstChild);
    } else {
      reactRef.appendChild(viewDom);
    }
  }

  private onRefLoad() {
    if (!this.editorRef) {
      throw Error('Something went wrong when initializing the text editor. Please check your setup.');
    }
    const { autoFocus, onFirstRender, onStateChange } = this.props;
    this.addProsemirrorViewToDom(this.editorRef, this.view.dom);
    if (autoFocus) {
      this.view.focus();
    }

    if (onFirstRender) {
      onFirstRender(this.eventListenerParams());
    }

    // Handle setting the state when this is a controlled component
    if (onStateChange) {
      onStateChange(this.editorStateEventListenerParams());
    }

    this.view.dom.addEventListener('blur', this.onBlur);
    this.view.dom.addEventListener('focus', this.onFocus);
  }

  public componentDidUpdate(
    { editable, manager: prevManager }: RemirrorProps,
    { newState }: CompareStateParams,
  ) {
    // Ensure that children is still a render prop
    childIsFunction(this.props.children);

    // Check whether the editable prop has been updated
    if (this.props.editable !== editable && this.view && this.editorRef) {
      this.view.setProps({ ...this.view.props, editable: () => this.props.editable });
    }

    // Check if the manager has changed
    if (!prevManager.isEqual(this.props.manager)) {
      this.updateExtensionManager();
      this.view.setProps({ ...this.view.props, nodeViews: this.manager.data.nodeViews });

      // The following converts the current content to HTML and then uses the new manager schema to
      // convert it back into a ProsemirrorNode for compatibility with the new manager.
      const htmlString = toHTML({ node: this.state.newState.doc, schema: prevManager.schema });
      const newContent = fromHTML({ schema: this.manager.schema, content: htmlString, doc: this.doc });
      this.setContent(newContent, true);
    }

    // Handle controlled component post update handler
    if (
      this.props.onStateChange &&
      this.controlledComponentUpdateHandler &&
      this.state.newState !== newState
    ) {
      this.controlledComponentUpdateHandler(this.state.newState);
    }
  }

  /**
   * Called when the component unmounts and is responsible for cleanup
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
    const editorState = this.state.newState;
    this.view.state.plugins.forEach(plugin => {
      const state = plugin.getState(editorState);
      if (state && state.destroy) {
        state.destroy();
      }
    });
    this.view.destroy();
  }

  /**
   * Listener for editor 'blur' events
   */
  private onBlur = (event: Event) => {
    if (this.props.onBlur) {
      this.props.onBlur(this.eventListenerParams(), event);
    }
  };

  /**
   * Listener for editor 'focus' events
   */
  private onFocus = (event: Event) => {
    if (this.props.onFocus) {
      this.props.onFocus(this.eventListenerParams(), event);
    }
  };

  /**
   * Sets the content of the editor.
   *
   * @param content
   * @param triggerOnChange
   */
  private setContent = (content: RemirrorContentType, triggerOnChange = false) => {
    this.updateState(this.createStateFromContent(content), triggerOnChange);
  };

  /**
   * Clear the content of the editor (reset to the default empty node)
   *
   * @param triggerOnChange whether to notify the onChange handler that the content has been reset
   */
  private clearContent = (triggerOnChange = false) => {
    this.setContent(EMPTY_PARAGRAPH_NODE, triggerOnChange);
  };

  private baseListenerParams(state?: EditorState): BaseListenerParams {
    return {
      view: this.view,
      getHTML: this.getHTML(state),
      getJSON: this.getJSON(state),
      getObjectNode: this.getObjectNode(state),
      getText: this.getText(state),
    };
  }

  private eventListenerParams(state?: EditorState): RemirrorEventListenerParams {
    return {
      ...this.baseListenerParams(),
      state: state || this.state.newState,
    };
  }

  private editorStateEventListenerParams({
    newState,
    prevState,
  }: Partial<CompareStateParams> = {}): RemirrorStateListenerParams {
    return {
      ...this.baseListenerParams(newState),
      newState: newState || this.state.newState,
      prevState: prevState || this.state.prevState,
      createStateFromContent: this.createStateFromContent,
    };
  }

  get renderParams(): InjectedRemirrorProps {
    return {
      /* Properties */
      uid: this.uid,
      manager: this.manager,
      view: this.view,
      state: this.state,
      actions: this.manager.data.actions,

      /* Getter Methods */
      getRootProps: this.getRootProps,
      getPositionerProps: this.getPositionerProps,

      /* Setter Methods */
      clearContent: this.clearContent,
      setContent: this.setContent,
    };
  }

  private getText = (state?: EditorState) => (lineBreakDivider = '\n\n') => {
    const { doc } = state || this.state.newState;
    return doc.textBetween(0, doc.content.size, lineBreakDivider);
  };

  /**
   * Retrieve the HTML from the `doc` prosemirror node
   */
  private getHTML = (state?: EditorState) => () => {
    return toHTML({
      node: (state || this.state.newState).doc,
      schema: this.manager.data.schema,
      doc: this.doc,
    });
  };

  /**
   * Retrieve the full state json object
   */
  private getJSON = (state?: EditorState) => (): ObjectNode => {
    return (state || this.state.newState).toJSON() as ObjectNode;
  };

  /**
   * Return the json object for the prosemirror document.
   */
  private getObjectNode = (state?: EditorState) => (): ObjectNode => {
    return (state || this.state.newState).doc.toJSON() as ObjectNode;
  };

  /**
   * Create the editor state from a remirror content type.
   */
  private createStateFromContent(content: RemirrorContentType): EditorState {
    return this.manager.createState({ content, doc: this.doc, stringHandler: this.props.stringHandler });
  }

  /**
   * Checks whether this is an SSR environment and returns a child array with the SSR component
   *
   * @param children
   */
  private renderChildren(child: ReactNode) {
    const { forceEnvironment, insertPosition } = this.props;
    const children = isArray(child) ? child : [child];

    if (shouldUseDOMEnvironment(forceEnvironment)) {
      return children;
    }

    const ssrElement = this.renderSSR();
    return insertPosition === 'start' ? [ssrElement, ...children] : [...children, ssrElement];
  }

  private renderSSR() {
    return (
      <RemirrorSSR attributes={this.getAttributes()} state={this.state.newState} manager={this.manager} />
    );
  }

  private renderReactElement() {
    const element: JSX.Element | null = this.props.children({
      ...this.renderParams,
    });

    const { children, ...props } = getElementProps(element);
    // When called by a provider `getRootProps` can't actually be called until the jsx is generated.
    // So an initial check in this instance would be useless.

    if (this.rootPropsConfig.called) {
      // Simply return the element as this is never actually called within SSR (for some reason)
      return element;
    } else if (
      // Check if this is being rendered via the remirror context provider.
      // In this case `getRootProps` must be called.
      isRemirrorContextProvider(element)
    ) {
      return element.props.setChildAsRoot
        ? cloneElement(element, props, this.renderClonedElement(children))
        : element;
    } else {
      return isReactDOMElement(element) ? (
        this.renderClonedElement(element)
      ) : (
        <div {...this.internalGetRootProps()}>{this.renderChildren(element)}</div>
      );
    }
  }

  /**
   * Clones the passed element when `getRootProps` hasn't yet been called.
   *
   * @remarks
   *
   * This is used to render the children as SSR when necessary.
   */
  private renderClonedElement(element: JSX.Element) {
    const { children, ...props } = getElementProps(element);
    return cloneElement(element, this.internalGetRootProps(props), ...this.renderChildren(children));
  }

  public render() {
    // Reset the root props called status
    this.rootPropsConfig.called = false;

    return (
      <>
        {this.renderReactElement()}
        <NodeViewPortalComponent nodeViewPortalContainer={this.portalContainer} />
      </>
    );
  }
}
