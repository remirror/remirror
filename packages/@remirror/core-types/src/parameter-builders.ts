import type {
  EditorSchema,
  EditorState,
  EditorView,
  Mark,
  MarkType,
  NodeType,
  ProsemirrorNode,
  ResolvedPos,
  Selection,
  Transaction,
} from './alias-types';
import type {
  MakeOptional,
  MarkAttributes,
  NodeAttributes,
  Position,
  ProsemirrorAttributes,
} from './base-types';

/**
 * A parameter builder interface containing the `view` property.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface EditorViewParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * An instance of the Prosemirror editor `view`.
   */
  view: EditorView<Schema>;
}

/**
 * A parameter builder interface containing the `schema` property.
 *
 * @typeParam GNodes - the names of the nodes within the editor schema.
 * @typeParam GMarks - the names of the marks within the editor schema.
 */
export interface SchemaParameter<Nodes extends string = string, Marks extends string = string> {
  /**
   * The Prosemirror schema being used for the current interface
   */
  schema: EditorSchema<Nodes, Marks>;
}

/**
 * A parameter builder interface containing the `state` property.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface EditorStateParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * A snapshot of the prosemirror editor state.
   */
  state: EditorState<Schema>;
}

export interface TrStateParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The shared types between a state and a transaction. Allows for commands to
   * operate on either a state object or a transaction object.
   */
  trState: EditorState<Schema> | Transaction<Schema>;
}

/**
 * A parameter builder interface for comparing two instances of the editor state.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface CompareStateParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The previous snapshot of the prosemirror editor state.
   */
  oldState: EditorState<Schema>;

  /**
   * The latest snapshot of the prosemirror editor state.
   */
  newState: EditorState<Schema>;
}

/**
 * A parameter builder interface for a html dom `element`.
 */
export interface ElementParameter {
  /**
   * The target HTML element
   */
  element: HTMLElement;
}

/**
 * A parameter builder interface describing a `from`/`to` range.
 */
export interface FromToParameter {
  /**
   * The starting point
   */
  from: number;

  /**
   * The ending point
   */
  to: number;
}

/**
 * A parameter builder type which uses {@link FromToParameter} where `from` or `to`, or both
 * can be set as optional.
 *
 * @typeParam Key - the keys to set as optional (either `from` or `to`).
 */
export type OptionalFromToParameter<Key extends keyof FromToParameter> = MakeOptional<
  FromToParameter,
  Key
>;

/**
 * A parameter builder interface containing the `position` property.
 */
export interface PositionParameter {
  /**
   * Defines a generic position with coordinates
   */
  position: Position;
}

/**
 * A parameter builder interface containing the `attrs` property.
 */
export interface AttributesParameter {
  /**
   * An object describing the attrs for a prosemirror mark / node
   */
  attrs: ProsemirrorAttributes;
}

/**
 * A parameter builder interface containing the `attrs` property.
 */
export interface NodeAttributesParameter {
  /**
   * An object describing the attrs for a prosemirror node
   */
  attrs: NodeAttributes;
}

/**
 * This interface contains the default mark attributes.
 */
export interface MarkAttributesParameter {
  /**
   * An object describing the attrs for a mark.
   */
  attrs: MarkAttributes;
}

/**
 * A parameter builder interface containing the node `type` property.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface NodeTypeParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * A prosemirror node type instance.
   */
  type: NodeType<Schema>;
}

/**
 * A parameter builder interface containing the `types` property which takes a
 * single type or multiple types.
 *
 * @remarks
 *
 * This can be used to check whether a certain type matches any of these types.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface NodeTypesParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The prosemirror node types to use.
   */
  types: NodeType<Schema> | string | Array<NodeType<Schema> | string>;
}

/**
 * A parameter builder interface containing the `types` property which takes a
 * single type or multiple types.
 *
 * @remarks
 *
 * This can be used to check whether a certain type matches any of these types.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface MarkTypesParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The prosemirror node types to use.
   */
  types: MarkType<Schema> | Array<MarkType<Schema>>;
}

/**
 * A parameter builder interface containing the mark `type` property.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface MarkTypeParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The prosemirror mark type instance.
   */
  type: MarkType<Schema>;
}

export interface ProsemirrorNodeParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The prosemirror node
   */
  node: ProsemirrorNode<Schema>;
}

export type NodeWithAttributes<
  Attributes extends NodeAttributes = NodeAttributes
> = ProsemirrorNode & {
  attrs: Attributes;
};

export interface NodeWithAttributesParameter<Attributes extends NodeAttributes = NodeAttributes> {
  /**
   * A prosemirror node with a specific shape for `node.attrs`
   */
  node: NodeWithAttributes<Attributes>;
}

export type MarkWithAttributes<Attributes extends MarkAttributes = MarkAttributes> = Mark & {
  attrs: Attributes;
};

export interface MarkWithAttributesParameter<Attributes extends MarkAttributes = MarkAttributes> {
  /**
   * A mark with a specific shape for `node.attrs`
   */
  mark: MarkWithAttributes<Attributes>;
}

export interface DocParameter {
  /**
   * The parent doc node of the editor which contains all the other nodes.
   * This is also a ProsemirrorNode
   */
  doc: ProsemirrorNode;
}

export interface OptionalProsemirrorNodeParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The nullable prosemirror node which may or may not exist.
   */
  node: ProsemirrorNode<Schema> | null | undefined;
}

export interface OptionalMarkParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The nullable prosemirror mark which may or may not exist.
   */
  mark: Mark<Schema> | null | undefined;
}

export interface PosParameter {
  /**
   * The position of the referenced prosemirror item.
   */
  pos: number;
}

export interface TransactionParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The prosemirror transaction
   */
  tr: Transaction<Schema>;
}

export interface CallbackParameter {
  /**
   * A simple callback to run.
   */
  callback: () => void;
}

/**
 * Receives a transaction and returns an new transaction.
 *
 * Can be used to update the transaction and customise commands.
 */
export type TransactionTransformer<Schema extends EditorSchema = EditorSchema> = (
  tr: Transaction<Schema>,
  state: EditorState<Schema>,
) => Transaction<Schema>;

export interface TransactionLifecycle {
  /**
   * Transform the transaction before the command is run.
   */
  before: TransactionTransformer;

  /**
   * Transform the transaction after everything else but before dispatch.
   */
  after: TransactionTransformer;
}

export interface RangeParameter<Key extends keyof FromToParameter = never> {
  /**
   * The from/to interface.
   */
  range: OptionalFromToParameter<Key>;
}

export interface ResolvedPosParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * A prosemirror resolved pos with provides helpful context methods when working with
   * a position in the editor.
   */
  $pos: ResolvedPos<Schema>;
}

export interface TextParameter {
  /**
   * The text to insert or work with.
   */
  text: string;
}

export interface SelectionParameter<Schema extends EditorSchema = EditorSchema> {
  /**
   * The text editor selection
   */
  selection: Selection<Schema>;
}

export interface PredicateParameter<Parameter> {
  /**
   * The predicate function
   */
  predicate: (parameter: Parameter) => boolean;
}

export interface RegExpParameter {
  /**
   * The regular expression to test against.
   */
  regexp: RegExp;
}

/**
 * Shows the previous and next value.
 */
export interface PreviousNextParameter<Type> {
  /**
   * The previous value.
   */
  previous: Type;

  /**
   * The next value.
   */
  next: Type;
}
