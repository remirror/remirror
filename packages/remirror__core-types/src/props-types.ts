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
} from '@remirror/pm';
import type { ProsemirrorAttributes } from '@remirror/types';

/**
 * A parameter builder interface containing the `view` property.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface EditorViewProps {
  /**
   * An instance of the Prosemirror editor `view`.
   */
  view: EditorView;
}

/**
 * A parameter builder interface containing the `schema` property.
 *
 * @typeParam Nodes - the names of the nodes within the editor schema.
 * @typeParam Marks - the names of the marks within the editor schema.
 */
export interface SchemaProps {
  /**
   * Each Remirror Editor has an automatically generated schema associated with
   * it. The schema is a ProseMirror primitive which describes the kind of nodes
   * that may occur in the document, and the way they are nested. For example,
   * it might say that the top-level node can contain one or more blocks, and
   * that paragraph nodes can contain any number of inline nodes, with any marks
   * applied to them.
   *
   * Read more about it [here](https://prosemirror.net/docs/guide/#schema).
   */
  schema: EditorSchema;
}

/**
 * A parameter builder interface containing the `state` property.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface EditorStateProps {
  /**
   * A snapshot of the prosemirror editor state.
   */
  state: EditorState;
}

export interface TrStateProps {
  /**
   * The shared types between a state and a transaction. Allows for commands to
   * operate on either a state object or a transaction object.
   */
  trState: EditorState | Transaction;
}

/**
 * A parameter builder interface describing a `from`/`to` range.
 */
export interface FromToProps {
  /**
   * The starting position in the document.
   */
  from: number;

  /**
   * The ending position in the document.
   */
  to: number;
}

/**
 * A parameter builder interface containing the `attrs` property.
 */
export interface AttributesProps {
  /**
   * An object describing the attrs for a prosemirror mark / node
   */
  attrs: ProsemirrorAttributes;
}

/**
 * A parameter builder interface containing the node `type` property.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface NodeTypeProps {
  /**
   * A prosemirror node type instance.
   */
  type: NodeType | string;
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
export interface NodeTypesProps {
  /**
   * The prosemirror node types to use.
   */
  types: NodeType | string | Array<NodeType | string>;
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
export interface MarkTypesProps {
  /**
   * The prosemirror node types to use.
   */
  types: MarkType | MarkType[];
}

/**
 * A parameter builder interface containing the mark `type` property.
 *
 * @typeParam Schema - the underlying editor schema.
 */
export interface MarkTypeProps {
  /**
   * The prosemirror mark type instance.
   */
  type: MarkType | string;
}

export interface ProsemirrorNodeProps {
  /**
   * The prosemirror node
   */
  node: ProsemirrorNode;
}

export type NodeWithAttributes<Attributes extends object = object> = ProsemirrorNode & {
  attrs: ProsemirrorAttributes<Attributes>;
};

export interface NodeWithAttributesProps<Attributes extends object = object> {
  /**
   * A prosemirror node with a specific shape for `node.attrs`
   */
  node: NodeWithAttributes<Attributes>;
}

export type MarkWithAttributes<Attributes extends object = object> = Mark & {
  attrs: ProsemirrorAttributes<Attributes>;
};

export interface MarkWithAttributesProps<Attributes extends object = object> {
  /**
   * A mark with a specific shape for `node.attrs`
   */
  mark: MarkWithAttributes<Attributes>;
}

export interface OptionalProsemirrorNodeProps {
  /**
   * The nullable prosemirror node which may or may not exist. Please note that
   * the `find` will fail if this does not exists.
   *
   * To prevent cryptic errors this should always be the `doc` node.
   */
  node: ProsemirrorNode | null | undefined;
}

export interface OptionalMarkProps {
  /**
   * The nullable prosemirror mark which may or may not exist.
   */
  mark: Mark | null | undefined;
}

export interface PosProps {
  /**
   * The position of the referenced prosemirror item.
   */
  pos: number;
}

export interface TransactionProps {
  /**
   * The prosemirror transaction
   */
  tr: Transaction;
}

/**
 * Receives a transaction and returns an new transaction.
 *
 * Can be used to update the transaction and customise commands.
 */
export type TransactionTransformer = (tr: Transaction, state: EditorState) => Transaction;

export interface RangeProps {
  /**
   * The from/to interface.
   */
  range: FromToProps;
}

export interface ResolvedPosProps {
  /**
   * A prosemirror resolved pos with provides helpful context methods when working with
   * a position in the editor.
   */
  $pos: ResolvedPos;
}

export interface TextProps {
  /**
   * The text to insert or work with.
   */
  text: string;
}

export interface SelectionProps {
  /**
   * The text editor selection
   */
  selection: Selection;
}

export interface PredicateProps<Type> {
  /**
   * The predicate function
   */
  predicate: (value: Type) => boolean;
}

export interface RegExpProps {
  /**
   * The regular expression to test against.
   */
  regexp: RegExp;
}
