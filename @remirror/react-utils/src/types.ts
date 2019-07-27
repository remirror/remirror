import { Interpolation, ObjectInterpolation } from '@emotion/core';
import {
  AbstractInstanceType,
  ActionsFromExtensionList,
  AnyExtension,
  CompareStateParams,
  EditorState,
  EditorStateParams,
  EditorView,
  EditorViewParams,
  ElementParams,
  Extension,
  ExtensionManager,
  ObjectNode,
  OptionsOfExtension,
  PlainObject,
  Position,
  PositionParams,
  RemirrorContentType,
  RenderEnvironment,
  StringHandlerParams,
  TextParams,
  TransactionTransformer,
} from '@remirror/core';
import { ComponentClass, ComponentType, FC, ReactElement, ReactNode, Ref } from 'react';

export interface Positioner {
  /**
   * The default and initial position value. This is used at the start and whenever isActive becomes false
   */

  initialPosition: Position;
  /**
   * Determines whether anything has changed and whether to continue with
   * a recalculation
   *
   * @param params
   */
  hasChanged(params: CompareStateParams): boolean;

  /**
   * Determines whether the positioner should be active
   */
  isActive(params: GetPositionParams): boolean;

  /**
   * Calculate and return a new position (only called when `hasChanged` and `isActive` return true)
   */
  getPosition(params: GetPositionParams): Position;
}

export type CalculatePositionerParams = PositionerIdParams & Positioner;

export type GetPositionerPropsConfig<GRefKey extends string = 'ref'> = RefParams<GRefKey> &
  Partial<Omit<CalculatePositionerParams, 'positionerId'>> &
  PositionerIdParams;

export interface RefParams<GRefKey extends string = 'ref'> {
  /**
   * A custom ref key which allows a reference to be obtained from non standard components.
   *
   * @defaultValue 'ref'
   */
  refKey?: GRefKey;
}

export type PositionerProps = IsActiveParams & Position;

export interface GetRootPropsConfig<GRefKey extends string = 'ref'> extends RefParams<GRefKey>, PlainObject {
  editorStyles?: Interpolation<RemirrorProps>;
}

export type RefKeyRootProps<GRefKey extends string = 'ref'> = {
  [P in Exclude<GRefKey, 'key'>]: Ref<any>;
} & { css: Interpolation; key: string; children: ReactNode } & PlainObject;

export type GetPositionerReturn<GRefKey extends string = 'ref'> = PositionerProps &
  { [P in GRefKey]: Ref<any> };

/**
 * These are the props passed to the render function provided when setting up your editor.
 */
export interface InjectedRemirrorProps<GExtensions extends AnyExtension[] = AnyExtension[]> {
  /**
   * An instance of the extension manager
   */
  manager: ExtensionManager<GExtensions>;
  /**
   * The prosemirror view
   */
  view: EditorView;

  /**
   * A map of actions available the
   */
  actions: ActionsFromExtensionList<GExtensions>;

  /**
   * The unique id for the editor instance
   */
  uid: string;

  /**
   * Clears all editor content
   *
   * @param triggerOnChange - whether onChange handlers should be triggered by the update
   */
  clearContent(triggerOnChange?: boolean): void;

  /**
   * Replace all editor content with the new content.
   *
   * @remarks
   *
   * Allows for the editor content to be overridden by force.
   *
   * @param triggerOnChange - whether onChange handlers should be triggered by the update
   */
  setContent(content: RemirrorContentType, triggerOnChange?: boolean): void;

  /**
   * A function that returns props which should be spread on a react element and declare it the editor root.
   *
   * @remarks
   * By default remirror will add the prosemirror editor instance directly into the first child element it holds.
   *
   * **IMPORTANT** In order to support pre-rendering this should only be spread on a component with NO children.
   *
   * **Example with indirectly nested components**
   *
   * ```tsx
   * import { ManagedRemirrorProvider, RemirrorManager, useRemirror } from '@remirror/react';
   *
   * const InnerEditor = () => {
   *   const { getRootProps } = useRemirror();
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
   * Attach these props to a component to inject it with position data. Typically this is used
   * for creating menu components.
   *
   * A custom positioner can be passed in to update the method used to calculate the position.
   */
  getPositionerProps<GRefKey extends string = 'ref'>(
    options: GetPositionerPropsConfig<GRefKey>,
  ): GetPositionerReturn<GRefKey>;

  /**
   * The previous and next state
   */
  state: CompareStateParams;
}

/**
 * A function that takes the injected remirror params and returns JSX to render.
 *
 * @param - injected remirror params
 */
export type RenderPropFunction<GExtensions extends AnyExtension[] = AnyExtension[]> = (
  params: InjectedRemirrorProps<GExtensions>,
) => JSX.Element;

export interface RemirrorGetterParams {
  /**
   * Get the current HTML from the latest editor state.
   */
  getHTML(): string;

  /**
   * Get the current raw text from the latest editor state.
   *
   * @param lineBreakDivider - the divider to use for new lines defaults to '\n\n'
   */
  getText(lineBreakDivider?: string): string;

  /**
   * Get the full JSON representation of the state (including the selection information)
   */
  getJSON(): ObjectNode;

  /**
   * Get a representation of the editor content as an ObjectNode which can be used to set content for
   * and editor.
   */
  getObjectNode(): ObjectNode;
}

export interface BaseListenerParams extends EditorViewParams, RemirrorGetterParams {}

export interface RemirrorEventListenerParams extends EditorStateParams, BaseListenerParams {}

export interface RemirrorStateListenerParams extends CompareStateParams, BaseListenerParams {
  /**
   * Allows for the creation of a new state object with the desired content
   */
  createStateFromContent(content: RemirrorContentType): EditorState;
}

export type RemirrorEventListener = (params: RemirrorEventListenerParams) => void;

export type AttributePropFunction = (params: RemirrorEventListenerParams) => Record<string, string>;

export interface RemirrorProps<GExtensions extends AnyExtension[] = AnyExtension[]>
  extends StringHandlerParams {
  /**
   * Pass in the extension manager.
   *
   * The manager is responsible for handling all Prosemirror related functionality.
   */
  manager: ExtensionManager<GExtensions>;

  /**
   * Set the starting value object of the editor.
   *
   * Without setting onStateChange remirror renders as an uncontrolled component.
   * Value changes are passed back out of the editor and there is now way to set the value via props.
   * As a result this is the only opportunity to directly control the rendered text.
   *
   * @defaultValue `{ type: 'doc', content: [{ type: 'paragraph' }] }`
   */
  initialContent: RemirrorContentType;

  /**
   * If this exists the editor becomes a controlled component. Nothing will be updated unless you explicitly
   * set the value prop to the updated state.
   *
   * Without a deep understanding of Prosemirror this is not recommended.
   *
   * @default undefined
   */
  onStateChange?(params: RemirrorStateListenerParams): void;

  /**
   * When onStateChange is defined this prop is used to set the next state value of the remirror editor.
   */
  value?: EditorState | null;

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
   * When set to true focus will be place on the editor as soon as it first loads.
   *
   * @defaultValue false
   */
  autoFocus?: boolean;

  /**
   * An event listener which is called whenever the editor gains focus.
   */
  onFocus?: (params: RemirrorEventListenerParams, event: Event) => void;

  /**
   * An event listener which is called whenever the editor is blurred.
   */
  onBlur?: (params: RemirrorEventListenerParams, event: Event) => void;

  /**
   * Called on the first render when the prosemirror instance first becomes available
   */
  onFirstRender?: RemirrorEventListener;

  /**
   * Called on every change to the Prosemirror state.
   */
  onChange?: RemirrorEventListener;

  /**
   * The render prop that takes the injected remirror params and returns an element to render.
   * The editor view is automatically attached to the DOM.
   */
  children: RenderPropFunction<GExtensions>;

  /**
   * A method called when the editor is dispatching the transaction.
   *
   * @remarks
   * Use this to update the transaction which will be used to update the editor state.
   */
  onDispatchTransaction: TransactionTransformer;

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
   * Use this if you would like to take full control of all your extensions and have some understanding of the underlying
   * Prosemirror internals.
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
   * Additional editor styles passed into prosemirror. Used to provide styles for the text, nodes and marks
   * rendered in the editor.
   *
   * @defaultValue `{}`
   */
  editorStyles: Interpolation;

  /**
   * Determine whether the Prosemirror view is inserted at the `start` or `end` of it's container DOM element.
   *
   * @defaultValue 'end'
   */
  insertPosition: 'start' | 'end';

  /**
   * By default remirror will work out whether this is a dom environment or server environment for SSR rendering.
   * You can override this behaviour here when required.
   */
  forceEnvironment?: RenderEnvironment;

  /**
   * Removes the emotion injected styles from the component.
   *
   * @remarks
   *
   * This is accomplished by making the `css` function a noop. It is useful for those who would prefer not to use
   * a CSS-in-JS solution. Emotion classes are very hard to override once in place. By setting this to true, it should
   * be much easier to configure your own styles without the burden of overriding existing styles.
   *
   * @default false
   */
  withoutEmotion: boolean;

  /**
   * Set to true to ignore the hydration warning for a mismatch between the rendered server and client content.
   *
   * @remarks
   *
   * This is a potential solution for those who require server side rendering.
   *
   * While on the server the prosemirror document is transformed into a react component so that it can be rendered.
   * The moment it enters the DOM environment prosemirror takes over control of the root element. The problem is that
   * this will always see this hydration warning on the client:
   *
   * `Warning: Did not expect server HTML to contain a <div> in <div>.`
   *
   * Setting this to true removes the warning at the cost of a slightly slower start up time. It uses the
   * two pass solution mentioned in the react docs. See {@link https://reactjs.org/docs/react-dom.html#hydrate}.
   *
   * The props also takes it's name from a similar API used by react for DOM Elements. See {@link https://reactjs.org/docs/dom-elements.html#suppresshydrationwarning.
   */
  suppressHydrationWarning?: boolean;
}

export interface PlaceholderConfig extends TextParams {
  className: string;
  style: ObjectInterpolation<undefined>;
}

export type PositionerMapValue = ElementParams & {
  prev: PositionerProps;
};

export interface PositionerRefFactoryParams extends PositionerIdParams, PositionParams {}

export interface GetPositionParams extends EditorViewParams, ElementParams, CompareStateParams {}
export interface PositionerIdParams {
  /**
   * A unique id for the positioner.
   *
   * This is used to map the ref of the tracked component to a unique id and cant be updated without losing track of the
   * component's reference element.
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
   * The positioner object which determines how the changes in the view impact the calculated position.
   */
  positioner: Partial<Positioner>;
}

export interface UsePositionerParams<GRefKey extends string = 'ref'>
  extends PositionerIdParams,
    PositionerParams,
    RefParams<GRefKey> {}

/**
 * Used to mark a remirror specific component to determine it's behaviour.
 */
export enum RemirrorElementType {
  Extension = 'extension',
  SSR = 'ssr',
  EditorProvider = 'editor-provider',
  ManagedEditorProvider = 'managed-editor-provider',
  Editor = 'editor',
  Manager = 'manager',
  ManagerProvider = 'manager-provider',
  /**
   * Used to identify the ContextProviderWrapper
   */
  ContextProvider = 'context-provider',
}

export type RemirrorExtensionProps<
  GConstructor extends { prototype: AnyExtension },
  GExtension extends AbstractInstanceType<GConstructor>,
  GOptions extends OptionsOfExtension<GExtension>
> = GOptions & BaseExtensionProps & ExtensionConstructorProps<GConstructor, GExtension, GOptions>;

export type ExtensionConstructorProps<
  GConstructor extends { prototype: AnyExtension },
  GExtension extends AbstractInstanceType<GConstructor>,
  GOptions extends OptionsOfExtension<GExtension>
> = {
  /**
   * The constructor for the remirror extension.
   * Will be instantiated with the options passed through as props.
   */
  Constructor: GConstructor;
} & GOptions;

export interface BaseExtensionProps {
  /**
   * Sets the priority for the extension. Lower number means the extension is loaded first and gives it priority.
   * `-1` is loaded before `0` and will overwrite any conflicting configuration.
   *
   * Base extensions are loaded with a priority of 1.
   *
   * @default 2
   */
  priority?: number;
  children?: never;
}

export interface RegisterExtensionParams<GOptions extends {}> {
  /** The extension identifier */
  id: symbol;
  /** The instance of the extension with the options applied */
  extension: Extension<GOptions, any>;
  /**
   * The priority index for the extension
   * @defaultValue 2
   */
  priority: number;
}

/**
 * An extension component registration function which returns a function for un-registering the component
 */
export type RegisterExtension<GOptions extends {}> = (
  params: RegisterExtensionParams<GOptions>,
) => () => void;

export interface RemirrorComponentStaticProperties {
  /**
   * Identifies this as a remirror specific component
   */
  $$remirrorType: RemirrorElementType;
}

export type RemirrorComponentType<P extends {} = {}> = ComponentType<P> & RemirrorComponentStaticProperties;
export type RemirrorFC<P extends {} = {}> = FC<P> & RemirrorComponentStaticProperties;
export type RemirrorComponentClass<P extends {} = {}> = ComponentClass<P> & RemirrorComponentStaticProperties;
export type RemirrorElement<GOptions extends {} = any> = ReactElement<any> & {
  type: RemirrorComponentType<GOptions>;
};

export interface RemirrorManagerProps {
  /**
   * Sets the placeholder for the editor. Can pass in a tuple to set the text of the placeholder and the styles at the same time.
   * ```tsx
   * <Remirror placeholder={['Please enter your message', { color: 'red' }]} {...props} />
   * ```
   *
   * @defaultValue undefined
   */
  placeholder?: string | [string, ObjectInterpolation<undefined>];
  /**
   * Whether to use base extensions
   */
  useBaseExtensions?: boolean;
}
