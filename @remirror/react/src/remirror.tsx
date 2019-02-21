import React, { cloneElement, Component, Ref } from 'react';

import {
  baseKeymap,
  Doc,
  EditorSchema,
  ExtensionManager,
  getMarkAttrs,
  getPluginKeyState,
  MarkExtensionSpec,
  NodeExtensionSpec,
  ObjectNode,
  OffsetCalculator,
  Paragraph,
  Position,
  ProsemirrorPlugin,
  RawMenuPositionData,
  RemirrorActions,
  selectParentNode,
  ShouldRenderMenu,
  Text,
} from '@remirror/core';
import { History, Placeholder, PlaceholderPluginState } from '@remirror/core-extensions';
import { isString, memoize, pick, uniqueId } from 'lodash';
import { InputRule, inputRules, undoInputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { DOMParser, DOMSerializer, Schema } from 'prosemirror-model';
import { EditorState, PluginKey, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { RemirrorStyle, RemirrorStyleProps } from './components';
import {
  baseOffsetCalculator,
  defaultOffscreenPosition,
  defaultShouldRender,
  getAbsoluteCoordinates,
  getElementProps,
  getNearestNonTextNode,
  isAttributeFunction,
  isDOMElement,
  isObjectNode,
  isRenderProp,
  simpleOffsetCalculator,
} from './helpers';
import { defaultStyles } from './styles';
import { InjectedRemirrorProps, RemirrorEventListenerParams, RemirrorProps } from './types';

const defaultInitialContent: ObjectNode = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

export class Remirror extends Component<RemirrorProps, { editorState: EditorState }> {
  public static defaultProps = {
    initialContent: defaultInitialContent,
    extensions: [],
    editable: true,
    useBuiltInExtensions: true,
    attributes: {},
    styles: defaultStyles,
  };

  public schema: EditorSchema;
  private editorRef?: HTMLElement;
  private menuRefMap = new Map<string, HTMLElement>();

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

  private uid = uniqueId('remirror-');
  private view: EditorView<EditorSchema>;
  private extensionManager: ExtensionManager;
  private nodes: Record<string, NodeExtensionSpec>;
  private marks: Record<string, MarkExtensionSpec>;
  private plugins: ProsemirrorPlugin[];
  private keymaps: ProsemirrorPlugin[];
  private inputRules: InputRule[];
  private pasteRules: ProsemirrorPlugin[];
  private actions: RemirrorActions;
  private markAttrs: Record<string, Record<string, string>>;
  private pluginKeys: Record<string, PluginKey>;

  private get builtInExtensions() {
    return !this.props.useBuiltInExtensions
      ? []
      : [new Doc(), new Text(), new Paragraph(), new History(), new Placeholder()];
  }

  constructor(props: RemirrorProps) {
    super(props);
    this.extensionManager = this.createExtensions();
    this.nodes = this.extensionManager.nodes;
    this.marks = this.extensionManager.marks;
    this.pluginKeys = this.extensionManager.pluginKeys;
    this.schema = this.createSchema();

    const schemaParam = { schema: this.schema };
    this.plugins = this.extensionManager.plugins(schemaParam);
    this.keymaps = this.extensionManager.keymaps(schemaParam);
    this.inputRules = this.extensionManager.inputRules(schemaParam);
    this.pasteRules = this.extensionManager.pasteRules(schemaParam);

    this.state = this.createInitialState();
    this.view = this.createView();
    this.actions = this.extensionManager.actions({
      schema: this.schema,
      view: this.view,
      isEditable: () => this.props.editable,
    });
    this.markAttrs = this.setMarkAttrs();
  }

  /**
   * Create the extensions configuration through the extension manager
   */
  private createExtensions() {
    return new ExtensionManager(
      [...this.builtInExtensions, ...this.props.extensions],
      () => this.state.editorState,
    );
  }

  /**
   * Dynamically create the editor schema based on the extensions that have been passed in.
   */
  private createSchema() {
    return new Schema({
      nodes: this.nodes,
      marks: this.marks,
    });
  }

  private rootPropsConfig = {
    called: false,
    refKey: 'ref',
    suppressRefError: false,
  };

  private getRootProps: InjectedRemirrorProps['getRootProps'] = options => {
    const { refKey = 'ref', ...config } = options || {};

    this.rootPropsConfig.called = true;
    this.rootPropsConfig.refKey = refKey;
    return {
      [refKey]: this.onRef,
      ...config,
    };
  };

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
        doc: this.createDocument(this.props.initialContent),
        plugins: [
          ...this.plugins,
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
        ],
      }),
    };
  }

  private createDocument(content: string | ObjectNode) {
    if (isObjectNode(content)) {
      try {
        return this.schema.nodeFromJSON(content);
      } catch {
        return this.schema.nodeFromJSON(defaultInitialContent);
      }
    }
    if (isString(content)) {
      const element = document.createElement('div');
      element.innerHTML = content.trim();

      return DOMParser.fromSchema(this.schema).parse(element);
    }
    return null;
  }

  private createView() {
    return new EditorView<EditorSchema>(undefined, {
      state: this.state.editorState,
      dispatchTransaction: this.dispatchTransaction,
      attributes: this.getAttributes,
      editable: () => {
        return this.props.editable;
      },
    });
  }

  /**
   * This sets the attributes that wrap the outer prosemirror node.
   * It is currently used for setting the aria attributes on the content-editable prosemirror div.
   */
  private getAttributes = (state: EditorState<EditorSchema>) => {
    const { attributes } = this.props;
    const propAttributes = isAttributeFunction(attributes)
      ? attributes({ ...this.eventListenerParams, state })
      : attributes;

    const defaultAttributes = {
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-placeholder': this.props.placeholder || '',
      ...(!this.props.editable ? { 'aria-readonly': 'true' } : {}),
      'aria-label': this.props.label || '',
      class: this.uid,
    };

    return { ...defaultAttributes, ...propAttributes };
  };

  private setMarkAttrs() {
    const initialActiveNodes: Record<string, Record<string, string>> = {};
    return Object.entries(this.schema.marks).reduce(
      (attrs, [name, attr]) => ({
        ...attrs,
        [name]: getMarkAttrs(this.state.editorState, attr),
      }),
      initialActiveNodes,
    );
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
  private dispatchTransaction = (transaction: Transaction<EditorSchema>) => {
    const { onChange, dispatchTransaction } = this.props;
    if (dispatchTransaction) {
      dispatchTransaction(transaction);
    }
    const { state, transactions } = this.view.state.applyTransaction(transaction);
    this.view.updateState(state);
    this.setState({ editorState: state }, () => {
      if (transactions.some(tr => tr.docChanged) && onChange) {
        onChange({ ...this.eventListenerParams, state });
      }
    });
  };

  private onRefLoad() {
    if (!this.editorRef) {
      throw Error('Something went wrong when initializing the text editor. Please check your setup.');
    }
    const { autoFocus, onFirstRender } = this.props;
    this.editorRef.appendChild(this.view.dom);
    if (autoFocus) {
      this.view.focus();
    }
    if (onFirstRender) {
      onFirstRender(this.eventListenerParams);
    }

    this.view.dom.addEventListener('blur', this.onBlur);
    this.view.dom.addEventListener('focus', this.onFocus);

    /* For tables */
    // document.execCommand('enableObjectResizing', false);
    // document.execCommand('enableInlineTableEditing', false);
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

  private setContent = (content: string | ObjectNode, triggerOnChange = false) => {
    const editorState = EditorState.create({
      schema: this.schema,
      doc: this.createDocument(content),
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
    this.setContent(defaultInitialContent, triggerOnChange);
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
    const div = document.createElement('div');
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

  private getPluginKeyState<GState>(name: string): GState | undefined {
    return this.pluginKeys[name]
      ? getPluginKeyState(this.pluginKeys[name], this.state.editorState)
      : undefined;
  }

  private get placeholder(): RemirrorStyleProps['placeholder'] {
    const { placeholder } = this.props;
    const pluginState = this.getPluginKeyState<PlaceholderPluginState>('placeholder');
    if (placeholder && !pluginState) {
      console.error(
        'To use a placeholder you must provide a placeholder plugin (or set the prop `useBuiltInExtensions={true}`).',
      );
    }
    return placeholder && pluginState
      ? {
          text: placeholder,
          className: pluginState.emptyNodeClass,
        }
      : undefined;
  }

  public render() {
    const { children } = this.props;
    if (!isRenderProp(children)) {
      throw new Error('The child argument to the Remirror component must be a function.');
    }

    /* Reset the root props called status */
    this.rootPropsConfig.called = false;
    this.rootPropsConfig.refKey = '';

    let element: JSX.Element | null = children({
      ...this.renderParams,
    });

    if (!this.rootPropsConfig.called) {
      element = isDOMElement(element) ? (
        cloneElement(element, this.getRootProps(getElementProps(element)))
      ) : (
        <div {...this.getRootProps(getElementProps(element))}>{element}</div>
      );
    }

    return element ? (
      <>
        <RemirrorStyle uid={this.uid} placeholder={this.placeholder} styles={this.props.styles} />
        {element}
      </>
    ) : (
      element
    );
  }
}
