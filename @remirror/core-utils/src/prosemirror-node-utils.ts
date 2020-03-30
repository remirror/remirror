import { bool, isFunction } from '@remirror/core-helpers';
import {
  Attributes,
  MarkTypeParameter,
  NodeTypeParameter,
  OptionalProsemirrorNodeParameter,
  PosParameter,
  PredicateParameter,
  ProsemirrorNode,
  ProsemirrorNodeParameter,
} from '@remirror/core-types';

import { isProsemirrorNode } from './dom-utils';

interface DescendParams {
  /**
   * Whether to descend into a node.
   *
   * @defaultValue `true`
   */
  descend: boolean;
}

type NodePredicateParams = PredicateParameter<ProsemirrorNode>;

/**
 * A node with it's start position.
 *
 * @public
 */
export interface NodeWithPosition extends ProsemirrorNodeParameter, PosParameter {}

interface FlattenParams extends OptionalProsemirrorNodeParameter, Partial<DescendParams> {}

/**
 * Flattens descendants of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const children = flatten(node);
 * ```
 */
export const flatten = ({ node, descend = true }: FlattenParams): NodeWithPosition[] => {
  if (!isProsemirrorNode(node)) {
    throw new Error('Invalid "node" parameter');
  }
  const result: NodeWithPosition[] = [];
  node.descendants((child, pos) => {
    result.push({ node: child, pos });
    if (!descend) {
      return false;
    }
    return;
  });
  return result;
};

interface FindChildrenParams extends FlattenParams, NodePredicateParams {}

/**
 * Iterates over descendants of a given `node`, returning child nodes predicate returns truthy for.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const textNodes = findChildren(node, child => child.isText, false);
 * ```
 */
export const findChildren = ({ node, predicate, descend }: FindChildrenParams) => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  } else if (!isFunction(predicate)) {
    throw new Error('Invalid "predicate" parameter');
  }
  return flatten({ node, descend }).filter((child) => predicate(child.node));
};

const findNodeByPredicate = ({ predicate }: NodePredicateParams) => (parameters: FlattenParams) =>
  findChildren({ ...parameters, predicate });

/**
 * Returns text nodes of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const textNodes = findTextNodes(node);
 * ```
 */
export const findTextNodes = findNodeByPredicate({ predicate: (child) => child.isText });

/**
 * Returns inline nodes of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const inlineNodes = findInlineNodes(node);
 * ```
 */
export const findInlineNodes = findNodeByPredicate({ predicate: (child) => child.isInline });

/**
 * Returns block descendants of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const blockNodes = findBlockNodes(node);
 * ```
 */
export const findBlockNodes = findNodeByPredicate({ predicate: (child) => child.isBlock });

interface FindChildrenByAttrParams extends FlattenParams {
  /**
   * Runs a predicate check after receiving the attrs for the found node.
   */
  predicate(attrs: Attributes): boolean;
}

/**
 * Iterates over descendants of a given `node`, returning child nodes predicate returns truthy for.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const mergedCells = findChildrenByAttr(table, attrs => attrs.colspan === 2);
 * ```
 */
export const findChildrenByAttribute = ({ node, predicate, descend }: FindChildrenByAttrParams) =>
  findChildren({ node, predicate: (child) => predicate(child.attrs), descend });

interface FindChildrenByNodeParams extends FlattenParams, NodeTypeParameter {}

/**
 * Iterates over descendants of a given `node`, returning child nodes of a given nodeType.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const cells = findChildrenByNode(table, schema.nodes.tableCell);
 * ```
 */
export const findChildrenByNode = ({ node, type, descend }: FindChildrenByNodeParams) =>
  findChildren({ node, predicate: (child) => child.type === type, descend });

interface FindChildrenByMarkParams extends FlattenParams, MarkTypeParameter {}

/**
 * Iterates over descendants of a given `node`, returning child nodes that have a mark of a given markType.
 *
 * @remarks
 * It doesn't descend into a `node` when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const nodes = findChildrenByMark(state.doc, schema.marks.strong);
 * ```
 */
export const findChildrenByMark = ({ node, type, descend }: FindChildrenByMarkParams) =>
  findChildren({ node, predicate: (child) => bool(type.isInSet(child.marks)), descend });

interface ContainsParams extends ProsemirrorNodeParameter, NodeTypeParameter {}

/**
 * Returns `true` if a given node contains nodes of a given `nodeType`
 *
 * @remarks
 * ```ts
 * if (contains(panel, schema.nodes.listItem)) {
 *
 * }
 * ```
 */
export const contains = ({ node, type }: ContainsParams) =>
  findChildrenByNode({ node, type }).length > 0;
