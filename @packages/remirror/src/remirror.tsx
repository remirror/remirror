import React, { cloneElement, Component, ReactNode, Ref } from 'react';

import { isFunction, isPlainObject, isString, memoize, pick, uniqueId } from 'lodash';
import { InputRule, inputRules, undoInputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { DOMParser, DOMSerializer, Schema } from 'prosemirror-model';
import { EditorState, PluginKey, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { PlainObject } from 'simplytyped';
import { RemirrorCustomStyles, RemirrorStyle, RemirrorStyleProps } from './components';
import { baseKeymap, selectParentNode } from './config/commands';
import { Bold } from './config/marks';
import { Doc, Paragraph, Text } from './config/nodes';
import { PlaceholderPluginState } from './config/plugins';
import Placeholder from './config/plugins/placeholder';
import { ExtensionManager } from './config/utils';
import { getMarkAttrs, getPluginKeyState } from './config/utils/document-helpers';
import { Cast } from './helpers';
import { ObjectNode } from './renderer/renderer';
import { defaultStyles } from './styles';
import {
  EditorSchema,
  IExtension,
  MarkExtensionSpec,
  NodeExtensionSpec,
  OffsetCalculator,
  Position,
  ProsemirrorPlugin,
  RawMenuPositionData,
  RemirrorActions,
  ShouldRenderMenu,
} from './types';

interface State {
  editorState: EditorState;
  selectionAnchor?: number;
}

export interface GetMenuPropsConfig<T extends string = 'ref'> extends BaseGetterConfig<T> {
  offset?: OffsetCalculator;
  shouldRender?: ShouldRenderMenu;
  offscreenPosition?: Partial<Position>;
  name: string;
}

export interface BaseGetterConfig<T extends string = 'ref'> {
  refKey?: T;
}

export interface GetRootPropsConfig<T extends string = 'ref'>
  extends BaseGetterConfig<T>,
    PlainObject {}

export interface InjectedRemirrorProps {
  /**
   * The prosemirror view
   */
  view: EditorView<EditorSchema>;
  actions: RemirrorActions;
  getMarkAttr(type: string): Record<string, string>;
  clearContent(triggerOnChange?: boolean): void;
  setContent(content: string | ObjectNode, triggerOnChange?: boolean): void;

  getRootProps<T extends string = 'ref'>(
    options?: GetRootPropsConfig<T>,
  ): PlainObject & { [P in Exclude<T, 'children' | 'key'>]: React.Ref<any> };
  getMenuProps<T extends string = 'ref'>(
    options: GetMenuPropsConfig<T>,
  ): { position: Position; rawData: RawMenuPositionData | null; offscreen: boolean } & {
    [P in Exclude<T, 'children' | 'key' | 'position' | 'rawData' | 'offscreen'>]: React.Ref<any>
  };
}

export type RenderPropFunction = (params: InjectedRemirrorProps) => JSX.Element;

export interface RemirrorEventListenerParams {
  state: EditorState<EditorSchema>;
  view: EditorView<EditorSchema>;
  getHTML(): string;
  getText(lineBreakDivider?: string): string;
  getJSON(): ObjectNode;
  getDocJSON(): ObjectNode;
}

export type RemirrorEventListener = (params: RemirrorEventListenerParams) => void;
export type AttributePropFunction = (params: RemirrorEventListenerParams) => Record<string, string>;

export interface RemirrorProps {
  autoFocus?: boolean;
  placeholder?: string;
  onChange?: RemirrorEventListener;
  onFocus?: RemirrorEventListener;
  onBlur?: RemirrorEventListener;
  onFirstRender?: RemirrorEventListener;
  children: RenderPropFunction;
  dispatchTransaction?: ((tr: Transaction<EditorSchema>) => void) | null;
  initialContent: ObjectNode | string;
  attributes: Record<string, string> | AttributePropFunction;
  editable: boolean;
  label?: string;
  useBuiltInExtensions?: boolean;
  extensions: IExtension[];
  styles?: Partial<RemirrorCustomStyles> | null;
}

const defaultInitialContent: ObjectNode = {
  type: 'doc',
  content: [],
};

export class Remirror extends Component<RemirrorProps, State> {
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
      : [new Doc(), new Text(), new Paragraph(), new Bold(), new Placeholder()];
  }

  constructor(props: RemirrorProps) {
    super(props);
    this.extensionManager = this.createExtensions();
    this.nodes = this.extensionManager.nodes;
    this.marks = this.extensionManager.marks;
    this.plugins = this.extensionManager.plugins;
    this.pluginKeys = this.extensionManager.pluginKeys;
    this.schema = this.createSchema();
    this.keymaps = this.extensionManager.keymaps({ schema: this.schema });
    this.inputRules = this.extensionManager.inputRules({ schema: this.schema });
    this.pasteRules = this.extensionManager.pasteRules({ schema: this.schema });
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
      selectionAnchor: this.state.selectionAnchor!,
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
          // gapCursor(),
          // new Plugin({
          //   props: {
          //     editable: () => this.props.editable,
          //   },
          // }),
        ],
      }),
    };
  }

  private createDocument(content: string | ObjectNode) {
    if (isObjectNode(content)) {
      try {
        return this.schema.nodeFromJSON(content);
      } catch (e) {
        return this.schema.nodeFromJSON(content);
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
        [name]: getMarkAttrs(attr, this.state.editorState),
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
    console.log('Steps', transaction.steps);
    this.view.updateState(state);
    this.setState({ editorState: state }, () => {
      if (transactions.some(tr => tr.docChanged) && onChange) {
        onChange({ ...this.eventListenerParams, state });
      }
    });
  };

  private onRefLoad() {
    if (!this.editorRef) {
      throw Error(
        'Something went wrong when initializing the text editor. Please check your setup.',
      );
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

  private getPluginKeyState<T>(name: string): T | undefined {
    return this.pluginKeys[name]
      ? getPluginKeyState(this.pluginKeys[name], this.state.editorState)
      : undefined;
  }

  private get placeholder(): RemirrorStyleProps['placeholder'] {
    const { placeholder } = this.props;
    const pluginState = this.getPluginKeyState<PlaceholderPluginState>('placeholder');
    if (placeholder && !pluginState) {
      console.error(
        'To use a placeholder you must provide a placeholder plugin (or set `props.useBuiltInExtensions` to true).',
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
      element = isDOMElement(element)
        ? cloneElement(element, this.getRootProps(getElementProps(element)))
        : null;
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

const isAttributeFunction = (arg: unknown): arg is AttributePropFunction => isFunction(arg);
const isRenderProp = (arg: unknown): arg is RenderPropFunction => isFunction(arg);
const isObjectNode = (arg: unknown): arg is ObjectNode => {
  if (isPlainObject(arg) && Cast(arg).type === 'doc') {
    return true;
  }
  return false;
};
const isDOMElement = (element: ReactNode) => {
  return element && isString(Cast<JSX.Element>(element).type);
};
const getElementProps = (element: JSX.Element): PlainObject => {
  return element.props;
};

const baseOffsetCalculator: Required<OffsetCalculator> = {
  top: () => 0,
  left: () => 0,
  right: () => 0,
  bottom: () => 0,
};

export const simpleOffsetCalculator: OffsetCalculator = {
  left: props => props.left,
  top: props => props.top,
  right: props => props.right,
  bottom: props => props.bottom,
};

const defaultShouldRender: ShouldRenderMenu = props => props.selection && !props.selection.empty;
const defaultOffscreenPosition: Position = { left: -1000, top: 0, bottom: 0, right: 0 };

/**
 * We need to translate the co-ordinates because `coordsAtPos` returns co-ordinates
 * relative to `window`. And, also need to adjust the cursor container height.
 * (0, 0)
 * +--------------------- [window] ---------------------+
 * |   (left, top) +-------- [Offset Parent] --------+  |
 * | {coordsAtPos} | [Cursor]   <- cursorHeight      |  |
 * |               | [FloatingToolbar]               |  |
 */
const getAbsoluteCoordinates = (coords: Position, offsetParent: Element, cursorHeight: number) => {
  const {
    left: offsetParentLeft,
    top: offsetParentTop,
    height: offsetParentHeight,
  } = offsetParent.getBoundingClientRect();

  return {
    left: coords.left - offsetParentLeft,
    right: coords.right - offsetParentLeft,
    top: coords.top - (offsetParentTop - cursorHeight) + offsetParent.scrollTop,
    bottom:
      offsetParentHeight - (coords.top - (offsetParentTop - cursorHeight) - offsetParent.scrollTop),
  };
};

const getNearestNonTextNode = (node: Node) =>
  node.nodeType === Node.TEXT_NODE ? (node.parentNode as HTMLElement) : (node as HTMLElement);
