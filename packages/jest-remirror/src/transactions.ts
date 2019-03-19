import { EditorSchema } from '@remirror/core';
import { TextSelection } from 'prosemirror-state';
import { coerce, offsetRefs, Refs, RefsNode } from './builder';
import { Keyboard } from './keys';
import { TestEditorView } from './types';

interface InsertTextParams {
  /** The prosemirror testing editing view instance */
  view: TestEditorView;
  /** Text to insert */
  text: string;
  /** The start point of text insertion */
  start: number;
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
export function insertText({ view, text, start: from }: InsertTextParams) {
  const keys = Keyboard.create({
    target: view.dom,
    useFakeTimer: true,
    // onEventDispatch: event => {view.dispatchEvent(event)},
  }).start();

  text.split('').forEach((character, index) => {
    keys.char({ text: character, typing: true });
    if (!view.someProp('handleTextInput', f => f(view, from + index, from + index, character))) {
      view.dispatch(view.state.tr.insertText(character, from + index, from + index));
    }
  });

  keys.end();
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
export function insert(view: TestEditorView, content: string[] | BuilderContent): Refs {
  const { state } = view;
  const { from, to } = state.selection;
  const { nodes, refs } = Array.isArray(content)
    ? processText(state.schema, content)
    : processNodeMark(content);
  const tr = state.tr.replaceWith(from, to, nodes);
  view.dispatch(tr);
  return offsetRefs(refs, from);
}

export function setTextSelection(view: TestEditorView, anchor: number, head?: number) {
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, anchor, head));
  view.dispatch(tr);
}
