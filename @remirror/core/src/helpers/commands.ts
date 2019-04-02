import { lift, setBlockType, wrapIn } from 'prosemirror-commands';
import { MarkType, NodeType } from 'prosemirror-model';
import { liftListItem, wrapInList } from 'prosemirror-schema-list';
import { Attrs, AttrsParams, CommandFunction, FromToParams, NodeTypeParams } from '../types';
import { isNumber } from './base';
import { nodeActive } from './utils';
/**
 * Update the selection with the provided MarkType
 *
 * @param type
 * @param attrs
 */
export const updateMark = (type: MarkType, attrs: Attrs = {}): CommandFunction => (state, dispatch) => {
  const { from, to } = state.selection;
  if (dispatch) {
    dispatch(state.tr.addMark(from, to, type.create(attrs)));
  }
  return true;
};

/**
 * Toggle between wrapping an inactive node with the provided node type, and lifting it up into it's parent.
 *
 * @param type
 * @param attrs
 */
export const toggleWrap = (type: NodeType, attrs?: Attrs): CommandFunction => (state, dispatch) => {
  const isActive = nodeActive(state, type);

  if (isActive) {
    return lift(state, dispatch);
  }

  return wrapIn(type, attrs)(state, dispatch);
};

/**
 * Toggles a list item. When the provided list wrapper is inactive (e.g. ul) then wrap the list with this type.
 * When it is active then remove the selected line from the list.
 *
 * @param type
 * @param itemType
 *
 * @returns a command function
 */
export const toggleList = (type: NodeType, itemType: NodeType): CommandFunction => (state, dispatch) => {
  const isActive = nodeActive(state, type);

  if (isActive) {
    return liftListItem(itemType)(state, dispatch);
  }

  return wrapInList(type)(state, dispatch);
};

/**
 * Toggle a block between the provided type and toggleType.
 *
 * @param type
 * @param toggleType
 * @param attrs
 */
export const toggleBlockItem = (type: NodeType, toggleType: NodeType, attrs = {}): CommandFunction => (
  state,
  dispatch,
) => {
  const isActive = nodeActive(state, type, attrs);

  if (isActive) {
    return setBlockType(toggleType)(state, dispatch);
  }

  return setBlockType(type, attrs)(state, dispatch);
};

interface ReplaceTextParams extends Partial<FromToParams>, NodeTypeParams, Partial<AttrsParams> {
  /**
   * The text to append
   */
  appendText?: string;
  /**
   * Optional text content to include.
   */
  content?: string;
}

/**
 * Replaces text with an optional appended string at the end
 *
 * @param range
 * @param type
 * @param attrs
 * @param appendText
 */
export const replaceText = ({
  from,
  to,
  type,
  attrs = {},
  appendText = '',
  content = '',
}: ReplaceTextParams): CommandFunction => (state, dispatch) => {
  const { schema, selection } = state;
  let { tr } = state;
  const { $from, $to } = selection;
  const index = $from.index();
  const start = isNumber(from) ? from : $from.pos;
  const end = isNumber(to) ? to : $to.pos;

  if (!$from.parent.canReplaceWith(index, index, type)) {
    return false;
  }

  const replacement = [type.create(attrs, content ? schema.text(content) : undefined)];

  /** Only append the text if when text is provided. */
  if (appendText) {
    replacement.push(schema.text(appendText));
  }

  tr = tr.replaceWith(start, end, replacement);

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};

/**
 * Removes a mark from the current selection
 *
 * @param type
 */
export const removeMark = (type: MarkType): CommandFunction => (state, dispatch) => {
  const { from, to } = state.selection;
  if (dispatch) {
    dispatch(state.tr.removeMark(from, to, type));
  }

  return true;
};
