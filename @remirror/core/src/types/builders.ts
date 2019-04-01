import { EditorView } from './aliases';
import { Attrs, EditorSchema, EditorState, MarkType, NodeType, Position } from './base';

/**
 * @module
 *
 * Trying out a new thing with interface builders which provide
 * the basic interface elements that can be combined into a well documented
 * paramter interface.
 */

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
   * Position or coordinates relative to the window. Typically this is the result of calling:
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
