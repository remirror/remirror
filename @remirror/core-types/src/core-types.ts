import { MarkSpec, MarkType, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { Decoration } from 'prosemirror-view';
import { ComponentType } from 'react';

import {
  ExtensionPriority,
  MarkGroup,
  NodeGroup,
  REMIRROR_IDENTIFIER_KEY,
  RemirrorIdentifier,
  Tag,
} from '@remirror/core-constants';

import {
  EditorSchema,
  EditorState,
  EditorView,
  Mark,
  NodeView,
  ProsemirrorNode,
  Transaction,
} from './alias-types';
import {
  AnyFunction,
  Attributes,
  CreateExtraAttributes,
  ExtraAttributes,
  GetExtraAttributes,
  ObjectNode,
  RegexTuple,
  Value,
} from './base-types';
import {
  AttributesParameter,
  EditorStateParameter,
  EditorViewParameter,
  NodeWithAttributesParameter,
  TransactionParameter,
} from './parameter-builders';

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
 * Used to apply the Prosemirror transaction to the current {@link EditorState}.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export type DispatchFunction<GSchema extends EditorSchema = any> = (
  tr: Transaction<GSchema>,
) => void;

/**
 * This is the type signature for commands within the prosemirror editor.
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
export type ProsemirrorCommandFunction<GSchema extends EditorSchema = any> = (
  state: EditorState<GSchema>,
  dispatch: DispatchFunction<GSchema> | undefined,
  view: EditorView<GSchema> | undefined,
) => boolean;

/**
 * This is the modified type signature for commands within the remirror editor.
 *
 * @typeParam Schema - the underlying editor schema.
 * @typeParam ExtraParameter - extra parameters to add to the command function.
 *
 * @remarks
 *
 * This groups all the prosemirror command arguments into a single parameter.
 *
 * @see {@link ProsemirrorCommandFunction}
 */
export type CommandFunction<
  GSchema extends EditorSchema = any,
  ExtraParameter extends object = {}
> = (params: CommandFunctionParameter<GSchema> & ExtraParameter) => boolean;

/**
 * Chained commands take a transaction and act on it before returning the
 * transaction.
 *
 * @remarks
 *
 * They allow for commands to be chained together before being used to update
 * the state and allow the composition of complex commands. They are
 * automatically created from `CommandFunction`'s by providing a fake dispatch
 * method to the command function which captures the updated `transaction` and
 * passes it onto the next chainable command.
 */
export type ChainedCommandFunction<Schema extends EditorSchema = any> = (
  transaction: TransactionParameter<Schema>,
) => void;

/**
 * A parameter builder interface for the remirror `CommandFunction`.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface CommandFunctionParameter<GSchema extends EditorSchema = any>
  extends Partial<EditorViewParameter<GSchema>>,
    EditorStateParameter<GSchema> {
  /**
   * The dispatch function which causes the command to be performed.
   *
   * @remarks
   *
   * `dispatch` can be `undefined`. When no `dispatch` callback is provided the
   * command should perform a 'dry run', determining whether the command is
   * applicable (`return true`), but not actually performing the action.
   */
  dispatch?: DispatchFunction<GSchema>;
}

export interface NextParameter<Schema extends EditorSchema = any>
  extends CommandFunctionParameter<Schema> {
  /**
   * A method to run the next (lower priority) command in the chain of
   * keybindings.
   *
   * @remarks
   *
   * This can be used to chain together keyboard commands between extensions.
   * It's possible that you will need to combine actions when a key is pressed
   * while still running the default action. This method allows for the
   * greater degree of control.
   *
   * By default, matching keyboard commands from the different extension are
   * chained together (in order of priority) until one returns `true`. Calling
   * `next` changes this default behaviour. The default keyboard chaining
   * stops and you are given full control of the keyboard command chain.
   */
  next: () => boolean;
}

/**
 * The command function passed to any of the keybindings.
 */
export type KeyBindingCommandFunction<GSchema extends EditorSchema = any> = CommandFunction<
  GSchema,
  NextParameter<GSchema>
>;

/**
 * A map of keyboard bindings and their corresponding command functions (a.k.a
 * editing actions).
 *
 * @typeParam GSchema - the underlying editor schema.
 *
 * @remarks
 *
 * Each keyboard binding returns an object mapping the keys pressed to the
 * {@link KeyBindingCommandFunction}. By default the highest priority extension
 * will be run first. If it returns true, then nothing else will be run after.
 * If it returns `false` then the next (lower priority) extension defining the
 * same keybinding will be run.
 *
 * It is possible to combine the commands being run by using the `next`
 * parameter. When called it will run the keybinding command function for the
 * proceeding (lower priority) extension. The act of calling the `next` method
 * will prevent the default flow from executing.
 */
export type KeyBindings<GSchema extends EditorSchema = any> = Record<
  string,
  KeyBindingCommandFunction<GSchema>
>;

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
  | [string, 0?]
  | [string, { [attr: string]: string }, 0?]
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
export interface ExtensionManagerParameter<GSchema extends EditorSchema = EditorSchema>
  extends ExtensionTagParameter {
  /**
   * A helper method for retrieving the state of the editor
   */
  getState: () => EditorState<GSchema>;

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
 * - {@link EditorViewParameter}
 * - {@link ExtensionManagerParameter}
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface ViewExtensionManagerParameter<GSchema extends EditorSchema = any>
  extends EditorViewParameter<GSchema>,
    ExtensionManagerParameter<GSchema> {}

export type ExtensionCommandFunction = (...args: any[]) => ProsemirrorCommandFunction;

export type ExtensionIsActiveFunction = (params: Partial<AttributesParameter>) => boolean;

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
type InferredType<GType> = GType extends never ? {} : { type: GType };

/**
 * Generic extension manager type params for methods which require a prosemirror
 * NodeType.
 *
 * This is used to generate the specific types for Marks and Nodes.
 */
export type ExtensionManagerTypeParameter<GType> = ExtensionManagerParameter & InferredType<GType>;

/**
 * The extension manager type params for a prosemirror `NodeType` extension
 */
export type ExtensionManagerNodeTypeParameter = ExtensionManagerTypeParameter<
  NodeType<EditorSchema>
>;

/**
 * The extension manager type params for a prosemirror `NodeType` extension
 */
export type ExtensionManagerMarkTypeParameter = ExtensionManagerTypeParameter<
  MarkType<EditorSchema>
>;

export interface CommandParameter extends ViewExtensionManagerParameter {
  /**
   * Returns true when the editor can be edited and false when it cannot.
   *
   * This is useful for deciding whether or not to run a command especially if
   * the command is resource intensive or slow.
   */
  isEditable: () => boolean;
}

export type CreateCommandsParameter<GType = never> = CommandParameter & InferredType<GType>;

export interface ActionMethod<Parameter extends any[] = []> {
  (...args: Parameter): void;

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
  isEnabled(attrs?: Attributes): boolean;
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
  getPos: (() => number) | boolean,
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

type GetAttributesFunction = (p: string[] | string) => Attributes | undefined;

/**
 * A function which takes a regex match array (strings) or a single string match
 * and transforms it into an `Attributes` object.
 */
export type GetAttributes = Attributes | GetAttributesFunction;

export interface GetAttributesParameter {
  /**
   * A helper function for setting receiving a match array / string and setting
   * the attributes for a node.
   */
  getAttrs: GetAttributes;
}

/**
 * The interface for SSR Component Props
 */
export interface SSRComponentProps<
  GOptions extends BaseExtensionSettings = BaseExtensionSettings,
  GAttributes extends Attributes = Attributes
> extends NodeWithAttributesParameter<GAttributes>, BaseExtensionSettingsParameter<GOptions> {}

/**
 * The tag names that apply to any extension whether plain, node or mark. These
 * are mostly used for nodes and marks the main difference is they are added to
 * the `tags` parameter of the extension rather than within the schema.
 */
export type GeneralExtensionTags<GNames extends string = string> = Record<Tag, GNames[]> &
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
export interface ExtensionTagParameter<
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
export interface OnTransactionParameter
  extends ViewExtensionManagerParameter,
    TransactionParameter,
    EditorStateParameter {}

export interface BaseExtensionSettings extends GlobalRemirrorExtensionSettings {
  /**
   * Inject additional attributes into the defined mark / node schema. This can
   * only be used for `NodeExtensions` and `MarkExtensions`.
   *
   * @remarks
   *
   * Sometimes you need to add additional attributes to a node or mark. This
   * property enables this without needing to create a new extension.
   *
   * - `extraAttributes: ['title']` Create an attribute with name `title`.When
   *   parsing the dom it will look for the attribute `title`
   * - `extraAttributes: [['custom', 'false', 'data-custom'],'title']` - Creates an
   *   attribute with name `custom` and default value `false`. When parsing the
   *   dom it will look for the attribute `data-custom`
   *
   * @defaultValue `[]`
   */
  extraAttributes?: ExtraAttributes[];

  /**
   * An object which excludes certain functionality from an extension.
   */
  exclude?: ExcludeOptions;

  /**
   * The priority with which this extension should be loaded by the manager.
   *
   * @remarks
   *
   * Each priority level corresponds to a higher level of importance for the
   * extension within the editor.
   *
   * When this is set to `null` the `defaultPriority` level for the extension
   * will be used instead.
   */
  priority?: ExtensionPriority | null;
}

export interface ExcludeOptions extends GlobalRemirrorExcludeOptions {
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
  keys?: boolean;

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
   * Whether to exclude the suggestions plugin configuration for the extension.
   *
   * @defaultValue `false`
   */
  suggesters?: boolean;
}

export interface SSRComponentParameter {
  /**
   * The component to render in SSR. The attrs are passed as props.
   *
   * @remarks
   *
   * Each node/mark extension can define it's own particular default component.
   *
   * This can only be consumed by Node and Mark extensions.
   */
  SSRComponent?: ComponentType<any> | null;
}

export interface BaseExtensionSettingsParameter<
  Settings extends BaseExtensionSettings = BaseExtensionSettings
> {
  /**
   * The static config that was passed into the extension that created this node
   * or mark.
   */
  settings: Settings;
}

/**
 * The parameters passed to the `createSchema` method for node and mark
 * extensions.
 */
export interface CreateSchemaParameter<Settings extends BaseExtensionSettings> {
  /**
   * All the static settings that have been passed into the extension when
   * being created (instantiated).
   */
  settings: Readonly<Settings>;

  /**
   * A method that creates the `AttributeSpec` for prosemirror that can be added
   * to a node or mark extension to provide extra functionality and store more
   * information within the DOM and prosemirror state..
   *
   * @remarks
   *
   * ```ts
   * const schema = {
   *   attrs: {
   *      ...createExtraAttributes({ fallback: null }),
   *      href: {
   *       default: null,
   *     },
   *   },
   * }
   */
  createExtraAttributes: CreateExtraAttributes;

  /**
   * Pull all extra attrs from the dom node provided.
   */
  getExtraAttributes: GetExtraAttributes;
}

/**
 * The core shape of any remirror specific object.
 */
export interface RemirrorIdentifierShape {
  [REMIRROR_IDENTIFIER_KEY]: RemirrorIdentifier;
}

declare global {
  /**
   * A global type which allows setting additional options on the exclude.
   */
  interface GlobalRemirrorExcludeOptions {}

  /**
   * A global type which allows additional default settings to be added to the
   * editor.
   */
  interface GlobalRemirrorExtensionSettings {}
}
