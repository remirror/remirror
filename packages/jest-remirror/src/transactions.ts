import { findElementAtPosition, PosParams, SchemaParams, TextParams } from '@remirror/core';
import { fireEvent } from '@testing-library/react/pure';
import { flush } from 'jest-prosemirror';
import { AllSelection, NodeSelection, TextSelection } from 'prosemirror-state';
import { coerce, offsetTags } from './builder';
import { createEvents } from './events';
import { FireParams, TaggedProsemirrorNode, Tags, TestEditorViewParams } from './jest-remirror-types';
import { Keyboard } from './keys';

interface InsertTextParams extends TestEditorViewParams, TextParams {
  /**
   * The start point of text insertion
   */
  start: number;
}

/**
 * Insert text from the provided index. Each key is entered individually to better simulate
 * calls to handleTextInput.
 */
export const insertText = ({ view, text, start: from }: InsertTextParams) => {
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

interface PressParams extends TestEditorViewParams {
  /**
   * The keyboard shortcut to run
   */
  char: string;
}

/**
 * Press a key.
 */
export const press = ({ view, char }: PressParams) => {
  Keyboard.create({
    target: view.dom,
    batch: true,
    useFakeTimer: true,
  })
    .start()
    .char({ text: char })
    .forEach(({ event }) => {
      view.dispatchEvent(event);
      flush(view);
    });
};

interface KeyboardShortcutParams extends TestEditorViewParams {
  /**
   * The keyboard shortcut to run
   */
  shortcut: string;
}

/**
 * Run a keyboard shortcut.
 */
export const shortcut = ({ view, shortcut: text }: KeyboardShortcutParams) => {
  Keyboard.create({
    target: view.dom,
    useFakeTimer: true,
    batch: true,
  })
    .start()
    .mod({ text })
    .forEach(({ event }) => {
      view.dispatchEvent(event);
      flush(view);
    });
};

interface FireEventAtPositionParams extends TestEditorViewParams, FireParams {}

/**
 * Fires an event at the provided position or the current selected position in the dom.
 */
export const fireEventAtPosition = ({
  view,
  event,
  options = {},
  position = view.state.selection.anchor,
}: FireEventAtPositionParams) => {
  const element = findElementAtPosition(position, view)!;
  const syntheticEvents = createEvents(event, options);

  syntheticEvents.forEach(syntheticEvent => fireEvent(element, syntheticEvent));

  if (
    event === ('tripleClick' as any) &&
    !view.someProp('handleTripleClick', f => f(view, position, syntheticEvents[2]))
  ) {
    syntheticEvents.forEach(syntheticEvent => view.dispatchEvent(syntheticEvent));
  }
  if (
    event === 'dblClick' &&
    !view.someProp('handleDoubleClick', f => f(view, position, syntheticEvents[0]))
  ) {
    syntheticEvents.forEach(syntheticEvent => view.dispatchEvent(syntheticEvent));
  }
  if (event === 'click' && !view.someProp('handleClick', f => f(view, position, syntheticEvents[0]))) {
    syntheticEvents.forEach(syntheticEvent => view.dispatchEvent(syntheticEvent));
  }

  flush(view);
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

/**
 * Select everything in the current doc.
 *
 * @param param
 * @param param.view
 * @param param.taggedDoc
 */
export const dispatchAllSelection = ({ view }: TestEditorViewParams) => {
  const { tr, doc } = view.state;
  view.dispatch(tr.setSelection(new AllSelection(doc)));
};

interface DispatchNodeSelectionParams extends TestEditorViewParams, PosParams {}

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
