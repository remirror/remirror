import type { ClassName } from '@linaria/core/types/cx';
import type { Unsubscribe } from 'nanoevents';
import type {
  EditorSchema,
  EditorState,
  EditorStateProps,
  EditorViewProps,
  PrimitiveSelection,
  RemirrorContentType,
  TextProps,
  Transaction,
  TransactionProps,
  TransactionTransformer,
} from '@remirror/core-types';
import type { DirectEditorProps } from '@remirror/pm/view';

import type { UpdatableViewProps } from '../builtins';
import type { AnyExtension, AnyExtensionConstructor, GetSchema } from '../extension';
import type { ManagerEvents, RemirrorManager } from '../manager';
import type { FocusType } from '../types';

export interface BaseFramework<Extension extends AnyExtension> {
  /**
   * The name of the framework being used.
   */
  readonly name: string;

  /**
   * The state that is initially passed into the editor.
   */
  initialEditorState: EditorState<GetSchema<Extension>>;

  /**
   * The minimum required output from the framework.
   */
  readonly frameworkOutput: FrameworkOutput<Extension>;

  /**
   * Destroy the framework and cleanup all created listeners.
   */
  destroy(): void;
}

export interface FrameworkOptions<
  Extension extends AnyExtension,
  Props extends FrameworkProps<Extension>,
> {
  /**
   * The initial editor state
   */
  initialEditorState: EditorState<GetSchema<Extension>>;

  /**
   * A method for getting the passed in props.
   */
  getProps: () => Props;

  /**
   * When provided the view will immediately be inserted into the dom within
   * this element.
   */
  element?: Element;
}

/**
 * The base options for an editor wrapper. This is used within the react and dom
 * implementations.
 */
export interface FrameworkProps<Extension extends AnyExtension> {
  /**
   * Pass in the extension manager.
   *
   * The manager is responsible for handling all Prosemirror related
   * functionality.
   */
  manager: RemirrorManager<Extension>;

  /**
   * Set the starting value for the editor.
   *
   * Without setting the value prop `onChange` remirror renders as an uncontrolled
   * component. Value changes are passed back out of the editor and there is now
   * way to set the value via props. As a result this is the only opportunity to
   * directly control the rendered text.
   *
   * @default `{ type: 'doc', content: [{ type: 'paragraph' }] }`
   */
  initialContent?: RemirrorContentType | [RemirrorContentType, PrimitiveSelection];

  /**
   * Adds attributes directly to the prosemirror element.
   *
   * @default {}
   */
  attributes?: Record<string, string> | AttributePropFunction<Extension>;

  /**
   * Additional classes which can be passed into the the editor wrapper. These
   * are placed on root `Prosemirror` element and can be used to effect styling
   * within the editor.
   */
  classNames?: ClassName[];

  /**
   * Determines whether this editor is editable or not.
   *
   * @default true
   */
  editable?: boolean;

  /**
   * When set to true focus will be place on the editor as soon as it first
   * loads.
   *
   * @default false
   */
  autoFocus?: FocusType;

  /**
   * An event listener which is called whenever the editor gains focus.
   */
  onFocus?: (params: RemirrorEventListenerProps<Extension>, event: Event) => void;

  /**
   * An event listener which is called whenever the editor is blurred.
   */
  onBlur?: (params: RemirrorEventListenerProps<Extension>, event: Event) => void;

  /**
   * Called on every change to the Prosemirror state.
   */
  onChange?: RemirrorEventListener<Extension>;

  /**
   * A method called when the editor is dispatching the transaction.
   *
   * @remarks
   * Use this to update the transaction which will be used to update the editor
   * state.
   */
  onDispatchTransaction?: TransactionTransformer<GetSchema<Extension>>;

  /**
   * Sets the accessibility label for the editor instance.
   *
   * @default ''
   */
  label?: string;
}

export type AddFrameworkHandler<Extension extends AnyExtension> = <
  Key extends keyof FrameworkEvents<Extension>,
>(
  event: Key,
  cb: FrameworkEvents<Extension>[Key],
) => Unsubscribe;

/**
 * This is the base output that is created by a framework.
 */
export interface FrameworkOutput<Extension extends AnyExtension>
  extends Remirror.ManagerStore<Extension> {
  /**
   * The manager which was used to create this editor.
   */
  manager: RemirrorManager<Extension>;

  /**
   * Add event handlers to the remirror editor at runtime.
   */
  addHandler: AddFrameworkHandler<Extension>;

  /**
   * The unique id for the editor instance.
   */
  uid: string;

  /**
   * Clears all editor content.
   *
   * @param options - includes a `triggerChange` handler which should be
   * triggered by the update.
   *
   * To use this in a controlled editor, you must set `triggerChange` to `true`.
   */
  clearContent: (options?: TriggerChangeProps) => void;

  /**
   * Replace all editor content with the new content.
   *
   * @remarks
   *
   * Allows for the editor content to be overridden by force.
   *
   * @param triggerOnChange - whether the `onChange` handler should be triggered
   * by the update. Defaults to `false`.
   *
   * To use this in a controlled editor, you must set `triggerChange` to `true`.
   */
  setContent: (content: RemirrorContentType, options?: TriggerChangeProps) => void;

  /**
   * A getter function for the current editor state. It's a wrapper around
   * `view.state`.
   */
  getState: () => EditorState<GetSchema<Extension>>;

  /**
   * A getter function for the previous prosemirror editor state. It can be used
   * to check what's changed between states.
   */
  getPreviousState: () => EditorState<GetSchema<Extension>>;

  /**
   * Get an extension by it's constructor.
   */
  getExtension: <ExtensionConstructor extends AnyExtensionConstructor>(
    Constructor: ExtensionConstructor,
  ) => InstanceType<ExtensionConstructor>;

  /**
   * Focus the editor at the `start` | `end` a specific position or at a valid
   * range between `{ from, to }`.
   *
   * @deprecated This method may be removed in the future and it is advisable to
   * use `commands.focus()`.
   */
  focus: (position?: FocusType) => void;

  /**
   * Blur the editor.
   *
   * @deprecated This method may be removed in the future and it is advisable to
   * use `commands.blur()`.
   */
  blur: (position?: PrimitiveSelection) => void;
}

export type CreateStateFromContent<Extension extends AnyExtension> = (
  content: RemirrorContentType,
  selection?: PrimitiveSelection,
) => EditorState<GetSchema<Extension>>;

export interface RemirrorEventListenerProps<Extension extends AnyExtension>
  extends EditorStateProps<GetSchema<Extension>>,
    Remirror.ListenerProperties<Extension>,
    EditorViewProps<GetSchema<Extension>> {
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
  tr?: Transaction<GetSchema<Extension>>;

  /**
   * A shorthand way of checking whether the update was triggered by editor
   * usage (internal) or overwriting the state.
   *
   * - `true` The update was triggered by a change in the prosemirror doc or an
   *   update to the selection. In these cases `tr` will have a value.
   * - `false` The update was caused by a call to `setContent` or `resetContent`
   */
  internalUpdate: boolean;

  /**
   * True when this is the first render of the editor. This applies when the
   * editor is first attached to the DOM.
   */
  firstRender: boolean;

  /**
   * The previous state.
   */
  previousState: EditorState<GetSchema<Extension>>;

  /**
   * Manually create a new state object with the desired content.
   */
  createStateFromContent: CreateStateFromContent<Extension>;
}

export type RemirrorEventListener<Extension extends AnyExtension> = (
  params: RemirrorEventListenerProps<Extension>,
) => void;

export type AttributePropFunction<Extension extends AnyExtension> = (
  params: RemirrorEventListenerProps<Extension>,
) => Record<string, string>;

export interface PlaceholderConfig extends TextProps {
  className: string;
}

export interface UpdateStateProps<Schema extends EditorSchema = EditorSchema>
  extends Partial<TransactionProps<Schema>>,
    EditorStateProps<Schema>,
    TriggerChangeProps {
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

export interface TriggerChangeProps {
  /**
   * Whether or not to trigger this as a change and call any handlers.
   *
   * @default true
   */
  triggerChange?: boolean;
}

export interface ListenerProps<Extension extends AnyExtension>
  extends Partial<EditorStateProps<GetSchema<Extension>>>,
    Partial<TransactionProps<GetSchema<Extension>>> {}

export interface FrameworkEvents<Extension extends AnyExtension>
  extends Pick<ManagerEvents, 'destroy'> {
  /**
   * An event listener which is called whenever the editor gains focus.
   */
  focus: (params: RemirrorEventListenerProps<Extension>, event: Event) => void;

  /**
   * An event listener which is called whenever the editor is blurred.
   */
  blur: (params: RemirrorEventListenerProps<Extension>, event: Event) => void;

  /**
   * Called on every state update after the state has been applied to the editor.
   *
   * This should be used to track the current editor state and check if commands
   * are enabled.
   */
  updated: RemirrorEventListener<Extension>;
}

export type UpdatableViewPropsObject = { [Key in UpdatableViewProps]: DirectEditorProps[Key] };

declare global {
  namespace Remirror {
    interface ListenerProperties<Extension extends AnyExtension> {}
  }
}
