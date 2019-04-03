import { Selection as PMSelection } from 'prosemirror-state';
import {
  AttrsParams,
  EditorState,
  EditorStateParams,
  EditorView,
  NodeType,
  NodeTypeParams,
  PMNodeParams,
  PosParams,
  ProsemirrorNode,
  Selection,
  Transaction,
} from '../types';
import { isNumber } from './base';
import { isSelection, isTextDOMNode } from './document';

/* "Borrowed" from prosemirror-utils in order to avoid requirement of `@prosemirror-tables`*/

/**
 * Checks if the type a given `node` equals to a given `nodeType`.
 *
 * @param type - the prosemirror node type(s)
 * @param node - the prosemirror node
 *
 * @public
 */
export const equalNodeType = (type: NodeType | NodeType[], node: ProsemirrorNode) => {
  return (Array.isArray(type) && type.includes(node.type)) || node.type === type;
};

/**
 * Creates a new transaction object from a given transaction
 *
 * @param tr - the prosemirror transaction
 *
 * @public
 */
export const cloneTransaction = (tr: Transaction): Transaction => {
  return Object.assign(Object.create(tr), tr).setTime(Date.now());
};

/**
 * Returns a `delete` transaction that removes a node at a given position with the given `node`.
 * `position` should point at the position immediately before the node.
 *
 * @param position - the prosemirror position
 *
 * @public
 */
export const removeNodeAtPos = (position: number) => (tr: Transaction) => {
  const node = tr.doc.nodeAt(position);
  return cloneTransaction(tr.delete(position, position + node!.nodeSize));
};

/**
 * Returns DOM reference of a node at a given `position`.
 *
 * @remarks
 * If the node type is of type `TEXT_NODE` it will return the reference of the parent node.
 *
 * @example
 * A simple use case
 *
 * ```ts
 * const ref = findDOMRefAtPos($from.pos, view);
 * ```
 *
 * @param position - the prosemirror position
 * @param view - the editor view
 *
 * @public
 */
export const findDOMRefAtPos = (position: number, view: EditorView): HTMLElement => {
  const dom = view.domAtPos(position);
  const node = dom.node.childNodes[dom.offset];

  if (isTextDOMNode(dom.node)) {
    return dom.node.parentNode as HTMLElement;
  }

  if (!node || isTextDOMNode(node)) {
    return dom.node as HTMLElement;
  }

  return node as HTMLElement;
};

/**
 *  Returns a new transaction that deletes previous node.
 *
 * @example
 * ```ts
 * dispatch(
 *    removeNodeBefore(state.tr)
 * );
 * ```
 *
 * @param tr
 *
 * @public
 */
export const removeNodeBefore = (tr: Transaction): Transaction => {
  const position = findPositionOfNodeBefore(tr.selection);
  if (isNumber(position)) {
    return removeNodeAtPos(position)(tr);
  }
  return tr;
};

interface FindParentNode extends PosParams, PMNodeParams {
  start: number;
}

/**
 * Iterates over parent nodes, returning the closest node and its start position that the `predicate` returns truthy for.
 * `start` points to the start position of the node, `pos` points directly before the node.
 *
 * @example
 * ```ts
 * const predicate = node => node.type === schema.nodes.blockquote;
 * const parent = findParentNode(predicate)(selection);
 * ```
 *
 * @param predicate - the predicate checker
 *
 * @public
 */
export const findParentNode = (predicate: (node: ProsemirrorNode) => boolean) => (
  selection: Selection,
): FindParentNode | undefined => {
  const { $from } = selection;
  for (let currentDepth = $from.depth; currentDepth > 0; currentDepth--) {
    const node = $from.node(currentDepth);
    if (predicate(node)) {
      return {
        pos: currentDepth > 0 ? $from.before(currentDepth) : 0,
        start: $from.start(currentDepth),
        node,
      };
    }
  }
  return;
};

/**
 *  Iterates over parent nodes, returning closest node of a given `nodeType`.
 * `start` points to the start position of the node, `pos` points directly before the node.
 *
 * @example
 * ```ts
 * const parent = findParentNodeOfType(schema.nodes.paragraph)(selection);
 * ```
 *
 * @param type - the node type(s)
 *
 * @public
 */
export const findParentNodeOfType = (type: NodeType | NodeType[]) => (
  selection: Selection,
): FindParentNode | undefined => {
  return findParentNode(node => equalNodeType(type, node))(selection);
};

/**
 * Returns position of the previous node.
 *
 * @example
 * ```ts
 * const pos = findPositionOfNodeBefore(tr.selection);
 * ```
 *
 * @param selection - the prosemirror selection
 *
 * @public
 */
export const findPositionOfNodeBefore = (selection: Selection): number | undefined => {
  const { nodeBefore } = selection.$from;
  const maybeSelection = PMSelection.findFrom(selection.$from, -1);
  if (maybeSelection && nodeBefore) {
    const parent = findParentNodeOfType(nodeBefore.type)(maybeSelection);
    if (parent) {
      return parent.pos;
    }
    return maybeSelection.$from.pos;
  }

  return;
};

/**
 * Checks whether the selection  or state is currently empty.
 *
 * @param value - the current selection or state
 *
 * @public
 */
export const selectionEmpty = (value: Selection | EditorState) =>
  isSelection(value) ? value.empty : value.selection.empty;

interface NodeActiveParams extends EditorStateParams, NodeTypeParams, Partial<AttrsParams> {}

/**
 * Checks whether the node type passed in is active within the region.
 * Used by extensions to implement the `#active` method.
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param params - the destructured node active parameters
 *
 * @public
 */
export const nodeActive = ({ state, type, attrs = {} }: NodeActiveParams) => {
  const predicate = (node: ProsemirrorNode) => node.type === type;
  const parent = findParentNode(predicate)(state.selection);

  if (!Object.keys(attrs).length || !parent) {
    return !!parent;
  }

  return parent.node.hasMarkup(type, attrs);
};
