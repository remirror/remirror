import { NodeType } from 'prosemirror-model';
import { CommandFunction, FromToParams } from '../types';

/**
 * Replaces text with an optional appended string at the end
 *
 * @param range
 * @param type
 * @param attrs
 * @param appendText
 */
export const replaceText = (
  range: FromToParams | null,
  type: NodeType,
  attrs = {},
  appendText = '',
): CommandFunction => (state, dispatch) => {
  const { $from, $to } = state.selection;
  let tr = state.tr;
  const index = $from.index();
  const from = range ? range.from : $from.pos;
  const to = range ? range.to : $to.pos;

  if (!$from.parent.canReplaceWith(index, index, type)) {
    return false;
  }

  const replacement = [type.create(attrs)];

  /** Only append the text if when text is provided. */
  if (appendText) {
    replacement.push(state.schema.text(appendText));
  }

  tr = tr.replaceWith(from, to, replacement);

  if (dispatch) {
    dispatch(tr);
  }

  return true;
};
