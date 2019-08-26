import { Interpolation, ObjectInterpolation } from '@emotion/core';
import {
  AbstractInstanceType,
  ActionsFromExtensions,
  AnyExtension,
  CompareStateParams,
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
  RemirrorContentType,
  SchemaFromExtensions,
  TextParams,
  Transaction,
} from '@remirror/core';
import { ComponentClass, ComponentType, FC, ReactElement, ReactNode, Ref } from 'react';

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
   * // ... other properties
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
   * Sets the priority for the extension. Lower number means the extension is
   * loaded first and gives it priority. `-1` is loaded before `0` and will
   * overwrite any conflicting configuration.
   *
   * Base extensions are loaded with a priority of 1.
   *
   * @default 2
   */
  priority?: number;
  children?: never;
}

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
   * Whether to use base extensions
   */
  useBaseExtensions?: boolean;
}
