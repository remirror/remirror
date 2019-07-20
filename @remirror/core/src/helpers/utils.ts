import { Selection as PMSelection } from 'prosemirror-state';
import {
  AttrsParams,
  EditorState,
  EditorStateParams,
  EditorView,
  NodeTypeParams,
  NodeTypesParams,
  PMNodeParams,
  PosParams,
  PredicateParams,
  ProsemirrorNode,
  Selection,
  SelectionParams,
  Transaction,
  TransactionParams,
} from '../types';
import { bool, isNumber } from './base';
import { isNodeSelection, isSelection, isTextDOMNode } from './document';

/* "Borrowed" from prosemirror-utils in order to avoid requirement of `@prosemirror-tables`*/

interface NodeEqualsTypeParams extends NodeTypesParams, PMNodeParams {}

/**
 * Checks if the type a given `node` equals to a given `nodeType`.
 *
 * @param type - the prosemirror node type(s)
 * @param node - the prosemirror node
 *
 * @public
 */
export const nodeEqualsType = ({ types, node }: NodeEqualsTypeParams) => {
  return (Array.isArray(types) && types.includes(node.type)) || node.type === types;
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

interface RemoveNodeAtPositionParams extends TransactionParams, PosParams {}
/**
 * Returns a `delete` transaction that removes a node at a given position with the given `node`.
 * `position` should point at the position immediately before the node.
 *
 * @param position - the prosemirror position
 *
 * @public
 */
export const removeNodeAtPosition = ({ pos, tr }: RemoveNodeAtPositionParams) => {
  const node = tr.doc.nodeAt(pos);

  if (!node) {
    return tr;
  }

  return cloneTransaction(tr.delete(pos, pos + node.nodeSize));
};

/**
 * Returns DOM reference of a node at a given `position`.
 *
 * @remarks
 *
 * If the node type is of type `TEXT_NODE` it will return the reference of the parent node.
 *
 * A simple use case
 *
 * ```ts
 * const element = findElementAtPosition($from.pos, view);
 * ```
 *
 * @param position - the prosemirror position
 * @param view - the editor view
 *
 * @public
 */
export const findElementAtPosition = (position: number, view: EditorView): HTMLElement => {
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
 * Returns a new transaction that deletes previous node.
 *
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
  const pos = findPositionOfNodeBefore(tr.selection);
  if (isNumber(pos)) {
    return removeNodeAtPosition({ pos, tr });
  }
  return tr;
};

interface FindSelectedNodeOfTypeParams extends NodeTypesParams, SelectionParams {}
export interface FindSelectedNodeOfType extends FindParentNode {
  /**
   * The depth of the returned node.
   */
  depth: number;
}

/**
 * Returns a node of a given `nodeType` if it is selected. `start` points to the start position of the node, `pos` points directly before the node.
 *
 * ```ts
 * const { extension, inlineExtension, bodiedExtension } = schema.nodes;
 *
 * const selectedNode = findSelectedNodeOfType({
 *   types: [extension, inlineExtension, bodiedExtension],
 *   selection,
 * });
 * ```
 */
export const findSelectedNodeOfType = ({
  types,
  selection,
}: FindSelectedNodeOfTypeParams): FindSelectedNodeOfType | undefined => {
  if (isNodeSelection(selection)) {
    const { node, $from } = selection;
    if (nodeEqualsType({ types, node })) {
      return { node, pos: $from.pos, depth: $from.depth, start: $from.start() };
    }
  }
  return undefined;
};

export interface FindParentNode extends PMNodeParams {
  /**
   * The start position of the node.
   */
  start: number;

  /**
   * Points to position directly before the node.
   */
  pos: number;
}

interface FindParentNodeParams extends SelectionParams, PredicateParams<ProsemirrorNode> {}

/**
 * Iterates over parent nodes, returning the closest node and its start position that the `predicate` returns truthy for.
 * `start` points to the start position of the node, `pos` points directly before the node.
 *
 * @example
 * ```ts
 * const predicate = node => node.type === schema.nodes.blockquote;
 * const parent = findParentNode(predicate)(selection);
 * ```
 */
export const findParentNode = ({
  predicate,
  selection,
}: FindParentNodeParams): FindParentNode | undefined => {
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

interface FindParentNodeOfTypeParams extends NodeTypesParams, SelectionParams {}

/**
 *  Iterates over parent nodes, returning closest node of a given `nodeType`.
 * `start` points to the start position of the node, `pos` points directly before the node.
 *
 * @example
 * ```ts
 * const parent = findParentNodeOfType(schema.nodes.paragraph)(selection);
 * ```
 */
export const findParentNodeOfType = ({
  types,
  selection,
}: FindParentNodeOfTypeParams): FindParentNode | undefined => {
  return findParentNode({ predicate: node => nodeEqualsType({ types, node }), selection });
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
 */
export const findPositionOfNodeBefore = (selection: Selection): number | undefined => {
  const { nodeBefore } = selection.$from;
  const maybeSelection = PMSelection.findFrom(selection.$from, -1);
  if (maybeSelection && nodeBefore) {
    const parent = findParentNodeOfType({ types: nodeBefore.type, selection: maybeSelection });
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
 */
export const selectionEmpty = (value: Selection | EditorState) =>
  isSelection(value) ? value.empty : value.selection.empty;

/**
 * Check to see if a transaction has changed either the document or the current selection.
 *
 * @param params - the TransactionChangeParams object
 */
export const transactionChanged = (tr: Transaction) => {
  return tr.docChanged || tr.selectionSet;
};

interface IsNodeActiveParams extends EditorStateParams, NodeTypeParams, Partial<AttrsParams> {}

/**
 * Checks whether the node type passed in is active within the region.
 * Used by extensions to implement the `#active` method.
 *
 * To ignore attrs just leave the attrs object empty or undefined.
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param params - the destructured node active parameters
 */
export const isNodeActive = ({ state, type, attrs = {} }: IsNodeActiveParams) => {
  const { selection } = state;
  const predicate = (node: ProsemirrorNode) => node.type === type;
  const parent =
    findSelectedNodeOfType({ selection, types: type }) || findParentNode({ predicate, selection });

  if (!Object.keys(attrs).length || !parent) {
    return bool(parent);
  }

  return parent.node.hasMarkup(type, attrs);
};
