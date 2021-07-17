import { ErrorConstant } from '@remirror/core-constants';
import { assertGet, invariant, isNumber, isString, object } from '@remirror/core-helpers';
import type {
  AttributesProps,
  CommandFunction,
  CommandFunctionProps,
  FromToProps,
  MarkType,
  MarkTypeProps,
  NodeType,
  NodeTypeProps,
  PrimitiveSelection,
  ProsemirrorAttributes,
  RangeProps,
  Selection,
  Transaction,
} from '@remirror/core-types';
import { TextSelection } from '@remirror/pm/state';
import { findWrapping, liftTarget } from '@remirror/pm/transform';

import {
  getDefaultBlockNode,
  getMarkRange,
  getTextSelection,
  isMarkType,
  isNodeType,
} from './core-utils';
import { getActiveNode } from './prosemirror-utils';

export interface UpdateMarkProps extends Partial<RangeProps>, Partial<AttributesProps> {
  /**
   * The text to append.
   *
   * @default '''
   */
  appendText?: string;

  /**
   * The type of the
   */
  type: MarkType;
}
/**
 * Update the selection with the provided MarkType.
 *
 * @param props - see [[`UpdateMarkProps`]] for options
 */
export function updateMark(props: UpdateMarkProps): CommandFunction {
  return ({ dispatch, tr }) => {
    const { type, attrs = object(), appendText, range } = props;
    const selection = range ? TextSelection.create(tr.doc, range.from, range.to) : tr.selection;
    const { $from, from, to } = selection;
    let applicable = $from.depth === 0 ? tr.doc.type.allowsMarkType(type) : false;

    tr.doc.nodesBetween(from, to, (node) => {
      if (applicable) {
        return false;
      }

      if (node.inlineContent && node.type.allowsMarkType(type)) {
        applicable = true;
        return;
      }

      return;
    });

    if (!applicable) {
      return false;
    }

    dispatch?.(
      tr.addMark(from, to, type.create(attrs)) && appendText ? tr.insertText(appendText) : tr,
    );

    return true;
  };
}

/**
 * Lift the selected block, or the closest ancestor block of the selection that
 * can be lifted, out of its parent node.
 *
 * Adapted from
 * https://github.com/ProseMirror/prosemirror-commands/blob/3126d5c625953ba590c5d3a0db7f1009f46f1571/src/commands.js#L212-L221
 */
export function lift({ tr, dispatch }: Pick<CommandFunctionProps, 'tr' | 'dispatch'>): boolean {
  const { $from, $to } = tr.selection;
  const range = $from.blockRange($to);
  const target = range && liftTarget(range);

  if (!isNumber(target) || !range) {
    return false;
  }

  dispatch?.(tr.lift(range, target).scrollIntoView());

  return true;
}

/**
 * Wrap the selection or the provided text in a node of the given type with the
 * given attributes.
 */
export function wrapIn(
  type: string | NodeType,
  attrs: ProsemirrorAttributes = {},
  selection?: PrimitiveSelection,
): CommandFunction {
  return function (props) {
    const { tr, dispatch, state } = props;
    const nodeType = isString(type) ? assertGet(state.schema.nodes, type) : type;
    const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
    const $from = tr.doc.resolve(from);
    const $to = tr.doc.resolve(to);

    const blockRange = $from.blockRange($to);
    const wrapping = blockRange && findWrapping(blockRange, nodeType, attrs);

    if (!wrapping || !blockRange) {
      return false;
    }

    dispatch?.(tr.wrap(blockRange, wrapping).scrollIntoView());
    return true;
  };
}

/**
 * Toggle between wrapping an inactive node with the provided node type, and
 * lifting it up into it's parent.
 *
 * @param nodeType - the node type to toggle
 * @param attrs - the attrs to use for the node
 */
export function toggleWrap(
  nodeType: string | NodeType,
  attrs: ProsemirrorAttributes = {},
  selection?: PrimitiveSelection,
): CommandFunction {
  return (props) => {
    const { tr, state } = props;
    const type = isString(nodeType) ? assertGet(state.schema.nodes, nodeType) : nodeType;
    const activeNode = getActiveNode({ state: tr, type, attrs });

    if (activeNode) {
      return lift(props);
    }

    return wrapIn(nodeType, attrs, selection)(props);
  };
}

/**
 * Returns a command that tries to set the selected textblocks to the
 * given node type with the given attributes.
 *
 * @param nodeType - the name of the node or the [[`NodeType`]].
 */
export function setBlockType(
  nodeType: string | NodeType,
  attrs?: ProsemirrorAttributes,
  selection?: PrimitiveSelection,
  preserveAttrs = true,
): CommandFunction {
  return function (props) {
    const { tr, dispatch, state } = props;
    const type = isString(nodeType) ? assertGet(state.schema.nodes, nodeType) : nodeType;
    const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);

    let applicable = false;
    let activeAttrs: ProsemirrorAttributes | undefined;

    tr.doc.nodesBetween(from, to, (node, pos) => {
      if (applicable) {
        // Exit early and don't descend.
        return false;
      }

      if (!node.isTextblock || node.hasMarkup(type, attrs)) {
        return;
      }

      if (node.type === type) {
        applicable = true;
        activeAttrs = node.attrs;

        return;
      }

      const $pos = tr.doc.resolve(pos);
      const index = $pos.index();

      applicable = $pos.parent.canReplaceWith(index, index + 1, type);

      if (applicable) {
        activeAttrs = $pos.parent.attrs;
      }

      return;
    });

    if (!applicable) {
      return false;
    }

    dispatch?.(
      tr
        .setBlockType(from, to, type, { ...(preserveAttrs ? activeAttrs : {}), ...attrs })
        .scrollIntoView(),
    );

    return true;
  };
}

export interface ToggleBlockItemProps extends NodeTypeProps, Partial<AttributesProps> {
  /**
   * The type to toggle back to. Usually this is the `paragraph` node type.
   *
   * @default 'paragraph'
   */
  toggleType?: NodeType | string;

  /**
   * Whether to preserve the attrs when toggling a block item. This means that
   * extra attributes that are shared between nodes will be maintained.
   *
   * @default true
   */
  preserveAttrs?: boolean;
}

/**
 * Toggle a block between the provided type and toggleType.
 *
 * @param toggleProps - see [[`ToggleBlockItemProps`]] for available options
 */
export function toggleBlockItem(toggleProps: ToggleBlockItemProps): CommandFunction {
  return (props) => {
    const { tr, state } = props;
    const { type, attrs, preserveAttrs = true } = toggleProps;
    const activeNode = getActiveNode({ state: tr, type, attrs });
    const toggleType = toggleProps.toggleType ?? getDefaultBlockNode(state.schema);

    if (activeNode) {
      return setBlockType(toggleType, {
        ...(preserveAttrs ? activeNode.node.attrs : {}),
        ...attrs,
      })(props);
    }

    const toggleNode = getActiveNode({ state: tr, type: toggleType, attrs });

    return setBlockType(type, { ...(preserveAttrs ? toggleNode?.node.attrs : {}), ...attrs })(
      props,
    );
  };
}

export interface ReplaceTextProps extends Partial<AttributesProps> {
  /**
   * The text to append.
   *
   * @default '''
   */
  appendText?: string;

  /**
   * Optional text content to include.
   */
  content?: string;

  /**
   * The content type to be inserted in place of the range / selection.
   */
  type?: NodeType | MarkType | string;

  /**
   * Whether to keep the original selection after the replacement.
   */
  keepSelection?: boolean;

  /**
   * @deprecated - use `selection` instead.
   */
  range?: FromToProps;

  /**
   * The selected part of the document to replace.
   */
  selection?: PrimitiveSelection;
}

/**
 * Taken from https://stackoverflow.com/a/4900484
 *
 * Check that the browser is chrome. Supports passing a minimum version to check
 * that it is a greater than or equal to this version.
 */
export function isChrome(minVersion = 0): boolean {
  const parsedAgent = navigator.userAgent.match(/Chrom(e|ium)\/(\d+)\./);

  return parsedAgent ? Number.parseInt(assertGet(parsedAgent, 2), 10) >= minVersion : false;
}

/**
 * Checks the selection for the current state and updates the active transaction
 * to a selection that is consistent with the initial selection.
 *
 * @param state - the editor state before any updates
 * @param tr - the transaction which has been updated and may have impacted the
 * selection.
 */
export function preserveSelection(selection: Selection, tr: Transaction): void {
  // Get the previous movable part of the cursor selection.
  let { head, empty, anchor } = selection;

  // Map this movable cursor selection through each of the steps that have happened in
  // the transaction.
  for (const step of tr.steps) {
    const map = step.getMap();
    head = map.map(head);
  }

  if (empty) {
    // Update the transaction with the new text selection.
    tr.setSelection(TextSelection.create(tr.doc, head));
  } else {
    tr.setSelection(TextSelection.create(tr.doc, anchor, head));
  }
}

/**
 * Replaces text with an optional appended string at the end.
 *
 * @param props - see [[`ReplaceTextProps`]]
 */
export function replaceText(props: ReplaceTextProps): CommandFunction {
  const { attrs = {}, appendText = '', content = '', keepSelection = false, range } = props;

  return ({ state, tr, dispatch }) => {
    const schema = state.schema;
    const selection = getTextSelection(props.selection ?? range ?? tr.selection, tr.doc);
    const index = selection.$from.index();
    const { from, to, $from } = selection;

    const type = isString(props.type)
      ? schema.nodes[props.type] ?? schema.marks[props.type]
      : props.type;

    invariant(isString(props.type) ? type : true, {
      code: ErrorConstant.SCHEMA,
      message: `Schema contains no marks or nodes with name ${type}`,
    });

    if (isNodeType(type)) {
      if (!$from.parent.canReplaceWith(index, index, type)) {
        return false;
      }

      tr.replaceWith(from, to, type.create(attrs, content ? schema.text(content) : undefined));
    } else {
      invariant(content, {
        message: '`replaceText` cannot be called without content when using a mark type',
      });

      tr.replaceWith(
        from,
        to,
        schema.text(content, isMarkType(type) ? [type.create(attrs)] : undefined),
      );
    }

    // Only append the text if text is provided (ignore the empty string).
    if (appendText) {
      tr.insertText(appendText);
    }

    if (keepSelection) {
      preserveSelection(state.selection, tr);
    }

    if (dispatch) {
      // A workaround for a chrome bug
      // https://github.com/ProseMirror/prosemirror/issues/710#issuecomment-338047650
      if (isChrome(60)) {
        document.getSelection()?.empty();
      }

      dispatch(tr);
    }

    return true;
  };
}

export interface RemoveMarkProps extends MarkTypeProps {
  /**
   * Whether to expand empty selections to the current mark range.
   *
   * @default true
   */
  expand?: boolean;

  /**
   * @deprecated use `selection` property instead.
   */
  range?: FromToProps;

  /**
   * The selection to apply to the command.
   */
  selection?: PrimitiveSelection;
}

/**
 * Removes a mark from the current selection or provided range.
 *
 * @param props - see [[`RemoveMarkProps`]] for options
 */
export function removeMark(props: RemoveMarkProps): CommandFunction {
  return ({ dispatch, tr, state }) => {
    const { type, expand = true, range } = props;
    const selection = getTextSelection(props.selection ?? range ?? tr.selection, tr.doc);
    const markType = isString(type) ? state.schema.marks[type] : type;
    let { from, to, $from, $to } = selection;

    invariant(markType, {
      code: ErrorConstant.SCHEMA,
      message: `Mark type: ${type} does not exist on the current schema.`,
    });

    const markRange = getMarkRange($from, markType, $to);

    if (expand && markRange) {
      ({ from, to } = markRange);
    }

    dispatch?.(tr.removeMark(from, isNumber(to) ? to : from, markType));

    return true;
  };
}
