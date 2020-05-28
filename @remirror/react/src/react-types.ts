import { ReactNode, Ref } from 'react';

import {
  AnyExtension,
  AnyPreset,
  CombinedUnion,
  CompareStateParameter,
  EditorManager,
  EditorSchema,
  EditorState,
  EditorStateParameter,
  EditorViewParameter,
  ElementParameter,
  FromToParameter,
  ObjectNode,
  Position,
  PositionParameter,
  ProsemirrorNode,
  RemirrorContentType,
  RenderEnvironment,
  SchemaFromCombined,
  Shape,
  StringHandlerParameter,
  TextParameter,
  Transaction,
  TransactionParameter,
  TransactionTransformer,
} from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

/**
 * The type of arguments acceptable for the focus parameter.
 *
 * - Can be a selection of `{ from, to }
 * - A single position with a `number`
 * - `start` | `end`
 * - `true` which sets the focus to the current position or start.
 */
export type FocusType = FromToParameter | number | 'start' | 'end' | boolean;

export type DefaultCombined = CombinedUnion<AnyExtension, CorePreset | ReactPreset>;

export interface BaseProps<Combined extends CombinedUnion<AnyExtension, AnyPreset>>
  extends StringHandlerParameter {
  /**
   * Pass in the extension manager.
   *
   * The manager is responsible for handling all Prosemirror related
   * functionality.
   *
   * TODO - why does this only work as any.
   */
  manager: EditorManager<any>;

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
  initialContent?: RemirrorContentType;

  /**
   * If this exists the editor becomes a controlled component. Nothing will be
   * updated unless you explicitly set the value prop to the updated state.
   *
   * Without a deep understanding of Prosemirror this is not recommended.
   */
  onStateChange?: (params: RemirrorStateListenerParameter<Combined>) => void;

  /**
   * When onStateChange is defined this prop is used to set the next state value
   * of the remirror editor.
   */
  value?: EditorState<SchemaFromCombined<Combined>> | null;

  /**
   * Adds attributes directly to the prosemirror html element.
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
   * Called on the first render when the prosemirror instance first becomes
   * available
   */
  onFirstRender?: RemirrorEventListener<Combined>;

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
   * Determines whether or not to use the built in extensions.
   *
   * @remarks
   *
   * Use this if you would like to take full control of all your extensions and
   * have some understanding of the underlying Prosemirror internals.
   *
   * ```ts
   * const builtInExtensions = [new DocExtension(), new TextExtension(), new ParagraphExtension()]
   * ```
   *
   * @defaultValue true
   */
  usesBuiltInExtensions?: boolean;

  /**
   * Determine whether the editor should use default styles.
   *
   * @defaultValue true
   */
  usesDefaultStyles?: boolean;

  /**
   * Determine whether the Prosemirror view is inserted at the `start` or `end`
   * of it's container DOM element.
   *
   * @defaultValue 'end'
   */
  insertPosition?: 'start' | 'end';

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
   * The value to use for empty content.
   *
   * This is the value used for an empty editor or when `resetContent` is called.
   *
   * @defaultValue EMPTY_PARAGRAPH_NODE
   */
  fallbackContent?: ObjectNode | ProsemirrorNode;
}

export interface Positioner<Combined extends CombinedUnion<AnyExtension, AnyPreset>> {
  /**
   * The default and initial position value. This is used at the start and
   * whenever isActive becomes false
   */
  initialPosition: Position;

  /**
   * Determines whether anything has changed and whether to continue with a
   * recalculation. By default this is only true when the document has changed.
   *
   * @remarks
   *
   * Sometimes it is useful to recalculate the positioner on every state update. In this case
   * you can set this method to always return true.
   *
   * ```ts
   * const positioner: Positioner = {
   *   hasChanged: () => true
   *
   * };
   *
   * @param params
   */
  hasChanged: (params: CompareStateParameter<SchemaFromCombined<Combined>>) => boolean;

  /**
   * Determines whether the positioner should be active
   */
  isActive: (params: GetPositionParameter<Combined>) => boolean;

  /**
   * Calculate and return a new position (only called when `hasChanged` and
   * `isActive` return true)
   */
  getPosition: (params: GetPositionParameter<Combined>) => Position;
}

export type CalculatePositionerParameter<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>
> = PositionerIdParameter & Positioner<Combined>;

export type GetPositionerPropsConfig<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>,
  RefKey extends string = 'ref'
> = RefParameter<RefKey> & Partial<Positioner<Combined>> & PositionerIdParameter;

export interface RefParameter<RefKey = 'ref'> {
  /**
   * A custom ref key which allows a reference to be obtained from non standard
   * components.
   *
   * @defaultValue 'ref'
   */
  refKey?: RefKey;
}

export type PositionerProps = IsActiveParameter & Position;

export interface GetRootPropsConfig<RefKey extends string = 'ref'>
  extends RefParameter<RefKey>,
    Shape {}

export type RefKeyRootProps<RefKey extends string = 'ref'> = {
  [P in Exclude<RefKey, 'key'>]: Ref<any>;
} & {
  key: string;
  children: ReactNode;
} & Shape;

export type GetPositionerReturn<RefKey extends string = 'ref'> = { [P in RefKey]: Ref<any> } &
  PositionerProps;

/**
 * These are the props passed to the render function provided when setting up
 * your editor.
 */
export interface RemirrorContextProps<Combined extends CombinedUnion<AnyExtension, AnyPreset>>
  extends Remirror.ManagerStore<Combined> {
  /**
   * An instance of the extension manager
   */
  manager: EditorManager<Combined>;

  /**
   * The unique id for the editor instance.
   */
  uid: string;

  /**
   * Clears all editor content
   *
   * @param triggerOnChange - whether onChange handlers should be triggered by
   * the update.
   */
  clearContent: (triggerOnChange?: boolean) => void;

  /**
   * Replace all editor content with the new content.
   *
   * @remarks
   *
   * Allows for the editor content to be overridden by force.
   *
   * @param triggerOnChange - whether onChange handlers should be triggered by
   * the update.
   */
  setContent: (content: RemirrorContentType, triggerOnChange?: boolean) => void;

  /**
   * A function that returns props which should be spread on a react element and
   * declare it as the editor root (where the editor is injected in the DOM).
   *
   * @remarks
   * By default remirror will add the prosemirror editor instance directly into
   * the first child element it receives. Using this method gives you full
   * control over where the editor should be injected.
   *
   * **IMPORTANT** For this to work properly you will need to use the JSX pragma from
   * `emotion/core` so that the `css` prop can properly be added to the element.
   *
   * **IMPORTANT** In order to support SSR pre-rendering this should only be spread
   * on a component with NO children.
   *
   * **Example with indirectly nested components**
   *
   * ```tsx
   * import { RemirrorProvider } from '@remirror/react';
   * import { PresetCore } from '@remirror/preset-core';
   * import { BoldExtension } from '@remirror/extension-bold';
   *
   * const Editor = () => {
   *   const { getRootProps } = useRemirror();
   *   return <div {...getRootProps()} />;
   * }
   *
   * const EditorWrapper = () => {
   *   const corePreset = usePreset(CorePreset);
   *   const boldExtension = useExtension(BoldExtension);
   *   const manager = useManager([corePreset, boldExtension]);
   *
   *   return (
   *     <RemirrorProvider manager={manager}>
   *       <InnerEditor />
   *     </RemirrorProvider>
   *   );
   * }
   * ```
   */
  getRootProps: <RefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<RefKey>,
  ) => RefKeyRootProps<RefKey>;

  /**
   * Attach these props to a component to inject it with position data.
   * Typically this is used for creating menu components.
   *
   * A custom positioner can be passed in to update the method used to calculate
   * the position.
   */
  getPositionerProps: <RefKey extends string = 'ref'>(
    options: GetPositionerPropsConfig<any, RefKey>,
  ) => GetPositionerReturn<RefKey>;

  /**
   * The previous and next state
   */
  state: CompareStateParameter<SchemaFromCombined<Combined>>;

  /**
   * Focus the editor at the `start` | `end` a specific position or at a valid range between `{ from, to }`
   */
  focus: (position?: FocusType) => void;
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
  getJSON: () => ObjectNode;

  /**
   * Get a representation of the editor content as an ObjectNode which can be
   * used to set content for and editor.
   */
  getObjectNode: () => ObjectNode;
}

export interface BaseListenerParameter<Combined extends CombinedUnion<AnyExtension, AnyPreset>>
  extends EditorViewParameter<SchemaFromCombined<Combined>>,
    RemirrorGetterParameter {
  /**
   * The original transaction which caused this state update.
   *
   * This allows for inspecting the reason behind the state change.
   * When undefined this means that the state was updated externally.
   *
   * If available:
   * - Metadata on the transaction can be inspected. `tr.getMeta`
   * - Was the change caused by added / removed content? `tr.docChanged`
   * - Was ths change caused by an updated selection? `tr.selectionSet`
   * - `tr.steps` can be inspected for further granularity.
   */
  tr?: Transaction<SchemaFromCombined<Combined>>;

  /**
   * A shorthand way of checking whether the update was triggered by editor usage (internal) or
   * overwriting the state.
   *
   * - `true` The update was triggered by a change in the prosemirror doc or an update to the selection.
   * In these cases `tr` will have a value.
   * - `false` The update was caused by a call to `setContent` or `resetContent`
   */
  internalUpdate: boolean;
}

export interface RemirrorEventListenerParameter<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>
> extends EditorStateParameter<SchemaFromCombined<Combined>>, BaseListenerParameter<Combined> {}

export interface RemirrorStateListenerParameter<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>
> extends CompareStateParameter<SchemaFromCombined<Combined>>, BaseListenerParameter<Combined> {
  /**
   * Manually create a new state object with the desired content.
   */
  createStateFromContent: (
    content: RemirrorContentType,
  ) => EditorState<SchemaFromCombined<Combined>>;
}

export type RemirrorEventListener<Combined extends CombinedUnion<AnyExtension, AnyPreset>> = (
  params: RemirrorEventListenerParameter<Combined>,
) => void;

export type AttributePropFunction<Combined extends CombinedUnion<AnyExtension, AnyPreset>> = (
  params: RemirrorEventListenerParameter<Combined>,
) => Record<string, string>;

export interface PlaceholderConfig extends TextParameter {
  className: string;
}

export type PositionerMapValue = ElementParameter & {
  prev: PositionerProps;
};

export interface PositionerRefFactoryParameter extends PositionerIdParameter, PositionParameter {}

export interface GetPositionParameter<Combined extends CombinedUnion<AnyExtension, AnyPreset>>
  extends EditorViewParameter<SchemaFromCombined<Combined>>,
    ElementParameter,
    CompareStateParameter<SchemaFromCombined<Combined>> {}

export interface PositionerIdParameter {
  /**
   * A unique id for the positioner.
   *
   * This is used to map the ref of the tracked component to a unique id and
   * cant be updated without losing track of the component's reference element.
   */
  positionerId: string;
}

export interface IsActiveParameter {
  /**
   * A boolean value determining whether the positioner should be active.
   */
  isActive: boolean;
}

export interface PositionerParameter {
  /**
   * The positioner object which determines how the changes in the view impact
   * the calculated position.
   */
  positioner: Partial<Positioner<DefaultCombined>>;
}

export interface UsePositionerParameter<RefKey extends string = 'ref'>
  extends PositionerIdParameter,
    PositionerParameter,
    RefParameter<RefKey> {}

export interface UpdateStateParameter<Schema extends EditorSchema = any>
  extends Partial<TransactionParameter<Schema>>,
    EditorStateParameter<Schema> {
  /**
   * Whether or not to trigger this as a change and call any handlers.
   *
   * @defaultValue true
   */
  triggerOnChange?: boolean;

  /**
   * Called after the state has updated.
   */
  onUpdate?: () => void;
}

export interface EditorStateEventListenerParameter<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>,
  Schema extends EditorSchema = any
> extends Partial<CompareStateParameter<Schema>>, Pick<BaseListenerParameter<Combined>, 'tr'> {}

export interface RemirrorState<Schema extends EditorSchema = any> {
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

export interface ListenerParameter<
  Combined extends CombinedUnion<AnyExtension, AnyPreset>,
  Schema extends EditorSchema = any
> extends Partial<EditorStateParameter<Schema>>, Pick<BaseListenerParameter<Combined>, 'tr'> {}
