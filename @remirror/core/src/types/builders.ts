/**
 * Trying out a new thing with interface builders which provide
 * the basic interface elements that can be combined into a well documented
 * parameter interface.
 */

import { EditorView, ResolvedPos, Selection, Transaction } from './aliases';
import { Attrs, EditorSchema, EditorState, MarkType, NodeType, Position, ProsemirrorNode } from './base';

export interface EditorViewParams {
  /**
   * An instance of the Prosemirror editor view.
   */
  view: EditorView;
}

export interface SchemaParams {
  /**
   * Tbe Prosemirror schema being used for the current interface
   */
  schema: EditorSchema;
}

export interface EditorStateParams {
  /**
   * An snapshot of the prosemirror editor state
   */
  state: EditorState;
}

export interface CompareStateParams {
  /**
   * The previous snapshot of the Prosemirror editor state.
   */
  prevState: EditorState;
  /**
   * The latest snapshot of the Prosemirror editor state.
   */
  newState: EditorState;
}

export interface ElementParams {
  /**
   * The target HTML element
   */
  element: HTMLElement;
}

export interface FromToParams {
  /** The starting point */
  from: number;
  /** The ending point */
  to: number;
}

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

export interface MarkTypeParams {
  /**
   * The type of mark being used
   */
  type: MarkType;
}

export interface PMNodeParams {
  /**
   * The prosemirror node
   */
  node: ProsemirrorNode;
}

export interface NullablePMNodeParams {
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
export type TransactionTransformer = (tr: Transaction, state: EditorState) => Transaction;

/**
 * Perform transformations on the transaction before
 */
export interface TransformTransactionParams {
  /**
   * Transforms the transaction before any other actions are done to it.
   *
   * This is useful for updating the transaction value before a command does it's work and helps prevent multiple
   * dispatches.
   */
  startTransaction?: TransactionTransformer;
  /**
   * Transforms the transaction before after all other actions are performed.
   *
   * This is called immediately before the dispatch.
   */
  endTransaction?: TransactionTransformer;
}

export interface RangeParams {
  /**
   * The from/to interface.
   */
  range: FromToParams;
}

export interface ResolvedPosParams {
  /**
   * A prosemirror resolved pos with provides helpful context methods when working with
   * a position in the editor.
   */
  $pos: ResolvedPos;
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
