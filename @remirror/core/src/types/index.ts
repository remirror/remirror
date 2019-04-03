import { MarkSpec, MarkType, Node as PMNode, NodeSpec, NodeType } from 'prosemirror-model';
import { Plugin as PMPlugin } from 'prosemirror-state';
import { Decoration } from 'prosemirror-view';
import { NodeViewPortalContainer } from '../portal-container';
import { EditorView, InputRule, Mark, NodeView, Transaction } from './aliases';
import { AnyFunction, Attrs, EditorSchema, EditorState, Omit, ProsemirrorNode } from './base';
import { EditorViewParams, SchemaParams } from './builders';

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

/* The following is an alternative type definition for the built in Prosemirror definition
The current Prosemirror types were causing me some problems

Also I want don't want to be able to use domNodes in the toDOM spec since this will create problems once SSR is enabled.
*/

type DOMOutputSpecPos1 = DOMOutputSpecPosX | { [attr: string]: string };
type DOMOutputSpecPosX = string | 0 | [string, 0] | [string, { [attr: string]: string }, 0];
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

export type NodeExtensionSpec = Omit<NodeSpec, 'toDOM'> & {
  toDOM?: ((node: ProsemirrorNode) => DOMOutputSpec) | null;
};

export type MarkExtensionSpec = Omit<MarkSpec, 'toDOM'> & {
  toDOM?: ((mark: Mark, inline: boolean) => DOMOutputSpec) | null;
};

export interface ExtensionManagerParams extends SchemaParams {
  /**
   * Retrieve the portal container
   */
  getPortalContainer: () => NodeViewPortalContainer;
  /**
   * Retrieve the editor state via a function call
   */
  getEditorState: () => EditorState;
}

/**
 * Inject a view into the params of the views.
 */
export interface ViewExtensionManagerParams extends EditorViewParams, ExtensionManagerParams {}

export type FlexibleConfig<GFunc extends AnyFunction, GNames extends string = string> =
  | GFunc
  | GFunc[]
  | Record<GNames, GFunc | GFunc[]>;

export type ExtensionCommandFunction = (attrs?: Attrs) => CommandFunction;
export type ExtensionBooleanFunction = (attrs?: Attrs) => boolean;

type InferredType<GType> = GType extends {} ? { type: GType } : {};
export type SchemaTypeParams<GType> = ExtensionManagerParams & InferredType<GType>;

export type SchemaNodeTypeParams = SchemaTypeParams<NodeType<EditorSchema>>;
export type SchemaMarkTypeParams = SchemaTypeParams<MarkType<EditorSchema>>;

export interface CommandParams extends ExtensionManagerParams {
  view: EditorView;
  isEditable: () => boolean;
}

/* Utility Types */

export type Key<GRecord> = keyof GRecord;
export type Value<GRecord> = GRecord[Key<GRecord>];

export type ElementUnion = Value<HTMLElementTagNameMap>;

export interface ActionMethods {
  command(attrs?: Attrs): void;
  isActive(attrs?: Attrs): boolean;
  isEnabled(attrs?: Attrs): boolean;
}

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
}

/**
 * Defines the type of the extension.
 */
export enum ExtensionType {
  NODE = 'node',
  MARK = 'mark',
  EXTENSION = 'extension',
}

export type GetAttrs = Attrs | ((p: string[] | string) => Attrs | null | undefined);

export type InputRuleCreator = (
  regexp: RegExp,
  nodeType: NodeType,
  getAttrs?: GetAttrs,
  joinPredicate?: (p1: string[], p2: PMNode) => boolean,
) => InputRule;

export type PluginCreator = <GType extends NodeType | MarkType>(
  regexp: RegExp,
  nodeType: GType,
  getAttrs?: GetAttrs,
  joinPredicate?: (p1: string[], p2: PMNode) => boolean,
) => PMPlugin;

export * from './aliases';
export * from './base';
export * from './builders';
