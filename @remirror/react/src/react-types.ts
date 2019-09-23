import { Interpolation, ObjectInterpolation } from '@emotion/core';
import {
  AbstractInstanceType,
  ActionsFromExtensions,
  AnyExtension,
  CompareStateParams,
  EditorSchema,
  EditorState,
  EditorStateParams,
  EditorView,
  EditorViewParams,
  ElementParams,
  ExtensionManager,
  HelpersFromExtensions,
  ObjectNode,
  OptionsOfExtension,
  PlainObject,
  Position,
  PositionParams,
  ProsemirrorNode,
  RemirrorContentType,
  RemirrorInterpolation,
  RenderEnvironment,
  SchemaFromExtensions,
  StringHandlerParams,
  TextParams,
  Transaction,
  TransactionParams,
  TransactionTransformer,
} from '@remirror/core';
import { ReactNode, Ref } from 'react';

export interface RemirrorProps<GExtension extends AnyExtension = any> extends StringHandlerParams {
  /**
   * Pass in the extension manager.
   *
   * The manager is responsible for handling all Prosemirror related
   * functionality.
   */
  manager: ExtensionManager<GExtension>;

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
  initialContent: RemirrorContentType;

  /**
   * If this exists the editor becomes a controlled component. Nothing will be
   * updated unless you explicitly set the value prop to the updated state.
   *
   * Without a deep understanding of Prosemirror this is not recommended.
   */
  onStateChange?(params: RemirrorStateListenerParams<GExtension>): void;

  /**
   * When onStateChange is defined this prop is used to set the next state value
   * of the remirror editor.
   */
  value?: EditorState<SchemaFromExtensions<GExtension>> | null;

  /**
   * Adds attributes directly to the prosemirror html element.
   *
   * @defaultValue `{}`
   */
  attributes: Record<string, string> | AttributePropFunction;

  /**
   * Determines whether this editor is editable or not.
   *
   * @defaultValue true
   */
  editable: boolean;

  /**
   * When set to true focus will be place on the editor as soon as it first
   * loads.
   *
   * @defaultValue false
   */
  autoFocus?: boolean;

  /**
   * An event listener which is called whenever the editor gains focus.
   */
  onFocus?: (params: RemirrorEventListenerParams<GExtension>, event: Event) => void;

  /**
   * An event listener which is called whenever the editor is blurred.
   */
  onBlur?: (params: RemirrorEventListenerParams<GExtension>, event: Event) => void;

  /**
   * Called on the first render when the prosemirror instance first becomes
   * available
   */
  onFirstRender?: RemirrorEventListener<GExtension>;

  /**
   * Called on every change to the Prosemirror state.
   */
  onChange?: RemirrorEventListener<GExtension>;

  /**
   * The render prop that takes the injected remirror params and returns an
   * element to render. The editor view is automatically attached to the DOM.
   */
  children: RenderPropFunction<GExtension>;

  /**
   * A method called when the editor is dispatching the transaction.
   *
   * @remarks
   * Use this to update the transaction which will be used to update the editor
   * state.
   */
  onDispatchTransaction: TransactionTransformer<SchemaFromExtensions<GExtension>>;

  /**
   * Sets the accessibility label for the editor instance.
   *
   * @defaultValue ''
   */
  label: string;

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
  usesBuiltInExtensions: boolean;

  /**
   * Determine whether the editor should use default styles.
   *
   * @defaultValue true
   */
  usesDefaultStyles: boolean;

  /**
   * Additional editor styles passed into prosemirror. Used to provide styles
   * for the text, nodes and marks rendered in the editor.
   *
   * @defaultValue `{}`
   *
   * @deprecated use `styles` or `css` prop instead.
   */
  editorStyles: RemirrorInterpolation;

  /**
   * Addition styles that will be passed directly to the prosemirror editor dom node.
   *
   * This can be used to provide extra styles
   *
   */
  styles?: RemirrorInterpolation;

  /**
   * Emotion css prop for injecting styles into a component.
   */
  css?: Interpolation;

  /**
   * Determine whether the Prosemirror view is inserted at the `start` or `end`
   * of it's container DOM element.
   *
   * @defaultValue 'end'
   */
  insertPosition: 'start' | 'end';

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
   * The props also takes it's name from a similar API used by react for DOM
   * Elements. See {@link
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
  fallbackContent: ObjectNode | ProsemirrorNode;
}

export interface Positioner<GExtension extends AnyExtension = any> {
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
  hasChanged(params: CompareStateParams<SchemaFromExtensions<GExtension>>): boolean;

  /**
   * Determines whether the positioner should be active
   */
  isActive(params: GetPositionParams<GExtension>): boolean;

  /**
   * Calculate and return a new position (only called when `hasChanged` and
   * `isActive` return true)
   */
  getPosition(params: GetPositionParams<GExtension>): Position;
}

export type CalculatePositionerParams<GExtension extends AnyExtension = any> = PositionerIdParams &
  Positioner<GExtension>;

export type GetPositionerPropsConfig<
  GExtension extends AnyExtension = any,
  GRefKey extends string = 'ref'
> = RefParams<GRefKey> &
  Partial<Omit<CalculatePositionerParams<GExtension>, 'positionerId'>> &
  PositionerIdParams;

export interface RefParams<GRefKey extends string = 'ref'> {
  /**
   * A custom ref key which allows a reference to be obtained from non standard
   * components.
   *
   * @defaultValue 'ref'
   */
  refKey?: GRefKey;
}

export type PositionerProps = IsActiveParams & Position;

export interface GetRootPropsConfig<GRefKey extends string = 'ref'> extends RefParams<GRefKey>, PlainObject {
  editorStyles?: Interpolation;
}

export type RefKeyRootProps<GRefKey extends string = 'ref'> = {
  [P in Exclude<GRefKey, 'key'>]: Ref<any>;
} & { css: Interpolation | ((theme: any) => Interpolation); key: string; children: ReactNode } & PlainObject;

export type GetPositionerReturn<GRefKey extends string = 'ref'> = PositionerProps &
  { [P in GRefKey]: Ref<any> };

/**
 * These are the props passed to the render function provided when setting up
 * your editor.
 */
export interface InjectedRemirrorProps<GExtension extends AnyExtension = any> {
  /**
   * An instance of the extension manager
   */
  manager: ExtensionManager<GExtension>;
  /**
   * The prosemirror view
   */
  view: EditorView<SchemaFromExtensions<GExtension>>;

  /**
   * A map of all actions made available by the configured extensions.
   */
  actions: ActionsFromExtensions<GExtension>;

  /**
   * A map of all helpers made available by the configured extensions.
   */
  helpers: HelpersFromExtensions<GExtension>;

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
  clearContent(triggerOnChange?: boolean): void;

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
  setContent(content: RemirrorContentType, triggerOnChange?: boolean): void;

  /**
   * A function that returns props which should be spread on a react element and
   * declare it the editor root.
   *
   * @remarks
   * By default remirror will add the prosemirror editor instance directly into
   * the first child element it holds.
   *
   * **IMPORTANT** In order to support pre-rendering this should only be spread
   * on a component with NO children.
   *
   * **Example with indirectly nested components**
   *
   * ```tsx
   * import { ManagedRemirrorProvider, RemirrorManager, useRemirrorContext } from '@remirror/react';
   *
   * const InnerEditor = () => {
   *   const { getRootProps } = useRemirrorContext();
   *   return <div {...getRootProps()} />;
   * }
   *
   * const Editor = () => {
   *   return (
   *     <RemirrorManager>
   *       <ManagedRemirrorProvider>
   *         <InnerEditor />
   *       </ManagedRemirrorProvider>
   *     </RemirrorManager>
   *   );
   * }
   * ```
   */
  getRootProps<GRefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<GRefKey>,
  ): RefKeyRootProps<GRefKey>;

  /**
   * Attach these props to a component to inject it with position data.
   * Typically this is used for creating menu components.
   *
   * A custom positioner can be passed in to update the method used to calculate
   * the position.
   */
  getPositionerProps<GRefKey extends string = 'ref'>(
    options: GetPositionerPropsConfig<GExtension, GRefKey>,
  ): GetPositionerReturn<GRefKey>;

  /**
   * The previous and next state
   */
  state: CompareStateParams<SchemaFromExtensions<GExtension>>;
}

/**
 * A function that takes the injected remirror params and returns JSX to render.
 *
 * @param - injected remirror params
 */
export type RenderPropFunction<GExtension extends AnyExtension = any> = (
  params: InjectedRemirrorProps<GExtension>,
) => JSX.Element;

export interface RemirrorGetterParams {
  /**
   * Get the current HTML from the latest editor state.
   */
  getHTML(): string;

  /**
   * Get the current raw text from the latest editor state.
   *
   * @param lineBreakDivider - the divider to use for new lines defaults to
   * '\n\n'
   */
  getText(lineBreakDivider?: string): string;

  /**
   * Get the full JSON representation of the state (including the selection
   * information)
   */
  getJSON(): ObjectNode;

  /**
   * Get a representation of the editor content as an ObjectNode which can be
   * used to set content for and editor.
   */
  getObjectNode(): ObjectNode;
}

export interface BaseListenerParams<GExtension extends AnyExtension = any>
  extends EditorViewParams<SchemaFromExtensions<GExtension>>,
    RemirrorGetterParams {
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
  tr?: Transaction<SchemaFromExtensions<GExtension>>;

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

export interface RemirrorEventListenerParams<GExtension extends AnyExtension = any>
  extends EditorStateParams<SchemaFromExtensions<GExtension>>,
    BaseListenerParams<GExtension> {}

export interface RemirrorStateListenerParams<GExtension extends AnyExtension = any>
  extends CompareStateParams<SchemaFromExtensions<GExtension>>,
    BaseListenerParams<GExtension> {
  /**
   * Manually create a new state object with the desired content.
   */
  createStateFromContent(content: RemirrorContentType): EditorState<SchemaFromExtensions<GExtension>>;
}

export type RemirrorEventListener<GExtension extends AnyExtension = any> = (
  params: RemirrorEventListenerParams<GExtension>,
) => void;

export type AttributePropFunction<GExtension extends AnyExtension = any> = (
  params: RemirrorEventListenerParams<GExtension>,
) => Record<string, string>;

export interface PlaceholderConfig extends TextParams {
  className: string;
  style: ObjectInterpolation<undefined>;
}

export type PositionerMapValue = ElementParams & {
  prev: PositionerProps;
};

export interface PositionerRefFactoryParams extends PositionerIdParams, PositionParams {}

export interface GetPositionParams<GExtension extends AnyExtension = any>
  extends EditorViewParams<SchemaFromExtensions<GExtension>>,
    ElementParams,
    CompareStateParams<SchemaFromExtensions<GExtension>> {}

export interface PositionerIdParams {
  /**
   * A unique id for the positioner.
   *
   * This is used to map the ref of the tracked component to a unique id and
   * cant be updated without losing track of the component's reference element.
   */
  positionerId: string;
}

export interface IsActiveParams {
  /**
   * A boolean value determining whether the positioner should be active.
   */
  isActive: boolean;
}

export interface PositionerParams {
  /**
   * The positioner object which determines how the changes in the view impact
   * the calculated position.
   */
  positioner: Partial<Positioner>;
}

export interface UsePositionerParams<GRefKey extends string = 'ref'>
  extends PositionerIdParams,
    PositionerParams,
    RefParams<GRefKey> {}

export type RemirrorExtensionProps<
  GConstructor extends { prototype: AnyExtension },
  GOptions extends OptionsOfExtension<AbstractInstanceType<GConstructor>>
> = GOptions &
  BaseExtensionProps & {
    /**
     * The constructor for the remirror extension.
     * Will be instantiated with the options passed through as props.
     */
    Constructor: GConstructor;
  };

export interface BaseExtensionProps {
  /**
   * Sets the priority for the extension. Lower number means the extension is
   * loaded first and gives it priority. `-1` is loaded before `0` and will
   * overwrite any conflicting configuration.
   *
   * Base extensions are loaded with a priority of 1.
   *
   * @defaultValue 2
   */
  priority?: number;
  children?: never;
}

export interface UpdateStateParams<GSchema extends EditorSchema = any>
  extends Partial<TransactionParams<GSchema>>,
    EditorStateParams<GSchema> {
  /**
   * Called after the state has updated.
   */
  onUpdate?(): void;

  /**
   * Whether or not to trigger this as a change and call any handlers.
   *
   * @defaultValue true
   */
  triggerOnChange?: boolean;
}

export interface EditorStateEventListenerParams<
  GExtension extends AnyExtension = any,
  GSchema extends EditorSchema = any
> extends Partial<CompareStateParams<GSchema>>, Pick<BaseListenerParams<GExtension>, 'tr'> {}

export interface RemirrorState<GSchema extends EditorSchema = any> {
  /**
   * The Prosemirror editor state
   */
  editor: CompareStateParams<GSchema>;
  /**
   * Used when suppressHydrationWarning is true to determine when it's okay to
   * render the client content.
   */
  shouldRenderClient?: boolean;
}

export interface ListenerParams<GExtension extends AnyExtension = any, GSchema extends EditorSchema = any>
  extends Partial<EditorStateParams<GSchema>>,
    Pick<BaseListenerParams<GExtension>, 'tr'> {}
