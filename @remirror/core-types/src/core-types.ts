import { MarkGroup, NodeGroup, Tags } from '@remirror/core-constants';
import { PortalContainer } from '@remirror/react-portals';
import { MarkSpec, MarkType, NodeSpec, NodeType } from 'prosemirror-model';
import { Decoration } from 'prosemirror-view';
import { ComponentType } from 'react';
import {
  EditorSchema,
  EditorState,
  EditorView,
  Mark,
  NodeView,
  ProsemirrorNode,
  Transaction,
} from './alias-types';
import { AnyFunction, Attrs, ExtraAttrs, ObjectNode, RegexTuple, Value } from './base-types';
import {
  AttrsParams,
  EditorStateParams,
  EditorViewParams,
  NodeWithAttrsParams,
  TransactionParams,
} from './type-builders';
import { RemirrorInterpolation, RemirrorThemeContextType } from './ui-types';

/**
 * Supported content for the remirror editor.
 *
 * @remarks
 *
 * Content can either be
 * - a string (which will be parsed by the stringHandler)
 * - JSON object matching Prosemirror expected shape
 * - A top level ProsemirrorNode
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export type RemirrorContentType<GSchema extends EditorSchema = any> =
  | string
  | ObjectNode
  | ProsemirrorNode<GSchema>
  | EditorState<GSchema>;

/**
 * Utility type for matching the name of a node to via a string or function.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export type NodeMatch<GSchema extends EditorSchema = any> =
  | string
  | ((name: string, node: ProsemirrorNode<GSchema>) => boolean)
  | RegexTuple;

/**
 * Used to apply the Prosemirror transaction to the current EditorState.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export type DispatchFunction<GSchema extends EditorSchema = any> = (tr: Transaction<GSchema>) => void;

/**
 * This is the type signature for actions within the prosemirror editor.
 *
 * @remarks
 *
 * A command function takes an editor state and optionally a dispatch function
 * that it can use to dispatch a transaction. It should return a boolean that
 * indicates whether it could perform any action.
 *
 * When no dispatch callback is passed, the command should do a 'dry run',
 * determining whether it is applicable, but not actually performing any action.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export type CommandFunction<GSchema extends EditorSchema = any> = (
  state: EditorState<GSchema>,
  dispatch: DispatchFunction<GSchema> | undefined,
  view: EditorView<GSchema>,
) => boolean;

/**
 * A map of keyboard bindings and their corresponding command functions (a.k.a
 * editing actions).
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export type KeyboardBindings<GSchema extends EditorSchema = any> = Record<string, CommandFunction<GSchema>>;

type DOMOutputSpecPos1 = DOMOutputSpecPosX | { [attr: string]: string };
type DOMOutputSpecPosX = string | 0 | [string, 0] | [string, { [attr: string]: string }, 0];

/**
 * Defines the return type of the toDom methods for both Nodes and marks
 *
 * @remarks
 * This differs from the default Prosemirror type definition which seemed didn't
 * work at the time of writing.
 *
 * Additionally we don't want to support domNodes in the toDOM spec since this
 * will create problems once SSR is fully supported
 */
export type DOMOutputSpec =
  | string
  | [string, 0]
  | [string, { [attr: string]: string }, 0]
  | [
      string,
      DOMOutputSpecPos1?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
    ];

/**
 * The schema spec definition for a node extension
 */
export interface NodeExtensionSpec
  extends Pick<
    NodeSpec,
    | 'content'
    | 'marks'
    | 'group'
    | 'inline'
    | 'atom'
    | 'attrs'
    | 'selectable'
    | 'draggable'
    | 'code'
    | 'defining'
    | 'isolating'
    | 'parseDOM'
    | 'toDebugString'
  > {
  /**
   * Defines the default way a node of this type should be serialized to
   * DOM/HTML (as used by
   * [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema)).
   *
   * Should return a {@link DOMOutputSpec} that describes a DOM node, with an
   * optional number zero (“hole”) in it to indicate where the node's content
   * should be inserted.
   */
  toDOM?: (node: ProsemirrorNode) => DOMOutputSpec;
}

/**
 * The schema spec definition for a mark extension
 */
export interface MarkExtensionSpec
  extends Pick<MarkSpec, 'attrs' | 'inclusive' | 'excludes' | 'group' | 'spanning' | 'parseDOM'> {
  /**
   * Defines the default way marks of this type should be serialized to
   * DOM/HTML.
   */
  toDOM?: (mark: Mark, inline: boolean) => DOMOutputSpec;
}

/**
 * The parameters passed into the extension manager init method.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface ExtensionManagerInitParams<GSchema extends EditorSchema = any> {
  /**
   * Retrieve the portal container
   */
  portalContainer: PortalContainer;
  /**
   * Retrieve the editor state via a function call
   */
  getState(): EditorState<GSchema>;

  /**
   * Provides access to the theme and helpers from the RemirrorThemeContext.
   */
  getTheme(): RemirrorThemeContextType;
}

/**
 * Pull an action method out of the extension manager.
 */
export type ActionGetter = (name: string) => ActionMethod<any[]>;

/**
 * Pull a helper method out of the extension manager.
 */
export type HelperGetter = (name: string) => AnyFunction;

/**
 * Parameters passed into many of the extension methods.
 */
export interface ExtensionManagerParams<GSchema extends EditorSchema = EditorSchema>
  extends ExtensionManagerInitParams<GSchema>,
    ExtensionTagParams {
  /**
   * A helper method to provide access to all the editor actions from within an
   * extension.
   */
  getActions: ActionGetter;

  /**
   * A helper method to provide access to all the helper methods from within an
   * extension.
   */
  getHelpers: HelperGetter;

  /**
   * The Prosemirror schema being used for the current interface
   */
  schema: GSchema;
}

/**
 * Parameters passed into many of the extension methods with a view added.
 *
 * Inherits from
 * - {@link EditorViewParams}
 * - {@link ExtensionManagerParams}
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface ViewExtensionManagerParams<GSchema extends EditorSchema = any>
  extends EditorViewParams<GSchema>,
    ExtensionManagerParams<GSchema> {}

export type ExtensionCommandFunction = (...args: any[]) => CommandFunction;

export interface CommandStatusFunctionParams<GCommand extends string> extends Partial<AttrsParams> {
  /**
   * When provided check the status of this particular command
   */
  command?: GCommand;
}
export type CommandStatusFunction<GCommand extends string> = (
  params: CommandStatusFunctionParams<GCommand>,
) => boolean;

/**
 * The return signature for an extension's `isActive` and `isEnabled` method
 */
export type CommandStatusCheck<GCommand extends string = string> = CommandStatusFunction<GCommand>;

/**
 * The return signature for an extensions command method.
 */
export interface ExtensionCommandReturn {
  [command: string]: ExtensionCommandFunction;
}
/**
 * The return signature for an extensions helper method.
 */
export interface ExtensionHelperReturn {
  [helper: string]: AnyFunction;
}

/**
 * A utility type used to create the generic prosemirror typescript types.
 */
type InferredType<GType> = GType extends {} ? { type: GType } : {};

/**
 * Generic extension manager type params for methods which require a prosemirror
 * NodeType.
 *
 * This is used to generate the specific types for Marks and Nodes.
 */
export type ExtensionManagerTypeParams<GType> = ExtensionManagerParams & InferredType<GType>;

/**
 * The extension manager type params for a prosemirror `NodeType` extension
 */
export type ExtensionManagerNodeTypeParams = ExtensionManagerTypeParams<NodeType<EditorSchema>>;

/**
 * The extension manager type params for a prosemirror `NodeType` extension
 */
export type ExtensionManagerMarkTypeParams = ExtensionManagerTypeParams<MarkType<EditorSchema>>;

export interface CommandParams extends ViewExtensionManagerParams {
  /**
   * Returns true when the editor can be edited and false when it cannot.
   *
   * This is useful for deciding whether or not to run a command especially if
   * the command is resource intensive or slow.
   */
  isEditable: () => boolean;
}

export type CommandTypeParams<GType> = CommandParams & InferredType<GType>;

export type CommandNodeTypeParams = CommandTypeParams<NodeType<EditorSchema>>;
export type CommandMarkTypeParams = CommandTypeParams<MarkType<EditorSchema>>;

export type ElementUnion = Value<HTMLElementTagNameMap>;

export interface ActionMethod<GParams extends any[] = []> {
  (...args: GParams): void;

  /**
   * Determines whether the command is currently in an active state.
   *
   * @remarks
   * This could be used used for menu items to determine whether they should be
   * highlighted as active or inactive.
   *
   * @param attrs - certain commands require attrs to run
   */
  isActive(attrs?: Attrs): boolean;

  /**
   * Returns true when the command can be run and false when it can't be run.
   *
   * @remarks
   * Some commands can have rules and restrictions. For example you may want to
   * disable styling making text bold when within a codeBlock. In that case
   * isEnabled would be false when within the codeBlock and true when outside.
   *
   * @param attrs - certain commands require attrs to run
   */
  isEnabled(attrs?: Attrs): boolean;
}

/**
 * The method signature used to call the Prosemirror `nodeViews`
 *
 * @param node - the node which uses this nodeView
 * @param view - the editor view used by this nodeView
 * @param getPos - a utility method to get the absolute cursor position of the
 * node.
 * @param decorations - a list of the decorations affecting this node view (in
 * case the node view needs to update it's presentation)
 */
export type NodeViewMethod<GNodeView extends NodeView = NodeView> = (
  node: ProsemirrorNode,
  view: EditorView,
  getPos: () => number,
  decorations: Decoration[],
) => GNodeView;

/**
 * The type signature for all actions.
 */
export interface AnyActions {
  [action: string]: ActionMethod<any>;
}

/**
 * The type signature for all helpers.
 */
export interface AnyHelpers {
  [helper: string]: AnyFunction;
}

/**
 * A function which takes a regex match array (strings) or a single string match
 * and transforms it into an `Attrs` object.
 */
export type GetAttrs = Attrs | ((p: string[] | string) => Attrs | undefined);

export interface GetAttrsParams {
  /**
   * A helper function for setting receiving a match array / string and setting
   * the attributes for a node.
   */
  getAttrs: GetAttrs;
}

/**
 * The interface for SSR Component Props
 */
export interface SSRComponentProps<
  GOptions extends BaseExtensionOptions = BaseExtensionOptions,
  GAttrs extends Attrs = Attrs
> extends NodeWithAttrsParams<GAttrs>, BaseExtensionOptionsParams<GOptions> {}

/**
 * The tag names that apply to any extension whether plain, node or mark. These
 * are mostly used for nodes and marks the main difference is they are added to
 * the `tags` parameter of the extension rather than within the schema.
 */
export type GeneralExtensionTags<GNames extends string = string> = Record<Tags, GNames[]> &
  Record<string, undefined | GNames[]>;

/**
 * Provides the different mark groups which are defined in the mark extension
 * specification.
 */
export type MarkExtensionTags<GMarks extends string = string> = Record<MarkGroup, GMarks[]> &
  Record<string, undefined | GMarks[]>;

/**
 * Provides an object of the different node groups `block` and `inline` which
 * are defined in the node extension specification.
 */
export type NodeExtensionTags<GNodes extends string = string> = Record<NodeGroup, GNodes[]> &
  Record<string, undefined | GNodes[]>;

/**
 * The shape of the tag data stored by the extension manager.
 *
 * This data can be used by other extensions to dynamically determine which
 * nodes should affected by commands / plugins / keys etc...
 */
export interface ExtensionTags<
  GNodes extends string = string,
  GMarks extends string = string,
  GPlain extends string = string
> {
  node: NodeExtensionTags<GNodes>;
  mark: MarkExtensionTags<GMarks>;
  general: GeneralExtensionTags<GPlain | GNodes | GMarks>;
}

/**
 * An interface with a `tags` parameter useful as a builder for parameter
 * objects.
 */
export interface ExtensionTagParams<
  GNodes extends string = string,
  GMarks extends string = string,
  GPlain extends string = string
> {
  /**
   * The tags provided by the configured extensions.
   */
  tags: ExtensionTags<GNodes, GMarks, GPlain>;
}

/**
 * The params object received by the onTransaction handler.
 */
export interface OnTransactionParams
  extends ViewExtensionManagerParams,
    TransactionParams,
    EditorStateParams {}

export interface BaseExtensionOptions {
  /**
   * Add extra styles to the extension.
   */
  extraStyles?: RemirrorInterpolation;

  /**
   * Inject additional attributes into the defined mark / node schema. This can
   * only be used for `NodeExtensions` and `MarkExtensions`.
   *
   * @remarks
   *
   * Sometimes you need to add additional attributes to a node or mark. This
   * property enables this without needing to create a new extension.
   *
   * - `extraAttrs: ['title']` Create an attribute with name `title`.When
   *   parsing the dom it will look for the attribute `title`
   * - `extraAttrs: [['custom', 'false', 'data-custom'],'title']` - Creates an
   *   attribute with name `custom` and default value `false`. When parsing the
   *   dom it will look for the attribute `data-custom`
   *
   * @defaultValue `[]`
   */
  extraAttrs?: ExtraAttrs[];

  /**
   * A configuration object which allows for excluding certain functionality
   * from an extension.
   */
  exclude?: ExcludeOptions;
}

export interface ExcludeOptions {
  /**
   * Whether to exclude the extension's styles.
   *
   * @defaultValue `false`
   */
  styles?: boolean;

  /**
   * Whether to exclude the extension's pasteRules
   *
   * @defaultValue `false`
   */
  pasteRules?: boolean;

  /**
   * Whether to exclude the extension's inputRules
   *
   * @defaultValue `false`
   */
  inputRules?: boolean;

  /**
   * Whether to exclude the extension's keymaps
   *
   * @defaultValue `false`
   */
  keymaps?: boolean;

  /**
   * Whether to exclude the extension's plugin
   *
   * @defaultValue `false`
   */
  plugin?: boolean;

  /**
   * Whether to exclude the extension's nodeView
   *
   * @defaultValue `false`
   */
  nodeView?: boolean;

  /**
   * Whether to use the attributes provided by this extension
   *
   * @defaultValue `false`
   */
  attributes?: boolean;

  /**
   * Whether to use the SSR component when not in a DOM environment
   *
   * @defaultValue `false`
   */
  ssr?: boolean;

  /**
   * Whether to include the suggestions plugin configuration for the extension.
   *
   * @defaultValue `false`
   */
  suggesters?: boolean;
}

export interface SSRComponentParams {
  /**
   * The component to render in SSR. The attrs are passed as props.
   *
   * Each node/mark extension can define it's own particular default component
   */
  SSRComponent?: ComponentType<any>;
}

export interface NodeExtensionOptions extends BaseExtensionOptions, SSRComponentParams {}
export interface MarkExtensionOptions extends BaseExtensionOptions, SSRComponentParams {}

export interface BaseExtensionOptionsParams<GOptions extends BaseExtensionOptions = BaseExtensionOptions> {
  /**
   * The options that were passed into the extension that created this nodeView
   */
  options: GOptions;
}
