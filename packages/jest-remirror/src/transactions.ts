import { EditorSchema } from '@remirror/core';
import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { coerce, offsetRefs, Refs, RefsNode } from './builder';

interface InsertTextParams {
  /** The prosemirror view instance */
  view: EditorView;
  /** Text to insert */
  text: string;
  /** The start point of text insertion */
  from: number;
}

/**
 * Insert text from the provided index. Each key is entered individually to better simulate
 * calls to handleTextInput.
 *
 * @param params
 * @param params.view
 * @param params.text
 * @param params.from
 */
export function insertText({ view, text, from }: InsertTextParams) {
  text.split('').forEach((character, index) => {
    if (!view.someProp('handleTextInput', f => f(view, from + index, from + index, character))) {
      view.dispatch(view.state.tr.insertText(character, from + index, from + index));
    }
  });
}

type BuilderContent = RefsNode | RefsNode[];

const processText = (schema: EditorSchema, content: string[] | RefsNode[]) => coerce(content, schema);

const processNodeMark = (content: RefsNode) => {
  const nodes = content;
  const refs = ([] as RefsNode[]).concat(content).reduce((acc, node) => ({ ...acc, ...node.refs }), {});
  return { nodes, refs };
};

/**
 * Replace the current selection with the given content, which may be a fragment, node, or array of nodes.
 *
 */
export function insert(view: EditorView, content: string[] | BuilderContent): Refs {
  const { state } = view;
  const { from, to } = state.selection;
  const { nodes, refs } = Array.isArray(content)
    ? processText(state.schema, content)
    : processNodeMark(content);
  const tr = state.tr.replaceWith(from, to, nodes);
  view.dispatch(tr);
  return offsetRefs(refs, from);
}

export function setTextSelection(view: EditorView, anchor: number, head?: number) {
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, anchor, head));
  view.dispatch(tr);
}

// TODO: Enable key handling
// const createKeyBoardEventFromChar = (view: EditorView, char: string) => {
//   view.dom.dispatchEvent(new KeyboardEvent('keydown', {...data}))
// }

// export function typeText(view: EditorView, text: string, from: number) {
//   text.split('').forEach((character, index) => {
//     if (!view.someProp('handleKeyDown', (method: (view: EditorView<S>, event: KeyboardEvent) => handleKeyDown )) { }
//   })
// }
