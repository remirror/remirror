import { InputRule } from 'prosemirror-inputrules';
import {
  Mark,
  MarkSpec,
  MarkType,
  Node as PMNode,
  NodeSpec,
  NodeType,
  Schema,
} from 'prosemirror-model';
import { EditorState, Plugin as PMPlugin, Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Omit } from 'simplytyped';

export type DispatchFunction = (tr: Transaction) => void;

export type CommandFunction = (state: EditorState<any>, dispatch?: DispatchFunction) => boolean;

export type Keys = Record<string, CommandFunction>;

type DOMOutputSpecPos1 = DOMOutputSpecPosX | { [attr: string]: string };
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

export type ProsemirrorNode = PMNode;
export type ProsemirrorPlugin = PMPlugin;
export type EditorSchema = Schema<string, string>;

export interface IExtension {
  readonly name: string;
  readonly type: string;
  readonly defaultOptions?: Record<string, any>;
  readonly plugins?: ProsemirrorPlugin[];
  commands?(
    params: SchemaParams,
  ):
    | ExtensionCommandFunction
    | ExtensionCommandFunction[]
    | Record<string, ExtensionCommandFunction | ExtensionCommandFunction[]>;
  pasteRules(params: SchemaParams): ProsemirrorPlugin[];
  inputRules(params: SchemaParams): InputRule[];
  keys(params: SchemaParams): Keys;
}

export interface SchemaParams {
  schema: Schema;
}

export type ExtensionCommandFunction = (attrs?: Attrs) => CommandFunction;

export interface SchemaTypeParams<T> extends SchemaParams {
  type: T;
}

export type SchemaNodeTypeParams = SchemaTypeParams<NodeType<EditorSchema>>;
export type SchemaMarkTypeParams = SchemaTypeParams<MarkType<EditorSchema>>;

export interface CommandParams extends SchemaParams {
  view: EditorView;
  editable: boolean;
}

export interface ISharedExtension<T extends NodeType | MarkType> extends IExtension {
  readonly view: any;
  commands?(
    params: SchemaTypeParams<T>,
  ):
    | ExtensionCommandFunction
    | ExtensionCommandFunction[]
    | Record<string, ExtensionCommandFunction>;
  pasteRules(params: SchemaTypeParams<T>): ProsemirrorPlugin[];
  inputRules(params: SchemaTypeParams<T>): InputRule[];
  keys(params: SchemaTypeParams<T>): Keys;
}

export interface INodeExtension extends ISharedExtension<NodeType<EditorSchema>> {
  readonly type: 'node';
  schema: NodeExtensionSpec;
}

export interface IMarkExtension extends ISharedExtension<MarkType<EditorSchema>> {
  readonly type: 'mark';
  schema: MarkExtensionSpec;
}

// export interface ActiveDocumentElements {}

export interface SuggestionsRange {
  from: number;
  to: number;
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
}

export type OffsetCalculatorMethod = (props: RawMenuPositionData) => number;
export type ShouldRenderMenu = (props: ShouldRenderMenuProps) => boolean;
export interface OffsetCalculator {
  top?: OffsetCalculatorMethod;
  left?: OffsetCalculatorMethod;
  right?: OffsetCalculatorMethod;
  bottom?: OffsetCalculatorMethod;
}

type ElementUnion = Value<HTMLElementTagNameMap>;
