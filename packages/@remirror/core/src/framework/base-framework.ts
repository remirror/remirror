import type { Unsubscribe } from 'nanoevents';

import type {
  EditorSchema,
  EditorState,
  EditorStateParameter,
  EditorViewParameter,
  FromToParameter,
  PrimitiveSelection,
  RemirrorContentType,
  RemirrorJSON,
  RenderEnvironment,
  StateJSON,
  TextParameter,
  Transaction,
  TransactionParameter,
  TransactionTransformer,
} from '@remirror/core-types';
import type { InvalidContentHandler, StringHandlerParameter } from '@remirror/core-utils';
import type { DirectEditorProps } from '@remirror/pm/view';

import type { UpdatableViewProps } from '../builtins';
import type { AnyExtensionConstructor } from '../extension';
import type { ManagerEvents, RemirrorManager } from '../manager';
import type { AnyPresetConstructor } from '../preset';
import type { AnyCombinedUnion, SchemaFromCombined } from '../preset/preset-types';

export interface BaseFramework<Combined extends AnyCombinedUnion> {
  /**
   * The name of the framework being used.
   */
  readonly name: string;

  /**
   * The state that is initially passed into the editor.
   */
  initialEditorState: EditorState<SchemaFromCombined<Combined>>;

  /**
   * The minimum required output from the framework.
   */
  readonly frameworkOutput: FrameworkOutput<Combined>;

  /**
   * Destroy the framework and cleanup all created listeners.
   */
  destroy(): void;
}

export interface FrameworkParameter<
  Combined extends AnyCombinedUnion,
  Props extends FrameworkProps<Combined>
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
export interface FrameworkProps<Combined extends AnyCombinedUnion> extends StringHandlerParameter {
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
   * @default `{ type: 'doc', content: [{ type: 'paragraph' }] }`
   */
  initialContent?: RemirrorContentType | [RemirrorContentType, PrimitiveSelection];

  /**
   * Adds attributes directly to the prosemirror element.
   *
   * @default {}
   */
  attributes?: Record<string, string> | AttributePropFunction<Combined>;

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
   * @default ''
   */
  label?: string;

  /**
   * By default remirror will work out whether this is a dom environment or
   * server environment for SSR rendering. You can override this behaviour here
   * when required.
   */
  forceEnvironment?: RenderEnvironment;

  /**
   * This is called when the editor has invalid content.
   *
   * @remarks
   *
   * To add this to the editor the following is needed.
   *
   * ```tsx
   * import React from 'react';
   * import { RemirrorProvider, InvalidContentHandler } from 'remirror/core';
   * import { RemirrorProvider, useManager } from 'remirror/react';
   * import { WysiwygPreset } from 'remirror/preset/wysiwyg';
   *
   * const Framework = () => {
   *   const onError: InvalidContentHandler = useCallback(({ json, invalidContent, transformers }) => {
   *     // Automatically remove all invalid nodes and marks.
   *     return transformers.remove(json, invalidContent);
   *   }, []);
   *
   *   const manager = useManager(() => [new WysiwygPreset()]);
   *
   *   return (
   *     <RemirrorProvider manager={manager} onError={onError}>
   *       <div />
   *     </RemirrorProvider>
   *   );
   * };
   * ```
   */
  onError?: InvalidContentHandler;
}

/**
 * This is the base output that is created by a framework.
 */
export interface FrameworkOutput<Combined extends AnyCombinedUnion>
  extends Remirror.ManagerStore<Combined> {
  /**
   * Add event handlers to the remirror editor at runtime.
   */
  addHandler: <Key extends keyof FrameworkEvents<Combined>>(
    event: Key,
    cb: FrameworkEvents<Combined>[Key],
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
   *
   * This method is not supported when using a controlled editor.
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
   * by the update. Defaults to `false`.
   *
   * This method is not supported when using a controlled editor.
   */
  setContent: (content: RemirrorContentType, options?: TriggerChangeParameter) => void;

  /**
   * Focus the editor at the `start` | `end` a specific position or at a valid
   * range between `{ from, to }`.
   */
  focus: (position?: FocusType) => void;

  /**
   * Blur the editor.
   */
  blur: () => void;

  /**
   * A getter function for the current editor state. It's a wrapper around
   * `view.state`.
   */
  getState: () => EditorState<SchemaFromCombined<Combined>>;

  /**
   * A getter function for the previous prosemirror editor state. It can be used
   * to check what's changed between states.
   */
  getPreviousState: () => EditorState<SchemaFromCombined<Combined>>;

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

export interface UpdateStateParameter<Schema extends EditorSchema = EditorSchema>
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
   * @default true
   */
  triggerChange?: boolean;
}

export interface ListenerParameter<Combined extends AnyCombinedUnion>
  extends Partial<EditorStateParameter<SchemaFromCombined<Combined>>>,
    Partial<TransactionParameter<SchemaFromCombined<Combined>>> {}

export interface FrameworkEvents<Combined extends AnyCombinedUnion>
  extends Pick<ManagerEvents, 'destroy'> {
  /**
   * An event listener which is called whenever the editor gains focus.
   */
  focus: (params: RemirrorEventListenerParameter<Combined>, event: Event) => void;

  /**
   * An event listener which is called whenever the editor is blurred.
   */
  blur: (params: RemirrorEventListenerParameter<Combined>, event: Event) => void;

  /**
   * Called on every state update after the state has been applied to the editor.
   *
   * This should be used to track the current editor state and check if commands
   * are enabled.
   */
  updated: RemirrorEventListener<Combined>;
}

export type UpdatableViewPropsObject = { [Key in UpdatableViewProps]: DirectEditorProps[Key] };
