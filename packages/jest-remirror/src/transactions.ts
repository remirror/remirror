import { SchemaParams } from '@remirror/core';
import { AllSelection, NodeSelection, TextSelection } from 'prosemirror-state';
import { coerce, offsetTags } from './builder';
import { Keyboard } from './keys';
import { TaggedProsemirrorNode, Tags, TestEditorViewParams } from './types';

interface InsertTextParams extends TestEditorViewParams {
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

interface ProcessTextParams extends SchemaParams {
  /**
   * The content to process text in
   */
  content: string[] | TaggedProsemirrorNode[];
}

const processText = ({ schema, content }: ProcessTextParams) => coerce({ content, schema });

const processNodeMark = (content: TaggedProsemirrorNode) => {
  const nodes = content;
  const tags = ([] as TaggedProsemirrorNode[])
    .concat(content)
    .reduce((acc, node) => ({ ...acc, ...node.tags }), {});
  return { nodes, tags };
};

/**
 * Insert
 */
interface InsertParams extends TestEditorViewParams {
  /**
   * The content to replace the current selection with
   * This can be strings a node or an array of nodes.
   */
  content: string[] | TaggedProsemirrorNode | TaggedProsemirrorNode[];
}

/**
 * Replace the current selection with the given content, which may be
 * string, a fragment, node, or array of nodes.
 *
 * @param params
 * @param params.view
 * @param params.content
 */
export function replaceSelection({ view, content }: InsertParams): Tags {
  const { state } = view;
  const { from, to } = state.selection;
  const { nodes, tags } = Array.isArray(content)
    ? processText({ schema: state.schema, content })
    : processNodeMark(content);
  const tr = state.tr.replaceWith(from, to, nodes);
  view.dispatch(tr);
  return offsetTags(tags, from);
}

interface DispatchTextSelectionParams extends TestEditorViewParams {
  start: number;
  end?: number;
}

/**
 * Dispatch a text selection from start to [end]
 *
 * @param param
 * @param param.view
 * @param param.start
 * @param [param.end]
 */
export const dispatchTextSelection = ({ view, start, end }: DispatchTextSelectionParams) => {
  const { state } = view;
  const tr = state.tr.setSelection(TextSelection.create(state.doc, start, end));
  view.dispatch(tr);
};

interface DispatchAllSelectionParams extends TestEditorViewParams {
  taggedDoc: TaggedProsemirrorNode;
}

/**
 * Select everything in the current doc.
 *
 * @param param
 * @param param.view
 * @param param.taggedDoc
 */
export const dispatchAllSelection = ({ view, taggedDoc }: DispatchAllSelectionParams) => {
  view.dispatch(view.state.tr.setSelection(new AllSelection(taggedDoc)));
};

interface DispatchNodeSelectionParams extends TestEditorViewParams {
  /**
   * The position of the cursor within the node which will be selected
   */
  pos: number;
}

/**
 * Dispatch a text selection from start to end
 *
 * @param param
 * @param param.view
 * @param param.pos
 */
export const dispatchNodeSelection = ({ view, pos }: DispatchNodeSelectionParams) => {
  const { state } = view;
  const tr = state.tr.setSelection(NodeSelection.create(state.doc, pos));
  view.dispatch(tr);
};
