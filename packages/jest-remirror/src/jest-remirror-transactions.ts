import { EditorSchema, SchemaParams, TextParams } from '@remirror/core';
import { TestEditorViewParams } from 'jest-prosemirror';
import { Keyboard } from 'test-keyboard';
import { coerce, offsetTags } from './jest-remirror-builder';
import { TaggedProsemirrorNode, Tags } from './jest-remirror-types';

interface InsertTextParams<GSchema extends EditorSchema = any>
  extends TestEditorViewParams<GSchema>,
    TextParams {
  /**
   * The start point of text insertion
   */
  start: number;
}

/**
 * Insert text from the provided index. Each key is entered individually to better simulate
 * calls to handleTextInput.
 */
export const insertText = <GSchema extends EditorSchema = any>({
  view,
  text,
  start: from,
}: InsertTextParams<GSchema>) => {
  const keys = Keyboard.create({
    target: view.dom,
    useFakeTimer: true,
    // onEventDispatch: event => {view.dispatchEvent(event)},
  }).start();
  let pos = from;
  text.split('').forEach(character => {
    keys.char({ text: character, typing: true });

    if (!view.someProp('handleTextInput', f => f(view, pos, pos, character))) {
      view.dispatch(view.state.tr.insertText(character, pos, pos));
    }

    // Update the position based on the current state selection. This allows plugins and commands to make changes to the
    // size of the editor while typing and as long as there is a selection position this function won't fail.
    pos = view.state.selection.anchor;
  });

  keys.end();
};

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
export const replaceSelection = ({ view, content }: InsertParams): Tags => {
  const { state } = view;
  const { from, to } = state.selection;
  const { nodes, tags } = Array.isArray(content)
    ? processText({ schema: state.schema, content })
    : processNodeMark(content);
  const tr = state.tr.replaceWith(from, to, nodes);
  view.dispatch(tr);
  return offsetTags(tags, from);
};
