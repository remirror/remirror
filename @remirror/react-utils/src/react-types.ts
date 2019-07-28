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
  ExtensionManager,
  MappedHelpersFromExtensionList,
  ObjectNode,
  OptionsOfExtension,
  PlainObject,
  Position,
  PositionParams,
  RemirrorContentType,
  SchemaFromExtensionList,
  TextParams,
} from '@remirror/core';
import { ComponentClass, ComponentType, FC, ReactElement, ReactNode, Ref } from 'react';

export interface Positioner<GExtensions extends AnyExtension[] = AnyExtension[]> {
  /**
   * The default and initial position value. This is used at the start and
   * whenever isActive becomes false
   */

  initialPosition: Position;
  /**
   * Determines whether anything has changed and whether to continue with a
   * recalculation
   *
   * @param params
   */
  hasChanged(params: CompareStateParams<SchemaFromExtensionList<GExtensions>>): boolean;

  /**
   * Determines whether the positioner should be active
   */
  isActive(params: GetPositionParams<GExtensions>): boolean;

  /**
   * Calculate and return a new position (only called when `hasChanged` and
   * `isActive` return true)
   */
  getPosition(params: GetPositionParams<GExtensions>): Position;
}

export type CalculatePositionerParams<
  GExtensions extends AnyExtension[] = AnyExtension[]
> = PositionerIdParams & Positioner<GExtensions>;

export type GetPositionerPropsConfig<
  GExtensions extends AnyExtension[] = AnyExtension[],
  GRefKey extends string = 'ref'
> = RefParams<GRefKey> &
  Partial<Omit<CalculatePositionerParams<GExtensions>, 'positionerId'>> &
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
export interface InjectedRemirrorProps<GExtensions extends AnyExtension[] = AnyExtension[]> {
  /**
   * An instance of the extension manager
   */
  manager: ExtensionManager<GExtensions>;
  /**
   * The prosemirror view
   */
  view: EditorView<SchemaFromExtensionList<GExtensions>>;

  /**
   * A map of all actions made available by the configured extensions.
   */
  actions: ActionsFromExtensionList<GExtensions>;

  /**
   * A map of all helpers made available by the configured extensions.
   */
  helpers: MappedHelpersFromExtensionList<GExtensions>;

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
    options: GetPositionerPropsConfig<GExtensions, GRefKey>,
  ): GetPositionerReturn<GRefKey>;

  /**
   * The previous and next state
   */
  state: CompareStateParams<SchemaFromExtensionList<GExtensions>>;
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

export interface BaseListenerParams<GExtensions extends AnyExtension[] = AnyExtension[]>
  extends EditorViewParams<SchemaFromExtensionList<GExtensions>>,
    RemirrorGetterParams {}

export interface RemirrorEventListenerParams<GExtensions extends AnyExtension[] = AnyExtension[]>
  extends EditorStateParams<SchemaFromExtensionList<GExtensions>>,
    BaseListenerParams {}

export interface RemirrorStateListenerParams<GExtensions extends AnyExtension[] = AnyExtension[]>
  extends CompareStateParams<SchemaFromExtensionList<GExtensions>>,
    BaseListenerParams<GExtensions> {
  /**
   * Allows for the creation of a new state object with the desired content
   */
  createStateFromContent(content: RemirrorContentType): EditorState<SchemaFromExtensionList<GExtensions>>;
}

export type RemirrorEventListener<GExtensions extends AnyExtension[] = AnyExtension[]> = (
  params: RemirrorEventListenerParams<GExtensions>,
) => void;

export type AttributePropFunction<GExtensions extends AnyExtension[] = AnyExtension[]> = (
  params: RemirrorEventListenerParams<GExtensions>,
) => Record<string, string>;

export interface PlaceholderConfig extends TextParams {
  className: string;
  style: ObjectInterpolation<undefined>;
}

export type PositionerMapValue = ElementParams & {
  prev: PositionerProps;
};

export interface PositionerRefFactoryParams extends PositionerIdParams, PositionParams {}

export interface GetPositionParams<GExtensions extends AnyExtension[] = AnyExtension[]>
  extends EditorViewParams<SchemaFromExtensionList<GExtensions>>,
    ElementParams,
    CompareStateParams<SchemaFromExtensionList<GExtensions>> {}

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
