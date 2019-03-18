import { MarkSpec, MarkType, Node as PMNode, NodeSpec, NodeType } from 'prosemirror-model';
import { Plugin as PMPlugin } from 'prosemirror-state';
import { NodeViewPortalContainer } from '../portal-container';
import { EditorView, InputRule, Mark, Selection, Transaction } from './aliases';
import { EditorSchema, EditorState, Omit, ProsemirrorNode } from './base';

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
type DOMOutputSpecPosX = string | 0 | [string, 0];
export type DOMOutputSpec =
  | string
  | [string, 0]
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
      DOMOutputSpecPosX?
    ];

export type NodeExtensionSpec = Omit<NodeSpec, 'toDOM'> & {
  toDOM?: ((node: ProsemirrorNode) => DOMOutputSpec) | null;
};

export type MarkExtensionSpec = Omit<MarkSpec, 'toDOM'> & {
  toDOM?: ((mark: Mark, inline: boolean) => DOMOutputSpec) | null;
};

export interface SchemaParams {
  schema: EditorSchema;
  getPortalContainer: () => NodeViewPortalContainer;
  getEditorState: () => EditorState;
}

export type FlexibleConfig<GFunc> = GFunc | GFunc[] | Record<string, GFunc | GFunc[]>;

export type ExtensionCommandFunction = (attrs?: Attrs) => CommandFunction;
export type ExtensionBooleanFunction = (attrs?: Attrs) => boolean;

// export interface SchemaTypeParams<GSchemaType = never> extends SchemaParams {
//   type: GSchemaType;
// }

type InferredType<TT> = TT extends {} ? { type: TT } : {};
export type SchemaTypeParams<TT> = SchemaParams & InferredType<TT>;

export type SchemaNodeTypeParams = SchemaTypeParams<NodeType<EditorSchema>>;
export type SchemaMarkTypeParams = SchemaTypeParams<MarkType<EditorSchema>>;

export interface CommandParams extends SchemaParams {
  view: EditorView;
  isEditable: () => boolean;
}

export type Attrs = Record<string, string>;

/* Utility Types */

export type Key<GRecord> = keyof GRecord;
export type Value<GRecord> = GRecord[Key<GRecord>];

export interface Position {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface ShouldRenderMenuProps {
  offsetWidth: number;
  offsetHeight: number;
  selection: Selection;
  emptySelection: boolean;
}

export interface RawMenuPositionData extends Position, ShouldRenderMenuProps {
  windowTop: number;
  windowLeft: number;
  windowBottom: number;
  windowRight: number;
  nonTextNode: Pick<HTMLElement, 'offsetWidth' | 'offsetHeight' | 'offsetLeft' | 'offsetTop'>;
}

export type OffsetCalculatorMethod = (props: RawMenuPositionData) => number;
export type ShouldRenderMenu = (props: ShouldRenderMenuProps) => boolean;
export interface OffsetCalculator {
  top?: OffsetCalculatorMethod;
  left?: OffsetCalculatorMethod;
  right?: OffsetCalculatorMethod;
  bottom?: OffsetCalculatorMethod;
}

export type ElementUnion = Value<HTMLElementTagNameMap>;

export interface ActionMethods {
  command(attrs?: Attrs): void;
  isActive(): boolean;
  isEnabled(): boolean;
}

export type RemirrorActions<GKeys extends string = string> = Record<GKeys, ActionMethods>;

/**
 * Marks are categorised into different groups. One motivation for this was to allow the `code` mark
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

export interface FromTo {
  from: number;
  to: number;
}

export * from './aliases';
export * from './base';
