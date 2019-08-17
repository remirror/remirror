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

export interface EditorViewParams<GSchema extends EditorSchema = any> {
  /**
   * An instance of the Prosemirror editor view.
   */
  view: EditorView<GSchema>;
}

export interface SchemaParams<GNodes extends string = string, GMarks extends string = string> {
  /**
   * Tbe Prosemirror schema being used for the current interface
   */
  schema: EditorSchema<GNodes, GMarks>;
}

export interface EditorStateParams<GSchema extends EditorSchema = any> {
  /**
   * An snapshot of the prosemirror editor state
   */
  state: EditorState<GSchema>;
}

export interface CompareStateParams<GSchema extends EditorSchema = any> {
  /**
   * The previous snapshot of the Prosemirror editor state.
   */
  oldState: EditorState<GSchema>;
  /**
   * The latest snapshot of the Prosemirror editor state.
   */
  newState: EditorState<GSchema>;
}

export interface ElementParams {
  /**
   * The target HTML element
   */
  element: HTMLElement;
}

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
 * FromToParams where from or to, or both can be set as optional
 */
export type OptionalFromToParams<GKey extends keyof FromToParams> = MakeOptional<FromToParams, GKey>;

export interface FixedCoordsParams {
  /**
   * Position or coordinates relative to the window.
   *
   * @remarks
   * Typically this is the result of calling the following:
   *
   * ```ts
   * view.coordsAtPos(pos);
   * ```
   */
  coords: Position;
}

export interface PositionParams {
  /**
   * Defines a generic position with coordinates
   */
  position: Position;
}

export interface AttrsParams {
  /**
   * An object describing the attrs for a prosemirror mark / node
   */
  attrs: Attrs;
}

export interface NodeTypeParams {
  /**
   * The type of node in question
   */
  type: NodeType;
}

/**
 * Accepts a single node type or multiple node types.
 */
export interface NodeTypesParams {
  /**
   * A type(s) of prosemirror node to use.
   */
  types: NodeType | NodeType[];
}

export interface MarkTypeParams {
  /**
   * The type of mark being used
   */
  type: MarkType;
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

export interface TransactionParams {
  /**
   * The prosemirror transaction
   */
  tr: Transaction;
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

export interface SelectionParams<GSelection extends Selection = Selection> {
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
