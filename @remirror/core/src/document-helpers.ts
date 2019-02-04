import { Mark, MarkType, NodeType, ResolvedPos } from 'prosemirror-model';
import { EditorState, NodeSelection, Plugin, PluginKey } from 'prosemirror-state';

// Copied from tiptap
export const markActive = (state: EditorState, type: MarkType) => {
  const { from, $from, to, empty } = state.selection;
  return Boolean(
    empty
      ? type.isInSet(state.storedMarks || $from.marks())
      : state.doc.rangeHasMark(from, to, type),
  );
};

// Copied from tiptap
export const nodeActive = (state: EditorState, type: NodeType, attrs = {}) => {
  const { $from, to, node } = state.selection as NodeSelection;
  if (node) {
    return node.hasMarkup(type, attrs);
  }
  return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
};

// Copied from tiptap
export const canInsertNode = (state: EditorState, type: NodeType) => {
  const { $from } = state.selection;
  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d);
    if ($from.node(d).canReplaceWith(index, index, type)) {
      return true;
    }
  }
  return false;
};

// Copied from tiptap
export const getMarkAttrs = (state: EditorState, type: MarkType) => {
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
};

// Copied from tiptap
export const getMarkRange = ($pos: ResolvedPos | null = null, type: MarkType | null = null) => {
  if (!$pos || !type) {
    return false;
  }

  const start = $pos.parent.childAfter($pos.parentOffset);

  if (!start.node) {
    return false;
  }

  const link = start.node.marks.find(mark => mark.type === type);
  if (!link) {
    return false;
  }

  let startIndex = $pos.index();
  let startPos = $pos.start() + start.offset;
  while (startIndex > 0 && link.isInSet($pos.parent.child(startIndex - 1).marks)) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }

  const endPos = startPos + start.node.nodeSize;

  return { from: startPos, to: endPos };
};

export const getPluginState = <GState>(plugin: Plugin, state: EditorState): GState =>
  plugin.getState(state);

export const getPluginKeyState = <GState>(pluginKey: PluginKey, state: EditorState): GState =>
  pluginKey.getState(state);
