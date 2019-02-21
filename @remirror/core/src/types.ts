import { InputRule } from 'prosemirror-inputrules';
import { Mark, MarkSpec, MarkType, Node as PMNode, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import {
  EditorState as PMEditorState,
  Plugin,
  Plugin as PMPlugin,
  Selection,
  Transaction,
} from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Omit } from 'simplytyped';

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
export type CommandFunction = (state: EditorState, dispatch?: DispatchFunction) => boolean;

/**
 * A map of keyboard bindings and their corresponding command functions (a.k.a editing actions).
 */
export type KeyboardBindings = Record<string, CommandFunction>;

/* The following is an alternative type definition for the built in Prosemirror definition
The current Prosemirror types were causing me some problems */

type DOMOutputSpecPos1 = DOMOutputSpecPosX | { [attr: string]: string } | DOMOutputSpecPosX[];
type DOMOutputSpecPosX = string | 0 | Node;
export type DOMOutputSpec =
  | DOMOutputSpecPosX
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
  toDOM?: ((mark: Mark) => DOMOutputSpec) | null;
};

/**
 * Alias type for better readability throughout the codebase.
 */
export type ProsemirrorNode = PMNode;
export type ProsemirrorPlugin = PMPlugin;
export type EditorSchema = Schema<string, string>;
export type EditorState = PMEditorState<EditorSchema>;
export { PMNode, PMPlugin };

export interface SchemaParams {
  schema: EditorSchema;
}

export interface SchemaWithStateParams extends SchemaParams {
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

// export interface ISharedExtension<
//   GSchemaType extends NodeType | MarkType,
//   T = GSchemaType extends NodeType ? NodeType : MarkType
// > extends IExtension {
//   readonly view: EditorView;
//   commands?(params: SchemaTypeParams<T>): FlexibleConfig<ExtensionCommandFunction>;
//   pasteRules(params: SchemaTypeParams<T>): ProsemirrorPlugin[];
//   inputRules(params: SchemaTypeParams<T>): InputRule[];
//   keys(params: SchemaTypeParams<T>): KeyboardBindings;
// }

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
  run(): void;
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

export type Literal = string | number | boolean | undefined | null | void | {};

export interface ObjectMark {
  type: string;
  attrs?: Record<string, string | null>;
}

export interface ObjectNode {
  type: string;
  marks?: Array<ObjectMark | string>;
  text?: string;
  content?: ObjectNode[];
  attrs?: Record<string, Literal | object>;
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
) => Plugin;

export interface FromTo {
  from: number;
  to: number;
}

/**
 * Makes specified keys of an interface optional while the rest stay the same.
 */
export type MakeOptional<GType extends {}, GKeys extends keyof GType> = Omit<GType, GKeys> &
  { [P in GKeys]+?: GType[P] };

/**
 * Makes specified keys of an interface nullable while the rest stay the same.
 */
export type MakeNullable<GType extends {}, GKeys extends keyof GType> = Omit<GType, GKeys> &
  { [P in GKeys]: GType[P] | null };

/**
 * Makes specified keys of an interface Required while the rest remain unchanged.
 */
export type MakeRequired<GType extends {}, GKeys extends keyof GType> = Omit<GType, GKeys> &
  { [P in GKeys]-?: GType[P] };

/**
 * Makes specified keys of an interface readonly.
 */
export type MakeReadonly<GType extends {}, GKeys extends keyof GType> = Omit<GType, GKeys> &
  { +readonly [P in GKeys]: GType[P] };
