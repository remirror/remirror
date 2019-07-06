/**
 * Trying out a new thing with interface builders which provide
 * the basic interface elements that can be combined into a well documented
 * parameter interface.
 */

import { EditorView, Transaction } from './aliases';
import { Attrs, EditorSchema, EditorState, MarkType, NodeType, Position, ProsemirrorNode } from './base';

/**
 * @internal
 */
export interface EditorViewParams {
  /**
   * An instance of the Prosemirror editor view.
   */
  view: EditorView;
}

/**
 * @internal
 */
export interface SchemaParams {
  /**
   * Tbe Prosemirror schema being used for the current interface
   */
  schema: EditorSchema;
}

/**
 * @internal
 */
export interface EditorStateParams {
  /**
   * An snapshot of the prosemirror editor state
   */
  state: EditorState;
}

/**
 * @internal
 */
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

/**
 * @internal
 */
export interface ElementParams {
  /**
   * The target HTML element
   */
  element: HTMLElement;
}

/**
 * @internal
 */
export interface FromToParams {
  /** The starting point */
  from: number;
  /** The ending point */
  to: number;
}

/**
 * @internal
 */
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

/**
 * @internal
 */
export interface PositionParams {
  /**
   * Defines a generic position with coordinates
   */
  position: Position;
}

/**
 * @internal
 */
export interface AttrsParams {
  /**
   * An object describing the attrs for a prosemirror mark / node
   */
  attrs: Attrs;
}

/**
 * @internal
 */
export interface NodeTypeParams {
  /**
   * The type of node in question
   */
  type: NodeType;
}

/**
 * @internal
 */
export interface MarkTypeParams {
  /**
   * The type of mark being used
   */
  type: MarkType;
}

/**
 * @internal
 */
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
