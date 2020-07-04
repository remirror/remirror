import { cx } from 'linaria';
import { createNanoEvents, Unsubscribe } from 'nanoevents';

import { EDITOR_CLASS_NAME, EMPTY_PARAGRAPH_NODE } from '@remirror/core-constants';
import { bool, isEmptyArray, isFunction, object, pick, uniqueId } from '@remirror/core-helpers';
import {
  EditorSchema,
  EditorState,
  EditorStateParameter,
  EditorView,
  EditorViewParameter,
  FromToParameter,
  PrimitiveSelection,
  RemirrorContentType,
  RemirrorJSON,
  RenderEnvironment,
  Selection,
  Shape,
  StateJSON,
  TextParameter,
  Transaction,
  TransactionParameter,
  TransactionTransformer,
} from '@remirror/core-types';
import {
  CreateDocumentErrorHandler,
  Fallback,
  getDocument,
  getTextSelection,
  StringHandlerParameter,
  toHtml,
} from '@remirror/core-utils';
import { DirectEditorProps } from '@remirror/pm/view';

import { UpdatableViewProps } from './builtins';
import { AnyExtensionConstructor } from './extension';
import { RemirrorManager } from './manager';
import { AnyPresetConstructor } from './preset';
import { AnyCombinedUnion, SchemaFromCombined } from './preset/preset-types';

export abstract class EditorWrapper<
  Combined extends AnyCombinedUnion,
  Props extends EditorWrapperProps<Combined>
> {
  /**
   * A unique ID for the editor which is also used as a key to pass into
   * `getRootProps`.
   */
  readonly #uid = uniqueId();

  /**
   * A method which enables retrieving the props from the editor.
   */
  #getProps: () => Props;

  /**
   * The private reference to the previous state.
   */
  #previousState: EditorState<SchemaFromCombined<Combined>> | undefined;

  /**
   * True when this is the first render.
   */
  #firstRender = true;

  /**
   * The event listener which allows consumers to subscribe to the different
   * events without using props.
   */
  #events = createNanoEvents<Events<Combined>>();

  /**
   * The updatable view props.
   */
  protected get updatableViewProps(): UpdatableViewPropsObject {
    return {
      attributes: () => this.getAttributes(),
      editable: () => this.props.editable ?? true,
      nodeViews: this.manager.store.nodeViews,
    };
  }

  /**
   * The props passed in when creating or updating the `EditorWrapper` instance.
   */
  protected get props(): Props {
    return this.#getProps();
  }

  /**
   * Returns the previous editor state. On the first render it defaults to
   * returning the current state. For the first render the previous state and
   * current state will always be equal.
   */
  protected get previousState(): EditorState<SchemaFromCombined<Combined>> {
    return this.#previousState ?? this.view.state;
  }

  /**
   * Create the editor state from a remirror content type. This should be passed
   * in during initialization.
   */
  private createStateFromContent: CreateStateFromContent<Combined>;

  /**
   * A utility for quickly retrieving the extension manager.
   */
  protected get manager(): RemirrorManager<Combined> {
    return this.props.manager;
  }

  /**
   * The prosemirror EditorView.
   */
  protected get view(): EditorView<SchemaFromCombined<Combined>> {
    return this.manager.view;
  }

  /**
   * The document to use when rendering.
   */
  protected get doc() {
    return getDocument(this.props.forceEnvironment);
  }

  protected get uid() {
    return this.#uid;
  }

  readonly #getExtension: <ExtensionConstructor extends AnyExtensionConstructor>(
    Constructor: ExtensionConstructor,
  ) => InstanceType<ExtensionConstructor>;

  readonly #getPreset: <PresetConstructor extends AnyPresetConstructor>(
    Constructor: PresetConstructor,
  ) => InstanceType<PresetConstructor>;

  constructor(parameter: EditorWrapperParameter<Combined, Props>) {
    const { getProps, createStateFromContent, initialEditorState, element } = parameter;

    this.#getProps = getProps;
    this.createStateFromContent = createStateFromContent;

    // Create the ProsemirrorView and initialize our editor manager with it.
    const view = this.createView(initialEditorState, element);
    this.manager.addView(view);

    // Add the getters
    this.#getExtension = this.manager.getExtension.bind(this.manager);
    this.#getPreset = this.manager.getPreset.bind(this.manager);
  }

  /**
   * Update the constructor props passed in. Useful for frameworks like react
   * where props are constantly changing.
   */
  update(parameter: EditorWrapperParameter<Combined, Props>) {
    const { getProps, createStateFromContent } = parameter;
    this.#getProps = getProps;
    this.createStateFromContent = createStateFromContent;

    return this;
  }

  /**
   * Retrieve the editor state. This is passed through to the extension manager.
   */
  protected readonly getState = () => this.view.state;

  /**
   * Create the prosemirror editor view.
   */
  protected abstract createView(
    state: EditorState<SchemaFromCombined<Combined>>,
    element?: Element,
  ): EditorView<SchemaFromCombined<Combined>>;

  /**
   * Update the view props.
   */
  protected updateViewProps(...keys: UpdatableViewProps[]) {
    const props = pick(this.updatableViewProps, keys);

    this.view.setProps({ ...this.view.props, ...props });
  }

  /**
   * This sets the attributes for the prosemirror dom node..
   */
  protected getAttributes(ssr?: false): Record<string, string>;
  protected getAttributes(ssr: true): Shape;
  protected getAttributes(ssr?: boolean) {
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
      ...(!(this.props.editable ?? true) ? { 'aria-readonly': 'true' } : {}),
      'aria-label': this.props.label ?? '',
      ...managerAttributes,
      class: cx(ssr && 'Prosemirror', EDITOR_CLASS_NAME, managerAttributes?.class),
    };

    return { ...defaultAttributes, ...propertyAttributes } as Shape;
  }

  /**
   * Part of the Prosemirror API and is called whenever there is state change in
   * the editor.
   *
   * @internalremarks
   * How does it work when transactions are dispatched one after the other.
   */
  protected readonly dispatchTransaction = (tr: Transaction) => {
    if (this.manager.destroyed) {
      // TODO: this should be made to never happen.
      return;
    }

    tr = this.props.onDispatchTransaction?.(tr, this.getState()) ?? tr;

    const previousState = this.getState();
    const { state, transactions } = previousState.applyTransaction(tr);

    this.#previousState = previousState;

    // Use the abstract method to update the state.
    this.updateState({ state, tr, transactions });

    // Update the view props when an update is requested
    const forcedUpdates = this.manager.store.getForcedUpdates(tr);

    if (!isEmptyArray(forcedUpdates)) {
      this.updateViewProps(...this.manager.store.getForcedUpdates(tr));
    }
  };

  /**
   * Updates the state either by calling onStateChange when it exists or
   * directly setting the internal state via a `setState` call.
   */
  protected abstract updateState(
    parameter: UpdateStateParameter<SchemaFromCombined<Combined>>,
  ): void;

  /**
   * Add `onBlur` and `onFocus` listeners.
   */
  protected addFocusListeners() {
    this.view.dom.addEventListener('blur', this.onBlur);
    this.view.dom.addEventListener('focus', this.onFocus);
  }

  /**
   * Remove `onBlur` and `onFocus` listeners.
   */
  protected removeFocusListeners() {
    this.view.dom.removeEventListener('blur', this.onBlur);
    this.view.dom.removeEventListener('focus', this.onFocus);
  }

  /**
   * Called when the component unmounts and is responsible for cleanup.
   *
   * @remarks
   *
   * - Removes listeners for the editor `blur` and `focus` events
   * - Destroys the state for each plugin
   * - Destroys the prosemirror view
   */
  onDestroy() {
    const editorState = this.getState();

    this.view.state.plugins.forEach((plugin) => {
      const state = plugin.getState(editorState);
      if (state?.destroy) {
        state.destroy();
      }
    });

    this.removeFocusListeners();
    this.view.destroy();
  }

  /**
   * Use this method in the `onUpdate` event to run all change handlers.
   */
  readonly onChange = ({ tr, state }: ListenerParameter<Combined> = object()) => {
    const parameter = this.eventListenerParameter({ tr, state });

    this.props.onChange?.(parameter);
    this.#events.emit('change', parameter);

    if (this.#firstRender) {
      this.#firstRender = false;
    }
  };

  /**
   * Listener for editor 'blur' events
   */
  private readonly onBlur = (event: Event) => {
    const parameter = this.eventListenerParameter();

    this.props.onBlur?.(parameter, event);
    this.#events.emit('blur', parameter, event);
  };

  /**
   * Listener for editor 'focus' events
   */
  private readonly onFocus = (event: Event) => {
    const parameter = this.eventListenerParameter();

    this.props.onFocus?.(parameter, event);
    this.#events.emit('focus', parameter, event);
  };

  /**
   * Sets the content of the editor.
   *
   * @param content
   * @param triggerChange
   */
  private readonly setContent = (
    content: RemirrorContentType,
    { triggerChange = false }: TriggerChangeParameter = {},
  ) => {
    const state = this.createStateFromContent(content);
    this.updateState({ state, triggerChange });
  };

  /**
   * Clear; the content of the editor (reset to the default empty node)
   *
   * @param triggerChange - whether to notify the onChange handler that the
   * content has been reset
   */
  private readonly clearContent = ({ triggerChange = false }: TriggerChangeParameter = {}) => {
    const { onError } = this.props;
    const content = isFunction(onError) ? onError() : onError ?? EMPTY_PARAGRAPH_NODE;

    this.setContent(content, { triggerChange });
  };

  /**
   * The params used in the event listeners and the state listener
   */
  protected baseListenerParameter(
    parameter: ListenerParameter<Combined>,
  ): BaseListenerParameter<Combined> {
    const { state, tr } = parameter;

    return {
      tr,
      internalUpdate: !tr,
      view: this.view,
      getHTML: this.getHTML(state),
      getJSON: this.getJSON(state),
      getRemirrorJSON: this.getRemirrorJSON(state),
      getText: this.getText(state),
    };
  }

  /**
   * Creates the parameters passed into all event listener handlers.
   * e.g. `onChange`
   */
  protected eventListenerParameter(
    parameter: ListenerParameter<Combined> = object(),
  ): RemirrorEventListenerParameter<Combined> {
    const { state, tr } = parameter;

    return {
      firstRender: this.#firstRender,
      ...this.baseListenerParameter({ tr, state }),
      state: state ?? this.getState(),
      createStateFromContent: this.createStateFromContent,
      previousState: this.previousState,
    };
  }

  /**
   * Set the focus for the editor.
   */
  protected readonly focus = (position?: FocusType) => {
    if (position === false) {
      return;
    }

    if (this.view.hasFocus() && (position === undefined || position === true)) {
      return;
    }

    const { selection, doc, tr } = this.getState();
    const { from = 0, to = from } = selection;

    if (position === undefined || position === true) {
      position = { from, to };
    }

    this.dispatchSelection(tr, getTextSelection(position, doc));
  };

  /**
   * Dispatch the text selection
   */
  private dispatchSelection(tr: Transaction, selection: Selection) {
    // Set the selection to the requested value
    const transaction = tr.setSelection(selection);
    this.view.dispatch(transaction);

    // Wait for the next event loop to set the focus.
    requestAnimationFrame(() => this.view.focus());
  }

  get editorWrapperOutput(): EditorWrapperOutput<Combined> {
    return {
      ...this.manager.store,
      addHandler: this.#events.on.bind(this.#events),

      /* Properties */
      uid: this.#uid,
      manager: this.manager,
      view: this.view,

      /* Getter Methods */
      getState: this.getState,
      getExtension: this.#getExtension,
      getPreset: this.#getPreset,

      /* Setter Methods */
      clearContent: this.clearContent,
      setContent: this.setContent,

      /* Helper Methods */
      focus: this.focus,
    };
  }

  private readonly getText = (state?: EditorState<SchemaFromCombined<Combined>>) => (
    lineBreakDivider = '\n\n',
  ) => {
    const { doc } = state ?? this.getState();
    return doc.textBetween(0, doc.content.size, lineBreakDivider);
  };

  /**
   * Retrieve the HTML from the `doc` prosemirror node
   */
  private readonly getHTML = (state?: EditorState<SchemaFromCombined<Combined>>) => () => {
    return toHtml({
      node: (state ?? this.getState()).doc,
      schema: this.manager.store.schema,
      doc: this.doc,
    });
  };

  /**
   * Retrieve the full state json object
   */
  private readonly getJSON = (
    state?: EditorState<SchemaFromCombined<Combined>>,
  ) => (): StateJSON => {
    return (state ?? this.getState()).toJSON() as StateJSON;
  };

  /**
   * Return the json object for the prosemirror document.
   */
  private readonly getRemirrorJSON = (
    state?: EditorState<SchemaFromCombined<Combined>>,
  ) => (): RemirrorJSON => {
    return (state ?? this.getState()).doc.toJSON() as RemirrorJSON;
  };
}

export interface EditorWrapperParameter<
  Combined extends AnyCombinedUnion,
  Props extends EditorWrapperProps<Combined>
> {
  /**
   * The initial editor state
   */
  initialEditorState: EditorState<SchemaFromCombined<Combined>>;

  /**
   * A method for getting the passed in props.
   */
  getProps: () => Props;

  /**
   * A custom method for creating a prosemirror state from content. It allows
   * users to manage controlled editors more easily.
   */
  createStateFromContent: CreateStateFromContent<Combined>;

  /**
   * When provided the view will immediately be inserted into the dom within
   * this element.
   */
  element?: Element;
}

/**
 * The type of arguments acceptable for the focus parameter.
 *
 * - Can be a prosemirror selection
 * - A range of `{ from: number; to: number }`
 * - A single position with a `number`
 * - A string of `'start' | 'end'`
 * - `true` which sets the focus to the current position or start.
 */
export type FocusType = PrimitiveSelection | boolean;

/**
 * The base options for an editor wrapper. This is used within the react and dom
 * implementations.
 */
export interface EditorWrapperProps<Combined extends AnyCombinedUnion>
  extends StringHandlerParameter {
  /**
   * Pass in the extension manager.
   *
   * The manager is responsible for handling all Prosemirror related
   * functionality.
   *
   * TODO - why does this only work as `any`.
   */
  manager: RemirrorManager<any>;

  /**
   * Set the starting value object of the editor.
   *
   * Without setting onStateChange remirror renders as an uncontrolled
   * component. Value changes are passed back out of the editor and there is now
   * way to set the value via props. As a result this is the only opportunity to
   * directly control the rendered text.
   *
   * @defaultValue `{ type: 'doc', content: [{ type: 'paragraph' }] }`
   */
  initialContent?: RemirrorContentType | [RemirrorContentType, PrimitiveSelection];

  /**
   * Adds attributes directly to the prosemirror element.
   *
   * @defaultValue `{}`
   */
  attributes?: Record<string, string> | AttributePropFunction<Combined>;

  /**
   * Determines whether this editor is editable or not.
   *
   * @defaultValue true
   */
  editable?: boolean;

  /**
   * When set to true focus will be place on the editor as soon as it first
   * loads.
   *
   * @defaultValue false
   */
  autoFocus?: FocusType;

  /**
   * An event listener which is called whenever the editor gains focus.
   */
  onFocus?: (params: RemirrorEventListenerParameter<Combined>, event: Event) => void;

  /**
   * An event listener which is called whenever the editor is blurred.
   */
  onBlur?: (params: RemirrorEventListenerParameter<Combined>, event: Event) => void;

  /**
   * Called on every change to the Prosemirror state.
   */
  onChange?: RemirrorEventListener<Combined>;

  /**
   * A method called when the editor is dispatching the transaction.
   *
   * @remarks
   * Use this to update the transaction which will be used to update the editor
   * state.
   */
  onDispatchTransaction?: TransactionTransformer<SchemaFromCombined<Combined>>;

  /**
   * Sets the accessibility label for the editor instance.
   *
   * @defaultValue ''
   */
  label?: string;

  /**
   * By default remirror will work out whether this is a dom environment or
   * server environment for SSR rendering. You can override this behaviour here
   * when required.
   */
  forceEnvironment?: RenderEnvironment;

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
   * https://reactjs.org/docs/dom-elements.html#suppresshydrationwarning.
   */
  suppressHydrationWarning?: boolean;

  /**
   * The value to use for empty content, or content with an error..
   *
   * This is the value used for an empty editor or when `resetContent` is
   * called.
   *
   * @defaultValue EMPTY_PARAGRAPH_NODE
   */
  onError?: Fallback | CreateDocumentErrorHandler;
}

/**
 * These are the props passed to the render function provided when setting up
 * your editor.
 */
export interface EditorWrapperOutput<Combined extends AnyCombinedUnion>
  extends Remirror.ManagerStore<Combined> {
  /**
   * An instance of the extension manager
   */
  manager: RemirrorManager<Combined>;

  /**
   * Add event handlers to the remirror editor at runtime.
   */
  addHandler: <Key extends keyof Events<Combined>>(
    event: Key,
    cb: Events<Combined>[Key],
  ) => Unsubscribe;

  /**
   * The unique id for the editor instance.
   */
  uid: string;

  /**
   * Clears all editor content.
   *
   * @param options - includes a `triggerChange` handler which should be
   * triggered by the update.
   */
  clearContent: (options?: TriggerChangeParameter) => void;

  /**
   * Replace all editor content with the new content.
   *
   * @remarks
   *
   * Allows for the editor content to be overridden by force.
   *
   * @param triggerOnChange - whether the `onChange` handler should be triggered
   * by the update. Defaults to `false`
   */
  setContent: (content: RemirrorContentType, options?: TriggerChangeParameter) => void;

  /**
   * Focus the editor at the `start` | `end` a specific position or at a valid
   * range between `{ from, to }`.
   */
  focus: (position?: FocusType) => void;

  /**
   * A getter function for the current editor state. It's a wrapper around
   * `view.state`.
   */
  getState: () => EditorState<SchemaFromCombined<Combined>>;

  /**
   * Get an extension by it's constructor.
   */
  getExtension: <ExtensionConstructor extends AnyExtensionConstructor>(
    Constructor: ExtensionConstructor,
  ) => InstanceType<ExtensionConstructor>;

  /**
   * Get an extension by it's constructor.
   */
  getPreset: <PresetConstructor extends AnyPresetConstructor>(
    Constructor: PresetConstructor,
  ) => InstanceType<PresetConstructor>;
}

export interface RemirrorGetterParameter {
  /**
   * Get the current HTML from the latest editor state.
   */
  getHTML: () => string;

  /**
   * Get the current raw text from the latest editor state.
   *
   * @param lineBreakDivider - the divider to use for new lines defaults to
   * '\n\n'
   */
  getText: (lineBreakDivider?: string) => string;

  /**
   * Get the full JSON representation of the state (including the selection
   * information)
   */
  getJSON: () => StateJSON;

  /**
   * Get a representation of the editor content as an ObjectNode which can be
   * used to set content for and editor.
   */
  getRemirrorJSON: () => RemirrorJSON;
}

export interface BaseListenerParameter<Combined extends AnyCombinedUnion>
  extends EditorViewParameter<SchemaFromCombined<Combined>>,
    RemirrorGetterParameter {
  /**
   * The original transaction which caused this state update.
   *
   * This allows for inspecting the reason behind the state change. When
   * undefined this means that the state was updated externally.
   *
   * If available:
   * - Metadata on the transaction can be inspected. `tr.getMeta`
   * - Was the change caused by added / removed content? `tr.docChanged`
   * - Was ths change caused by an updated selection? `tr.selectionSet`
   * - `tr.steps` can be inspected for further granularity.
   */
  tr?: Transaction<SchemaFromCombined<Combined>>;

  /**
   * A shorthand way of checking whether the update was triggered by editor
   * usage (internal) or overwriting the state.
   *
   * - `true` The update was triggered by a change in the prosemirror doc or an
   *   update to the selection. In these cases `tr` will have a value.
   * - `false` The update was caused by a call to `setContent` or `resetContent`
   */
  internalUpdate: boolean;
}

export type CreateStateFromContent<Combined extends AnyCombinedUnion> = (
  content: RemirrorContentType,
  selection?: FromToParameter,
) => EditorState<SchemaFromCombined<Combined>>;

export interface RemirrorEventListenerParameter<Combined extends AnyCombinedUnion>
  extends EditorStateParameter<SchemaFromCombined<Combined>>,
    BaseListenerParameter<Combined> {
  /**
   * True when this is the first render of the editor. This applies when the
   * editor is first attached to the DOM.
   */
  firstRender: boolean;

  /**
   * The previous state.
   */
  previousState: EditorState<SchemaFromCombined<Combined>>;

  /**
   * Manually create a new state object with the desired content.
   */
  createStateFromContent: CreateStateFromContent<Combined>;
}

export type RemirrorEventListener<Combined extends AnyCombinedUnion> = (
  params: RemirrorEventListenerParameter<Combined>,
) => void;

export type AttributePropFunction<Combined extends AnyCombinedUnion> = (
  params: RemirrorEventListenerParameter<Combined>,
) => Record<string, string>;

export interface PlaceholderConfig extends TextParameter {
  className: string;
}

export interface UpdateStateParameter<Schema extends EditorSchema = any>
  extends Partial<TransactionParameter<Schema>>,
    EditorStateParameter<Schema>,
    TriggerChangeParameter {
  /**
   * When the state updates are not controlled and it was a transaction that
   * caused the state to be updated this value captures all the transaction
   * updates caused by prosemirror plugins hook state methods like
   * `filterTransactions` and `appendTransactions`.
   *
   * This is for advanced users only, and I personally have never needed it.
   */
  transactions?: Array<Transaction<Schema>>;
}

export interface TriggerChangeParameter {
  /**
   * Whether or not to trigger this as a change and call any handlers.
   *
   * @defaultValue true
   */
  triggerChange?: boolean;
}

export interface ListenerParameter<Combined extends AnyCombinedUnion>
  extends Partial<EditorStateParameter<SchemaFromCombined<Combined>>>,
    Partial<TransactionParameter<SchemaFromCombined<Combined>>> {}

interface Events<Combined extends AnyCombinedUnion> {
  /**
   * An event listener which is called whenever the editor gains focus.
   */
  focus: (params: RemirrorEventListenerParameter<Combined>, event: Event) => void;

  /**
   * An event listener which is called whenever the editor is blurred.
   */
  blur: (params: RemirrorEventListenerParameter<Combined>, event: Event) => void;

  /**
   * Called on every change to the Prosemirror state.
   */
  change: RemirrorEventListener<Combined>;
}

type UpdatableViewPropsObject = { [Key in UpdatableViewProps]: DirectEditorProps[Key] };
