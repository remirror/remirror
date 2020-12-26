import type { Primitive } from 'type-fest';

import { ErrorConstant } from '@remirror/core-constants';
import { entries, invariant, isFunction, isString, keys } from '@remirror/core-helpers';
import type {
  AnyConstructor,
  MarkType,
  MarkTypeParameter,
  NodeTypeParameter,
  OptionalProsemirrorNodeParameter,
  PosParameter,
  PredicateParameter,
  ProsemirrorNode,
  ProsemirrorNodeParameter,
  Transaction,
} from '@remirror/core-types';
import type { NodeRange } from '@remirror/pm/model';
import type { Step } from '@remirror/pm/transform';

import { getChangedNodeRanges, isProsemirrorNode } from './core-utils';

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
 */
export interface NodeWithPosition extends ProsemirrorNodeParameter, PosParameter {}

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
 * const textNodes = findChildren({
 *   node: state.doc,
 *   predicate: child => child.isText,
 *   descend: false
 * });
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

  // Start descending into the provided node. This can be an expensive operation
  // if the document is very large or deeply nested.
  node.descendants((child, pos) => {
    const nodeWithPosition: NodeWithPosition = { node: child, pos };

    // True when this call matches the required condition - returns `true`.
    const isMatch = predicate(nodeWithPosition);

    if (!isMatch) {
      // Move onto the next node or descendant depending on the value of
      // `descend`.
      return descend;
    }

    // Store the result and run the provided action if it exists.
    result.push(nodeWithPosition);
    action?.(nodeWithPosition);

    return descend;
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
 * const textNodes = findTextNodes({ node });
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

type AttributePredicate = (parameter: { value: unknown; exists: boolean }) => boolean;

interface FindChildrenByAttrParameter extends BaseFindParameter {
  /**
   * This can either be any primitive value or a function that takes the `value`
   * as the first argument and whether the key exists within the attributes as
   * the second argument.
   */
  attrs: { [key: string]: Primitive | AttributePredicate };
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
 * The following will match any node with an `id` of any value (as long as the
 * attribute exists) and a `colspan` of `2`.
 *
 * ```ts
 * const mergedCells = findChildrenByAttribute({
 *   node: table,
 *   attrs: { colspan: 2, id: (_, exists) => exists }
 * });
 * ```
 */
export function findChildrenByAttribute(
  parameter: FindChildrenByAttrParameter,
): NodeWithPosition[] {
  const { attrs, ...rest } = parameter;

  /**
   * The predicate function which loops through the provided attributes check if
   * they are valid.
   */
  function predicate(nodeWithPos: NodeWithPosition) {
    const attributeKeys = new Set(keys(nodeWithPos.node.attrs));

    for (const [attr, expectedValue] of entries(attrs)) {
      const value = nodeWithPos.node.attrs[attr];

      if (
        // The user has passed in a predicate checking function.
        isFunction(expectedValue)
      ) {
        const exists = attributeKeys.has(attr);

        if (
          // Check if the predicate checker returns false, in which case we can
          // exit early.
          !expectedValue({ value, exists })
        ) {
          return false;
        }

        continue;
      }

      if (
        // If the value doesn't match the expected value, exit early.
        value !== expectedValue
      ) {
        return false;
      }
    }

    return true;
  }

  return findChildren({ ...rest, predicate });
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
 * const cells = findChildrenByNode({ node: state.doc, type: state.schema.nodes.tableCell });
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
 * const nodes = findChildrenByMark({ node: state.doc, mark: schema.marks.strong });
 * ```
 */
export function findChildrenByMark(paramter: FindChildrenByMarkParameter): NodeWithPosition[] {
  const { type, ...rest } = paramter;
  let markType: MarkType | undefined;

  return findChildren({
    ...rest,
    predicate: (child) => {
      if (!markType) {
        markType = isString(type) ? child.node.type.schema.marks[type] : type;

        invariant(markType, {
          code: ErrorConstant.SCHEMA,
          message: `Mark type: ${type} does not exist on the current schema.`,
        });
      }

      return !!markType.isInSet(child.node.marks);
    },
  });
}

interface ContainsParameter extends ProsemirrorNodeParameter, NodeTypeParameter {}

/**
 * Returns `true` if a given node contains nodes of a given `nodeType`.
 *
 * @remarks
 *
 * ```ts
 * if (containsNodesOfType({ node: state.doc, type: schema.nodes.listItem })) {
 *   log('contained')
 * }
 * ```
 */
export function containsNodesOfType(parameter: ContainsParameter): boolean {
  const { node, type } = parameter;
  return findChildrenByNode({ node, type }).length > 0;
}

interface GetChangedNodesOptions {
  /**
   * Whether to descend into child nodes.
   *
   * @default false
   */
  descend?: boolean;

  /**
   * A predicate test for node which was found. Return `false` to skip the node.
   *
   * @param node - the node that was found
   * @param pos - the pos of that node
   * @param range - the `NodeRange` which contained this node.
   */
  predicate?: (node: ProsemirrorNode, pos: number, range: NodeRange) => boolean;

  /**
   * The valid step types to check for. Set to an empty array to accept all
   * types.
   *
   * @default [ReplaceStep]
   */
  StepTypes?: Array<AnyConstructor<Step>>;
}

/**
 * Get all the changed nodes from the provided transaction.
 *
 * The following example will give us all the text nodes in the provided
 * transaction.
 *
 * ```ts
 * import { getChangedNodes } from 'remirror/core';
 *
 * const changedTextNodes = getChangeNodes(tr, { descend: true, predicate: (node) => node.isText });
 * ```
 */
export function getChangedNodes(
  tr: Transaction,
  options: GetChangedNodesOptions = {},
): NodeWithPosition[] {
  const { descend = false, predicate, StepTypes } = options;
  const nodeRange = getChangedNodeRanges(tr, StepTypes);

  // The container for the nodes which have been added..
  const nodes: NodeWithPosition[] = [];

  for (const range of nodeRange) {
    const { start, end } = range;

    // Find all the nodes between the provided node range.
    tr.doc.nodesBetween(start, end, (node, pos) => {
      // Check wether this is a node that should be added.
      const shouldAdd = predicate?.(node, pos, range) ?? true;

      if (shouldAdd) {
        nodes.push({ node, pos });
      }

      return descend;
    });
  }

  return nodes;
}
