import {
  EditorSchema,
  EditorState,
  EditorView,
  MarkType,
  NodeType,
  ProsemirrorNode,
  ResolvedPos,
  Selection,
  Transaction,
} from './alias-types';
import { Attrs, MakeOptional, Position } from './base-types';

/**
 * A parameter builder interface containing the `view` property.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface EditorViewParams<GSchema extends EditorSchema = any> {
  /**
   * An instance of the Prosemirror editor `view`.
   */
  view: EditorView<GSchema>;
}

/**
 * A parameter builder interface containing the `schema` property.
 *
 * @typeParam GNodes - the names of the nodes within the editor schema.
 * @typeParam GMarks - the names of the marks within the editor schema.
 */
export interface SchemaParams<GNodes extends string = string, GMarks extends string = string> {
  /**
   * The Prosemirror schema being used for the current interface
   */
  schema: EditorSchema<GNodes, GMarks>;
}

/**
 * A parameter builder interface containing the `state` property.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface EditorStateParams<GSchema extends EditorSchema = any> {
  /**
   * A snapshot of the prosemirror editor state
   */
  state: EditorState<GSchema>;
}

/**
 * A parameter builder interface for comparing two instances of the editor state.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface CompareStateParams<GSchema extends EditorSchema = any> {
  /**
   * The previous snapshot of the prosemirror editor state.
   */
  oldState: EditorState<GSchema>;

  /**
   * The latest snapshot of the prosemirror editor state.
   */
  newState: EditorState<GSchema>;
}

/**
 * A parameter builder interface for a html dom `element`.
 */
export interface ElementParams {
  /**
   * The target HTML element
   */
  element: HTMLElement;
}

/**
 * A parameter builder interface describing a `from`/`to` range.
 */
export interface FromToParams {
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
 * A paramter builder type which uses {@link FromToParams} where `from` or `to`, or both
 * can be set as optional.
 *
 * @typeParam GKey - the keys to set as optional (either `from` or `to`).
 */
export type OptionalFromToParams<GKey extends keyof FromToParams> = MakeOptional<FromToParams, GKey>;

/**
 * A parameter builder interface containing the `position` property.
 */
export interface PositionParams {
  /**
   * Defines a generic position with coordinates
   */
  position: Position;
}

/**
 * A paramter builder interface containing the `attrs` property.
 */
export interface AttrsParams {
  /**
   * An object describing the attrs for a prosemirror mark / node
   */
  attrs: Attrs;
}

/**
 * A paramter builder interface containing the node `type` property.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface NodeTypeParams<GSchema extends EditorSchema = any> {
  /**
   * A prosemirror node type instance.
   */
  type: NodeType<GSchema>;
}

/**
 * A paramter builder interface containing the `types` property which takes a
 * single type or multiple types.
 *
 * @remarks
 *
 * This can be used to check whether a certain type matches any of these types.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface NodeTypesParams<GSchema extends EditorSchema = any> {
  /**
   * The prosemirror node types to use.
   */
  types: NodeType<GSchema> | Array<NodeType<GSchema>>;
}

/**
 * A paramter builder interface containing the mark `type` property.
 *
 * @typeParam GSchema - the underlying editor schema.
 */
export interface MarkTypeParams<GSchema extends EditorSchema = any> {
  /**
   * The prosemirror mark type instance.
   */
  type: MarkType<GSchema>;
}

export interface ProsemirrorNodeParams<GSchema extends EditorSchema = any> {
  /**
   * The prosemirror node
   */
  node: ProsemirrorNode<GSchema>;
}

export type NodeWithAttrs<GAttrs extends Attrs = Attrs> = ProsemirrorNode & { attrs: GAttrs };

export interface NodeWithAttrsParams<GAttrs extends Attrs = Attrs> {
  /**
   * A prosemirror node with a specific shape for `node.attrs`
   */
  node: NodeWithAttrs<GAttrs>;
}

export interface DocParams {
  /**
   * The parent doc node of the editor which contains all the other nodes.
   * This is also a ProsemirrorNode
   */
  doc: ProsemirrorNode;
}

export interface OptionalProsemirrorNodeParams {
  /**
   * The nullable prosemirror node which may or may not exist.
   */
  node: ProsemirrorNode | null | undefined;
}

export interface PosParams {
  /**
   * The position of the referenced prosemirror item.
   */
  pos: number;
}

export interface TransactionParams<GSchema extends EditorSchema = any> {
  /**
   * The prosemirror transaction
   */
  tr: Transaction<GSchema>;
}

export interface CallbackParams {
  /**
   * A simple callback to run.
   */
  callback(): void;
}

/**
 * Receives a transaction and returns an new transaction.
 *
 * Can be used to update the transaction and customise commands.
 */
export type TransactionTransformer<GSchema extends EditorSchema = any> = (
  tr: Transaction<GSchema>,
  state: EditorState<GSchema>,
) => Transaction<GSchema>;

/**
 * Perform transformations on the transaction before
 */
export interface TransformTransactionParams<GSchema extends EditorSchema = any> {
  /**
   * Transforms the transaction before any other actions are done to it.
   *
   * This is useful for updating the transaction value before a command does it's work and helps prevent multiple
   * dispatches.
   */
  startTransaction?: TransactionTransformer<GSchema>;
  /**
   * Transforms the transaction before after all other actions are performed.
   *
   * This is called immediately before the dispatch.
   */
  endTransaction?: TransactionTransformer<GSchema>;
}

export interface RangeParams<GKey extends keyof FromToParams = never> {
  /**
   * The from/to interface.
   */
  range: OptionalFromToParams<GKey>;
}

export interface ResolvedPosParams<GSchema extends EditorSchema = any> {
  /**
   * A prosemirror resolved pos with provides helpful context methods when working with
   * a position in the editor.
   */
  $pos: ResolvedPos<GSchema>;
}

export interface TextParams {
  /**
   * The text to insert or work with.
   */
  text: string;
}

export interface SelectionParams<
  GSchema extends EditorSchema = any,
  GSelection extends Selection<GSchema> = Selection<GSchema>
> {
  /**
   * The text editor selection
   */
  selection: GSelection;
}

export interface PredicateParams<GParams> {
  /**
   * The predicate function
   */
  predicate(params: GParams): boolean;
}

export interface RegExpParams {
  /**
   * The regular expression to test against.
   */
  regexp: RegExp;
}
