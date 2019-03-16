import React, { cloneElement, Component, createElement, Fragment, ReactNode, Ref } from 'react';

import { ClassNames, ClassNamesContent, Interpolation } from '@emotion/core';
import {
  createDocumentNode,
  Doc,
  EDITOR_CLASS_NAME,
  EditorSchema,
  EditorView as EditorViewType,
  EMPTY_OBJECT_NODE,
  ExtensionManager,
  getAbsoluteCoordinates,
  getMarkAttrs,
  getNearestNonTextNode,
  InputRule,
  memoize,
  NodeViewPortalContainer,
  ObjectNode,
  OffsetCalculator,
  Paragraph,
  pick,
  Position,
  ProsemirrorPlugin,
  RawMenuPositionData,
  RemirrorActions,
  RemirrorContentType,
  SchemaParams,
  ShouldRenderMenu,
  Text,
  Transaction,
  uniqueId,
} from '@remirror/core';
import { Composition, History, Placeholder, PlaceholderPluginState } from '@remirror/core-extensions';
import { createEditorView, getDoc, RemirrorSSR, shouldUseDOMEnvironment } from '@remirror/react-ssr';
import is from '@sindresorhus/is';
import { baseKeymap, selectParentNode } from 'prosemirror-commands';
import { inputRules, undoInputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { DOMSerializer } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import {
  asDefaultProps,
  baseOffsetCalculator,
  defaultOffscreenPosition,
  defaultShouldRender,
  getElementProps,
  isAttributeFunction,
  isDOMElement,
  isRenderProp,
  simpleOffsetCalculator,
  uniqueClass,
  updateChildWithKey,
} from './helpers';
import { NodeViewPortal, NodeViewPortalComponent } from './node-views';
import { defaultStyles } from './styles';
import {
  GetRootPropsConfig,
  InjectedRemirrorProps,
  PlaceholderConfig,
  RefKeyRootProps,
  RemirrorEventListenerParams,
  RemirrorProps,
  RenderPropFunction,
} from './types';

export class Remirror extends Component<RemirrorProps, { editorState: EditorState }> {
  public static defaultProps = asDefaultProps<RemirrorProps>()({
    initialContent: EMPTY_OBJECT_NODE,
    extensions: [],
    editable: true,
    usesBuiltInExtensions: true,
    attributes: {},
    usesDefaultStyles: true,
    label: '',
    editorStyles: {},
    insertPosition: 'end',
  });

  public schema: EditorSchema;
  private editorRef?: HTMLElement;
  private menuRefMap = new Map<string, HTMLElement>();

  /**
   * The uid for this instance.
   */
  private uid = uniqueId({ size: 5 });
  /**
   * A unique class added to every instance of the remirror editor. This allows for non global styling.
   */
  private view: EditorViewType;
  private extensionManager: ExtensionManager;
  private extensionPlugins: ProsemirrorPlugin[];
  private keymaps: ProsemirrorPlugin[];
  private inputRules: InputRule[];
  private pasteRules: ProsemirrorPlugin[];
  private actions: RemirrorActions;
  private markAttrs: Record<string, Record<string, string>>;
  private extensionStyles: Interpolation[];
  private portalContainer!: NodeViewPortalContainer;
  private emotionMethods!: ClassNamesContent<any>;
  private doc = getDoc();

  private get builtInExtensions() {
    return !this.props.usesBuiltInExtensions
      ? []
      : [new Composition(), new Doc(), new Text(), new Paragraph(), new History(), new Placeholder()];
  }

  private get plugins(): ProsemirrorPlugin[] {
    return [
      ...this.extensionPlugins,
      inputRules({
        rules: this.inputRules,
      }),
      ...this.pasteRules,
      ...this.keymaps,
      keymap({
        Backspace: undoInputRule,
        Escape: selectParentNode,
      }),
      keymap(baseKeymap),
    ];
  }

  constructor(props: RemirrorProps) {
    super(props);
    this.extensionManager = this.createExtensions();
    this.schema = this.extensionManager.createSchema();

    this.extensionStyles = this.extensionManager.styles(this.schemaParams);
    this.extensionPlugins = this.extensionManager.plugins(this.schemaParams);
    this.keymaps = this.extensionManager.keymaps(this.schemaParams);
    this.inputRules = this.extensionManager.inputRules(this.schemaParams);
    this.pasteRules = this.extensionManager.pasteRules(this.schemaParams);

    this.state = this.createInitialState();
    this.view = this.createView();
    this.actions = this.extensionManager.actions({
      ...this.schemaParams,
      view: this.view,
      isEditable: () => this.props.editable,
    });
    this.markAttrs = this.setMarkAttrs();
  }

  /**
   * Utility getter for accessing the schema params
   *
   * @readonly
   * @private
   */
  private get schemaParams(): SchemaParams {
    return {
      schema: this.schema,
      getEditorState: this.getEditorState,
      getPortalContainer: this.getPortalContainer,
    };
  }

  /**
   * Retrieve the editor state. This is passed through to the extension manager.
   */
  private getEditorState = () => this.state.editorState;

  /**
   * Retrieve the portal container which used for managing node views which contain react components via the portal api.
   */
  private getPortalContainer = () => this.portalContainer;

  /**
   * Create the extensions configuration through the extension manager
   */
  private createExtensions() {
    return new ExtensionManager(
      [...this.builtInExtensions, ...this.props.extensions],
      this.getEditorState,
      this.getPortalContainer,
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
    const placeholder = this.placeholder;
    const placeholderConfig = placeholder
      ? {
          selector: `.${EDITOR_CLASS_NAME} p.${placeholder.className}:first-of-type::before`,
          content: `"${placeholder.text}"`,
          style: placeholder.style,
        }
      : undefined;

    if (placeholderConfig) {
      styles.unshift({
        [placeholderConfig.selector]: { ...placeholderConfig.style, content: placeholderConfig.content },
      });
    }

    /* Inject styles from any extensions */
    styles.unshift(this.extensionStyles);

    if (this.props.usesDefaultStyles) {
      styles.unshift(defaultStyles(placeholderConfig));
    }

    return styles;
  }

  private getRootProps = <GRefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<GRefKey>,
  ): RefKeyRootProps<GRefKey> => {
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
      className: this.emotionMethods.css(this.editorStyles),
      ...config,
    } as RefKeyRootProps<GRefKey>;
  }

  private getMenuProps: InjectedRemirrorProps['getMenuProps'] = options => {
    const { refKey = 'ref', ...config } = options || {};
    const el = this.menuRefMap.get(config.name);
    return {
      ...this.calculateMenuPosition(
        config ? config.offset || {} : {},
        config.shouldRender,
        config.offscreenPosition,
        el,
      ),
      [refKey]: this.onMenuRefFactory(config.name),
    } as ReturnType<InjectedRemirrorProps['getMenuProps']>;
  };

  private onRef: Ref<HTMLElement> = ref => {
    if (ref) {
      this.editorRef = ref;
      this.onRefLoad();
    }
  };

  private onMenuRefFactory = memoize(
    (name: string): Ref<HTMLElement> => ref => {
      if (ref && this.menuRefMap.get(name) !== ref) {
        this.menuRefMap.set(name, ref);
      }
    },
  );

  private calculateMenuPosition(
    offset: OffsetCalculator,
    shouldRender: ShouldRenderMenu = defaultShouldRender,
    offscreenPosition: Partial<Position> = defaultOffscreenPosition,
    el?: HTMLElement,
  ): { position: Position; rawData: RawMenuPositionData | null; offscreen: boolean } {
    const empty = {
      position: { ...defaultOffscreenPosition, ...offscreenPosition },
      rawData: null,
      offscreen: true,
    };
    if (!this.view || !this.view.hasFocus() || !el) {
      return empty;
    }

    const { selection } = this.view.state;
    const { offsetWidth, offsetHeight, offsetParent } = el;
    const shouldRenderProps = {
      selection,
      offsetWidth,
      offsetHeight,
      emptySelection: selection.empty,
    };

    if (!shouldRender(shouldRenderProps)) {
      return empty;
    }

    const coords = this.view.coordsAtPos(selection.$anchor.pos);
    const nodeAtPosition = this.view.domAtPos(selection.anchor).node;
    const nonTextNode = pick(getNearestNonTextNode(nodeAtPosition), [
      'offsetHeight',
      'offsetLeft',
      'offsetTop',
      'offsetWidth',
    ]);

    const absCoords = getAbsoluteCoordinates(coords, offsetParent!, offsetHeight);

    const rawData = {
      ...shouldRenderProps,
      ...absCoords,
      nonTextNode,
      windowTop: coords.top,
      windowLeft: coords.left,
      windowBottom: coords.bottom,
      windowRight: coords.right,
    };

    const offsetCalculator = { ...baseOffsetCalculator, ...simpleOffsetCalculator, ...offset };

    const position = {
      top: offsetCalculator.top(rawData),
      left: offsetCalculator.left(rawData),
      right: offsetCalculator.right(rawData),
      bottom: offsetCalculator.bottom(rawData),
    };

    return {
      rawData,
      position,
      offscreen: false,
    };
  }

  private createInitialState() {
    return {
      editorState: EditorState.create({
        doc: createDocumentNode({ content: this.props.initialContent, doc: this.doc, schema: this.schema }),
        plugins: this.plugins,
      }),
    };
  }

  private createView() {
    return createEditorView(
      undefined,
      {
        state: this.state.editorState,
        dispatchTransaction: this.dispatchTransaction,
        attributes: this.getAttributes,
        editable: () => {
          return this.props.editable;
        },
      },
      this.props.forceEnvironment,
    );
  }

  /**
   * This sets the attributes that wrap the outer prosemirror node.
   * It is currently used for setting the aria attributes on the content-editable prosemirror div.
   */
  private getAttributes = (state: EditorState) => {
    const { attributes } = this.props;
    const propAttributes = isAttributeFunction(attributes)
      ? attributes({ ...this.eventListenerParams, state })
      : attributes;

    const defaultAttributes = {
      role: 'textbox',
      'aria-multiline': 'true',
      ...(this.placeholder ? { 'aria-placeholder': this.placeholder.text } : {}),
      ...(!this.props.editable ? { 'aria-readonly': 'true' } : {}),
      'aria-label': this.props.label || '',
      class: `${EDITOR_CLASS_NAME} ${uniqueClass(this.uid, 'remirror')}`,
    };

    return { ...defaultAttributes, ...propAttributes };
  };

  private setMarkAttrs() {
    const markAttrs: Record<string, Record<string, string>> = {};
    Object.entries(this.schema.marks).forEach(([name, attr]) => {
      markAttrs[name] = getMarkAttrs(this.state.editorState, attr);
    });

    return markAttrs;
  }

  /**
   * Retrieve the mark attributes.
   * @param type
   */
  public getMarkAttr(type: string) {
    return this.markAttrs[type];
  }

  /**
   * Part of the Prosemirror API and is called whenever there is state change in the editor.
   */
  private dispatchTransaction = (transaction: Transaction) => {
    const { onChange, dispatchTransaction } = this.props;
    if (dispatchTransaction) {
      dispatchTransaction(transaction);
    }
    const { state, transactions } = this.state.editorState.applyTransaction(transaction);
    this.setState({ editorState: state }, () => {
      // For some reason moving the update state here fixes a bug
      this.view.updateState(state);
      if (onChange && transactions.some(tr => tr.docChanged)) {
        onChange({ ...this.eventListenerParams, state });
      }
    });
  };

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
    const { autoFocus, onFirstRender } = this.props;
    this.addProsemirrorViewToDom(this.editorRef, this.view.dom);
    if (autoFocus) {
      this.view.focus();
    }
    if (onFirstRender) {
      onFirstRender(this.eventListenerParams);
    }

    this.view.dom.addEventListener('blur', this.onBlur);
    this.view.dom.addEventListener('focus', this.onFocus);
  }

  public componentDidUpdate(prevProps: RemirrorProps) {
    if (this.props.editable !== prevProps.editable && this.view && this.editorRef) {
      this.view.setProps({ ...this.view.props, editable: () => this.props.editable });
    }
  }

  public componentWillUnmount() {
    this.view.dom.removeEventListener('blur', this.onBlur);
    this.view.dom.removeEventListener('focus', this.onFocus);
    const editorState = this.view.state;
    this.view.state.plugins.forEach(plugin => {
      const state = plugin.getState(editorState);
      if (state && state.destroy) {
        state.destroy();
      }
    });
    this.view.destroy();
  }

  private onBlur = () => {
    if (this.props.onBlur) {
      this.props.onBlur(this.eventListenerParams);
    }
  };

  private onFocus = () => {
    if (this.props.onFocus) {
      this.props.onFocus(this.eventListenerParams);
    }
  };

  private setContent = (content: RemirrorContentType, triggerOnChange = false) => {
    const editorState = EditorState.create({
      schema: this.schema,
      doc: createDocumentNode({ content, schema: this.schema, doc: this.doc }),
      plugins: this.plugins,
    });

    const afterUpdate = () => {
      this.view.updateState(editorState);

      if (triggerOnChange && this.props.onChange) {
        this.props.onChange({ ...this.eventListenerParams, state: editorState });
      }
    };

    this.setState({ editorState }, afterUpdate);
  };

  private clearContent = (triggerOnChange = false) => {
    this.setContent(EMPTY_OBJECT_NODE, triggerOnChange);
  };

  get eventListenerParams(): RemirrorEventListenerParams {
    return {
      state: this.state.editorState,
      view: this.view,
      getHTML: this.getHTML,
      getJSON: this.getJSON,
      getDocJSON: this.getDocJSON,
      getText: this.getText,
    };
  }

  get renderParams(): InjectedRemirrorProps {
    return {
      view: this.view,
      actions: this.actions,
      getMarkAttr: this.getMarkAttr,
      clearContent: this.clearContent,
      setContent: this.setContent,
      uid: this.uid,

      /* Getters */
      getRootProps: this.getRootProps,
      getMenuProps: this.getMenuProps,
    };
  }

  private getText = (lineBreakDivider = '\n\n') => {
    const { doc } = this.state.editorState;
    return doc.textBetween(0, doc.content.size, lineBreakDivider);
  };

  private getHTML = () => {
    const div = this.doc.createElement('div');
    const fragment = DOMSerializer.fromSchema(this.schema).serializeFragment(
      this.state.editorState.doc.content,
    );

    div.appendChild(fragment);

    return div.innerHTML;
  };

  private getJSON = (): ObjectNode => {
    return this.state.editorState.toJSON() as ObjectNode;
  };

  private getDocJSON = (): ObjectNode => {
    return this.state.editorState.doc.toJSON() as ObjectNode;
  };

  private get placeholder(): PlaceholderConfig | undefined {
    const { placeholder } = this.props;
    const pluginState = this.extensionManager.getPluginState<PlaceholderPluginState>('placeholder');

    if (!pluginState) {
      if (placeholder) {
        console.error(
          'To use a placeholder you must provide a placeholder plugin (or set the prop `usesBuiltInExtensions={true}`).',
        );
      }
      return undefined;
    }

    return is.array(placeholder)
      ? {
          text: placeholder[0],
          className: pluginState.emptyNodeClass,
          style: placeholder[1],
        }
      : is.string(placeholder)
      ? { text: placeholder, className: pluginState.emptyNodeClass, style: {} }
      : undefined;
  }

  /**
   * Stores the portal container which is passed through to plugins and their node views
   *
   * @param container
   */
  private setPortalContainer(container: NodeViewPortalContainer) {
    if (!this.portalContainer) {
      this.portalContainer = container;
    }
  }

  private renderNodeViewPortal = (portalContainer: NodeViewPortalContainer) => {
    this.setPortalContainer(portalContainer);
    return <ClassNames>{this.renderProsemirrorElement(portalContainer)}</ClassNames>;
  };

  /**
   * Checks whether this is an SSR environment and returns a child array with the SSR component
   */
  private injectSSRIntoElementChildren(child: ReactNode) {
    const { forceEnvironment, insertPosition } = this.props;

    if (shouldUseDOMEnvironment(forceEnvironment)) {
      return [child];
    }
    const ssrElement = this.renderSSR();
    return insertPosition === 'start' ? [ssrElement, child] : [child, ssrElement];
  }

  private renderSSR() {
    const state = this.state.editorState;
    return (
      <RemirrorSSR
        attributes={this.getAttributes(state)}
        state={this.state.editorState}
        manager={this.extensionManager}
      />
    );
  }

  private renderReactElement(renderFunction: RenderPropFunction) {
    const element: JSX.Element | null = renderFunction({
      ...this.renderParams,
    });

    const { children: child, ...props } = getElementProps(element);

    if (!this.rootPropsConfig.called) {
      return isDOMElement(element)
        ? cloneElement(element, this.internalGetRootProps(props), ...this.injectSSRIntoElementChildren(child))
        : createElement('div', this.internalGetRootProps(), ...this.injectSSRIntoElementChildren(element));
    }
    return createElement(
      Fragment,
      {},
      ...updateChildWithKey(element, this.uid, ch => {
        return cloneElement(ch, getElementProps(ch), ...this.injectSSRIntoElementChildren(ch));
      }),
    );
  }

  private renderProsemirrorElement = (portalContainer: NodeViewPortalContainer) => (
    emotionMethods: ClassNamesContent<any>,
  ) => {
    const { children } = this.props;
    if (!isRenderProp(children)) {
      throw new Error('The child argument to the Remirror component must be a function.');
    }

    /* Cache the emotion methods */
    this.emotionMethods = emotionMethods;

    /* Reset the root props called status */
    this.rootPropsConfig.called = false;

    return (
      <>
        {this.renderReactElement(children)}
        <NodeViewPortalComponent nodeViewPortalContainer={portalContainer} />
      </>
    );
  };

  public render() {
    return <NodeViewPortal>{this.renderNodeViewPortal}</NodeViewPortal>;
  }
}
