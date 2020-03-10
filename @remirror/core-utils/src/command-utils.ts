import { isFunction, isNumber } from '@remirror/core-helpers';
import {
  AnyFunction,
  Attrs,
  AttrsParams,
  EditorSchema,
  MarkType,
  MarkTypeParams,
  NodeType,
  NodeTypeParams,
  ProsemirrorCommandFunction,
  ProsemirrorNode,
  RangeParams,
  TransformTransactionParams,
} from '@remirror/core-types';
import { lift, setBlockType, wrapIn } from 'prosemirror-commands';
import { liftListItem, wrapInList } from 'prosemirror-schema-list';

import { getMarkRange, isMarkType, isNodeType } from './dom-utils';
import { findParentNode, isNodeActive, selectionEmpty } from './prosemirror-utils';

interface UpdateMarkParams extends Partial<RangeParams>, Partial<AttrsParams>, TransformTransactionParams {
  /**
   * The text to append.
   *
   * @defaultValue '''
   */
  appendText?: string;

  /**
   * The type of the
   */
  type: MarkType;
}
/**
 * Update the selection with the provided MarkType
 *
 * @param type - the type to update the mark to
 * @param attrs - attrs to use for the mark
 *
 * @public
 */
export const updateMark = ({
  type,
  attrs = Object.create(null),
  appendText,
  range,
}: UpdateMarkParams): ProsemirrorCommandFunction => (state, dispatch) => {
  const { selection } = state;
  const { tr } = state;
  const { from, to } = range ?? selection;

  tr.addMark(from, to, type.create(attrs));

  if (appendText) {
    tr.insertText(appendText);
  }

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};

/**
 * Toggle between wrapping an inactive node with the provided node type, and lifting it up into it's parent.
 *
 * @param type - the node type to toggle
 * @param attrs - the attrs to use for the node
 *
 * @public
 */
export const toggleWrap = (type: NodeType, attrs?: Attrs): ProsemirrorCommandFunction => (
  state,
  dispatch,
) => {
  const isActive = isNodeActive({ state, type });

  if (isActive) {
    return lift(state, dispatch);
  }

  return wrapIn(type, attrs)(state, dispatch);
};

/**
 * Toggles a list item.
 *
 * @remarks
 * When the provided list wrapper is inactive (e.g. ul) then wrap the list with this type.
 * When it is active then remove the selected line from the list.
 *
 * @param type - the list node type
 * @param itemType - the list item type (must be in the schema)
 *
 * @public
 */
export const toggleList = (type: NodeType, itemType: NodeType): ProsemirrorCommandFunction => (
  state,
  dispatch,
) => {
  const { schema, selection } = state;
  const { $from, $to } = selection;
  const range = $from.blockRange($to);

  if (!range) {
    return false;
  }

  function isList(node: ProsemirrorNode, schema: EditorSchema) {
    return node.type === schema.nodes.bulletList || node.type === schema.nodes.orderedList;
  }

  const parentList = findParentNode({
    predicate: node => isList(node, schema),
    selection,
  });

  if (range.depth >= 1 && parentList && range.depth - parentList.depth <= 1) {
    if (parentList.node.type === type) {
      return liftListItem(itemType)(state, dispatch);
    }

    if (isList(parentList.node, schema) && type.validContent(parentList.node.content)) {
      const { tr } = state;
      tr.setNodeMarkup(parentList.pos, type);

      if (dispatch) {
        dispatch(tr);
      }

      return true;
    }
  }

  return wrapInList(type)(state, dispatch);
};

interface ToggleBlockItemParams extends NodeTypeParams, Partial<AttrsParams> {
  /**
   * The type to toggle back to. Usually this is the paragraph node type.
   */
  toggleType: NodeType;
}

/**
 * Toggle a block between the provided type and toggleType.
 *
 * @param params - the destructured params
 *
 * @public
 */
export const toggleBlockItem = ({
  type,
  toggleType,
  attrs = Object.create(null),
}: ToggleBlockItemParams): ProsemirrorCommandFunction => (state, dispatch) => {
  const isActive = isNodeActive({ state, type, attrs });

  if (isActive) {
    return setBlockType(toggleType)(state, dispatch);
  }

  return setBlockType(type, attrs)(state, dispatch);
};

interface ReplaceTextParams extends Partial<RangeParams>, Partial<AttrsParams>, TransformTransactionParams {
  /**
   * The text to append.
   *
   * @defaultValue '''
   */
  appendText?: string;
  /**
   * Optional text content to include.
   */
  content?: string;

  /**
   * The content type to be inserted in place of the range / selection.
   */
  type?: NodeType | MarkType;
}

interface CallMethodParams<GFunction extends AnyFunction, GReturn extends ReturnType<GFunction>> {
  fn: GFunction | unknown;
  defaultReturn: GReturn;
}

/**
 * A utility for calling option functions that may not exist
 */
const callMethod = <
  GFunction extends AnyFunction,
  GReturn extends ReturnType<GFunction>,
  GParams extends Parameters<GFunction>
>(
  { fn, defaultReturn }: CallMethodParams<GFunction, GReturn>,
  args: GParams,
): GReturn => (isFunction(fn) ? fn(...args) : defaultReturn);

/**
 * Taken from https://stackoverflow.com/a/4900484
 *
 * Check that the browser is chrome. Supports passing a minimum version to check that it is a greater than or equal version.
 */
const isChrome = (minVersion = 0): boolean => {
  const parsedAgent = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

  return parsedAgent ? parseInt(parsedAgent[2], 10) >= minVersion : false;
};

/**
 * Replaces text with an optional appended string at the end
 *
 * @param params - the destructured params
 *
 * @public
 */
export const replaceText = ({
  range,
  type,
  attrs = Object.create(null),
  appendText = '',
  content = '',
  startTransaction,
  endTransaction,
}: ReplaceTextParams): ProsemirrorCommandFunction => (state, dispatch) => {
  const { schema, selection } = state;
  // const { $from, $to } = selection;
  const index = selection.$from.index();
  const { from, to } = range ?? selection;

  // Run the pre transaction hook
  const tr = callMethod({ fn: startTransaction, defaultReturn: state.tr }, [state.tr, state]);
  if (isNodeType(type)) {
    if (!selection.$from.parent.canReplaceWith(index, index, type)) {
      return false;
    }

    tr.replaceWith(from, to, type.create(attrs, content ? schema.text(content) : undefined));
  } else {
    if (!content) {
      throw new Error('`replaceText` cannot be called without content when using a mark type');
    }

    tr.replaceWith(from, to, schema.text(content, isMarkType(type) ? [type.create(attrs)] : undefined));
  }

  /** Only append the text if when text is provided. */
  if (appendText) {
    tr.insertText(appendText);
  }

  if (dispatch) {
    if (isChrome(60)) {
      // A workaround for a chrome bug
      // https://github.com/ProseMirror/prosemirror/issues/710#issuecomment-338047650
      document.getSelection()?.empty();
    }
    dispatch(callMethod({ fn: endTransaction, defaultReturn: tr }, [tr, state]));
  }

  return true;
};

interface RemoveMarkParams extends MarkTypeParams, Partial<RangeParams<'to'>>, TransformTransactionParams {
  /**
   * Whether to expand empty selections to the current mark range
   *
   * @defaultValue `false`
   */
  expand?: boolean;
}

/**
 * Removes a mark from the current selection or provided from to
 *
 * @param params - the destructured params
 *
 * @public
 */
export const removeMark = ({
  type,
  expand = false,
  range,
  endTransaction,
  startTransaction,
}: RemoveMarkParams): ProsemirrorCommandFunction => (state, dispatch) => {
  const { selection } = state;
  const tr = callMethod({ fn: startTransaction, defaultReturn: state.tr }, [state.tr, state]);
  let { from, to } = range ?? selection;

  if (expand) {
    ({ from, to } = range
      ? getMarkRange(state.doc.resolve(range.from), type) ||
        (isNumber(range.to) && getMarkRange(state.doc.resolve(range.to), type)) || { from, to }
      : selectionEmpty(state)
      ? getMarkRange(state.selection.$anchor, type) || { from, to }
      : { from, to });
  }

  tr.removeMark(from, isNumber(to) ? to : from, type);

  if (dispatch) {
    dispatch(callMethod({ fn: endTransaction, defaultReturn: tr }, [tr, state]));
  }

  return true;
};

/**
 * An empty (noop) command function.
 *
 * @remarks
 *
 * This is typically to represent the default _do nothing_ action.
 */
export const emptyCommandFunction: ProsemirrorCommandFunction = () => false;
