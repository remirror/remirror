import { Mark, MarkType, NodeType, ResolvedPos } from 'prosemirror-model';
import { EditorState, NodeSelection, Plugin, PluginKey } from 'prosemirror-state';
import { Attrs } from './types';

/**
 * Checks that a mark is active within the selected region, or the current selection point is within a
 * region with the mark active. Used by extensions to implement their active methods.
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param state
 * @param type
 */
export const markActive = (state: EditorState, type: MarkType) => {
  const { from, $from, to, empty } = state.selection;
  return Boolean(
    empty ? type.isInSet(state.storedMarks || $from.marks()) : state.doc.rangeHasMark(from, to, type),
  );
};

/**
 * Checks whether the node type passed in is active within the region.
 * Used by extensions to implement the `#active` method.
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param state
 * @param type
 * @param attrs
 */
export const nodeActive = (state: EditorState, type: NodeType, attrs: Attrs = {}) => {
  const { $from, to, node } = state.selection as NodeSelection;
  if (node) {
    return node.hasMarkup(type, attrs);
  }
  return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
};

// "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
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

// "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
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

// "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
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

/**
 * Retrieve plugin state
 *
 * @param plugin
 * @param state
 */
export const getPluginState = <GState>(plugin: Plugin, state: EditorState): GState => plugin.getState(state);

/**
 * Retrieve plugin state from the plugin key
 *
 * @param pluginKey
 * @param state
 */
export const getPluginKeyState = <GState>(pluginKey: PluginKey, state: EditorState): GState =>
  pluginKey.getState(state);
