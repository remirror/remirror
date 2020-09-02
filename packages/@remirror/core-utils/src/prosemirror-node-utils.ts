import { ErrorConstant } from '@remirror/core-constants';
import { bool, invariant, isFunction } from '@remirror/core-helpers';
import type {
  MarkTypeParameter,
  NodeTypeParameter,
  OptionalProsemirrorNodeParameter,
  PosParameter,
  PredicateParameter,
  ProsemirrorAttributes,
  ProsemirrorNodeParameter,
} from '@remirror/core-types';

import { isProsemirrorNode } from './core-utils';

interface DescendParameter {
  /**
   * Whether to descend into a node.
   *
   * @default true
   */
  descend: boolean;
}

type NodePredicateParameter = PredicateParameter<NodeWithPosition>;

/**
 * A node with it's start position.
 *
 * @public
 */
export interface NodeWithPosition extends ProsemirrorNodeParameter, PosParameter {}

/**
 * @deprecated - This will be removed soon.
 */
interface FlattenParameter extends OptionalProsemirrorNodeParameter, Partial<DescendParameter> {}

/**
 * Flattens descendants of a given `node`. In other words a deeply nested
 * prosemirror tree will be turned into a flat array of [[`NodeWithPosition`]].
 *
 * @remarks
 *
 * It doesn't descend into a node when descend argument is `false` (defaults to
 * `true`).
 *
 * ```ts
 * const children = flatten(node);
 * ```
 *
 * @deprecated - use [[`findChildren`]] instead.
 */
export function flattenNodeDescendants(parameter: FlattenParameter): NodeWithPosition[] {
  const { node, descend = true } = parameter;

  // Ensure that this is a ProsemirrorNode, if it isn't this will throw an
  // error.
  invariant(isProsemirrorNode(node), {
    code: ErrorConstant.INTERNAL,
    message: 'Invalid "node" parameter".',
  });

  // This is used to keep track of all the node positions.
  const result: NodeWithPosition[] = [];

  node.descendants((child, pos) => {
    result.push({ node: child, pos });

    if (!descend) {
      // This prevents ProseMirror from diving deeper into the descendant tree.
      return false;
    }

    return;
  });

  return result;
}

interface NodeActionParameter {
  /**
   * A method which is run whenever the provided predicate returns true.
   *
   * This avoids the need for multiple passes over the same data, first to
   * gather and then to process. When viable ,why not just get it done.
   */
  action?: (node: NodeWithPosition) => void;
}

interface BaseFindParameter
  extends OptionalProsemirrorNodeParameter,
    Partial<DescendParameter>,
    NodeActionParameter {}

interface FindChildrenParameter extends BaseFindParameter, NodePredicateParameter {}

/**
 * Iterates over descendants of a given `node`, returning child nodes predicate
 * returns truthy for.
 *
 * @remarks
 *
 * It doesn't descend into a node when descend argument is `false` (defaults to
 * `true`).
 *
 * ```ts
 * const textNodes = findChildren(node, child => child.isText, false);
 * ```
 */
export function findChildren(parameter: FindChildrenParameter): NodeWithPosition[] {
  const { node, predicate, descend = true, action } = parameter;

  // Ensure that the node provided is a `ProsemirrorNode`.
  invariant(isProsemirrorNode(node), {
    code: ErrorConstant.INTERNAL,
    message: 'Invalid "node" parameter passed to "findChildren".',
  });

  // Ensure that the predicate is a function.
  invariant(isFunction(predicate), {
    code: ErrorConstant.INTERNAL,
    message: 'Invalid "predicate" parameter passed to "findChildren".',
  });

  // This is used to keep track of all the node positions.
  const result: NodeWithPosition[] = [];

  // This return will be false when the descend is set to `false` and thus
  // prevent ProseMirror from diving any deeper into the descendant tree.
  const descendantReturnValue = descend ? undefined : descend;

  // Start descending into the provided node. This can be an expensive operation
  // if the document is very large or deeply nested.
  node.descendants((child, pos) => {
    const nodeWithPosition: NodeWithPosition = { node: child, pos };

    // True when this call matches the required condition - returns `true`.
    const isMatch = predicate(nodeWithPosition);

    if (!isMatch) {
      // Move onto the next node or descendant depending on the value of
      // `descend`.
      return descendantReturnValue;
    }

    // Store the result and run the provided action if it exists.
    result.push(nodeWithPosition);
    action?.(nodeWithPosition);

    return descendantReturnValue;
  });

  return result;
}

/**
 * A utility for creating methods that find a node by a specific condition.
 */
function findNodeByPredicate({ predicate }: NodePredicateParameter) {
  return (parameter: BaseFindParameter) => findChildren({ ...parameter, predicate });
}

/**
 * Returns text nodes of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to
 * `true`).
 *
 * ```ts
 * const textNodes = findTextNodes(node);
 * ```
 */
export const findTextNodes = findNodeByPredicate({ predicate: (child) => child.node.isText });

/**
 * Returns inline nodes of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to
 * `true`).
 *
 * ```ts
 * const inlineNodes = findInlineNodes(node);
 * ```
 */
export const findInlineNodes = findNodeByPredicate({ predicate: (child) => child.node.isInline });

/**
 * Returns block descendants of a given `node`.
 *
 * @remarks
 *
 * It doesn't descend into a node when descend argument is `false` (defaults to
 * `true`).
 *
 * ```ts
 * const blockNodes = findBlockNodes(node);
 * ```
 */
export const findBlockNodes = findNodeByPredicate({ predicate: (child) => child.node.isBlock });

interface FindChildrenByAttrParameter extends BaseFindParameter {
  /**
   * Runs a predicate check after receiving the attrs for the found node.
   */
  predicate: (attrs: ProsemirrorAttributes) => boolean;
}

/**
 * Iterates over descendants of a given `node`, returning child nodes predicate
 * returns truthy for.
 *
 * @remarks
 *
 * It doesn't descend into a node when descend argument is `false` (defaults to
 * `true`).
 *
 * ```ts
 * const mergedCells = findChildrenByAttr(table, attrs => attrs.colspan === 2);
 * ```
 */
export function findChildrenByAttribute(
  parameter: FindChildrenByAttrParameter,
): NodeWithPosition[] {
  const { predicate, ...rest } = parameter;
  return findChildren({ ...rest, predicate: (child) => predicate(child.node.attrs) });
}

interface FindChildrenByNodeParameter extends BaseFindParameter, NodeTypeParameter {}

/**
 * Iterates over descendants of a given `node`, returning child nodes of a given
 * nodeType.
 *
 * @remarks
 *
 * It doesn't descend into a node when descend argument is `false` (defaults to
 * `true`).
 *
 * ```ts
 * const cells = findChildrenByNode(table, schema.nodes.tableCell);
 * ```
 */
export function findChildrenByNode(parameter: FindChildrenByNodeParameter): NodeWithPosition[] {
  const { type, ...rest } = parameter;
  return findChildren({ ...rest, predicate: (child) => child.node.type === type });
}

interface FindChildrenByMarkParameter extends BaseFindParameter, MarkTypeParameter {}

/**
 * Iterates over descendants of a given `node`, returning child nodes that have
 * a mark of a given markType.
 *
 * @remarks
 *
 * It doesn't descend into a `node` when descend argument is `false` (defaults
 * to `true`).
 *
 * ```ts
 * const nodes = findChildrenByMark(state.doc, schema.marks.strong);
 * ```
 */
export function findChildrenByMark(paramter: FindChildrenByMarkParameter): NodeWithPosition[] {
  const { type, ...rest } = paramter;
  return findChildren({
    ...rest,
    predicate: (child) => bool(type.isInSet(child.node.marks)),
  });
}

interface ContainsParameter extends ProsemirrorNodeParameter, NodeTypeParameter {}

/**
 * Returns `true` if a given node contains nodes of a given `nodeType`.
 *
 * @remarks
 *
 * ```ts
 * if (containsNodesOfType({ node: panel, type: schema.nodes.listItem })) {
 *   log('contained')
 * }
 * ```
 */
export function containsNodesOfType(parameter: ContainsParameter): boolean {
  const { node, type } = parameter;
  return findChildrenByNode({ node, type }).length > 0;
}
