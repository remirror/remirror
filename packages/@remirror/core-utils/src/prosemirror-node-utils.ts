import { ErrorConstant } from '@remirror/core-constants';
import { bool, invariant, isFunction } from '@remirror/core-helpers';
import {
  MarkTypeParameter,
  NodeTypeParameter,
  OptionalProsemirrorNodeParameter,
  PosParameter,
  PredicateParameter,
  ProsemirrorAttributes,
  ProsemirrorNode,
  ProsemirrorNodeParameter,
} from '@remirror/core-types';

import { isProsemirrorNode } from './core-utils';

interface DescendParameter {
  /**
   * Whether to descend into a node.
   *
   * @defaultValue `true`
   */
  descend: boolean;
}

type NodePredicateParameter = PredicateParameter<ProsemirrorNode>;

/**
 * A node with it's start position.
 *
 * @public
 */
export interface NodeWithPosition extends ProsemirrorNodeParameter, PosParameter {}

interface FlattenParameter extends OptionalProsemirrorNodeParameter, Partial<DescendParameter> {}

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
export function flatten(parameter: FlattenParameter): NodeWithPosition[] {
  const { node, descend = true } = parameter;

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
}

interface FindChildrenParameter extends FlattenParameter, NodePredicateParameter {}

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
export function findChildren(parameter: FindChildrenParameter) {
  const { node, predicate, descend } = parameter;

  invariant(node, {
    code: ErrorConstant.INTERNAL,
    message: 'Invalid "node" parameter passed to "findChildren".',
  });
  invariant(isFunction(predicate), {
    code: ErrorConstant.INTERNAL,
    message: 'Invalid "predicate" parameter passed to "findChildren".',
  });

  return flatten({ node, descend }).filter((child) => predicate(child.node));
}

function findNodeByPredicate({ predicate }: NodePredicateParameter) {
  return (parameters: FlattenParameter) => findChildren({ ...parameters, predicate });
}

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

interface FindChildrenByAttrParameter extends FlattenParameter {
  /**
   * Runs a predicate check after receiving the attrs for the found node.
   */
  predicate: (attrs: ProsemirrorAttributes) => boolean;
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
export function findChildrenByAttribute(parameter: FindChildrenByAttrParameter) {
  const { node, predicate, descend } = parameter;
  return findChildren({ node, predicate: (child) => predicate(child.attrs), descend });
}

interface FindChildrenByNodeParameter extends FlattenParameter, NodeTypeParameter {}

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
export function findChildrenByNode(parameter: FindChildrenByNodeParameter) {
  const { node, type, descend } = parameter;
  return findChildren({ node, predicate: (child) => child.type === type, descend });
}

interface FindChildrenByMarkParameter extends FlattenParameter, MarkTypeParameter {}

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
export function findChildrenByMark(paramter: FindChildrenByMarkParameter) {
  const { node, type, descend } = paramter;
  return findChildren({ node, predicate: (child) => bool(type.isInSet(child.marks)), descend });
}

interface ContainsParameter extends ProsemirrorNodeParameter, NodeTypeParameter {}

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
export function contains(parameter: ContainsParameter) {
  const { node, type } = parameter;
  return findChildrenByNode({ node, type }).length > 0;
}
