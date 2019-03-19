import is from '@sindresorhus/is';
import { Selection as PMSelection } from 'prosemirror-state';
import { EditorView, NodeType, ProsemirrorNode, Selection, Transaction } from '../types';
import { isTextDOMNode } from './document';

/* "Borrowed" from prosemirror-utils in order to avoid requirement of `@prosemirror-tables`*/

/**
 * Checks if the type a given `node` equals to a given `nodeType`.
 *
 * @param type
 * @param node
 */
export const equalNodeType = (
  type: NodeType | NodeType[] | NodeType[] | NodeType[],
  node: ProsemirrorNode,
) => {
  return (Array.isArray(type) && type.indexOf(node.type) > -1) || node.type === type;
};

/**
 * Creates a new transaction object from a given transaction
 *
 * @param tr
 */
export const cloneTransaction = (tr: Transaction): Transaction => {
  return Object.assign(Object.create(tr), tr).setTime(Date.now());
};

/**
 * Returns a `delete` transaction that removes a node at a given position with the given `node`.
 * `position` should point at the position immediately before the node.
 *
 * @param position
 */
export const removeNodeAtPos = (position: number) => (tr: Transaction) => {
  const node = tr.doc.nodeAt(position);
  return cloneTransaction(tr.delete(position, position + node!.nodeSize));
};

/**
 *  Returns DOM reference of a node at a given `position`.
 * If the node type is of type `TEXT_NODE` it will return the reference of the parent node.
 *
 *  ```ts
 *  const ref = findDOMRefAtPos($from.pos, view);
 *  ```
 *
 * @param position
 * @param domAtPos
 */
export const findDOMRefAtPos = (position: number, view: EditorView) => {
  const dom = view.domAtPos(position);
  const node = dom.node.childNodes[dom.offset];

  if (isTextDOMNode(dom.node)) {
    return dom.node.parentNode;
  }

  if (!node || isTextDOMNode(node)) {
    return dom.node;
  }

  return node as HTMLElement;
};

/**
 *  Returns a new transaction that deletes previous node.
 *
 *  ```ts
 *  dispatch(
 *    removeNodeBefore(state.tr)
 *  );
 *  ```
 *
 * @param tr
 */
export const removeNodeBefore = (tr: Transaction): Transaction => {
  const position = findPositionOfNodeBefore(tr.selection);
  if (is.number(position)) {
    return removeNodeAtPos(position)(tr);
  }
  return tr;
};

interface FindParentNode {
  pos: number;
  start: number;
  node: ProsemirrorNode;
}

/**
 * Iterates over parent nodes, returning the closest node and its start position `predicate` returns truthy for. `start` points to the start position of the node, `pos` points directly before the node.
 *
 *  ```ts
 *  const predicate = node => node.type === schema.nodes.blockquote;
 *  const parent = findParentNode(predicate)(selection);
 *  ```
 *
 * @param predicate
 */
export const findParentNode = (predicate: (node: ProsemirrorNode) => boolean) => (
  selection: Selection,
): FindParentNode | undefined => {
  const { $from } = selection;
  for (let i = $from.depth; i > 0; i--) {
    const node = $from.node(i);
    if (predicate(node)) {
      return {
        pos: i > 0 ? $from.before(i) : 0,
        start: $from.start(i),
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
 * ```ts
 * const parent = findParentNodeOfType(schema.nodes.paragraph)(selection);
 * ```
 *
 * @param type
 */
export const findParentNodeOfType = (type: NodeType | NodeType[]) => (
  selection: Selection,
): FindParentNode | undefined => {
  return findParentNode(node => equalNodeType(type, node))(selection);
};

/**
 * Returns position of the previous node.
 *
 * ```ts
 * const pos = findPositionOfNodeBefore(tr.selection);
 * ```
 *
 * @param selection
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
 * Checks whether the selection is currently empty.
 *
 * @param selection
 */
export const selectionEmpty = (selection: Selection) => selection.empty;
