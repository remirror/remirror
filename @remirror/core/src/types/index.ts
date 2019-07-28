import { MarkSpec, MarkType, NodeSpec, NodeType } from 'prosemirror-model';
import { Decoration } from 'prosemirror-view';
import { MarkGroup, NodeGroup, Tags } from '../constants';
import { NodeViewPortalContainer } from '../portal-container';
import { EditorView, Mark, NodeView, Transaction } from './aliases';
import { Attrs, BaseExtensionOptions, EditorSchema, EditorState, ProsemirrorNode, Value } from './base';
import {
  AttrsParams,
  EditorStateParams,
  EditorViewParams,
  ProsemirrorNodeParams,
  SchemaParams,
  TransactionParams,
} from './builders';

/**
 * Used to apply the Prosemirror transaction to the current EditorState.
 */
export type DispatchFunction = (tr: Transaction) => void;

/**
 * This function encapsulate an editing action.
 * A command function takes an editor state and optionally a dispatch function that it can use to dispatch a transaction.
 * It should return a boolean that indicates whether it could perform any action.
 *
 * When no dispatch callback is passed, the command should do a 'dry run', determining whether it is applicable,
 * but not actually doing anything
 */
export type CommandFunction = (
  state: EditorState,
  dispatch: DispatchFunction | undefined,
  view: EditorView,
) => boolean;

/**
 * A map of keyboard bindings and their corresponding command functions (a.k.a editing actions).
 */
export type KeyboardBindings = Record<string, CommandFunction>;

type DOMOutputSpecPos1 = DOMOutputSpecPosX | { [attr: string]: string };
type DOMOutputSpecPosX = string | 0 | [string, 0] | [string, { [attr: string]: string }, 0];

/**
 * Defines the return type of the toDom methods for both Nodes and marks
 *
 * @remarks
 * This differs from the default Prosemirror type definition which seemed didn't work at the time of writing.
 *
 * Additionally we don't want to support domNodes in the toDOM spec since this will create problems once SSR is fully supported
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
   * Defines the default way a node of this type should be serialized
   * to DOM/HTML (as used by
   * [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema)).
   *
   * Should return a {@link DOMOutputSpec} that describes a DOM node, with an
   * optional number zero (“hole”) in it to indicate where the node's
   * content should be inserted.
   */
  toDOM?: (node: ProsemirrorNode) => DOMOutputSpec;
}

/**
 * The schema spec definition for a mark extension
 */
export interface MarkExtensionSpec
  extends Pick<MarkSpec, 'attrs' | 'inclusive' | 'excludes' | 'group' | 'spanning' | 'parseDOM'> {
  /**
   * Defines the default way marks of this type should be serialized
   * to DOM/HTML.
   */
  toDOM?: (mark: Mark, inline: boolean) => DOMOutputSpec;
}

export interface ExtensionManagerInitParams {
  /**
   * Retrieve the portal container
   */
  portalContainer: NodeViewPortalContainer;
  /**
   * Retrieve the editor state via a function call
   */
  getState: () => EditorState;
}

export type ActionGetter<GActions extends string = string> = (name: GActions) => ActionMethod<any[]>;

/**
 * Parameters passed into many of the extension methods.
 */
export interface ExtensionManagerParams<GActions extends string = string>
  extends SchemaParams,
    ExtensionManagerInitParams,
    ExtensionTagParams {
  /**
   * A helper method to provide access to all actions for access to commands from within extensions
   */
  getActions: ActionGetter<GActions>;
}

/**
 * Inject a view into the params of the views.
 */
export interface ViewExtensionManagerParams extends EditorViewParams, ExtensionManagerParams {}

export type ExtensionCommandFunction = (...args: any[]) => CommandFunction;

export interface ExtensionBooleanFunctionParams<GCommand extends string> extends Partial<AttrsParams> {
  /**
   * When provided check the status of this particular command
   */
  command?: GCommand;
}
export type ExtensionBooleanFunction<GCommand extends string> = (
  params: ExtensionBooleanFunctionParams<GCommand>,
) => boolean;

/**
 * The return signature for an extension's `isActive` and `isEnabled` method
 */
export type BooleanExtensionCheck<GCommand extends string = string> = ExtensionBooleanFunction<GCommand>;

/**
 * The return signature for an extensions command method.
 */
export interface ExtensionCommandReturn {
  [command: string]: ExtensionCommandFunction;
}

/**
 * A utility type used to create the generic prosemirror typescript types.
 */
type InferredType<GType> = GType extends {} ? { type: GType } : {};

/**
 * Generic extension manager type params for methods which require a prosemirror NodeType.
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
   * This is useful for deciding whether or not to run a command especially if the command is
   * resource intensive or slow.
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
   * This could be used used for menu items to determine whether they should be highlighted as active or inactive.
   *
   * @param attrs - certain commands require attrs to run
   */
  isActive(attrs?: Attrs): boolean;

  /**
   * Returns true when the command can be run and false when it can't be run.
   *
   * @remarks
   * Some commands can have rules and restrictions. For example you may want to disable styling making text bold
   * when within a codeBlock. In that case isEnabled would be false when within the codeBlock and true when outside.
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
 * @param getPos - a utility method to get the absolute cursor position of the node.
 * @param decorations - a list of the decorations affecting this node view (in case the node view needs to update it's presentation)
 */
export type NodeViewMethod<GNodeView extends NodeView = NodeView> = (
  node: ProsemirrorNode,
  view: EditorView,
  getPos: () => number,
  decorations: Decoration[],
) => GNodeView;

export interface AnyActions {
  [action: string]: ActionMethod<any>;
}

/**
 * A function which takes a regex match array (strings) or a single string match and transforms
 * it into an `Attrs` object.
 */
export type GetAttrs = Attrs | ((p: string[] | string) => Attrs | undefined);

export interface GetAttrsParams {
  /**
   * A helper function for setting receiving a match array / string and setting the attributes for a node.
   */
  getAttrs: GetAttrs;
}

/**
 * A helper for creating SSR Component Props
 */
export type SSRComponentProps<
  GAttrs extends Attrs = any,
  GOptions extends BaseExtensionOptions = any
> = GAttrs & ProsemirrorNodeParams & { options: Required<GOptions> };

/**
 * The tag names that apply to any extension whether plain, node or mark. These are mostly used for nodes and marks
 * the main difference is they are added to the `tags` parameter of the extension rather than within the schema.
 */
export type GeneralExtensionTags<GNames extends string = string> = Record<Tags, GNames[]> &
  Record<string, undefined | GNames[]>;

/**
 * Provides the different mark groups which are defined in the mark extension specification.
 */
export type MarkExtensionTags<GMarks extends string = string> = Record<MarkGroup, GMarks[]> &
  Record<string, undefined | GMarks[]>;

/**
 * Provides an object of the different node groups `block` and `inline` which are defined in the node extension specification.
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
 * An interface with a `tags` parameter useful as a builder for parameter objects.
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

export * from './aliases';
export * from './base';
export * from './builders';
