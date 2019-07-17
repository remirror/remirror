import { MarkSpec, MarkType, NodeSpec, NodeType } from 'prosemirror-model';
import { Decoration } from 'prosemirror-view';
import { NodeViewPortalContainer } from '../portal-container';
import { EditorView, Mark, NodeView, Transaction } from './aliases';
import {
  AnyFunction,
  Attrs,
  BaseExtensionOptions,
  EditorSchema,
  EditorState,
  ProsemirrorNode,
  Value,
} from './base';
import { AttrsParams, EditorViewParams, PMNodeParams, SchemaParams } from './builders';

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

export type ActionGetter = <GAttrs = Attrs>(name: string) => ActionMethods<GAttrs>;
/**
 * Parameters passed into many of the extension methods.
 */
export interface ExtensionManagerParams extends SchemaParams, ExtensionManagerInitParams {
  /**
   * A helper method to provide access to all actions for access to commands from within extensions
   */
  getActions: ActionGetter;
}

/**
 * Inject a view into the params of the views.
 */
export interface ViewExtensionManagerParams extends EditorViewParams, ExtensionManagerParams {}

export type FlexibleConfig<GFunc extends AnyFunction, GNames extends string = string> = Record<
  GNames,
  GFunc | GFunc[]
>;

export type ExtensionCommandFunction = (attrs?: Attrs) => CommandFunction;

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
export type BooleanExtensionCheck<GCommand extends string> = ExtensionBooleanFunction<GCommand>;

/**
 * The return signature for an extensions command method.
 */
export type ExtensionCommandReturn<GCommands extends string> = FlexibleConfig<
  ExtensionCommandFunction,
  GCommands
>;

type InferredType<GType> = GType extends {} ? { type: GType } : {};
export type SchemaTypeParams<GType> = ExtensionManagerParams & InferredType<GType>;

export type SchemaNodeTypeParams = SchemaTypeParams<NodeType<EditorSchema>>;
export type SchemaMarkTypeParams = SchemaTypeParams<MarkType<EditorSchema>>;

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

export interface ActionMethods<GAttrs = Attrs> {
  /**
   * Runs an action within the editor.
   *
   * @remarks
   *
   * ```ts
   * actions.bold() // Make the currently selected text bold
   * ```
   *
   * @param attrs - certain commands require attrs to run
   */
  (attrs?: GAttrs): void;

  /**
   * Determines whether the command is currently in an active state.
   *
   * @remarks
   * This could be used used for menu items to determine whether they should be highlighted as active or inactive.
   */
  isActive(attrs?: GAttrs): boolean;

  /**
   * Returns true when the command can be run and false when it can't be run.
   *
   * @remarks
   * Some commands can have rules and restrictions. For example you may want to disable styling making text bold
   * when within a codeBlock. In that case isEnabled would be false when within the codeBlock and true when outside.
   */
  isEnabled(attrs?: GAttrs): boolean;
}

/**
 * The method signature used to call the Prosemirror `nodeViews`
 */
export type NodeViewMethod<GNodeView extends NodeView = NodeView> = (
  node: ProsemirrorNode,
  view: EditorView,
  getPos: () => number,
  decorations: Decoration[],
) => GNodeView;

export type RemirrorActions<GKeys extends string = string> = Record<GKeys, ActionMethods>;

/**
 * Marks are categorized into different groups. One motivation for this was to allow the `code` mark
 * to exclude other marks, without needing to explicitly name them. Explicit naming requires the
 * named mark to exist in the schema. This is undesirable because we want to construct different
 * schemas that have different sets of nodes/marks.
 */
export enum MarkGroup {
  FONT_STYLE = 'fontStyle',
  SEARCH_QUERY = 'searchQuery',
  LINK = 'link',
  COLOR = 'color',
  ALIGNMENT = 'alignment',
  INDENTATION = 'indentation',
  BEHAVIOR = 'behavior',
}

/**
 * Defines the type of the extension.
 */
export enum ExtensionType {
  NODE = 'node',
  MARK = 'mark',
  EXTENSION = 'extension',
}

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
> = GAttrs & PMNodeParams & { options: Required<GOptions> };

export * from './aliases';
export * from './base';
export * from './builders';
