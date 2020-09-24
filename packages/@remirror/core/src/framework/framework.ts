import { cx } from 'linaria';
import { createNanoEvents } from 'nanoevents';

import { EDITOR_CLASS_NAME, ErrorConstant } from '@remirror/core-constants';
import {
  invariant,
  isEmptyArray,
  isFunction,
  isNumber,
  object,
  pick,
  uniqueId,
} from '@remirror/core-helpers';
import type {
  EditorState,
  EditorView,
  RemirrorContentType,
  RemirrorJSON,
  Selection,
  Shape,
  StateJSON,
  Transaction,
} from '@remirror/core-types';
import { getDocument, getTextSelection, isElementDomNode, toHtml } from '@remirror/core-utils';

import type { UpdatableViewProps } from '../builtins';
import type { RemirrorManager } from '../manager';
import type { AnyCombinedUnion, SchemaFromCombined } from '../preset/preset-types';
import type { StateUpdateLifecycleParameter } from '../types';
import type {
  BaseFramework,
  BaseListenerParameter,
  CreateStateFromContent,
  FocusType,
  FrameworkEvents,
  FrameworkOutput,
  FrameworkParameter,
  FrameworkProps,
  ListenerParameter,
  RemirrorEventListenerParameter,
  TriggerChangeParameter,
  UpdatableViewPropsObject,
  UpdateStateParameter,
} from './base-framework';

/**
 * This is the `Framework` class which is used to create an abstract class for
 * implementing `Remirror` into the framework of your choice.
 *
 * The best way to learn how to use it is to take a look at the [[`DomFramework`]]
 * and [[`ReactFramework`]] implementations.
 *
 * @remarks
 *
 * There are two methods and one getter property which must be implemented for this
 */
export abstract class Framework<
  Combined extends AnyCombinedUnion,
  Props extends FrameworkProps<Combined>,
  Output extends FrameworkOutput<Combined>
> implements BaseFramework<Combined> {
  /**
   * A unique ID for the editor which can also be used as a key in frameworks
   * that need it.
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
   * A previous state that can be overridden by the framework implementation.
   */
  protected previousStateOverride?: EditorState<SchemaFromCombined<Combined>>;

  /**
   * True when this is the first render.
   */
  #firstRender = true;

  /**
   * The event listener which allows consumers to subscribe to the different
   * events taking place in the editor. Events currently supported are:
   *
   * - `destroy`
   * - `focus`
   * - `blur`
   * - `updated`
   */
  #events = createNanoEvents<FrameworkEvents<Combined>>();

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
   * True when this is the first render of the editor.
   */
  protected get firstRender(): boolean {
    return this.#firstRender;
  }

  /**
   * Store the name of the framework.
   */
  abstract get name(): string;

  /**
   * The props passed in when creating or updating the `Framework` instance.
   */
  get props(): Props {
    return this.#getProps();
  }

  /**
   * Returns the previous editor state. On the first render it defaults to
   * returning the current state. For the first render the previous state and
   * current state will always be equal.
   */
  protected get previousState(): EditorState<SchemaFromCombined<Combined>> {
    return this.previousStateOverride ?? this.#previousState ?? this.initialEditorState;
  }

  /**
   * Create the editor state from a `remirror` content type. This should be
   * passed in during initialization.
   */
  private createStateFromContent: CreateStateFromContent<Combined>;

  /**
   * The instance of the [[`RemirrorManager`]].
   */
  protected get manager(): RemirrorManager<Combined> {
    return this.props.manager;
  }

  /**
   * The ProseMirror [[`EditorView`]].
   */
  protected get view(): EditorView<SchemaFromCombined<Combined>> {
    return this.manager.view;
  }

  /**
   * The document to use for rendering and outputting HTML.
   */
  protected get document(): Document {
    return getDocument(this.props.forceEnvironment);
  }

  /**
   * A unique id for the editor. Can be used to differentiate between editors.
   *
   * Please note that this ID is only locally unique, it should not be used as a
   * database key.
   */
  protected get uid(): string {
    return this.#uid;
  }

  #initialEditorState: EditorState<SchemaFromCombined<Combined>>;

  /**
   * The initial editor state from when the editor was first created.
   */
  get initialEditorState(): EditorState<SchemaFromCombined<Combined>> {
    return this.#initialEditorState;
  }

  constructor(parameter: FrameworkParameter<Combined, Props>) {
    const { getProps, createStateFromContent, initialEditorState, element } = parameter;

    this.#getProps = getProps;
    this.createStateFromContent = createStateFromContent;
    this.#initialEditorState = initialEditorState;

    // Attach the framework instance to the manager. The manager will set up the
    // update listener and manage updates to the instance of the framework
    // automatically.
    this.manager.attachFramework(this, this.updateListener.bind(this));

    if (this.manager.view) {
      return;
    }

    // Create the ProsemirrorView and initialize our editor manager with it.
    const view = this.createView(initialEditorState, element);
    this.manager.addView(view);
  }

  /**
   * Setup the manager event listeners which are disposed of when the manager is
   * destroyed.
   */
  private updateListener(parameter: StateUpdateLifecycleParameter) {
    const { state, tr } = parameter;
    return this.#events.emit('updated', this.eventListenerParameter({ state, tr }));
  }

  /**
   * Update the constructor props passed in. Useful for frameworks like react
   * where props are constantly changing and when using hooks function closures
   * can become stale.
   *
   * You can call the update method with the new `props` to update the internal
   * state of this instance.
   */
  update(parameter: FrameworkParameter<Combined, Props>): this {
    const { getProps, createStateFromContent } = parameter;
    this.#getProps = getProps;
    this.createStateFromContent = createStateFromContent;

    return this;
  }

  /**
   * Retrieve the editor state.
   */
  protected readonly getState = (): EditorState<SchemaFromCombined<Combined>> =>
    this.view.state ?? this.initialEditorState;

  /**
   * Retrieve the previous editor state.
   */
  protected readonly getPreviousState = (): EditorState<SchemaFromCombined<Combined>> =>
    this.previousState;

  /**
   * This method must be implement by the extending framework class. It returns
   * an [[`EditorView`]] which is added to the [[`RemirrorManager`]].
   */
  protected abstract createView(
    state: EditorState<SchemaFromCombined<Combined>>,
    element?: Element,
  ): EditorView<SchemaFromCombined<Combined>>;

  /**
   * This is used to implement how the state updates are used within your
   * application instance.
   *
   * It must be implemented.
   */
  protected abstract updateState(
    parameter: UpdateStateParameter<SchemaFromCombined<Combined>>,
  ): void;

  /**
   * Update the view props.
   */
  protected updateViewProps(...keys: UpdatableViewProps[]): void {
    const props = pick(this.updatableViewProps, keys);

    this.view.setProps({ ...this.view.props, ...props });
  }

  /**
   * This sets the attributes for the ProseMirror Dom node.
   */
  protected getAttributes(ssr?: false): Record<string, string>;
  protected getAttributes(ssr: true): Shape;
  protected getAttributes(ssr?: boolean): Shape {
    const { attributes, autoFocus } = this.props;
    const managerAttributes = this.manager.store?.attributes;

    // The attributes which were passed in as props.
    const propAttributes = isFunction(attributes)
      ? attributes(this.eventListenerParameter())
      : attributes;

    // Whether or not the editor is focused.
    let focus: Shape = {};

    // In Chrome 84 when autofocus is set to any value including `"false"` it
    // will actually trigger the autofocus. This check makes sure there is no
    // `autofocus` attribute attached unless `autoFocus` is expressly a truthy
    // value.
    if (autoFocus || isNumber(autoFocus)) {
      focus = ssr ? { autoFocus: true } : { autofocus: 'true' };
    }

    const defaultAttributes = {
      role: 'textbox',
      ...focus,
      'aria-multiline': 'true',
      ...(!(this.props.editable ?? true) ? { 'aria-readonly': 'true' } : {}),
      'aria-label': this.props.label ?? '',
      ...managerAttributes,
      class: cx(ssr && 'Prosemirror', EDITOR_CLASS_NAME, managerAttributes?.class),
    };

    return { ...defaultAttributes, ...propAttributes } as Shape;
  }

  /**
   * Part of the Prosemirror API and is called whenever there is state change in
   * the editor.
   *
   * @internalremarks
   * How does it work when transactions are dispatched one after the other.
   */
  protected readonly dispatchTransaction = (tr: Transaction): void => {
    // This should never happen, but it may have slipped through in the certain places.
    invariant(!this.manager.destroyed, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        'A transaction was dispatched to a manager that has already been destroyed. Please check your set up, or open an issue.',
    });

    tr = this.props.onDispatchTransaction?.(tr, this.getState()) ?? tr;

    const previousState = this.getState();
    const { state, transactions } = previousState.applyTransaction(tr);

    this.#previousState = previousState;

    // Use the abstract method to update the state.
    this.updateState({ state, tr, transactions });

    // Update the view props when an update is requested
    const forcedUpdates = this.manager.store.getForcedUpdates(tr);

    if (!isEmptyArray(forcedUpdates)) {
      this.updateViewProps(...forcedUpdates);
    }
  };

  /**
   * Adds `onBlur` and `onFocus` listeners.
   *
   * When extending this class make sure to call this method once
   * `ProsemirrorView` has been added to the dom.
   */
  protected addFocusListeners(): void {
    this.view.dom.addEventListener('blur', this.onBlur);
    this.view.dom.addEventListener('focus', this.onFocus);
  }

  /**
   * Remove `onBlur` and `onFocus` listeners.
   *
   * When extending this class in your framework, make sure to call this just
   * before the view is destroyed.
   */
  protected removeFocusListeners(): void {
    this.view.dom.removeEventListener('blur', this.onBlur);
    this.view.dom.removeEventListener('focus', this.onFocus);
  }

  /**
   * Called when the component unmounts and is responsible for cleanup.
   *
   * @remarks
   *
   * - Removes listeners for the editor `blur` and `focus` events
   */
  destroy(): void {
    // Let it clear that this instance has been destroyed.
    this.#events.emit('destroy');

    if (this.view) {
      // Remove the focus and blur listeners.
      this.removeFocusListeners();
    }
  }

  /**
   * Use this method in the `onUpdate` event to run all change handlers.
   */
  readonly onChange = (parameter: ListenerParameter<Combined> = object()): void => {
    this.props.onChange?.(this.eventListenerParameter(parameter));

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
   * Clear the content of the editor (reset to the default empty node).
   *
   * @param triggerChange - whether to notify the onChange handler that the
   * content has been reset
   */
  private readonly clearContent = ({ triggerChange = false }: TriggerChangeParameter = {}) => {
    this.setContent(this.manager.createEmptyDoc(), { triggerChange });
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
   * Creates the parameters passed into all event listener handlers. e.g.
   * `onChange`
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
  protected readonly focus = (position?: FocusType): void => {
    if (position === false) {
      return;
    }

    if (this.view.hasFocus() && (position === undefined || position === true)) {
      return;
    }

    // By using the transaction which is shared by all the commands we can make
    // the focus method, chainable.
    const { tr } = this.manager;
    const { selection, doc } = tr;
    const { from = 0, to = from } = selection;

    if (position === undefined || position === true) {
      position = { from, to };
    }

    this.dispatchSelection(tr, getTextSelection(position, doc));
  };

  /**
   * Remove the focus from the editor. If the editor is not focused it will do
   * nothing.
   */
  protected readonly blur = (): void => {
    const { dom } = this.view;

    if (!this.view.hasFocus()) {
      return;
    }

    if (!isElementDomNode(dom)) {
      return;
    }

    dom.blur();
  };

  /**
   * Dispatch the text selection
   */
  private dispatchSelection(tr: Transaction, selection: Selection) {
    // Set the selection to the requested value
    const transaction = tr.setSelection(selection);
    this.view.dispatch(transaction);

    // Wait for the next event loop to set the focus.
    requestAnimationFrame(() => {
      // Use the built in focus method to refocus the editor.
      this.view.focus();

      // This has to be called again in order for Safari to scroll into view
      // after the focus. Perhaps there's a better way though or maybe place
      // behind a flag.
      this.view.dispatch(this.manager.tr);
    });
  }

  /**
   * Methods and properties which are made available to all consumers of the
   * `Framework` class.
   */
  protected get baseOutput(): FrameworkOutput<Combined> {
    return {
      ...this.manager.store,
      addHandler: this.#events.on.bind(this.#events),

      /* Properties */
      uid: this.#uid,
      view: this.view,

      /* Getter Methods */
      getState: this.getState,
      getPreviousState: this.getPreviousState,
      getExtension: this.manager.getExtension.bind(this.manager),
      getPreset: this.manager.getPreset.bind(this.manager),

      /* Setter Methods */
      clearContent: this.clearContent,
      setContent: this.setContent,

      /* Helper Methods */
      focus: this.focus,
      blur: this.blur,
    };
  }

  /**
   * Every framework implementation must provide it's own custom output.
   */
  abstract get frameworkOutput(): Output;

  /**
   * A method to get all the content in the editor as text. Depending on the
   * content in your editor, it is not guaranteed to preserve it 100%, so it's
   * best to test that it meets your needs before consuming.
   */
  private readonly getText = (state?: EditorState<SchemaFromCombined<Combined>>) => (
    lineBreakDivider = '\n\n',
  ) => {
    const { doc } = state ?? this.getState();
    return doc.textBetween(0, doc.content.size, lineBreakDivider);
  };

  /**
   * Retrieve the HTML from the `doc` prosemirror node.
   *
   * This assumes a dom environment.
   */
  private readonly getHTML = (state?: EditorState<SchemaFromCombined<Combined>>) => () => {
    return toHtml({
      node: (state ?? this.getState()).doc,
      schema: this.manager.store.schema,
      document: this.document,
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
