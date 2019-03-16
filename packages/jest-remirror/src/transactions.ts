import { EditorSchema } from '@remirror/core';
import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { coerce, offsetRefs, Refs, RefsNode } from './builder';

/**
 * Replace the given range, or the selection if no range is given, with a text node containing the given string
 */
export function insertText(view: EditorView, text: string, from: number) {
  text.split('').forEach((character, index) => {
    if (!view.someProp('handleTextInput', f => f(view, from + index, from + index, character))) {
      view.dispatch(view.state.tr.insertText(character, from + index, from + index));
    }
  });
}

type BuilderContent = (schema: EditorSchema) => RefsNode | RefsNode[];

const processText = (schema: EditorSchema, content: string[]) => coerce(content, schema);

const processNodeMark = (schema: EditorSchema, content: BuilderContent) => {
  const nodes = content(schema);
  const refs = ([] as RefsNode[]).concat(nodes).reduce((acc, node) => ({ ...acc, ...node.refs }), {});
  return { nodes, refs };
};

/**
 * Replace the current selection with the given content, which may be a fragment, node, or array of nodes.
 *
 * @returns refs from the inserted nodes, made relative to the document
 *   insertion position
 */
export function insert(view: EditorView, content: string[] | BuilderContent): Refs {
  const { state } = view;
  const { from, to } = state.selection;
  const { nodes, refs } = Array.isArray(content)
    ? processText(state.schema, content)
    : processNodeMark(state.schema, content);
  const tr = state.tr.replaceWith(from, to, nodes);
  view.dispatch(tr);
  return offsetRefs(refs, from);
}

export function setTextSelection(view: EditorView, anchor: number, head?: number) {
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, anchor, head));
  view.dispatch(tr);
}
