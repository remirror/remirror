import { NodeType } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';
import { EditorSchema, ProsemirrorNode, Transaction } from '../types';
import { isTextNode } from './document';

/* "Borrowed" from prosemirror-utils in order to avoid requirement of `@prosemirror-tables`*/

/**
 * Checks if the type a given `node` equals to a given `nodeType`.
 *
 * @params type
 * @params node
 */
export const equalNodeType = (type: NodeType<EditorSchema>, node: ProsemirrorNode) => {
  return (Array.isArray(type) && type.indexOf(node.type) > -1) || node.type === type;
};

/**
 * Creates a new transaction object from a given transaction
 *
 * @params tr
 */
export const cloneTr = (tr: Transaction) => {
  return Object.assign(Object.create(tr), tr).setTime(Date.now());
};

/**
 * Returns a `delete` transaction that removes a node at a given position with the given `node`.
 * `position` should point at the position immediately before the node.
 *
 * @params position
 */
export const removeNodeAtPos = (position: number) => (tr: Transaction) => {
  const node = tr.doc.nodeAt(position);
  return cloneTr(tr.delete(position, position + node!.nodeSize));
};

/**
 *  Returns DOM reference of a node at a given `position`.
 * If the node type is of type `TEXT_NODE` it will return the reference of the parent node.
 *
 *  ```ts
 *  const domAtPos = view.domAtPos.bind(view);
 *  const ref = findDomRefAtPos($from.pos, domAtPos);
 *  ```
 *
 * @params position
 * @params domAtPos
 */
export const findDomRefAtPos = (
  position: number,
  domAtPos: (pos: number) => { node: Node; offset: number },
) => {
  const dom = domAtPos(position);
  const node = dom.node.childNodes[dom.offset];

  if (isTextNode(dom.node)) {
    return dom.node.parentNode;
  }

  if (!node || isTextNode(node)) {
    return dom.node;
  }

  return node;
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
 * @params tr
 */
export const removeNodeBefore = (tr: Transaction): Transaction => {
  const position = findPositionOfNodeBefore(tr.selection);
  if (typeof position === 'number') {
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
 * @params predicate
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
 *  Iterates over parent nodes, returning closest node of a given `nodeType`. `start` points to the start position of the node, `pos` points directly before the node.
 *
 * ```ts
 * const parent = findParentNodeOfType(schema.nodes.paragraph)(selection);
 * ```
 *
 * @params type
 */
export const findParentNodeOfType = (type: NodeType<EditorSchema>) => (
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
 * @params selection
 */
export const findPositionOfNodeBefore = (selection: Selection<EditorSchema>): number | undefined => {
  const { nodeBefore } = selection.$from;
  const maybeSelection = Selection.findFrom(selection.$from, -1);
  if (maybeSelection && nodeBefore) {
    // leaf node
    const parent = findParentNodeOfType(nodeBefore.type)(maybeSelection);
    if (parent) {
      return parent.pos;
    }
    return maybeSelection.$from.pos;
  }

  return;
};
