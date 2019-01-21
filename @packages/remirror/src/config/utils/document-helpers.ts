import { curry } from 'lodash';
import { Mark, MarkType, NodeType } from 'prosemirror-model';
import { EditorState, NodeSelection, Plugin, PluginKey } from 'prosemirror-state';
import { EditorSchema } from '../../types';

export const markActive = curry((type: MarkType, state: EditorState) => {
  const { from, $from, to, empty } = state.selection;
  return Boolean(
    empty
      ? type.isInSet(state.storedMarks || $from.marks())
      : state.doc.rangeHasMark(from, to, type),
  );
});

export const nodeActive = curry((type: NodeType, attrs = {}, state: EditorState) => {
  const { $from, to, node } = state.selection as NodeSelection;
  if (node) {
    return node.hasMarkup(type, attrs);
  }
  return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
});

export const canInsertNode = curry((type: NodeType, state: EditorState) => {
  const { $from } = state.selection;
  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d);
    if ($from.node(d).canReplaceWith(index, index, type)) {
      return true;
    }
  }
  return false;
});

export const getMarkAttrs = curry((type: MarkType, state: EditorState<EditorSchema>) => {
  const { from, to } = state.selection;
  let marks: Mark[] = [];

  state.doc.nodesBetween(from, to, node => {
    marks = [...marks, ...node.marks];
  });

  const mark = marks.find(markItem => markItem.type.name === type.name);

  if (mark) {
    return mark.attrs;
  }

  return {};
});

export const getPluginState = <T>(plugin: Plugin, state: EditorState): T => plugin.getState(state);
export const getPluginKeyState = <T>(pluginKey: PluginKey, state: EditorState): T =>
  pluginKey.getState(state);
